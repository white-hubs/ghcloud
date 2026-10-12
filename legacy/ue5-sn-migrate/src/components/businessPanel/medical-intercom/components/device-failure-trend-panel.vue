<template>
  <SubPanelTemplate title="设备故障趋势">
    <template #extra>
      <DateInlineForm v-model:modelValue="deviceFailureTrendTime" @search="changeDeviceFailureTrendTime">
      </DateInlineForm>
    </template>
    <div :style="{ height: px2rem(chartHeight + 'px') }">
      <LineChart :x-data="deviceFailureTrendCharData.xData" :series="deviceFailureTrendCharData.yData" :showLegend="false"
        gridTop="15" :unit="{ x: '', y: '次' }" />
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { getXaxleData, px2rem } from '@/utils/common'

const props = withDefaults(defineProps<{
  chartHeight?: number
}>(), {
  chartHeight: 300
})

/**
 * 设备故障趋势
 */
const deviceFailureTrendTime = ref<ModelValueItf>();
const changeDeviceFailureTrendTime = (): void => {
  // TODO  接口调用
  deviceFailureTrendCharData.xData = getXaxleData(deviceFailureTrendTime.value.timeType)
  const { timeType } = deviceFailureTrendTime.value
  if (timeType === 'TODAY') {
    deviceFailureTrendCharData.yData[0].data = [0,0,0,0,0,10,20,40, 50, 20, 100, 120, 80, 60, 50, 50, 40, 50, 53, 55, 60, 50, 45, 48, 50]
  } else if (timeType === 'THIS_WEEK') {
    deviceFailureTrendCharData.yData[0].data = [0, 150, 220, 400, 350, 20, 100]
  } else if (timeType === 'THIS_MONTH') {
    deviceFailureTrendCharData.yData[0].data = [350, 350, 520, 633, 596, 520, 476, 479, 470, 386, 407, 420, 500, 440, 450, 380, 220]
  } else if (timeType === 'THIS_YEAR') {
    deviceFailureTrendCharData.yData[0].data = [110, 1350, 1520, 1700, 550, 280, 360]
  }
}
const deviceFailureTrendCharData = reactive({
  xData: getXaxleData('TODAY'),
  yData: [
    { data:  [10,10,10,10,10,0,0, 50, 20, 200, 150, 40, 10, 50], linearGradientColor: ['rgba(86, 142, 255, 1)', 'rgba(86, 142, 255, 0.1)'], lineColor: 'rgba(86, 142, 255, 1)' },
  ]
})


let timer = null
let fakeData = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR']
let fakeIndex = 1
onMounted(() => {
  timer = setInterval(() => {
    deviceFailureTrendTime.value.timeType = fakeData[fakeIndex]
    changeDeviceFailureTrendTime()
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