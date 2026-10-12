<template>
  <SubPanelTemplate>
    <div class="chart">
      <pieGuidance :y-data="state.pieData" />
    </div>
  </SubPanelTemplate>
</template>

<script setup lang='ts'>
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import { reactive, onMounted } from 'vue';
import pieGuidance from "../public/charts/pie/pie-guidance.vue"
import { cubeVisitorManagementService } from '@/api/service'
const state = reactive<{
  pieData: any[],
  total:number
}>({
  pieData: [
    {name:'未使用',value:0,itemStyle:{color:'#F14545'}},
    {name:'已使用',value:0,itemStyle:{color:'#0099ff'}},
  ],
  total:0
})
const getData = async () => {
  const params = {
    pageSize: 999999,
    pageNumber: 1,
  }
  const reqList =  [
    cubeVisitorManagementService.getReservationRecordPage({
    ...params,
    statusList:'0,1'
  }),
  cubeVisitorManagementService.getReservationRecordPage({
    ...params,
    statusList:'3,4'
  })
]
const resList= await Promise.all(reqList)
state.total=resList.reduce((pre,cur)=>{
  return pre+cur.total
},0)
state.pieData=resList.map((item,index)=>{
  return {
    ...state.pieData[index],
    value:item.total,
  }
})

}

onMounted(() => {
  getData()
})
</script>
<style scoped lang='less'>
.chart {
  height: 300px;
  display: flex;
  align-items: center;
}
</style>