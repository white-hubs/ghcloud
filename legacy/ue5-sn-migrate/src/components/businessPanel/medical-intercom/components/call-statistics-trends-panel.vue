<template>
  <SubPanelTemplate title="呼叫趋势">
    <template #extra>
      <DateInlineForm v-model:modelValue="receptionTrendsTime" @search="changeReceptionTrendsTime"></DateInlineForm>
    </template>
    <div :style="{ height: px2rem(chartHeight + 'px') }">
      <LineChart :x-data="receptionTrendsChartData.xData" :series="receptionTrendsChartData.yData" :showLegend="false"
        gridTop="15" :unit="{ x: '', y: '次数' }" />
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { getXaxleData } from '@/utils/common'
import { CallTrends } from '@/mock/surgical-demonstration'
import { px2rem } from '@/utils/common';
const props = withDefaults(defineProps<{
  chartHeight?: number
}>(), {
  chartHeight: 300
})
const receptionTrendsChartData = reactive({
  xData: ['4', '8', '12', '16', '20', '24h'],
  yData: [
    { data: [0, 0, 0, 0, 0, 0, 10, 50, 30, 40, 66, 24, 21, 36, 41, 22], showSymbol: true, smooth: false, linearGradientColor: ['rgba(86, 142, 255, 1)', 'rgba(86, 142, 255, 0.1)'], lineColor: 'rgba(86, 142, 255, 1)' },
  ]
})
/**
 * 接诊趋势
 */
const receptionTrendsTime = ref<ModelValueItf>();
const changeReceptionTrendsTime = (): void => {
  receptionTrendsChartData.xData = getXaxleData(receptionTrendsTime.value.timeType)
  receptionTrendsChartData.yData[0].data = CallTrends(receptionTrendsTime.value.timeType)
}


let timer = null
let fakeData = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR']
let fakeIndex = 1
onMounted(() => {
  timer = setInterval(() => {
    receptionTrendsTime.value.timeType = fakeData[fakeIndex]
    // changeReceptionTrendsTime()
    fakeIndex++;
    if (fakeIndex > fakeData.length - 1) {
      fakeIndex = 0
      clearInterval(timer)
    }
  }, (window as any).config.pageLoopRequestTime)
})
onUnmounted(() => {
  clearInterval(timer)
})

</script>
<style scoped lang="less"></style>