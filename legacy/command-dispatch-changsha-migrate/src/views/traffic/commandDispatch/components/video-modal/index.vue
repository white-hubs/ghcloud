<template>
  <custom-modal
    :className="`video-modal ${videoFull ? 'full' : ''}`"
    :title="videoData.curEnlargeVideo.name || videoData.curEnlargeVideo.deviceName"
    :isMinimized="isMinimized"
    @changeIsMinimized="changeIsMinimized"
    v-model:visible="visible"
    @close="close"
  >
    <div class="video-modal-content flex-column">
      <div class="conent-body" v-if="videoData.curEnlargeVideo.thirdPartyId">
        <CubePlayer h5sControl :id="videoData.curEnlargeVideo.id" :token="videoData.curEnlargeVideo.thirdPartyId" />
      </div>
    </div>
  </custom-modal>
</template>

<script>
import { CloseOutlined } from "@ant-design/icons-vue";
import { defineComponent, onMounted, reactive, ref, toRefs } from "vue";

import CubePlayer from "../../../../../components/cube-player/index.vue";
import customModal from "../custom-modal/index.vue";
export default defineComponent({
  components: {
    CloseOutlined,
    customModal,
    CubePlayer,
  },
  props: {
    videoData: {
      type: Object,
      default: () => {
        return {
          curEnlargeVideo: {},
        };
      },
    },
    videoFull: {
      type: Boolean,
      default: false,
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
  setup(props, { emit }) {
    const state = reactive({
      videoFull: false,
    });
    const close = () => {
      emit("closeVideoModal");
    };
    const fullScreen = (full) => {
      state.videoFull = full;
    };
    const changeIsMinimized = (bol) => {
      emit("update:isMinimized", bol);
    };
    return {
      changeIsMinimized,
      ...toRefs(state),
      fullScreen,
      close,
    };
  },
});
</script>

<style lang="less">
.video-modal {
  width: 1250px;
  min-height: 725px;
  position: fixed;
  top: calc(50% - 362.5px);
  left: calc(50% - 625px);
  background: var(--dispatch-modal-bg, rgba(255, 255, 255, 0.98));
  border: 1px solid var(--dispatch-border, #dbe4ef);
  box-shadow: var(--dispatch-shadow-strong, 0 12px 32px rgba(26, 54, 93, 0.18));
  color: var(--dispatch-text, #1f2d3d);
  z-index: 999;

  &.full {
    width: 100%;
    height: 100%;
    top: 0 !important;
    left: 0 !important;
  }

  .video-modal-header {
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

  .video-modal-content {
    height: 670px;
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
        border: 1px solid rgba(183, 197, 211, 0.3);
        margin-right: 12px;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0px 0px 2px 0px rgba(56, 142, 243, 0.45);
        cursor: pointer;

        > span {
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
          background: #216cc3;

          > span {
            color: var(--dispatch-map-blue, #1976d2);
            background: white;
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
