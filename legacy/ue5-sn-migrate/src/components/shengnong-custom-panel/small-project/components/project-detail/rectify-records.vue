<template>
  <RollTable :column="columns" :data="dataSource" :showLength="20" style="margin-top: 10px; height: 520px; overflow-y: auto">
    <template #submitedTime="{ record }">
      <span>{{ record.submitedTime ? dayjs(record.submitedTime).format("YYYY-MM-DD HH:mm")  : "--" }}</span>
    </template>
    <template #startUserName="{ record }">
      <span>{{ record.startUserInfo.startUserName || '--' }}</span>
    </template>
    <template #organizationName="{ record }">
      <span>{{ record.startUserInfo.organizationName || '--' }}</span>
    </template>
  </RollTable>
  <div style="height: 30px" v-if="dataSource.length > 0">
    <a-pagination
      style="float: right; margin-top: 15px; color: #fff"
      :show-total="(total) => `共 ${total} 条`"
      v-model:current="datainfo.pageNumber"
      v-model:page-size="datainfo.pageSize"
      @change="onShowSizeChange"
      show-size-changer
      :total="datainfo.total"
    />
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import dayjs from "dayjs";
import {  getProjectReformPage } from "@/api/snMarket";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";

interface Props {
  id: string;
  auth: Record<string, any> | null;
}
const props = withDefaults(defineProps<Props>(), {
  id: "",
  auth: null
});
const datainfo = reactive<Record<string, any>>({
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});
const dataSource = ref([]);
const loadingDataSource = ref(false);
const columns = ref([
  {
    title: "工单编号",
    dataIndex: "reformNum",
    sorter: true,
  },
  {
    title: "工单名称",
    dataIndex: "instanceName",
    sorter: true,
  },
  {
    title: "发起人",
    dataIndex: "startUserName",
    slots: {
      customRender: "startUserName",
    },
  },
  {
    title: "发起部门",
    dataIndex: "organizationName",
    slots: {
      customRender: "organizationName",
    },
  },
  {
    title: "发起时间",
    dataIndex: "submitedTime",
    slots: {
      customRender: "submitedTime",
    },
  },
]);
const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};
const getData = async () => {
  if (!props.id) return
  try {
    loadingDataSource.value = true;
    const data = await getProjectReformPage({
      pageNumber: datainfo.pageNumber,
      pageSize: datainfo.pageSize,
      projectScheduleId: props.id,
      businessType: 'PROJECT_REFORM',
    });
    dataSource.value = data.records;
    datainfo.total = data.total;
  } catch (error) {
  } finally {
    loadingDataSource.value = false;
  }
};
watch(
  () => props.auth,
  async () => {
    if (props.auth) {
      getData()
    }
  },
  { deep: true, immediate: true }
);
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