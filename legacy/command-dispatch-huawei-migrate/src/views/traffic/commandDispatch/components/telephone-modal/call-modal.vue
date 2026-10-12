<template>
  <custom-modal
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
            <callList />
          </div>
          <div class="right">
            <userList type="audio" />
          </div>
        </div>
      </div>
      <div class="video-modal-bottom">
        <toolBar v-if="visible" type="call" @endConference="closeModal" />
      </div>
    </div>
  </custom-modal>
</template>

<script>
import { CloseOutlined, FullscreenOutlined } from "@ant-design/icons-vue";
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, computed } from "vue";
import { useStore } from "vuex";

import customModal from "../custom-modal/index.vue";
import callList from "./components/call-list.vue";
import cLayout from "./components/layout.vue";
import toolBar from "./components/tool-bar.vue";
import userList from "./components/user-list.vue";

export default defineComponent({
  components: { CloseOutlined, FullscreenOutlined, cLayout, callList, userList, toolBar, customModal },
  props: {
    title: {
      type: String,
      default: "张三的多人通话",
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
    const { proxy } = getCurrentInstance();
    const meetingName = computed(() => store.getters.meetingTitle || "调度中心发起的会议");
    const state = reactive({});
    onMounted(() => {});
    const closeModal = () => {
      emit("close");
      proxy.$emitter.emit("endConference");
    };
    const changeIsMinimized = (bol) => {
      emit("update:isMinimized", bol);
    };
    return {
      closeModal,
      ...toRefs(state),
      meetingName,
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
