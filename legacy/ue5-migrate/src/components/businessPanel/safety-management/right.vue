<template>
  <div >
    <SubPanelTemplate title="安全巡检统计" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="eventTime" @search="alarmEventTop"></DateInlineForm>
      </template>
      <div v-show="inspectionStat.list.length > 0">
        <DeviceStatistics imgPath="87-icon.png" :statistic="inspectionStat.countStat">
        </DeviceStatistics>
        <div class="switch">
          <div @click="switchClick(item)" v-for="item in switchList" :class="item===currentItem?'active':''">{{ item }}
          </div>
        </div>
        <div class="body" style="min-height: 150px;" >
          <EventAlarmItem @click="openInspect(item)" v-for="(item, index) in inspectionStat.list" :key="item.id" :sort="index + 1" :name="item.name"
            :linkRatio="item.chainRatio" :count="item.number" :ratio="item.ratio + '%'" />
        </div>
      </div>
      <div class="body" style="min-height: 150px;" v-show="inspectionStat.list.length <= 0">
        <noData></noData>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="安全教育统计" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="eduTime" @search="educateStat"></DateInlineForm>
      </template>
      <DeviceStatistics @handelClickItemize="handelClickItemize" imgPath="88-icon.png" :statistic="eduStatisticsData">
      </DeviceStatistics>
      <div class="elevator-analysis">
        <div class="chart">
          <elevator-analysis-pie @clickbar="openSecure" :pieData="detectionData">
            <div style="color: #fff;text-align: center;font-size: 14px;">{{ getallNumber(detectionData,'value') }}</div>
            <div style="color: #fff;text-align: center;font-size: 12px;">教育任务数</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList @handlecurrent="openSecure" :contentList="detectionData" class="pie_list"></elevatorAnalysisList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="消防设备统计" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="fireControlTime" @search="fireControlStat"></DateInlineForm>
      </template>
      <div v-show="listData.length > 0">
        <DeviceStatistics @handelClickItemize="clickRow" imgPath="89-icon.png" :statistic="deviceStatisticsData">
        </DeviceStatistics>
        <RollTable :column="column" :data="listData" :limitScrollNum="4">
          <template #alarmStatus="{ record }"> 
            <span v-if="record.expireStatus === 'EXPIRE'" style="color: #f14545">已过期</span>
            <span v-else="record.alarmStatus === 'NOT_EXPIRED'" style="color: #00f27b">已处理</span>
          </template>
        </RollTable>
      </div>
      <div v-show="listData.length === 0">
        <noData></noData>
      </div>
    </SubPanelTemplate>
  <modal-alarm-table  :show-modal="alarmModalShow" @close="alarmModalShow = false" :parameter="parameter"></modal-alarm-table>
  <safety-education-table  :show-modal="secureModalShow" @close="secureModalShow = false" :parameter="secureParameter"></safety-education-table>
  <small-inspect-table :show-modal="inspectModalShow" @close="inspectModalShow = false" :parameter="inspectParameter"></small-inspect-table>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref } from 'vue';
import SubPanelTemplate from '../public/subPanelTemplate.vue';
import DateInlineForm from '../public/dateInlineForm.vue';
import DeviceStatistics from "../security-overview/components/device-statistics.vue";
import RollTable from "../public/rollTable/index.vue";
import elevatorAnalysisPie from "../public/charts/pie/elevator-analysis-pie.vue"
import safetyEducationTable from "./components/safety-education-table.vue";
import smallInspectTable from "./components/small-inspect-table.vue";
import elevatorAnalysisList from "../public/elevator-analysis-list.vue"
import {insTaskCountStat,insTaskStat} from '@/api/maintain'
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import { ModelValueItf } from '../public/types'
import EventAlarmItem from '../public/eventAlarmItem.vue';
import {getSafetyEdu,getSafetyEduTheme} from '@/api/safety-education'
import noData from '@/components/businessPanel/public/noData.vue'
import { getallNumber } from "@/utils/common";
import {expiredChain, expiredPage} from '@/api/device'
import useCommon from '@/components/hooks/useCommon'
import { sourceLedgerPage } from '@/api/property';
import dayjs from 'dayjs';
const {
  piniaStoreArea,
  piniaStoreMenu,
} = useCommon();
//安全巡检统计==================================================================================================
const eventTime = ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
})
const eduTime=ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
})
const fireControlTime=ref<ModelValueItf>({
  timeType:'THIS_YEAR',
  dateRange:[]
})
const parameter = reactive({
  dateRange:[],
})
const secureParameter = reactive({
  period:'',
  themeId:''
})
const inspectParameter = reactive({
  depId:'',
  status:'',
  period:'',
})
const alarmModalShow = ref<boolean>(false);
const secureModalShow = ref<boolean>(false);
const inspectModalShow = ref<boolean>(false);
const switchList=['任务数','完成数']
const currentItem=ref('任务数')
const switchClick=(index)=>{
  currentItem.value=index
  getInsStat()
}
const inspectionStat=reactive({
  countStat:{
  title: "巡检任务总数",
  total: 0,
  itemize: [
    {
      name: "进行中任务数：",
      label: "待接收任务数：",
      value: 0,
      offline: 0,
      key: "OFFLINE1",
    }
  ],
  },
  list:[]
})
const getInsCount=async ()=>{
  const params={
    begin:eventTime.value.dateRange[0],
    end:eventTime.value.dateRange[1]
  }
 const res = await insTaskCountStat(params)
 inspectionStat.countStat.total=res.inspectionTaskNum
 inspectionStat.countStat.itemize[0].value=res.waitAcceptNum
 inspectionStat.countStat.itemize[0].offline=res.underwayTaskNum
}
const getInsStat=async ()=>{
  const params={
    period:eventTime.value.dateRange.join(','),
    status:currentItem.value==='任务数'?'':'OVER'
  }
const res=await insTaskStat(params)
const allCount=res.reduce((pre,item)=>{
  return pre+item.taskNum
  },0)
 inspectionStat.list=res.map(item=>{
  return {
    name:item.depName,
    id:item.depId,
    number:item.taskNum,
    ratio:+(item.taskNum/allCount).toFixed(2)*100,
    chainRatio:item.chainRatio,
  }
 })
}
const openInspect = (item)=>{
  if (currentItem.value === '任务数') {
    inspectParameter.depId = item.id
    inspectParameter.status = ''
  }else{
    inspectParameter.depId = ''
    inspectParameter.status = 'OVER'
  }
  inspectParameter.period = eventTime.value.dateRange.join(",")
  inspectModalShow.value = true
}
const clickRow = ()=>{
  parameter.dateRange = fireControlTime.value.dateRange
  alarmModalShow.value = true
}
const handelClickItemize = ()=>{
  secureParameter.period = eduTime.value.dateRange.join(",")
  secureModalShow.value = true
}
const openSecure = (data)=>{
  secureParameter.themeId =  detectionData.value.find(e=>e.name === data.name ).id
  secureParameter.period = eduTime.value.dateRange.join(",")
  secureModalShow.value = true
}
const alarmEventTop =async () => {
  getInsCount()
  getInsStat()
}
//安全教育统计==================================================================================================
const eduStatisticsData= reactive({
  title: "教育任务总数",
  total: 48,
  qoq:6
});
const detectionData = ref([])
//消防设备统计==================================================================================================
const listData = ref([{alarmTime:'11',}]);
const column = reactive([
  {
    title: "设备名称",
    dataIndex: "name",
    width: 120,
  },
  {
    title: "设备类型",
    dataIndex: "typeName",
  },
  {
    title: "使用年限",
    dataIndex: "usageDate",
    width: 140,
  },
  {
    title: "状态",
    dataIndex: "status",
    slots: {
      customRender: "status",
    },
  },
]);
const deviceStatisticsData = reactive({
  title: "到期设备数",
  total: 48,
});
const getEduCount=async ()=>{
  const params={
    period:eduTime.value.dateRange.join(','),
    type:eduTime.value.timeType
  }
  const data=await getSafetyEdu(params)
  eduStatisticsData.qoq=data.chainRatio
  eduStatisticsData.total=data.totalNum
}
const getEduStat=async ()=>{
  const params={
    period:eduTime.value.dateRange.join(','),
    type:eduTime.value.timeType
  }
  const data=await getSafetyEduTheme(params)
  detectionData.value=data.map(item=>{
    return {
      id:item.id,
      name:item.name,
      value:item.totalNum
    }
  })
}
const educateStat=()=>{
  getEduCount()
  getEduStat()
}
const getFireControlCount=async ()=>{
  const params={
    status:'EXPIRE',
    typeCode:'FIRE_FIGHTING_EQUIPMENT'
  }
  const data=await sourceLedgerPage(params)
  deviceStatisticsData.total = data.total
  listData.value = data.records.map(e=>{
    return{
      ...e,
      status:e.status==='EXPIRE'?'已过期':'正常',
      usageDate:e.usageDate?dayjs(e.usageDate).format('YYYY-MM-DD'):'-'
    }
  })
}
const fireControlStat=()=>{
  getFireControlCount()
}
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

.switch {
  display: flex;
  justify-content: flex-end;
  color: #ffffff;
  height: 20px;
  line-height: 20px;
  font-size: 20px;

  div {
    cursor: pointer;
    padding: 0px 2px;
    font-size: 14px;
  }

  .active {
    background: linear-gradient(180deg, rgba(41, 137, 255, 0) 0%, #2989FF 100%);
  }
}

.chart {
  flex: 1;
  height: 180px;
}
.body{
  height: 150px;
  overflow-y: auto;
}
</style>