<template>
  <SubPanelTemplate title="违规统计" image="wgtj.png">
    <template #extra>
      <DateInlineForm v-model:modelValue="alarmTime" @search="handleTime" menuPage="electricCar" />
    </template>
    <div class="container">
      <a-tabs v-model:activeKey="activeKey" @change="handleChangeTab">
        <a-tab-pane key="CHARGE" tab="违规充电"></a-tab-pane>
        <a-tab-pane key="PARKING" tab="违规停放" force-render></a-tab-pane>
        <a-tab-pane key="ELEVATOR" tab="违规入电梯" force-render></a-tab-pane>
      </a-tabs>
      <div class="content">
        <div class="more" @click="handleClickMore">查看更多></div>
        <div class="stat-container" v-if="dataList.length">
          <div class="stat-list">
            <RankStatItem v-for="item in dataList" :key="item.name" v-bind="item" @click="clickRow(item)" />
          </div>
        </div>
        <div style="width: 100%; margin-top: 30px" v-else>
          <noData />
        </div>
      </div>
    </div>
    <AlarmStatisticsModal @close="showMoreState.showMorelModal = false" :modalTitle="showMoreState.title"
      :showModal="showMoreState.showMorelModal" :field-names="showMoreState.fieldNames"
      :getDataFunc="showMoreState.fetchApi" :parameter="showMoreState.parameter"></AlarmStatisticsModal>
  </SubPanelTemplate>
</template>

<script setup lang='ts'>
import SubPanelTemplate from "../../common/snPanelTemplate.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import {  onMounted, ref } from 'vue';
import { ModelValueItf } from '@/components/businessPanel/public/types'
import DateInlineForm from "../../common/dateInlineForm.vue";
import RankStatItem from '@/components/shengnong-custom-panel/common/rank-stat-item.vue'
import {getSafetyMarketAbnormalList} from '@/api/shennong/safety'
import AlarmStatisticsModal from "../../security-monitoring/components/alarm-statistics-modal.vue";
import {alarmStatisticsRank} from '@/api/shennong/alarm'
import { filterMarket } from "@/utils/common";
const applicationCode='ELECTRlC_VEHICLE'

/**
* 数据部分
*/
const emits= defineEmits(['clickViolationRow','clickAlarmRow','clickMore'])
// 调用违规接口的key
const marketErrorList=['CHARGE','PARKING']

const fetchSafetyMarketStatList = async (params: any) => {
  const payload={
    ...params,
    errorTags:activeKey.value
  }
  return await getSafetyMarketAbnormalList(payload)
}
const fetchAlarmStatisticsRank = async (params: any) => {
  const payload={
    ...params,
    alarmEventTypeCode:'electricVehucle_wgrt'
  }
  return await alarmStatisticsRank(payload)
}
const showMoreState=ref({
  showMorelModal:false,
  fetchApi: fetchSafetyMarketStatList,
  title:'车辆违规/违停记录',
  parameter:{
    applicationCode,
    alarmTypeCode: '',
    dateRange:[],
    type:'',
  },
  fieldNames:{
    name:'marketName',
    value:'taskNum',
    chainRatio:'ratio',
  }
})
const handleClickMore = () => {
  if(activeKey.value==='ELEVATOR'){
    showMoreState.value.fetchApi = fetchAlarmStatisticsRank
    showMoreState.value.fieldNames.value='totalNum'
    showMoreState.value.fieldNames.chainRatio='chainRatio'
    showMoreState.value.title = '各市场电动车违规入电梯统计'
  }else{
    showMoreState.value.fetchApi= fetchSafetyMarketStatList
    showMoreState.value.fieldNames.value='taskNum'
    showMoreState.value.fieldNames.chainRatio='ratio'
    showMoreState.value.title = '各市场车辆违规/违停记录'
  }
  showMoreState.value.parameter = {
    applicationCode,
    alarmTypeCode: '',
    dateRange:alarmTime.value.dateRange,
    type :alarmTime.value.timeType
  }
  showMoreState.value.showMorelModal = true
}
const activeKey = ref("CHARGE");
onMounted(() => {
})
const alarmTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [],
});
// mock数据
const dataList = ref<any[]>([
  {
    lineColor:'linear-gradient(63deg, rgba(97, 148, 247, 0.14) 0%, rgba(148, 186, 249, 1) 100%)',//进度条颜色
    rank: 1,//排名
    name: "上海",//名称
    chainRatio: '-10',//环比
    count: 100,//数值
    percent: '50%',//百分比
  },
]) 
const handleTime = async() => {
  const params= {
    pageNumber: 1,
    pageSize:100,
    type:alarmTime.value.timeType,
    period:alarmTime.value.dateRange.join(','),
    errorTags:activeKey.value
  }
  if(activeKey.value==='ELEVATOR'){
    getAlarmStatisticsRank()
    return
  }
  const {records} = await getSafetyMarketAbnormalList(params)
  const newRecords = filterMarket(records)
  const total = newRecords.reduce((pre,cur)=>pre+cur.taskNum,0)
  dataList.value = newRecords.map((item,index)=>{
    return {
      lineColor:'linear-gradient(63deg, rgba(97, 148, 247, 0.14) 0%, rgba(148, 186, 249, 1) 100%)',//进度条颜色
      rank: index + 1,//排名
      name: item.marketName,//名称
      count: item.taskNum,//数值
      marketTenant: item.marketTenant,//市场编码
      chainRatio: item.ratio,//环比
      percent:total ? item.taskNum/total*100 + '%':'0%'//百分比
    }
  }).slice(0, 6)
}
const getAlarmStatisticsRank = async() => {
  const params= {
    period: alarmTime.value.dateRange.join(","),
    type: alarmTime.value.timeType,
    stateRange: '',
    pageSize: 500,
    pageNumber: 1,
    alarmEventTypeCode:'electricVehucle_wgrt',
    applicationCode:applicationCode,
  }
  const {records} = await alarmStatisticsRank(params)
  const total = records.reduce((pre,cur)=>pre+cur.totalNum,0)
  dataList.value = records.map((item,index)=>{
    return {
      lineColor:'linear-gradient(63deg, rgba(97, 148, 247, 0.14) 0%, rgba(148, 186, 249, 1) 100%)',//进度条颜色
      rank: index + 1,//排名
      name: item.marketName,//名称
      count: item.totalNum,//数值
      marketTenant: item.marketTenant,//市场编码
      chainRatio: item.chainRatio,//环比
      percent:total ? item.totalNum/total*100 + '%':'0%'//百分比
    }
  }).slice(0, 6)
}
const handleChangeTab = () => {
  if(marketErrorList.includes(activeKey.value)){
    handleTime()
    return
  } 
  getAlarmStatisticsRank()
}
const clickRow = (item: any) => {
  if(marketErrorList.includes(activeKey.value)){
    emits('clickViolationRow',{
    ...item,
    period: alarmTime.value.dateRange,
    tagList:activeKey.value,
   })
   return
  }
  emits('clickAlarmRow',{
    ...item,
    dateRange: alarmTime.value.dateRange,
  })
}
</script>
<style scoped lang='less'>
:deep(.rank-stat-item) {
  margin-bottom: 27px;
}

:deep(.rank) {
  width: 26px !important;
  line-height: 20px !important;
  background: rgba(217, 231, 255, 0.10) !important;
  border: 0.5px solid rgba(69, 133, 244, 0.80) !important;
  border-radius: 2px !important;

  &.rank-1 {
    background: rgba(237, 73, 73, 0.10) !important;
    border: 0.5px solid rgba(237, 73, 73, 0.50) !important;
  }

  &.rank-2 {
    background: rgba(255, 170, 0, 0.10) !important;
    border: 0.5px solid rgba(255, 170, 0, 0.50) !important;
  }
}



:deep(.ant-tabs) {
  height: 28px;
  font-size: 16px !important;
}

:deep(.ant-tabs-nav .ant-tabs-tab) {
  display: block;
  margin: 0px 10px;
  padding: 0px;
  color: #93AADB;
}

:deep(.ant-tabs-tab-active) {
  border-bottom: 1px solid #6194F7;
  background: linear-gradient(180deg, rgba(97, 148, 247, 0.02), rgba(97, 148, 247, 0.50) 96%);
  color: #6194F7;
}

:deep(.ant-tabs-top > .ant-tabs-nav) {
  margin: 0px;
}

.sub-panel {
  flex: 1;
}

.stat-list {
  padding: 10px 0;
}

.stat-container {
  height: 100%;
  padding: 10px 0;
  overflow: hidden;
}

.container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content {
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  flex: 1;

  .more {
    color: #93AADB;
    font-size: 14px;
    text-align: right;
    cursor: pointer;
    margin: 4px 0;
  }

  .scroll {
    height: 100%;
    flex: 1;
    overflow: hidden;
  }
}
</style>