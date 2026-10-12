<template lang="pug">
div.ctr
  g-table(
    ref="tableRef"
    title="停车收费统计"
    :editMode="'page'"
    :columns="columns"
    :btns="btns"
    :api="api"
    :beforeGet="beforeGet"
    :search="search")
    template(v-slot:pre-item="{record}")
      a-form-item(label)
        a-button(:type="time==='today' ? 'primary' : 'default'" @click="choseTime('today')") 今日
        a-button(:type="time==='week' ? 'primary' : 'default'" @click="choseTime('week')") 近7天
        a-button(:type="time==='month' ? 'primary' : 'default'" @click="choseTime('month')") 近30天
    template(#statistic-data)
      div.topGrid.mb2
        div.p2.flex.justify-between.item
          div.topLeft.flex.justify-between
            a-statistic(title="实收总金额（元）" :value="model?.parkingChargeStatisticsVO?. realFeeTotal" :precision="2" :prefix="'￥'")
            div.borderRight
          div.flex.topRight.justify-between
            div.flex.justify-between.itemCtr(v-for="item,index in payTypeStatistics" :key="item.payType")
              div.item
                //- IconFont(type="icon-qian1" style="height:19px")
                AppSvg(:name="item.payType" :size="14")
                div.content
                  span.itemName {{item.payTypeName}}
                  div.itemValue {{item.payAmount || item.payAmount === 0 ? millennial(item.payAmount):'0'}} 
              div.borderRight(v-if="index < payTypeStatistics.length - 1")    
            //- div.flex.justify-between.itemCtr
            //-   div.item
            //-     IconFont(type="icon-qian1" style="height:19px")
            //-     span.content
            //-       span.ml1.itemName 现金
            //-       div.ml1.itemValue {{model?.cash || model?.cash === 0 ? millennial(model?.cash):'0'}} 
            //-   div.borderRight  
            //- div.flex.justify-between.itemCtr
            //-   div.item
            //-     IconFont(type="icon-weixin" style="height:19px")
            //-     span.content
            //-       span.ml1.itemName 微信
            //-       div.ml1.itemValue {{model?.weixin || model?.weixin === 0 ? millennial(model?.weixin):'0'}} 
            //-   div.borderRight  
            //- div.flex.justify-between.itemCtr
            //-   div.item
            //-     IconFont(type="icon-qiandai" style="height:19px")
            //-     span.content
            //-       span.ml1.itemName 余额
            //-       div.ml1.itemValue {{model?.balance || model?.balance === 0 ? millennial(model?.balance):'0'}} 
            //-   div.borderRight  
            //- div.flex.justify-between.itemCtr
              div.item
                IconFont(type="icon-ly_huiyuanka" style="height:19px")
                span.content
                  span.ml1.itemName 车卡
                  div.ml1.itemValue {{model?.ICcard || model?.ICcard === 0 ? millennial(model?.ICcard):'0'}} 
        div.p2.flex.justify-between.item
          a-statistic(title="应收总金额（元）" :value="model?.parkingChargeStatisticsVO?. parkingFeeTotal" :precision="2" :prefix="'￥'")
        div.p2.flex.justify-between.item
          a-statistic(title="免费总金额（元）" :value="model?.parkingChargeStatisticsVO?. discountFeeTotal" :precision="2" :prefix="'￥'")
</template>

<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  reactive,
  toRefs,
  watch,
  ref,
  onMounted,
} from "vue";
import { millennial, timeFormat, dateReduce } from "@/utils/common";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { time } from "echarts";
export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();

    const tableRef = ref();
    const state = reactive({
      columns: [
        {
          dataIndex: "plateNo",
          title: "车牌号",
          slots: {
            customRender: "plateNo",
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
          dataIndex: "entryTime",
          title: "入场时间",
          slots: {
            customRender: "entryTime",
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
          dataIndex: "exitTime",
          title: "出场时间",
          slots: {
            customRender: "exitTime",
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
          dataIndex: "duration",
          title: "停车时长",
          slots: {
            customRender: "duration",
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
          dataIndex: "parkingFee",
          title: "应收金额",
          slots: {
            customRender: "parkingFee",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, true) : ""}
              >
                {text || text === 0 ? millennial(text, true) : "--"}
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
                content={text || text === 0 ? millennial(text, true) : ""}
              >
                {text || text === 0 ? millennial(text, true) : "--"}
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
                content={text || text === 0 ? millennial(text, true) : ""}
              >
                {text || text === 0 ? millennial(text, true) : "--"}
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
          ellipsis: true,
          customRender: ({ text }) => {
            let res;
            switch (text) {
              case "CASH":
                res = "现金";
                break;
              case "BALANCE":
                res = "钱包余额";
                break;
              case "ALI_PAY":
                res = "车卡支付";
                break;
              case "WEIXIN_PAY":
                res = "微信";
                break;
              case "IC_CARD":
                res = "车卡支付";
                break;
              default:
                res = "";
                break;
            }
            return (
              <PopOver position="topLeft" content={res ? res : ""}>
                {res ? res : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "exitOperatorName",
          title: "收费操作员",
          slots: {
            customRender: "exitOperatorName",
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
          dataIndex: "exitLaneName",
          title: "收费车道",
          slots: {
            customRender: "exitLaneName",
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
          dataIndex: "entryAreaName",
          title: "收费区域",
          slots: {
            customRender: "entryAreaName",
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
      ],
      api: {
        list: "payRecord",
      },
      btns: [],
      search: [
        {
          label: "出场时间",
          value: "date",
          component: "a-range-picker",
          defaultDate: "period",
          // defaultValue: [timeFormat(new Date(), false)],
        },
      ],
      time: "today",
      model: {
        parkingChargeStatisticsVO: null,
        cash: "",
        balance: "",
        ICcard: "",
        weixin: "",
      },
      payTypeStatistics: [],
    });

    const choseTime = (value) => {
      state.time = value;
      tableRef.value.form.date = [];
      tableRef.value.form.period = "";
      tableRef.value.page.pageNumber = 1;
      tableRef.value.getData();
    };

    const getSta = (params) => {
      proxy.$api.parkingStatis(params, "get").then((res) => {
        if (typeof res === "object") {
          state.model.parkingChargeStatisticsVO = res.parkingChargeStatisticsVO;
          state.payTypeStatistics = res.payTypeStatisticsVOS;
          if (res?.payTypeStatisticsVOS.length) {
            res?.payTypeStatisticsVOS.forEach((item) => {
              switch (item.payType) {
                case "CASH":
                  state.model.cash = item.payAmount;
                  break;
                case "WEIXIN_PAY":
                  state.model.weixin = item.payAmount;
                  break;
                case "IC_CARD":
                  state.model.ICcard = item.payAmount;
                  break;
                case "BALANCE":
                  state.model.balance = item.payAmount;
                  break;
              }
            });
          }
        } else {
          state.model = {
            parkingChargeStatisticsVO: null,
            cash: "",
            balance: "",
            ICcard: "",
            weixin: "",
          };
        }

      });
    };

    const beforeGet = (params) => {
      if (tableRef.value?.form.date?.length) {
        if (tableRef.value?.form.date?.length === 1) {
          state.time = "today";
          return;
        }
        state.time = "";
      } else {
        if (!state.time) {
          state.time = "today";
        }
      }
      const periodEnd = timeFormat(new Date());
      if (state.time === "today") {
        const today = timeFormat(new Date(), false);
        params.period = timeFormat(new Date(), false);
        getSta({ period: today });
      } else if (state.time === "week") {
        const periodStart = timeFormat(dateReduce("w", 7, new Date()));
        params.period = `${periodStart},${periodEnd}`;
        getSta({ period: `${periodStart},${periodEnd}` });
      } else if (state.time === "month") {
        const periodStart = timeFormat(dateReduce("w", 30, new Date()));
        params.period = `${periodStart},${periodEnd}`;
        getSta({ period: `${periodStart},${periodEnd}` });
      } else {
        getSta({ period: params.period });
      }
      return params;
    };

    onMounted(function(){});

    return {
      tableRef,
      ...toRefs(state),
      millennial,
      timeFormat,
      choseTime,
      beforeGet,
    };
  },
});
</script>

<style lang="less" scoped>
.topGrid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: repeat(1, 112px);
  grid-column-gap: 16px;
}
.p2 {
  align-items: center;
  &:not(:first-child) {
    align-items: center;
    > div {
      flex: 1;
    }
    &:nth-child(2n) {
      background-color: #f6ffed;
    }
    &:nth-child(2n -1) {
      background-color: #e6fffb;
    }
  }
  &:first-child {
    background-color: #e6f7ff;
    .topLeft {
      width: 30%;
      align-items: center;
      .ant-statistic {
        width: calc(100% - 2px);
      }
      .borderRight {
        width: 2px;
        height: 30px;
        background-color: #fff;
      }
    }
    .topRight {
      width: 70%;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      .itemCtr {
        align-items: center;
        .item {
          width: 100%;
          display: flex;
          justify-content: center;
          .svg-icon {
            margin-top: 3px;
          }
          &:not(:last-child) {
            width: calc(100% - 2px);
          }
          .content {
            text-align: left;
          }
          .itemName {
            font-size: 14px;
          }
          .itemValue {
            font-size: 16px;
            font-weight: bold;
          }
        }
        .anticon {
          line-height: 1.5;
        }
      }
    }
    .borderRight {
      height: 30px;
      border-right: 2px solid #fff;
    }
  }
}
:deep(.ant-statistic) {
  text-align: left;
  padding-left: 16px;
  .ant-statistic-content-value-int {
    font-weight: bold;
    font-size: 24px;
  }
  .ant-statistic-content-value-decimal {
    font-size: 20px;
    font-weight: bold;
  }
}
// :deep(.ant-statistic-content-value-int) {
//   font-weight: bold;
//   font-size: 24px;
// }
// :deep(.ant-statistic-content-value-decimal) {
//   font-size: 20px;
// }
</style>
