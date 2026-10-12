<template>
  <div >
    <SubPanelTemplate title="监控设备统计" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmTimeTypeS" @search="changeDates"></DateInlineForm>
      </template>
      <DeviceStatistics imgPath="business-icon/triage-queue/7.png" :statistic="deviceStatisticsData"></DeviceStatistics>
      <PatrolContent :patrol="patrolData"></PatrolContent>
    </SubPanelTemplate>
    <SubPanelTemplate title="任务执行情况">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmTimeType" @search="changeDate"></DateInlineForm>
      </template>
      <displayPanel :bg-img="'overView16.png'" :content-list="contentList" :showimg="false"></displayPanel>
    </SubPanelTemplate>
    <SubPanelTemplate title="巡更路线">
      <template #extra>
        <DateInlineForm v-model:modelValue="operationsAnalysis.operationsAnalysisTime"
          @search="taskRouteData">
        </DateInlineForm>
      </template>
      <div class="chart">
        <overviewChartBar :title="'次'" :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DeviceStatistics from "@/components/businessPanel/security-monitoring-safty/device-statistics.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import displayPanel from "@/components/businessPanel/public/display-panelsafty.vue";
import overviewChartBar from "../hospital/overview-chartBar.vue"
import PatrolContent from "./components/patrol-content.vue";
import { TaskAbnormal, TaskMissing, TaskRoute, TaskStatistics, completionRate, electronTaskAbnormal, taskAbnormalNum } from '@/api/maintain'

const deviceStatisticsData = reactive({
  title: "巡更任务",
  total: 0,
  itemize: [
    {
      name: "待接收",
      label: "执行中",
      value: 0,
      offline: 0,
      key: "OFFLINE",
    },
    {
      name: "已结束",
      label: "异常结束",
      value: 0,
      offline: 0,
      key: "OFFLINE",
    },
  ],
});
const patrolData = ref([
  {
    title:'包含巡更路线',
    value:20
  },
  {
    title:'涉及巡更点',
    value:21
  },
  {
    title:'巡更覆盖率',
    value:22
  },
])
const contentList = ref([
  {
    name: "任务完成率",
    value: 0,
  },
  {
    name: "巡更点漏巡占比",
    value: 0,
  },
  {
    name: "任务完成时常占比",
    value: 0,
  },
  {
    name: "巡更点异常占比",
    value: 0,
  }
]);
const operationsAnalysis = reactive({
    operationsAnalysisTime: {
  timeType:'THIS_YEAR',
  dateRange:[]
},
    operationsAnalysisXdata: ['4:00', '8:00', '12:00', '16:00', '20:00', '24:00'],
    operationsAnalysisYdata: {
        data: [50, 10, 30, 50, 70, 60],
        name: '平均运行次数',
        color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
    },
});
const barData = reactive({
    xData: [],
    yData: [
        {
            data: [10, 20, 30, 40],
            name: '',
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        }
    ]
})
const alarmTimeType = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const alarmTimeTypeS = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const changeDates = async()=>{
 const data=await TaskStatistics({
   period:alarmTimeTypeS.value.dateRange.join(','),
   type:alarmTimeTypeS.value.timeType
})
deviceStatisticsData.total=data.taskNumberStatistics.totalNumber

deviceStatisticsData.itemize=[
{
      name: "待接收",
      label: "执行中",
      value: data.taskStatusStatistics.inExecutionNumber,
      offline: data.taskStatusStatistics.toBeReceivedNumber,
      key: "OFFLINE",
    },
    {
      name: "已结束",
      label: "异常结束",
      value: data.taskStatusStatistics.abnormalFinishedNumber,
      offline: data.taskStatusStatistics.finishedNumber,

      key: "OFFLINE",
    },


]
patrolData.value=[

{
    title:'包含巡更路线',
    value:data.taskLineStatistics.totalNumber
  },
  {
    title:'涉及巡更点',
    value:data.taskLineStatistics.locationNumber
  },
  {
    title:'巡更覆盖率',
    value:data.taskLineStatistics.locationCoverageRate
  },
]
}
const changeDate= async()=>{
  TaskData()
}

const TaskData=async()=>{
  const data = await TaskMissing({period:alarmTimeType.value.dateRange.join(',')})
  const abnormalNum = await TaskAbnormal({ period:alarmTimeType.value.dateRange.join(',')})
  const abnormal = await taskAbnormalNum({ period:alarmTimeType.value.dateRange.join(',')})
  const completion = await completionRate({ period:alarmTimeType.value.dateRange.join(',')})
  contentList.value[1].value=completion.ratio
  contentList.value[1].value=data.proportion
  contentList.value[2].value=abnormalNum.proportion
  contentList.value[3].value=abnormal.abnormalRatio?abnormal.abnormalRatio:0
}
const taskRouteData=async()=>{
const data=await TaskRoute({
  type:operationsAnalysis.operationsAnalysisTime.timeType,
  period:operationsAnalysis.operationsAnalysisTime.dateRange.join(',')
})
barData.xData=data.map((item)=>{
return item.routeName

})
barData.yData[0].data=  data.map((item)=>{
return item.keepNum
}) 
}
</script>
<style lang="less" scoped>
.chart {
  height: 200px;
}
</style>