<template>
  <div class="h5s_container" :class="full ? 'full' : ''">
    <video :id="idStr" />
    <div v-if="control" class="h5s_container_control">
      <div
        @mouseup.stop="setVedioStop()"
        @mousedown.stop="setVedioArrow('left')"
        v-if="coutrolVisible('left')"
      >
        <LeftOutlined />
      </div>
      <div
        @mouseup.stop="setVedioStop()"
        @mousedown.stop="setVedioArrow('down')"
        v-if="coutrolVisible('down')"
      >
        <DownOutlined />
      </div>
      <div 
        @mouseup.stop="setVedioStop()" 
        @mousedown.stop="setVedioArrow('up')"
        v-if="coutrolVisible('up')"
      >
        <UpOutlined />
      </div>
      <div
        @mouseup.stop="setVedioStop()"
        @mousedown.stop="setVedioArrow('right')"
        v-if="coutrolVisible('right')"
      >
        <RightOutlined />
      </div>
      <div
        @mouseup.stop="setVedioStop()"
        @mousedown.stop="setVedioArrow('zoomin')"
        v-if="coutrolVisible('zoomin')"
      >
        <ZoomInOutlined />
      </div>
      <div
        @mouseup.stop="setVedioStop()"
        @mousedown.stop="setVedioArrow('zoomout')"
        v-if="coutrolVisible('zoomout')"
      >
        <ZoomOutOutlined />
      </div>
      <div @click="clickFull" v-if="coutrolVisible('fullscreen')">
        <FullscreenOutlined v-if="!full" />
        <FullscreenExitOutlined v-else />
        <!-- <img :src="$icons.full" alt="" /> -->
      </div>
      <!-- <div @mousedown.stop="setVedioArrow('left')"><img :src="$icons.video_cut" alt=""></div> -->
    </div>
  </div>
</template>
<script>
import {
  defineComponent,
  onMounted,
  toRefs,
  nextTick,
  reactive,
  watch,
  onUnmounted,
} from "vue";
import { H5sPlayerWS } from "./h5splayer/h5splayer.js";
import { guid } from "@/utils/common";
import axios from "axios";
import {
  UpOutlined,
  DownOutlined,
  LeftOutlined,
  RightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from "@ant-design/icons-vue";
export default defineComponent({
  name: "gVideo",
  components: {
    UpOutlined,
    DownOutlined,
    LeftOutlined,
    RightOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined,
  },
  props: {
    token: {
      type: String,
      default: () => {
        return "";
      },
    },
    protocol: {
      type: String,
      default: () => {
        return "https:";
      },
    },
    profile: {
      type: String,
      default: () => {
        return "sub";
      },
    },
    control: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    coutrolBtns: {
      type: Array,
      default: () => {
        return ['left', 'down', 'up', 'right', 'zoomin', 'zoomout', 'fullscreen'];
      },
    }
  },
  setup(props, { emit }) {
    const serveIp = window.location.protocol;
    const state = reactive({
      player: null,
      idStr: null,
      full: false,
    });
    watch(
      () => props.token,
      () => {
        if (state.player) {
          state.player.disconnect();
          state.player = null;
        }
        playVideo();
      },
    );
    onMounted(() => {
      state.idStr = guid();
      playVideo();
    });
    onUnmounted(() => {
      if (state.player) {
        state.player.disconnect();
        state.player = null;
      }
    });
    const playVideo = () => {
      const conf = {
        hlsver: "v1",
        host: window.videoUrl,
        protocol: window.protocol,
        rootpath: "/",
        session: window.videoSession,
        streamprofile: "sub",
        profile: "sub",
        token: props.token,
        sub: props.token,
        videoid: state.idStr,
        consolelog: "false",
      };
      nextTick(() => {
        state.player = new H5sPlayerWS(conf);
        state.player.connect();
      });
    };
    const setVedioArrow = actionType => {
      if (window.videoUrl) {
        axios.get(serveIp + "//" + window.videoUrl + "/api/v1/Ptz", {
          params: {
            token: props.token,
            action: actionType,
            speed: 0.4,
            session: window.videoSession,
          },
        });
      }
    };
    const setVedioStop = () => {
      if (window.videoUrl) {
        axios.get(serveIp + "//" + window.videoUrl + "/api/v1/Ptz", {
          params: {
            token: props.token,
            action: "stop",
            session: window.videoSession,
          },
        });
      }
    };
    const clickFull = () => {
      state.full = !state.full;

      emit("fullScreen", state.full);
    };
    // 判断当前按钮是否显示
    const coutrolVisible = (curBtn) => {
      return props.coutrolBtns.includes(curBtn)
    };
    return {
      ...toRefs(state),
      playVideo,
      setVedioArrow,
      setVedioStop,
      clickFull,
      coutrolVisible
    };
  },
});
</script>

<style lang="less" scoped>
.h5s_container {
  width: 100%;
  height: 100%;
  position: relative;

  &.full {
    // width: 100%;
    // height: 100%;
    // z-index: 2010;
    // position: fixed;
    // top: 0;
    // left: 0;
    // background-color: rgba(15, 16, 26, 0.7);
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: fill;
  }

  .h5s_container_control {
    height: 28px;
    width: 200px;
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translate(-50%, 0);
    background-color: rgba(15, 16, 26, 0.7);
    display: flex;
    align-items: center;
    justify-content: space-around;

    > div {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: rgba(41, 137, 255, 1);

      > img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
