<template>
  <div class="video-link-box">
    <template v-if="realMonitor.length">
      <div v-if="showTitle" class="item-title">实时监控</div>
      <!-- <a-row v-if="realMonitor.length" :gutter="16"> -->
      <!-- <a-col :span="4">
          <a-menu mode="inline" v-model:selectedKeys="current">
            <a-menu-item v-for="item in realMonitor" :key="item.id">
              {{item.deviceName}}
            </a-menu-item>
          </a-menu>
        </a-col> -->
      <div class="item-video">
        <div
          v-for="item in realMonitor"
          :key="item.id"
          class="video-for"
          :style="{ width: realMonitor.length <= 2 ? `calc(100% / ${realMonitor.length})` : 'calc(100% / 2)', padding: '0 16px' }"
        >
          <CubePlayer
            v-if="item && item.deviceId"
            :h5sControl="true"
            class="video-player"
            :device-id="item.deviceId"
            @error="handleError"
            :isReconnect="true"
          />
        </div>
      </div>
      <!-- </a-row> -->
    </template>
  </div>
</template>

<script lang="jsx">
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, onBeforeUnmount, watch, ref, computed } from "vue";
import { useRoute } from "vue-router";

import { CubePlayer } from "@ghcloud/cube-player";

import { cubeDeviceCenterService } from "@/api/service";
export default defineComponent({
  props: {
    alarmStatus: {
      type: String,
    },
    id: {
      type: String,
    },
    showTitle: {
      type: Boolean,
      default: true,
    },
  },
  components: { CubePlayer },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    let disposed = false;
    const videoType = computed(() => {
      return window.config.feature?.videoAccessMode ?? "H5S";
    });
    const state = reactive({
      realMonitor: [],
      businessKey: props.id,
      current: [],
    });
    if (route.query.businessKey !== null && route.query.businessKey === undefined && route.query.businessKey) {
      state.businessKey = route.query.businessKey;
    }
    /*
     * 获取报警视频监控
     * @param {String} eventId 事件id
     * @return {Array}
     */
    const getEventVideo = async () => {
      const data = await proxy.$api.getVideoActionByEvent({
        eventId: state.businessKey,
      });
      if (disposed) {
        return;
      }
      state.realMonitor = Array.isArray(data) ? data : [];
      state.current = state.realMonitor.length ? [state.realMonitor[0].id] : [];
    };
    onMounted(() => {
      getEventVideo();
    });
    onBeforeUnmount(() => {
      disposed = true;
      state.realMonitor = [];
      state.current = [];
    });
    const handleError = (e) => {
      proxy.$message.error(`监控${e}`);
    };
    const currentMonitor = computed(() => {
      return state.realMonitor.find((item) => item.id === state.current[0]);
    });
    return {
      ...toRefs(state),
      videoType,
      handleError,
      currentMonitor,
    };
  },
});
</script>

<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");

.detail-form .video-link-box {
  width: 100%;
}
.item-video {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  flex-wrap: wrap;
  overflow: auto;
  max-height: 450px;
}
.video-for {
  height: 400px;
  margin-bottom: 16px;
}

.video-player {
  width: 100%;
}

.item-title {
  font-family: "PingFang SC-Medium";
  padding-top: 15px !important;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}
</style>
