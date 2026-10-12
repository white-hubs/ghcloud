<template>
  <RollTable :column="columns" :data="dataSource" :showLength="20" style="height: 520px; overflow-y: auto">
    <template #recordTime="{ record }">
      <span>{{ record.recordTime ? dayjs(record.recordTime).format('YYYY-MM-DD HH:mm') : '--' }}</span>
    </template>
  </RollTable>
</template>
<script setup lang="ts">
import { ref } from "vue";
import dayjs from "dayjs";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";

interface Props {
  type: string;
  id: string;
  dataSource: any;
}
const props = withDefaults(defineProps<Props>(), {
  type: "",
  id: "",
  dataSource: []
});

const loadingDataSource = ref(false);
const columns = ref([
  {
    title: "反馈时间",
    dataIndex: "recordTime",
    slots: {
      customRender: "recordTime",
    },
  },
  {
    title: "反馈人",
    dataIndex: "username",
    sorter: true,
  },
  {
    title: "反馈部门",
    dataIndex: "depName",
    sorter: true,
  },
  {
    title: "工程进度",
    dataIndex: "feedbackContent",
    sorter: true,
  },
]);
</script>

<style lang="less" scoped>
.alarm-level-select,
.handle-status-select {
  width: 150px;
}
:deep(.ant-pagination-total-text) {
  color: #fff;
}
:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 1);
}

:deep(.ant-select-selection-item) {
  color: rgba(255, 255, 255, 1);
}

:deep(.ant-pagination-item-ellipsis) {
color: #fff !important;
}

:deep(.ant-pagination-item) {
background: rgba(255, 255, 255, 0.1);

a {
  color: #fff;
}
}

:deep(.ant-pagination-item-active) {
background: #1890ff;

a {
  color: #fff;
}
}

:deep(.ant-modal-content) {
background-color: rgba(4, 17, 32, 0.92) !important;
}
:deep(.ant-form-item-label > label){

color: rgba(255, 255, 255, 1);
}
:deep(.ant-select-selection-item){

color: rgba(255, 255, 255, 1);
}
:deep(.ant-select-item),:deep(.ant-empty-small){
background: rgba(255, 255, 255, 0.1) !important;
color: #fff !important;
}
:deep(.ant-select-item-empty){
  background: rgba(255, 255, 255, 0.1) !important;
}
:deep(.ant-empty-small), :deep(.ant-picker-input > input){
  color: #fff !important;
}
:deep(.roll-table) {
  margin-top: 20px;
}
</style>