<template>
  <div class="panel">
    <SubPanelTemplate title="巡更点分布情况" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="patrolTime" @search="changePatrol"></DateInlineForm>
      </template>
      <DeviceStatistics imgPath="business-icon/triage-queue/9.png" :statistic="deviceStatisticsData"></DeviceStatistics>
      <div class="elevator-analysis">
        <div class="chart">
          <elevator-analysis-pie :pieData="detectionData">
            <div style="color: #fff;text-align: center;font-size: 0.072rem;">{{ deviceStatisticsData.total }}</div>
            <div style="color: #fff;text-align: center;font-size: 0.072rem;">总量</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList :contentList="detectionData" class="pie_list"></elevatorAnalysisList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="巡更点异常Top5">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmTimeTypeS" @search="changeDates"></DateInlineForm>
      </template>
      <div class="body" style="min-height: 1.04166rem">
        <EventAlarmItem
          v-for="(item, index) in areaAlarmRank"
          :sort="index+1"
          :name="item.name"
          :count="item.num"
          :ratio="item.ratio + '%'"
        />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="任务异常记录">
      <template #extra>
        <DateInlineForm v-model:modelValue="taskExceptionTime" @search="changeTaskException"></DateInlineForm>
      </template>
      <DeviceStatistics imgPath="business-icon/triage-queue/9.png" :statistic="taskStatisticsData"></DeviceStatistics>
      <div class="roll-table">
          <RollTable @clickRow="clickRow" :column="column" :data="patrolData">
          </RollTable>
        </div>
    </SubPanelTemplate>
  <modal-command-dispatch :show-modal="commandModalShow" @close="commandModalShow = false" :parameter="commandParameter"></modal-command-dispatch>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DeviceStatistics from "@/components/businessPanel/security-monitoring-safty/device-statistics.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import elevatorAnalysisPie from "../public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "../public/elevator-analysis-list.vue"
import EventAlarmItem from "../public/eventAlarmItem.vue";
import modalCommandDispatch from "./components/modal-command-dispatch.vue";
import RollTable from "../public/rollTable/index.vue";
import { TaskAbnormalTop, electronArea, taskAbnormalList, taskAbnormalNum } from '@/api/maintain'

const deviceStatisticsData = reactive({
  title: "巡更点总数",
  total: 3325,
});
const taskStatisticsData = reactive({
  title: "异常任务数",
  total: 3325,
  itemize:[{
    label:'未处理数',
    name:'已处理数',
    value:12,
    offline:20
  }]
});
const commandParameter = ref<Record<string, any>>({
  id: "",
});
const commandModalShow = ref<boolean>(false);
const areaAlarmRank = ref([])
const alarmTimeTypeS = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const patrolTime = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const taskExceptionTime = ref({
  timeType:'THIS_YEAR',
  dateRange:[]
});
const detectionData = ref([])
const patrolData = ref([]);
const column = [
  {
    title: "任务名称",
    dataIndex: "taskName",
  },
  {
    title: "时间段",
    dataIndex: "timePeriod",
  },
  {
    title: "状态",
    dataIndex: "state",
  },
  {
    title: "执行人",
    dataIndex: "username"
  },
];
const changeDates= () => {
  abnormalTop()
}
const abnormalTop=async()=>{
const data= await TaskAbnormalTop({ period:alarmTimeTypeS.value.dateRange.join(','),
type:alarmTimeTypeS.value.timeType})
areaAlarmRank.value=data.map((item)=>{
return {
  name:item.locationName,
  num:item.num,
  ratio:item.chainRatio
}
})
}
const changePatrol =async () => {
 const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
 const res = await electronArea({period:patrolTime.value.dateRange.join(',')})
 deviceStatisticsData.total = res.total
//  detectionData.value = res.locationAreaList.map((e,index)=>{
//   return {
//     areaId:e.areaId,
//     name:e.areaName,
//     value:e.num,
//     color:colors[index]
//   }
//  })
  res.locationAreaList.sort((a,b)=>{
    return b.num - a.num
  })
  let other = 0
  res.locationAreaList.forEach((item,index)=>{
     if(index<=2){
      detectionData.value.push({
        areaId:item.areaId,
        name:item.areaName,
        value:item.num,
        color:colors[index]
      })
     }else{
      other += item.num
     }
   })
   if (res.locationAreaList.length > 3) {
    detectionData.value.push({
      name:'其他',
      value:other,
      color:'#19F8F7'
    })
   }
}
const changeTaskException =async () => {
const res = await taskAbnormalNum({type:taskExceptionTime.value.timeType,period:taskExceptionTime.value.dateRange.join(',')})
const data = await taskAbnormalList({type:taskExceptionTime.value.timeType,period:taskExceptionTime.value.dateRange.join(','),pageNumber:1,pageSize:50})
 taskStatisticsData.total = res.abnormalNum
 taskStatisticsData.itemize[0].value = res.undoNum
 taskStatisticsData.itemize[0].offline = res.finishedNum
 patrolData.value = data.records
}
const clickRow = async (params) => {
  commandParameter.value.id = params.taskId
  commandModalShow.value = true
}
onMounted(() => {
  abnormalTop()
})
</script>
<style lang="less" scoped>
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px;
  align-items: center;

  .pie_list {
    width: 150px;
    margin-left: 10px;
  }
}

.chart {
  flex: 1;
  height: 180px;
}
</style>