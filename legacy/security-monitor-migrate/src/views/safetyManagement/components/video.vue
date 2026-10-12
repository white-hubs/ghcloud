<template>
  <div class="videoComCtr">
    <video :id="videoId" muted></video>
  </div>
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
  computed,
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
    const serveIp = window.location.protocol;
    const state = reactive({
      player: null,
    });
    const playVideo = () => {
      if (
        (serveIp === "http:" && props.cameraItem?.steamMediaIntranetAddress) ||
        (serveIp === "https:" && props.cameraItem?.steamMediaIpAddress)
      ) {
        const conf = {
          hlsver: "v1",
          host: "",
          protocol: serveIp,
          rootpath: "/",
          session: window.videoSession,
          streamprofile: "sub",
          profile: "sub",
          token: props.cameraItem.token,
          sub: props.cameraItem.token,
          videoid: props.videoId,
          consolelog: "false",
        };
        if (serveIp === "http:") {
          conf.host = props.cameraItem.steamMediaIntranetAddress.split("//")[1];
        } else {
          conf.host = props.cameraItem.steamMediaIpAddress.split("//")[1];
        }
        nextTick(() => {
          state.player = new H5sPlayerWS(conf);
          state.player.connect();
        });
      }
    };
    onMounted(async () => {
      // await getVideoPtzSession()
      playVideo();
    });
    // const getVideoPtzSession = async() =>{
    //   const session = await proxy.$api.getVideoPtzSession();
    //   if(session){
    //     window.videoSession = session;
    //   }
    // }
    onUnmounted(() => {
      try {
        state.player.disconnect(); //停止播放
      } catch (error) {
        
      }finally{
        state.player = null;
      }
    });
    const getSession = () => {
      if (!window.videoSession) {
        proxy.$api.getVideoPtzSession().then(res => {
          window.videoSession = res.session;
          playVideo();
        });
      } else {
        playVideo();
      }
    };
    watch(
      () => props.cameraItem,
      () => {
        if(state.player){
           state.player.disconnect();
        }
        state.player = null;
        getSession();
      },
    );

    return {
      ...toRefs(state),
    };
  },
});
</script>
<style lang="less" scoped>
.videoComCtr {
  width: 100%;
  height: 100%;
  display: inline-block;
  position: relative;
  video {
    width: 100%;
    height: 100%;
    object-fit: inherit;
    cursor: pointer;
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
