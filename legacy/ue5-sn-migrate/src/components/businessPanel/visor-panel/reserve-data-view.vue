<template>
  <SubPanelTemplate>
    <div class="data-stat">
      <DisplayPanel :bg-img="'overView47.png'" :content-list="state.listData"></DisplayPanel>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang='ts'>
import { reactive, toRefs, onMounted } from 'vue';
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DisplayPanel from "@/components/businessPanel/public/display-panel.vue";
import {cubeVisitorManagementService} from '@/api/service'
import moment from "moment";
const dateFormat = "YYYY-MM-DD HH:mm:ss";
interface ListItem { 
  name: string; 
  value: number; 
  color?: string
 }
/**
* 数据部分
*/
const state = reactive<{
  listData: ListItem[]
}>({
  listData: [
    {
      name: '今日预约人数',
      value: 0,
      color: '#1890FF'
    },
    {
      name: '本周预约人数',
      value: 0,
      color: '#FACC14'
    },
    {
      name: '本月预约人数',
      value: 0,
      color: '#FF4D4F'
    }
  ],
})
const todayPeriod= [moment().format('YYYY-MM-DD 00:00:00'), moment().format(dateFormat)];
const currentWeekPeriod= [moment().startOf("week").add(1, 'days').format('YYYY-MM-DD 00:00:00'), moment().endOf("week").add(1, 'days').format(dateFormat)];
const currentMonthPeriod= [moment().startOf("month").format('YYYY-MM-DD 00:00:00'), moment().endOf("months").format(dateFormat)];
const getListData= async ()=>{
  const params = {
    pageSize: 999999,
    pageNumber: 1,
  }
  const reqList=[
   cubeVisitorManagementService.getReservationRecordPage({
    ...params,
    period: todayPeriod.join(',')
  }),
   cubeVisitorManagementService.getReservationRecordPage({
    ...params,
    period: currentWeekPeriod.join(',')
  }),
   cubeVisitorManagementService.getReservationRecordPage({
    ...params,
    period: currentMonthPeriod.join(',')
  })
  ]
  const resList= await Promise.all(reqList)
  state.listData=resList.map((item,index)=>{
    return {
      ...state.listData[index],
      value:item.total
    }
  })
}
onMounted(() => {
  getListData()
})
</script>
<style scoped lang='less'>
.data-stat {
  margin-top: 10px;
  padding: 24px 12px;
  height: 240px;
}
</style>