<template>
  <SubPanelTemplate title="司法数据统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="energyOverviewTime" @search="changeHandleEnergyOverviewTime">
      </DateInlineForm>
    </template>
    <overviewPanel :overPanelData="overPanelData">
    </overviewPanel>
    <div class="tab-container">
      <Tabs :tabsList="tabState.tabList" v-model:active="tabState.active" @change="handleTabChange" />
    </div>
    <div class="line-chart">
      <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles" gridTop="15"
        :unit="{ x: '', y: '' }" :axisPointer="true" />
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="民事案件发布">
    <div class="elevator-analysis">
      <div class="chart">
        <elevator-analysis-pie :pieData="detectionData">
          <div style="color: #fff;text-align: center;font-size: 14px;">999</div>
          <div style="color: #fff;text-align: center;font-size: 10px;">案件数</div>
        </elevator-analysis-pie>
      </div>
      <elevatorAnalysisList :showRatio="true" :contentList="detectionData" class="pie_list"></elevatorAnalysisList>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="案件积压预警">
    <div class="bar-chart">
      <overviewChartBar :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import overviewPanel from "@/components/businessPanel/court-panel/court-overview/components/overview-panel.vue"
import { ModelValueItf } from '../../public/types'
import Tabs from '@/components/businessPanel/court-panel/judicial-space/components/tabs.vue'
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue";

const energyOverviewTime = ref<ModelValueItf>()
const xData = ref<string[]>(['旧存','新收','结案','未结'])
const titles = ref<string[]>(['民事','刑事','行政','执行'])
const yData = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([
{
    name: '民事',
    data: [2700, 13000, 9000, 4000],
    showSymbol: false,
    smooth: true,
  },{
    name: '行政',
    data: [400, 3000, 3000, 2500],
    showSymbol: false,
    smooth: true,
  },{
    name: '刑事',
    data: [200, 300,2700, 2000],
    showSymbol: false,
    smooth: true,
  },
  {
    name: '执行',
    data: [900, 8000, 7000, 3500],
  }
])
const barData = reactive({
  xData: ['1-2年未结案','2-3年未结案','3年及以上'],
  yData: [
    {
      data: [289,143,211],
      name: '案件预案数',
      color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
    }
  ]
})
const tabState=reactive({
  active: 'court',
  tabList:[
    {
      label:'法院',
      value:'court'
    },
    {
      label:'调解室',
      value:'mediation'
    },
    {
      label:'诉服大厅',
      value:'litigation'
    },
    {
      label:'信访大厅',
      value:'petition'
    }
  ]
})
const overPanelData = reactive({
  tittle: '受理数',
  rate:-10,
  total: 35269,

  panelData1: 4768,
  panelName1: '旧存数',
  panelRatio1: 207,

  panelData2: 10501,
  panelRatio2: -29.9,
  panelName2: '新收数',

  panelData3: 22463,
  panelRatio3: -38,
  panelName3: '结案数',

  panelData4: 12805,
  panelRatio4: -45.68,
  panelName4: '未结数',
})
const detectionData = ref([
  {
    name:'立案',
    value:189,
    color:'#29C2FF'
  },
  {
    name:'审理中',
    value:299,
    color:'#FFAB10'
  },
  {
    name:'判决',
    value:209,
    color:'#2989FF'
  },
  {
    name:'执行',
    value:269,
    color:'#19F8F7'
  },
  {
    name:'上诉',
    value:33,
    color:'#2AE8BD'
  },
])
const changeHandleEnergyOverviewTime = ()=>{
  
}
const handleTabChange=(value:string, tab)=>{
  // spaceAreaData.value = spaceAreaDataList.find((e) => e.type === value)
}
</script>
<style lang="less" scoped>
.tab-container {
  margin-top: 10px;
  display: flex;
  padding-right: 14px;
  justify-self: flex-end;
}

.line-chart {
  height: 200px;
}

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px;
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

.bar-chart {
  height: 200px;
}
</style>