<template lang="pug">
g-table(
  title="对账记录"
  ref="tableRef"
  :api="api"
  :btns="btns"
  :scrollX="600"
  :search="search"
  :beforeGet="beforeGet"
  :columns="columns")
  template(v-slot:btn="{record}")  
    a-popconfirm(
      title="撤销当前对账信息？"
      @confirm.stop="changeStatus(record)"
    )
      a-button(type="link") 撤销  
  template(#statistic-data) 
    div.topGrid.mb2
      div.gridItem
        div
          div.itemTitle 对账实收金额
          div.itemValue {{form?.totalRealFee ? millennial(form?.totalRealFee,true) : '--'}}
      div.gridItem
        div
          div.itemTitle 对账应收金额
          div.itemValue {{form?.totalEnterFee ? millennial(form?.totalEnterFee,true) : '--'}}
      div.gridItem
        div
          div.itemTitle 对账免费金额
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
    const operator = JSON.parse(sessionStorage.getItem("GH-UserInfo"));
    const state = reactive({
      btns: [],
      api: {
        list: "reconRecord",
      },
      columns: [
        {
          dataIndex: "updateTime",
          title: "对账时间",
          slots: {
            customRender: "updateTime",
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
        {
          dataIndex: "operator",
          title: "对账人",
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
          dataIndex: "operator",
          title: "收费人",
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
          dataIndex: "totalFee",
          title: "应收金额",
          slots: {
            customRender: "totalFee",
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
          dataIndex: "totalRealFee",
          title: "实收金额",
          slots: {
            customRender: "totalRealFee",
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
          dataIndex: "totalDiscountFee",
          title: "免费金额",
          slots: {
            customRender: "totalDiscountFee",
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
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
          fixed: "right",
        },
      ],
      search: [
        {
          label: "对账时间",
          value: "date",
          defaultDate: "updateTime",
          component: "a-range-picker",
          placeholder: ["开始日期", "结束日期"],
        },
        {
          label: "",
          value: "keyword",
          placeholder: "收费人",
        },
        {
          label: "",
          value: "verifyStatus",
          component: "span",
          defaultValue: "OVER_VERIFY",
        },
        // {
        //   label: "",
        //   value: "operatorAccount",
        //   component: "span",
        //   defaultValue: operator.username,
        // },
      ],
      form: {},
    });

    const tableRef = ref();
    // top统计
    const getData = async (updateTime, keyword) => {
      proxy.$api
        .reconRecordSta({
          // operatorAccount: operator.username,
          verifyStatus: "OVER_VERIFY",
          updateTime,
          operator: keyword ? keyword : "",
        },"get")
        .then((res) => {
          state.form = typeof res === "object" ? res : {};
        });
    };

    const changeStatus = (record) => {
      proxy.$api
        .reconRecordStatus({
          id: record.id,
          status: "WAIT_VERIFY",
        },"put")
        .then(() => {
          proxy.$message.success("操作成功");
          tableRef.value.getData();
        });
    };

    const beforeGet = (params) => {
      const { updateTime, keyword } = params;
      getData(updateTime, keyword);
      return params;
    };

    onMounted(function(){});

    return {
      tableRef,
      ...toRefs(state),
      changeStatus,
      millennial,
      beforeGet,
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
    // font-weight: bold;
    color: rgba(0, 0, 0, 0.45);
  }
  .itemValue {
    font-size: 24px;
    font-weight: bold;
    color: #000;
  }
}
</style>
