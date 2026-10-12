<template>
  <div class="custom-map-window">
    <span class="custom-info-close" @click="close">
      <CloseOutlined />
    </span>
    <div class="user">
      <div class="avatar">
        <img v-if="state.file" :src="state.file.path" alt="" />
        <img v-else src="/resource/v1/command-dispatch-migrate/commandDispatch/images/default-avatar.png" alt="" />
      </div>
      <div class="user-info">
        <div class="status-name">
          <span class="name ellipsis">{{ state.name }}</span>
          <div class="status">在线</div>
        </div>
        <div class="number">联系电话: {{ state.mobile }}</div>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px">
          <a-tooltip placement="topLeft" :title="state.organizationName" arrow-point-at-center>
            <div class="user-row-item ellipsis">部门: {{ state.organizationName }}</div>
          </a-tooltip>
          <a-tooltip placement="topLeft" :title="state.positionName" arrow-point-at-center>
            <div class="user-row-item ellipsis">职位: {{ state.positionName }}</div>
          </a-tooltip>
        </div>
      </div>
    </div>
    <div class="window-content" v-show="!isCalling">
      <div class="handle-item" @click="() => handleAudioCall(false)">
        <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/voice.png" alt="" />
        <span>语音呼叫</span>
      </div>
      <div class="handle-item" @click="() => handleAudioCall(true)">
        <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/video.png" alt="" />
        <span>视频呼叫</span>
      </div>
      <div class="handle-item" @click="handleOpenTrail">
        <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/trail.png" alt="" />
        <span>历史轨迹</span>
      </div>
    </div>
    <div class="calling-container" v-show="isCalling">
      <div class="calling-ui">
        <div class="calling-content" v-show="!isVideo">
          <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/calling-icon.png" alt="" />
          <span>{{ value }}</span>
        </div>
        <div v-if="isVideo" style="position: relative">
          <div id="local-make-call-video" style="width: 100%; height: 158px; object-fit: fill"></div>
          <span class="video-name-label">{{ value }}</span>
        </div>
      </div>
      <div class="window-content" style="padding: 16px; gap: 20px; margin-top: 0px">
        <div class="handle-item" @click="handleHoldCall">
          <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/keep-icon.png" alt="" />
          <span>{{ isHoldCall ? "取消静音" : "静音" }}</span>
        </div>
        <!-- <div class="handle-item" @click="handleTransfer">
          <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/transfer-phone.png" alt="">
          <span>转接</span>
        </div> -->
        <div class="handle-item" @click="handleInvite">
          <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/invate-icon.png" alt="" />
          <span>邀请</span>
        </div>
        <!-- <div class="handle-item" @click="handleRecordAudio">
          <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/record-icon.png" alt="">
          <span>{{ isRecord?'取消录音':'录音' }}</span>
        </div> -->
      </div>
    </div>
    <div class="window-operate" v-show="isCalling">
      <div class="ring-off-item" @click="handleHangup">
        <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/ring-off-icon.png" alt="" />
        <span>挂断</span>
      </div>
    </div>

    <historyTrailModal
      v-show="trailVisible"
      v-model:visible="trailVisible"
      v-model:isMinimized="trailIsMinimized"
      :stateInfo="state"
      @historyPointLines="pointHistoryTrail"
      @clearHistoryPointLines="clearHistoryTrail"
      @close="handleCloseModal"
    />
    <checkPersonModal
      v-if="personVisible"
      v-model:visible="personVisible"
      v-model:isMinimized="personIsMinimized"
      multiple="multiplePerson"
      @confirm="handleConfirm"
      @close="handleClosePerson"
    />
  </div>
</template>

<script>
import { CloseOutlined } from "@ant-design/icons-vue";
import { defineComponent, reactive, toRefs, computed, getCurrentInstance } from "vue";
import { useStore } from "vuex";

import checkPersonModal from "../check-person-modal/index.vue";
import historyTrailModal from "../history-trail-modal/index.vue";
const CDI = "/resource/v1/command-dispatch-migrate/commandDispatch/images";
const startIcon = `${CDI}/start-icon.png`;
const endIcon = `${CDI}/end-icon.png`;
export default defineComponent({
  components: { CloseOutlined, historyTrailModal, checkPersonModal },
  name: "customPersonWindow",
  props: {
    state: {
      type: Object,
      default: () => {},
    },
    mapInstance: {
      type: Object,
      default: () => {},
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    let timer = null;
    const state = reactive({
      trailVisible: false,
      trailIsMinimized: false,
      isCalling: false, //是否正在通话中
      timeValue: 0,
      value: "00:00",
      isHoldCall: false,
      isVideo: false,
      personVisible: false,
      personIsMinimized: false,
      isRecord: false,
      multiplePerson: false,
    });
    const webrtcInstance = computed(() => store.getters.webrtcInstance);
    const localUser = computed(() => store.getters.localUserInfo ?? { name: "指挥调度中心" });
    const close = () => {
      emit("close");
      handleHangup();
    };
    const startCall = () => {
      state.isCalling = true;
      if (timer) {
        clearInterval(timer);
      }
      timer = window.setInterval(() => {
        ++state.timeValue;
        state.value = formateSeconds(state.timeValue);
      }, 1000);
    };
    const handleHangup = () => {
      if (state.isCalling) {
        overCall();
        webrtcInstance.value.hangupCall();
      }
    };
    const handleClosePerson = () => {
      state.personVisible = false;
    };
    const handleTransfer = () => {
      state.multiplePerson = false;
      state.personVisible = true;
      state.personIsMinimized = false;
    };
    const handleInvite = () => {
      state.multiplePerson = true;
      state.personVisible = true;
      state.personIsMinimized = false;
    };
    const formateSeconds = (endTime) => {
      let secondTime = parseInt(endTime); //将传入的秒的值转化为Number
      let min = 0; // 初始化分
      let h = 0; // 初始化小时
      let result = "";
      if (secondTime > 60) {
        //如果秒数大于60，将秒数转换成整数
        min = parseInt(secondTime / 60); //获取分钟，除以60取整数，得到整数分钟
        secondTime = parseInt(secondTime % 60); //获取秒数，秒数取佘，得到整数秒数
        if (min > 60) {
          //如果分钟大于60，将分钟转换成小时
          h = parseInt(min / 60); //获取小时，获取分钟除以60，得到整数小时
          min = parseInt(min % 60); //获取小时后取佘的分，获取分钟除以60取佘的分
        }
      }
      if (h.toString().padStart(2, "0") === "00") {
        result = `${min.toString().padStart(2, "0")}:${secondTime.toString().padStart(2, "0")}`;
      } else {
        result = `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:${secondTime.toString().padStart(2, "0")}`;
      }

      return result;
    };
    const overCall = () => {
      window.clearInterval(timer);
      timer = null;
      state.timeValue = 0;
      state.value = "00:00";
      state.isHoldCall = false;
      state.isCalling = false;
      state.isRecord = false;
      state.personVisible = false;
    };
    // 打开轨迹弹窗
    const handleOpenTrail = () => {
      state.trailVisible = true;
      state.trailIsMinimized = false;
    };
    // 语音电话
    const handleAudioCall = (isVideo) => {
      if (webrtcInstance.value.callState !== "IDLE") {
        proxy.$message.error("当前正在通话中，请先结束通话");
        return;
      }
      startCall();
      state.isVideo = isVideo;
      const mediaControl = document.getElementById(`user-video-${props.state.id}`);
      webrtcInstance.value.makeCall(props.state.id, mediaControl, isVideo);
      webrtcInstance.value.on("overCalled", () => {
        overCall();
      });
    };
    // 保持
    const handleHoldCall = () => {
      if (!state.isHoldCall) {
        state.isHoldCall = true;
        webrtcInstance.value.holdCall();
        return;
      }
      state.isHoldCall = false;
      webrtcInstance.value.unHoldCall();
    };
    // 录音
    const handleRecordAudio = () => {
      if (!state.isRecord) {
        state.isRecord = true;
        webrtcInstance.value.startAudioRecord();
        return;
      }
      state.isRecord = false;
      webrtcInstance.value.endAudioRecord();
    };
    // 关闭历史轨迹
    const handleCloseModal = () => {
      state.trailVisible = false;
    };
    const trailPoly = [];
    const trailMark = [];
    // 画轨迹线
    const paintTrailForMap = (path = []) => {
      if (path.length < 2) return;
      const polyline = new AMap.Polyline({
        map: props.mapInstance,
        path: path,
        strokeColor: "#216cc3",
        strokeWeight: 6,
        strokeStyle: "solid",
        showDir: true,
      });
      if (!props.mapInstance) return;
      props.mapInstance.add(polyline);
      trailPoly.push(polyline);
    };
    // 起点终点mark
    const addMarkToMap = (lngLat, icon) => {
      const mapIcon = new AMap.Icon({
        size: new AMap.Size(36, 52),
        // 图标尺寸
        image: icon ?? broadcast, // Icon的图像
        imageSize: new AMap.Size(36, 52), // 根据所设置的大小拉伸或压缩图片
      });
      const marker = new AMap.Marker({
        position: new AMap.LngLat(lngLat[0], lngLat[1]),
        // 将一张图片的地址设置为 icon
        icon: mapIcon,
        // 设置了 icon 以后，设置 icon 的偏移量，以 icon 的 [center bottom] 为原点
        offset: new AMap.Pixel(-13, -30),
      });
      if (!props.mapInstance) return;
      props.mapInstance.add(marker);
      trailMark.push(marker);
    };
    const pointHistoryTrail = (path = []) => {
      // 过滤不在半径范围内的点
      const filteredPath = path.filter((point) => {
        const lnglat = new AMap.LngLat(point[0], point[1]);
        const centerPoint = new AMap.LngLat(store.getters.mapConfig.lnglat[0], store.getters.mapConfig.lnglat[1]);
        const radius = Number(store.getters.mapConfig.radius);
        const distance = AMap.GeometryUtil.distanceOfLine([lnglat, centerPoint]);
        return distance <= radius;
      });

      // 如果过滤后没有点或只有一个点，则不绘制
      if (filteredPath.length === 0) return;

      if (filteredPath.length === 1) {
        addMarkToMap(filteredPath.at(-1), endIcon);
      }
      if (filteredPath.length > 1) {
        paintTrailForMap(filteredPath);
        addMarkToMap(filteredPath.at(-1), startIcon);
        addMarkToMap(filteredPath.at(0), endIcon);
      }
    };
    const clearHistoryTrail = () => {
      if (!props.mapInstance) return;
      props.mapInstance.remove(trailPoly);
      props.mapInstance.remove(trailMark);
    };
    // 转接
    const handleConfirm = async (number) => {
      if (!state.multiplePerson) {
        webrtcInstance.value.transferCall(number);
      } else {
        console.log(store.state.commandDispatch.conferenceMembers);
        overCall();
        const members = [...number];
        const meetingName = `${localUser.value.name}发起的的${state.isVideo ? "视频" : "语音"}通话`;
        store.commit("commandDispatch/SET_MEETING_TITLE", meetingName);
        webrtcInstance.value.addConferenceMembers(members);
        proxy.$emitter.emit("startConference", "video");
        emit("openVideoConference");
      }
    };
    return {
      ...toRefs(state),
      handleCloseModal,
      handleHangup,
      handleConfirm,
      handleAudioCall,
      handleTransfer,
      handleInvite,
      handleOpenTrail,
      handleHoldCall,
      clearHistoryTrail,
      handleRecordAudio,
      handleClosePerson,
      pointHistoryTrail,
      close,
    };
  },
});
</script>

<style scoped lang="less">
.custom-map-window {
  padding: 34px 12px 22px;
  width: 320px;
  background: var(--dispatch-modal-bg, rgba(255, 255, 255, 0.98));
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: relative;
  z-index: 100;
  border: 1px solid var(--dispatch-border, #dbe4ef);
  border-radius: 8px;
  box-shadow: var(--dispatch-shadow-strong, 0 12px 32px rgba(26, 54, 93, 0.18));

  .custom-info-close {
    top: 12px;
    right: 12px;
    color: var(--dispatch-text-secondary, #64748b);
    cursor: pointer;
    position: absolute;
  }

  .user {
    margin: 0 12px;
    padding: 5px 14px;
    display: flex;
    background: var(--dispatch-panel-bg-soft, #f6f9fd);
    background-size: cover;
    align-items: center;
    gap: 12px;
    border: 1px solid var(--dispatch-border-soft, #e8eef6);
    border-radius: 6px;

    .avatar {
      width: 60px;
      height: 60px;
      flex-shrink: 0;
      opacity: 1;
      border: 1px solid #216cc3;
      border-radius: 50%;
      padding: 2px;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }

    .user-info {
      display: flex;
      flex-direction: column;

      .status-name {
        display: flex;
        align-items: center;
        gap: 6px;

        .name {
          font-size: 20px;
          font-family:
            Source Han Sans CN-Medium,
            Source Han Sans CN;
          font-weight: 500;
          color: var(--dispatch-text, #1f2d3d);
        }

        .status {
          padding: 2px 6px;
          background: rgba(75, 255, 55, 0.1);
          border-radius: 2px 2px 2px 2px;
          font-size: 12px;
          font-family:
            PingFang SC-Regular,
            PingFang SC;
          font-weight: 400;
          color: #1ec138;
        }
      }

      .ellipsis {
        overflow: hidden; //超出的文本隐藏
        text-overflow: ellipsis; //溢出用省略号显示
        white-space: nowrap; //溢出不换行
      }

      .user-row-item {
        max-width: 100px;
      }

      .number,
      .user-row-item {
        font-size: 13px;
        font-family:
          Source Han Sans CN-Regular,
          Source Han Sans CN;
        font-weight: 400;
        color: var(--dispatch-text-secondary, #64748b);
      }
    }
  }

  .window-content {
    display: flex;
    align-items: center;
    padding: 18px 40px;
    justify-content: space-around;
    gap: 40px;
    font-size: 11px;
    font-family:
      Source Han Sans CN-Regular,
      Source Han Sans CN;
    font-weight: 400;
    color: var(--dispatch-text-secondary, #64748b);

    .handle-item {
      cursor: pointer;
      display: flex;
      text-align: center;
      gap: 5px;
      flex-direction: column;

      img {
        width: 46px;
        height: 46px;
      }
    }
  }

  .calling-container {
    margin-top: 20px;

    .calling-ui {
      padding: 4px;
      background: var(--dispatch-panel-bg-soft, #f6f9fd);
      border: 1px solid var(--dispatch-border-soft, #e8eef6);
      border-radius: 6px;

      .calling-content {
        padding: 13px 92px;
        display: flex;
        align-items: center;
        font-size: 14px;
        font-family:
          Source Han Sans CN-Regular,
          Source Han Sans CN;
        font-weight: 400;
        color: var(--dispatch-text-secondary, #64748b);
        gap: 14px;

        img {
          width: 42px;
          height: 42px;
        }
      }
    }
  }

  .window-operate {
    display: flex;
    justify-content: flex-end;
    padding-top: 10px;
    border-top: 1px solid var(--dispatch-border, #d7e5f4);
    gap: 10px;

    .operate-item {
      padding: 5px 15px 5px 9px;
      background: rgba(41, 137, 255, 0.4);
      border-radius: 4px 4px 4px 4px;
      display: flex;
      align-items: center;
      font-size: 12px;
      gap: 6px;
      font-family:
        Source Han Sans CN-Regular,
        Source Han Sans CN;
      font-weight: 400;
      border: 1px solid #216cc3;
      color: #ffffff;
      cursor: pointer;

      img {
        width: 16px;
        height: 16px;
        margin-bottom: 2px;
      }
    }

    .ring-off-item {
      padding: 5px 15px 5px 9px;
      background: rgba(255, 61, 61, 0.4);
      border-radius: 4px 4px 4px 4px;
      display: flex;
      align-items: center;
      font-size: 12px;
      gap: 6px;
      font-family:
        Source Han Sans CN-Regular,
        Source Han Sans CN;
      font-weight: 400;
      border: 1px solid #ff3d3d;
      color: #ffffff;
      cursor: pointer;

      img {
        width: 16px;
        height: 16px;
        margin-bottom: 2px;
      }
    }
  }
}
</style>
