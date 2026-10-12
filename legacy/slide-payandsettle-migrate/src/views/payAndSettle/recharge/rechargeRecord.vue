<template lang="pug">
g-table(
  title="充值记录"
  :btns="[]"
  :columns="columns"
  :search="search"
  :api="api"
)
</template>
<script lang="jsx">
// import { cloneDeep } from "lodash-es";
// import { flattenTree } from "@/utils/common.js";
import { RechargeStatus } from "@/utils/enumerate.js";
import { timeFormat, millennial } from "@/utils/common";
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  createVNode,
  ref,
  onMounted,
} from "vue";

import { tableColumns } from "@/utils/common";

export default defineComponent({
  setup() {
    const state = reactive({
      columnList: [
        "id",
        "userName",
        "userPhone",
        "supplierName",
        "amount",
        "mode",
        "rechargeStatus",
        "createTime",
      ],
      columns: [
        {
          mark: "id",
          dataIndex: "id",
          key: "id",
          title: "充值单号",
          slots: {
            customRender: "id",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        }, {
          mark: "userName",
          dataIndex: "userName",
          key: "userName",
          title: "客户名称",
          slots: {
            customRender: "userName",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "userPhone",
          dataIndex: "userPhone",
          key: "userPhone",
          title: "客户电话",
          slots: {
            customRender: "userPhone",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "supplierName",
          dataIndex: "supplierName",
          key: "name",
          title: "商家名称",
          slots: {
            customRender: "supplierName",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        }, {
          mark: "amount",
          dataIndex: "amount",
          key: "amount",
          title: "充值金额",
          slots: {
            customRender: "amount",
          },

          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? `￥${millennial(text)}` : ""}
              >
                {text || text === 0 ? `￥${millennial(text)}` : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        }, {
          mark: "mode",
          dataIndex: "mode",
          key: "mode",
          title: "充值方式",
          slots: {
            customRender: "mode",
          },
          customRender: ({ text }) => {
            if (text === "CASH") {
              return (
                <PopOver position="topLeft" content="现金">
                  现金
                </PopOver>
              );
            } else if (text === "POS") {
              return (
                <PopOver position="topLeft" content="POS机刷卡">
                  POS机刷卡
                </PopOver>
              );
            } else if (text === "WEIXIN_PAY") {
              return (
                <PopOver position="topLeft" content="微信支付">
                  微信支付
                </PopOver>
              );
            } else {
              return "--";
            }
          },
          // width: 110,
          ellipsis: true,
        }, {
          mark: "rechargeStatus",
          dataIndex: "status",
          key: "status",
          title: "充值状态",
          slots: {
            customRender: "status",
          },
          customRender: ({ text }) => {
            if (text === "COMPLETED") {
              return <g-table-dot content="已完成" />;
            } else {
              return <g-table-dot content="充值中" status="audit" />;
            }
          },
          ellipsis: true,
        }, {
          mark: "createTime",
          dataIndex: "createTime",
          key: "createTime",
          title: "充值时间",
          slots: {
            customRender: "createTime",
          },

          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? `${timeFormat(text, true)}` : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        },
      ],
      api: {
        list: "getRechargeList",
      },
      search: [
        {
          label: "充值状态",
          value: "status",
          component: "a-select",
          defaultValue: " ",
          options: RechargeStatus,
          placeholder: "请选择",
        },
        {
          label: "充值时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        { label: "", value: "keyword", placeholder: "商家名称/充值单号" },
        {
          label: "",
          value: "tenant",
          component: "span",
          defaultValue: JSON.parse(sessionStorage.getItem("GH-NowEnterprise"))
            ?.code,
        },
      ],
    });

    onMounted(() => {
      // state.columns = tableColumns("recharge", state.columnList);
    });

    return {
      ...toRefs(state),
    };
  },
});
</script>
<style scoped lang="less"></style>
