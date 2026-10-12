<template>
  <div>
    <SubPanelTemplate title="报警统计">
      <template #extra>
        <DateInlineForm v-model:modelValue="timeFrame" @search="changeTimeFrame" />
      </template>
      <div class="rate-pie-chart">
        <RatePie :value="alarmProportion.handle" title="报警处理占比" color="#5AD0EA" class="rate-pie" />
        <RatePie :value="alarmProportion.really" title="报警真实占比" class="rate-pie" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警级别统计" class="alarm-level">
      <template #extra>
        <DateInlineForm v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame"></DateInlineForm>
      </template>
      <div class="body">
        <div class="chart">
          <Pie3D :data="fakeData" label-key="name" value-key="alarmNum" />
        </div>
        <div class="footer">
          <AlarmStatisticsItem v-for="(item, index) in fakeData" :key="item.name" :level="index + 1"
            :alarmNum="item.alarmNum" :chainRatio="item.chainRatio" :name="item.name" :is-grow="item.isGrow" />
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警趋势" class="alarm-trend">
      <template #extra>
        <DateInlineForm v-model:modelValue="handleTime" @search="changeHandleTime"></DateInlineForm>
      </template>
      <div class="chart">
        <LineChart ref="lineChart" :x-data="xData" :series="[
            {
              data: yData,
              linearGradientColor: ['rgb(86, 142, 255)', 'rgb(86, 142, 255,0)'],
            },
          ]" />
      </div>
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import Pie3D from "@/components/businessPanel/public/charts/pie/pie.vue";
import AlarmStatisticsItem from "@/components/businessPanel/public/alarmStatisticsItem.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import RatePie from "../../public/charts/ratePie/ratePie.vue";
import { ModelValueItf } from "../../public/types";
import { alarmStatistics, statisticsLevel } from "@/api/alarm";
import { AlarmLevelType } from "@/api/models/alarm";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useStateStore } from "@/pages/state/use-state-store";
let timer: any = reactive(null);
const { globalState } = useStateStore()
let timeFrame = ref<ModelValueItf>();
let topTimeFrame = ref<ModelValueItf>();
let handleTime = ref<ModelValueItf>();
let xData = ref<string[]>([]);
let yData = ref<number[]>([]);
const fakeData = ref<AlarmLevelType[]>([
  {
    alarmNum: 0,
    name: "一级报警",
    chainRatio: 0,
    isGrow: false,
  },
]);
let alarmProportion = ref({
  handle: 0,
  really: 0,
});
watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
    init();
  }
);
// 报警统计
function changeTimeFrame() {
  getAlarmStatistics();
}
// 获取处理占比和真实占比
async function getAlarmStatistics() {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: timeFrame.value.dateRange.join(","),
  };
  let res: any = await alarmStatistics(params);
  if (res.alarmNum && res.alarmNum !== 0) {
    alarmProportion.value.really =
      Math.round((res.alarmActualNum / res.alarmNum) * 10000) / 100.0;
    alarmProportion.value.handle =
      Math.round((res.alarmHandlerNum / res.alarmNum) * 10000) / 100.0;
  } else {
    alarmProportion.value.really = 0;
    alarmProportion.value.handle = 0;
  }
}
// 报警级别分布
function changeTopTimeFrame() {
  getAlarmLevel();
}
// 获取报警级别分布数据
async function getAlarmLevel() {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: topTimeFrame.value.dateRange.join(","),
    type: topTimeFrame.value.timeType,
  };
  let res = await statisticsLevel(params);
  fakeData.value = res.map((item) => {
    item.chainRatio <= 0 ? (item.isGrow = false) : (item.isGrow = true);
    item.name += "报警";
    return item;
  });
}
// 报警趋势
function changeHandleTime() {
  getAlarmsNumber();
}
let lineChart = ref();
async function getAlarmsNumber() {
  xData.value = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  yData.value = [10,20,15,20,10,15,20,10,20,15,10,20];
  lineChart.value.render();
}
const init = () => {
  getAlarmLevel();
  getAlarmsNumber();
};
onMounted(() => {
  timer = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>
<style lang="less" scoped>
.panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
}

.chart {
  height: 140px;
  display: flex;
}

.alarm-trend {
  .chart {
    height: 180px;
  }
}

.alarm-level {
  .chart {
    display: flex;
    height: 140px;
  }

  .footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}

.rate-pie-chart {
  width: 100%;
  padding-top: 8px;
  padding-left: 32px;
  padding-right: 32px;
  display: flex;
  justify-content: space-between;
}
</style>
