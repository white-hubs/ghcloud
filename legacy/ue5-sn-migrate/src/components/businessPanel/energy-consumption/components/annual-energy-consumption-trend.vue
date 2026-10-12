<template>
  <SubPanelTemplate :title="title">
   <template #extra>
    <a-select ref="select" v-model:value="state" style="width: 50px; height: 28px;width: 80px;" 
				@change="changeEnergyCarbonTime" :getPopupContainer="(triggerNode) => triggerNode.parentNode">
				<a-select-option :value="item.value" v-for="(item, i) in deviceStateList">{{
					item.label }}</a-select-option>
			</a-select>
    </template>
    <div class="echarts" >
      <LineChart :x-data="deviceFailureTrendCharData.xData" :series="deviceFailureTrendCharData.yData" :showLegend="false"
        gridTop="15" :unit="{ x: '', y: '' }" />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { collectConfigList, statYearTrend } from '@/api/energy'
import moment from 'moment'
interface Props {
title: string;
}
const props = withDefaults(defineProps<Props>(), {
title: '年度用能趋势图',
});
const state = ref('electricity_meter')
const deviceStateList = ref([])
const deviceFailureTrendCharData = reactive({
  xData: [1,2,3,4,5,6,7,8,9],
  yData: [
    { data:  [10,10,10,10,10,0,0, 50, 20, 200, 150, 40, 10, 50],showSymbol:true, linearGradientColor: ['rgba(86, 142, 255, 1)', 'rgba(86, 142, 255, 0.1)'], lineColor: 'rgba(86, 142, 255, 1)' },
  ]
})
// 能耗分类配置
const getCollectConfigList = async () => {
 const res = await collectConfigList()
 deviceStateList.value = res.map(e=>{
  return {
    label:e.categoryName,
    value:e.categoryCode
  }
 })
 state.value = deviceStateList.value[0].value
}
const changeEnergyCarbonTime = async()=> {
  const params = {
    instrumentType:state.value,
    period:moment().subtract(10, 'years').format("YYYY-MM-DD HH:mm:ss") +','+moment().format("YYYY-MM-DD HH:mm:ss")
  }
  const year = Number(moment().subtract(10, 'years').format("YYYY")) 
  const thisYear = Number(moment().format("YYYY")) 
  const data = []
  for (let index = year; index <= thisYear; index++) {
    data.push({
      xData:index,
      value:0
    })
  }
 const res = await statYearTrend(params)
 data.forEach(item=>{
  res.forEach(e=>{
    if (item.xData == e.time) {
      item.value = e.ddValue
    }
  })
 })
 deviceFailureTrendCharData.xData = data.map(e=>e.xData)
 deviceFailureTrendCharData.yData[0].data = data.map(e=>e.value)
}
onMounted(()=>{
  getCollectConfigList()
  changeEnergyCarbonTime()
})
</script>
<style lang="less" scoped>
.echarts{
  height: 200px;
}
</style>