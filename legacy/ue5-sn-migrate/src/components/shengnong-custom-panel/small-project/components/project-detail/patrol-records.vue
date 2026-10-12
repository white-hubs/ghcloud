<template>
  <div class="record">
    <div class="info-item-form">
      <div class="form-item">
        <div class="form-item-label">巡查次数:</div>
        <div class="form-item-content">{{targetDetail?.dailyNum ?? '0'}}次</div>
      </div>
      <div class="form-item">
        <div class="form-item-label">巡检发现异常:</div>
        <div class="form-item-content">{{targetDetail?.dailyErrNum ?? '0'}}次</div>
      </div>
    </div>
    <RollTable :column="columns" :data="dataSource" :showLength="20" style="margin-top: 10px; height: 520px; overflow-y: auto">
      <template #time="{ record }">
        <span>{{ record.time ? dayjs(record.time).format('YYYY-MM-DD HH:mm') : '--' }}</span>
      </template>
      <template #result="{ record }">
        <div :style="{color:record.result === 'NORMAL'?'#6AB539':'#FF9737'}">{{ resultStatus[record.result] }}</div>
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
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import dayjs from "dayjs";
import { getTargetRecordDetail, detailRecordPage } from "@/api/snMarket";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";

interface Props {
  id: string;
  auth: Record<string, any> | null;
}
const props = withDefaults(defineProps<Props>(), {
  id: "",
  auth: null
});
const resultStatus = {
  NORMAL: '正常',
  ABNORMAL: '异常',
}
const loadingDataSource = ref(false);
const columns = ref([
  {
    title: "巡查时间",
    dataIndex: "time",
    slots: {
      customRender: "time",
    },
  },
  {
    title: "巡查人",
    dataIndex: "username",
    sorter: true,
  },
  {
    title: "巡查部门",
    dataIndex: "organizationName",
    sorter: true,
  },
  {
    title: "巡查任务结果",
    dataIndex: "result",
    slots: {
      customRender: "result",
    },
  },
]);
const datainfo = reactive<Record<string, any>>({
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});
const dataSource = ref([]);
const targetDetail = ref({
  dailyNum: 0,
  dailyErrNum: 0,
})
const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};
const getData = async () => {
  try {
    if (!props.id) return
    loadingDataSource.value = true;
    const data = await detailRecordPage({
      pageNumber: datainfo.pageNumber,
      pageSize: datainfo.pageSize,
      targetId: props.id,
      temporary: '1',
      businessType: 'SMALL_ENGINEERING',
    });
    dataSource.value = data.records;
    datainfo.total = data.total;
  } catch (error) {
  } finally {
    loadingDataSource.value = false;
  }
};
const getTargetDetail = async () => {
  try {
    const data = await getTargetRecordDetail({
      targetId: props.id,
      businessType: 'SMALL_ENGINEERING',
    });
    targetDetail.value = data;
  } catch (error) {
  }
};
watch(
  () => props.auth,
  async () => {
    if (props.auth) {
      getData()
      getTargetDetail()
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
    width: 24%;
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

.info-item-form {
  display: flex;
  flex-wrap: wrap;

  .form-item {
    display: flex;
    width: 33.3%;
    line-height: 14px;
    color: #fff;
    font-size: 14px;
    margin-top: 12px;
    padding-left: 18px;
    align-items: baseline;
    .ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    >div {
      display: inline-block;

      &.form-item-label {
        white-space: nowrap;
        text-align: left;
        vertical-align: top;
        margin-right: 5px;
      }

      &.form-item-content {
        width: calc(100% - 70px);
        color: rgba(226, 226, 226, 1);
      }
    }
  }
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
:deep(.roll-table) {
  margin-top: 20px;
}
</style>