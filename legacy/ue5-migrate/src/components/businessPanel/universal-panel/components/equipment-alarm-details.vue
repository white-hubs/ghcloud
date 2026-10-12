<template>
    <SubPanelTemplate :title="title"  style="maxHeight: 250px;" class="product-table">
      <template #extra>
        <div class="dataTitle">
          <div class="dataTitle-right" style="color: #5EA6FF;" @click="handleAll">更多</div>
        </div>
      </template>
      <RollTable :column="alarmColumn" :data="alarmListData" :showLength="4">
        <template #alarmStatus="{ record }">
          <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待接收</span>
          <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
          <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
        </template>
      </RollTable>
    <modal-alarm-table :show-modal="deviceModal" @close="closeModal" :parameter="alarmParameter"></modal-alarm-table>
    </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref,onMounted} from 'vue'
import { alarmStatisticsList } from '@/api/alarm'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-tableNew.vue";
import RollTable from "../../public/rollTable/index.vue";
import { useStateStore } from '@/pages/state/use-state-store';
interface Props {
  title: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: '设备报警明细',
});
const { globalState } = useStateStore()
const alarmParameter = ref<Record<string, any>>({});
const deviceModal = ref<boolean>(false);
const alarmListData = ref([])
const alarmColumn = [
  {
    title: "设备名称",
    dataIndex: "alarmTargetName",
    width: 120,
  },
  {
    title: "所属区域",
    dataIndex: "areaName",
  },
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
  },
  {
    title: "当前状态",
    dataIndex: "status",
    width: 140,
    slots: {
      customRender: "alarmStatus",
    },
  }
];

const handleAll = () => {
  deviceModal.value = true
}
const closeModal = () => {
    deviceModal.value = false;
};
// 获取报警列表
async function getAlarmTakeNotes() {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    pageSize: 50,
    pageNumber: 1,
  };
  let res: any = await alarmStatisticsList(params);
  alarmListData.value = res.records.map((item) => {
    return {
      ...item
    };
  });
}
onMounted(()=>{
  getAlarmTakeNotes()
})
</script>
<style lang="less" scoped>
.dataTitle-right{
  font-size: 16px;
  cursor: pointer;
}
.product-table{
  max-height: 250px;
  overflow: hidden;
}
</style>