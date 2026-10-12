<!--耗材出库趋势-->
<template>
  <Card title="耗材出库趋势" style="width: 100%;margin-bottom: 16px;">
    <Spin v-if="!empty" :spinning="loading">
      <div ref="chartRef" class="chart-dom" />
    </Spin>
    <Empty v-else />
  </Card>
</template>
<script setup lang="ts">
import { getConsumableVisualizationReduceRecord } from '@/api/asset-management/asset-management'
import {
  LineChart,
  type LineSeriesOption
} from 'echarts/charts'
import {
  GridComponent,
  type GridComponentOption
} from 'echarts/components'
import * as echarts from 'echarts/core'
import {
  UniversalTransition
} from 'echarts/features'
import {
  CanvasRenderer
} from 'echarts/renderers'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

echarts.use(
  [GridComponent, LineChart, CanvasRenderer, UniversalTransition]
);

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | LineSeriesOption
>

const props = withDefaults(defineProps<{
  dimension:string;
  period:string;
}>(), {})

const chartRef = ref()
const chartData = ref<{value: number[]; name: string; }[]>()
const initChart = () => {
  if (!chartData.value) {
    return
  }
  const myChart = echarts.init(chartRef.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // type: 'cross',
        crossStyle: {
          color: '#999'
        }
      },
      textStyle: {
        fontSize: 14
      },
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderWidth: 0,
      formatter: function (params: [{name:string;value:string;}]) {
        const deptName = params[0].name
        const value = params[0].value
        const domString = `
          <div style='width:145px;color:whtie;padding-left:10px'>
            <p style='color:white'>${deptName}</p>
            <div style='color:white;display:flex;align-items:center;'>
              <div style='width:10px;height:10px;background-color:blue;border-radius:50%;margin-right:10px;'></div>
              <p style='margin:0'>耗材出库数：${value}</p>
            </div>
          </div>
        `
        return domString
      }
    },
    grid: {
      top: '10px',
      left: '10px',
      right: '10px',
      bottom: '0px',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: chartData.value.map(e=>e.name),
        axisTick: {
          alignWithLabel: true
        },
        axisLabel: {
          interval: props.dimension === 'THIS_MONTH' ? 4 : 0,
          show: true,
          showMaxLabel: true
        }
      }
    ],
    yAxis: {
      type: 'value',
      minInterval:1
    },
    series:[
      {
          data:chartData.value.map(e=>e.value.toString()),
          type: 'line',
          symbol: 'circle',
          symbolSize: 5
      } as unknown as LineSeriesOption
    ]
  };

  option && myChart.setOption(option);
  myChart.resize();
}

const loading = ref(false)
const empty = ref(false)
const getData = async () => {
  try {
    loading.value = true
    const params = {
      dimension: props.dimension,
      period: props.period
    }
    const res = await getConsumableVisualizationReduceRecord(params)
    if (res.data) {
      empty.value = false
      if (res.data.length === 0) {
        empty.value = true
        return
      }
      chartData.value = res.data
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
