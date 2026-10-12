<template>
  <div></div>
  <SubPanelTemplate title="实时出入记录">
    <RollTable :column="columns" :data="data" :showLength="8"> </RollTable>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { getAccessRecords } from '@/api/park-management'
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import dayjs from "dayjs";

const columns = ref([
  {
    title: "时间",
    dataIndex: "accessTime",
    width: 120,
  },
  {
    title: "车牌号码",
    dataIndex: "vehicleNo",
  },
  {
    title: "出入场",
    dataIndex: "accessType",
  },
  {
    title: "所属停车场",
    dataIndex: "parkingInfoName",
  },
]);
const data = ref<any>([]);

onMounted(async () => {
 const res = await getAccessRecords({
  pageNumber: 1,
  pageSize: 20,
 })
 data.value = res.records.map(e=>{
  return {
    ...e,
    accessTime: dayjs(e.accessTime).format('YYYY-MM-DD HH:mm'),
    accessType: e.accessType === 'ACCESS_IN' ? '入场' : '出场'
  }
 })
})
</script>
<style lang="less" scoped>
.chart {
  height: 220px;
}
</style>