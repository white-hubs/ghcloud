<template>
  <Modal :title="alarmDetailData.alarmTypeName" :show="showModal" @close="closeModal" wrapClassName="modal-table-alarm">
    <div class="alarmDetail-wrap">
      <div :class="xf?'xf alarmDetail-modal ':'alarmDetail-modal'">
        <div class="alarmDetail-modal-content flex-column">
          <div class="content-tabs">
            <div v-for="item in tabsList" :key="item" :class="item === activeTabs ? 'active' : ''"
              @click="activeTabs = item">
              <div>{{ item }}</div>
              <span>
                <RightOutlined />
              </span>
            </div>
          </div>
          <div class="conent-body" style="padding-bottom: 10px">
            <alarm-info :id="alarmDetailData.id" v-if="activeTabs === '报警详情'" @toDeviceInfo="toDeviceInfo"></alarm-info>
            <alarm-plan :id="alarmDetailData.id" :businessKey="alarmDetailData.businessKey"
              v-if="activeTabs === '联动预案'"></alarm-plan>
            <alarm-flow :id="alarmDetailData.id" v-if="activeTabs === '处理流程'"></alarm-flow>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import Modal from "../modal-table/modal.vue";
import { computed, onMounted, reactive, ref } from "vue";
import { CloseOutlined, RightOutlined, RollbackOutlined } from "@ant-design/icons-vue";
import alarmInfo from "./info.vue";
import alarmPlan from "./plan.vue";
import alarmFlow from "./flow.vue";
import { getIotDeviceListByEvent } from "@/api/linkage";
import { getOperatorLogs } from "@/api/alarm";
import bus from "@/utils/bus";
import { useStateStore } from "@/pages/state/use-state-store";
const emit = defineEmits(["close", 'showBusinessPanel', 'openDevicePanel', 'closeDevicePanel']);
interface Props {
  alarmDetailData: any;
  isalarm?: boolean;
  xf?:boolean;
  showModal: boolean;

}
const { globalState } = useStateStore()
const props = withDefaults(defineProps<Props>(), {
  showModal: true,
});
const tabsList = ref(["报警详情"]);
const activeTabs = ref("报警详情");
const closeModal = (backViewPoint = false) => {
  // 去当前区域长度拿到层级，但是层级如果是4级(房间区域级)，index会没有房间区域数据，所以4级的时候转为3级
  globalState.business.currentAreaLeave = Math.min((props.alarmDetailData.area ? props.alarmDetailData.area.split("-").length + 1 : 1), 3);
  emit("showBusinessPanel")
  emit("close", backViewPoint);
};
const toDeviceInfo = () => {
  emit("close", false);
  emit("closeDevicePanel", false);
  emit("openDevicePanel", props.alarmDetailData.alarmTargetKey,props.alarmDetailData)
  bus.emit("openDevicePopup", props.alarmDetailData)
};
const getDeviceLinkageList = async () => {
  const data = await getIotDeviceListByEvent({
    eventId: props.alarmDetailData.businessKey,
  });
  if (data && data.length) {
    tabsList.value.push("联动预案");
  }
};
const getFlowPath = async () => {
  const data = await getOperatorLogs(props.alarmDetailData.id);
  if (data.length) {
    tabsList.value.push("处理流程");
  }
};
onMounted(() => {
  getDeviceLinkageList();
  getFlowPath();
});
</script>

<style lang="less" scoped>
.videInfo {
  width: 1439px !important;
  padding: 0 10px !important;
  overflow-y: hidden !important;
}

.alarmDetail-wrap {
  // position: fixed;
  // width: 100%;
  // height: 100%;
  // top: 0;
  // left: 0;
  // z-index: 99999999;
}

.xf {
  top: -120% !important;
  // :-120%!important;
}

.alarmDetail-modal {
  width: 1150px;
  height: 545px;
  // position: fixed;
  // z-index: 9999999;
  // top: 50%;
  // left: 50%;
  // transform: translate(-50%, -50%);
  // background: rgba(11, 21, 33, 0.8);
  // border: 1px solid rgba(41, 137, 255, 1);

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
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    .header-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;

      >span {
        font-size: 16px;
        font-family: PingFang SC-Medium;
        font-weight: 500;
        color: #ffffff;
        margin-left: 4px;
      }
    }

    .header-close {
      width: 24px;
      height: 24px;
      background: #101010;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      span {
        font-size: 12px;
      }
    }

    .header-back {
      margin-right: 10px;
    }
  }

  .alarmDetail-modal-content {
    height: 495px;
    width: 100%;
    // padding: 0 16px;
    overflow: hidden;

    .content-tabs {
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 14px;
      font-family: PingFang SC-Regular;
      font-weight: 400;
      color: #ffffff;

      >div {
        width: 84px;
        height: 26px;
        opacity: 1;
        border: 1px solid rgba(183, 197, 211, 0.3);
        margin-right: 12px;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0px 0px 2px 0px rgba(56, 142, 243, 0.45);
        cursor: pointer;

        >span {
          display: inline-block;
          color: white;
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
          background: #2989ff;

          >span {
            color: rgba(4, 14, 38, 0.96);
            background: white;
          }
        }
      }
    }

    .conent-body {
      // height: calc(100% - 55px);
      flex: 1;
      overflow: hidden;
      overflow-y: scroll;
    }
  }

  .vidiconcontent {
    height: 670px;
  }
}

.vidicon {
  height: 725px;
}

.bottom-btn {
  position: absolute;
  bottom: 10px;
  left: 380px;
  display: flex;
  z-index: 10;

  &.stow {
    left: 25px;
    transition: all 1s ease-in;
  }

  &.open {
    left: 380px;
    transition: all 1s ease-in;
  }

  .btn-box {
    height: 56px;
    display: flex;
    background: linear-gradient(180deg, #134297 0%, #12316a 100%);
    margin-right: 16px;
    border-radius: 6px 6px 6px 6px;

    .line {
      width: 2px;
      height: 34px;
      background: linear-gradient(90deg, #09204a 50%, #13387f 100%);
      margin-top: 11px;
    }

    .btn-item {
      width: 60px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      &.active {
        p {
          color: #2bac7e;
        }
      }

      p {
        margin: 0;
        color: #bcd2ed;
        font-size: 12px;
      }
    }
  }
}

.not-data {
  text-align: center;
  margin-top: 16px;
}

@keyframes rightColorAnimation {
  0% {
    background: linear-gradient(90deg,
        rgba(168, 24, 11, 0) 0%,
        rgba(168, 24, 11, 0.62) 100%);
  }

  50% {
    background: transparent;
  }

  100% {
    background: linear-gradient(90deg,
        rgba(168, 24, 11, 0) 0%,
        rgba(168, 24, 11, 0.62) 100%);
  }
}

@keyframes leftColorAnimation {
  0% {
    background: linear-gradient(90deg,
        rgba(168, 24, 11, 0.62) 0%,
        rgba(168, 24, 11, 0) 100%);
  }

  50% {
    background: transparent;
  }

  100% {
    background: linear-gradient(90deg,
        rgba(168, 24, 11, 0.62) 0%,
        rgba(168, 24, 11, 0) 100%);
  }
}
</style>
<style lang="less">
.atabs {
  .ant-tabs-tab {
    color: #fff;
  }
}

.amap-logo,
.amap-copyright {
  display: none !important;
}

.alarm-market {
  width: 260px;
  height: 160px;
  background-size: contain;
  background-repeat: no-repeat;
  // position: fixed;
  // top: 50px;
  // left: 500px;
  z-index: 100;

  &.serious {
    background: url("./images/alarmBg.svg");
  }

  &.normal {
    background: url("./images/marketBg.svg");
  }

  .alarm-market-close {
    top: 6px;
    right: 20px;
    color: white;
    cursor: pointer;
    position: absolute;
  }

  .alarm-title {
    position: absolute;
    top: 30px;
    left: 30px;
    font-size: 18px;
    font-family: PingFang SC-Medium, PingFang SC;
    font-weight: 500;
    color: #ffffff;
    text-shadow: 0px 0px 4px #ff2e00;
  }

  .alarm-detail {
    position: absolute;
    top: 65px;
    left: 30px;
    width: 210px;
    font-size: 14px;
    font-family: PingFang SC-Regular;
    font-weight: 400;
    color: #e4e4e4;
  }
}

.custom-info {
  width: 300px;
  height: 260px;
  background: url("./images/marketBg.svg");
  background-size: contain;
  background-repeat: no-repeat;
  // position: fixed;
  // top: 50px;
  // left: 100px;
  z-index: 100;

  .custom-info-close {
    top: 10px;
    right: 10px;
    color: white;
    cursor: pointer;
    position: absolute;
  }

  .custom-person {
    position: absolute;
    top: 40px;
    left: 12px;
    background: url("./images/customPerson.svg");
    background-size: contain;
    background-repeat: no-repeat;
    width: 275px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .custom-person-icon {
      width: 50px;
      height: 50px;
      opacity: 1;
      border: 1px solid #388ef3;
      border-radius: 50%;
      margin-left: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .custom-person-name {
      margin-left: 12px;

      .person-status {
        font-size: 16px;
        font-family: PingFang SC-Medium;
        font-weight: 500;
        color: #ffffff;

        >span {
          width: 36px;
          height: 18px;
          background: rgba(255, 151, 55, 0.3);
          border-radius: 2px 2px 2px 2px;
          font-size: 12px;
          font-family: PingFang SC-Regular;
          font-weight: 400;
          color: #ff9737;
          line-height: 18px;
          text-align: center;
        }
      }

      .person-device {
        font-size: 14px;
        font-family: PingFang SC-Regular;
        font-weight: 400;
        color: #a2b5d6;
        text-align: left;
      }
    }

    .custom-person-line {
      width: 30px;
      height: 30px;
      background: #2c83ef;
      border-radius: 50%;
      margin-left: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }

  .custom-address {
    position: absolute;
    top: 100px;
    left: 22px;
    width: 255px;
    font-size: 14px;
    font-family: PingFang SC-Regular;
    font-weight: 400;
    color: #e4e4e4;

    >div {
      text-align: left;
      line-height: 28px;
    }
  }

  .custom-name {
    position: absolute;
    top: 40px;
    left: 13px;
    height: 62px;
    line-height: 62px;
    width: 274px;
    background-image: url("./images/contentBg.png");
    color: #fff;
    font-size: 18px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 16px;
  }

  .custom-content {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #e4e4e4;
    position: absolute;
    top: 102px;
    left: 0;
    padding: 16px;
  }

  .custom-btn {
    width: 100%;
    position: absolute;
    bottom: 40px;
    left: 0;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    >div {
      padding: 0 12px;
      height: 26px;
      background: #1f4790;
      border-radius: 4px 4px 4px 4px;
      opacity: 1;
      border: 1px solid #216cc3;
      font-size: 12px;
      font-family: PingFang SC-Regular, PingFang SC;
      font-weight: 400;
      color: #ffffff;
      cursor: pointer;
      line-height: 26px;
      text-align: center;

      &:first-child {
        margin-right: 10px;
      }
    }
  }
}

.personnel-search {
  .ant-input-affix-wrapper {
    background: transparent !important;
    color: rgba(183, 197, 211, 0.3);
    border-color: rgba(183, 197, 211, 0.3);

    .ant-input-suffix {
      color: rgba(183, 197, 211, 0.3);
    }
  }

  .ant-input {
    background: transparent;
    color: rgba(183, 197, 211, 1);
  }

  .ant-input-search-icon {
    color: rgba(183, 197, 211, 0.3);
  }

  .ant-select {
    color: rgba(183, 197, 211, 1);
  }

  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    background: transparent;
    border: none;
  }

  .ant-select-arrow {
    color: rgba(183, 197, 211, 1);
  }
}

.site-conditions {
  .ant-cascader-menus {
    background: rgba(29, 57, 110, 0.96);
    color: #e1e3e6;
  }

  .ant-cascader-menu {
    border-right: 1px solid #141f35;
  }

  .ant-cascader-menu-item-active:not(.ant-cascader-menu-item-disabled),
  .ant-cascader-menu-item-active:not(.ant-cascader-menu-item-disabled):hover {
    background: rgba(5, 18, 31, 0.2);
  }

  .ant-cascader-menu-item:hover {
    background: rgba(5, 18, 31, 0.2);
  }

  .ant-cascader-menu-item-expand .ant-cascader-menu-item-expand-icon,
  .ant-cascader-menu-item-loading-icon {
    color: #e1e3e6;
  }
}

.container {
  position: relative;
  padding: 0;
}

/* 1. 声明过渡效果 */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. 声明进入和离开的状态 */
.fade-enter-from,
.fade-leave-to {
  // opacity: 0;
  // transform: scaleY(0.01);
  transform: translateX(300px);
}

/* 3. 确保离开的项目被移除出了布局流
        以便正确地计算移动时的动画效果。 */
.fade-leave-active {
  position: absolute;
}

@keyframes move {
  from {
    transform: translate(300px);
  }

  to {
    transform: translate(0px);
  }
}

@keyframes movetop {
  from {
    transform: translate(0, 0);
  }

  to {
    transform: translate(0, 100px);
  }
}

// .alarm {
//     position: absolute;
//     right: 0;
//     top: 0;
//     width: 88px;
//     color: #fff;
//     border-radius: 0 0 0 30px;
//     text-align: center;
//     font-size: 12px;
// }

.one {
  background: rgba(255, 61, 61, 0.7);
}

.two {
  background: rgba(255, 102, 30, 0.7);
}

.three {
  background: rgba(231, 166, 13, 0.7);
}

.four {
  background: rgba(3, 9, 17, 0.3);
}

.gvideo-box {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;

  .gvideo {
    margin-bottom: 10px;
    margin-right: 10px;
    width: 504px;
    height: 304px;
  }

  .gvideo-title {
    font-size: 16px;
    color: #3d3d3d;
  }
}
</style>
<style lang="less">
.empty {
  color: #fff;

  :deep(.ant-empty-description) {
    color: #fff !important;
  }
}
</style>
