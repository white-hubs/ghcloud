<template>
  <SubPanelTemplate title="故障类型统计" class="waiting-situation">
    <div :style="{ height: px2rem(chartHeight + 'px') }">
      <HorizontalBar :x-data="waitingSituationChartData.xData" :y-data="waitingSituationChartData.yData" />
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import HorizontalBar from "@/components/businessPanel/public/charts/horizontal-bar/horizontal-bar.vue";
import { onMounted, onUnmounted, reactive } from 'vue';
import { px2rem } from '@/utils/common'

const props = withDefaults(defineProps<{
  chartHeight?: number
}>(), {
  chartHeight: 220
})
/**
* 故障类型
*/
const waitingSituationChartData = reactive({
  xData: [{ name: '', value: [820, 832, 901, 934, 1290, 1330, 1320, 934, 1290] }],
  yData: ['总线短路', '主机无输出', '按分机无反应', '主机无声音', '红灯不亮', '红灯不亮', '分机盒绿灯常亮'],
})

let timer = null
const fakeData = [
  [820, 832, 901, 934, 1290, 1330, 1320, 934, 1290],
  [620, 732, 951, 634, 1390, 1430, 820, 734, 590],
  [620, 842, 941, 734, 1210, 1320, 720, 834, 690],
  [420, 632, 921, 534, 1390, 1310, 1220, 534, 1290],
  [520, 532, 941, 234, 1210, 930, 920, 934, 990],
]
let fakeIndex = 1
onMounted(() => {
  timer = setInterval(() => {
    waitingSituationChartData.xData[0].value = fakeData[fakeIndex]
    fakeIndex++
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
<style scoped lang="less">
.waiting-situation {
  :deep(.char-dom) {
    height: 300px !important;
  }
}
</style>