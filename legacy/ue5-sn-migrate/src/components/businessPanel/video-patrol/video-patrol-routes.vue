<template>
  <SubPanelTemplate title="视频巡逻路线">
    <div class="operateDays">
      <OperateDays :value="numberPasses" title="巡逻路线" > </OperateDays>
    </div>
    <div class="operateTable">
      <RollTable :column="columns" :data="patrolRoute" :showLength="8">
        <template #operate="{ record }">
          <div class="operate" @click="goDetails(record)">
            巡逻
          </div>
        </template>
      </RollTable>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { cameraPatrolLines } from '@/api/vmonitor'
import bus from "@/utils/bus";

const numberPasses = ref(0)
const columns = ref([
  {
    title: "巡逻路线",
    dataIndex: "eventTime",
    width: 120,
  },
  {
    title: "监控点位",
    dataIndex: "doorName",
  },
  {
    title: "操作",
    dataIndex: "operate",
    slots: {
      customRender: "operate",
    },
  },
]);
const patrolRoute = ref([])
const goDetails = (value)=>{
  bus.emit("setPanel", {
    ...value,
    rightPanelName:'PatrolRouteDetails',
    leftPanelName:''
  });
}
const getCameraPatrolLines = async ()=>{
  const res = await cameraPatrolLines({
    pageNumber:1,
    pageSize:50,
  })
  numberPasses.value = res.total
  patrolRoute.value = res.records.map(e=>{
    return {
      eventTime:e.name,
      doorName:e.cameraNum,
      ...e
    }
  })
}
onMounted(()=>{
  getCameraPatrolLines()
})
</script>
<style lang="less" scoped>
.operate {
  color: #1890FF;
  cursor: pointer;
}
.operateDays{
  margin-bottom: 10px;
}
.operateTable{
  height: 250px;
}
</style>