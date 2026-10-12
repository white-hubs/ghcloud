<template>
  <div >
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
import RatePie from "@/components/businessPanel/public/charts/ratePie/ratePie.vue";
import { ModelValueItf } from "../../public/types";
import { storeArea } from "@/piniaStore/area";
import { alarmStatistics, statisticsLevel, statisticsTrend } from "@/api/alarm";
import { AlarmLevelType, AlarmAreaTop } from "@/api/models/alarm";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { storeMenu } from "@/piniaStore/menu";
const piniaStoreMenu = storeMenu();
interface AlarmHandlType {
  list: AlarmAreaTop[];
}
const msg = ref("hello vue3!");
let timer: any = reactive(null);
const piniaStoreArea = storeArea();
let timeFrame = ref<ModelValueItf>();
let topTimeFrame = ref<ModelValueItf>();
let handleTime = ref<ModelValueItf>();
let xData = ref<string[]>(["周一", "周二", "周三", "周四", "周五", "周六", "周日"]);
let yData = ref<number[]>([ 60,10,20, 50, 70,30, 40, ]);
const fakeData = ref<AlarmLevelType[]>([
    {
        "code": "one_level",
        "name": "一级报警",
        "alarmNum": 10,
        "chainRatio": 8,
        "isGrow": false
    },
    {
        "code": "two_level",
        "name": "二级报警",
        "alarmNum": 14,
        "chainRatio": 3,
        "isGrow": false
    },
    {
        "code": "three_level",
        "name": "三级报警",
        "alarmNum": 21,
        "chainRatio": 10,
        "isGrow": false
    },
    {
        "code": "four_level",
        "name": "四级报警",
        "alarmNum": 7,
        "chainRatio": 10,
        "isGrow": false
    }
]);
let alarmProportion = ref({
  handle: 20,
  really: 30,
});

// 报警统计
function changeTimeFrame() {
}
// 报警级别分布
function changeTopTimeFrame() {
}

// 报警趋势
function changeHandleTime() {
}
let lineChart = ref();

const init = () => {
};

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
    height: 220px;
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
