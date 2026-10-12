<template>
  <div class="panel">
    <SubPanelTemplate
      image="cl.png"
      title="报警处理情况分析"
      class="visiting-data"
      style="height: 240px"
    >
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="alarmTime"
          @search="changeAlarmTime"
        ></DateInlineForm>
      </template>
      <StackedBar
        v-if="alarmStatisticsData.chartData.xData.length !== 0"
        @clickbar="clickbar"
        :sn="true"
        :xData="alarmStatisticsData.chartData.xData"
        :yData="alarmStatisticsData.chartData.yData"
      />
      <noData v-else />
    </SubPanelTemplate>
    <SubPanelTemplate
      title="易燃设备建档统计"
      image="yr.png"
      style="margin-top: 20px; height: 450px"
      class="xf"
    >
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="dnTime"
          @search="changednTime"
        ></DateInlineForm>
      </template>

      <div class="elevator-analysis" v-if="pieData.length !== 0">
        <div class="chart">
          <elevator-analysis-pie
            @clickbar="handlePieCurrent"
            style="width: 165px"
            :pieData="pieData"
            :radius="'75'"
          >
            <div style="color: #fff; text-align: center; font-size: 14px">
              {{ getallNumber(pieData, "value") }}
            </div>
            <div style="color: #fff; text-align: center; font-size: 14px">易燃设备数</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList
          @handlecurrent="handlePieCurrent"
          :contentList="pieData"
        ></elevatorAnalysisList>
      </div>
      <noData class="chart" v-else />
      <div class="chart" style="margin-top: -40px; height: 220px">
        <StackedBare
          class="sbar"
          @clickbar="handlecurrent"
          :sn="true"
          :xData="barData.xData"
          :yData="barData.yData"
        />
        <!-- <overviewChartBar
          @clickbar="handlecurrent"
          :xData="barData.xData"
          :yData="barData.yData"
        ></overviewChartBar> -->
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警分析" image="zh.png">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="workOrderTime"
          @search="changeReceptionTrendsTime"
        ></DateInlineForm>
      </template>
      <LineChart
        v-if="gasChartData.xData.length > 0"
        :x-data="gasChartData.xData"
        :series="gasChartData.yData"
        :showLegend="true"
        gridTop="15"
        :showBackground="true"
        :axisPointer="true"
        :titles="['报警总数', '已处理报警数']"
        :unit="{ x: '', y: '' }"
      />
      <noData v-else />
    </SubPanelTemplate>
  </div>
  <modal-alarm-table
    :show-modal="alarmModalShow"
    @close="closeModal"
    :parameter="alarmParameter"
  ></modal-alarm-table>
  <modal-table :show="showmodal" title="易燃设备建档记录" @close="close">
    <modal-record
      v-if="showmodal"
      :periodtime="dnTime.dateRange.join(',')"
      type="FLAMMABLE_EQUIPMENT"
      :marketName="marketName"
      :status="statusName"
    ></modal-record>
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
import { getallNumber, autoPage, getXDataByType, HData, TwoArray } from "@/utils/common";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import modalTable from "@/components/modal-table/modal.vue";
import ModalRecord from "./gastable.vue";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue";
import { storeMarket } from "@/piniaStore/other";
import { alarmHandlerAnalysis, alarmTrendAnalysis } from "@/api/shennong/alarm";
import { flammableDevice, flammableDeviceList } from "@/api/shennong/compre";
import StackedBare from "@/components/businessPanel/public/charts/stacked-bar/snstacked-bar.vue";

import dayjs from "dayjs";

const applicationCode = "GAS_MANAGEMENT";
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
  dateRange: [
    dayjs(new Date()).format("YYYY-MM-DD 00:00:00"),

    dayjs(new Date()).format("YYYY-MM-DD 23:59:59"),
  ],
});
const showmodal = ref(false);
const marketName = ref("");
const statusName = ref("");
const statustype = {
  审批中: "UNDER",
  闲置: "LEAVE_UNUSED",
  在用: "MAKE_USE_OF",
  报废: "WEED_OUT",
  已删除: "DELETE",
};

const moneytype = ref("");
const handlecurrent = (data) => {
  statusName.value = null;
  marketName.value = piniaStoreMarket.currentMarketName
    ? piniaStoreMarket.currentMarketName
    : data.name;
  // alarmParameter.value.name=data.name
  showmodal.value = true;
};
const handlePieCurrent = (data) => {
  statusName.value = data.name
  marketName.value = piniaStoreMarket.currentMarketName
    ? piniaStoreMarket.currentMarketName
    : data.name;
  // alarmParameter.value.name=data.name
  showmodal.value = true;
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
const clickbar = (record) => {
  alarmModalShow.value = true;
  record.marketTenant = Xdata2.value.find((res) => res.marketName == record.name)?.marketTenant;
  alarmParameter.value = Object.assign(alarmParameter.value, record);
};
const handleColors = ["#6AE0E4", "#95BCF9", "#6194F7", "#2F78F1"];
const currentindex = ref(0);
const Xdata2 = ref([]);
const changeAlarmTime = async () => {
  alarmParameter.value.dateRange = alarmTime.value.dateRange;
  currentindex.value += 1;
  let param = {
    period: alarmTime.value.dateRange.join(","),
    type: alarmTime.value.timeType,
    pageSize: alarmStatisticsData.page.pageSize,
    pageNumber: alarmStatisticsData.page.pageNumber,
    applicationCode: applicationCode,
    marketTenant: piniaStoreMarket.currentMarket,
  };
  let { records, total, pages } = await alarmHandlerAnalysis(param);
  let { xdata, ydata } = records[0];
  const xList = TwoArray(xdata, alarmStatisticsData.page.pageSize);

  let page = xdata.length / alarmStatisticsData.page.pageSize;
  if (currentindex.value > Math.ceil(page)) {
    currentindex.value = 0;
  }
  if (!xdata || !ydata) return;
  alarmStatisticsData.marketData = xdata;
  // alarmStatisticsData.chartData.xData = xList.length > 0 ? xList[currentindex.value].map((item) => item.marketName) : [];
    if (records[0].xdata.length > 0) {
      alarmStatisticsData.chartData.xData = TwoArray(records[0].xdata, alarmStatisticsData.page.pageSize)[currentindex.value].map(
        (item) => item.marketName
      )
    } else {
      alarmStatisticsData.chartData.xData = [];
    }
    
  alarmStatisticsData.chartData.yData = ydata.map((item, index) => {
    return {
      name: item.name,
      value: TwoArray(item.value, alarmStatisticsData.page.pageSize)[currentindex.value],
      datavalue: item.value,
      color: handleColors[index % handleColors.length],
      marketlist: {
        xdata: xList,
        ydata: TwoArray(item.value, alarmStatisticsData.page.pageSize),
      },
    };
  });
  Xdata2.value = records[0].xdata;
};
const changednTime = () => {
  getFlammableDevice();
  getFlammableDeviceList();
};
const colors = ["#94BAF9", "#6C9BE8", "#3F7CDF", "#2989FF"];
const pieData = ref([]);
const getFlammableDevice = async () => {
  let param = {
    period: dnTime.value.dateRange.join(","),
    type: dnTime.value.timeType,
    marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: applicationCode,
  };
  let res: any = await flammableDevice(param);

  pieData.value = res?.statusVOList.map((item, index) => {
    return {
      name: item.deviceState,
      value: item.stateNum,
      // ratio: item?.ratio,
      color: colors[index % colors.length],
    };
  });
};

const barData = reactive({
  xData: [],
  yData: [],
});
const devicePage = reactive({
  total: 0,
  pageSize: 5,
  pageNumber: 1,
  pages: 0,
});
const Xdata = ref([]);
const currentindexa = ref(0);
const getFlammableDeviceList = async () => {
  let param = {
    period: dnTime.value.dateRange.join(","),
    type: dnTime.value.timeType,
    pageSize: devicePage.pageSize,
    pageNumber: devicePage.pageNumber,
    marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: applicationCode,
  };
  currentindexa.value += 1;
  let { records, total, pages } = await flammableDeviceList(param);
  // autoPage(devicePage, total, pages);
  let newdata = JSON.parse(JSON.stringify(records));
  let page1 = records.length / devicePage.pageSize;
  if (currentindexa.value >= Math.ceil(page1)) {
    currentindexa.value = 0;
  }
  Xdata.value = records;
  let xdata = records.map((item) => item.marketName);
  let ydata = records.map((item) => item.num);
  if (xdata.length > 0) {
    barData.xData = TwoArray(records, devicePage.pageSize)[currentindexa.value].map(
      (item) => item.marketName
    );
  } else {
    barData.xData = [];
  }
  if (xdata.length > 0) {
    barData.yData = [
      {
        value: TwoArray(records, devicePage.pageSize)[currentindexa.value].map(
          (item) => item.num
        ),
        marketlist: {
          xdata: TwoArray(xdata, devicePage.pageSize),
          ydata: TwoArray(ydata, devicePage.pageSize),
        },
      },
    ];
  } else {
    barData.yData = [
      {
        value: [],
        marketlist: {
          xdata: TwoArray(xdata, devicePage.pageSize),
          ydata: TwoArray(ydata, devicePage.pageSize),
        },
      },
    ];
  }
};

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

let timer = null;
// 报警处理情况, 易燃设备建档统计 每15秒轮播
onMounted(() => {
  timer = setInterval(() => {
    changeAlarmTime();
    getFlammableDeviceList();
    changednTime();
  }, (window as any).config.pageLoopRequestTime);
});

watch(
  () => piniaStoreMarket.currentMarket,
  (n) => {
    clearInterval(timer);
    changeReceptionTrendsTime();
    getFlammableDevice();
  }
);
watch(
  () => piniaStoreMarket.currentMarketName,
  (n) => {
    if (n) {
      clearInterval(timer);
      changeAlarmTime();
      getFlammableDeviceList();
      changednTime();
    } else {
      // alarmStatisticsData.chartData.xData = [];
      changeAlarmTime();
      timer = setInterval(() => {
        changeAlarmTime();
        getFlammableDeviceList();
        changednTime();
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
.tj {
  height: 480px;
}
.visiting-data {
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
  height: 200px;
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
.xf {
}
</style>
