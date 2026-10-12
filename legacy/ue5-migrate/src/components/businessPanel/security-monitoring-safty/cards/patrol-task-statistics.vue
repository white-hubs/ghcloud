<template>
    <SubPanelTemplate title="监控设备统计" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmTimeTypeS" @search="changeDates"></DateInlineForm>
      </template>
      <DeviceStatistics imgPath="business-icon/triage-queue/7.png" :statistic="deviceStatisticsData"></DeviceStatistics>
      <PatrolContent :patrol="patrolData"></PatrolContent>
    </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import PatrolContent from "@/components/businessPanel/electronicPatrol-new/components/patrol-content.vue";
import DeviceStatistics from "@/components/businessPanel/security-monitoring-safty/device-statistics.vue";
import { TaskStatistics } from '@/api/maintain'

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
</script>
<style lang="less" scoped>
</style>