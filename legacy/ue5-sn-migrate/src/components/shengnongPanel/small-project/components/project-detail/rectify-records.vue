<template>
  <div class="record">
    <div style="margin-top: 15px; height: 520px; overflow-y: auto">
      <div class="table_header">
        <div v-for="item in table_header">{{ item }}</div>
      </div>
      <a-spin :spinning="loadingDataSource">
        <div class="table_content">
          <div v-if="dataSource.length === 0" class="no-content">
            <NoData />
          </div>
          <div v-else v-for="(item, index) in dataSource">
            <div class="content">
              <div>{{ item.code || '--' }}</div>
              <div>{{ item.instanceName || '--' }}</div>
              <div>{{ item.startUserInfo.startUserName || '--' }}</div>
              <div>{{ item.startUserInfo.organizationName || '--' }}</div>
              <div>
                {{ item.submitedTime ? dayjs(item.submitedTime).format("YYYY-MM-DD HH:mm")  : "--" }}
              </div>
            </div>
          </div>
        </div>
      </a-spin>
    </div>
    <div style="height: 30px">
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
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import dayjs from "dayjs";
import NoData from "@/components/businessPanel/public/noData.vue";
import {  getHiddenPage } from "@/api/snMarket";

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
const table_header = [
  "编号",
  "名称",
  "发起人",
  "发起部门",
  "发起时间",
];
const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};
const getData = async () => {
  if (!props.id) return
  try {
    loadingDataSource.value = true;
    const data = await getHiddenPage({
      pageNumber: datainfo.pageNumber,
      pageSize: datainfo.pageSize,
      hiddenObjId: props.id,
      businessType: 'HIDDENDANGER',
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
:deep(.ant-btn-sm) {
  border: 1px solid #1285ff;
  background-color: rgba(4, 17, 32, 0.95);
  color: #1285ff;
}

:deep(.ant-btn-primary) {
  background-color: #1285ff;
  color: #fff;
}

.record {
  font-size: 16px;
}
.table_header {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  display: flex;
  color: #fff;
  line-height: 48px;

  div {
    width: 20%;
    padding: 0 15px;
    text-align: center;
  }
}

:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 1);
}

:deep(.ant-select-selection-item) {
  color: rgba(255, 255, 255, 1);
}

.table_content {
  // display: flex;
  color: #fff;

  .no-content {
    display: flex;
    justify-content: center;

    :deep(.content) {
      margin-top: 5%;
    }
  }

  .content {
    display: flex;

    div {
      width: 24%;
      line-height: 48px;
      height: 48px;
      border-bottom: 1px solid rgba(105, 116, 140, 0.5);
      text-align: center;
      white-space: nowrap;
      color: rgba(217, 231, 255, 1);
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.alarm-time-picker {
  width: 250px;
}

.alarm-level-select,
.handle-status-select {
  width: 150px;
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

.UNDERWAY {
  color: #95BCF9 !important;
}

.COMPLETED {
  color: #00c6bc !important;
}

.WAIT_ACCEPT {
  color: #1890FF !important;
}
:deep(.ant-pagination-total-text) {
  color: #fff;
}
</style>
<style lang="less">
.modal-table-alarm {
  .modal-width {
    width: 1250px !important;
  }
}
</style>

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
</style>