<template>
  <div >
    <SubPanelTemplate title="人流通行趋势">
      <template #extra>
        <DateInlineForm v-model:modelValue="through" @search="abnormalPassageInfo"></DateInlineForm>
      </template>
        <OperateDays :value="numberPasses" title="通行总次数"> </OperateDays>
      <div class="chart">
        <LineChart :x-data="ecahrtsData.xData" :series="[
            {
              data: ecahrtsData.yData,
              linearGradientColor: ['rgb(255, 162, 0.1)', 'rgb(255, 222, 165,1)'],
            },
          ]" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="通行分析" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="throughType" @search="trafficAnalysisInfo"></DateInlineForm>
      </template>
      <div class="equipmentAlarm" v-show="roundPieData.arr.length > 0">
        <planPie :pie-data="roundPieData.arr">
          <div class="content">
            <div class="pie-center">{{ throughNum }}</div>
            <div>通行总数</div>
          </div>
        </planPie>
        <pieList :roundPieData="roundPieData.arr"></pieList>
      </div>
      <div class="equipmentAlarm" v-show="roundPieData.arr.length <= 0">
        <noData></noData>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="车流趋势">
      <template #extra>
        <DateInlineForm v-model:modelValue="timeType" @search="trafficFlowTrendData"></DateInlineForm>
      </template>
      <div class="trafficBox">
        <traffic v-for="item in trafficList" :key="item.color" :trafficInfo="item"></traffic>
      </div>
      <div class="chart">
        <stackedLine :title="lineData.title" :yData="lineData.yData" :xData="lineData.xData"
          :color="['#2989FF', '#FF6E23']"></stackedLine>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import OperateDays from "../public/operateDays.vue";
import LineChart from "../public/lineChart.vue";
import { abnormalPassage, trafficAnalysis } from '@/utils/requestData/accessControl'
import noData from "@/components/businessPanel/public/noData.vue";
import planPie from "../public/charts/pie/planePie.vue";
import traffic from "../public/traffic.vue";
import stackedLine from "../public/charts/stackedLine/stackedLine.vue";
import pieList from "../public/pieList.vue";
import { trafficFlowTrend } from '@/utils/requestData/parkingSpaceManage'

let through = ref();
let throughType = ref();
const throughNum = ref(0);
let timeType = ref();
const ecahrtsData = reactive({
  xData: [],
  yData: [],
});
let numberPasses = ref(0);
const roundPieData = reactive({
  arr: [],
});
const lineData = reactive({
  title: "辆",
  xData: [],
  yData: [
    {
      data: [],
      name: "驶入",
      colors: [
        {
          offset: 0,
          color: "rgba(41, 137, 255, 1)",
        },
        {
          offset: 1,
          color: "rgba(41, 137, 255, 0.20)",
        },
      ],
    },
    {
      data: [],
      name: "驶出",
      colors: [
        {
          offset: 0,
          color: "rgba(255, 110, 35, 1)",
        },
        {
          offset: 1,
          color: "rgba(255, 110, 35, 0.02)",
        },
      ],
    },
  ],
});
const trafficList = reactive([
  {
    color: "#2989FF",
    label: "驶入",
    value: 0,
  },
  {
    color: "#FF6E23",
    label: "驶出",
    value: 0,
  },
]);
// 人流通行趋势
const abnormalPassageInfo = async () => {
  let res = await abnormalPassage(through.value.timeType, "DO_PASS");
  ecahrtsData.xData = res.xdata;
  ecahrtsData.yData = res.series[0].value;
  numberPasses.value = 0;
  res.series[0].value.forEach((item) => {
    numberPasses.value += item;
  });
};
// 通行分析
const trafficAnalysisInfo = async () => {
  let res = await trafficAnalysis(throughType.value.timeType);
  throughNum.value = res.total;
  roundPieData.arr = res.arr;
};
// 获取车流趋势信息
const trafficFlowTrendData = async () => {
  let res = await trafficFlowTrend({ dimension: timeType.value.timeType });
  lineData.xData = res.xdata;
  trafficList[0].value = res.series[0].total;
  trafficList[1].value = res.series[1].total;
  lineData.yData[0].data = res.series[0].value;
  lineData.yData[1].data = res.series[1].value;
};
</script>
<style lang="less" scoped>
.equipmentAlarm{
  .policeList{
    height: auto;
  }
}

.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;
  
  .content {
    text-align: center;
    color: #fff;
    font-size: 16px;
  }

  .pie-center {
    font-size: 18px;
    font-weight: bold;
  }
}
.trafficBox {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 12px;
}
.chart {
    height: 220px;
  }
</style>