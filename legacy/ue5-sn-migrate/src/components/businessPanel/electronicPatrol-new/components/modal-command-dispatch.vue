<template>
  <Modal title="任务详情" :show="showModal" @close="closeModal" wrapClassName="modal-table-device">
    <div class="content-body">
      <div class="info-item-title">
        <div class="title-text">基本信息</div>
      </div>
      <div class="info-item-form">
        <div class="form-item">
          <div class="form-item-label">任务名称:</div>
          <div class="form-item-content">{{ commandInfo?.taskName ?? "--" }}</div>
        </div>
        <div class="form-item">
          <div class="form-item-label">任务时间:</div>
          <div class="form-item-content">
            {{ commandInfo.startTime+ '--' + commandInfo.endTime }}
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label">巡更时段:</div>
          <div class="form-item-content">
            {{  commandInfo?.executeData ?? "--" }}
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label">状态:</div>
          <div class="form-item-content">
            {{ statusObj[commandInfo?.status] || "--" }}
          </div>
        </div>
      </div>
    </div>
    <div class="modal-layout">
      <div style="margin-top: 15px">
        <div class="table_header">
          <div v-for="item in table_header">{{ item }}</div>
        </div>
        <a-spin :spinning="loading">
          <div class="table_content">
            <div v-if="dataSource.length === 0" class="no-content">
              <NoData />
            </div>
            <div v-for="item in dataSource">
              <div class="content">
                <div>{{ item.locationName }}</div>
                <div>{{ item.areaName||'--' }}</div>
                <div>{{ item.userName||'--' }}</div>
                <div>{{ item.patrolTime||'--' }}</div>
                <div>{{ item.resulStatusName||"--" }}</div>
              </div>
            </div>
          </div>
        </a-spin>
      </div>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import Modal from "@/components/modal-table/modal.vue";
import { reactive, ref, watch } from "vue";
import NoData from "@/components/businessPanel/public/noData.vue";
import { electronTask, getPatrolTaskByTime } from '@/api/maintain'
import moment from 'moment'
interface Props {
  parameter?: any;
  showModal: boolean;
}
const loading = ref(false);
const emit = defineEmits(["close"]);
const statusObj = {
  'IN_EXECUTION':'执行中',
  'TO_BE_RECEIVED':'待接收',
  'FINISHED':'已结束',
}
const props = withDefaults(defineProps<Props>(), {
  title: "任务详情",
  showModal: false,
  parameter: {},
});
const commandInfo = reactive({
  taskName:'',
  startTime:'',
  endTime:'',
  executeData:'',
  status:'',
  startDate:'',
  endDate:'',
  id:'',
  executePeriod:[]
})
const dataSource = ref([]);
const table_header = ["巡更点", "所在区域", "巡更人员", "巡更时间","巡更结果"];
const getData = async () => {
  const PATROL_POINT_RES_ENUM = {
    ABNORMAL: '异常',
    NORMAL: '正常'
  }
  try {
    loading.value = true;
    const res = await electronTask({...props.parameter})
    Object.assign(commandInfo,res)
    commandInfo.startTime = moment(commandInfo.startDate).format('YYYY-MM-DD')
    commandInfo.endTime = moment(commandInfo.endDate).format('YYYY-MM-DD')
    const result = await getPatrolTaskByTime({taskId: commandInfo.id,executePeriod:commandInfo.executePeriod[0]})
    dataSource.value = result.map(item => {
        return {
          ...item,
          areaName: item.arae.map(item => item.name).join('/'),
          patrolTime: item.patrolDate ? moment(item.patrolDate).format('YYYY-MM-DD hh:mm:ss') : '--',
          resulStatusName: item.patrolResult ? PATROL_POINT_RES_ENUM[item.patrolResult] : '--',
        }
      })
  } catch (error) {
  }
  loading.value = false;
};

const closeModal = () => {
  emit("close");
};
watch(
  () => props.showModal,
  () => {
    if(props.showModal){
      dataSource.value=[]
      getData();
    }
  }
);
</script>

<style lang="less" scoped>
:deep(.ant-select-selection-item) {
  color: #fff;
}

:deep(.ant-form-item-label > label) {
  color: #fff;
}

:deep(.ant-picker-input > input) {
  color: #fff;
}

:deep(.ant-picker-input > input::placeholder) {
  color: #fff;
}

:deep(.ant-table-thead > tr > th) {
  color: #fff;
}

:deep(.ant-table-tbody > tr > td) {
  color: #fff;
}

:deep(.ant-table-tbody > tr > td.ant-table-cell-row-hover) {
  background-color: transparent;
}

:deep(.ant-select-selector) {
  background: rgba(216, 216, 216, 0.1) !important;
  border: 1px solid rgba(96, 112, 128, 0.6) !important;
}

:deep(.ant-picker-range) {
  background: rgba(216, 216, 216, 0.1) !important;
  border: 1px solid rgba(96, 112, 128, 0.6) !important;
}

:deep(.ant-table-cell) {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  border-bottom: rgba(16, 40, 68, 0.8);
}

.table_header {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  display: flex;
  color: #fff;
  line-height: 48px;

  div {
    width: 20%;
    text-align: center;
    padding: 0 15px;
  }
}

.table_content {
  // display: flex;
  color: #fff;
  min-height: 200px;

  .no-content {
    display: flex;
    justify-content: center;

    :deep(.content) {
      margin-top: 10%;
    }
  }

  .content {
    display: flex;

    div {
      width: 20%;
      line-height: 48px;
      text-align: center;
      height: 48px;
      border-bottom: 1px solid rgba(105, 116, 140, 0.5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

:deep(.ant-pagination-item-ellipsis) {
  color: #fff !important;
}

.overflow {
  overflow: hidden; //超出的文本隐藏
  text-overflow: ellipsis; //溢出用省略号显示
  white-space: nowrap;
}

:deep(.ant-pagination-item-link) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
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

:deep(.modal-width) {
  width: 940px !important;
}
</style>
<style lang="less">
.modal-table-device {
  .modal-width {
    width: 940px !important;
  }

  a {
    color: #2989FF;
  }
}

.content-body {
  .title-text {
    font-size: 14px;
    font-family: PingFang SC-Medium;
    font-weight: 500;
    color: #ffffff;
    margin-bottom: 20px;
  }

  .info-item-form {
    display: flex;
    flex-wrap: wrap;

    .form-item {
      display: flex;
      width: 33.33%;
      line-height: 14px;
      color: rgba(226, 226, 226, 0.5);
      font-size: 14px;
      margin-bottom: 12px;
      padding-left: 18px;

      >div {
        display: inline-block;

        &.form-item-label {
          width: 80px;
          height: 20px;
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
}
</style>