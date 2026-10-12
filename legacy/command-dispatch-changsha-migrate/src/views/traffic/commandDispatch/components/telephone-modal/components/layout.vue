<template>
  <div class="modal">
    <div class="modal-wrap" :class="{ full: isFullscreen }">
      <div class="modal-header">
        <div class="header-title">
          <span>{{ meetingName }}</span>
        </div>
        <div class="right">
          <div class="btn" @click="fullscreenModal">
            <FullscreenOutlined v-if="!isFullscreen" />
            <FullscreenExitOutlined v-else />
          </div>
          <div class="btn" @click="closeModal">
            <CloseOutlined />
          </div>
        </div>
      </div>
      <div class="modal-content">
        <slot name="content" />
        <div class="wrap">
          <div class="left" style="width: 210px">
            <slot name="content-left" />
          </div>
          <div class="right">
            <slot name="content-right" />
          </div>
        </div>
      </div>
      <div class="modal-bottom">
        <slot name="bottom" />
      </div>
    </div>
  </div>
</template>

<script>
import { CloseOutlined, FullscreenOutlined, FullscreenExitOutlined } from "@ant-design/icons-vue";
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, computed } from "vue";
import { useStore } from "vuex";
export default defineComponent({
  props: {
    title: {
      type: String,
      default: "",
    },
  },
  components: { CloseOutlined, FullscreenOutlined, FullscreenExitOutlined },
  setup(props, { emit }) {
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const meetingName = computed(() => store.getters.meetingTitle || "调度中心发起的会议");
    const state = reactive({
      isFullscreen: false,
    });
    onMounted(() => {});
    const closeModal = () => {
      emit("close");
      proxy.$emitter.emit("endConference");
    };
    const fullscreenModal = () => {
      state.isFullscreen = !state.isFullscreen;
      emit("fullscreen");
    };
    return {
      closeModal,
      meetingName,
      fullscreenModal,
      ...toRefs(state),
    };
  },
});
</script>
<style scoped lang="less">
.modal {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
}

.modal-wrap {
  position: fixed;
  top: 50%;
  width: 1100px;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--dispatch-modal-bg, rgba(255, 255, 255, 0.98));
  border: 1px solid var(--dispatch-border, #dbe4ef);
  box-shadow: var(--dispatch-shadow-strong, 0 12px 32px rgba(26, 54, 93, 0.18));
  font-size: 14px;
  font-family:
    Source Han Sans CN-Regular,
    Source Han Sans CN;
  font-weight: 400;
  color: var(--dispatch-text, #1f2d3d);
  line-height: 20px;

  &.full {
    width: 100% !important;
    height: 100% !important;
    display: flex;
    flex-direction: column;

    .modal-content {
      flex: 1;
    }
  }

  .modal-header {
    width: 100%;
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

    .right {
      display: flex;
      align-items: center;
    }

    .btn {
      width: 24px;
      height: 24px;
      background: var(--dispatch-map-blue-soft, #eaf4ff);
      color: var(--dispatch-map-blue, #216cc3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-left: 10px;
      border: 1px solid var(--dispatch-map-blue-border, #cfe0f3);
      border-radius: 4px;
    }
  }

  .modal-content {
    height: 432px;
    width: 100%;
    padding: 16px 16px 0;
    overflow: hidden;

    .wrap {
      display: flex;
      height: 100%;

      .left {
        flex: 1;
      }

      .right {
        margin-left: 16px;
      }
    }
  }

  .modal-bottom {
    width: 100%;
  }
}
</style>
