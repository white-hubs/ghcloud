<template>
  <div :class="[index === clickIndex ? 'primary-color-border' : '', 'ctr']">
    <div class="controlBtn flex-between" v-if="cameraItem?.id">
      <div class="cameraName">
        <PopOver v-if="cameraItem?.name.length > 8" :content="cameraItem?.name" position="topLeft">
          <span>{{ cameraItem?.name }}</span>
        </PopOver>
        <span v-else>{{ cameraItem?.name }}</span>
      </div>
      <div class="timeCtr flex-start">
        <div class="time">{{ nowTime }}</div>
        <div class="fullscreen pl2"></div>
        <CloseOutlined :style="{ fontSize: '16px' }" @click="closeItem" />
      </div>
    </div>
    <CubePlayer
      :h5sToken="playToken"
      :h5sControl="true"
      v-if="deviceId"
      :type="type"
      :dom-id="index"
      :device-id="deviceId"
      :max-recovery-count="5"
      :recovery-delays="[2000, 5000, 10000, 15000, 30000]"
      @error="handlePlayerError"
      @h5sSessionChange="h5sSessionChange"
    ></CubePlayer>
    <div v-if="deviceId && playerError" class="video-load-failed">
      <div class="failed-text">加载失败</div>
      <button class="refresh-btn" :disabled="refreshLoading" @click.stop="handleRefreshVideo">
        {{ refreshLoading ? "刷新中" : "刷新" }}
      </button>
    </div>
    <a-image v-if="!deviceId" src="" :fallback="emptyImage" />
  </div>
</template>
<script lang="jsx">
import { getCurrentInstance, defineComponent, onUnmounted, onMounted, reactive, toRefs, watch, computed } from "vue";

import { CubePlayer } from "@ghcloud/cube-player";

import Video from "../components/video.vue";
const emptyImage = "/resource/v1/security-monitor-migrate/images/video-empty.png";
import {
  UpOutlined,
  DownOutlined,
  LeftOutlined,
  CloseOutlined,
  RightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ScissorOutlined,
  PlayCircleOutlined,
  FullscreenOutlined,
  PauseCircleOutlined,
  VideoCameraOutlined,
  FullscreenExitOutlined,
  createFromIconfontCN,
} from "@ant-design/icons-vue";
import { timeFormat } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";

const IconFont = createFromIconfontCN({
  scriptUrl: `${__PUBLIC_PATH__}/font-8d5l8fzk5b87iudi.js`,
});

export default defineComponent({
  components: {
    CubePlayer,
    Video,
    UpOutlined,
    LeftOutlined,
    DownOutlined,
    RightOutlined,
    CloseOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    ScissorOutlined,
    PlayCircleOutlined,
    FullscreenOutlined,
    PauseCircleOutlined,
    VideoCameraOutlined,
    FullscreenExitOutlined,
    IconFont,
  },
  props: {
    cameraItem: {
      type: Object,
      default: () => {
        return {
          id: "",
        };
      },
    },
    videoLive: {
      type: Boolean,
      default: true,
    },
    button: {
      type: Boolean,
      default: true,
    },
    index: [Number],
    clickIndex: [Number],
    type: {
      type: String,
      default: "H5S",
    },
    refreshLoading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const serveIp = window.location.protocol;
    const state = reactive({
      isFull: false,
      fallback: window.config.fallback,
      fontStyle: { fontSize: "20px" },
      t: null,
      nowTime: "",
      tabShow: false,
      playerError: false,
    });
    const cameraId = computed(() => {
      return Math.floor(Math.random() * (9999 - 1000)) + 1000;
    });
    const playToken = computed(() => {
      return props.cameraItem?.token || props.cameraItem?.thirdPartyId || "";
    });
    const deviceId = computed(() => {
      return props.cameraItem?.id || props.cameraItem?.deviceId || "";
    });

    const clearTime = () => {
      if (state.t) {
        clearInterval(state.t);
        state.t = null;
      }
    };

    const getTime = () => {
      clearTime();
      state.t = setInterval(() => {
        const time = new Date();
        const day = time.getDay();
        state.nowTime = `星期${
          day === 0
            ? "天"
            : day === 1
              ? "一"
              : day === 2
                ? "二"
                : day === 3
                  ? "三"
                  : day === 4
                    ? "四"
                    : day === 5
                      ? "五"
                      : day === 6
                        ? "六"
                        : ""
        }  ${timeFormat(time, true)}`;
      }, 1000);
    };

    const closeItem = () => {
      emit("close-item", props.index);
    };
    const refreshVideo = () => {
      emit("refresh-video", {
        index: props.index,
        cameraItem: props.cameraItem,
      });
    };
    const handleRefreshVideo = () => {
      state.playerError = false;
      refreshVideo();
    };

    const tabEvent = (data) => {
      state.tabShow = data;
    };
    onMounted(() => {
      getTime();
    });

    onUnmounted(() => {
      clearTime();
    });

    watch(
      () => props.cameraItem,
      () => {
        state.playerError = false;
      },
    );

    return {
      ...toRefs(state),
      closeItem,
      refreshVideo,
      handleRefreshVideo,
      cameraId,
      playToken,
      deviceId,
      tabEvent,
      emptyImage,
      handlePlayerError: (msg, errorType) => {
        state.playerError = true;
        if (errorType === "PARAMS_ERROR") {
          refreshVideo();
        }
      },
      h5sSessionChange: (e) => {
        state.playerError = false;
        emit("h5sSessionChange", e);
      },
    };
  },
});
</script>
<style lang="less" scoped>
:deep(.ant-image) {
  width: 100%;
  height: 100%;
  .ant-image-img {
    width: 100%;
    height: 100% !important;
    object-fit: cover;
  }
}
.ctr {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  .controlBtn {
    width: 100%;
    height: 40px;
    line-height: 40px;
    // position: absolute;
    // top: 0;
    // z-index: 1;
    background-color: rgba(0, 0, 0, 0.1);
    padding: 0 8px;
    .timeCtr {
      // width: 50%;
    }
    .cameraName {
      flex: 1;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
  .container {
    width: 100%;
    height: calc(100% - 40px);
  }
  .bottomBtn {
    width: 100%;
    height: 40px;
    line-height: 40px;
    position: absolute;
    z-index: 1;
    background-color: rgba(255, 255, 255, 0.7);
    padding: 0 8px;
    transition: all 0.5s ease;
    &.showFooter {
      bottom: 0;
    }
    &.hideFooter {
      bottom: -40px;
    }
    .hideFooter {
    }
    .videoPlay {
      width: 15%;
    }
    .videoControl {
      width: 60%;
      text-align: center;
    }
    .videoOperate {
      border: 1px solid transparent;
      height: calc(100% - 2px);
    }
  }
  .empty {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
.video-load-failed {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  width: 100%;
  top: 40px;
  height: calc(100% - 40px);
  background: #000;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;

  .failed-text {
    font-size: 16px;
    line-height: 22px;
  }

  .refresh-btn {
    min-width: 64px;
    height: 32px;
    padding: 0 18px;
    color: #fff;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.36);
    cursor: pointer;

    &:hover:not(:disabled) {
      border-color: #fff;
    }

    &:disabled {
      color: rgba(255, 255, 255, 0.5);
      cursor: not-allowed;
    }
  }
}
:deep(.ant-image) {
  width: 100%;
}
:deep(.h5s_container) {
  height: calc(100% - 40px) !important;
}
</style>
