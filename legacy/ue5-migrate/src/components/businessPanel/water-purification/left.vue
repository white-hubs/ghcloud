<template>
  <div >
    <SubPanelTemplate title="净水用量情况">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmTypeTime" @search="areaAlarmStatistic"></DateInlineForm>
      </template>
      <div class="chart">
        <barChart :title="''" :x-data="xData"
            :data="[{ color: '#1890FF', name: '', data: yData }]" class="columnBox" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="净水使用趋势">
      <template #extra>
        <DateInlineForm v-model:modelValue="gasTime" @search="getGasData"></DateInlineForm>
      </template>
      <div class="chart">
        <LineChart :x-data="xDataGas" :series="yDataGas" :showLegend="true" :showBackground="true" :titles="titles"
          gridTop="15" :axisPointer="true" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="区域使用量概况" class="visiting-data">
      <template #extra>
        <DateInlineForm v-model:modelValue="dosageTime" @search="getDosageData"></DateInlineForm>
      </template>
      <div class="chart" v-if="pieData.length">
        <RoundPie :pieData="pieData" />
      </div>
       <noData v-else></noData>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from '../public/subPanelTemplate.vue';
import noData from '../public/noData.vue';
import DateInlineForm from "../public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import { ModelValueItf } from '../public/types'
import RoundPie from "@/components/businessPanel/medical-gas/components/round-pie.vue";
import { usageStatByArea, usageStatByType, usageStatByTypeAndTime } from '@/api/securitymanagement'
import barChart from "@/components/businessPanel/public/charts/bar/barChart.vue";

const alarmTypeTime = ref<ModelValueItf>();
const gasTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const dosageTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const xDataGas = ref<string[]>([])
const titles = ref([])
const yDataGas = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([
])
const pieData = ref<{name:string; value:number;}[]>([])
const xData = ref<string[]>([])
const yData = ref<number[]>([])
const areaAlarmStatistic = async () => {
  const params = {
    period:alarmTypeTime.value.dateRange.join(","),
    type:alarmTypeTime.value.timeType
  }
  const res = await usageStatByType(params)
  xData.value.length = 0
  yData.value.length = 0
  res.forEach(item=>{
    xData.value.push(item.waterTypeName)
    yData.value.push(item.totalUsage)
  })
}
const getGasData = async() => {
  const params = {
    period:gasTime.value.dateRange.join(","),
    type:gasTime.value.timeType
  }
  const res = await usageStatByTypeAndTime(params)
  yDataGas.value.length = 0
  xDataGas.value = res[0]?.list.map(item=>item.dateHour)
  titles.value = res.map(item=>item.waterTypeName)
  res.forEach(item=>{
   const data =  item.list.map(data=>data.totalUsage)
   yDataGas.value.push({name:item.waterTypeName,data})
  })
}
const getDosageData = async () => {
  const params = {
    period:dosageTime.value.dateRange.join(","),
    type:dosageTime.value.timeType
  }
  const res = await usageStatByArea(params)
  pieData.value = res.map(item=>{
    return {
      name:item.areaName,
      value:item.totalUsage
    }
  })
  
}
</script>
<style lang="less" scoped>
.chart {
  height: 250px;
}

.body {
  height: 300px;
}
</style>