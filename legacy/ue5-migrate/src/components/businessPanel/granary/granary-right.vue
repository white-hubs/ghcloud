<template>
  <SubPanelTemplate title="能耗态势">
    <template #extra>
      <DateInlineForm v-model:modelValue="overviewTime">
      </DateInlineForm>
    </template>
    <div class="monitorPanelBox">
      <monitorPanel v-for="(item, index) in monitorPanelData" :key="item.name" :monitorPanelData="item">
      </monitorPanel>
    </div>
    <div class="chart-title">园区用能趋势图</div>
    <div class="chart">
      <LineChart :x-data="receptionTrendsChartData.xData" :series="receptionTrendsChartData.yData" :showLegend="false"
        gridTop="15" :unit="{ x: '', y: '' }" />
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="安防统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="overviewTime1">
      </DateInlineForm>
    </template>
    <div class="monitorPanelBox">
      <monitorPanel v-for="(item, index) in courtData" :key="item.name" :monitorPanelData="item"></monitorPanel>
    </div>
    <div class="bar-chart">
      <overviewChartBar :bottom="'0%'" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="生产设备" class="device-count">
    <DeviceStatistics imgPath="business-icon/triage-queue/6.png" :statistic="deviceStatisticsData"></DeviceStatistics>
    <div class="device-count-chart">
      <elevator-analysis-pie style="width: 50%; height: 1.0416rem" :radius="'75'" :pieData="pieData">
        <div style="color: #fff; text-align: center; font-size: 0.072rem">{{ deviceStatisticsData.total }}</div>
        <div style="color: #fff; text-align: center; font-size: 0.072rem">设备总数</div>
      </elevator-analysis-pie>
      <elevatorAnalysisList :contentList="pieData" style="width: 50%;">
      </elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import monitorPanel from "@/components/businessPanel/hospital/monitor-panel.vue"
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue";
import DeviceStatistics from "@/components/businessPanel/security-overview/components/device-statistics.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";

import { ModelValueItf } from '../public/types'

const monitorPanelData = ref([
  {
    imgPath: 'overView24.png',
    value: 3222,
    name: '综合能耗tce'
  },
  {
    imgPath: 'overView35.png',
    value: 313,
    name: '碳排量tCO2e'
  },
])
const pieData = ref([
  {
    name:'温湿度传感器',
    value:23,
    color:'#3590FF',
  },
  {
    name:'烘干机',
    value:23,
    color:'#FFC700',
  },
  {
    name:'熏蒸设备',
    value:23,
    color:'#2AE8BD',
  },
  {
    name:'其他',
    value:23,
    color:'#19F8F7',
  },
]);
const receptionTrendsChartData = reactive({
  xData: ['11-18','11-19','11-20','11-21','11-22','11-23'],
  yData: [
    { 
    data: [10,13,15,20,18,14,10],
    linearGradientColor: ['rgba(21, 104, 255, 0.6)', 'rgba(34, 174, 230, 0)'], lineColor: '#1578FF' },
  ],
  yUnits: 'kw·h'
})
const deviceStatisticsData = reactive({
  title: "生产设备总数",
  total: 345,
  itemize: [
    {
      label: "在线数",
      value: 322,
      color: '#2AE8BD'
    },
    {
      label: "离线数",
      value: 23,
      color: '#FFAB10'
    },
  ],
});
const overviewTime = ref<ModelValueItf>()
const overviewTime1 = ref<ModelValueItf>()
const courtData = ref([
  {
    imgPath: 'overView103.png',
    value: '233',
    unit:'天',
    name: '安全运行天数',
    chainRatio:undefined
  },
  {
    imgPath: 'overView102.png',
    value: '115',
    unit:'个',
    name: '报警总数',
    chainRatio:5
  },
])
const barData = reactive({
  xData: [  '门禁报警','消防报警','安防报警','其他'],
  yData: [
    {
      data: [37,19,53,6],
      name: '',
      color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
    }
  ]
})
</script>
<style lang="less" scoped>
.monitorPanelBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-title {
  font-size: 12px;
  color: #fff;
}

.bar-chart {
  height: 220px;
}

.device-count-chart {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>