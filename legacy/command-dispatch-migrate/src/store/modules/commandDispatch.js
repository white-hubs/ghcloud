import _ from "lodash";
import { getStreamMediaConfig, getVideoPtzSession } from '../../api/mdata'
export default {
  namespaced: true,
  state: {
    commandDispatch: {
      verifyResult: false, //设备链接状态
      loginResult: false, //登录状态
    },
    webrtcInstance: null,
    conferenceMembers: [],
    incomingMeeting: false,
    localUser: {
      name: '指挥调度中心',
      number: '2001'
    },
    streamConfig: {
      videoAccessMode: 'H5S',
      protocol: '',
      videoUrl: '',
      videoSession: ''
    },
    hasConfig: true,
    meetingTitle: '',
    taskModalList: new Map(),
    mapConfig: {
      lnglat: [116.397428, 39.90923],
      zoom: 10,
      rotation: 0,
      radius: 100,
    }
  },
  mutations: {
    // 
    SET_TASK_MODAL_LIST: (state, value) => {
      state.taskModalList.set(value.key, value.value);
    },
    SET_commandDispatch: (state, value) => {
      state.commandDispatch = _.cloneDeep(value);
    },
    // 设置webrtc实例
    SET_WEBRTC_INSTANCE: (state, value) => {
      state.webrtcInstance = value;
    },
    // 设置会议成员
    SET_CONFERENCE_MEMBERS: (state, value) => {
      state.conferenceMembers = value;
    },
    // 设置会议名称
    SET_MEETING_TITLE: (state, value) => {
      state.meetingTitle = value;
    },
    // 本地用户设置
    SET_LOCALUSER: (state, value) => {
      state.localUser = value;
    },
    // 设置是否配置通讯能力
    SET_HAS_CONFIG: (state, value) => {
      state.hasConfig = value;
    },
    // 设置地图配置
    SET_MAP_CONFIG: (state, value) => {
      state.mapConfig = value;
    },
    // 设置流媒体基础数据
    SET_STREAM_BASE_DATA: (state, value) => {
      getStreamMediaConfig().then((mediaConfig) => {
        const protocol = window.location.protocol
        const address = mediaConfig.ipAddress
        state.streamConfig.protocol = address ? address.split('//')[0] : protocol
        state.streamConfig.videoUrl = address ? address.split('//')[1] : ''
      })
      getVideoPtzSession().then(res => {
        state.streamConfig.videoSession = res.session
      })
      fetch(`${window.origin}/config.js`, { method: 'GET' })
        .then(async response => response.text())
        .then(code => {
          // 创建一个新的script元素
          const script = document.createElement('script')
          // 设置script的内容为获取到的代码
          script.textContent = code
          // 将script元素添加到body中
          document.body.appendChild(script)
          if (window.config?.feature && window.config.feature?.videoAccessMode === 'HK') {
            state.streamConfig.videoAccessMode = 'HK'
          }
        })
        .catch(error => {

        })
    }
  },
};
