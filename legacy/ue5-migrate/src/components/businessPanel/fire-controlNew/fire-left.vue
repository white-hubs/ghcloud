<template>
  <div>
    <SubPanelTemplate title="报警情况统计" zoomable zoom-title="报警情况统计详情" :zoom-width="600">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmtimeType" @search="changeDate" data-no-zoom></DateInlineForm>
      </template>

      <displayPanel :bg-img="'overView16.png'" :content-list="contentList" :showimg="false" data-no-zoom></displayPanel>

      <template #zoom-content>
        <div class="zoom-display-panel">
          <displayPanel :bg-img="'overView16.png'" :content-list="contentList" :showimg="false"></displayPanel>
        </div>
      </template>
    </SubPanelTemplate>

    <SubPanelTemplate title="报警事件统计" zoomable zoom-title="报警事件统计详情">
      <template #extra>
        <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime" data-no-zoom></DateInlineForm>
      </template>

      <div class="chart" data-no-zoom>
        <overviewChartBar
          @clickbar="alarmClickBar"
          :xData="barData.xData"
          :yData="barData.yData"
          v-if="barData.xData.length"
        ></overviewChartBar>

        <noData v-else></noData>
      </div>

      <template #zoom-content>
        <div class="zoom-alarm-content">
          <div class="zoom-barChart" data-no-zoom>
            <overviewChartBar
              @clickbar="alarmClickBar"
              :xData="barData.xData"
              :yData="barData.yData"
              v-if="barData.xData.length"
              :height="360"
            ></overviewChartBar>

            <noData v-else></noData>
          </div>
        </div>
      </template>
    </SubPanelTemplate>

    <div class="alarm-event">
      <SubPanelTemplate title="设备报警趋势" zoomable zoom-title="设备报警趋势详情">
        <template #extra>
          <DateInlineForm v-model:modelValue="trend" @search="getAlarmTrend" data-no-zoom></DateInlineForm>
        </template>

        <div class="trend-chart" data-no-zoom>
          <LineChart :x-data="xData.arr" :series="series" v-if="!series[0].data.every((value) => value === 0)"></LineChart>

          <div class="body" style="min-height: 150px" v-else>
            <noData></noData>
          </div>
        </div>

        <template #zoom-content>
          <div class="zoom-trend-chart">
            <LineChart :x-data="xData.arr" :series="series" v-if="!series[0].data.every((value) => value === 0)" :height="380"></LineChart>

            <div class="zoom-no-data" v-else>
              <noData></noData>
            </div>
          </div>
        </template>
      </SubPanelTemplate>
    </div>

    <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="parameter"></modal-alarm-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import overviewChartBar from "../hospital/overview-chartBar.vue";
import LineChart from "../public/lineChart.vue";
import noData from "../public/noData.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import { ModelValueItf } from "../public/types";
import { alarmEventTypeStatisticsc, statisticsSituation } from "@/api/alarm";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import displayPanel from "@/components/businessPanel/public/display-panelsafty.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import { useStateStore } from "@/pages/state/use-state-store";
import { alarmTrend } from "@/utils/requestData/alarm";

const { globalState } = useStateStore();

let eventDataList = [];

const alarmModalShow = ref<boolean>(false);

const parameter = reactive({
  alarmEventTypeId: "",

  dateRange: [],
});

let alarmtimeType = ref<ModelValueItf>({
  timeType: "THIS_YEAR",

  dateRange: [],
});

const contentList = ref([
  {
    name: "消防报警占比",

    field: "ratio",

    value: 0,
  },

  {
    name: "报警处理率",

    field: "handlerRatio",

    value: 0,
  },

  {
    name: "报警正确率",

    field: "actualRatio",

    value: 0,
  },

  {
    name: "报警超时率",

    field: "timeoutRatio",

    value: 0,
  },
]);

let trend = reactive<ModelValueItf>({
  timeType: "THIS_YEAR",

  dateRange: [],
});

const barData = reactive({
  xData: ["安防报警", "消防报警", "电气报警", "入侵报警"],

  yData: [
    {
      data: [10, 20, 30, 40],

      name: "",

      color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
    },
  ],
});

const xData = reactive({ arr: [] });

const series = reactive([
  {
    data: [],

    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);

const alarmClickBar = (value) => {
  const { name } = value;

  const findItem = eventDataList.find((item) => item.name === name);

  if (findItem) {
    parameter.alarmEventTypeId = findItem.id;

    parameter.dateRange = overviewTime.value.dateRange;

    alarmModalShow.value = true;
  }
};

const closeModal = () => {
  alarmModalShow.value = false;
};

const overviewTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",

  dateRange: [],
});

const changeDate = async () => {
  getAlarmSituation();
};

const getAlarmSituation = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,

    areaId: globalState.business.currentAreaId,

    period: alarmtimeType.value.dateRange.join(","),

    type: alarmtimeType.value.timeType,
  };

  let res = await statisticsSituation(params);

  contentList.value = contentList.value.map((item) => {
    return {
      ...item,

      value: +res[item.field],
    };
  });
};

const changeHandleOverviewTime = async () => {
  getAlarmEvent();
};

const getAlarmEvent = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,

    areaId: globalState.business.currentAreaId,

    period: overviewTime.value.dateRange.join(","),

    type: overviewTime.value.timeType,
  };

  const result = await alarmEventTypeStatisticsc(params);

  barData.xData = result.map((item) => item.name);

  barData.yData[0].data = result.map((item) => item.totalNum);

  eventDataList = result;
};

const getAlarmTrend = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,

    areaId: globalState.business.currentAreaId,

    period: trend.dateRange.join(","),

    type: trend.timeType,
  };

  let data: any = await alarmTrend(param);

  xData.arr = data.xdata;

  series[0].data = data.ydata;
};
</script>

<style lang="less" scoped>
.chart {
  height: 250px;

  margin: 20px 0;
}

.trend-chart {
  min-height: 150px;
}

.zoom-display-panel {
  padding: 30px;
}

.zoom-alarm-content {
  padding: 20px;

  .zoom-barChart {
    height: 400px;
  }
}

.zoom-trend-chart {
  padding: 20px;

  min-height: 400px;

  height: 380px;
}

.zoom-no-data {
  min-height: 380px;

  display: flex;

  align-items: center;

  justify-content: center;
}
</style>
