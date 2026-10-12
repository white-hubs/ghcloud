<template lang="pug">
g-layout(title="通知设置")
  template(#content-table)
    .detail-form
      .item-title 理货数据审核
      a-tabs(v-model:activeKey="activeKey")
        a-tab-pane.pt2(v-for="item,index in panelList" :key="item.key" :tab="item.tab")
          template(v-for="ele,idx in model[item.key]")
            satMsgConfigCheckBox(:model="ele" :ref="el=> setRef(el,index,idx)" @changeItem="(e) => ele.enabled = e.length ? true : false" :noticeMethod="ele.noticeMethod")
  template(#footer-page)
    a-button(type="primary" @click="submit" :loading="loading") 保存
</template>
<script>
import {
  defineComponent,
  getCurrentInstance,
  reactive,
  toRefs,
  ref,
  onMounted,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import satMsgConfigCheckBox from "./satMsgConfigCheckBox.vue";
import _ from "lodash";
export default defineComponent({
  components: {
    satMsgConfigCheckBox,
  },
  setup() {
    const { proxy, ctx } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();

    const satMsgConfigCheckBox = ref();

    const state = reactive({
      model: {
        // id: "",
      },
      method: "",
      activeKey: "MEATTRADE_TALLY_ADOPT",
      panelList: [
        { key: "MEATTRADE_TALLY_ADOPT", tab: "理货审核-通过" },
        { key: "MEATTRADE_TALLY_FAIL_ADOPT", tab: "理货审核-不通过" },
      ],
      loading: false,
    });

    const form = ref();

    let itemForm = ref([]);
    // let itemForm = ref({});

    const setRef = (el, index, idx) => {
      if (index === 0) {
        itemForm.value[idx] = el;
      } else {
        const num = Math.pow(2, index);
        itemForm.value[num + idx] = el;
      }
    };

    const getData = async () => {
      state.activeKey = "MEATTRADE_TALLY_ADOPT";
      const result = await proxy.$api.batchSatMsgConfigList( {
        codes: "MEATTRADE_TALLY_ADOPT,MEATTRADE_TALLY_FAIL_ADOPT",
      },"get");
      if (!result.length) {
        state.method = "post";
        for (let i of state.panelList) {
          let msgContent;
          if (i.key === "MEATTRADE_TALLY_ADOPT") {
            msgContent =
              await "尊敬的${supplierName}，您报备批次号${reportCode}已理货审核通过，可进行开单交易!";
          } else {
            msgContent =
              await "尊敬的${supplierName}，您报备批次号${reportCode}理货审核失败，请到理货数据模块中查看原因!";
          }
          state.model[i.key] = [
            {
              satMsgDefineCode: i.key, //消息编号--待审核/已通过/不通过
              effectiveDays: 30, //有效天数
              name: "通知市场卖家", // 通知方选项名称
              notifyExpression: "MERCHANT:",
              enabled: false, //选中状态
              channelParams: [], //通知方式
              satMsgChannelConfigModifyParams: [], //通知方式
              msgTmpContent: msgContent, //模板内容
              noticeMethod: [
                {
                  value: "CHANNEL_SITE",
                  label: "商家小程序",
                  terminal: "asc-supplier-mp",
                },
                { value: "CHANNEL_SMS", label: "短信", terminal: "" },
              ],
            },
          ];
        }
      } else {
        state.method = "put";
        const data = _.groupBy(result, "satMsgDefineCode");
        for (let i in data) {
          for (let j of data[i]) {
            Object.assign(j, {
              name: "通知市场卖家",
              channelParams: j.satMsgChannelConfigVOS.map((item) => {
                return `${item.terminal}&${item.channelType}`;
              }),
              satMsgChannelConfigModifyParams: [],
              noticeMethod: [
                {
                  value: "CHANNEL_SITE",
                  label: "商家小程序",
                  terminal: "asc-supplier-mp",
                },
                { value: "CHANNEL_SMS", label: "短信", terminal: "" },
              ],
            });
          }
        }
        state.model = data;
      }
    };

    const submit = async () => {
      state.loading = true;
      const data = await _.flattenDepth(_.values(state.model));
      for (let i of data) {
        if (i.channelParams.length) {
          for (let j of i.channelParams) {
            if (j) {
              const res = _.zipObject(
                ["terminal", "channelType"],
                j.split("&")
              );
              i.satMsgChannelConfigModifyParams.push(res);
            }
          }
        }
      }
      await proxy.$api.satMsgConfig({
        params: data,
      },state.method );
      proxy.$message.success("操作成功");
      await getData();
      state.loading = false;
    };

    onMounted(() => {
      getData();
    });

    return {
      form,
      setRef,
      itemForm,
      satMsgConfigCheckBox,
      ...toRefs(state),
      submit,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
.detail-form {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  :deep(.ant-tabs-line) {
    height: calc(100% - 45px);
    .ant-tabs-top-content {
      height: calc(100% - 45px);
      .ant-tabs-tabpane-active {
        height: 100%;
        overflow-y: auto;
      }
    }
  }
}
:deep(.ant-form) {
  width: 100%;
  text-align: left;
}
</style>
