<template>
  <SubPanelTemplate title="最新紧急电话">
    <div class="footer">
      <RollTable :column="column" :data="listData" :showLength="5">
        <template #fileUrl="{ record }">
          <div class="operate">
            <span @click="play(record)">播放</span>
            <span @click="cease">停止</span>
          </div>
        </template>
      </RollTable>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import { emergencyPhone } from "@/api/securitymanagement";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const column = [
  {
    title: "设备编号",
    dataIndex: "deviceCode",
    width: 100,
  },
  {
    title: "设备区域",
    dataIndex: "areaName",
    width: 120,
  },
  {
    title: "紧急电话内容",
    dataIndex: "fileUrl",
    slots: {
      customRender: "fileUrl",
    },
  },
];
const listData = ref<{ label: string; value: number; color?: string }[]>([]);
const audio = ref();

const getEmergencyPhone = async () => {
  const res = await emergencyPhone({ pageSize: 10, pageNumber: 1 });
  listData.value = res.records;
};

const play = (data) => {
  audio.value = new Audio(data.fileUrl);
  audio.value.play();
};
const cease = () => {
  if (audio.value) {
    audio.value.pause();
  }
};

onMounted(() => {
  getEmergencyPhone();
});
</script>

<style lang="less" scoped>
.operate {
  color: #1890ff;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}
</style>
