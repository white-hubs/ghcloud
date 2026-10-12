<template>
  <div class="panel">
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
  const res = [
    {
      name:'TODAY',
      xData:["内科", "外科", "牙科", "妇产科", "儿科", "皮肤科"] ,
      yData:[7, 1, 15, 3, 18, 12, 5] ,
    },
    {
      name:'THIS_WEEK',
      xData:["内科", "外科", "牙科", "妇产科", "儿科", "皮肤科"]  ,
      yData:[34, 12, 48, 7, 29, 55, 23] ,
    },
    {
      name:'THIS_MONTH',
      xData:["内科", "外科", "牙科", "妇产科", "儿科", "皮肤科"]  ,
      yData:[ 72, 38, 99, 15, 84, 60,27, 49, 92, 16, 74] ,
    },
    {
      name:'THIS_YEAR',
      xData:["内科", "外科", "牙科", "妇产科", "儿科", "皮肤科"] ,
      yData:[145, 67, 289, 34, 76, 210, 98, 155, 23, 278] ,
    },
  ]
  const data = res.find(e=>e.name === alarmTypeTime.value.timeType)
  xData.value.length = 0
  yData.value.length = 0
  xData.value = data.xData
  yData.value = data.yData
}
const getGasData = async() => {
  const res = [
    {
      name:'TODAY',
      xData:[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
      yData:[
        {
          waterTypeName:'内科',
          totalUsage:[7, 1, 15, 3, 18, 12, 5, 9, 14, 2, 20, 11, 8, 4, 19, 6, 13, 17, 10, 16, 2, 4, 18, 7]
        },
        {
          waterTypeName:'外科',
          totalUsage:[5, 12, 3, 17, 1, 19, 8, 14, 2, 10, 6, 4, 15, 7, 11, 20, 9, 18, 13, 16, 2, 5, 7, 19] 
        },
        {
          waterTypeName:'牙科',
          totalUsage:[[3, 15, 7, 1, 19, 12, 4, 8, 17, 6, 11, 20, 9, 5, 14, 2, 18, 10, 16, 13, 3, 7, 19, 4] ]
        },
      ],
    },
    {
      name:'THIS_WEEK',
      xData:[1, 2, 3, 4, 5, 6, 7]  ,
      yData:[
        {
          waterTypeName:'内科',
          totalUsage:[7, 1, 15, 3, 18, 12, 5, 9, 14, 2, 20, 11, 8, 4, 19, 6, 13, 17, 10, 16, 2, 4, 18, 7]
        },
        {
          waterTypeName:'外科',
          totalUsage:[5, 12, 3, 17, 1, 19, 8, 14, 2, 10, 6, 4, 15, 7, 11, 20, 9, 18, 13, 16, 2, 5, 7, 19] 
        },
        {
          waterTypeName:'牙科',
          totalUsage:[[3, 15, 7, 1, 19, 12, 4, 8, 17, 6, 11, 20, 9, 5, 14, 2, 18, 10, 16, 13, 3, 7, 19, 4] ]
        },
      ],
    },
    {
      name:'THIS_MONTH',
      xData:[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]   ,
      yData:[
        {
          waterTypeName:'内科',
          totalUsage:[7, 1, 15, 3, 18, 12, 5, 9, 14, 2, 20, 11, 8, 4, 19, 6, 13, 17, 10, 16, 2, 4, 18, 7]
        },
        {
          waterTypeName:'外科',
          totalUsage:[5, 12, 3, 17, 1, 19, 8, 14, 2, 10, 6, 4, 15, 7, 11, 20, 9, 18, 13, 16, 2, 5, 7, 19] 
        },
        {
          waterTypeName:'牙科',
          totalUsage:[[3, 15, 7, 1, 19, 12, 4, 8, 17, 6, 11, 20, 9, 5, 14, 2, 18, 10, 16, 13, 3, 7, 19, 4] ]
        },
      ],
    },
    {
      name:'THIS_YEAR',
      xData:[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      yData:[
        {
          waterTypeName:'内科',
          totalUsage:[7, 1, 15, 3, 18, 12, 5, 9, 14, 2, 20, 11, 8, 4, 19, 6, 13, 17, 10, 16, 2, 4, 18, 7]
        },
        {
          waterTypeName:'外科',
          totalUsage:[5, 12, 3, 17, 1, 19, 8, 14, 2, 10, 6, 4, 15, 7, 11, 20, 9, 18, 13, 16, 2, 5, 7, 19] 
        },
        {
          waterTypeName:'牙科',
          totalUsage:[[3, 15, 7, 1, 19, 12, 4, 8, 17, 6, 11, 20, 9, 5, 14, 2, 18, 10, 16, 13, 3, 7, 19, 4] ]
        },
      ],
    },
  ]
  const data = res.find(e=>e.name === gasTime.value.timeType)
  yDataGas.value.length = 0
  xDataGas.value = data.xData
  titles.value = data.yData.map(item=>item.waterTypeName)
  data.yData.forEach(item=>{
   yDataGas.value.push({name:item.waterTypeName,data:item.totalUsage})
  })
}
const getDosageData = async () => {
  const params = {
    period:dosageTime.value.dateRange.join(","),
    type:dosageTime.value.timeType
  }
  const res = [
    {
      name:'TODAY',
      xData:[
        {
          areaName:'住院部',
          totalUsage:34
        },
        {
          areaName:'门诊部',
          totalUsage:35
        },
        {
          areaName:'行政部',
          totalUsage:22
        },
        {
          areaName:'污水处理站',
          totalUsage:60
        },
      ],
    },
    {
      name:'THIS_WEEK',
      xData:[
      {
          areaName:'住院部',
          totalUsage:400
        },
        {
          areaName:'门诊部',
          totalUsage:390
        },
        {
          areaName:'行政部',
          totalUsage:310
        },
        {
          areaName:'污水处理站',
          totalUsage:600
        },
      ],
    },
    {
      name:'THIS_MONTH',
      xData:[
      {
          areaName:'住院部',
          totalUsage:2800
        },
        {
          areaName:'门诊部',
          totalUsage:2100
        },
        {
          areaName:'行政部',
          totalUsage:1000
        },
        {
          areaName:'污水处理站',
          totalUsage:3200
        },
      ],
    },
    {
      name:'THIS_YEAR',
      xData:[
      {
          areaName:'住院部',
          totalUsage:6800
        },
        {
          areaName:'门诊部',
          totalUsage:5100
        },
        {
          areaName:'行政部',
          totalUsage:3000
        },
        {
          areaName:'污水处理站',
          totalUsage:9200
        },
      ],
    },
  ]
  const data = res.find(e=>e.name === dosageTime.value.timeType)
  pieData.value = data.xData.map(item=>{
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