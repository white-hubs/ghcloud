<template lang="pug">
g-layout(title="通知设置")
  template(#content-table)
    .detail-form
      .item-title 商家认证
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
      activeKey: "MERCHANT_STAY_AUDIT",
      panelList: [
        { key: "MERCHANT_STAY_AUDIT", tab: "商家认证-待审核" },
        { key: "MERCHANT_FAIL_ADOPT", tab: "商家认证-不通过" },
        { key: "MERCHANT_AUTH_ADOPT", tab: "商家认证-已认证" },
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
      state.activeKey = "MERCHANT_STAY_AUDIT";
      const result = await proxy.$api.batchSatMsgConfigList({
        codes: "MERCHANT_STAY_AUDIT,MERCHANT_FAIL_ADOPT,MERCHANT_AUTH_ADOPT",
      },"get");
      if (!result.length) {
        state.method = "post";
        for (let i of state.panelList) {
          let manageContent, supplierContent;
          if (i.key === "MERCHANT_STAY_AUDIT") {
            manageContent =
              await "收到${supplierName}的商家审核申请，请进行审核！";
            supplierContent =
              await "您已成功提交${supplierName}的商家认证申请，请等待管理员审核。";
          } else if (i.key === "MERCHANT_FAIL_ADOPT") {
            manageContent = await "${supplierName}已审核为不通过！";
            supplierContent =
              await "您提交的${supplierName}认证资料认证为不通过，请确认后再次提交认证！";
          } else if (i.key === "MERCHANT_AUTH_ADOPT") {
            manageContent = await "${supplierName}的认证审核已通过！";
            supplierContent =
              await "恭喜您，您提交的${supplierName}的认证资料已认证通过,可进行相应业务操作。";
          }
          state.model[i.key] = [
            {
              satMsgDefineCode: i.key, //消息编号--待审核/已通过/不通过
              effectiveDays: 30, //有效天数
              name: "通知市场管理方", // 通知方选项名称
              notifyExpression: "TENANT:",
              enabled: false, //选中状态
              channelParams: [], //通知方式
              satMsgChannelConfigModifyParams: [], //通知方式
              msgTmpContent: manageContent, //模板内容
              noticeMethod: [
                {
                  value: "CHANNEL_SITE",
                  label: "业务管理PC端(站内消息)",
                  terminal: "sat-market-web",
                },
                {
                  value: "CHANNEL_APP",
                  label: "业务管理APP端(站内消息)",
                  terminal: "sat-market-app",
                },
                { value: "CHANNEL_SMS", label: "短信", terminal: "" },
              ],
            },
            {
              satMsgDefineCode: i.key, //消息编号--待审核/已通过/不通过
              effectiveDays: 30, //有效天数
              name: "通知市场商家", // 通知方选项名称
              notifyExpression: "MERCHANT:",
              enabled: false, //选中状态
              channelParams: [], //通知方式
              satMsgChannelConfigModifyParams: [], //通知方式
              msgTmpContent: supplierContent, //模板内容
              noticeMethod: [
                {
                  value: "CHANNEL_SITE",
                  label: "商家小程序",
                  terminal: "asc-supplier-mp",
                },
                {
                  value: "CHANNEL_APP",
                  label: "业务管理APP端(站内消息)",
                  terminal: "sat-market-app",
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
            if (j.notifyExpression === "TENANT:") {
              Object.assign(j, {
                name: "通知市场管理方",
                channelParams: j.satMsgChannelConfigVOS.map((item) => {
                  return `${item.terminal}&${item.channelType}`;
                }),
                satMsgChannelConfigModifyParams: [],
                noticeMethod: [
                  {
                    value: "CHANNEL_SITE",
                    label: "业务管理PC端(站内消息)",
                    terminal: "sat-market-web",
                  },
                  {
                    value: "CHANNEL_APP",
                    label: "业务管理APP端(站内消息)",
                    terminal: "sat-market-app",
                  },
                  { value: "CHANNEL_SMS", label: "短信", terminal: "" },
                ],
              });
            } else if (j.notifyExpression === "MERCHANT:") {
              Object.assign(j, {
                name: "通知市场商家",
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
                  {
                    value: "CHANNEL_APP",
                    label: "业务管理APP端(站内消息)",
                    terminal: "sat-market-app",
                  },
                  { value: "CHANNEL_SMS", label: "短信", terminal: "" },
                ],
              });
            }
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
