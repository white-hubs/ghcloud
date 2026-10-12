<template>
  <div class="alarmDetail-plan">
    <div class="plan-table">
      <div class="title">设备联动</div>
      <div class="table-container">
        <div class="table-header">
          <div>设备名称</div>
          <div>设备属性</div>
          <div>执行动作</div>
          <div>执行时机</div>
          <div>操作</div>
        </div>
        <div class="table-body">
          <div class="table-body-item" v-for="item in linkageData" :key="item.id">
            <div>{{ item.deviceName }}</div>
            <div>{{ item.propName }}</div>
            <div>
              {{ item.translatedValue }}
            </div>
            <div>{{ item.executeMode == "AUTOMATIC" ? "自动" : "手动" }}</div>
            <div>
              <a-button type="link" @click="implement(item)">执行</a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="plan-table">
      <div class="title">联动日志</div>
      <div class="table-container">
        <div class="table-header">
          <div>执行时间</div>
          <div>触发人员</div>
          <div>设备名称</div>
          <div>设备属性</div>
          <div>执行动作</div>
          <div>执行结果</div>
        </div>
        <div class="table-body">
          <div class="table-body-item" v-for="item in recordData" :key="item.id">
            <div>{{ moment(item.executeTime).format("YYYY-MM-DD HH:mm:ss") }}</div>
            <div>{{ item.operatorName }}</div>
            <div>{{ item.deviceName }}</div>
            <div>{{ item.propName }}</div>
            <div>{{ item.translatedValue }}</div>
            <div
              :style="{
                color: item.executeStatus === 'SUCCESS' ? '#1EC138' : item.executeStatus === 'FAIL' ? '#FF3D3D' : '#FF9737',
              }"
            >
              {{ actionResult[item.executeStatus] }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs, computed } from "vue";

import { actionResult } from "@/utils/enumerate";
export default defineComponent({
  props: {
    id: {
      type: [String, Number],
      default: null,
    },
    businessKey: {
      type: [String, Number],
      default: null,
    },
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      linkageData: [],
      recordData: [],
    });
    onMounted(() => {
      getDeviceLinkageList();
      getDeviceLinkageRecord();
    });
    // 设备联动
    const getDeviceLinkageList = async () => {
      const data = await proxy.$api.getIotDeviceListByEvent({
        eventId: props.businessKey,
      });
      state.linkageData = data || [];
    };

    const implement = async (record) => {
      const data = await proxy.$api.manualControlIotDevice({
        eventIotDeviceId: record.id,
      });
      if (data) {
        proxy.$message.success("下发指令成功！");
      }
    };
    // 联动日志
    const getDeviceLinkageRecord = async () => {
      const data = await proxy.$api.getIotDeviceProRecords({
        eventId: props.businessKey,
      });
      if (data) {
        state.recordData = data;
      }
    };
    return {
      ...toRefs(state),
      implement,
      actionResult: actionResult,
      moment: moment,
    };
  },
});
</script>

<style lang="less" scoped>
.alarmDetail-plan {
  height: 100%;
  overflow: auto;
  font-size: 14px;
  .plan-table {
    .title {
      color: #000000;
      line-height: 40px;
    }
  }
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #000000;
    font-family: "PingFang SC-中黑体, PingFang SC";
    background: #f6f9ff;
    height: 42px;
    > div {
      flex: 1;
      text-align: center;
    }
  }
  .table-body {
    &-item {
      height: 42px;
      border-bottom: solid 1px var(--dispatch-border-soft, #dbe4ef);
      color: #000000;
      display: flex;
      justify-content: space-between;
      align-items: center;
      > div {
        text-align: center;
        flex: 1;
      }
    }
  }
}
</style>
