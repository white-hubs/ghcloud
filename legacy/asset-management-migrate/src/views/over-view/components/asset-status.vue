<!--资产占比-->
<template>
  <Card title="资产状态占比" style="width: 100%;">
    <Spin v-if="!empty" :spinning="loading">
      <div ref="chartRef" class="chart-dom" />
    </Spin>
    <Empty v-else />
  </Card>
</template>
<script setup lang="ts">
import { getPropertyByStatus } from '@/api/asset-management/asset-management'
import { assetStatus } from '@/views/enum'
import { PieChart, type PieSeriesOption } from 'echarts/charts'
import {
  LegendComponent, TitleComponent, TooltipComponent, type LegendComponentOption, type TitleComponentOption, type TooltipComponentOption
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { LabelLayout } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout
]);

type EChartsOption = echarts.ComposeOption<
  | TitleComponentOption
  | TooltipComponentOption
  | LegendComponentOption
  | PieSeriesOption
>;

const props = withDefaults(defineProps<{
  dimension:string;
  period:string;
}>(), {})

const chartRef = ref()
const chartData = ref<StatusData>()
const initChart = () => {
  if (!chartData.value) {
    return
  }
  const data = chartData.value.map(e => {
    return {
      name: assetStatus.find(ele=>ele.value===e.name)?.label?? e.name,
      value: e.value
    }
  })
  const myChart = echarts.init(chartRef.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: '20%',
      // @ts-expect-error
      y: 'center',
      icon: 'circle',
      itemHeight: 7,
      formatter: function (name) {
        const arr = [
          '{a|' + name + '}',
          '{c|' + data.find(e => e.name === name)?.value + '}'
        ]
        return arr.join('  ')
      },
      textStyle: {
        rich: {
          a: {
            fontSize: 12,
            width: 45
          },
          b: {
            fontSize: 12,
            width: 30
          }
        }
      }

    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        center: ['35%', '50%'],
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  myChart.clear()
  option && myChart.setOption(option);
  myChart.resize()
}

type StatusData={
  'name': string;
  'value': number;
  'ringRatio': number;
  'totalRatio': number;
}[]

const loading = ref(false)
const empty = ref(false)
const getData = async () => {
  try {
    loading.value = true
    const params = {
      dimension: props.dimension,
      period: props.period
    }
    const res = await getPropertyByStatus(params)
    if (res.data) {
      empty.value = false
      if (res.data.length === 0) {
        empty.value = true
        return
      }
      chartData.value = res.data as StatusData
      nextTick(() => {
        initChart()
      })
    }
  } catch (error) {
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', initChart)
})
onUnmounted(() => {
  window.removeEventListener('resize', initChart)
})

defineExpose({
  getData
})
</script>
<style scoped lang="less">
.chart-dom {
  height: 300px;
  width: 100%;
  max-width: 100%;

  div {
    margin: 0 !important;
  }
}
.asset-management-empty{
  height: 300px;
  display: flex;
  flex-flow: column;
  justify-content: center;
}
</style>
