<template>
  <custom-modal
    className="alarm-detail-modal"
    v-model:visible="visible"
    :isMinimized="isMinimized"
    @changeIsMinimized="changeIsMinimized"
    :title="infoModal.title"
    @close="handleClose"
  >
    <div class="alarmDetail-modal-content flex-column">
      <div class="content-tabs">
        <div v-for="item in tabsList" :key="item" :class="item === activeTabs ? 'active' : ''" @click="activeTabs = item">
          <div>{{ item }}</div>
          <span>
            <RightOutlined />
          </span>
        </div>
      </div>
      <div class="conent-body" style="padding-bottom: 10px">
        <alarm-info :id="infoModal.id" v-if="activeTabs === '报警详情'" @toDeviceInfo="handleDeviceInfo"></alarm-info>
        <alarm-plan :id="infoModal.id" :businessKey="infoModal.businessKey" v-if="activeTabs === '联动预案'"></alarm-plan>
        <alarm-flow :id="infoModal.id" v-if="activeTabs === '处理流程'"></alarm-flow>
        <nearby-info :id="infoModal.id" v-if="activeTabs === '附近设备'" @toDeviceInfo="handleDeviceInfo" />
      </div>
    </div>
    <device-info
      v-show="deviceInfoVisible"
      :visible="deviceInfoVisible"
      :deviceId="deviceId"
      @closeDeviceInfo="deviceInfoVisible = false"
    ></device-info>
  </custom-modal>
</template>

<script>
import { CloseOutlined, RightOutlined } from "@ant-design/icons-vue";
import { defineComponent, onMounted, reactive, ref, toRefs } from "vue";

import customModal from "../custom-modal/index.vue";
import deviceInfo from "../device-info/index.vue";
import alarmFlow from "./flow.vue";
import alarmInfo from "./info.vue";
import nearbyInfo from "./nearby.vue";
import alarmPlan from "./plan.vue";

export default defineComponent({
  props: {
    infoModal: {
      type: Object,
      default: {},
    },
    visible: {
      type: Boolean,
      default: false,
    },
    isMinimized: {
      Boolean,
      default: false,
    },
  },
  components: {
    alarmFlow,
    alarmInfo,
    alarmPlan,
    nearbyInfo,
    deviceInfo,
    CloseOutlined,
    RightOutlined,
    customModal,
  },
  emits: ["update:visible"],
  setup(props, { emit }) {
    const state = reactive({
      tabsList: ["报警详情", "联动预案", "处理流程", "附近设备"],
      activeTabs: "报警详情",
      deviceInfoVisible: false,
      deviceId: "",
    });
    const closeDetails = () => {
      emit("close");
    };
    const handleClose = () => {
      // emit('close')
      emit("update:visible", false);
    };
    const handleDeviceInfo = (data) => {
      state.deviceId = data.alarmTargetKey;
      state.deviceInfoVisible = true;
      // emit('toDeviceInfo', state)
      // state.deviceInfoVisible = true

      // DeviceInfo.value = data.alarmTargetKey;
      // state.DevicemodalData.visible = true;
      // getBasicVideosData();
    };
    const changeIsMinimized = (bol) => {
      emit("update:isMinimized", bol);
    };

    return {
      ...toRefs(state),
      closeDetails,
      handleClose,
      handleDeviceInfo,
      changeIsMinimized,
    };
  },
});
</script>

<style lang="less">
.alarm-detail-modal {
  width: 900px;
  height: 650px;
  position: fixed;
  top: calc(50% - 325px);
  left: calc(50% - 450px);
  background: var(--dispatch-modal-bg, rgba(255, 255, 255, 0.98));
  border: 1px solid var(--dispatch-border, #dbe4ef);
  box-shadow: var(--dispatch-shadow-strong, 0 12px 32px rgba(26, 54, 93, 0.18));
  color: var(--dispatch-text, #1f2d3d);
  z-index: 999;

  &.full {
    width: 100%;
    height: 100%;
  }

  .alarmDetail-modal-header {
    height: 50px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--dispatch-border, #dbe4ef);

    .header-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;

      > span {
        font-size: 16px;
        font-family: PingFang SC-Medium;
        font-weight: 500;
        color: var(--dispatch-text, #1f2d3d);
        margin-left: 4px;
      }
    }

    .header-close {
      width: 24px;
      height: 24px;
      background: var(--dispatch-map-blue-soft, #eaf4ff);
      color: var(--dispatch-map-blue, #216cc3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 1px solid var(--dispatch-map-blue-border, #cfe0f3);
      border-radius: 4px;
    }
  }

  .alarmDetail-modal-content {
    height: 565px;
    width: 100%;
    padding: 0 16px;
    overflow: hidden;

    .content-tabs {
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 14px;
      font-family: PingFang SC-Regular;
      font-weight: 400;
      color: var(--dispatch-text, #1f2d3d);

      > div {
        width: 84px;
        height: 26px;
        opacity: 1;
        border: 1px solid var(--dispatch-map-blue-border, #cfe0f3);
        background: var(--dispatch-panel-bg-soft, #f6f9fd);
        margin-right: 12px;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0px 0px 2px 0px rgba(56, 142, 243, 0.45);
        cursor: pointer;

        > span {
          display: inline-block;
          color: var(--dispatch-map-blue, #216cc3);
          width: 12px;
          height: 12px;
          border-radius: 2px;
          margin-left: 2px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        &.active {
          background: #f6f9ff;
          border-color: var(--dispatch-map-blue, #216cc3);
          color: #000000;

          > span {
            color: var(--dispatch-map-blue, #216cc3);
            background: #ffffff;
          }
        }
      }
    }

    .conent-body {
      flex: 1;
      overflow: hidden;
      overflow-y: scroll;
    }
  }

  .vidiconcontent {
    height: 670px;
  }
}
</style>
