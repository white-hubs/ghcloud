<!--资产分类-->
<template>
  <Card title="资产分类占比" style="width: 100%;">
    <Spin v-if="!empty" :spinning="loading">
      <div ref="chartRef" class="chart-dom" />
    </Spin>
    <Empty v-else />
  </Card>
</template>
<script setup lang="ts">
import { getPropertyByType } from '@/api/asset-management/asset-management'
import { PieChart, type PieSeriesOption } from 'echarts/charts'
import {
  LegendComponent, TitleComponent, TooltipComponent, type LegendComponentOption, type TitleComponentOption, type TooltipComponentOption
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { LabelLayout } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

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
const chartData = ref<TypeData>()
const initChart = () => {
  if (!chartData.value) {
    return
  }
  const data = chartData.value.map(e => {
    return {
      name: e.name,
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
      right: '15%',
      // @ts-expect-error
      y: 'center',
      icon: 'circle',
      itemHeight: 7,
      formatter: function (name) {
        const arr = [
          '{a|' + name + '   ' + (data.find(e => e.name === name)?.value ?? 0).toString() + '}'
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
            width: 45
          },
          c: {
            fontSize: 12
          }
        }
      }

    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 1,
          borderColor: '#fff',
          borderWidth: 4
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: false
          }
        },
        labelLine: {
          show: false
        },
        data
      }
    ]
  };

  option && myChart.setOption(option);
  myChart.resize()
}

type TypeData={
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
    const res = await getPropertyByType(params)
    if (res.data) {
      empty.value = false
      if (res.data.length === 0) {
        empty.value = true
        return
      }
      chartData.value = res.data as TypeData
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
