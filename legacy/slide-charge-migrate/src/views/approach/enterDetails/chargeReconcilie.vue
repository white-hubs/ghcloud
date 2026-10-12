<template lang="pug">
g-table(
  title="收费对账"
  ref="tableRef"
  :api="api"
  :btns="btns"
  :scrollX="800"
  :search="search"
  :beforeGet="beforeGet"
  :columns="columns")
  template(v-slot:btn="{record}")  
    a-button(type="link" @click="detailPage(record)") 明细  
    a-button(type="link" @click="checkout(record)") 对账
  template(#statistic-data) 
    div.topGrid.mb2
      div.gridItem
        div
          div.itemTitle 待对账实收金额
          div.itemValue {{form?.totalRealFee ? millennial(form?.totalRealFee,true) : '--'}}
      div.gridItem
        div
          div.itemTitle 待对账应收金额
          div.itemValue {{form?.totalEnterFee ? millennial(form?.totalEnterFee,true) : '--'}}
      div.gridItem
        div
          div.itemTitle 待对账免费金额
          div.itemValue {{form?.totalDiscountFee ? millennial(form?.totalDiscountFee,true) : '--'}}
    a-modal(v-model:visible="visible" title="发起对账" centered :okText="'完成对账'" @ok="save" @cancel="cancel")
      a-form(ref="modalForm" :model="model" :rules="rules")
        a-form-item
          a-image(:src="operator?.fileVO?.path ? operator?.fileVO?.path : fallback" :height="50" :width="50")
          span.ml2 {{operator.username}}
        //- a-form-item(label="结算时间")
        a-form-item(label="对账时间")
          span {{ timeFormat(new Date(),true)}}
        a-form-item(label="应收金额")
          span {{model?.totalFee ? millennial(model?.totalFee,true) : '--'}}
        a-form-item(label="实收金额")
          span {{model?.totalRealFee ? millennial(model?.totalRealFee,true) : '--'}}
        a-form-item(label="免费金额")
          span {{model?.totalDiscountFee ? millennial(model?.totalDiscountFee,true) : '--'}}    
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
    const fallback = window.config.fallback;
    const state = reactive({
      btns: [],
      api: {
        list: "reconRecord",
      },
      columns: [
        {
          dataIndex: "verifyTime",
          title: "日期",
          slots: {
            customRender: "verifyTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, false) : ""}
              >
                {text ? timeFormat(text, false) : "--"}
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
          label: "时间",
          value: "date",
          defaultDate: "period",
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
          defaultValue: "WAIT_VERIFY",
        },
        // {
        //   label: "",
        //   value: "operatorAccount",
        //   component: "span",
        //   defaultValue: operator.username,
        // },
      ],
      form: {},
      model: null,
      visible: false,
    });
    const tableRef = ref();
    // top统计
    const getData = async (period, keyword) => {
      proxy.$api
        .reconRecordSta({
          // operatorAccount: operator.username,// 0402取消传递该参数
          verifyStatus: "WAIT_VERIFY",
          period: period ? period : "",
          operator: keyword ? keyword : "",
        },"get")
        .then((res) => {
          state.form = typeof res === "object" ? res : {};
        });
    };

    const checkout = (record) => {
      proxy.$api.reconRecordDetail(record.id,"get").then((res) => {
        state.model = typeof res === "object" ? res : null;
        state.visible = true;
      });
    };
    const detailPage = (record) => {
      history.pushState(
        { current: location.pathname + location.search }, '',
         `/portal/charge/enterChargeReconDetail?title=收费对账详情&id=${record?.id }&startTime=${record?.startTime}&endTime=${record?.endTime}&operatorAccount=${record?.operatorAccount}`
      )
    };

    const save = () => {
      proxy.$api
        .reconRecordStatus({
          id: state.model.id,
          status: "OVER_VERIFY",
        },"put")
        .then(() => {
          proxy.$message.success("操作成功");
          tableRef.value.getData();
          cancel();
        });
    };

    const cancel = () => {
      state.model = null;
      state.visible = false;
    };

    const beforeGet = (params) => {
      const { period, keyword } = params;
      getData(period, keyword);
      return params;
    };

    onMounted(function(){});

    return {
      tableRef,
      operator,
      fallback,
      ...toRefs(state),
      millennial,
      timeFormat,
      detailPage,
      beforeGet,
      checkout,
      cancel,
      save,
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
:deep(.ant-image-img) {
  border-radius: 50%;
}
</style>
