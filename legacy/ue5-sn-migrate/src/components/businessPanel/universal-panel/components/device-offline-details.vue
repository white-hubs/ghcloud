<template>
  <SubPanelTemplate :title="title">
    <template #extra>
        <div class="dataTitle">
          <div class="dataTitle-right" style="color: #5EA6FF;" @click="handleAll">更多</div>
        </div>
      </template>
      <div class="alarmInfo">
        <deviceModule :data-list="alarmAbnormal"></deviceModule>
      </div>
      <RollTable :column="alarmColumn" :data="listData">
        <template #situation="{ record }">
          <span v-if="record.situation === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
          <span v-else-if="record.situation === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
          <span v-else="record.situation === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
        </template>
      </RollTable>
    </SubPanelTemplate>
    <modal-equipment-table :show-modal="deviceModal" @close="deviceModal = false" :parameter="equipmentParameter"></modal-equipment-table>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from '../../public/subPanelTemplate.vue';
import deviceModule from "../../public/deviceModule.vue";
import RollTable from "../../public/rollTable/index.vue";
import { getDeviceListBuyScene } from '@/api/device'
import modalEquipmentTable from "@/components/modal-table/modal-equipment-table.vue";
import { storeArea } from '@/piniaStore/area'
import { storeMenu } from '@/piniaStore/menu'

const piniaStoreArea = storeArea();
const piniaStoreMenu = storeMenu();
interface Props {
  title: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: '离线设备明细',
});
let alarmAbnormal = reactive([
  {
    title:'在线数量',
    value:0
  },
  {
    title:'离线数量',
    value:0
  },
]);
const alarmColumn = [
  {
    title: "设备编号",
    dataIndex: "code",
    width: 100,
  },
  {
    title: "设备区域",
    dataIndex: "deviceArea",
  },
  {
    title: "状态",
    dataIndex: "deviceStatus",
    width: 30,
  }
];
const equipmentParameter = reactive({status:'OFFLINE'})
const listData = ref([])
const deviceModal = ref(false)
const getData = async() => {
  let query = {
        sceneType:piniaStoreMenu.currentMenu,
        areaId:piniaStoreArea.currentAreaId,
        pageNumber:1,
        pageSize:999,
    }
 const res = await getDeviceListBuyScene(query)
  const onLine = res.records.filter(item=>{
    if (item.status.onlineState) {
      return item
    }
  })
 listData.value = []
 
 res.records.forEach(item=>{
   if (!item.status.onlineState) {
    listData.value.push(
      {
        ...item,
          deviceArea:item.area.pathName,
          deviceStatus:'离线'
      }
    )
   }
 })
 alarmAbnormal[0].value = onLine.length
 alarmAbnormal[1].value = listData.value.length
}
const handleAll = () => {
  deviceModal.value = true
}
onMounted(()=>{
  getData()
})
</script>
<style lang="less" scoped>
.alarmInfo{
  .deviceList{
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  margin-bottom: 10px;
}
.dataTitle-right{
  font-size: 16px;
  cursor: pointer;
}
</style>