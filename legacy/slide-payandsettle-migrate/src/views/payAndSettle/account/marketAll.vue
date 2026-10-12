<template lang="pug">
div(style="height:100%")
  g-table(
    title="资金总账"
    :api="api"
    :btns="btns"
    :search="search"
    :columns="columns"
  )
    template(#content-data)
      div.statistics 
            div 
              div.statisticsName 微信收款（线上）
              div.statisticsItem ￥{{statistics.weChatOnlineAmount}}
            div 
              div.statisticsName 微信收款（线下）
              div.statisticsItem ￥{{statistics.weChatOfflineAmount}}
            div 
              div.statisticsName 现金收款
              div.statisticsItem ￥{{statistics.cashAmount}}
            div 
              div.statisticsName POS机收款
              div.statisticsItem ￥{{statistics.posAmount}}              
            div 
              div.statisticsName 余额收款
              div.statisticsItem ￥{{statistics.walletAmount}}              
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  createVNode,
  ref,
  onMounted,
} from "vue";
import { useRouter } from "vue-router";
import { CaretDownOutlined } from "@ant-design/icons-vue";
import { timeFormat, millennial, tableColumns } from "@/utils/common";
import Title from "ant-design-vue/lib/typography/Title";
import {getToken, getNowEnterprise } from '@/utils/auth'
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const dateFormat = "YYYY/MM/DD";
    const formRef = ref();
    const state = reactive({
      columns: [
        {
          dataIndex: "tradeKey",
          title: "流水单号",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "businessKey",
          title: "业务单号",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "businessTypeName",
          title: "业务类型",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "receivingAccount",
          title: "收款账户",
          slots: { customRender: "receivingAccount" },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : "--"}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "paymentAccount",
          title: "付款账户",
          slots: { customRender: "paymentAccount" },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : "--"}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "payTypeName",
          title: "付款方式",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "incomeFlagName",
          title: "收支方式",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "amount",
          title: "金额",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "payer",
          title: "付款人",
          slots: { customRender: "payer" },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : "--"}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "payTime",
          title: "付款时间",
          slots: { customRender: "payTime" },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : "--"}
              >
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
      ],
      api: {
        list: "getRunningWaterListPage",
      },
      btns: [],
      search: [
        {
          label: "业务类型",
          value: "command",
          component: "g-select",
          url: "getDictBussinessCommand",
          placeholder: "请选择",
          field: { businessCommand: "value", commandName: "label" },
        },
        {
          label: "付款方式",
          value: "payTypeId",
          component: "g-select",
          url: "getDictPayChannel",
          placeholder: "请选择",
          field: { id: "value", payTypeName: "label" },
        },
        {
          label: "收支方式",
          value: "isIncome",
          component: "g-select",
          url: "getDictExpensesIncomeWay",
          defaultValue: -1,
          placeholder: "请选择",
          field: { value: "value", name: "label" },
        },
        {
          label: "付款时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        { label: "", value: "keyword", placeholder: "请输入关键字" },
      ],
      statistics: {
        cashAmount: 0,
        weChatAmount: 0,
        weChatOfflineAmount: 0,
        weChatOnlineAmount: 0,
        posAmount: 0,
        walletAmount: 0,
      },
      walletStatus: "ACTIVATED",
      modalVisible: false,
      modalTitle: "激活市场虚拟帐户",
      modalForm: {
        password: "",
        oldPassword: "",
        secondNewPassword: "",
      },
      rules: {
        oldPassword: [
          {
            required: true,
            message: "请输入旧密码",
          },
        ],
        password: [
          {
            required: true,
            message: "请输入新密码",
          },
          {
            validator(rule, value) {
              if (
                state.modalForm.password &&
                state.modalForm.secondNewPassword
              ) {
                formRef.value.validateFields("secondNewPassword");
                return Promise.resolve();
              } else {
                return Promise.resolve();
              }
            },
          },
        ],
        secondNewPassword: [
          {
            required: true,
            message: "请确认新密码",
          },
          {
            validator(rule, value) {
              if (state.modalForm.password) {
                if (
                  value !== state.modalForm.password &&
                  state.modalForm.secondNewPassword
                ) {
                  return Promise.reject("确认密码与新密码不相同");
                } else {
                  return Promise.resolve();
                }
              }
            },
          },
        ],
      },
    });
    const getAllData = (data) => {
      const tenant = JSON.parse(sessionStorage.getItem("GH-NowEnterprise"))?.code;
      proxy.$api.getRunningWaterReport(null,"get").then((res) => {
        state.statistics.weChatOnlineAmount = res.weChatOnlineAmount;
        state.statistics.weChatOfflineAmount = res.weChatOfflineAmount;
        state.statistics.cashAmount = res.cashAmount;
        state.statistics.posAmount = res.posAmount;
        state.statistics.walletAmount = res.walletAmount;
        // if (state.walletStatus !== "ACTIVATED") {
        //   state.modalVisible = true;
        // }
      });
    };
    //获取市场钱包
    const getWallet = () => {
      const tenant = JSON.parse(sessionStorage.getItem("GH-NowEnterprise"))?.code;
      proxy.$api.getWallet(tenant).then((res) => {
        state.walletStatus = res.status;
        if (res.status === "ACTIVATED") {
          getAllData();
        } else {
          state.modalVisible = true;
        }
      });
    };
    onMounted(() => {
      getAllData();
    });
    const toActivation = (title) => {
      state.modalForm = {
        password: "",
        oldPassword: "",
        secondNewPassword: "",
      };
      state.modalTitle = title;
      state.modalVisible = true;
    };
    const submitModal = () => {
      const tenant = getNowEnterprise().code;
      if (state.modalTitle === "激活市场虚拟帐户") {
        formRef.value.validate().then((res) => {
          proxy.$api
            .postWalletActivate({
              password: state.modalForm.password,
              tenant: tenant,
            },"post")
            .then((res) => {
              state.modalVisible = false;
              proxy.$message.success("操作成功");
              getWallet();
            });
        });
      } else {
        formRef.value.validate().then((res) => {
          proxy.$api
            .putWalletPassword({
              originalPassword: state.modalForm.oldPassword,
              updatedPassword: state.modalForm.password,
              tenant: tenant,
            },"put")
            .then((res) => {
              state.modalVisible = false;
              proxy.$message.success("操作成功");
            });
        });
      }
    };
    return {
      formRef,
      ...toRefs(state),
      toActivation,
      submitModal,
    };
  },
});
</script>
<style scoped lang="less">

.statistics {
  width: 100%;
  height: 130px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(5, 19%);
  grid-template-rows: repeat(1, 100%);
  grid-column-gap: 2%;
  align-items: center;
  .statisticsItem {
    font-size: 20px;
    padding-top: 10px;
  }
  > div:nth-child(1) {
    background-color: @statistics1;
  }
  > div:nth-child(2) {
    background-color: @statistics2;
  }
  > div:nth-child(3) {
    background-color: @statistics3;
  }
  > div:nth-child(4) {
    background-color: @statistics2;
  }
  > div:nth-child(5) {
    background-color: @statistics1;
  }
  > div {
    padding: 20px;
  }
}
</style>
