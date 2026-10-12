<template>
  <SubPanelTemplate title="安全态势总览" zoomable zoom-title="安全态势总览">
    <template #extra>
      <DateInlineForm v-model:modelValue="overviewTime" @search="getAlarmsNumbers" data-no-zoom> </DateInlineForm>
    </template>
    <DeviceStatistics
      @handel-click-itemize="handelClickDeviceNum"
      style="height: 60px"
      imgPath="overView21.png"
      :statistic="deviceStatisticsData1"
      data-no-zoom
    >
    </DeviceStatistics>
    <div class="chart" data-no-zoom>
      <overviewChartBar :bottom="'0%'" :xData="barData.xData" :yData="barData.yData" @clickbar="handleBarClick"></overviewChartBar>
    </div>
    <template #zoom-content>
      <div class="zoom-security-content">
        <DeviceStatistics
          @handel-click-itemize="handelClickDeviceNumZoom"
          style="height: 80px"
          imgPath="overView21.png"
          :statistic="deviceStatisticsData1"
          data-no-zoom
        >
        </DeviceStatistics>
        <div class="zoom-chart">
          <overviewChartBar
            :bottom="'0%'"
            :xData="barData.xData"
            :yData="barData.yData"
            @clickbar="handleBarClickZoom"
            :height="320"
          ></overviewChartBar>
        </div>
      </div>
    </template>
  </SubPanelTemplate>
  <modal-alarm-table v-if="alarmModalShow" :show-modal="alarmModalShow" @close="closeModal" :parameter="overviewTime"></modal-alarm-table>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import DateInlineForm from "../public/dateInlineForm.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import { ModelValueItf } from "../public/types";
import DeviceStatistics from "../triage-queue/components/device-statistics.vue";
import { groupStatistics, statisticsStatus } from "@/api/alarm";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-tableNew.vue";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
const overviewTime = ref<ModelValueItf>();
const alarmModalShow = ref<boolean>(false);

const barData = reactive({
  xData: ["安防报警", "消防报警", "电气报警", "入侵报警"],
  yData: [
    {
      data: [],
      name: "已处理",
      color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
    },
    {
      data: [],
      name: "处理中",
      color: ["rgba(42, 232, 189, 0.80)", "rgba(42, 232, 189, 0)"],
    },
  ],
});
const deviceStatisticsData1 = reactive({
  title: "告警总量",
  total: 0,
  itemize: [
    {
      name: "处理占比",
      label: "已处理",
      value: 0,
      key: "OFFLINE",
    },
  ],
});
// 报警状态统计&报警趋势折线图统计
async function getAlarmsNumbers() {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: overviewTime.value.dateRange.join(","),
    type: overviewTime.value.timeType,
  };
  const Status = await statisticsStatus(params);
  deviceStatisticsData1.total = Status.alarmNum;
  Status.alarmStatusStatistics.forEach((item) => {
    if (item.alarmStatusName === "已处理") {
      deviceStatisticsData1.itemize[0].value = item.alarmNum;
    }
  });
  const res = await groupStatistics(params);
  barData.xData = res.map((item) => item.applicationName);
  barData.yData[0].data = res.map((item) => item.alarmHandler);
  barData.yData[1].data = res.map((item) => item.alarmProgressConfirmed);
  barData.xData.length ? barData.xData : (barData.xData = ["安防报警", "消防报警", "电气报警", "入侵报警"]);
  barData.yData[1].data.length ? barData.yData[1].data : (barData.yData[1].data = ["0"]);
  barData.yData[0].data.length ? barData.yData[0].data : (barData.yData[0].data = ["0"]);
}
const handelClickDeviceNum = () => {
  alarmModalShow.value = true;
};
const closeModal = () => {
  alarmModalShow.value = false;
};

// 放大模式下的点击处理（复用原有逻辑）
const handelClickDeviceNumZoom = () => {
  handelClickDeviceNum();
};

const handleBarClick = (value: any) => {
  // 原有的图表点击处理逻辑
  console.log("Bar clicked:", value);
};

const handleBarClickZoom = (value: any) => {
  handleBarClick(value);
};
</script>
<style lang="less" scoped>
.chart {
  flex: 1;
  height: 220px;
}

// 放大弹窗内的样式
.zoom-security-content {
  padding: 20px;
  min-height: 400px;

  .zoom-chart {
    flex: 1;
    height: 320px;
    margin-top: 20px;
  }
}
</style>
