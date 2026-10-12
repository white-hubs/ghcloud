<template>
  <div>
    <SubPanelTemplate title="设备报警趋势">
      <template #extra>
        <DateInlineForm v-model:modelValue="topTimeFrame" @search="getAlarmsNumber"></DateInlineForm>
      </template>
      <div class="body">
        <OperateDays title="报警数" :value="alarmInfo.count" class="body-num">
          <div class="ringRatio">
            <span>环比</span>
            <!-- uptriangle 向上三角根据Prop改变 -->
            <div :class="['downtriangle', alarmInfo.ratio > 0 && 'uptriangle']"></div>
            <div :class="[alarmInfo.ratio > 0 ? 'up' : 'down']">
              {{ alarmInfo.ratio + "%" }}
            </div>
          </div>
        </OperateDays>
        <GridContainer :data="alarmStatusData"></GridContainer>
        <div class="chart">
          <LineChart
            :gridTop="'0'"
            :x-data="xData"
            :series="[
              {
                data: yData,
                linearGradientColor: ['rgb(86, 142, 255)', 'rgb(86, 142, 255,0)'],
              },
            ]"
          />
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="事件区域top5" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="handleTime" @search="areaAlarmStatistic"></DateInlineForm>
      </template>
      <div class="body" style="min-height: 190px">
        <EventAlarmItem
          v-for="(item, index) in areaAlarmRank"
          :sort="index + 1"
          :name="item.name"
          :linkRatio="item.chainRatio"
          :count="item.alarmNum"
          :ratio="item.ratio + '%'"
        />
      </div>
    </SubPanelTemplate>

    <WaterTreatmentRealtime />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import EventAlarmItem from "../public/eventAlarmItem.vue";
import GridContainer from "../public/gridContainer.vue";
import LineChart from "../public/lineChart.vue";
import OperateDays from "../public/operateDays.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import { ModelValueItf } from "../public/types";
import WaterTreatmentRealtime from "./cards/water-treatment-realtime.vue";
import { statisticsAreaTop } from "@/api/alarm";
import { AlarmAreaTop, AlarmStatus } from "@/api/models/alarm";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { useStateStore } from "@/pages/state/use-state-store";
import { alarmTrend, equipmentNumber } from "@/utils/requestData/alarm";

const { globalState } = useStateStore();
const topTimeFrame = ref<ModelValueItf>();
const handleTime = ref<ModelValueItf>();
const xData = ref<string[]>([]);
const yData = ref<number[]>([]);
const areaAlarmRank = ref<AlarmAreaTop[]>([]);
const alarmInfo = reactive({
  count: 0,
  ratio: 0,
});

const alarmStatusData = ref<AlarmStatus[]>([
  {
    alarmNum: 10,
    alarmStatus: "",
    alarmStatusName: "处理中",
    color: "#FFC700",
  },
  {
    alarmNum: 10,
    alarmStatus: "",
    alarmStatusName: "挂起",
    color: "#74AEE7",
  },
  {
    alarmNum: 10,
    alarmStatus: "",
    alarmStatusName: "已处理",
    color: "#00F27B",
  },
  {
    alarmNum: 10,
    alarmStatus: "",
    alarmStatusName: "待确认",
    color: "#29C2FF",
  },
]);
// 报警状态统计&报警趋势折线图统计
async function getAlarmsNumber() {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: topTimeFrame.value.dateRange.join(","),
    type: topTimeFrame.value.timeType,
  };
  xData.value.length = 0;
  yData.value.length = 0;
  let res: any = await alarmTrend(params);
  let data: any = await equipmentNumber(params);
  alarmStatusData.value = data.alarmStatusStatistics;
  xData.value = res.xdata;
  yData.value = res.ydata;
  Object.assign(alarmInfo, {
    count: data.alarmNum,
    ratio: data.chainRatio,
  });
}
/**
 * 区域报警Top5
 */
const areaAlarmStatistic = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: handleTime.value.dateRange.join(","),
    type: handleTime.value.timeType,
  };
  areaAlarmRank.value = await statisticsAreaTop(params);
};
</script>
<style lang="less" scoped>
.body-num {
  margin-bottom: 10px;
}

.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;
}

.chart {
  height: 180px;
}

.body-num {
  margin-bottom: 10px;
}
</style>
