<template>
  <custom-modal
    className="incoming-conference-modal"
    @changeIsMinimized="changeMinimized"
    :isMinimized="isMinimized"
    v-model:visible="visible"
    :title="conferenceInfo.isVideo ? '多人视频通话' : '多人语音通话'"
    @close="rejectConference"
  >
    <div class="user">
      <div class="avatar">
        <img v-if="conferenceInfo.file" :src="conferenceInfo.file.path" alt="" />
        <img v-else src="/resource/v1/command-dispatch-migrate/commandDispatch/images/default-avatar.png" />
      </div>
      <div class="user-info">
        <div class="status-name">
          <span class="name">{{ conferenceInfo.name }}</span>
          <div class="status">在线</div>
        </div>
        <div class="number">联系电话: {{ conferenceInfo.mobile }}</div>
        <div style="display: flex; align-items: center; justify-content: space-between">
          <div class="number">部门: {{ conferenceInfo.organizationName }}</div>
          <div class="number">职位: {{ conferenceInfo.positionName }}</div>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="hangup" @click="rejectConference">
        <div class="style-container">
          <div class="bg-red">
            <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/phone-icon.png" alt="" />
          </div>
        </div>
        <div>挂断</div>
      </div>
      <div class="answer" @click="acceptConference">
        <div class="style-container">
          <div class="bg-green">
            <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/phone-icon.png" alt="" />
          </div>
        </div>
        <div>接听</div>
      </div>
    </div>
  </custom-modal>
</template>

<script>
import { CloseOutlined } from "@ant-design/icons-vue";
import { defineComponent, computed, getCurrentInstance, ref, watch, onMounted } from "vue";
import { useStore } from "vuex";

import customModal from "../custom-modal";
export default defineComponent({
  props: {
    conferenceInfo: {
      type: Object,
      default: () => {},
    },
    visible: {
      type: Boolean,
      default: false,
    },
    isMinimized: {
      type: Boolean,
      default: false,
    },
  },
  name: "incoming-conference-modal",
  components: { CloseOutlined, customModal },
  emits: ["close"],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const customModalRef = ref(null);
    const store = useStore();
    const webrtcInstance = computed(() => store.getters.webrtcInstance);
    const rejectConference = () => {
      webrtcInstance.value && webrtcInstance.value.rejectJoinConference();
      closeModal();
    };
    const closeModal = () => {
      emit("close");
    };
    watch(
      () => props.visible,
      (val) => {
        props.visible &&
          webrtcInstance.value.on("overConference", () => {
            closeModal();
            customModalRef.value?.closeCustomModal();
          });
      },
    );
    const acceptConference = () => {
      const mediaControl = document.getElementById("member-control-host");
      webrtcInstance.value.incomingConferenceAccept(mediaControl, props.conferenceInfo.isVideo);
      store.commit("userInfo/SET_USER_INFO", {
        ...store.getters.userInfo,
        openVideo: props.conferenceInfo.isVideo,
      });
      emit("openVideoConference");
      proxy.$emitter.emit("startConference", "video");
      closeModal();
    };
    const changeMinimized = (bol) => {
      emit("update:isMinimized", bol);
    };
    return {
      changeMinimized,
      rejectConference,
      acceptConference,
      customModalRef,
    };
  },
});
</script>

<style lang="less">
.incoming-conference-modal {
  width: 330px;
  padding: 12px;
  position: fixed;
  top: calc(50% - 225px);
  left: calc(50% - 165px);
  background: var(--dispatch-card-bg, #ffffff);
  border: 1px solid var(--dispatch-border, #d7e5f4);
  border-radius: 10px;
  box-shadow: var(--dispatch-shadow-strong, 0 12px 34px rgba(34, 95, 158, 0.18));

  .modal-close {
    top: 12px;
    right: 12px;
    color: var(--dispatch-map-blue, #1976d2);
    cursor: pointer;
    position: absolute;
  }

  .title {
    text-align: center;
    font-size: 18px;
    font-family:
      Source Han Sans CN-Regular,
      Source Han Sans CN;
    font-weight: 400;
    color: var(--dispatch-text, #26384d);
  }

  .user {
    margin: 0 12px;
    margin-top: 12px;
    padding: 5px 14px;
    display: flex;
    background: var(--dispatch-panel-bg-soft, #f5f9ff);
    background-image: none;
    border: 1px solid var(--dispatch-border-soft, #e7eff8);
    border-radius: 6px;
    align-items: center;
    background-size: cover;
    gap: 12px;

    .avatar {
      width: 60px;
      height: 60px;
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
          color: #ffffff;
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

      .number {
        font-size: 13px;
        font-family:
          Source Han Sans CN-Regular,
          Source Han Sans CN;
        font-weight: 400;
        color: #a2b5d6;
      }
    }
  }

  .content {
    padding: 34px 52px 26px;
    background: var(--dispatch-panel-bg-soft, #f6f9fd);
    border: 1px solid var(--dispatch-border-soft, #e8eef6);
    border-radius: 6px;
    margin-top: 10px;
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: space-between;

    .answer .style-container {
      background: rgba(30, 193, 56, 0.08) !important;
    }

    .hangup,
    .answer {
      display: flex;
      cursor: pointer;
      flex-direction: column;
      gap: 10px;
      font-size: 14px;
      font-family:
        Source Han Sans CN-Regular,
        Source Han Sans CN;
      font-weight: 400;
      color: #ffffff;

      .style-container {
        width: 66px;
        height: 66px;
        background: rgba(255, 61, 61, 0.1);
        display: flex;
        border-radius: 50%;
        justify-content: center;
        align-items: center;

        .bg-red {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 61, 61, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;

          img {
            width: 24px;
            height: 24px;
          }
        }

        .bg-green {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(30, 193, 56, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;

          img {
            width: 24px;
            height: 24px;
          }
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
