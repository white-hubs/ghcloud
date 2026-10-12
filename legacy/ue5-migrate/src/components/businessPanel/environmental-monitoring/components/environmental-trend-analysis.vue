<template>
  <SubPanelTemplate :title="props.title">
    <LineChart class="chart" :x-data="xData.arr" :series="series" :showLegend="false"
      gridTop="20" :unit="{ x: '', y: 'PM2.5' }"  :titles="['PM2.5']"/>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { environmentalStatTrend } from '@/api/securitymanagement'

const props = withDefaults(defineProps<{
title?: string;
}>(), {
title: '实时环境指标趋势分析'
})
const topTimeFrame = ref({
timeType:'THIS_YEAR',
dateRange:[]
});
const xData = reactive({
  arr: [],
});
const series = reactive([
  {
    data: [],
    name:'PM2.5',
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);

const changeTopTimeFrame = async ()=>{
 const res = await environmentalStatTrend({periodType:'TODAY'})
 xData.arr = res.map(e=>e.trendX)
 series[0].data = res.map(e=>e.trendY)
}
onMounted(()=>{
  changeTopTimeFrame()
})
</script>
<style lang="less" scoped>
.chart{
  height: 220px;
}
</style>