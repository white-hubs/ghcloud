<template>
  <div
    :class="[
      'alarm-list-item',
      alarmInfo.alarmLevelCode === 'one_level' ? 'red-bg' : 'normal-bg',
      activeId === alarmInfo.id && alarmInfo.alarmLevelCode === 'one_level' && 'red-active',
      activeId === alarmInfo.id && alarmInfo.alarmLevelCode !== 'one_level' && 'active',
    ]"
  >
    <div class="alarm-item-info">
      <div class="item-left">
        <img :src="alarmImageUrl" alt="" />
        <div class="type">{{ alarmInfo.applicationName }}</div>
      </div>
      <div class="item-content">
        <div :class="['patrol-title', alarmInfo.alarmLevelCode]">{{ alarmInfo.alarmEventName }}</div>
        <div class="patrol-info">
          <div class="patrol-time">
            <label>报警时间: </label>
            <span>{{ alarmInfo.alarmTime }}</span>
          </div>
          <div class="info-bottom">
            <div class="patrol-count">
              <label>报警区域: </label>
              <span>{{ alarmInfo.areaName }}</span>
            </div>
          </div>
          <div class="info-bottom" v-if="alarmInfo.alarmHandlerName">
            <div class="patrol-count">
              <label>处理人员: </label>
              <span>{{ alarmInfo.alarmHandlerName || "--" }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="item-status-info">
        <div :class="['status', alarmInfo.alarmStatus]">{{ alarmInfo.alarmStatusName }}</div>
        <div :class="['alarm-level', alarmInfo.alarmLevelCode || 'one_level']">{{ alarmInfo.alarmLevelName }}报警</div>
      </div>
    </div>
    <img
      class="timeout-icon"
      v-if="alarmInfo.alarmHandlerTimeoutStatus === 'TIMED_OUT'"
      src="/resource/v1/command-dispatch-migrate/commandDispatch/images/timeout-icon.png"
      alt=""
    />

    <div class="bottom">
      <div class="operate">
        <div @click.stop="handleInfo">详情</div>
        <div v-if="alarmInfo.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'" @click.stop="handleSuspend">挂起</div>
        <div
          v-if="['ALARM_PROGRESS_CONFIRMED', 'ALARM_SUSPEND', 'ALARM_UN_CONFIRMED'].includes(alarmInfo.alarmStatus)"
          @click.stop="handleHandler"
        >
          处理
        </div>
        <div class="designate" v-if="alarmInfo.alarmStatus !== 'ALARM_HANDLER'" @click.stop="handleTransfer(alarmInfo.applicationCode)">
          指派
        </div>
        <div
          class="designate"
          v-if="['ALARM_UN_CONFIRMED', 'ALARM_PROGRESS_CONFIRMED', 'TIMED_OUT'].includes(alarmInfo.alarmStatus)"
          @click.stop="handleUrging"
        >
          催办
        </div>
      </div>
    </div>
    <alarm-detail
      v-if="infoModal.visible"
      v-model:visible="infoModal.visible"
      v-model:isMinimized="infoModal.isMinimized"
      @close="infoModal.visible = false"
      :infoModal="infoModal"
    ></alarm-detail>
    <alarm-transfer
      v-if="transferModal.visible"
      v-model:visible="transferModal.visible"
      v-model:isMinimized="transferModal.isMinimized"
      @closeTransfer="transferModal.visible = false"
      :transferModal="transferModal"
    ></alarm-transfer>

    <alarm-handler
      v-if="handlerModal.visible"
      v-model:visible="handlerModal.visible"
      v-model:isMinimized="handlerModal.isMinimized"
      @closeHandler="handlerModal.visible = false"
      :handlerModal="handlerModal"
    ></alarm-handler>
    <alarm-suspend
      v-if="suspendModal.visible"
      v-model:visible="suspendModal.visible"
      v-model:isMinimized="suspendModal.isMinimized"
      @closeSuspend="suspendModal.visible = false"
      :suspendModal="suspendModal"
    ></alarm-suspend>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, getCurrentInstance, computed } from "vue";

import alarmDetail from "../alarm-detail";
import alarmHandler from "../alarm-handler";
import alarmSuspend from "../alarm-suspend";
import alarmTransfer from "../alarm-transfer";
const SECURITY_MONITORING = "/resource/v1/command-dispatch-migrate/commandDispatch/images/SECURITY_MONITORING.png";

export default defineComponent({
  props: {
    alarmInfo: {
      type: Object,
      default: () => {},
    },
    activeId: {
      type: String,
      default: () => "",
    },
  },
  components: {
    alarmDetail,
    alarmTransfer,
    alarmHandler,
    alarmSuspend,
  },
  name: "alarmListItem",
  emits: ["info", "handler", "transfer", "suspend"],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      visible: false,
      handleUrging: false,
      infoModal: {
        visible: false,
        title: "",
        id: "",
        businessKey: "",
        isMinimized: false,
      },
      transferModal: {
        visible: false,
        id: "",
        isMinimized: false,
        applicationCode: "",
      },
      handlerModal: {
        visible: false,
        id: "",
        isMinimized: false,
      },
      suspendModal: {
        visible: false,
        id: "",
        isMinimized: false,
      },
      infoState: {},
    });

    const handleInfo = () => {
      state.infoModal.visible = true;
      state.infoModal.isMinimized = false;
      state.infoModal.title = props.alarmInfo.alarmTargetName + "-" + props.alarmInfo.alarmTypeName;
      state.infoModal.businessKey = props.alarmInfo.businessKey;
      state.infoModal.id = props.alarmInfo.id;
    };
    const alarmImageUrl = computed(() => {
      if (props.alarmInfo?.applicationCode) {
        return `/resource/v1/command-dispatch-migrate/commandDispatch/images/${props.alarmInfo.applicationCode}.png`;
      }
      return SECURITY_MONITORING;
    });
    const handleSuspend = () => {
      state.suspendModal.visible = true;
      state.suspendModal.isMinimized = false;
      state.suspendModal.id = props.alarmInfo.id;
    };
    const handleUrging = async () => {
      if (state.handleUrging) return;
      try {
        state.handleUrging = true;
        await proxy.$api.alarmUrge({
          ids: [props.alarmInfo.id],
        });
        proxy.$message.success("催办成功");
      } finally {
        state.handleUrging = false;
      }
    };
    const handleHandler = () => {
      state.handlerModal.visible = true;
      state.handlerModal.isMinimized = false;
      state.handlerModal.id = props.alarmInfo.id;
      console.log(props.alarmInfo.id);
    };
    const handleTransfer = (code) => {
      state.transferModal.visible = true;
      state.transferModal.id = props.alarmInfo.id;
      state.transferModal.isMinimized = false;
      state.transferModal.applicationCode = code;
    };
    return {
      ...toRefs(state),
      handleInfo,
      handleSuspend,
      handleUrging,
      handleHandler,
      alarmImageUrl,
      handleTransfer,
    };
  },
});
</script>
<style scoped lang="less">
.active {
  background: var(--dispatch-panel-bg-active, #e6f2ff) !important;
}

.red-active {
  background: rgba(255, 61, 61, 0.24) !important;
}

.red-bg {
  background: rgba(255, 61, 61, 0.12);
  border: 1px solid rgba(255, 61, 61, 0.3);
}

.normal-bg {
  background: rgba(28, 103, 196, 0.1);
  border: 1px solid rgba(41, 137, 255, 0.3);
}

.alarm-list-item {
  padding: 14px 8px 12px;
  position: relative;
  border-radius: 4px;
  background: var(--dispatch-card-bg, #ffffff);
  border: 1px solid var(--dispatch-border-soft, #e7eff8);

  .alarm-item-info {
    display: flex;
    align-items: stretch;
    justify-content: space-between;

    .item-left {
      img {
        width: 64px;
        height: 56px;
      }

      .type {
        background: var(--dispatch-map-blue-soft, #e8f3ff);
        padding: 2px 5px;
        font-size: 12px;
        font-family:
          Source Han Sans-Regular,
          Source Han Sans;
        font-weight: 400;
        color: var(--dispatch-map-blue, #1976d2);
        margin-top: 4px;
      }
    }

    .item-content {
      display: flex;
      flex-direction: column;
      margin-left: 10px;
      gap: 8px;
      width: 180px;
      flex-shrink: 0;

      .patrol-title {
        white-space: nowrap;
        width: 95%;
        text-indent: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 15px;
        font-family:
          Source Han Sans-Medium,
          Source Han Sans;
        font-weight: 500;
        color: var(--dispatch-text, #26384d);
      }

      .one_level {
        background: linear-gradient(270deg, rgba(255, 61, 61, 0) 0%, rgba(255, 61, 61, 0.5) 24%, rgba(255, 61, 61, 0) 100%);
      }

      .two_level {
        background: linear-gradient(270deg, rgba(255, 151, 55, 0) 0%, rgba(255, 136, 27, 0.5) 21%, rgba(255, 151, 55, 0) 100%);
      }

      .three_level {
        background: linear-gradient(270deg, rgba(231, 166, 13, 0) 0%, rgba(231, 166, 13, 0.5) 21%, rgba(231, 166, 13, 0) 100%);
      }

      .four_level {
        background: linear-gradient(270deg, rgba(43, 138, 255, 0) 0%, rgba(43, 138, 255, 0.6) 35%, rgba(43, 138, 255, 0) 100%);
      }

      .patrol-info {
        font-size: 12px;
        font-family:
          Source Han Sans-Regular,
          Source Han Sans;
        font-weight: 400;
        color: var(--dispatch-text-secondary, #68798d);
        margin-top: 4px;

        .info-bottom {
          margin-top: 4px;
          display: flex;
          margin-right: 10px;
          align-items: center;
          justify-content: space-between;
        }
      }
    }

    .item-status-info {
      display: flex;
      flex-direction: column;
      gap: 17px;

      .ALARM_UN_CONFIRMED,
      .ALARM_PROGRESS_CONFIRMED {
        color: #ff9737;
        background: rgba(255, 151, 55, 0.3);
      }

      .ALARM_SUSPEND {
        color: #216cc3;
        background: rgba(41, 137, 255, 0.3);
      }

      .ALARM_HANDLER {
        background: rgba(30, 193, 56, 0.3);
        color: #1ec138;
      }

      .status {
        border-radius: 2px;
        width: 42px;
        height: 22px;
        line-height: 22px;
        font-size: 12px;
        text-align: center;
        font-family:
          Source Han Sans-Regular,
          Source Han Sans;
        font-weight: 400;
      }

      .one_level {
        color: #ff3d3d;
        background: linear-gradient(270deg, rgba(255, 61, 61, 0) 0%, rgba(255, 61, 61, 0.4) 45%, rgba(255, 61, 61, 0) 100%);
      }

      .two_level {
        color: #ff9737;
        background: linear-gradient(270deg, rgba(255, 151, 55, 0) 0%, rgba(255, 151, 55, 0.4) 45%, rgba(255, 151, 55, 0) 100%);
      }

      .three_level {
        color: #e7a60d;
        background: linear-gradient(270deg, rgba(231, 166, 13, 0) 0%, rgba(231, 166, 13, 0.4) 45%, rgba(231, 166, 13, 0) 100%);
      }

      .four_level {
        color: #216cc3;
        background: linear-gradient(270deg, rgba(43, 138, 255, 0) 0%, rgba(43, 138, 255, 0.4) 45%, rgba(43, 138, 255, 0) 100%);
      }

      .alarm-level {
        font-size: 12px;
        font-family:
          Source Han Sans-Regular,
          Source Han Sans;
        font-weight: 400;
        padding: 1px 2px;
      }
    }
  }

  .timeout-icon {
    position: absolute;
    top: 65px;
    right: 65px;
    width: 36px;
    height: 36px;
  }

  .bottom {
    margin-top: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .operate {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      flex: 1;

      div {
        padding: 4px 11px;
        border-radius: 2px 2px 2px 2px;
        border: 1px solid rgba(43, 138, 255, 0.4);
        font-size: 12px;
        font-family:
          Source Han Sans-Regular,
          Source Han Sans;
        font-weight: 400;
        color: #216cc3;
        cursor: pointer;
      }

      .designate {
        padding: 4px 11px;
        background: var(--dispatch-map-blue, #1976d2);
        border: 1px solid var(--dispatch-map-blue, #1976d2);
        border-radius: 2px 2px 2px 2px;
        color: #fff;
      }
    }
  }
}
</style>
