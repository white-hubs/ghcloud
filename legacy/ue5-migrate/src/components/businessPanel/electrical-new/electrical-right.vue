<template>
  <div >
    <SubPanelTemplate title="电气设备" class="alarm-event">
      <DeviceStatistics
        imgPath="business-icon/triage-queue/6.png"
        :statistic="deviceStatisticsData"
        @handelClickItemize="handelOpenDevice"
      ></DeviceStatistics>
      <div class="chart flex-start">
        <elevator-analysis-pie style="width: 50%" :pieData="pieData" :radius="'75'">
          <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale) * 0.082rem)">
            {{ deviceStatisticsData.total }}
          </div>
          <div style="color: #fff; text-align: center; font-size: calc(var(--font-size-scale) * 0.072rem)">设备总数</div>
        </elevator-analysis-pie>
        <elevatorAnalysisList
        @handlecurrent="alarmRegion"
          :contentList="pieData"
          style="width: 50%;"
        ></elevatorAnalysisList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警区域TOP5">
      <template #extra>
        <DateInlineForm v-model:modelValue="handleTime" @search="changeHandleTime"></DateInlineForm>
      </template>
      <div class="body" style="min-height: 250px;" v-show="alarmRank.list.length > 0">
        <EventAlarmItem v-for="(item, index) in alarmRank.list" :key="item.id" :sort="index + 1" :name="item.name"
          :linkRatio="item.chainRatio" :count="item.alarmNum" :ratio="item.ratio + '%'" />
      </div>
      <div class="body" style="min-height: 150px;" v-show="alarmRank.list.length <= 0">
        <noData></noData>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="电气报警记录" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="alarmRecordTime" @search="changeAlarmRecordDate"></DateInlineForm>
      </template>
      <DeviceStatistics @handelClickItemize="handelClickItemize" imgPath="business-icon/triage-queue/10.png" :statistic="deviceStatisticsRecordData">
      </DeviceStatistics>
      <div class="footer">
        <RollTable :column="column" :data="listData" @click-row="handelClickRow">
          <template #alarmStatus="{ record }">
            <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
            <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
            <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
          </template>
        </RollTable>
      </div>
    </SubPanelTemplate>
  <modal-equipmentAll-table :show-modal="deviceModalShow" @close="deviceModalShow = false"
      :parameter="deviceParameter"></modal-equipmentAll-table>
    <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="parameter"></modal-alarm-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, onBeforeUnmount} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import DeviceStatistics from "../security-monitoring-safty/device-statistics.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import RollTable from "../public/rollTable/index.vue";
import elevatorAnalysisPie from "../public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "../public/elevator-analysis-list.vue"
import noData from "@/components/businessPanel/public/noData.vue";
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import EventAlarmItem from "../public/eventAlarmItem.vue";
import { ModelValueItf } from '../public/types'
import { AlarmAreaTop } from '@/api/models/alarm'
import { alarmrecords, recordStatus, statisticsAreaTop } from '@/api/alarm'
import { setDeviceData } from "@/utils/common";
import { getDeviceBuyArea, getDeviceNumber } from '@/api/device'
import bus from '@/utils/bus'
import moment from 'moment'
import { useStateStore } from '@/pages/state/use-state-store';

interface AlarmHandlType {
  list: AlarmAreaTop[]
}

const alarmModalShow = ref<boolean>(false);
let timer: any = reactive(null);
const { globalState } = useStateStore()
const alarmRecordTime=ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
})
const parameter = reactive({
  areaIds:'',
  alarmStatus:'',
  filterAlarmStatus:'',
  dateRange:[],
})
const deviceParameter = reactive({
    areaId:'',
    anyAreaId:'',
    tagCodes:[],
  dateRange:[],
  filterAreaIds:[],
})
const pieData = ref([]);
const listData = ref([]);
const alarmRank = reactive<AlarmHandlType>({list: []})
const deviceModalShow = ref<boolean>(false);
const column = reactive([
  {
    title: "报警时间",
    dataIndex: "alarmTime",
    width: 120,
  },
  {
    title: "报警级别",
    dataIndex: "alarmLevelName",
  },
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
    width: 140,
  },
  {
    title: "状态",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
  },
]);

const deviceStatisticsData = reactive({
  title: "设备数",
  total: 48,
  itemize: [
    {
      name: "离线",
      label: "在线",
      value: 23,
      offline: 15,
      key: "OFFLINE1",
    },
  ],
});
const deviceStatisticsRecordData = reactive({
  title: "报警总数",
  total: 48,
  itemize: [
    {
      name: "已处理数",
      label: "未处理数",
      value: 23,
      offline: 15,
      key: "OFFLINE",
    },
  ],
});
let handleTime = ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
})
// 报警处理排名
function changeHandleTime() {
    getAlarmHandlTop()
}
const alarmRegion = (value) =>{
  deviceParameter.tagCodes =  [`custom.app::visual.${globalState.business.currentMenu}`]
  if (value.name === '其他') {
    deviceParameter.anyAreaId = undefined
    deviceParameter.filterAreaIds = pieData.value.map(e=>e.areaId).filter(e=>e)
    deviceModalShow.value=true
  }else{
    deviceParameter.filterAreaIds = []
    deviceParameter.anyAreaId = value.areaId
    deviceModalShow.value = true
  }
}
const closeModal = () => {
  alarmModalShow.value = false;
};
const handelClickItemize = (value)=>{
  if(value === '未处理数'){
    parameter.alarmStatus = undefined
    parameter.filterAlarmStatus = ['ALARM_HANDLER'].toString()
  }else if (value === '已处理数') {
    parameter.alarmStatus = 'ALARM_HANDLER'
  }else{
    parameter.alarmStatus = undefined
  }
  parameter.dateRange = handleTime.value.dateRange
  alarmModalShow.value = true
}
const handelOpenDevice = (value)=>{
  if (value !=='在线' || value !== '离线') {
    deviceParameter.tagCodes =  [`custom.app::visual.${globalState.business.currentMenu}`]
    deviceParameter.anyAreaId = undefined
    deviceParameter.filterAreaIds = []
    deviceModalShow.value = true
  }
}
async function getAlarmHandlTop() {
  let params = {
      sceneType: globalState.business.currentMenu,
      areaId: globalState.business.currentAreaId,
      period: handleTime.value.dateRange.join(','),
      type: handleTime.value.timeType,
  }
  alarmRank.list = await statisticsAreaTop(params)
}

const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
const changeEventTimetj = async () => {
  const res = await getDeviceNumber({tagCodes:`custom.app::visual.${globalState.business.currentMenu}`})
  deviceStatisticsData.total = res.totalNumber
  deviceStatisticsData.itemize[0].offline = res.offlineNumber
  deviceStatisticsData.itemize[0].value = res.normalNumber
  const data = await getDeviceBuyArea({
    tagCodes: [`custom.app::visual.${globalState.business.currentMenu}`],
    areaLevel: globalState.business.currentAreaLeave,
  })
  pieData.value = setDeviceData(data,colors)
};
const getAlarmRecords=async ()=>{
  const params={
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: alarmRecordTime.value.dateRange.join(","),
    type: alarmRecordTime.value.timeType,
    pageSize: 50,
    pageNumber: 1,
  }
  const data=await alarmrecords(params)
  listData.value=data.records.map(item=>{
    return {
      ...item,
      alarmTime:moment(item.alarmTime).format("YYYY-MM-DD HH:mm:ss")
    }
  })
}
const getAlarmStatus=async ()=>{
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: alarmRecordTime.value.dateRange.join(","),
    type: alarmRecordTime.value.timeType,
    pageSize: 50,
    pageNumber: 1,
  };
  const res = await recordStatus(params)
  deviceStatisticsRecordData.total=res.alarmNum
  deviceStatisticsRecordData.itemize[0].offline=res.alarmHandlerNum
  deviceStatisticsRecordData.itemize[0].value=res.alarmUnresolvedHandlerNum
}
const changeAlarmRecordDate = ()=>{
  getAlarmRecords()
  getAlarmStatus()
}
const handelClickRow = (record) => {
  if (window.config.entry === 'views') {
    bus.emit("setOpenAlarmModal", {...record,hidePanel:true});
  }else{
    bus.emit("openAlarmModal", record);
  }
};
function init() {
  changeEventTimetj();
}
onMounted(() => {
  init();
  timer = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>
<style lang="less" scoped>
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px;
  padding-top: 0;
  align-items: center;

  .pie_list {
    width: 150px;
    margin-left: 10px;
  }
}

.chart {
  flex: 1;
  height: 150px;
}
</style>
