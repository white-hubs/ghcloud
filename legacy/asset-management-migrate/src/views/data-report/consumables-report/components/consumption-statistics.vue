<!--耗材领用统计-->
<template>
  <Card title="耗材领用统计" style="width: 100%;margin-bottom: 16px;">
    <Spin v-if="!empty" :spinning="loading">
      <div ref="chartRef" class="chart-dom" />
    </Spin>
    <Empty v-else />
  </Card>
</template>
<script setup lang="ts">
import { getConsumableReduceRecordStat } from '@/api/asset-management/asset-management'
import { BarChart, type BarSeriesOption } from 'echarts/charts'
import { GridComponent, type GridComponentOption, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

echarts.use([GridComponent, BarChart, CanvasRenderer, TooltipComponent]);
const emit = defineEmits(['getTableData'])
type EChartsOption = echarts.ComposeOption<
  GridComponentOption | BarSeriesOption 
>;

const props = withDefaults(defineProps<{
  dimension:string;
  period:string;
}>(), {})

const chartRef = ref()
const chartData = ref<{ amount: number;consumableNum: number;deptId: string;deptName: string; }[]>()
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
      formatter: function (params: [{ dataIndex:number;name: string; }]) {
        const deptName = params[0].name
        const consumableNum = chartData.value![params[0].dataIndex].consumableNum
        const amount = chartData.value![params[0].dataIndex].amount
        const domString = `
          <div style='width:145px;color:whtie;padding-left:10px'>
            <p style='color:white'>${deptName}</p>
            <div style='color:white;display:flex;align-items:center;'>
              <div style='width:10px;height:10px;background-color:#5470c6;border-radius:50%;margin-right:10px;'></div>
              <p style='margin:0'>耗材量：${consumableNum??0}</p>
            </div>
            <div style='color:white;display:flex;align-items:center;'>
              <div style='width:10px;height:10px;background-color:#5470c6;border-radius:50%;margin-right:10px;'></div>
              <p style='margin:0'>金额：${amount??0}</p>
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
    xAxis: {
      type: 'category',
      data: chartData.value.map(e => e.deptName)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: chartData.value.map(e =>{
         return {
          value:e.consumableNum,
          groupId:e.deptId
         }
        } ),
        type: 'bar',
        barWidth: 30
      }
    ]
  };
  option && myChart.setOption(option);
  myChart.on('click',(params:any)=>{
    emit('getTableData',params.data.groupId)
  })
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
    const res = await getConsumableReduceRecordStat(params)
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
  height: 100%;
  width: 100%;
  max-width: 100%;

  div {
    margin: 0 !important;
  }
}

:deep(.asset-management-card-body) {
  height: calc(100% - 58px);
  box-sizing: border-box;
}

:deep(.asset-management-spin-nested-loading) {
  height: 100%;
}

:deep(.asset-management-spin-container) {
  height: 100%;
}
</style>
