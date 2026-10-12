// import { useStore } from 'vuex'
import { getSysUserByFusionAccount } from "../src/api/communicate";
import store from "../src/store";
import { showToast } from "../src/views/traffic/commandDispatch/components/toast";

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
export const dispatchConfig = {
  account: "2001",
  serverIp: "cube-test.guhecloud.com",
  port: "30000",
  businesPort: "30000",
  resourceUrl: "softswitch",
  password: "abc123456!",
  userType: "2",
  businessResourceUrl: "dispatch",
};
// 单例模式封装
export const singleton = (className) => {
  let ins = null;
  const proxy = new Proxy(className, {
    construct(target, args) {
      if (!ins) {
        ins = Reflect.construct(target, args);
      }
      return ins;
    },
  });
  className.prototype.constructor = proxy;
  return proxy;
};
export class CustomWebrtc {
  client; //客户端实例
  callInstance; // 呼叫实例
  intercomInstance;
  incomingCall; // 监听到接受到呼叫的实例
  mediaControl; //因接听需要控件所以需要初始化传入媒体控件
  events; //保存事件名称
  conference; //会议实例
  incomingConference; //接收会议实例
  buffer = [];
  mediaRecorder;
  constructor(
    config = {
      ip: "", //服务器ip
      port: "", //端口
      businesPort: "", //??
      userName: "", //用户名
      password: "", //密码
      userType: "", //账号类型
      resourceUrl: "", //?
      businessResourceUrl: "", //?
    },
    mediaControl,
  ) {
    if (!mediaControl) {
      throw new Error("未传入媒体控件!");
    }
    this.mediaControl = mediaControl;
    this.events = {};
    this.getClientInit();
    this.registerUser(config);
  }
  // 获取客户端实例 开启客户端日志
  getClientInit() {
    this.client = XYClient.DispatcherClient.getInstance();
    this.client.enableLog = true;
    this.unRegistUser();
    this.listenStatusChange();
    this.listenIncomingCall();
    this.linsterIncomingConference();
    this.listenInterCom();
  }
  // 监听状态改变
  listenStatusChange() {
    if (!this.client) {
      throw new Error("未初始化客户端!");
    }

    this.client.registStateChange.on((para) => {
      var state = para.state;
      var stateStr;
      switch (state) {
        case 1:
          stateStr = "登录成功";
          break;
        case 2:
          stateStr = "退出登录";
          break;
        case 3:
          stateStr = "连接错误";
          break;
        case 4:
          stateStr = "密码错误或服务未授权";
          break;
        case 5:
          stateStr = "用户不存在";
          break;
        case 6:
          stateStr = "服务错误";
          break;
        case 7:
          stateStr = "其他错误";
          break;
        case 8:
          stateStr = "重复登录";
          break;
        case 9:
          stateStr = "类型错误";
          break;
        case 10:
          stateStr = "被强制下线";
          break;
        default:
          break;
      }
      if (state === 8) {
        this.forceLogin();
        return;
      }
      if (state !== 1) {
        showToast(stateStr);
      }
    });
    this.client.userCallStateChange.on((para) => {
      console.log("用户状态改变", para);
    });
  }
  // 监听来电
  listenIncomingCall() {
    if (!this.client) {
      throw new Error("未初始化客户端!");
    }
    this.client.incomingCall.on(async (params) => {
      console.log("来电", params);
      const { call } = params;
      this.incomingCall = call;
      this.callInstance = call;
      const result = await getSysUserByFusionAccount(call.number);
      const callInfoVo = {
        number: call.number,
        isVideo: call.isVideo,
        mobile: result.mobile,
        file: result.file,
        name: result.name,
        organizationName: result.organization ? result.organization.name : "--",
        positionName:
          Array.isArray(result.positions) && result.positions.length ? result.positions.map((item) => item.name).join(",") : "--",
      };
      this.setCallLinster();
      // 订阅接收来电
      this.addListener("incomingCall", callInfoVo);
    });
  }
  // 监听对讲
  listenInterCom() {
    this.client.receiveIntercomInvite.on((para) => {
      this.intercomInstance = para.intercom;
      this.setLinsterInterCom();
      this.acceptIntercom();
    });
  }
  // 退出
  exitClient() {
    this.intercomInstance && this.intercomInstance.exit();
    this.intercomInstance && this.intercomInstance.end();
    this.incomingCall && this.incomingCall.hangup();
    this.incomingConference && this.incomingConference.end();
    this.conference && this.conference.end();
    this.conference = null;
    this.incomingConference = null;
    this.incomingCall = null;
    this.intercomInstance = null;
    this.unRegistUser();
  }
  // 监听会议
  linsterIncomingConference() {
    this.client.receiveConferenceInvite.on(async (params) => {
      this.incomingConference = params.conference;
      this.conference = params.conference;
      const members = await this.incomingConference.getMembers();
      this.addListener("incomingConference", {
        ...params,
        members,
      });
      this.setIncomingLinsterConferenceChange();
    });
  }
  /**
   *
   * @param {*} mediaControl 媒体控件
   * @param {*} isVideo 是否视频
   */
  incomingConferenceAccept(mediaControl, isVideo) {
    this.incomingConference && this.incomingConference.accept(mediaControl, isVideo);
  }
  /**
   * 拒绝加入会议
   */
  rejectJoinConference() {
    this.incomingConference && this.incomingConference.exit();
  }
  /**
   * 结束接收的会议
   */
  incomingConferenceEnd() {
    this.incomingConference && this.incomingConference.end();
  }
  // 设置对讲监听
  setLinsterInterCom() {
    this.intercomInstance.memberStateChange.on((para) => {
      var stateStr;
      switch (para.state) {
        case 0:
          stateStr = "enter";
          break;

        case 1:
          stateStr = "leave";
          break;

        default:
          break;
      }
      console.log(`成员状态改变:${para.member}`, para);
    });
    this.intercomInstance.stateChange.on((para) => {
      var stateStr;
      switch (para.state) {
        case 1:
          stateStr = "connecting";
          break;

        case 2:
          stateStr = "Connected";
          break;

        // case 3:
        //     stateStr = "Kickout";
        //     break;

        case 3:
          stateStr = "Terminaled";
          break;

        default:
          break;
      }
      console.log(`对讲状态改变:${stateStr}`, para);
    });
    this.intercomInstance.speakerChanged.on((para) => {
      this.addListener("changeSpeaker", para);
      console.log("对讲人改变", para);
    });
  }
  // 设置通话监听
  setCallLinster() {
    // 来电状态
    if (this.incomingCall) {
      this.incomingCall.callStateChange.on((para) => {
        // 接听
        if (para.state === 6) {
          this.addListener("answered", para.sender);
        } else if (para.state === 7) {
          this.addListener("overCalled", para.sender);
          this.hangupCall();
        }
        console.log("通话来电状态改变", para);
      });
    }
    // 通话状态
    if (this.callInstance) {
      this.callInstance.callStateChange.on((para) => {
        if (para.state === 6) {
          this.addListener("answered", para.sender);
        } else if (para.state === 7) {
          this.addListener("overCalled", para.sender);
          this.hangupCall();
        }
      });
      this.callInstance.onBecomeConference.on((para) => {
        this.conference = para.changeToConference;
      });
    }
  }
  /**
   *
   * @param {*} members 成员
   */
  callingInvite(members = []) {
    for (const member of members) {
      this.callInstance.addMember(member);
    }
  }
  // 监听订阅执行
  on(eventName, callback) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(callback);
  }
  // 添加监听事件
  addListener(eventName, data) {
    const events = this.events[eventName] || [];
    events.forEach((callback) => {
      callback(data);
    });
  }
  off(eventName, callback) {
    //停止监听event事件
    let callbacks = this._events[eventName];
    this.events[eventName] = callbacks && callbacks.filter((fn) => fn !== callback);
  }
  once(eventName, callback) {
    //为事件注册单次监听器
    let wrapFunc = (...args) => {
      callback.apply(...args);
      this.off(eventName, wrapFunc);
    };
    this.on(eventName, wrapFunc);
  }
  // 注册用户
  registerUser(config) {
    if (!this.client) {
      throw new Error("未初始化客户端!");
    }
    this.client.regist(config);
  }
  // 注销用户
  unRegistUser() {
    if (!this.client) {
      throw new Error("未初始化客户端!");
    }
    this.client.unRegist();
  }
  // 强制登录
  forceLogin() {
    this.client
      .forceLogin()
      .then((result) => {
        console.log("强制登录者成功", result);
      })
      .catch((reason) => {
        console.error("强制登录者成功", reason);
      });
  }
  // 开始连接对讲组
  async startIntercomGroup(groupNumber, mediaControl) {
    if (!this.client) {
      throw new Error("未初始化客户端!");
    }
    this.mediaControl = mediaControl;
    try {
      if (!this.intercomInstance) {
        const conf = await this.client.startIntercom(groupNumber, mediaControl);
        this.intercomInstance = conf;
        this.setLinsterInterCom();
        return;
      }
      this.intercomInstance.applySpeak();
    } catch (error) {
      console.error(error, "对讲发起失败");
    }
  }
  // 接收对话
  acceptIntercom() {
    this.intercomInstance.accept(this.mediaControl);
  }
  // 退出对讲
  exitIntercom() {
    this.intercomInstance && this.intercomInstance.exit();
  }

  // 释放对讲
  async releaseIntercom() {
    await this.intercomInstance.freeSpeak();
  }
  /**
   * 呼叫
   * @param {*} targetNumber // 号码
   * @param {*} isVideo //是否为视频
   * @param {*}  mediaControl 呼叫使用的媒体控件 dom
   */
  makeCall(targetNumber, mediaControl, isVideo) {
    this.mediaControl = mediaControl;
    this.client
      .makeCall(targetNumber, mediaControl, isVideo)
      .then((call) => {
        this.callInstance = call;
        this.setCallLinster();
        const state = convertCallstate(call.state);
        console.log(state);
      })
      .catch(({ reason, call }) => {
        this.callInstance = call;
        this.setCallLinster();
      });
  }
  // 音频接听
  answerAudio() {
    if (!this.mediaControl) {
      throw new Error("未初始化媒体控件!");
    }
    this.callInstance = this.incomingCall;
    this.callInstance.answer(this.mediaControl, false);
  }
  // 视频接听
  answerVideo() {
    if (!this.mediaControl) {
      throw new Error("未初始化媒体控件!");
    }
    this.callInstance = this.incomingCall;
    this.callInstance.answer(this.mediaControl, true);
  }
  // 挂断
  hangupCall() {
    this.callInstance && this.callInstance.hangup();
    this.incomingCall && this.incomingCall.hangup();
    this.incomingCall = null;
    this.callInstance = null;
  }
  // 释放话权
  async releaseSpeak() {
    try {
      this.intercomInstance && (await this.intercomInstance.freeSpeak());
    } catch (error) {
      console.error(error);
    }
  }
  // 结束对讲
  async endIntercom() {
    try {
      this.intercomInstance && (await this.intercomInstance.exit());
      this.intercomInstance && (await this.intercomInstance.end());
      this.intercomInstance = null;
    } catch (error) {
      console.error(error);
    }
  }
  // 保持
  async holdCall() {
    try {
      await this.callInstance.hold();
    } catch (error) {
      console.error(error);
    }
  }
  // 取消保持
  async unHoldCall() {
    try {
      await this.callInstance.unhold();
    } catch (error) {
      console.error(error);
    }
  }
  // 开始录音
  startAudioRecord() {
    if (!this.mediaControl) {
      throw new Error("未初始化媒体控件!");
    }
    this.buffer = [];
    const recordSteam = new MediaStream();
    recordSteam.addTrack(this.mediaControl.srcObject.getAudioTracks()[0]);
    const options = {
      audio: true,
    };
    this.mediaRecorder = new MediaRecorder(recordSteam, options);
    this.mediaRecorder.ondataavailable = (e) => this.handleDataAvailable.call(this, e);
    this.mediaRecorder.start(10);
  }
  // 结束录音
  endAudioRecord() {
    this.mediaRecorder.stop();
    const blob = new Blob(this.buffer, {
      type: "audio/webm",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "录音.webm";
    a.click();
  }
  // 处理录音数据
  handleDataAvailable(e) {
    this.buffer.push(e.data);
  }
  // 转接
  async transferCall(targetNumber) {
    if (!this.callInstance) {
      throw new Error("当前没有通话不可转接!");
    }
    try {
      this.callInstance.switch(targetNumber);
    } catch (error) {
      console.error("转接失败!");
    }
  }
  /**
   * 发起会议
   * @param {*} members 成员字符串,隔开
   * @param {*} conferenceControl 本地会议主持人的video dom
   * @param {*} roomId 房间id
   * @param {*} isVideo 是否为视频
   */
  async startConference(members, conferenceControl, roomId, isVideo) {
    try {
      const conf = await this.client.startConference(members, conferenceControl, roomId, isVideo);
      console.log("开始了会议", `会议成员${members}`);
      this.conference = conf;
      this.setLinsterConferenceChange();
    } catch (error) {
      console.error(error);
    }
  }
  // 监听本地发起的会议状态及成员改变
  setLinsterConferenceChange() {
    if (!this.conference) {
      throw new Error("会议未启动!");
    }
    this.conference.stateChange.on((para) => {
      var stateStr;
      switch (para.state) {
        case 1:
          stateStr = "connecting";
          break;

        case 2:
          stateStr = "Connected";

          break;

        case 3:
          stateStr = "Kickout";
          break;

        case 4:
          stateStr = "Terminaled";
          break;

        case 5:
          stateStr = "Leave";
          break;

        default:
          break;
      }
      if (para.state === 4) {
        //会议结束
        store.commit("commandDispatch/SET_CONFERENCE_MEMBERS", []);
      }
    });
    this.conference.memberStateChange.on(async (para) => {
      var stateStr;
      switch (para.state) {
        case 0:
          stateStr = "enter";
          break;
        case 1:
          stateStr = "leave";
          break;
        case 2:
          stateStr = "speak";
          break;
        case 3:
          stateStr = "unspeak";
          break;
        case 4:
          stateStr = "listen";
          break;
        case 5:
          stateStr = "unlisten";
          break;
        case 6:
          stateStr = "reject";
          break;
        case 7:
          stateStr = "ringing";
          break;
        case 8:
          stateStr = "connected";
          break;
        case 9:
          stateStr = "MuteLocalMic";
          break;
        case 10:
          stateStr = "UnMuteLocalMic";
          break;
        case 11:
          stateStr = "MuteLocalCamera";
          break;
        case 12:
          stateStr = "UnMuteLocalCamera";
          break;
        default:
          break;
      }
      console.log(para, "会议状态改变1212");
      // 退出会议
      if (para.state === 1) {
        let members = store.getters.conferenceMembers;
        members = members.filter((item) => item.number !== para.member);
        store.commit("commandDispatch/SET_CONFERENCE_MEMBERS", members);
      }
      if (para.member === dispatchConfig.account) return;
      // 接收会议
      if (para.state === 8) {
        const result = await getSysUserByFusionAccount(para.member);
        const payloadParams = {
          userId: result.id,
          file: result.file,
          name: result.name,
          number: para.member,
          allowListen: para.sender.members[para.member].allowListen,
          allowSpeak: para.sender.members[para.member].allowSpeak,
        };
        if (para.sender._isVideo) {
          this.addListener("userVideoConferenceConnected", payloadParams);
        } else {
          this.addListener("userAudioConferenceConnected", payloadParams);
        }
      }
    });
  }
  // 监听接收会议的会议状态
  setIncomingLinsterConferenceChange() {
    if (!this.incomingConference) {
      throw new Error("会议未启动!");
    }
    this.incomingConference.stateChange.on((para) => {
      var stateStr;
      switch (para.state) {
        case 1:
          stateStr = "connecting";
          break;

        case 2:
          stateStr = "Connected";

          break;

        case 3:
          stateStr = "Kickout";
          break;

        case 4:
          stateStr = "Terminaled";
          break;

        case 5:
          stateStr = "Leave";
          break;

        default:
          break;
      }
      console.log("会议状态改变1212", para);
      if (para.state === 4) {
        //会议结束
        this.addListener("incomingConferenceEnd", para);
        store.commit("commandDispatch/SET_CONFERENCE_MEMBERS", []);
      }
    });
    this.incomingConference.memberStateChange.on(async (para) => {
      var stateStr;
      switch (para.state) {
        case 0:
          stateStr = "enter";
          break;
        case 1:
          stateStr = "leave";
          break;
        case 2:
          stateStr = "speak";
          break;
        case 3:
          stateStr = "unspeak";
          break;
        case 4:
          stateStr = "listen";
          break;
        case 5:
          stateStr = "unlisten";
          break;
        case 6:
          stateStr = "reject";
          break;
        case 7:
          stateStr = "ringing";
          break;
        case 8:
          stateStr = "connected";
          break;
        case 9:
          stateStr = "MuteLocalMic";
          break;
        case 10:
          stateStr = "UnMuteLocalMic";
          break;
        case 11:
          stateStr = "MuteLocalCamera";
          break;
        case 12:
          stateStr = "UnMuteLocalCamera";
          break;
        default:
          break;
      }
      if (para.state === 8) {
        if (para.member === dispatchConfig.account) return; //自己不加入
        const result = await getSysUserByFusionAccount(para.member);
        const members = [
          ...store.getters.conferenceMembers,
          {
            userId: result.id,
            file: result.file,
            name: result.name,
            number: para.member,
            allowListen: para.sender.members[para.member].allowListen,
            allowSpeak: para.sender.members[para.member].allowSpeak,
          },
        ];
        store.commit("commandDispatch/SET_CONFERENCE_MEMBERS", members);
      }
    });
  }
  // 会议新增成员
  async addConferenceMembers(members = []) {
    for (const member of members) {
      this.conference.add(member);
    }
  }
  // 打开成员视频
  async openMemberVideo(userId, videoControl) {
    try {
      await this.conference.openMemberVideo(userId, videoControl);
    } catch (error) {
      console.error(error);
    }
  }
  // 关闭成员视频
  async closeMemberVideo(userId) {
    try {
      this.conference.closeMemberVideo(userId);
    } catch (error) {
      console.error(error);
    }
  }
  // 结束会议
  async endConference() {
    try {
      await this.conference.end();
      this.conference.exit();
    } catch (error) {
      console.error(error);
    }
  }

  // 全体禁言/取消禁言
  setAllSpeak(members = [], allowSpeak = false) {
    for (const member of members) {
      this.conference.allowSpeak(member, allowSpeak);
    }
  }
  // 禁言/取消禁言
  setMemberSpeak(member, allowSpeak) {
    this.conference.allowSpeak(member, allowSpeak);
  }
  // 全体禁听/取消禁听
  setAllListen(members = [], allowListen = false) {
    for (const member of members) {
      this.conference.allowListen(member, allowListen);
    }
  }
  // 禁听/取消禁听
  setMemberListen(member, allowListen) {
    this.conference.allowListen(member, allowListen);
  }
  // 移除
  removeMember(member) {
    this.conference.remove(member);
  }
  // 本地禁音及禁言/取消禁音及禁言
  setLocalMute(mute = true) {
    mute ? this.conference.mute() : this.conference.unmute();
  }
  // 本地禁止视频/取消禁止视频
  setLocalVideo(mute) {
    mute ? this.conference.muteVideo() : this.conference.unmuteVideo();
  }
}
export const MySingletonWebrtc = singleton(CustomWebrtc);
