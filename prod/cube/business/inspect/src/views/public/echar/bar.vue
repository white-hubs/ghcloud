<template>
  <div ref="chartDom" class="chart" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import type { ProportionOfPlanTypes } from '@/api/model/inspection'
const chartDom = ref();

const colors = ['#5654F5', '#4CA8FF', '#F53F3F', '#FBA33F', '#F53F3F', '#FBA33F']
const props = withDefaults(defineProps<{
  data:ProportionOfPlanTypes[] | undefined ;
}>(), {
  data: () => []
});
const render = () => {
  const seriesList = props.data?.map((item:ProportionOfPlanTypes, index:number) => {
    return {
      value: item.planNum,
      name: item.planType,
      color: colors[index]
    }
  })
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item'
    },
    colors,
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        label: {
          show: false,
          position: 'center'
        },
        labelLine: {
          show: false
        },
        data: seriesList
      }
    ]
  };
  const myChart = echarts.init(chartDom.value)
  option && myChart.setOption(option)
};

watch(
  () => [...props.data], () => {
    render()
  }
);
onMounted(() => {
  render()
});
</script>
<style scoped lang="less">
.chart {
width: 100%;
min-height: 200px;
}
</style>
