<template>
  <div class="alarmDetail-plan flex-column">
    <div class="w-100% flex justify-between mt-15px task-filter-row" style="margin-bottom: 10px">
      <div>任务名称：{{ taskInfo.taskName }}</div>
      <div>任务时间:{{ new Date(taskInfo.startDate).toLocaleString() }}</div>
      <div>巡更时间段:{{ taskInfo.executeData }}</div>
      <div>状态:{{ taskInfo.status == "FINISHED" ? "已结束" : taskInfo.status == "IN_EXECUTION" ? "执行中" : "待接收" }}</div>
    </div>
    <div class="alarmDetail-plan-header">
      <div>序号</div>
      <div>巡更点</div>
      <div>所属区域</div>
      <div>巡更人员</div>
      <div>巡更时间</div>
      <div>巡更结果</div>
    </div>
    <div class="table-body">
      <div class="alarmDetail-plan-item" v-for="(item, index) in taskInfo.data" :key="item.id">
        <div>{{ index + 1 }}</div>
        <div>{{ item.locationName }}</div>
        <div>{{ item.arae.map((res) => res.name).join("/") }}</div>
        <div>{{ item?.userName ?? "--" }}</div>
        <div>{{ item?.patrolDate ? new Date(item.patrolDate).toLocaleString() : "--" }}</div>
        <div>{{ item?.patrolResult == "ABNORMAL" ? "异常" : "正常" }}</div>
      </div>
    </div>
    <div class="alarmDetail-pagination">
      <a-popconfirm title="确认后则该异常巡更任务从待确认的列表移除进入已处理列表中" ok-text="确认" cancel-text="取消" @confirm="isknow">
        <a-button v-if="taskInfo.alarmStatus === 'ALARM_HANDLER' ? false : true" type="primary">已知晓</a-button>
      </a-popconfirm>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, ref } from "vue";
export default defineComponent({
  props: {
    id: {
      type: String,
      default: null,
    },
    taskInfo: {
      type: Object,
      default: "",
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      value: "",
      list: [],
      keyword: "",
      organizationId: null,
      onDuty: null,
      postId: null,
      deptlist: [],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    onMounted(() => {});
    const isknow = () => {
      console.log(props.taskInfo.alarmid);
      proxy.$api.alarmHandelResult({ id: props.taskInfo.alarmid }).then((res) => {
        proxy.$message.success("提交成功");
        emit("close", false);
      });
    };
    return {
      isknow,
      ...toRefs(state),
    };
  },
});
</script>

<style lang="less" scoped>
.search {
  margin-bottom: 16px;
  :deep(.ant-input) {
    color: #ffffff;
    background-color: transparent;
    border-color: #216cc3;
    &:hover {
      border-color: #216cc3;
    }
  }
  :deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
    background: transparent;
    border: 1px solid var(--dispatch-map-blue-border, #b9d5f4);
    color: #ffffff;
  }
  .searchBtn {
    background: #216cc3;
    color: #ffffff;
    border-color: #216cc3;
  }
}
.alarmDetail-plan {
  padding-top: 10px;
  height: 100%;
  overflow: hidden;

  .alarmDetail-plan-header {
    height: 42px;
    background: #285487;
    font-size: 14px;
    font-family: PingFang SC-Medium;
    font-weight: 500;
    padding-left: 20px;
    color: white;
    display: flex;

    > div {
      flex: 1;
      height: 100%;
      line-height: 42px;
      text-align: left;
    }
  }

  .table-body {
    flex: 1;
    overflow: auto;
  }

  .alarmDetail-plan-item {
    height: 48px;
    font-size: 14px;
    font-family: PingFang SC-Regular;
    font-weight: 400;
    color: #e4e4e4;
    padding-left: 20px;
    display: flex;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    > div {
      flex: 1;
      height: 100%;
      line-height: 48px;
      text-align: left;

      > span {
        color: rgba(41, 137, 255, 1);
        cursor: pointer;
      }
    }
  }

  .alarmDetail-pagination {
    padding: 23px 0;
    text-align: center;
    position: relative;
  }

  .btn {
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(41, 137, 255, 1);
    border-color: rgba(41, 137, 255, 1);
    color: #ffffff;
    z-index: 10;
    &.ant-btn:hover {
      color: #ffffff;
      border-color: rgba(41, 137, 255, 1);
      background: rgba(41, 137, 255, 1);
    }
  }
}
</style>
<style lang="less">
.alarmDetail-pagination {
  .ant-pagination {
    color: rgba(228, 228, 228, 1) !important;
  }

  .ant-pagination-item-active {
    background: transparent !important;
  }

  .ant-pagination-item {
    border-color: #d1d1d1;
    color: rgba(228, 228, 228, 1) !important;

    a {
      color: rgba(228, 228, 228, 1) !important;
    }
  }

  .ant-pagination.mini .ant-pagination-prev,
  .ant-pagination.mini .ant-pagination-next {
    color: rgba(228, 228, 228, 1) !important;
  }

  .ant-pagination-prev a,
  .ant-pagination-next a {
    color: rgba(228, 228, 228, 1) !important;
  }
}

.alarmDetail-plan {
  .ant-radio-group {
    width: 100%;
  }

  .ant-radio-checked .ant-radio-inner {
    border-color: #216cc3 !important;
  }

  .ant-radio-inner::after {
    background-color: #216cc3;
  }
}
</style>
