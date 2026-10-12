<template>
  <SubPanelTemplate title="设备分类统计"  class="supply-merchant">
    <div class="chart" :style="{ height: px2rem(chartHeight + 'px') }">
        <pieGuidance :y-data="yData"></pieGuidance>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import pieGuidance from "@/components/businessPanel/public/charts/pie/pie-guidance.vue"
import { onMounted, onUnmounted, ref } from 'vue';
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { getDeviceClass } from "@/mock/light"
import { px2rem } from '@/utils/common';

const props = withDefaults(defineProps<{
  fromPage: FromPageType;
  chartHeight?: number
}>(), {
  fromPage: 'PARK',
  chartHeight: 220
})

const colorList = ['#2AE8BD', '#2989FF']
const yData = ref<{name:string; value: number; color:string;}[]>([])

const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const chartData = ref<{ label: string; value: number; }[]>([]);

const getTemplateData = () => {
  // TODO  接口调用
  const { timeType } = trendTime.value
  chartData.value = getDeviceClass({formPage: props.fromPage, timeType: timeType as TimeType})

  yData.value = chartData.value.map((item, index) => {
    return {
      name: item.label,
      value: item.value,
      color: colorList[index] ?? '#2AE8BD'
    }
  })
}

// 模拟动态数据
let timer = null
let timeList = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR']
let index = 1
const changeTime = () => {
  timer = setInterval(() => {
    trendTime.value.timeType = timeList[index]
    getTemplateData()
    index++;
    if (index > timeList.length - 1) {
      index = 0
      // return
    }
  }, window.config.pageLoopRequestTime)
}

onMounted(() => {
  getTemplateData()
  changeTime()
})

onUnmounted(() => {
  clearInterval(timer)
})

</script>
<style lang="less" scoped>
.panel {

    .chart {
        height: 220px;
    }

}
</style>
  