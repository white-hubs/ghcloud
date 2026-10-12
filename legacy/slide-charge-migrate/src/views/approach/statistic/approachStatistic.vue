<template lang="pug">
g-table(
  title="进场统计"
  :columns="columns"
  :search="search"
  :api="api"
  :btns="[]"
)
  template(#content-data)
    .data-statistics
      .data-item-1.m1
        div.left.flex
          div.leftCet
            a-statistic(title="缴费总金额(元)" :value="statistics?.totalFee || statistics?.totalFee === 0 ? statistics?.totalFee : 0" :precision="2")
            //- .data-label.itemName 缴费总金额(元)
            //- .data-money {{statistics?.totalFee || statistics?.totalFee === 0 ? millennial(statistics?.totalFee):'0'}}
          div.borderRight 
        div.right
          div.flex.justify-between.itemCtr
            div.item
              IconFont(type="icon-qian1" style="height:19px")
              span.content
                span.ml1.itemName 现金
                div.ml1.itemValue {{statistics?.cash || statistics?.cash === 0 ? millennial(statistics?.cash):'0'}} 
            div.borderRight  
          div.flex.justify-between.itemCtr
            div.item
              IconFont(type="icon-weixin" style="height:19px")
              span.content
                span.ml1.itemName 微信
                div.ml1.itemValue {{statistics?.weixin || statistics?.weixin === 0 ? millennial(statistics?.weixin):'0'}}
            div.borderRight    
          div.flex.justify-between.itemCtr
            div.item
              IconFont(type="icon-qiandai" style="height:19px")
              span.content
                span.ml1.itemName 余额
                div.ml1.itemValue {{statistics?.balance || statistics?.balance === 0 ? millennial(statistics?.balance):'0'}}
      .data-item-2.m1
        a-statistic(title="来货总重量(kg)" :value="statistics?.totalWeight || statistics?.totalWeight === 0 ? statistics?.totalWeight : 0" :precision="2")
        //- .data-label 来货总重量(kg)
        //- .data-money {{statistics?.totalWeight || statistics?.totalWeight === 0 ? millennial(statistics?.totalWeight):'0'}}
      .data-item-3.m1
        a-statistic(title="来货车次(次)" :value="statistics?.carNum || statistics?.carNum === 0 ? statistics?.carNum : 0" :precision="2")
        //- .data-label 来货车次(次)
        //- .data-money {{statistics?.carNum || statistics?.carNum === 0 ? millennial(statistics?.carNum,false):'0'}}
      .data-item-4.m1
        a-statistic(title="商家总数(户)" :value="statistics?.merchantNum || statistics?.merchantNum === 0 ? statistics?.merchantNum : 0" :precision="2")
        //- .data-label 商家总数(户)
        //- .data-money {{statistics?.merchantNum || statistics?.merchantNum === 0 ? millennial(statistics?.merchantNum,false) : '0'}}

</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
} from "vue";
import { millennial, timeFormat } from "@/utils/common";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      api: {
        list: "enterStatisticsTable",
      },
      columns: [
        {
          title: "报备号",
          dataIndex: "reportCode",
          slots: {
            customRender: "reportCode",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "车道",
          dataIndex: "enterAreaName",
        },
        {
          title: "商家名称",
          dataIndex: "merchantName",
          slots: {
            customRender: "merchantName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "报备人",
          dataIndex: "reporterName",
          slots: {
            customRender: "reporterName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "收费规则",
          dataIndex: "ruleCategoryName",
          slots: {
            customRender: "ruleCategoryName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "商品重量（kg）",
          dataIndex: "netWeight",
          slots: {
            customRender: "netWeight",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? millennial(text) : ""}
              >
                {text ? millennial(text) : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "缴费金额",
          dataIndex: "enterFee",
          slots: {
            customRender: "enterFee",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? millennial(text) : ""}
              >
                {text ? "￥" + millennial(text) : "--"}
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
          title: "进场时间",
          dataIndex: "enterTime",
          slots: {
            customRender: "enterTime",
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
      ],
      search: [
        {
          label: "车道",
          value: "enterAreaId",
          component: "g-cascader",
          placeholder: "请选择",
          url: "passWayTag",
          params: { tag: "ENTER_CHARGE" },
        },
        {
          label: "支付方式",
          value: "payType",
          component: "gSelect",
          options: [
            { label: "全部", value: " " },
            { label: "现金", value: "CASH_PAY" },
            { label: "余额", value: "BALANCE_PAY" },
            { label: "微信", value: "WEIXIN_PAY" },
          ],
          defaultValue: " ",
          placeholder: "请选择收费类型",
        },
        {
          label: "时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        { label: "", value: "keyword", placeholder: "商家名称/报备号" },
      ],
      statistics: null,
    });

    const getStatisticsData = async () => {
      state.statistics = await proxy.$api.enterStatistics(null,"get");
      state.statistics?.feeDetail.forEach((item) => {
        switch (item.name) {
          case "CASH_PAY":
            Object.assign(state.statistics, { cash: item.value });
            break;
          case "WALLET_PAY":
            Object.assign(state.statistics, { balance: item.value });
            break;
          case "WEIXIN_PAY":
            Object.assign(state.statistics, { weixin: item.value });
            break;
        }
      });
    };

    onMounted(() => {
      getStatisticsData();
    });

    return {
      ...toRefs(state),
      millennial,
    };
  },
});
</script>
<style lang="less" scoped>
.data-statistics {
  height: 100px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  grid-template-rows: repeat(1, 100px);
  > div {
    // width: 30%;
    height: 100%;
    background: bisque;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    flex-direction: column;
    border-radius: 4px;
    &.data-item-1 {
      background: #f8fcff;
      display: flex;
      flex-direction: row;
      .left {
        width: 32%;
        align-items: center;
        // border-right: 2px solid #fff;
        .leftCet {
          width: calc(100% - 2px);
        }
      }
      .right {
        width: 68%;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        .itemCtr {
          align-items: center;
          .item {
            width: 100%;
            display: flex;
            justify-content: center;
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
        border-right: 2px solid rgba(0, 0, 0, 0.03);
      }
    }
    &.data-item-2 {
      background: #fffbf8;
    }
    &.data-item-3 {
      background: #f8fcff;
    }
    &.data-item-4 {
      background: #fffbf8;
    }
    :deep(.ant-statistic-content-value-int) {
      font-weight: bold;
      font-size: 24px;
    }
    :deep(.ant-statistic-content-value-decimal) {
      font-size: 20px;
      font-weight: 500;
      font-weight: bold;
    }
    .data-money {
      font-size: 20px;
      font-weight: 600;
      // color: #535b6c;
      font-weight: bold;
    }
    .data-label {
      font-size: 14px;
      font-weight: 400;
      color: #535b6c;
    }
  }
}
</style>
