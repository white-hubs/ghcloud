<template>
  <div class="panel">
    <SubPanelTemplate title="消防报警事件占比" image="bt.png" class="zb">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="dnTime"
          @search="changednTime"
        ></DateInlineForm>
      </template>

      <div class="elevator-analysis" v-if="pieData.length !== 0">
        <div class="chart">
          <elevator-analysis-pie
            style="width: 155px"
            :pieData="pieData"
            :radius="'75'"
            @clickbar="handlecurrentEvent"
          >
            <div style="color: #fff; text-align: center; font-size: 14px">
              {{ getallNumber(pieData, "value") }}
            </div>
            <div style="color: #fff; text-align: center; font-size: 14px">报警总数</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList
          @handlecurrent="handlecurrentEvent"
          :contentList="pieData"
          style="margin-left: 10px"
        ></elevatorAnalysisList>
      </div>
      <noData class="nodata" v-else />
    </SubPanelTemplate>
    <SubPanelTemplate image="cl.png" title="报警处理情况" class="visiting-data">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="alarmTime"
          @search="changealarmTime"
        ></DateInlineForm>
      </template>
      <StackedBar
        v-if="alarmStatisticsData.chartData.xData.length !== 0"
        @clickbar="handlecurrent"
        :sn="true"
        :xData="alarmStatisticsData.chartData.xData"
        :yData="alarmStatisticsData.chartData.yData"
      />
      <noData class="nodata" v-else />
    </SubPanelTemplate>

    <SubPanelTemplate title="报警趋势分析" image="tj.png" style="margin-top: 10px">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="workOrderTime"
          @search="changeReceptionTrendsTime"
        ></DateInlineForm>
      </template>
      <div v-if="gasChartData.xData.length !== 0">
        <LineChart
          style="height: 300px"
          :x-data="gasChartData.xData"
          :series="gasChartData.yData"
          :showLegend="true"
          gridTop="15"
          :showBackground="true"
          :axisPointer="true"
          :titles="['报警总数', '已处理报警数']"
          :unit="{ x: '', y: '' }"
        />
      </div>
      <noData class="nodata" v-else />
    </SubPanelTemplate>
  </div>
  <modal-alarm-table
    :show-modal="alarmModalShow"
    @close="closeModal"
    :parameter="alarmParameter"
  ></modal-alarm-table>
  <modal-table :show="showmodal" title="建档统计" @close="close">
    <modal-record></modal-record>
  </modal-table>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted, watch } from "vue";
import noData from "@/components/businessPanel/public/noData.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import SubPanelTemplate from "@/components/businessPanel/public/snPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import StackedBar from "@/components/businessPanel/public/charts/stacked-bar/stacked-bar.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import {
  getXaxleData,
  getCurrentAreaInfo,
  autoPage,
  getXDataByType,
  getallNumber,
  HData,
  TwoArray,
} from "@/utils/common";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import modalTable from "@/components/modal-table/modal.vue";
import ModalRecord from "@/components/shengnongPanel/common/record.vue";
import { storeMarket } from "@/piniaStore/other";
import {
  alarmEventRatio,
  alarmTrendAnalysis,
  alarmHandlerAnalysis,
} from "@/api/shennong/alarm";

const applicationCode = "FIRECONTROL";
const piniaStoreMarket = storeMarket();

const workOrderTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const alarmTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const dnTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const showmodal = ref(false);
const handlecurrentEvent = (record) => {
  alarmModalShow.value = true;
  alarmParameter.value = {
    applicationCode: applicationCode,
    alarmTypeCode: applicationCode,
    dateRange: dnTime.value.dateRange
  }
  if (piniaStoreMarket.currentMarketName === "") {
    alarmParameter.value = Object.assign(alarmParameter.value, record);
  } else {
    alarmParameter.value.name = piniaStoreMarket.currentMarketName;
  }
};
const handlecurrent = (record) => {
  alarmModalShow.value = true;
  alarmParameter.value = {
    applicationCode: applicationCode,
    alarmTypeCode: applicationCode,
    dateRange: alarmTime.value.dateRange
  }
  if (piniaStoreMarket.currentMarketName === "") {
    alarmParameter.value = Object.assign(alarmParameter.value, record);
  } else {
    alarmParameter.value.name = piniaStoreMarket.currentMarketName;
  }
};
const close = () => {
  showmodal.value = false;
};
const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({
  applicationCode: applicationCode,
  alarmTypeCode: applicationCode,
});
const closeModal = () => {
  alarmModalShow.value = false;
};
const pieData = ref([]);

const gasChartData = reactive({
  xData: [],
  yData: [
    {
      name: "报警总数",
      data: [],
      linearGradientColor: ["rgba(97, 148, 247, 0.34)", "rgba(97, 148, 247, 0.02)"],
      lineColor: "#6194F7",
    },
    {
      name: "已处理报警数",
      data: [],
      linearGradientColor: ["rgba(148, 186, 249, 0.34)", "rgba(148, 186, 249, 0.02)"],
      lineColor: "rgba(149, 188, 249, 1)",
    },
  ],
});
const colors = ["#94BAF9", "#6C9BE8", "#3F7CDF", "#2989FF"];
const changednTime = async () => {
  alarmParameter.value.dateRange = dnTime.value.dateRange;
  let param = {
    period: dnTime.value.dateRange.join(","),
    type: dnTime.value.timeType,
    marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: applicationCode,
  };
  let res: any = await alarmEventRatio(param);
  pieData.value = res.map((item, index) => {
    return {
      name: item.name,
      value: item.totalNum,
      ratio: item.ratio,
      color: colors[index % colors.length],
    };
  });
};

const changeReceptionTrendsTime = async () => {
  let param = {
    period: workOrderTime.value.dateRange.join(","),
    type: workOrderTime.value.timeType,
    marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: applicationCode,
  };
  let { alarmHandlerTrends, alarmTrends } = await alarmTrendAnalysis(param);
  let xData = alarmTrends.map((item) => {
    return item.period;
  });
  gasChartData.xData = getXDataByType(workOrderTime.value.timeType, xData);
  gasChartData.yData[0].data = alarmTrends.map((item) => {
    return item.totalNum;
  });
  gasChartData.yData[1].data = alarmHandlerTrends.map((item) => {
    return item.totalNum;
  });
};
const alarmStatisticsData = reactive({
  chartData: {
    xData: [],
    yData: [],
  },
  page: {
    total: 0,
    pages: 0,
    pageSize: 5,
    pageNumber: 1,
  },
});

const handleColors = ["#6AE0E4", "#95BCF9", "#6194F7", "#2F78F1"];
const currentindex = ref(0);
const changealarmTime = async () => {
  currentindex.value += 1;
  alarmParameter.value.dateRange = alarmTime.value.dateRange;
  let param = {
    period: alarmTime.value.dateRange.join(","),
    type: alarmTime.value.timeType,
    pageSize: alarmStatisticsData.page.pageSize,
    pageNumber: alarmStatisticsData.page.pageNumber,

    // marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: applicationCode,
  };
  let { records, total, pages } = await alarmHandlerAnalysis(param);
  // autoPage(alarmStatisticsData, total, pages);
  let { xdata, ydata } = records[0];
  if (!xdata || !ydata) return;
  const xlist = TwoArray(xdata, alarmStatisticsData.page.pageSize);

  let page = xdata.length / alarmStatisticsData.page.pageSize;
  if (currentindex.value >= Math.ceil(page)) {
    currentindex.value = 0;
  }
  if (!xdata || !ydata) return;
  alarmStatisticsData.marketData = xdata;
  alarmStatisticsData.chartData.xData =
    xlist.length > 0 ? xlist[currentindex.value].map((item) => item.marketName) : [];

  alarmStatisticsData.chartData.yData = ydata.map((item, index) => {
    return {
      name: item.name,
      value: TwoArray(item.value, alarmStatisticsData.page.pageSize)[currentindex.value],
      datavalue: item.value,
      color: handleColors[index % handleColors.length],
      marketlist: {
        xdata: xlist,
        ydata: TwoArray(item.value, alarmStatisticsData.page.pageSize),
      },
    };
  });
};
let timer = null;
// 报警处理情况 每15秒轮播
onMounted(() => {
  timer = setInterval(() => {
    changealarmTime();
    changednTime();
    changeReceptionTrendsTime();
  }, (window as any).config.pageLoopRequestTime);
});

watch(
  () => piniaStoreMarket.currentMarket,
  (n) => {
    // changealarmTime()
    changednTime();
    changeReceptionTrendsTime();
    
  }
);
watch(
  () => piniaStoreMarket.currentMarketName,
  (n) => {
    if (n) {
      clearInterval(timer);
    } else {
      alarmStatisticsData.chartData.xData = [];
      changealarmTime();
      timer = setInterval(() => {
        changealarmTime();
      }, (window as any).config.pageLoopRequestTime);
    }
  },
  { deep: true }
);
onUnmounted(() => {
  clearInterval(timer);
});
</script>
<style scoped lang="less">
.visiting-data {
  height: 350px;
  .title {
    color: #fff;
    font-size: 12px;
  }

  :deep(.sub-panel-content) {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .item {
      width: 50%;
      height: 60px;
      margin-top: 30px;
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      padding-left: 20px;

      .ant-statistic {
        display: inline-flex;
        flex-flow: column-reverse;

        .ant-statistic-content {
          height: 29px;

          .ant-statistic-content-value {
            color: #fff;
            font-size: 22px;
            font-weight: 400;
            position: relative;
            top: -25px;
          }
        }

        .ant-statistic-title {
          color: #d0deee;
          font-size: 12px;
          margin: 0;
        }
      }

      .ringRatio {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
      }

      .downtriangle {
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 8px solid #d2fff3;
        margin: 0 3px;
        transform: rotate(180deg);
      }

      .uptriangle {
        border-bottom: 8px solid #ffcece;
        transform: rotate(0deg);
      }

      .down {
        color: #2ae8bd;
        font-family: Roboto-Regular, Roboto;
      }

      .up {
        color: #f14545;
        font-family: Roboto-Regular, Roboto;
      }
    }
  }
}

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
}
.more {
  width: 100%;
  cursor: pointer;
  margin-top: -5px;
  font-size: 14px;
  font-family: Source Han Sans CN-Regular, Source Han Sans CN;
  font-weight: 400;
  color: #6194f7;
  text-align: right;
}
.chart {
  flex: 1;
  height: 220px;
}
.chart1 {
  // margin-top:20px;
  // flex: 1;
  // height: 300px;
}
.dnumber {
  width: 100%;
  display: flex;
  justify-content: space-between;
  .dcontent {
    padding: 5px;
    text-align: center;
    box-sizing: border-box;
    width: 33%;
    height: 56px;
    background: rgba(97, 148, 247, 0.2);
    border-radius: 0px 0px 0px 0px;
    .title {
      font-size: 12px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      color: #93aadb;
    }
    .name {
      font-size: 20px;
      font-family: PangMenZhengDao-Regular, PangMenZhengDao;
      font-weight: 400;
      color: #94baf9;
    }
  }
}
.nodata {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
.zb {
  height: 300px;
}
</style>
