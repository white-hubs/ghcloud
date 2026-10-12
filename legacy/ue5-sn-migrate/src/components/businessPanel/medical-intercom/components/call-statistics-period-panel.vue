<template>
  <SubPanelTemplate title="呼叫时段分布">
    <template #extra>
      <DateInlineForm v-model:modelValue="receptionTrendsTime" @search="changeReceptionTrendsTime"></DateInlineForm>
    </template>
    <div :style="{ height: px2rem(chartHeight + 'px') }">
      <div class="chart">
          <overviewChartBar :title="'次数'" :xData="barData.xData" :yData="barData.yData" :x-font-size="10.5"></overviewChartBar>
      </div>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import Bar3D from "@/components/businessPanel/public/charts/bar/bar3D.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { getXaxleData } from '@/utils/common'
import { LiveStreamingSessions } from '@/mock/surgical-demonstration'
import { px2rem } from '@/utils/common';
import overviewChartBar from "../../hospital/overview-chartBar.vue"

/**
 * 呼叫时段
 */
const props = withDefaults(defineProps<{
  chartHeight?: number
}>(), {
  chartHeight: 240
})
const receptionTrendsChartData = reactive({
  xData: ['0-4h', '5-8h', '9-12h', '13-16h', '17-20h', '21-24h'],
  yData: [
    { data: [30, 60, 170, 180, 120, 75] },
  ]
})
const barData = reactive({
    xData: [],
    yData: [
        {
            data: [10, 20, 30, 40],
            name: '',
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        }
    ]
})

const receptionTrendsTime = ref<ModelValueItf>();
const changeReceptionTrendsTime = (): void => {
  receptionTrendsChartData.xData = getXaxleData('THIS_PERID')
  receptionTrendsChartData.yData[0].data = LiveStreamingSessions(receptionTrendsTime.value.timeType)

  barData.xData = getXaxleData('')
  barData.yData[0].data = LiveStreamingSessions(receptionTrendsTime.value.timeType)
}
let timer = null
let fakeData = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR']
let fakeIndex = 1
onMounted(() => {
  timer = setInterval(() => {
    receptionTrendsTime.value.timeType = fakeData[fakeIndex]
    changeReceptionTrendsTime()
    fakeIndex++;
    if (fakeIndex > fakeData.length - 1) {
      clearInterval(timer)
      fakeIndex = 0
    }
  }, (window as any).config.pageLoopRequestTime)
})
onUnmounted(() => {
  clearInterval(timer)
})

</script>
<style scoped lang="less">
.chart {
    height: 220px;
}
</style>