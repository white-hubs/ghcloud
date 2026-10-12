<template>
  <div >
    <component v-for="item in universalData" :is="item.value" :title="item.label"></component>
  </div>
</template>

<script setup lang="ts">
import CarbonEmissionRatio from "./components/carbon-emission-ratio.vue";//碳排量分类占比
import CarbonRankingTop10 from "./components/carbon-ranking-top10.vue";//区域综合能耗排名Top10
import CarbonRankingTop5 from "./components/carbon-ranking-top5.vue";//区域综合能耗排名Top5
import CarbonTrends from "./components/carbon-trends.vue";//碳排量趋势图
import EnergyConsumptionProportion from "./components/energy-consumption-proportion.vue";//综合能耗分类占比
import EnergyConsumptionTrend from "./components/energy-consumption-trend.vue";//能耗用能趋势图
import EnergyOverview from "./components/energy-overview.vue";//全年能耗概览
import EnergyRankingTop10 from "./components/energy-ranking-top10.vue";//区域用能排名Top10
import EnergyRankingTop5 from "./components/energy-ranking-top5.vue";//区域用能排名Top5
import EnergyStatistics from "./components/energy-statistics.vue";//能耗用能统计
import EnergyTrend from "./components/energy-trend.vue";//综合能耗趋势图
import RankingComprehensiveConsumptionTop10 from "./components/ranking-comprehensive-consumption-top10.vue";//区域碳排量排名Top10
import RankingComprehensiveConsumptionTop5 from "./components/ranking-comprehensive-consumption-top5.vue";//区域碳排量排名Top5
import SubProportion from "./components/sub-proportion.vue";//分项用能占比
import AnnualEnergyConsumptionTrend from "./components/annual-energy-consumption-trend.vue";//年度用能趋势图

import { ref,onMounted} from 'vue'
interface Props {
  universalPanelVo:{
	tableOneName: string;
	tableOne: string;
	tableTwoName: string;
	tableTwo: string;
	tableThreeName: string;
	tableThree: string;
  }
}
const componentObj = {
  CarbonEmissionRatio,
  CarbonRankingTop10,
  CarbonRankingTop5,
  CarbonTrends,    
  EnergyConsumptionProportion,
  EnergyConsumptionTrend,
  EnergyOverview,
  EnergyRankingTop10,
  EnergyRankingTop5,
  EnergyStatistics,
  EnergyTrend,
  RankingComprehensiveConsumptionTop10,
  RankingComprehensiveConsumptionTop5,
  SubProportion,
  AnnualEnergyConsumptionTrend
}
const props = withDefaults(defineProps<Props>(), {});
const universalData = ref([
  {
    value:componentObj['SubProportion'],
    label:'分项用能占比'
  },
  {
    value:componentObj['EnergyStatistics'],
    label:'能耗用能统计'
  },
  {
    value:componentObj['AnnualEnergyConsumptionTrend'],
    label:'年度用能趋势图'
  },
])

onMounted(()=>{
  if (props.universalPanelVo) {
    universalData.value = [
    {
      label: props.universalPanelVo.tableOneName,
      value: componentObj[props.universalPanelVo.tableOne]
    },
    {
      label: props.universalPanelVo.tableTwoName,
      value: componentObj[props.universalPanelVo.tableTwo]
    },
    {
      label: props.universalPanelVo.tableThreeName,
      value: componentObj[props.universalPanelVo.tableThree]
    },
  ]
  }
})
</script>
<style lang="less" scoped>
</style>