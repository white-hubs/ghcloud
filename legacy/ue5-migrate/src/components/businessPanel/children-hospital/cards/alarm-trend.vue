<template>
  <SubPanelTemplate title="报警趋势" class="fire-alarm">
    <template #extra>
      <DateInlineForm v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame"></DateInlineForm>
    </template>
    <a-radio-group @change="changeTopTimeFrame" class="body-num" v-model:value="alarmTrend" button-style="solid">
      <a-radio-button value="trend">设备报警趋势</a-radio-button>
      <a-radio-button value="statistics">区域报警统计</a-radio-button>
    </a-radio-group>
    <div class="body">
      <GridContainer @clickItem="clickItem" :data="alarmStatusData"></GridContainer>
      <div class="chart" v-if="alarmTrend === 'trend'">
        <stackedLine :title="lineData.title" :yData="lineData.yData" :xData="lineData.xData" :color="['#2989FF', '#FF6E23']"></stackedLine>
      </div>
      <div v-else="alarmTrend === 'statistics'" class="chart">
        <overviewChartBar :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import { statisticsStatus } from "@/api/alarm";
import { deviceAlarmArea, deviceAlarmTrend } from "@/api/device";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue";
import stackedLine from "@/components/businessPanel/public/charts/stackedLine/stackedLine.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import GridContainer from "@/components/businessPanel/public/gridContainer.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { useStateStore } from "@/pages/state/use-state-store";

const emit = defineEmits(["open-modal"]);
const { globalState } = useStateStore();

const topTimeFrame = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: [],
});
const alarmTrend = ref("trend");
const alarmStatusData = ref<any[]>([]);
const lineData = reactive({
  title: "次",
  xData: [] as string[],
  yData: [] as any[],
});
const barData = reactive({
  xData: ["安防报警", "消防报警", "电气报警", "入侵报警"] as string[],
  yData: [
    {
      data: [10, 20, 30, 40],
      name: "区域",
    },
  ] as any[],
});
let colorList = ["#2AE8BD", "#99C7FF", "#FFC700", "#F14545"];

const clickItem = (data: any) => {
  emit("open-modal", {
    alarmStatus: data.alarmStatus,
    dateRange: topTimeFrame.value.dateRange,
  });
};

const changeTopTimeFrame = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: topTimeFrame.value.dateRange.join(","),
    type: topTimeFrame.value.timeType,
  };

  let Status = await statisticsStatus(params);
  let Trend = await deviceAlarmTrend(params);
  lineData.yData = [];
  lineData.xData = [];
  for (const key in Trend) {
    let obj = {
      data: [] as number[],
      name: "",
    };
    lineData.xData = Trend[key].map((item: any) => {
      if (params.type === "TODAY") {
        item.period += "时";
      } else if (params.type === "THIS_YEAR") {
        item.period += "月";
      } else {
        item.period += "号";
      }
      return item.period;
    });
    obj.data = Trend[key].map((item: any) => {
      return item.alarmNum;
    });
    obj.name = key;
    lineData.yData.push(obj);
  }
  alarmStatusData.value = Status.alarmStatusStatistics.map((item: any, index: number) => {
    item.color = colorList[index];
    return item;
  });
  let area = await deviceAlarmArea(params);
  barData.xData = [];
  barData.yData = [];
  let data: number[] = [];
  area.forEach((item: any) => {
    barData.xData.push(item.name);
    data.push(item.num);
  });
  barData.yData.push({
    name: "区域",
    data,
  });
};

onMounted(() => {
  changeTopTimeFrame();
});
</script>

<style lang="less" scoped>
.chart {
  height: 240px;
}

.body-num {
  margin-bottom: 10px;
}

:deep(.ant-radio-button-wrapper) {
  background: none;
  border: none;
  color: #fff;
}

:deep(.ant-radio-button-wrapper-checked) {
  background: linear-gradient(180deg, rgba(41, 137, 255, 0.4) 0%, rgba(41, 137, 255, 0.8) 100%) !important;
}
</style>
