<template lang="pug">
.whiteNote
    .whiteNote-title 肉类交易均价
    .whiteNote-content
        .whiteNote-content-left
           .whiteNote-item
             .item-data
                .data-name 今日交易均价（元/kg）
                .data-num {{data.todayAverageUnitAmount}}
                .data-contrast 比昨天 
                    span(:class="data.comparedWithYesterdayUnitAmount>=0?'green':'red'") {{getAbs(data.comparedWithYesterdayUnitAmount)}} 
                        img(src="../../../../assets/images/up.png" v-if="data.comparedWithYesterdayUnitAmount>=0")
                        img(src="../../../../assets/images/down.png" v-else)
           .whiteNote-item
             .item-data
                .data-name 本周交易均价（元/kg）
                .data-num {{data.thisWeekAverageUnitAmount}}
                .data-contrast 比上周 
                    span(:class="data.comparedWithLastWeekUnitAmount>=0?'green':'red'") {{getAbs(data.comparedWithLastWeekUnitAmount)}} 
                        img(src="../../../../assets/images/up.png" v-if="data.comparedWithLastWeekUnitAmount>=0")
                        img(src="../../../../assets/images/down.png" v-else)
           .whiteNote-item
             .item-data
                .data-name 本月交易均价（元/kg）
                .data-num {{data.thisMonthAverageUnitAmount}}
                .data-contrast 比上月 
                    span(:class="data.comparedWithLastMonthUnitAmount>=0?'green':'red'") {{getAbs(data.comparedWithLastMonthUnitAmount)}} 
                        img(src="../../../../assets/images/up.png" v-if="data.comparedWithLastMonthUnitAmount>=0")
                        img(src="../../../../assets/images/down.png" v-else)
           .whiteNote-item
             .item-data
                .data-name 近30天交易均价（元/kg）
                .data-num {{data.recentThirtyDayAverageUnitAmount}}

        .whiteNote-content-right 
            .whiteNote-btn
                a-button(:type="type==='THIS_WEEK'?'primary':null" @click="getList('THIS_WEEK')") 本周
                a-button(:type="type==='THIS_MONTH'?'primary':null" @click="getList('THIS_MONTH')") 本月
                a-button(:type="type==='MONTH'?'primary':null" @click="getList('MONTH')") 近30天
            .whiteNote-chart
                lineChart(:chartData="chartData" lineStyleColor="rgba(250, 173, 20, 1)" areaStyleColor="rgba(250, 173, 20, 0.05)")   

</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
} from "vue";
import lineChart from "./echarts/line.vue";
export default defineComponent({
  components: {
    lineChart,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      data: {
        comparedWithLastMonthUnitAmount: "0.00",
        comparedWithLastWeekUnitAmount: "0.00",
        comparedWithYesterdayUnitAmount: "0.00",
        lastMonthAverageUnitAmount: "0.00",
        lastWeekAverageUnitAmount: "0.00",
        recentThirtyDayAverageUnitAmount: "0.00",
        thisMonthAverageUnitAmount: "0.00",
        thisWeekAverageUnitAmount: "0.00",
        todayAverageUnitAmount: "0.00",
        yesterdayAverageUnitAmount: "0.00",
      },
      chartData: [],
      type: "THIS_WEEK",
    });
    const getList = (type) => {
      state.type = type;
      proxy.$api
        .getPorkStatTradeAverageLine({ type: state.type },"get" )
        .then((res) => {
          state.chartData = res;
        });
    };
    onMounted(() => {
      proxy.$api.getPorkStatTradeAverage().then((res) => {
        state.data = res;
      });
      getList("THIS_WEEK");
    });
    const getAbs = (num) => {
      return Math.abs(num);
    };
    return {
      ...toRefs(state),
      getAbs,
      getList,
    };
  },
});
</script>
<style lang="less" scoped>
.item-data{
  text-align: center;
}
.whiteNote {
  margin-top: 16px;
  height: 404px;
  background: #ffffff;
  border-radius: 0px 0px 0px 0px;
  margin-top: 16px;
  padding-left: 16px;
  padding-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .whiteNote-title {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    border-bottom: 1px solid #f3f3f3;
    font-size: 16px;
    font-family: PingFang SC-Regular, PingFang SC;
    font-weight: 550;
    color: #000000;
  }
  .whiteNote-content {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    > div {
      flex: 1;
      height: 100%;
      &.whiteNote-content-left {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        padding: 40px 0;
        .whiteNote-item {
          width: calc(50% - 8px);
          height: 114px;
          margin-bottom: 18px;
          background: #fafafa;
          display: flex;
          align-items: center;
          justify-content: center;
          .item-data {
            flex: 1;
            position: relative;
            &:nth-child(2) {
              &::before {
                content: "";
                position: absolute;
                top: 50%;
                left: 0;
                width: 1px;
                height: 35px;
                transform: translate(0, -50%);
                border-right: 1px dashed rgba(0, 0, 0, 0.2);
              }
            }
            .data-name {
              font-size: 14px;
              font-family: PingFang SC-Regular;
              font-weight: 400;
              color: #595959;
            }
            .data-num {
              font-size: 20px;
              font-family: PingFang SC-Regular;
              font-weight: 400;
              color: #000000;
            }
            .data-contrast {
              font-size: 12px;
              font-family: PingFang SC-Regular;
              font-weight: 400;
              color: #595959;

              .green {
                color: #00ba8b;
              }
              .red {
                color: #f5222d;
              }
            }
          }
        }
      }
      &.whiteNote-content-right {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        .whiteNote-btn {
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          width: 100%;
          .ant-btn {
            margin-right: 10px;
          }
        }
        .whiteNote-chart {
          flex: 1;
          width: 100%;
        }
      }
    }
  }
}
</style>
