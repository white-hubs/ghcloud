<template>
  <SubPanelTemplate title="实时通行数据" class="alarm-event">
    <RollTable :column="columns" :data="data" :showLength="8"> </RollTable>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref,onMounted} from 'vue'
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { visualizationEvent } from '@/api/door'
import moment from "moment"
import { useStateStore } from '@/pages/state/use-state-store';

const { globalState } = useStateStore()
const columns = ref([
  {
    title: "时间",
    dataIndex: "eventTime",
    width: 120,
  },
  {
    title: "门禁名称",
    dataIndex: "doorName",
  },
  {
    title: "通行方式",
    dataIndex: "eventWay",
  },
]);
const data = ref<any>([]);
// 实时通行数据
const realTimeTrafficData = async () => {
  let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        pageNumber:1,
        pageSize:50,
    }
let res = await visualizationEvent(param);
  res.records.forEach(item=>{
    item.eventTime = moment(item.eventTime).format('YYYY-MM-DD HH:mm:ss')
  })
  data.value = res.records.filter(item=>{
    if (moment(item.eventTime).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
      return item
    }
  })
};
onMounted(() => {
  realTimeTrafficData()
})
</script>
<style lang="less" scoped></style>