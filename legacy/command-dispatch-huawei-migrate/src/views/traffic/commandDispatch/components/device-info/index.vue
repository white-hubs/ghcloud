<template>
  <div class="device-info-modal">
    <div class="device-info-modal-header">
      <div class="header-title">
        <span>设备详情</span>
      </div>
      <div class="header-close" @click="closeDeviceInfo">
        <CloseOutlined />
      </div>
    </div>
    <div class="deviceTabs">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" tab="设备信息">
          <div style="padding: 0 10px" class="basic-info" v-if="deviceId && visible">
            <g-device-basic :deviceId="deviceId"></g-device-basic>
          </div>
        </a-tab-pane>
        <a-tab-pane key="4" tab="关联监控">
          <div class="tab-pane-content gvideo-box" v-if="deviceDataVideos.length > 0">
            <div v-for="(item, index) in deviceDataVideos" :key="index">
              <div>
                <span class="gvideo-title">{{ item.name }}</span>
                <g-video
                  :ref="(el) => setRef(el, index)"
                  class="gvideo"
                  :token="item.thirdPartyId"
                  :control="true"
                  @fullScreen="fullScreen(item, index)"
                ></g-video>
              </div>
            </div>
          </div>
          <div v-else class="empty">
            <a-empty />
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script>
import { CloseOutlined, RightOutlined } from "@ant-design/icons-vue";
import { defineComponent, getCurrentInstance, onMounted, reactive, ref, toRefs, watch } from "vue";
export default defineComponent({
  components: {
    CloseOutlined,
  },
  props: {
    deviceId: {
      type: String,
      default: "",
    },
    visible: {
      type: Boolean,
      default: () => false,
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      deviceDataVideos: [],
      activeKey: "1",
    });
    const refList = ref([]);
    const setRef = (el, index) => {
      refList.value[index] = el;
    };
    const fullScreen = (status, index) => {
      const element = refList.value[index].$el;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullScreen();
      }
    };
    watch(
      () => props.visible,
      () => {
        if (props.visible) {
          state.activeKey = "1";
          getBasicVideosData();
        }
      },
    );
    const getBasicVideosData = async () => {
      const data = await proxy.$api.getDeviceCenterVideos({
        deviceId: props.deviceId,
      });
      console.log("数据");
      if (data) {
        state.deviceDataVideos = data;
      }
    };
    const closeDeviceInfo = () => {
      emit("closeDeviceInfo");
    };
    return {
      ...toRefs(state),
      setRef,
      refList,
      fullScreen,
      closeDeviceInfo,
    };
  },
});
</script>
<style lang="less">
.deviceTabs {
  .ant-tabs-tab {
    color: #fff;
  }

  .basic-info {
    height: 430px;
    overflow-y: auto;
  }

  .tab-pane-content {
    padding: 0 20px;
  }

  .gvideo-box {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;

    .gvideo {
      margin-top: 10px;
      margin-bottom: 10px;
      margin-right: 10px;
      width: 504px;
      height: 304px;
    }

    .gvideo-title {
      font-size: 16px;
    }
  }
}
</style>
<style lang="less" scoped>
.device-info-modal {
  width: 1250px;
  height: 545px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--dispatch-modal-bg, rgba(255, 255, 255, 0.98));
  border: 1px solid var(--dispatch-border, #dbe4ef);
  box-shadow: var(--dispatch-shadow-strong, 0 12px 32px rgba(26, 54, 93, 0.18));
  color: var(--dispatch-text, #1f2d3d);
  z-index: 999;

  &.full {
    width: 100%;
    height: 100%;
  }

  .device-info-modal-header {
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

  .vidiconcontent {
    height: 670px;
  }
}
</style>
