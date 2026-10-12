<!--部门资产分布情况-->
<template>
  <Card title="部门资产分布情况" style="width: 100%;margin-bottom: 16px;">
    <Spin v-if="!empty" :spinning="loading">
      <div ref="chartRef" class="chart-dom" />
    </Spin>
    <Empty v-else />
  </Card>
</template>
<script setup lang="ts">
import { getPropertyByDepHistogram } from '@/api/asset-management/asset-management'
import { BarChart, type BarSeriesOption } from 'echarts/charts'
import { GridComponent, type GridComponentOption } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

echarts.use([GridComponent, BarChart, CanvasRenderer]);

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | BarSeriesOption
>;

const props = withDefaults(defineProps<{
  dimension:string;
  period:string;
}>(), {})

const chartRef = ref()
const chartData = ref<{xdata: string[]; series: { value: number[]; name: string; }[];}>()
const initChart = () => {
  if (!chartData.value) {
    return
  }
  const myChart = echarts.init(chartRef.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
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
              <div style='width:10px;height:10px;background-color:#5470c6;border-radius:50%;margin-right:10px;'></div>
              <p style='margin:0'>资产数：${value}</p>
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
        data: chartData.value.xdata,
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: chartData.value.series.map(e => {
      return {
        data: e.value,
        type: 'bar',
        barWidth: 30
      }
    })
  };

  option && myChart.setOption(option);
  myChart.resize()
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
    const res = await getPropertyByDepHistogram(params)
    if (res.data) {
      empty.value = false
      if (res.data.xdata.length === 0) {
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
