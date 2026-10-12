<template>
  <SubPanelTemplate title="设备报警">
    <template #extra>
      <span class="more" @click="handelClickDeviceNum"> 查看更多>> </span>
    </template>
    <RollTable style="height: 200px" :column="column" :data="listData">
      <template #alarmStatus="{ record }">
        <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
        <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
        <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
      </template>
    </RollTable>
  </SubPanelTemplate>
  <modal-alarm-table :show-modal="alarmModalShow" @close="closeModal" :parameter="alarmParameter"></modal-alarm-table>
</template>

<script setup lang="ts">
import moment from "moment";
import { ref, reactive, onMounted } from "vue";

import { alarmStatisticsList } from "@/api/alarm";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-tableNew.vue";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();

const column = reactive([
  {
    title: "报警时间",
    dataIndex: "alarmTime",
    width: 120,
  },
  {
    title: "报警级别",
    dataIndex: "alarmLevelName",
    width: 120,
  },
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
    width: 140,
  },
  {
    title: "状态",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
  },
]);
const listData = ref([]);
const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({});

const handelClickDeviceNum = (item: any) => {
  alarmModalShow.value = true;
};
const closeModal = () => {
  alarmModalShow.value = false;
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

  listData.value = res.records.map((item: any) => {
    return {
      ...item,
      alarmTime: moment(item.alarmTime).format("YYYY-MM-DD"),
    };
  });
}

onMounted(() => {
  getAlarmTakeNotes();
});
</script>

<style lang="less" scoped>
.more {
  color: #2f8dff;
  cursor: pointer;
  font-size: 16px;
}
</style>
