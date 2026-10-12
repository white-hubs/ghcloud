<template>
  <SubPanelTemplate title="报警统计">
    <div class="header">
      <DateInlineForm v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame"></DateInlineForm>
    </div>
    <div class="body">
      <OperateDays title="报警总数" :value="alarmCon.count" class="body-num">
        <div class="extra flex-start">
          <div class="mode">环比</div>
          <div :class="['downtriangle', alarmCon.ratio > 0 && 'uptriangle']"></div>
          <div :class="[alarmCon.ratio < 0 ? 'down' : 'up']">{{ alarmCon.ratio }}%</div>
        </div>
      </OperateDays>
      <GridContainer :data="alarmStatusData"></GridContainer>
      <div class="chart">
        <LineChart
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
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, onBeforeUnmount, reactive } from "vue";

import DateInlineForm from "../../public/dateInlineForm.vue";
import GridContainer from "../../public/gridContainer.vue";
import LineChart from "../../public/lineChart.vue";
import OperateDays from "../../public/operateDays.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { ModelValueItf } from "../../public/types";
import { statisticsTrend, statisticsStatus } from "@/api/alarm";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
let topTimeFrame = ref<ModelValueItf>();

const alarmCon = ref({
  count: 0,
  ratio: 10,
});

const colorList = ["#FFC700", "#74AEE7", "#00F27B", "#29C2FF"];
let alarmStatusData = ref([]);
let xData = ref<string[]>([]);
let yData = ref<number[]>([]);
let timer: any = reactive(null);

watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(
      () => {
        init();
      },
      (window as any).config.pageLoopRequestTime,
    );
    init();
  },
);

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

function init() {
  getAlarmsNumber();
}
onMounted(() => {
  init();
  timer = setInterval(
    () => {
      init();
    },
    (window as any).config.pageLoopRequestTime,
  );
});
onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>

<style lang="less" scoped>
.body-num {
  margin: 10px 0;
}
</style>
