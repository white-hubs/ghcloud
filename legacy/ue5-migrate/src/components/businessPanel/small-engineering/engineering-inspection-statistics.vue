<template>
  <SubPanelTemplate title="工程巡查统计">
    <template #extra>
      <div class="flex-align">
        <DateInlineForm v-model:modelValue="timeFrame" @search="getAlarmLevel" />
      </div>
    </template>
    <div class="monitorPanelBox">
      <monitorPanel @handelClickItemize="handelClickItemize" v-for="(item, index) in monitorPanelData" :key="item.name"
        :monitorPanelData="item">
      </monitorPanel>
    </div>
    <RollTable :column="columns" :data="data" :showLength="8">
      <template #result="{ record }">
        <span v-if="record.result === 'NORMAL'" style="color: #00f27b">正常</span>
        <span v-else-if="record.result === 'ABNORMAL'" style="color: #f14545">异常</span>
        <span> {{ typesObj[record.result] }} </span>
      </template>
      <template #operate="{ record }">
        <span class="details" @click="detail(record)">详情</span>
      </template>
    </RollTable>
  </SubPanelTemplate>

  <inspectTaskDetail ref="inspectRef" :title="'巡查任务详情'" v-if="alarmModalShow" :parameter="inspectParameter" @close="close"></inspectTaskDetail>
  
  <modal-table :modalStyle="{width:'900px'}" v-if="inspectionRecordShow" :show="inspectionRecordShow" title="巡检统计列表" @close="()=>inspectionRecordShow = false">
    <inspect-task-record :parameter="inspectListParameter"></inspect-task-record>
  </modal-table>

</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import monitorPanel from "./components/monitor-panel.vue"
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from '../public/types'
import { inspectAnalysisTaskExecuteUser, inspectAnalysisTaskStatistics } from '@/api/maintain'
import inspectTaskDetail from "./components/inspect-detail/inspect-task-detail.vue";
import modalTable from '@/components/modal-table/modal.vue'
import inspectTaskRecord from "./components/inspect-task-record.vue";

const inspectParameter = ref({
  id:'',
  businessType:""
})
const inspectListParameter = ref({
  period:[],
  businessType:"SMALL_ENGINEERING",
  result:''
})
const inspectionRecordShow = ref(false)
const alarmModalShow = ref(false)
const monitorPanelData = ref([
  {
    imgPath: 'overView119.png',
    value: 30,
    ratio:0,
    name: '工程巡查总数'
  },
  {
    imgPath: 'overView120.png',
    value: 2334,
    ratio:0,
    name: '巡查异常总数'
  },
])
const typesObj = {
  SPLIT:'待拆解',
  ACCEPT:'待接收',
  EXECUTING:'进行中',
  EXPIRE:'已过期',
  STOP:'已终止',
}
const data = ref<any>([]);
const columns = ref([
  {
    title: "名称",
    dataIndex: "taskName",
  },
  {
    title: "执行人",
    dataIndex: "taskExecuteUser",
  },
  {
    title: "巡查结果",
    dataIndex: "result",
    slots: {
      customRender: "result",
    },
  },
  {
    title: "操作",
    dataIndex: "operate",
    slots: {
      customRender: "operate",
    },
  },
]);
let timeFrame = ref<ModelValueItf>();
const detail = (item)=>{
  inspectParameter.value.id = item.taskId
  inspectParameter.value.businessType = 'SMALL_ENGINEERING'
  alarmModalShow.value = true
}
const close = ()=>{
  alarmModalShow.value = false
}
const getAlarmLevel = async ()=>{
 const res = await inspectAnalysisTaskStatistics({
  period:timeFrame.value.dateRange.join(","),
  businessType:'SMALL_ENGINEERING'
})
  monitorPanelData.value[0].value = res.taskTotalNum
  monitorPanelData.value[0].ratio = res.taskTotalNumRatio
  monitorPanelData.value[1].value = res.abnormalTaskNum
  monitorPanelData.value[1].ratio = res.abnormalTaskNumRatio
  
  const value = await inspectAnalysisTaskExecuteUser({
      pageNumber: 1,
      pageSize: 10,
      period: timeFrame.value.dateRange.join(","),
      businessType: 'SMALL_ENGINEERING'
    })
    data.value = value.records
}
const handelClickItemize = (value)=>{
  inspectionRecordShow.value = true
  inspectListParameter.value.period = timeFrame.value.dateRange
  inspectListParameter.value.result = ''
  if (value.name === "巡查异常总数") {
    inspectListParameter.value.result = 'ABNORMAL'
  }
}
</script>
<style lang="less" scoped>
.monitorPanelBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.details {
  color: #1890ff;
  cursor: pointer;
}
</style>