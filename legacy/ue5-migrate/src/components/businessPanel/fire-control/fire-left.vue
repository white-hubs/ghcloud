<template>
  <div >
    <SubPanelTemplate title="消防报警" class="fire-alarm">
      <template #extra>
        <DateInlineForm v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame"></DateInlineForm>
      </template>
      <div class="body">
        <OperateDays title="报警数" :value="alarmCon.count" class="body-num">
          <div class="extra flex-start">
            <div class="mode">环比</div>
            <div :class="['downtriangle', alarmCon.ratio > 0 && 'uptriangle']"></div>
            <div :class="[alarmCon.ratio < 0 ? 'down' : 'up']">{{ alarmCon.ratio }}%</div>
          </div>
        </OperateDays>
        <GridContainer :data="alarmStatusData"></GridContainer>
        <div class="chart">
          <LineChart :x-data="xData" :series="[
              {
                data: yData,
                linearGradientColor: ['rgb(86, 142, 255)', 'rgb(86, 142, 255,0)'],
              },
            ]" />
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警区域Top5">
      <template #extra>
        <DateInlineForm v-model:modelValue="areaAlarmDate" @search="changeAreaAlarmDate" />
      </template>
      <div class="body" style="min-height: 250px;" v-show="eventAlarmData.list.length > 0">
        <EventAlarmItem v-for="(item, index) in eventAlarmData.list" :key="index" :sort="index + 1" :name="item.name"
          :linkRatio="item.chainRatio" :count="item.alarmNum" :ratio="item.ratio + '%'" />
      </div>
      <div class="body" style="min-height: 250px;" v-show="eventAlarmData.list.length <= 0">
        <noData></noData>
      </div>
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import OperateDays from "../public/operateDays.vue";
import GridContainer from "../public/gridContainer.vue";
import LineChart from "../public/lineChart.vue";
import noData from '@/components/businessPanel/public/noData.vue'
import EventAlarmItem from '../public/eventAlarmItem.vue';
import { AlarmAreaTop, AlarmLevelType } from "@/api/models/alarm";
import { ModelValueItf } from "../public/types";
import { statisticsLevel, statisticsTrend, statisticsStatus, statisticsAreaTop } from "@/api/alarm";
import { ref, onMounted, watch, onBeforeUnmount, reactive } from "vue";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
let timeFrame = ref<ModelValueItf>();
let topTimeFrame = ref<ModelValueItf>();
const areaAlarmDate = ref<ModelValueItf>()
const alarmCon = ref({
  count: 0,
  ratio: 10,
});
const colorList = ["#FFC700", "#74AEE7", "#00F27B", "#29C2FF"];
let eventAlarmData = reactive<{ list: AlarmAreaTop[] }>({
    list: []
})
let alarmStatusData = ref([]);
let xData = ref<string[]>([]);
let yData = ref<number[]>([]);
let timer: any = reactive(null);
const fakeData = ref<AlarmLevelType[]>([
  {
    alarmNum: 0,
    name: "一级报警",
    chainRatio: 0,
    isGrow: false,
  },
]);
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
// 报警区域事件
function changeAreaAlarmDate() {
    getAreaAlarm()
}
// 获取报警区域top5
async function getAreaAlarm() {
    let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: areaAlarmDate.value.dateRange.join(','),
        type: areaAlarmDate.value.timeType
    }
    eventAlarmData.list = await statisticsAreaTop(params)
}
// 报警级别分布
function changeTimeFrame() {
  getAlarmLevel();
}
// 消防报警
function changeTopTimeFrame() {
  getAlarmsNumber();
}
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
  let Status = await statisticsStatus(params);
  let Trend = await statisticsTrend(params);
  alarmStatusData.value = Status.alarmStatusStatistics.map((item, index) => {
    item.color = colorList[index];
    return item;
  });
  alarmCon.value = {
    count: Status.alarmNum,
    ratio: Status.chainRatio,
  };
  Trend.forEach((item) => {
    let time = "";
    if (params.type === "TODAY") {
      time = "时";
    } else if (params.type === "THIS_YEAR") {
      time = "月";
    } else {
      time = "号";
    }
    xData.value.push(item.period + time);
    yData.value.push(item.alarmNum);
  });
}
// 获取报警级别分布数据
async function getAlarmLevel() {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: timeFrame.value.dateRange.join(","),
    type: timeFrame.value.timeType,
  };
  let res = await statisticsLevel(params);
  // let res = await mockAlarmLevel({'timeType': timeFrame.value.timeType as TimeType});
  fakeData.value = res.map((item) => {
    item.chainRatio <= 0 ? (item.isGrow = false) : (item.isGrow = true);
    item.name += "报警";
    return item;
  });
}
function init() {
  getAlarmLevel();
  getAlarmsNumber();
}
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
.body-num {
  margin: 10px 0;
}

.fire-alarm {
  .chart {
    height: 220px;
  }
}

.alarm-level {
  .chart {
    display: flex;
    height: 150px;
  }

  .footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}
</style>
