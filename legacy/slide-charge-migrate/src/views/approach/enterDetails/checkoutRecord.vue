<template lang="pug">
g-table(
  title="结账记录"
  :api="api"
  :scrollX="400"
  :btns="btns"
  :search="search"
  :beforeGet="beforeGet"
  :columns="columns")
  template(v-slot:btn="{record}")  
    a-button(type="link" @click="printRecord(record)") 打印
    a-button(type="link" @click="detailPage(record)") 明细
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
    a-modal(
      v-model:visible="visible"
      title="数据打印"
      okText="打印"
      centered
      @ok="print"
      :width="300"
      @cancel="cancel")
      //- iframe(:srcdoc="context" ref="iframe" :frameborder="false" :width="250" :scrolling="'no'" :height="'auto'")
      div#printContent(ref="printContent")
        div.printTitlt(style="height: 42px;line-height: 42px;text-align: center;border-bottom: 1px dashed #000;font-size:16px;font-weight:500;margin-bottom:6px") 收费凭证
        div(style="line-height:36px;font-size:14px") 日期：
          span {{model?.verifyTime ? timeFormat(model.verifyTime,true) : '--'}}
        div(style="line-height:36px;font-size:14px;border-bottom: 1px dashed #000;padding-bottom:6px") 操作员：
          span {{model?.operator ? model.operator : '--'}}
        div(style="line-height:36px;font-size:14px;padding-top:6px") 应收金额：
          span ￥{{model?.totalFee ? millennial(model.totalFee,true) : '--'}}
        div(style="line-height:36px;font-size:14px") 免费金额：
          span ￥{{model?.totalDiscountFee ? millennial(model.totalDiscountFee,true) : '--'}}
        div(style="line-height:36px;font-size:14px") 实收金额：
          span ￥{{model?.totalRealFee ? millennial(model.totalRealFee,true) : '--'}}
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
  nextTick,
  onUnmounted,
} from "vue";
import _ from "lodash";
import { useRouter, useRoute } from "vue-router";
import { replaceObjectKeys } from "@pansy/utils";
import { millennial, timeFormat } from "@/utils/common";
import html2canvas from "html2canvas";
export default defineComponent({
  setup() {
    const { proxy, ctx } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const iframe = ref();
    const printContent = ref();

    const operator = JSON.parse(sessionStorage.getItem("GH-UserInfo"));
    const state = reactive({
      propVisible: false,
      btns: [],
      api: {
        list: "reconRecord",
      },
      columns: [
        {
          dataIndex: "verifyTime",
          title: "结账时间",
          slots: {
            customRender: "verifyTime",
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
          title: "结账人",
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
          label: "结账时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
          placeholder: ["开始日期", "结束日期"],
        },
        {
          label: "",
          value: "keyword",
          placeholder: "结账人",
        },
        {
          label: "",
          value: "operatorAccount",
          component: "span",
          defaultValue: operator.username,
        },
        // {
        //   label: "",
        //   value: "verifyStatus",
        //   component: "span",
        //   defaultValue: true,
        // },
      ],
      form: {},
      visible: false,
      model: {},
      layout: {
        // labelCol: {
        //   span: 7,
        // },
      },
      context: "",
      titltStyle: {
        height: "42px",
        lineHeight: "42px",
        textAlign: "center",
        borderBottom: "1px dashed #000",
      },
      borderStyle: {
        borderBottom: "1px dashed #000",
      },
      style: {
        ".titltStyle": {
          height: "42px",
          lineHeight: "42px",
          textAlign: "center",
          borderBottom: "1px dashed #000",
        },
      },
    });

    // top统计
    const getData = async (period, keyword, verifyStatus) => {
      proxy.$api
        .reconRecordSta({
          operatorAccount: operator.username,
          keyword,
          verifyStatus,
          period,
        },"get")
        .then((res) => {
          state.form = typeof res === "object" ? res : {};
        });
    };

    const detailPage = (record) => {
      history.pushState(
        { current: location.pathname + location.search }, '',
         `/portal/charge/enterChargeReconDetail?title=结账记录详情&id=${record?.id }&startTime=${record?.startTime}&endTime=${record?.endTime}&operatorAccount=${record?.operatorAccount}`
      )
    };

    const dataDetail = (record) => {
      proxy.$api.reconRecordDetail(record.id,"get").then((res) => {
        state.model = typeof res === "object" ? res : null;
        state.visible = true;
      });
    };
    const printRecord = async (record) => {
      dataDetail(record);
    };
    const print = () => {
      const LODOP = getLodop();
      if (LODOP) {
        const strFormHtml = document.getElementById("printContent").innerHTML;
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
      iframe,
      printContent,
      ...toRefs(state),
      printRecord,
      detailPage,
      millennial,
      timeFormat,
      beforeGet,
      cancel,
      print,
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
#printContent {
  padding: 0 16px;
  .printTitlt {
    height: 42px;
    line-height: 42px;
    text-align: center;
    border-bottom: 1px dashed #000;
  }
  .borderBtm {
    border-bottom: 1px dashed #000;
  }
  .ant-form-item {
    height: 42px;
    line-height: 42px;
    margin-bottom: 0;
  }
}
</style>
