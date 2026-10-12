<template>
  <CLayout :title="title" class="mt-15px">
    <template #header-btn>
      <timeRadioGroup
        ref="TimeRadioGroupRef" v-model:value="trendPeriod" show-range-picker 
        @change="(flag: timeType)=>queryTrend(flag)"
      />
    </template>
    <template #content>
      <Spin :spinning="trendLoading">
        <div class="h-400px">
          <ELine
            ref="eLineRef"
            :legend="{
              top:'top'
            }"
            :x-data="xData2"
            :series="seriesData"
          />
        </div>
      </Spin>
    </template>
  </CLayout>
</template>
<script setup lang="ts">
import { getChargeTrend } from '@/api/feeManage'
import ELine from '@/components/echart/eLine.vue'
import timeRadioGroup from '@/components/timeRadioGroup.vue'
import * as echarts from 'echarts'
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  title: string;
  period?: string;
  timeFlag?: string;
  checkedKeys: (string | number)[];
  instrumentType:string;
  treeids:any;
}>(), {
  title: '',
  period: '',
  timeFlag: 'TODAY',
  treeids: []
})
type timeType = 'TODAY'|'THIS_MONTH'|'THIS_YEAR'
// 筛选日期
const TimeRadioGroupRef = ref()
const trendLoading = ref(false)
const trendPeriod = ref('')
const trendTimeFlag = ref<timeType>('THIS_MONTH')
const trendData = ref<any>([])
const eLineRef = ref()

const colorsMap = new Map<string, {color:string; text:string;}>([
  ['fValue', { color: '#fac858', text: '峰时' }],
  ['pValue', { color: '#5470c6', text: '平时' }],
  ['gValue', { color: '#91cc75', text: '谷时' }]
])
const xData2 = ref< 'year'|'month'|'day'|string[]>('day')
const seriesData = ref<echarts.SeriesOption[]>([])

// 费用趋势统计
const queryTrend = async (timeTypeStr:timeType) => {

  trendLoading.value = true
  try {
    trendData.value = []
    const ids = props.checkedKeys.join(',')
    // const type = props.instrumentType === 'electricity_meter' ? 'THIS_MONTH' : 'TODAY'
    trendTimeFlag.value = timeTypeStr === undefined ? "THIS_MONTH":timeTypeStr
    if (['water_meter', 'gas_meter'].includes(props.instrumentType)) {
      if(props.treeids.length===0){
        trendLoading.value = false
        return
      }
      const { data } = await getChargeTrend({filterFlag:'area', treeIds: props.treeids, instrumentType: props.instrumentType, areaIds: ids, timeFlag: trendTimeFlag.value, period: trendPeriod.value })
      xData2.value = data.map((res: { timeFlag: string })=>res.timeFlag)

      trendData.value = data || []
      useFn()
    } else {
      if(props.treeids.length===0){
        trendLoading.value = false
        return
      }
      const { data } = await getChargeTrend({ filterFlag:'area',treeIds: props.treeids, instrumentType: props.instrumentType, areaIds: ids, timeFlag: trendTimeFlag.value, period: trendPeriod.value })
      xData2.value = data.map((res: { timeFlag: string })=>res.timeFlag)

      trendData.value=[]
      trendData.value.push( {
      name: '峰时',
      type: 'line',
      stack: 'Total',
      data: data.map((res: { fvAmount: number })=>res.fvAmount)
    })
      trendData.value.push( {
      name: '平时',
      type: 'line',
      stack: 'Total',
      data: data.map((res: { gvAmount: number })=>res.gvAmount)
    })
      trendData.value.push( {
      name: '谷时',
      type: 'line',
      stack: 'Total',
      data: data.map((res: { pvAmount: number })=>res.pvAmount)
    })
      electricFn()
    }
    trendLoading.value = false
  } catch (error) {
    trendLoading.value = false
  }
}
// 电费
const electricFn = () => {
  seriesData.value = []
  // for (const iterator in trendData.value) {
  //   const curItem = trendData.value[iterator] as Fee.TrendState[]
  //   const data = {
  //     name: colorsMap.get(iterator)?.text || '',
  //     type: 'line',
  //     smooth: true,
  //     itemStyle: {
  //       color: colorsMap.get(iterator)?.color
  //     },
  //     data: curItem.map((item:Fee.TrendState) => item.amount)
  //   }
  //   seriesData.value.push(data as echarts.SeriesOption)
  // }
  seriesData.value=trendData.value
  eLineRef.value.clear()
  eLineRef.value.render()
}
// 总用量
const useFn = () => {
  seriesData.value = []
  const title = props.instrumentType === 'gas_meter'
    ? '燃气费'
    : props.instrumentType === 'water_meter' ? '水费' : ''
  const data = {
    name: title,
    type: 'line',
    smooth: true,
    itemStyle: {
      color: props.instrumentType === 'gas_meter' ? '#fac858' : '#5470c6'
    },
    areaStyle: {},
    data: trendData.value.map((item:Fee.TrendState) => item.amount)
  }
  seriesData.value.push(data as echarts.SeriesOption)
  eLineRef.value.clear()
  eLineRef.value.render()
}
defineExpose({
  queryTrend
})
</script>

<style lang="less" scoped>
  .chartDom{
    width: 100%;
    height: 100%;
  }
</style>
