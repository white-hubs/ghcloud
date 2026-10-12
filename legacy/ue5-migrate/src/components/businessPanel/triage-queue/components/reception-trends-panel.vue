<template>
  <SubPanelTemplate title="接诊趋势">
    <template #extra>
      <DateInlineForm v-model:modelValue="receptionTrendsTime" @search="getReceptionTrends"></DateInlineForm>
    </template>
    <div :style="{ height: px2rem(chartHeight + 'px') }">
      <LineChart :x-data="receptionTrendsChartData.xData" :series="receptionTrendsChartData.yData" :showLegend="false"
        gridTop="20" :unit="{ x: '', y: '人次' }" />
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { onMounted, reactive, ref } from 'vue';
import { ModelValueItf } from "../../public/types";
import { px2rem } from '@/utils/common'
import { receptionTrends } from '@/api/consultation-data'
import { useStateStore } from "@/pages/state/use-state-store";
const { globalState } = useStateStore()

const props = withDefaults(defineProps<{
  chartHeight?: number
}>(), {
  chartHeight: 180
})

/**
 * 接诊趋势
 */
 const getReceptionTrends=async()=>{
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: receptionTrendsTime.value.dateRange.join(","),
    type: receptionTrendsTime.value.timeType,
  };
  const res=await receptionTrends(params)
  receptionTrendsChartData.xData=res.xtitle
  receptionTrendsChartData.yData[0].data=[]
  res.receptionTrends.forEach(item=>{
    item.visitNum?receptionTrendsChartData.yData[0].data.push(item.visitNum):receptionTrendsChartData.yData[0].data.push(0)
  })
}
const receptionTrendsTime = ref<ModelValueItf>();

const receptionTrendsChartData = reactive({
  xData: [],
  yData: [
    { data: [], linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)' },
  ]
})


onMounted(() => {
})

</script>
<style scoped lang="less"></style>