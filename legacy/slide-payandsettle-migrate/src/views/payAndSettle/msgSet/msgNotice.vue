<template lang="pug">
g-layout(title="通知设置")
  template(#content-table)
    .detail-form
      .item-title 支付通知
      a-tabs(v-model:activeKey="activeKey")
        a-tab-pane.pt2(v-for="item,index in panelList" :key="item.key" :tab="item.tab")
          template(v-for="ele,idx in model[item.key]")
            satMsgConfigCheckBox(:model="ele" :ref="el=> setRef(el,index,idx)" @changeItem="(e) => ele.enabled = e.length ? true : false" :noticeMethod="ele.noticeMethod")
  template(#footer-page)
    a-button(type="primary" @click="submit" :loading="loading") 保存
</template>
<script lang="jsx">
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
      activeKey: "MERCHANT_RECHARGE_SUCCESS",
      panelList: [
        { key: "MERCHANT_RECHARGE_SUCCESS", tab: "充值成功" },
        { key: "MERCHANT_WITHDRAWAL_FINISH", tab: "提现完成" },
        { key: "MERCHANT_WITHDRAWAL_SUCCESS", tab: "提现成功" },
        { key: "MERCHANT_WITHDRAWAL_FAIL", tab: "提现失败" },
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
      state.activeKey = "MERCHANT_RECHARGE_SUCCESS";
      const result = await proxy.$api.batchSatMsgConfigList({
        codes:
          "MERCHANT_RECHARGE_SUCCESS,MERCHANT_WITHDRAWAL_SUCCESS,MERCHANT_WITHDRAWAL_FAIL,MERCHANT_WITHDRAWAL_FINISH",
      },"get");
      if (!result.length) {
        state.method = "post";
        for (let i of state.panelList) {
          let msgContent;
          if (i.key === "MERCHANT_RECHARGE_SUCCESS") {
            msgContent =
              await "尊敬的${supplierName}，您于${date}充值${money}元，当前余额为${balance}元!";
          } else if (i.key === "MERCHANT_WITHDRAWAL_SUCCESS") {
            msgContent =
              await "尊敬的${supplierName}，您已成功提现${money}元，预计2小时到账，请注意查收!";
          } else if (i.key === "MERCHANT_WITHDRAWAL_FAIL") {
            msgContent =
              await "尊敬的${supplierName}，您于${date}，提交的提现${money}元申请,审核未通过!";
          } else if (i.key === "MERCHANT_WITHDRAWAL_FINISH") {
            msgContent =
              await "尊敬的${supplierName}，您的提现申请已提交成功!系统正在处理,请耐心等待!";
          }
          state.model[i.key] = [
            {
              satMsgDefineCode: i.key, //消息编号--待审核/已通过/不通过
              effectiveDays: 30, //有效天数
              name: "通知市场用户", // 通知方选项名称
              notifyExpression: "USER:",
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
              name: "通知市场用户",
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
      const params = await _.flattenDepth(_.values(state.model));
      for (let i of params) {
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
        params: params,
      },state.method);
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
    .ant-tabs-bar {
      background: #fafafa;
    }

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
// :deep(.ant-tabs) {
//   height: 100%;
//   .ant-tabs-bar.ant-tabs-top-bar {
//     background: #fafafa;
//   }
// }
</style>
