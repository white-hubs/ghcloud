<template lang="pug">
g-table(
  title="缴费单"
  editMode="page"
  :columns="columns"
  :search="search"
  :api="api"
  :btns="btns"
)
</template>
<script lang="jsx">
import { contractPaymentStatus } from "@/utils/enumerate";
import { defineComponent, reactive, toRefs } from "vue";
import { timeFormat } from "@/utils/common";
import { replaceObjectKeys } from "@pansy/utils";
export default defineComponent({
  setup() {
    const state = reactive({
      columns: [
        {
          dataIndex: "code",
          key: "code",
          title: "单据号",
          slots: {
            customRender: "code",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "merchantName",
          key: "merchantName",
          title: "商家名称",
          slots: {
            customRender: "merchantName",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "totalMoney",
          key: "totalMoney",
          title: "金额(元)",
          slots: {
            customRender: "totalMoney",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={Number(text).toFixed(2)}>
                {Number(text).toFixed(2)}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "payType",
          key: "payType",
          title: "支付方式",
          slots: {
            customRender: "payType",
          },
          customRender: ({ text }) => {
            if (text === "ACCOUNT_BALANCE") {
              return (
                <PopOver position="topLeft" content="账号余额支付">
                  账号余额支付
                </PopOver>
              );
            } else if (text === "ALI_PAY") {
              return (
                <PopOver position="topLeft" content="支付宝支付">
                  支付宝支付
                </PopOver>
              );
            } else {
              return "--";
            }
          },
        },
        {
          dataIndex: "payTime",
          key: "payTime",
          title: "支付时间",
          slots: {
            customRender: "payTime",
          },
          customRender: ({ text }) => {
            if (text) {
              return (
                <PopOver position="topLeft" content={timeFormat(text, true)}>
                  {timeFormat(text, true)}
                </PopOver>
              );
            } else {
              return "--";
            }
          },
        },
        {
          dataIndex: "createTime",
          key: "createTime",
          title: "创建时间",
          slots: {
            customRender: "createTime",
          },
          customRender: ({ text }) => {
            if (text) {
              return (
                <PopOver position="topLeft" content={timeFormat(text, true)}>
                  {timeFormat(text, true)}
                </PopOver>
              );
            } else {
              return "--";
            }
          },
        },
        {
          dataIndex: "status",
          key: "status",
          title: "状态",
          slots: {
            customRender: "status",
          },
          customRender: ({ text }) => {
            if (text === "BE_PAID") {
              return <g-table-dot content="待付" status="audit" />;
            } else if (text === "PAID") {
              return <g-table-dot content="已付" />;
            } else if (text === "ABOLISH") {
              return <g-table-dot content="作废" status="delete" />;
            } else {
              return <g-table-dot content="未知" status="audit" />;
            }
          },
        },
        {
          title: "操作",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          width: 200,
          fixed: "right",
        },
      ],
      search: [
        {
          label: "状态",
          value: "status",
          component: "a-select",
          defaultValue: " ",
          options: replaceObjectKeys(contractPaymentStatus, {
            name: "label",
            value: "value",
          }),
          placeholder: "请选择",
        },
        {
          label: "创建日期",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        { value: "keyword", placeholder: "单据号/商家名称" },
      ],
      api: {
        list: "getPaymentNotices",
        path: "/paymentDetail",
        pathParams: [{ value: "status" }],
      },
      btns: ["detail"],
    });

    return {
      ...toRefs(state),
    };
  },
});
</script>
<style scoped lang="less">
.buttonGroup {
  button {
    margin-left: 10px;
  }
}

</style>
