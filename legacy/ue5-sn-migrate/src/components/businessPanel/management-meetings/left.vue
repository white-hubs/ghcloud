<template>
  <div class="panel">
    <SubPanelTemplate title="未来8小时会议空闲情况">
      <div class="charts">
        <thermodynamics :yData="yData" :x-data="xData" :data="meetingData"></thermodynamics>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="预定时段分析">
      <div class="charts1">
        <LineChart :x-data="periodTime.xData" :series="[{data:periodTime.yData}]" :showLegend="true"
          :showBackground="true" :titles="['']" gridTop="5" :unit="{ x: '', y: '' }" :axisPointer="true" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="会议室利用率分析">
      <template #extra>
        <DateInlineForm v-model:modelValue="takeNotes" @search="getPlayRecordTop"></DateInlineForm>
      </template>
      <div class="charts1">
        <stackedColumn :unit="'%'" :xData="buildUtilization.xData" :yData="buildUtilization.yData"></stackedColumn>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import thermodynamics from "../public/charts/thermodynamics/thermodynamics.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import stackedColumn from "../public/charts/stacked-column/stackedColumn.vue";
import { availabilityHours, playRecordTop, scheduledPeriods } from '@/api/conference'
import DateInlineForm from "../public/dateInlineForm.vue";
import { ModelValueItf } from '../public/types'
import moment from 'moment'

const xData = ref([])
const yData = ref([])    
const meetingData = ref([
        {
            name: '会议室情况',
            type: 'heatmap',
            data: [],
            label: {
                show: false,
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
            },
        },
    ])
const periodTime = reactive<{xData:string[];yData:number[]}>({
    xData:[],
    yData:[],
})
const takeNotes = ref<ModelValueItf>()
const timeArr = ref([])
const buildUtilization = reactive({
  xData: [],
  yData: [
    {
      name:'使用率',
      data:[]
    },{
      name:'未使用率',
      data:[]
    },
  ],
})
const getTime = ()=>{
  yData.value = []
  for (let i = 0; i < 8; i++) {
    yData.value.push(moment().add(i, 'hour').format('HH:00'))
    yData.value.push(moment().add(i, 'hour').format('HH:30'))
  }
}
const getScheduledPeriods = async () => {
 const res = await scheduledPeriods()
 periodTime.xData = []
 periodTime.yData = []
 for (const key in res) {
  periodTime.xData.push(key+'时')
  periodTime.yData.push(res[key])
 }
}
const getPlayRecordTop = async () => {  
  const res = await playRecordTop({period:takeNotes.value.dateRange.join(",")})
  buildUtilization.xData = []
  buildUtilization.yData[0].data = []
  buildUtilization.yData[1].data = []
  res.forEach(item=>{
    buildUtilization.xData.push(item.name)
    buildUtilization.yData[0].data.push(item.usageRate)
    buildUtilization.yData[1].data.push(item.unusedRate)
  })
}
const getAvailabilityHours = async () => {  
  const res = await availabilityHours()
  getTime()
  xData.value = []
  meetingData.value[0].data = []
  const meetingRoom = {
    "RESERVABLE":0,
    "UNAVAILABLE":1,
    "RESERVED":2,
  }
  meetingData.value[0].data = []
  let index = 0
  for (const key in res) {
    xData.value.push(key)
    res[key] = res[key].map(item=>{
      return {
        ...item,
        periodTime:item.periodTime.split("-")[0]
      }
    })
    for (let i = 0; i < yData.value.length; i++) {
      const periodTime = yData.value[i];
      const found = res[key].find(item => item.periodTime === periodTime);
      if (!found) {
        res[key].push({
          "conferenceId": null,
          "name": key,
          "periodTime": periodTime,
          "bookRoomEnum": "UNAVAILABLE",
          "num": 0,
          "usageRate": null,
          "unusedRate": null
        });
      }
    }
    res[key] = res[key].sort((itemA, itemB) => {
      const indexA = yData.value.indexOf(itemA.periodTime);
      const indexB = yData.value.indexOf(itemB.periodTime);
      return indexA - indexB;
    });
    res[key].forEach((item,i)=>{
      meetingData.value[0].data.push([index,i,meetingRoom[item.bookRoomEnum]])
    })
    index++
  }
}
onMounted(()=>{
  getScheduledPeriods()
  getAvailabilityHours()
})
</script>
<style lang="less" scoped>
.charts {
  height: 300px;
}
.charts1{
  height: 200px;
}
</style>