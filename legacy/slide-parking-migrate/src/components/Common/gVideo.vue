<template>
  <div class="h5s_container" :class="full ? 'full' : ''">
    <video :id="idStr" />
    <div v-if="control" class="h5s_container_control">
      <div
        @mouseup.stop="setVedioStop()"
        @mousedown.stop="setVedioArrow('left')"
      >
        <img :src="$icons.video_left" alt="" />
      </div>
      <div
        @mouseup.stop="setVedioStop()"
        @mousedown.stop="setVedioArrow('down')"
      >
        <img :src="$icons.video_down" alt="" />
      </div>
      <div @mouseup.stop="setVedioStop()" @mousedown.stop="setVedioArrow('up')">
        <img :src="$icons.video_up" alt="" />
      </div>
      <div
        @mouseup.stop="setVedioStop()"
        @mousedown.stop="setVedioArrow('right')"
      >
        <img :src="$icons.video_right" alt="" />
      </div>
      <div
        @mouseup.stop="setVedioStop()"
        @mousedown.stop="setVedioArrow('zoomin')"
      >
        <img :src="$icons.video_plus" alt="" />
      </div>
      <div
        @mouseup.stop="setVedioStop()"
        @mousedown.stop="setVedioArrow('zoomout')"
      >
        一
      </div>
      <div @click="clickFull"><img :src="$icons.full" alt="" /></div>
      <!-- <div @mousedown.stop="setVedioArrow('left')"><img :src="$icons.video_cut" alt=""></div> -->
    </div>
  </div>
</template>
<script lang="jsx">
import {
  defineComponent,
  onMounted,
  toRefs,
  getCurrentInstance,
  nextTick,
  reactive,
  ref,
  watch,
  onUnmounted,
} from "vue";
import { H5sPlayerWS } from "./h5splayer/h5splayer.js";
import { guid } from "@/utils/common";
import axios from "axios";
export default defineComponent({
  name: "gVideo",
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
  },
  setup(props) {
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
      }
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
        streamprofile: props.profile,
        profile: props.profile,
        token: props.token,
        sub: props.token,
        videoid: state.idStr,
      };
      nextTick(() => {
        state.player = new H5sPlayerWS(conf);
        state.player.connect();
      });
    };
    const setVedioArrow = (actionType) => {
      axios.get(window.protocol+"//" + window.videoUrl + "/api/v1/Ptz", {
        params: {
          token: props.token,
          action: actionType,
          speed: 0.4,
          session: props.token,
        },
      });
    };
    const setVedioStop = () => {
      axios.get(window.protocol+"//" + window.videoUrl + "/api/v1/Ptz", {
        params: {
          token: props.token,
          action: "stop",
          session: props.token,
        },
      });
    };
    const clickFull = () => {
      state.full = !state.full;
    };
    return {
      ...toRefs(state),
      playVideo,
      setVedioArrow,
      setVedioStop,
      clickFull,
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
    width: 100%;
    height: 100%;
    z-index: 2010;
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba(15, 16, 26, 0.7);
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
