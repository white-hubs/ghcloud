<template>
  <custom-modal
    ref="customModalRef"
    className="telephone-video-modal"
    v-model:visible="visible"
    :isMinimized="isMinimized"
    @changeIsMinimized="changeIsMinimized"
    :title="meetingName"
    showFullscreenBtn
    @close="closeModal"
  >
    <div class="video-modal-wrap">
      <div class="video-modal-content">
        <div class="wrap">
          <div class="left" style="width: 210px">
            <videoList />
          </div>
          <div class="right">
            <userList type="video" />
          </div>
        </div>
      </div>
      <div class="video-modal-bottom">
        <tooBar v-if="visible" @endConference="closeModal" />
      </div>
    </div>
  </custom-modal>
</template>

<script>
import { CloseOutlined, FullscreenOutlined } from "@ant-design/icons-vue";
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, ref, computed, watch } from "vue";
import { useStore } from "vuex";

import customModal from "../custom-modal/index.vue";
import cLayout from "./components/layout.vue";
import tooBar from "./components/tool-bar.vue";
import userList from "./components/user-list.vue";
import videoList from "./components/video-list.vue";

export default defineComponent({
  components: { CloseOutlined, FullscreenOutlined, cLayout, videoList, userList, tooBar, customModal },
  props: {
    title: {
      type: String,
      default: "张三的会议",
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
  setup(props, { emit }) {
    const store = useStore();
    const webrtcInstance = computed(() => store.getters.webrtcInstance);
    const customModalRef = ref(null);
    const { proxy } = getCurrentInstance();
    const meetingName = computed(() => store.getters.meetingTitle || "调度中心发起的视频会议");
    const state = reactive({});
    watch(
      () => props.visible,
      () => {
        if (props.visible) {
          webrtcInstance.value.on("endConference", () => {
            customModalRef.value?.closeCustomModal();
          });
        }
      },
    );
    const closeModal = () => {
      emit("close");
      emit("update:isMinimized", false);
      customModalRef.value?.closeCustomModal();
      proxy.$emitter.emit("endConference");
    };
    const changeIsMinimized = (bol) => {
      emit("update:isMinimized", bol);
    };
    return {
      closeModal,
      ...toRefs(state),
      meetingName,
      customModalRef,
      changeIsMinimized,
    };
  },
});
</script>
<style lang="less">
.telephone-video-modal {
  position: fixed;
  width: 1100px;
  height: 600px;
  left: calc(50% - 1100px / 2);
  top: calc(50% - 600px / 2);
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

  .video-modal-wrap {
    height: 100%;

    &.full {
      width: 100% !important;
      height: 100% !important;
      display: flex;
      flex-direction: column;

      .video-modal-content {
        flex: 1;
      }
    }

    .video-modal-content {
      height: calc(100% - 160px);
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

    .video-modal-bottom {
      width: 100%;
    }
  }
}
</style>
