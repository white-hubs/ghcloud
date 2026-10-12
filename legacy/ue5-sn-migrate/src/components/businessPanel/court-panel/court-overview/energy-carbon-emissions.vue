<template>
  <SubPanelTemplate title="能源碳排放">
    <template #extra>
      <DateInlineForm v-model:modelValue="canCarbonTime" @search="changeCanCarbonTime"></DateInlineForm>
    </template>
    <div class="monitorPanelBox">
      <monitorPanel v-for="(item, index) in monitorPanelData" :key="item.name" :monitorPanelData="item"></monitorPanel>
    </div>
  </SubPanelTemplate>
  <childLevelSubPanel title="院区用能趋势图" class="child-level">
    <template #extra>
      <DateInlineForm :timeList="timeList" v-model:modelValue="receptionTrendsTime" @search="changeReceptionTrendsTime">
      </DateInlineForm>
    </template>
    <div class="line-chart">
      <LineChart :x-data="receptionTrendsChartData.xData" :series="receptionTrendsChartData.yData" :showLegend="false"
        gridTop="5" :unit="{ x: '', y: '万' }" />
    </div>
  </childLevelSubPanel>
  <SubPanelTemplate title="院区安全汇总">
    <template #extra>
      <DateInlineForm v-model:modelValue="canCarbonTime" @search="changeCanCarbonTime"></DateInlineForm>
    </template>
    <div class="monitorPanelBox">
      <monitorPanel v-for="(item, index) in courtData" :key="item.name" :monitorPanelData="item"></monitorPanel>
    </div>
    <childLevelSubPanel title="安全报警统计" class="child-level">
      <div class="chart">
        <overviewChartBar :bottom="'0%'" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
      </div>
    </childLevelSubPanel>
  </SubPanelTemplate>
  <SubPanelTemplate title="建筑设施设备">
    <!-- <DeviceStatistics imgPath="overView5.png" :statistic="deviceStatisticsRecordData">
    </DeviceStatistics> -->
    <div class="elevator-analysis">
      <div class="chart">
        <elevator-analysis-pie :pieData="detectionData">
          <div style="color: #fff;text-align: center;font-size: 14px;">231</div>
          <div style="color: #fff;text-align: center;font-size: 10px;">设备总数</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList :showRatio="true" :contentList="detectionData" class="pie_list"></elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import { getAssetsImage } from '@/utils/getImage';
import monitorPanel from "./components/monitor-panel.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import childLevelSubPanel from "@/components/businessPanel/public/childLevelSubPanel.vue";
import { ModelValueItf } from '../../public/types'
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import DeviceStatistics from "@/components/businessPanel/security-monitoring-safty/device-statistics.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue";

const canCarbonTime = ref<ModelValueItf>()
const receptionTrendsTime = ref<ModelValueItf>({
  timeType: 'electricity',
  dateRange: []
});
const receptionTrendsChartData = reactive({
  xData: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  yData: [
    { data: [10,21,43,13,54,65,76,87,98,109,120,131], linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)' },
  ]
})
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
const detectionData = ref([
  {
    name:'监控设备',
    value:94,
    color:'#EC5F67'
  },
  {
    name:'消防设备',
    value:105,
    color:'#FFAB10'
  },
  {
    name:'门禁设备',
    value:26,
    color:'#2989FF'
  },
  {
    name:'其他',
    value:6,
    color:'#19F8F7'
  }
])
const timeList = [
  { label: "电", value: "electricity" },
  { label: "水", value: "water" },
  { label: "气", value: "gas" },
  { label: "碳排放", value: "carbon" },
]
const deviceStatisticsRecordData = reactive({
  title: "设施设备总数",
  total: 231,
  itemize: [
    {
      name: "在线设备数：",
      label: "离线设备数：",
      value: 229,
      offline: 2,
      key: "OFFLINE",
    },
  ],
});
const monitorPanelData = ref([
  {
    imgPath: 'overView101.png',
    value: '23452',
    unit:'tce',
    name: '综合能耗',
    chainRatio:-10
    
  },
  {
    imgPath: 'overView35.png',
    value: '23421',
    unit:'kgco2e',
    name: '碳排量',
    chainRatio:-8
  },
])
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
const changeCanCarbonTime = () => {
  
}
const changeReceptionTrendsTime = () => {
  
}
</script>
<style lang="less" scoped>
.monitorPanelBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 20px;

  :deep(.monitorPanel-right) {
    min-width: 80px;
  }
}

.chart {
  height: 150px;
}
.line-chart{
  height: 180px;
}
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0px 10px;
  align-items: center;

  .pie_list {
    width: 180px;
    height: 180px;

    // margin-left: 10px;
    :deep(.alarm-analysis-name) {
      width: 90px;
    }

    :deep(.alarm-analysisBox) {
      width: auto;
    }
  }

  .chart {
    flex: 1;
    height: 140px;
  }
}

.child-level {
  :deep(.time-type) {
    width: 50px !important;
  }
}

:deep(.sub-panel-content) {
  padding: 0 !important;
}
</style>