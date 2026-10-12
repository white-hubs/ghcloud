<template>
  <div class="h5s_container" :class="full ? 'full' : ''">
    <video :id="'PlayBackVideo' + token" />
    <div class="slider_block">
      <a-slider
        v-model="timelink"
        :max="max"
        :show-tooltip="false"
        @afterChange="timelinn(timelink)"
      />
    </div>
    <!-- <a-button :icon="icon" @click="resume()"></a-button> -->
    <!-- <i style="font-size: 30px; margin: 0 20px;" :class="icon" @click="resume()" class="strart"></i> -->
    <!-- 倍速 -->
    <!-- <el-select v-model="region" size="mini" style="width:70px" @change="Speed()">
        <el-option label="0.5" value="0.5"></el-option>
        <el-option label="1.0" value="1.0"></el-option>
        <el-option label="2.0" value="2.0"></el-option>
        <el-option label="4.0" value="4.0"></el-option>
        <el-option label="8.0" value="8.0"></el-option>
        <el-option label="16.0" value="16.0"></el-option>
    </el-select> -->
    <!-- 实时时间 -->
    <!-- <span>{{ displayc }}</span> -->
    <div v-if="showControl" class="h5s_container_control">
      <div
        @mouseup.stop="setVedioStop()"
        @mousedown.stop="setVedioArrow('left')"
      >
        <img :src="require('./images/monitor_left.png')" alt="" />
      </div>
      <div
        @mouseup.stop="setVedioStop()"
        @mousedown.stop="setVedioArrow('down')"
      >
        <img :src="require('./images/monitor_down.png')" alt="" />
      </div>
      <div @mouseup.stop="setVedioStop()" @mousedown.stop="setVedioArrow('up')">
        <img :src="require('./images/monitor_up.png')" alt="" />
      </div>
      <div
        @mouseup.stop="setVedioStop()"
        @mousedown.stop="setVedioArrow('right')"
      >
        <img :src="require('./images/monitor_right.png')" alt="" />
      </div>
      <div
        @mouseup.stop="setVedioStop()"
        @mousedown.stop="setVedioArrow('zoomin')"
      >
        <img :src="require('./images/monitor_plus.png')" alt="" />
      </div>
      <div
        @mouseup.stop="setVedioStop()"
        @mousedown.stop="setVedioArrow('zoomout')"
      >
        <img :src="require('./images/monitor_reduce.png')" alt="" />
      </div>
      <div @click="clickFull">
        <img :src="require('./images/monitor_capture.png')" alt="" />
      </div>
      <!-- <div @mousedown.stop="setVedioArrow('left')"><img :src="$icons.video_cut" alt=""></div> -->
    </div>
  </div>
</template>

<script>
import { H5sPlayerWS } from './h5splayer.js';
export default {
  name: 'PlayBackVideo',
  props: {
    token: String,
    host: String,
    begintime: {
      type: String,
      default: () => {
        return 0;
        // return new Date().getTime();
      },
    },
    endtime: {
      type: String,
      default: () => {
        return 0;
        // return new Date().getTime() + 10000;
      },
    },
    showControl: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    fileName: String,
  },
  data() {
    return {
      player: null,
      full: false,
      timelink: 0, // 滑块
      max: 0, // 滑块最大值
      value: [new Date(new Date().getTime() - 3600 * 1000 * 1), new Date()],
      // 分页
      currentPage: 1, // 当前页码
      total: 0, // 总条数
      pageSize: 10, // 一页数量
      search: '',
      filterText: '',
      data: [],
      defaultProps: {
        children: 'children',
        label: 'label',
        token: 'token',
        iconclass: 'iconclass',
      },
      tableData1: [],
      region: 1.0, // 倍速
      icon: 'pause', // 暂停图片
      displayc: '', // 实时时间
      rowstarf: '', // 跟进进度条开始时间
      rowend: '', // 进度条结束时间
    };
  },
  watch: {
    host: 'refresh',
    token: 'refresh',
    specification: 'refresh',
  },
  mounted() {
    this.playVideo();
  },
  destroyed() {
    if (this.player) {
      this.player.disconnect();
      this.player = null;
    }
  },
  methods: {
    // refresh
    refresh() {
      if (this.player) {
        this.player.disconnect();
        this.player = null;
      }
      this.$nextTick(() => {
        this.playVideo();
      });
    },
    PlaybackCB(event, userdata) {
      var msgevent = JSON.parse(event);
      if (msgevent.type === 'H5S_EVENT_PB_TIME') {
        this.displayc = msgevent.pbTime.strTime;
        var starf = new Date(this.rowstarf).getTime() / 1000;
        var endd = new Date(msgevent.pbTime.strTime).getTime() / 1000;
        var staefend = endd - starf;
        this.timelink = staefend;
        if (this.timelink >= this.max) {
          // this.$nextTick(() => {
          //   this.player.seek(1);
          //   this.player.resume();
          // });
        }
      } else if (msgevent.type === 'H5S_EVENT_PB_SESSION_ID') {
        this.player.start();
      }
    },
    playVideo() {
      this.rowstarf = this.begintime;
      var pbconf1 = {
        begintime: this.begintime,
        endtime: this.endtime,
        showposter: 'true', // 'true' or 'false' show poster
        callback: this.PlaybackCB,
        serverpb: 'false', //'true' or 'false' playback from h5stream record, default false
        userdata: this, // user data
        fileName: this.fileName,
      };
      const conf = {
        hlsver: 'v1',
        host: this.host, //'192.168.0.211:8080',
        protocol: window.location.protocol,
        rootpath: '/',
        session: '',
        streamprofile: 'main', // main 主码流
        token: this.token, // '192.168.0.13--36', //this.token,
        sub: this.token,
        videoid: 'PlayBackVideo' + this.token,
        pbconf: pbconf1,
      };
      var end = new Date(this.endtime).getTime();
      var starf = new Date(this.begintime).getTime();
      var starfend = (end - starf) / 1000; // 时间差
      this.max = starfend;
      this.player = new H5sPlayerWS(conf);
      this.player.connect();
      // setTimeout(
      //   function () {
      //     this.player.start();
      //   }.bind(this),
      //   5000,
      // );
    },
    // 开始
    resume() {
      var strart = this.icon;
      if (strart === 'pause') {
        this.icon = 'play-circle';
        this.player.pause();
      }
      if (strart === 'play-circle') {
        this.icon = 'pause';
        this.player.resume();
      }
    },
    //
    timelinn(timelink) {
      this.player.seek(timelink);
      // this.player.pause();
      setTimeout(() => {
        this.player.resume();
      }, 200);
    },

    // 倍速
    Speed() {
      this.player.speed(this.region);
    },
    setVedioArrow(actionType) {
      this.$axios.get(
        window.location.protocol + '//' + this.host + '/api/v1/Ptz',
        {
          params: {
            token: this.token,
            action: actionType,
            speed: 0.4,
            session: this.token,
          },
        },
      );
      //     dataType: "json"
    },
    setVedioStop() {
      this.$axios.get(
        window.location.protocol + '//' + this.host + '/api/v1/Ptz',
        {
          params: {
            token: this.token,
            action: 'stop',
            session: this.token,
          },
        },
      );
    },
    // 点击全屏
    clickFull() {
      this.full = !this.full;
    },
  },
};
</script>

<style lang="less" scoped>
.h5s_container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #000000;

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
      cursor: pointer;
      color: rgba(41, 137, 255, 1);

      > img {
        width: 100%;
        height: 100%;
      }
    }
  }
  .slider_block {
    position: absolute;
    bottom: -15px;
    left: 0;
    width: 100%;
  }
}
</style>
