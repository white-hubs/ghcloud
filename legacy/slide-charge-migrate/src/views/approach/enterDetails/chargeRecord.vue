<template lang="pug">
g-table(
  title="收费记录"
  ref="tableRef"
  :api="api"
  :btns="btns"
  :search="search"
  :beforeGet="beforeGet"
  :columns="columns")
  template(#header-btns)
    a-button(type="primary" @click="checkout") 结账
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
    a-modal(v-model:visible="visible" title="发起结账" centered :width="300" :okText="'结账'" @ok="save" @cancel="cancel")
      //- a-form(ref="modalForm" :model="model" :rules="rules")
      //-   a-form-item
      //-     a-image(:src="operator?.fileVO?.path ? operator?.fileVO?.path : fallback" :height="50" :width="50")
      //-     span.ml2 {{operator.username}}
        //- a-form-item(label="结算时间")
        //-   span {{model?.verifyTime ? timeFormat(model?.verifyTime,true) : '--'}}
        //- a-form-item(label="应收金额")
        //-   span {{model?.totalFee ? millennial(model?.totalFee,true) : '--'}}
        //- a-form-item(label="实收金额")
        //-   span {{model?.totalRealFee ? millennial(model?.totalRealFee,true) : '--'}}
        //- a-form-item(label="免费金额")
        //-   span {{model?.totalDiscountFee ? millennial(model?.totalDiscountFee,true) : '--'}}
      
      div
        a-image(:src="operator?.fileVO?.path ? operator?.fileVO?.path : fallback" :height="50" :width="50")
        span.ml2 {{operator.username}}
      div#receipt()
        div.printTitlt(style="height: 42px;line-height: 42px;text-align: center;border-bottom: 1px dashed #000;font-size:16px;font-weight:500;margin-bottom:6px") 收费凭证
        div(style="line-height:36px;font-size:14px")
          span 日期：
          span {{model?.verifyTime ? timeFormat(model?.verifyTime,true) : '--'}}
        div(style="line-height:36px;font-size:14px;border-bottom: 1px dashed #000;padding-bottom:6px")
          span 操作员：
          span {{operator?.name}}
        div(style="line-height:36px;font-size:14px")
          span 应收金额：
          span ￥{{model?.totalFee ? millennial(model?.totalFee,true) : '--'}}
        div(style="line-height:36px;font-size:14px")
          span 实收金额：
          span ￥{{model?.totalRealFee ? millennial(model?.totalRealFee,true) : '--'}}
        div(style="line-height:36px;font-size:14px")
          span 免费金额：
          span ￥{{model?.totalDiscountFee ? millennial(model?.totalDiscountFee,true) : '--'}}
        <div style="height:24px;borderBottom: 1px dashed #000"></div>
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
  onUnmounted,
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
    const tableRef = ref();
    const operator = JSON.parse(sessionStorage.getItem("GH-UserInfo"));
    const fallback = window.config.fallback;
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
          label: "进场时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
          placeholder: ["开始日期", "结束日期"],
        },
        {
          label: "",
          value: "keyword",
          placeholder: "报备号/商家名称/报备人/操作员",
        },
        {
          label: "",
          value: "payType",
          component: "span",
          defaultValue: "CASH_PAY",
        },
        {
          label: "",
          value: "verifyStatus",
          component: "span",
          defaultValue: false,
        },
        {
          label: "",
          value: "operatorAccount",
          component: "span",
          defaultValue: operator.username,
        },
      ],
      form: {},
      model: null,
      visible: false,
    });

    // top统计

    const getData = async (period, keyword, verifyStatus) => {
      proxy.$api
        .enterRecieveTop({
          operatorAccount: operator.username,
          period,
          keyword,
          verifyStatus,
        },"get")
        .then((res) => {
          state.form = typeof res === "object" ? res : {};
        });
    };

    const checkout = () => {
      proxy.$api.reconInfo(operator.username,"get" ).then((res) => {
        state.model = typeof res === "object" ? res : null;
        state.visible = true;
      });
    };

    const save = () => {
      proxy.$api.enterRecieveRecord(state.model,"post").then(() => {
        proxy.$message.success("操作成功");
        tableRef.value.getData();
        cancel();
        print();
      });
    };
    const print = () => {
      const LODOP = getLodop();
      if (LODOP) {
        const strFormHtml = document.getElementById("receipt").innerHTML;
        LODOP.ADD_PRINT_HTM("0", "0", "100%", "100%", strFormHtml);
        LODOP.PREVIEW();
      } else {
        var div = document.createElement("div");
        div.id = "print_tips";
        const strAlertMessage =
          "<br><font color='#FF00FF'>Web打印服务CLodop未安装启动，点击这里<a href='http://www.lodop.net/download/Clodop_Setup_for_Win64NT_4.158EN.zip'>下载执行安装</a>" +
          "<br>（若此前已安装过，可<a href='CLodop.protocol:setup'>点这里直接再次启动</a>）";
        div.innerHTML = strAlertMessage;
        var first = document.body.firstChild;
        var wraphtml = document.body.insertBefore(div, first);
      }
    };
    const cancel = () => {
      state.model = null;
      state.visible = false;
    };

    const beforeGet = (params) => {
      const { period, keyword, verifyStatus } = params;
      getData(period, keyword, verifyStatus);
      return params;
    };

    onMounted(function(){});
    onUnmounted(() => {
      const printTips = document.getElementById("print_tips");
      if (printTips) {
        document.body.removeChild(printTips);
      }
    });
    return {
      tableRef,
      operator,
      fallback,
      ...toRefs(state),
      millennial,
      timeFormat,
      beforeGet,
      checkout,
      cancel,
      save,
    };
  },
});
</script>

<style lang="less" scoped>
div {
}
.topGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(1, 100px);
  grid-column-gap: 16px;
  // padding: 20px;
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
