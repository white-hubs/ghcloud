<template>
  <SubPanelTemplate>
    <div class="records-roll-table">
      <RollTable :showLength="10" :column="column" :data="state.dataSource" />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang='ts'>
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import {cubeVisitorManagementService} from '@/api/service'
import RollTable from "../public/rollTable/index.vue";
import { reactive, onMounted } from 'vue';
import moment from 'moment'
interface ListItem { 
  name: string; 
  value: number; 
  color?: string
 }
 const column = [
 {
    title: "区域",
    dataIndex: "address",
  },
  {
    title: "预约日期",
    dataIndex: "reserveDay",
  },

  {
    title: "预约时段",
    dataIndex: "reservePeriod",
  },
  {
    title: "预约人",
    dataIndex: "name",
  },
]
/**
* 数据部分
*/
const state = reactive<{
  dataSource: any[],
}>({
  dataSource: [],

})
const getData=async () => {
  const params={
    pageNumber:1,
    pageSize:10
  }
  const result=await cubeVisitorManagementService.getReservationRecordPage(params)
  state.dataSource=result.records.map(item=>{
    return {
      ...item,
      reserveDay:moment(item.dayStr).format('MM.DD'),
      reservePeriod:formatPeriod(item.timeStr)
    }
  })
}
const formatPeriod=(timeStr)=>{
  if(!timeStr) return '--'
  const time=timeStr.split('-')
  if(time.length<2) return '--'
  return `${time[0].split(':').slice(0,2).join(':')}-${time[1].split(':').slice(0,2).join(':')}`
}
onMounted(() => {
  getData()
})
</script>
<style scoped lang='less'>
.records-roll-table {
  margin-top: 12px;
  padding-right: 8px;
  height: 300px;
}
</style>