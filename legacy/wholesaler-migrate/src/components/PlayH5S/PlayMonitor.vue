<template>
  <div class="monitorPlay">
    <div class="monitorPlay_video" ref="video_box">
      <!-- <video src=""></video> -->
      <playVideo
        v-if="host && !isChanging"
        :token="token"
        :ip="host"
        :useSub="useSub"
      ></playVideo>
      <div
        class="monitorPlay_video_btns"
        :class="{ short: specification !== 'cameraModel_ball' }"
        v-if="showControl"
      >
        <img
          v-if="specification === 'cameraModel_ball'"
          @mousedown="contrl('left')"
          @mouseup="stop('left')"
          :src="require('./images/monitor_left.png')"
          alt="向左"
          title="向左"
        />
        <!-- <img
          v-else
          class="disabled"
          :src="require('./images/monitor_left.png')"
          alt="向左"
          title="向左"
        /> -->
        <img
          v-if="specification === 'cameraModel_ball'"
          @mousedown="contrl('down')"
          @mouseup="stop('left')"
          :src="require('./images/monitor_down.png')"
          alt="向下"
          title="向下"
        />
        <!-- <img
          v-else
          class="disabled"
          :src="require('./images/monitor_down.png')"
          alt="向下"
          title="向下"
        /> -->
        <img
          v-if="specification === 'cameraModel_ball'"
          @mousedown="contrl('up')"
          @mouseup="stop('left')"
          :src="require('./images/monitor_up.png')"
          alt="向上"
          title="向上"
        />
        <!-- <img
          v-else
          class="disabled"
          :src="require('./images/monitor_up.png')"
          alt="向上"
          title="向上"
        /> -->
        <img
          v-if="specification === 'cameraModel_ball'"
          @mousedown="contrl('right')"
          @mouseup="stop('left')"
          :src="require('./images/monitor_right.png')"
          alt="向右"
          title="向右"
        />
        <!-- <img
          v-else
          class="disabled"
          :src="require('./images/monitor_right.png')"
          alt="向右"
          title="向右"
        /> -->
        <img
          @mousedown="contrl('zoomin')"
          @mouseup="stop('left')"
          :src="require('./images/monitor_plus.png')"
          alt="拉近"
          title="拉近"
        />
        <img
          @mousedown="contrl('zoomout')"
          @mouseup="stop('left')"
          :src="require('./images/monitor_reduce.png')"
          alt="拉远"
          title="拉远"
        />
        <!-- <div>{{ specification }}</div> -->
        <!-- <img
          @mousedown="contrl('capture')"
          :src="require('./images/monitor_capture.png')"
          alt=""
        /> -->
      </div>
      <div
        class="full-screen"
        v-if="!isFullScreen"
        @click="fullScreen"
        title="全屏"
      >
        <app-icon-display name="fullscreen" />
      </div>
      <div
        class="full-screen full-screen-exit"
        v-else
        @click="exitFullScreen"
        title="退出全屏"
      >
        <app-icon-display name="fullscreen-exit" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import playVideo from '@/pages/JKPT/components/video';
export default {
  components: {
    playVideo,
  },
  props: {
    token: String,
    host: String,
    specification: String,
    showControl: {
      type: Boolean,
      default: true,
    },
    useSub: Boolean,
  },
  data() {
    return {
      isFullScreen: false,
      isChanging: false,
    };
  },
  watch: {
    host: 'handleChange',
    token: 'handleChange',
    specification: 'handleChange',
  },
  methods: {
    // 摄像头改变
    handleChange() {
      this.isChanging = true;
      this.$nextTick(() => {
        this.isChanging = false;
      });
    },
    // 关闭
    close() {
      this.$emit('close');
    },
    // 控制
    contrl(item) {
      axios.get(window.location.protocol + '//' + this.host + '/api/v1/Ptz', {
        params: {
          token: this.token,
          action: item,
          speed: 0.4,
        },
      });
    },
    // 停止
    stop() {
      axios.get(window.location.protocol + '//' + this.host + '/api/v1/Ptz', {
        params: {
          token: this.token,
          action: 'stop',
        },
      });
    },
    // 全屏
    fullScreen() {
      const element = this.$refs.video_box;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullScreen();
      }
      this.isFullScreen = true;
    },
    // 退出全屏
    exitFullScreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      this.isFullScreen = false;
    },
  },
};
</script>
<style lang="less" scoped>
.monitorPlay {
  min-width: 100px;
  min-height: 65px;
  width: 100%;
  height: 100%;
  background-color: #000000;

  .monitorPlay_video {
    width: 100%;
    height: 100%;
    position: relative;

    > video {
      width: 100%;
      height: 100%;
    }

    .monitorPlay_video_btns {
      width: 210px;
      height: 30px;
      background: rgba(16, 16, 26, 0.8);
      position: absolute;
      bottom: 20px;
      left: calc(50% - 105px);
      display: flex;
      align-items: center;
      justify-content: space-around;
      &.short {
        width: 70px;
        left: calc(50% - 35px);
      }
      > img {
        width: 20px;
        height: 20px;
        cursor: pointer;
        &.disabled {
          filter: grayscale(100%);
          cursor: not-allowed;
        }
      }
    }
  }
}
.full-screen {
  position: absolute;
  top: 0;
  right: 0;
  padding: 6px 12px;
  background: rgba(16, 16, 26, 0.8);
  color: #fff;
  cursor: pointer;
}
</style>
