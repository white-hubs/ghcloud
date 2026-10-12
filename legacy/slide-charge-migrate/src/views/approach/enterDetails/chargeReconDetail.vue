<template lang="pug">
g-table(
  :title="pageTitle"
  ref="tableRef"
  :api="api"
  :btns="btns"
  :search="search"
  :beforeGet="beforeGet"
  :columns="columns")
  template(#header-btns)
      a-button(type="primary" @click="goBack") 返回
  template(#statistic-data) 
    div.topGrid.mb2
      div.gridItem
        div
          div.itemTitle 实收金额
          div.itemValue {{form?.totalRealFee ? millennial(form?.totalRealFee,true) : '--'}}
      div.gridItem
        div
          div.itemTitle 应收金额
          div.itemValue {{form?.totalEnterFee ? millennial(form?.totalEnterFee,true) : '--'}}
      div.gridItem
        div
          div.itemTitle 免费金额
          div.itemValue {{form?.totalDiscountFee ? millennial(form?.totalDiscountFee,true) : '--'}}
</template>

<script lang='jsx'>
import {
  getCurrentInstance,
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  watch,
  ref,
} from "vue";
import _ from "lodash";
import { useRouter, useRoute } from "vue-router";
import { replaceObjectKeys } from "@pansy/utils";
import { millennial, timeFormat } from "@/utils/common";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();

    const startTime = Number(route.query.startTime);
    const endTime = Number(route.query.endTime);
    const pageTitle = route.query.title;
    const operatorAccount = route.query.operatorAccount;

    const tableRef = ref();
    const operator = JSON.parse(sessionStorage.getItem("GH-UserInfo"));
    const state = reactive({
      btns: [],
      api: {
        list: "enterStatisticsTable",
      },
      columns: [
        {
          dataIndex: "reportCode",
          title: "报备号",
          slots: {
            customRender: "reportCode",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "enterAreaName",
          title: "车道",
          slots: {
            customRender: "enterAreaName",
          },
          ellipsis: true,
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
          title: "商家名称",
          slots: {
            customRender: "merchantName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "reporterName",
          title: "报备人",
          slots: {
            customRender: "reporterName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "enterFee",
          title: "应收金额",
          slots: {
            customRender: "enterFee",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? `￥${millennial(text)}` : ""}
              >
                {text || text === 0 ? `￥${millennial(text)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "realFee",
          title: "实收金额",
          slots: {
            customRender: "realFee",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? `￥${millennial(text)}` : ""}
              >
                {text || text === 0 ? `￥${millennial(text)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "discountFee",
          title: "免费金额",
          slots: {
            customRender: "discountFee",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? `￥${millennial(text)}` : ""}
              >
                {text || text === 0 ? `￥${millennial(text)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "payType",
          title: "支付方式",
          slots: {
            customRender: "payType",
          },
          customRender: ({ text }) => {
            let content = "";
            switch (text) {
              case "CASH_PAY":
                content = "现金";
                break;
              case "WEIXIN_PAY":
                content = "微信";
                break;
              case "BALANCE_PAY":
                content = "余额";
                break;
              default:
                content = "--";
                break;
            }
            return (
              <PopOver position="topLeft" content={content ? content : ""}>
                {content ? content : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "operator",
          title: "业务操作员",
          slots: {
            customRender: "operator",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "enterTime",
          title: "进场时间",
          slots: {
            customRender: "enterTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
      ],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "报备号/商家名称",
        },
        {
          label: "",
          value: "payType",
          component: "span",
          defaultValue: "CASH_PAY",
        },
        {
          label: "",
          value: "operatorAccount",
          component: "span",
          defaultValue: operatorAccount,
        },
        {
          label: "",
          value: "period",
          component: "span",
          defaultValue: `${timeFormat(startTime, true)},${timeFormat(
            endTime,
            true
          )}`,
        },
        {
          label: "",
          value: "verifyStatus",
          component: "span",
          defaultValue: true,
        },
      ],
      form: {},
    });

    // top统计

    const getData = async (period, keyword, verifyStatus) => {
      proxy.$api
        .enterRecieveTop({
          operatorAccount: route.query.operatorAccount,
          period,
          keyword,
          verifyStatus,
        },"get")
        .then((res) => {
          state.form = typeof res === "object" ? res : {};
        });
    };

    const beforeGet = (params) => {
      const { period, keyword, verifyStatus } = params;
      getData(period, keyword, verifyStatus);
      return params;
    };
    /*返回*/
    const goBack = () => {
      history.back()
    };
    onMounted(() => {
      // getData();
    });

    return {
      tableRef,
      pageTitle,
      ...toRefs(state),
      millennial,
      timeFormat,
      beforeGet,
      goBack,
    };
  },
});
</script>

<style lang="less" scoped>
.topGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(1, 100px);
  grid-column-gap: 16px;
  .gridItem {
    display: flex;
    justify-content: center;
    align-items: center;
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

  .itemTitle {
    font-size: 14px;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.45);
  }
  .itemValue {
    font-size: 24px;
    font-weight: bold;
  }
}
:deep(.ant-image-img) {
  border-radius: 50%;
}
</style>
