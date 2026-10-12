<template lang="pug">
div.video_ctr
  video(:id="videoId")
</template>
<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  onUnmounted,
  onMounted,
  reactive,
  nextTick,
  toRefs,
  watch,
  ref,
} from "vue";
import { H5sPlayerWS } from "@/utils/h5splayer/h5splayer";
export default defineComponent({
  props: {
    videoId: {
      type: String,
      default: "video",
    },
    cameraItem: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  setup(props) {
    const { proxy } = getCurrentInstance();

    const state = reactive({
      player: null,
    });

    const playVideo = () => {
      const conf = {
        hlsver: "v1",
        host: props.cameraItem.ServerIp,
        // protocol: "http:",
        protocol: `${props.cameraItem.ServerAgree}:`,
        rootpath: "/",
        session: "",
        streamprofile: "sub",
        profile: "sub",
        token: props.cameraItem.Token,
        sub: props.cameraItem.Token,
        videoid: props.videoId,
      };
      nextTick(() => {
        state.player = new H5sPlayerWS(conf);
        state.player.connect();
      });
    };

    onMounted(() => {
      // let time = new Date().getTime();
      // state.videoId = `video${props.token}${time}`;
      playVideo();
    });

    onUnmounted(() => {
      state.player.disconnect(); //停止播放
      state.player = null;
    });

    watch(
      () => props.cameraItem,
      () => {
        state.player.disconnect();
        state.player = null;
        playVideo();
      }
    );

    return {
      ...toRefs(state),
    };
  },
});
</script>
<style lang="less" scoped>
.video_ctr {
  width: 100%;
  height: 100%;
  display: inline-block;
  position: relative;
  video {
    width: 100%;
    height: 100%;
    cursor: pointer;
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
