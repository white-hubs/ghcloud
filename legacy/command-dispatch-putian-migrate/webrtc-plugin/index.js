function convertCallstate(state) {
  var stateStr;
  switch (state) {
    case 1:
      stateStr = "init";
      break;
    case 2:
      stateStr = "normal";
      break;
    case 3:
      stateStr = "callout";
      break;
    case 4:
      stateStr = "incoming";
      break;
    case 5:
      stateStr = "ringing";
      break;
    case 6:
      stateStr = "connected";
      break;
    case 7:
      stateStr = "terminal";
      break;
    case 8:
      stateStr = "hold";
      break;
    case 9:
      stateStr = "unhold";
      break;
    default:
      break;
  }
  return stateStr;
}
function onCallStateChange(param) {
  var state = convertCallstate(param.state);
}
class WebRtcCustom {
  #client; //客户端实例
  #callInstance; // 呼叫实例
  #incomingCall; // 监听到接受到呼叫的实例
  #mediaControl; //因接听需要控件所以需要初始化传入媒体控件
  constructor(config = {
    ip: '', //服务器ip
    port: '', //端口
    businessPort: '', //??
    userName: '',//用户名
    password: '',//密码
    userType: '', //账号类型
    resourceUrl: '',//?
    businessResourceUrl: '',//?
    mediaControl: '',//媒体控件
  }) {
    if (!config.mediaControl) {
      throw new Error('未传入媒体控件!')
    }
    this.#mediaControl = config.mediaControl
    this.getClientInit()
    this.registerUser(config)
  }
  // 获取客户端实例 开启客户端日志
  getClientInit() {
    this.#client = XYClient.DispatcherClient.getInstance();
    client.enableLog = true;
    this.listenStatusChange()
    this.listenIncomingCall()
  }
  // 监听状态改变
  listenStatusChange() {
    if (!this.#client) {
      throw new Error('未初始化客户端!')
    };

    this.#client.registStateChange.on((para) => {
      var state = para.state;
      var stateStr;
      switch (state) {
        case 1:
          stateStr = "registed";
          break;
        case 2:
          stateStr = "unregisted";
          break;
        case 3:
          stateStr = "connect error";
          break;
        case 4:
          stateStr = "password error";
          break;
        case 5:
          stateStr = "user not exist";
          break;
        case 6:
          stateStr = "server error";
          break;
        case 7:
          stateStr = "other error";
          break;
        case 8:
          stateStr = "repeat login";
          break;
        case 9:
          stateStr = "type error";
          break;
        case 10:
          stateStr = "被强制下线";
          break;
        default:
          break;
      }
    });
  }
  // 监听来电
  listenIncomingCall() {
    if (!this.#client) {
      throw new Error('未初始化客户端!')
    };
    client.incomingCall.on((para) => {
      this.#incomingCall = para.call;
    });
  }

  // 注册用户
  registerUser(config) {
    if (!this.#client) {
      throw new Error('未初始化客户端!')
    };
    this.#client.regist(config);
  }
  // 注销用户
  unRegistUser() {
    if (!this.#client) {
      throw new Error('未初始化客户端!')
    }
    this.#client.unRegist();
  }
  // 强制登录
  forceLogin() {
    this.#client.forceLogin().then((result) => {
    }).catch((reason) => {
    })
  }
  /**
   * 呼叫
   * @param {*} number // 号码 
   * @param {*} isVideo //是否为视频 
   * @param {*}  mediaControl 呼叫使用的媒体控件
   */
  makecall(number, mediaControl, isVideo) {
    client.makeCall(number, mediaControl, isVideo).then((call) => {
      this.#callInstance = call
      call.callStateChange.on(onCallStateChange);
      const state = convertCallstate(call.state);
    }
    ).catch((reason) => {
    });
  }
  // 音频接听
  answerAudio() {
    if (!this.#mediaControl) {
      throw new Error('未初始化媒体控件!')
    }
    this.#callInstance = this.#incomingCall
    this.#callInstance.answer(this.#mediaControl, false);
  }
  // 视频接听
  answerVideo() {
    if (!this.#mediaControl) {
      throw new Error('未初始化媒体控件!')
    }
    this.#callInstance = this.#incomingCall
    this.#callInstance.answer(this.#mediaControl, true);
  }
}