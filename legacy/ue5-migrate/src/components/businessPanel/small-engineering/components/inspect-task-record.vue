<template>
  <div class="modal-layout">
    <div style="margin-top: 15px; height: 420px; overflow-y: auto">
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
              <div>{{ item.taskName || '--' }}</div>
              <div>{{ item.typeName || '--' }}</div>
              <div>{{ item.taskExecuteUser || '--' }}</div>
              <div>{{ item.recordCompletionRate }}</div>
              <div>{{ item.targetNum || '--' }}</div>
              <div>{{ taskStatus[item?.status]  || '--' }}</div>
              <div>{{ resultType[item?.result]  || '--' }}</div>
              <div>
                <a style="color: #5eacff;" @click="clickRow(item)">详情</a>
              </div>
            </div>
          </div>
        </div>
      </a-spin>
    </div>
    <div style="height: 30px">
      <a-pagination
        style="float: right; margin-top: 15px"
        v-model:current="datainfo.pageNumber"
        show-size-changer
        v-model:page-size="datainfo.pageSize"
        @change="onShowSizeChange"
        :total="datainfo.total"
        :show-total="(total) => `共 ${total} 条`"
      />
    </div>
  </div>
  <inspect-task-detail v-if="detailModalShow" ref="inspectRef" @close="closeModal" :parameter="inspectParameter" ></inspect-task-detail>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import dayjs from "dayjs";
import NoData from "@/components/businessPanel/public/noData.vue";
import inspectTaskDetail from "./inspect-detail/inspect-task-detail.vue";
import { inspectAnalysisTaskExecuteUser, inspectAnalysisTaskRecordPage, inspectElectronMobileChargePage, inspectElectronMobileParkingPage, inspectElectronMobileParkingStat } from "@/api/maintain";

interface Props {
  parameter: Record<string, any>;
}
const resultType = {
  ABNORMAL:'异常',
  NORMAL:'正常',
}
const taskStatus = {
  SPLIT: '待拆解',
  ACCEPT: '待接收',
  EXECUTING: '进行中',
  OVER: '已完成',
  EXPIRE: '已过期',
  STOP: '已终止',
  CONFIRM: '待确认',
  OVERTIME: '超时完成'
}
const props = defineProps<Props>();
const emit = defineEmits(["close"]);
const time = ref(props.parameter.period);

const datainfo = reactive<Record<string, unknown>>({
  period: "",
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});

const dataSource = ref([]);
const loadingDataSource = ref(false);
const table_header = [
  "任务名称",
  "巡检类型",
  "执行人",
  "进度",
  "巡检对象数",
  "状态",
  "结果",
  "操作",
];

const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};

const getList = async () => {
  if (Array.isArray(datainfo.period)) datainfo.period = datainfo.period.join(',')
  const params = {
    period: datainfo.period,
    pageSize: datainfo.pageSize,
    pageNumber: datainfo.pageNumber,
    businessType: props.parameter.businessType,
    result: props.parameter.result,
  }

    const data = await inspectAnalysisTaskExecuteUser(params);
    dataSource.value = data.records;
    datainfo.total = data.total;
    loadingDataSource.value = false;
};
const getData = async () => {
  loadingDataSource.value = true;
  if (time.value?.length) {
    datainfo.period =
      dayjs(time.value[0]).format("YYYY-MM-DD 00:00:00") +
      "," +
      dayjs(time.value[1]).format("YYYY-MM-DD 23:59:59");
  }
  getList();
};

const detailModalShow = ref<boolean>(false);
const inspectParameter = ref<Record<string, any>>({
  id: "",
  businessType:''
});
const clickRow = (record) => {
  document.querySelector(".ant-modal-content").style.opacity = '0';
  inspectParameter.value.businessType = props.parameter.businessType
  inspectParameter.value.id = record.taskId
  detailModalShow.value = true;
};
const inspectRef = ref()
const closeModal = () => {
  document.querySelector(".ant-modal-content").style.opacity = '1';
  detailModalShow.value = false
};
onMounted(() => {
  getData()
})
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
      width: 20%;
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
  background: rgba(4, 17, 32, 0.8) !important;
}

.NORMAL {
  color: #1EC138 !important;
}

.ABNORMAL {
  color: #FF3D3D !important;
}
:deep(.ant-pagination-total-text) {
  color: #fff;
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
background: rgba(4, 17, 32, 0.8) !important;
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