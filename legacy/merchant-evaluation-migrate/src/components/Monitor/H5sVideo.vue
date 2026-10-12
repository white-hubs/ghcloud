<template>
  <div class="h5s_container">
    <video ref="h5splayer" src autoplay webkit-playsinline playsinline>
      <slot />
    </video>
    <!--
      monitor 数据格式?
      // {
      //   AreaId: 339
      //   AreaName: null
      //   CameraStrName: "-1F监控室左"
      //   CameraToken: 1006
      //   CameraType: "半球"
      //   DeviceId: 0
      //   Id: 836
      //   Online: false
      //   ServerIP: "192.168.0.203"
      //   ServerPort: "9999"
      //   StrPasswd: "scjr12345"
      //   StrSrcIpAddress: "172.16.112.10"
      //   StrSrcPort: "80"
      //   StrUser: "admin"
      //   StreamId: 1
      //   SysCode: "9154d3bfc96245c5b6022cedf71b65e1"
      //   key: 836
      //   label: "-1F监控室左"
      // }
     -->
    <!-- 根据 CameraType 判断是否显示控制栏? -->
    <div class="monitor_control" @click.stop>
      <div class="control_item" @click="makeMonitor('up')">
        <a-tooltip class="item" effect="dark" title="上移" placement="top">
          <a-icon type="up"/>
        </a-tooltip>
      </div>
      <div class="control_item" @click="makeMonitor('right')">
        <a-tooltip class="item" effect="dark" title="右移" placement="top">
          <a-icon type="right"/>
        </a-tooltip>
      </div>
      <div class="control_item" @click="makeMonitor('down')">
        <a-tooltip class="item" effect="dark" title="下移" placement="top">
          <a-icon type="down"/>
        </a-tooltip>
      </div>
      <div class="control_item" @click="makeMonitor('left')">
        <a-tooltip class="item" effect="dark" title="左移" placement="top">
          <a-icon type="left"/>
        </a-tooltip>
      </div>
      <div class="control_item" @click="makeMonitor('zoomin')">
        <a-tooltip class="item" effect="dark" title="放大" placement="top">
          <a-icon type="plus"/>
        </a-tooltip>
      </div>
      <div class="control_item" @click="makeMonitor('zoomout')">
        <a-tooltip class="item" effect="dark" title="缩小" placement="top">
          <a-icon type="minus"/>
        </a-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import './utils/h5splayer/h5splayer'
import { H5sPlayerCreate } from './utils/h5splayer/h5splayerhelper'
import adapter from './utils/h5splayer/configAdapter'
// import execPTZCommand from '@/a'; // 不需要导入, 自动注册了已经 this.$api.execPTZCommand
export default {
  name: 'H5sVideo',
  props: {
    monitor: {
      type: Object,
      default: () => {
        return {}
      }
    },
    order: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      H5sVideo: null,
      monitorActions: [
        { type: 'up', desc: '上移', icon: 'a-icon-arrow-up' },
        { type: 'right', desc: '右移', icon: 'a-icon-arrow-right' },
        { type: 'down', desc: '下移', icon: 'a-icon-arrow-down' },
        { type: 'left', desc: '左移', icon: 'a-icon-arrow-left' },
        { type: 'plus', desc: '放大', icon: 'a-icon-plus' },
        { type: 'minus', desc: '缩小', icon: 'a-icon-minus' }
      ],
      config: null
    }
  },
  watch: {
    monitor(nVal, oVal) {
      if (nVal && nVal !== oVal) {
        if (this.H5sVideo) {
          this.H5sVideo.disconnect()
          this.H5sVideo = null
        }
        this.init()
      }
    }
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    if (this.H5sVideo) {
      this.H5sVideo.disconnect()
      this.H5sVideo = null
    }
  },
  methods: {
    init() {
      const token = this.monitor.strToken || this.monitor.h5Token
      // const token = 1001 + this.order;
      // adapter()
      // const config = adapter(this.monitor); // 根据监控构造config
      this.config = adapter() // 返回默认的 demo 视频
      this.config.videodom = this.$refs.h5splayer
      this.config.token = token
      // 设置后台地址端口
      // this.config.host = `${this.monitor.ipAddr}:${this.monitor.port}`;
      this.$nextTick(() => {
        this.H5sVideo = H5sPlayerCreate(this.config)
        this.H5sVideo.connect()
        const oFun = this.H5sVideo.wsSocket.onmessage
        this.H5sVideo.wsSocket.onmessage = (data) => {
          oFun(data)
          // 判断video标签已经移除, TODO: 等待更好的判断办法
          if (!this.$refs.h5splayer || !this.$refs.h5splayer.clientHeight) {
            if (this.H5sVideo) {
              this.H5sVideo.disconnect()
              this.H5sVideo = null
            }
          }
        }
      })
    },
    makeMonitor(action) {
      // GET {{H5_HOST}}/api/v1/Ptz?token=1005&action=stop&speed=0.5&session={{h5_session}}
      // PTZ command up/down/left/right/zoomin/zoomout/stop/preset (Must have)
      const {
        protocol,
        host,
        token,
        session
      } = this.config
      const speed = 0.5
      const hosts = `${protocol}//${host}`
      const params = {
        token,
        session,
        action,
        speed
      }
      this.$api.execPTZCommand(hosts, params)
      // 紧接着 停止动作
      setTimeout(() => {
        this.$api.execPTZCommand(hosts, {
          token,
          session,
          action: 'stop'
        })
      }, 200)
      // this.$nextTick(() => {
      //   this.$api.execPTZCommand(hosts, {
      //     token,
      //     session,
      //     action: 'stop',
      //   });
      // })
    }
  }
}
</script>

<style lang="less" scoped>
.h5s_container {
  height: 100%;
  width: 100%;
  position: relative;
  video{
    height: 100%;
    width: 100%;
    // object-fit: fill;
    object-fit: contain;
  }
  .monitor_control{
    position: absolute;
    bottom: 5px;
    right: 5px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    .control_item{
      width: 24px;
      height: 24px;
      color: #FFFFFF;
      font-size: 14px;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 5px;
      cursor: pointer;
    }
  }
}
</style>
