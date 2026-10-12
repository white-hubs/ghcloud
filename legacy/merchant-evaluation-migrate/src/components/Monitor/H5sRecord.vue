<template>
  <div class="jkpt_video">
    <video :id="videoid" />
  </div>
</template>

<script>
import { H5sPlayerWS } from '../PlayH5S/h5splayer.js';
export default {
  name: 'H5video',
  props: {
    ip: {
      type: String,
      default: () => {
        return '';
      },
    },
    token: {
      type: String,
      default: () => {
        return '';
      },
    },
    fileName: String,
  },
  data() {
    return {
      player: null,
      videoid: null,
    };
  },
  created() {
    let time = new Date().getTime();
    this.videoid = 'video' + this.token + time;
  },
  mounted() {
    if (this.ip) {
      this.playVideo();
    }
  },
  destroyed() {
    if (this.player) {
      this.player.disconnect();
      this.player = null;
    }
  },
  methods: {
    playVideo() {
      const pbconf1 = {
        filename: this.fileName,
        begintime: '0',
        endtime: '0',
        showposter: 'true', // 'true' or 'false' show poster
        // callback: this.PlaybackCB,
        serverpb: 'true',
        // userdata: this // user data,
      };
      const conf = {
        hlsver: 'v1',
        host: this.ip,
        protocol: window.location.protocol,
        rootpath: '/',
        session: '',
        streamprofile: 'main',
        token: this.token,
        videoid: this.videoid,
        pbconf: pbconf1,
        consolelog: 'false',
      };
      this.$nextTick(() => {
        this.player = new H5sPlayerWS(conf);
        this.player.connect();
        setTimeout(() => {
          this.player.start();
        }, 500);
      });
    },
  },
};
</script>

<style lang="less" scoped>
.jkpt_video {
  width: 100%;
  height: 100%;

  video {
    width: 100%;
    height: 100%;
  }
}
</style>
