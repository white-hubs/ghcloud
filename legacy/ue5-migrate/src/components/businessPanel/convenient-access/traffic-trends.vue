<template>
  <SubPanelTemplate title="实时通行数据" class="alarm-event">
    <template #extra>
        <div class="dataTitle">
          <div class="dataTitle-right" style="color: #5EA6FF;" @click="handleAll">查看更多>></div>
        </div>
      </template>
      <div style="height: 200px;">
        <RollTable  :column="columns" :data="data" :showLength="8"> </RollTable>
      </div>
    <trafficRecordsModal :showModal="showModal" @close="showModal = false"></trafficRecordsModal>
  </SubPanelTemplate>
</template>

<script setup lang="ts"> 
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import RollTable from "../public/rollTable/index.vue";
import moment from 'moment'
import trafficRecordsModal from "./trafficRecords-modal.vue";
import { throughData } from '@/utils/requestData/accessControl'
const showModal = ref(false);
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
// 实时通行数据
const realTimeTrafficData = async () => {
let res = await throughData();
  res.forEach(item=>{
    item.eventTime = moment(item.eventTime).format('YYYY-MM-DD HH:mm:ss')
  })
  data.value = res.filter(item=>{
    if (moment(item.eventTime).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
      return item
    }
  })
};
const handleAll = ()=>{
  showModal.value = true
}
onMounted(() => {
  realTimeTrafficData()
})
const data = ref<any>([]);
</script>
<style lang="less" scoped>
.dataTitle {
  color: #ABB8CB;
  font-size: 14px;
  text-align: right;

  .dataTitle-right {
    cursor: pointer;
  }
}
</style>