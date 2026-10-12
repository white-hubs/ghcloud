<template>
  <c-layout title="能耗报警" class="w-50%">
    <template #header-btn>
      <timeRadioGroup
        ref="TimeRadioGroupRef"
        v-model:value="trendTimeData.period"
        show-range-picker
        @change="changeTrendTime"
      />
    </template>
    <template #content>
      <div class="flex justify-between items-center rd-10px p-15px box-border" style="flex-wrap: nowrap;">
        <div v-for="item in synthesizeList" :key="item.id"
          class="bg-#fafafa w-150px h-70px box-border p-15px text-center mt-5px">
          <span class="color-#758196">{{ item.name }}</span>
          <div class="text-18px">{{ item.num }}</div>
        </div>
      </div>
      <div class="flex" style="height:290px">
        <div style="width: 40%;height: 100%;position: relative;">
          <EPie 
          :radius="['0%','70%']" 
          :legend="{top: 'bottom'}" 
          :label="{show: true,position: 'inner'}"
          :data="energyAlarmData" v-if="energyAlarmData.length>0" />
          <Empty v-if="energyAlarmData.length===0" description="暂无报警级别数据"></Empty>
        </div>
        <div style="width: 60%;height: 100%;position: relative; overflow-y: scroll;">
          <rollTable :column="alarmRecordsColumns" :data="alarmRecordsDataList">
            <template #alarmStatus="{ record }">
              <span
                v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'"
                style="color: #f14545"
                >待处理</span
              >
              <span
                v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'"
                style="color: #ffab10"
                >处理中</span
              >
              <span
                v-else="record.alarmStatus === 'ALARM_CONFIRMED'"
                style="color: #00f27b"
                >已处理</span
              >
            </template>
          </rollTable>
          <Empty v-if="alarmRecordsDataList.length===0" description="暂无报警记录"></Empty>
        </div>
      </div>
    </template>
  </c-layout>
</template>
<script setup lang="ts">
import CLayout from '@/components/common/cLayout.vue'
import rollTable from '@/components/echart/roll-table.vue'
import { onMounted, ref } from 'vue'
import { alarmRecords, alarmStatisticsStatusGroup } from '@/api/alarm'
import EPie from '@/components/echart/ePie.vue'
const trendTimeData = ref< {timeFlag: 'TODAY'|'THIS_MONTH'|'THIS_YEAR'|'free'; period: string; }>({timeFlag: 'TODAY',period: ''})
const changeTrendTime= (time:'TODAY'|'THIS_MONTH'|'THIS_YEAR') => {
  trendTimeData.value.timeFlag = time
  getData()
}
onMounted(()=>{
  getData()
})
//顶部数据===================================================================================================================================
const synthesizeList = ref<{ name: string; num: number|string; id: string; }[]>([])
//饼图===================================================================================================================================
const energyAlarmData = ref<{ value: number; name: string; }[]>([])
//列表===================================================================================================================================
const alarmRecordsDataList=ref<any[]>([])
const alarmRecordsColumns=ref<any[]>([])
const getData=async ()=>{
  // 顶部数据
  const {data:alarmStatisticsStatusGroupData} = await alarmStatisticsStatusGroup({applicationCode:'ENERGY_CONSUMPTION',period:trendTimeData.value.period})
  synthesizeList.value=alarmStatisticsStatusGroupData.map((e: { alarmStatus: any; alarmStatusName: any; alarmNum: any })=>{
    return {
      id: e.alarmStatus,
      name: e.alarmStatusName,
      num: e.alarmNum
    }
  })
  // 饼图echart
  energyAlarmData.value = alarmStatisticsStatusGroupData.map((res: { alarmNum: number; alarmStatusName: string; }) => {
      return {
        value: res.alarmNum,
        name: res.alarmStatusName
      }
    }).filter((item: { value: number; }) => item.value > 0)
  // 报警记录
  const {data:alarmRecordsData} = await alarmRecords({applicationCode:'ENERGY_CONSUMPTION',period:trendTimeData.value.period,pageNumber:1,pageSize:1000})
  alarmRecordsDataList.value=alarmRecordsData.records
  alarmRecordsColumns.value=[
    { title: "报警事件",dataIndex: "alarmEventName",width: 120,},
    { title: "仪表",dataIndex: "alarmTargetName",width: 120,},
    { title: "状态",dataIndex: "alarmStatus",width: 120,slots: {
      customRender: "alarmStatus",
    },}
  ]
}
</script>
<style scoped lang="less">
.record-item{
  height: 85px;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 5px;
  background-color: rgb(251, 249, 248);
  margin-right: 10px;
  .name{
    height: 100%;
    width: 15%;
    background-color: rgba(255, 255, 255, 1);
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    align-items: center;
  }
  .info{
    width: 82%;
    height: 100%;
    display: flex;
    flex-flow: column;
    justify-content: space-around;
    .second-info{
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>