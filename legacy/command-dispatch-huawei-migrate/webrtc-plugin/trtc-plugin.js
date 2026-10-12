import TRTC from "trtc-sdk-v5";
import { nextTick } from "vue";

import {
  createRoomNumber,
  getUserSig,
  startCommunicate,
  getRoomInfo,
  addRoomUser,
  refuseJoinRoom,
  joinRoom,
  leaveRoom,
  endRoom,
  removeRoomUser,
} from "../src/api/communicate";
import { getUser } from "../src/api/ouaa";
import store from "../src/store";
import { GHMessage } from "../src/utils/message";
import { showToast } from "../src/views/traffic/commandDispatch/components/toast";
import { singleton } from "./index";
// 消息类型 ALARM_NOTICE 报警
const REMOTE_LOGIN_MESSAGE = "REMOTE_LOGIN_MESSAGE"; //远端重复登录消息
const COMMUNICATE_MESSAGE = "COMMUNICATE_MESSAGE"; //通讯消息
const ALARM_MESSAGE_LIST = ["DEVICE_ATTRIBUTE_CHANGE", "NOTICE_MESSAGE"];
const CALL_STATE = {
  WAIT: "WAIT", //等待
  CALLING: "CALLING", //通话中
  IDLE: "IDLE", //空闲
};
export class TRTCMessagePlugin {
  trtc = null; //trtc实例
  userId = null; //本地用户的userId
  callingUser = ""; //正在通话的用户
  events = {}; //事件
  wsMsg = null; //消息实例
  mediaType = "AUDIO"; //通话媒体类型
  callingType = "SINGLE"; // 通话类型
  singleMediaId = "local-make-call-video"; //单人通话时使用的videoId用来播放远端用户的视频dom
  localStart = false; //是否本地发起的
  roomId = ""; //房间id
  callState = CALL_STATE.IDLE; //通话状态
  handleMessage = null; //处理用户消息
  buffer = []; //此处为通话的录音buffer
  mediaRecorder = null; //媒体录音
  constructor(
    option = {
      userId: "",
      accessToken: "",
      tenant: "",
      terminal: "",
      subscribeType: "broadcast",
    },
  ) {
    this.userId = option.userId;
    this.initSocket(option);
  }

  _onMessage(message) {
    const msgType = message.msgType;
    if (ALARM_MESSAGE_LIST.includes(msgType)) {
      this.addListener("alarmMessage", message);
    }
    // 有重复登录消息
    if (REMOTE_LOGIN_MESSAGE === msgType) {
      this.callState === CALL_STATE.CALLING && this._exitTRTCRoom();
      this.addListener("remoteRepeatLogin", message);
    }
    // 通讯消息
    if (msgType === COMMUNICATE_MESSAGE) {
      // 消息数据
      const event = message.eventDataDTO.event;
      const messageContent = JSON.parse(message.eventDataDTO.data);
      this.handleMessage[event] && this.handleMessage[event](messageContent);
    }
  }
  // 初始化处理用户消息
  _initHandleMessage() {
    this.handleMessage = {
      INVITE_USER_JOIN_CONFERENCE_ROOM: this._handleProposeConferenceRoom.bind(this), //邀请用户加入会议房间
      PROPOSE_CONFERENCE_ROOM: this._handleProposeConferenceRoom.bind(this), //远端用户发起会议消息
      USER_LEAVE_CONFERENCE_ROOM: this._handleUserLeaveRoom.bind(this), //用户离开会议房间
      CLOSE_CONFERENCE_ROOM: this._handleCloseRoom.bind(this), //关闭会议房间
      USER_REFUSE_JOIN_CONFERENCE_ROOM: this._handleUserRefuseJoinRoom.bind(this), //用户拒绝加入会议房间
      USER_OTHER_TERMINAL_JOIN: this._handleUserOtherTerminalJoin.bind(this), //用户其他终端加入
      REMOVE_ROOM_CONFERENCE_USER: this._handleUserRemoveRoom.bind(this), //移除会议房间用户
      REMOVE_CONFERENCE_ROOM_USER: this._handleUserRemoveRoom.bind(this), //移除会议房间用户
    };
  }
  // 用户拒绝进入会议房间
  async _handleUserRefuseJoinRoom(data) {
    if (this.callState === CALL_STATE.WAIT) {
      this._exitTRTCRoom();
      this.addListener("overCalled", data);
    }
  }
  async _handleUserOtherTerminalJoin(data) {
    showToast("该用户已在其他终端接听", { duration: 1000 });
    this.addListener("overCalled", data);
  }
  // 处理关闭房间
  async _handleCloseRoom(data) {
    if ([CALL_STATE.CALLING, CALL_STATE.WAIT].includes(this.callState)) {
      this._exitTRTCRoom();
    }
    if (this.callingType === "SINGLE") {
      this.addListener("overCalled", data);
      return;
    } else {
      this.addListener("overConference", data);
    }
    store.commit("commandDispatch/SET_CONFERENCE_MEMBERS", []);
  }
  // 监听用户离开房间事件
  async _handleUserLeaveRoom(data) {
    let members = store.getters.conferenceMembers;
    if (this.mediaType === "VIDEO") {
      const member = members.find((item) => item.userId === data.member);
      if (member.openVideo) {
        this._stopRemoteVideo(data.member);
      }
    }
    members = members.filter((item) => data.member !== item.userId);
    store.commit("commandDispatch/SET_CONFERENCE_MEMBERS", members);
    if (members.length === 0) {
      setTimeout(async () => {
        this._exitTRTCRoom();
        this.addListener("overCalled", data);
        this.addListener("endConference", data);
      }, 1000);
    }
  }
  // 监听用户被移除
  async _handleUserRemoveRoom(data) {
    if (this.callingType === "SINGLE") {
      this._exitTRTCRoom();
      this.addListener("overCalled", data);
      return;
    }
    let members = store.getters.conferenceMembers;
    const leaveMembers = data.members;
    members = members.filter((item) => !leaveMembers.includes(item.userId));
    if (this.mediaType === "VIDEO") {
      leaveMembers.forEach((item) => {
        this._stopRemoteVideo(item);
      });
    }
    store.commit("commandDispatch/SET_CONFERENCE_MEMBERS", members);
  }
  // 处理接收会议发起消息 转换数据供给旧ui使用适配
  async _handleProposeConferenceRoom(data) {
    if (data.callingUser === this.userId) return;
    const roomNumber = data.roomNumber;
    if (this.roomId && this.roomId !== roomNumber && this.callState !== CALL_STATE.IDLE) {
      await refuseJoinRoom({ roomNumber: roomNumber });
      return;
    }
    this.localStart = false;
    this.mediaType = data.mediaType;
    this.callingType = data.callingType;
    this.roomId = roomNumber;
    this.callingUser = data.callingUser;
    this.singleMediaId = "local-coming-video";
    this.callState = CALL_STATE.WAIT;
    // 单呼
    if (this.callingType === "SINGLE") {
      this._handleSingleCallingMessage(data);
      return;
    }
    this._handleConferenceCallingMessage(data);
  }
  // 接收多人会议消息
  async _handleConferenceCallingMessage(data) {
    const handleMembers = data.members.reduce((prev, cur) => {
      prev[cur] = true;
      return prev;
    }, {});
    // 会议信息
    this.addListener("incomingConference", {
      conference: {
        caller: data.callingUser,
        isVideo: data.mediaType === "VIDEO",
        number: data.callingUser,
        allowListen: true,
        allowSpeak: true,
      },
      members: handleMembers,
    });
  }
  // 接收单呼消息
  async _handleSingleCallingMessage(data) {
    const result = await getUser({ id: data.callingUser });
    // 单人通讯个人信息
    const callInfoVo = {
      userId: result.id,
      number: result.id,
      isVideo: this.mediaType === "VIDEO",
      mobile: result.mobile,
      file: result.fileVO ? result.fileVO : "",
      name: result.name,
      organizationName: result.organization ? result.organization.name : "--",
      positionName: Array.isArray(result.positions) && result.positions.length ? result.positions.map((item) => item.name).join(",") : "--",
    };
    // 如果是单呼
    this.addListener("incomingCall", callInfoVo);
  }
  // 处理用户加入房间
  async _handleUserJoinRoom(data) {
    this._conferenceUserEnter(data);
  }
  // 用户加入会议房间
  async _conferenceUserEnter({ userId }) {
    const user = await getUser({ id: userId });
    const member = {
      userId: user.id,
      id: user.id,
      file: user.fileVO ? user.fileVO : "",
      name: user.name,
      number: user.id,
      allowListen: true,
      allowSpeak: true,
      openVideo: this.mediaType === "VIDEO",
    };
    this.callState = CALL_STATE.CALLING;
    const currentMembersId = [...store.getters.conferenceMembers].map((item) => item.id);
    if (!currentMembersId.includes(member.id)) {
      const members = [...store.getters.conferenceMembers, member];
      store.commit("commandDispatch/SET_CONFERENCE_MEMBERS", members);
      if (members.length > 1 && this.callingType === "SINGLE") {
        this.addListener("changeConference");
        this.callingType = "CONFERENCE";
        await this.trtc.stopLocalVideo();
        if (this.mediaType === "VIDEO") {
          store.commit("userInfo/SET_USER_INFO", {
            ...store.getters.userInfo,
            openVideo: true,
          });
          await nextTick();
          this.trtc.startLocalVideo({ view: "member-control-host" });
          for (const remoteUser of members) {
            await this._stopRemoteVideo(remoteUser.userId);
            await nextTick();
            this._startRemoteVideo(remoteUser.userId);
          }
        }
      }
    }
  }
  // 获取会议拥有的成员信息
  async getConferenceMembers() {
    const room = await getRoomInfo(this.roomId);
    const membersInfo = [];
    const members = room.members.filter((item) => ![this.userId, this.callingUser].includes(item));
    for (const member of members) {
      const user = await getUser({ id: member });
      membersInfo.push({
        userId: user.id,
        file: user.fileVO ? user.fileVO : "",
        name: user.name,
        number: user.id,
        allowListen: true,
        allowSpeak: true,
        openVideo: false,
      });
    }
    const originallyConferenceMembers = store.getters.conferenceMembers;
    store.commit("commandDispatch/SET_CONFERENCE_MEMBERS", [...membersInfo, ...originallyConferenceMembers]);
    return membersInfo;
  }
  /**
   *
   * @param {*} mediaControl 媒体控件
   * @param {*} isVideo 是否视频
   */
  async incomingConferenceAccept(mediaControl, isVideo) {
    await this._enterTRTCRoom();
    await joinRoom({
      roomNumber: this.roomId,
    });
    this.callState = CALL_STATE.CALLING;
    if (isVideo) {
      await this.trtc.startLocalVideo({ view: mediaControl });
    } else {
      await this.getConferenceMembers();
    }
  }
  // 新增会议成员
  async addConferenceMembers(members) {
    // 如果是单人通话
    if (this.callingType === "SINGLE") {
      this.callingType = "CONFERENCE";
      await this.trtc.stopLocalVideo();
      if (this.mediaType === "VIDEO") {
        await nextTick();
        this.trtc.startLocalVideo({ view: "member-control-host" });
        const remoteUser = store.getters.conferenceMembers[0];
        await this._stopRemoteVideo(remoteUser.userId);
        this._startRemoteVideo(remoteUser.userId);
      }
    }
    await addRoomUser({
      roomNumber: this.roomId,
      mediaType: this.mediaType,
      proposeUserId: this.userId,
      callingType: this.callingType,
      conferenceUsers: members,
    });
  }
  // 初始化WebSocket
  initSocket(option) {
    this.wsMsg = new GHMessage(option);

    this.wsMsg.onmessage(this._onMessage.bind(this));
    this._initHandleMessage();
  }
  // 初始化函数
  init() {
    this.trtc = TRTC.create();
    this.initTrtcEvent();
  }
  /**
   * 主动呼叫
   * @param {*} targetNumber // 号码
   * @param {*} isVideo //是否为视频
   * @param {*}  mediaControl 呼叫使用的媒体控件 dom
   */
  async makeCall(targetNumber, mediaControl, isVideo) {
    if (!targetNumber) {
      throw new Error("号码不能为空!");
    }
    try {
      this.callingType = "SINGLE";
      this.localStart = true;
      this.callingUser = targetNumber;
      this.singleMediaId = "local-make-call-video";
      this.mediaType = isVideo ? "VIDEO" : "AUDIO";
      this.callState = CALL_STATE.WAIT;
      await this._enterTRTCRoom();
      await startCommunicate({
        roomNumber: this.roomId,
        mediaType: isVideo ? "VIDEO" : "AUDIO",
        callingType: "SINGLE",
        proposeUserId: this.userId,
        conferenceUsers: [targetNumber],
      });
      // 开始本地视频
      if (isVideo) {
        this.trtc.startLocalVideo({ publish: true });
      }
    } catch (error) {
      console.error(error);
    }

    // 调用接口发送消息
  }
  // 接收音频通话
  async answerAudio() {
    if (!this.roomId) {
      throw new Error("房间号不能为空");
    }
    await this._enterTRTCRoom();
    this.callState = CALL_STATE.CALLING;
    await joinRoom({
      roomNumber: this.roomId,
    });
  }
  // 接收远端发起的视频通话
  async answerVideo() {
    if (!this.roomId) {
      throw new Error("房间号不能为空!");
    }
    await this._enterTRTCRoom();
    await this.trtc.startLocalVideo({ publish: true }); //发布本地视频
    this.callState = CALL_STATE.CALLING;
    await joinRoom({
      roomNumber: this.roomId,
    });
  }
  // 调用接口创建roomId
  async _createRoomId() {
    const roomJson = await createRoomNumber();
    return String(roomJson.roomNumber);
  }
  initTrtcEvent() {
    this.trtc.on(TRTC.EVENT.REMOTE_USER_ENTER, this._handleUserJoinRoom.bind(this));
    this.trtc.on(TRTC.EVENT.REMOTE_VIDEO_AVAILABLE, this._handleRemoteVideoAvailable.bind(this));
    this.trtc.on(TRTC.EVENT.REMOTE_VIDEO_UNAVAILABLE, this._handleRemoteVideoUnavailable.bind(this));
    this.trtc.on(TRTC.EVENT.REMOTE_AUDIO_AVAILABLE, this._handleRemoteAudioAvailable.bind(this));
    this.trtc.on(TRTC.EVENT.REMOTE_AUDIO_UNAVAILABLE, this._handleRemoteAudioUnavailable.bind(this));
  }
  offTrtcEvent() {
    if (!this.trtc) {
      return;
    }
    this.trtc.off(TRTC.EVENT.REMOTE_USER_ENTER, this._handleUserJoinRoom.bind(this));
    this.trtc.off(TRTC.EVENT.REMOTE_VIDEO_AVAILABLE, this._handleRemoteVideoAvailable.bind(this));
    this.trtc.off(TRTC.EVENT.REMOTE_VIDEO_UNAVAILABLE, this._handleRemoteVideoUnavailable.bind(this));
    this.trtc.off(TRTC.EVENT.REMOTE_AUDIO_AVAILABLE, this._handleRemoteAudioAvailable.bind(this));
    this.trtc.off(TRTC.EVENT.REMOTE_AUDIO_UNAVAILABLE, this._handleRemoteAudioUnavailable.bind(this));
  }
  async _handleRemoteVideoAvailable({ userId }) {
    setTimeout(() => {
      this._startRemoteVideo(userId);
    }, 500);
  }
  _handleRemoteVideoUnavailable({ userId }) {
    this._stopRemoteVideo(userId);
  }
  async _handleRemoteAudioAvailable({ userId }) {}
  async _handleRemoteAudioUnavailable({ userId }) {}
  _setUserAudio(userId, startAudio) {
    const members = store.getters.conferenceMembers;
    const memberIndex = members.findIndex((item) => item.userId === userId);
    const member = members[memberIndex];
    member.allowSpeak = startAudio;
    store.commit("commandDispatch/SET_CONFERENCE_MEMBERS", members);
  }
  // 进入房间
  async _enterTRTCRoom() {
    if (!this.trtc) {
      this.init();
    }
    if (!this.roomId) {
      this.roomId = await this._createRoomId();
    }

    const { sdkAppId, sig } = await getUserSig({
      userId: this.userId,
    });
    await this.trtc.enterRoom({
      strRoomId: this.roomId,
      sdkAppId: sdkAppId,
      userId: this.userId,
      userSig: sig,
    });
    this.trtc.startLocalAudio(); //发布本地音频
  }
  // 挂断
  async hangupCall() {
    if (this.callState === CALL_STATE.WAIT && !this.localStart) {
      try {
        this.roomId && refuseJoinRoom({ roomNumber: this.roomId });
      } catch (error) {
        console.error(error);
      } finally {
        this.callState = CALL_STATE.IDLE;
        this.roomId = "";
      }
      return;
    }
    this.callState = CALL_STATE.IDLE;
    if (!this.roomId) return;
    await this._exitTRTCRoom();
    store.commit("commandDispatch/SET_CONFERENCE_MEMBERS", []);
  }
  // 保持(本地禁音)
  async holdCall() {
    try {
      await this.trtc.stopLocalAudio();
    } catch (error) {
      console.error(error);
    }
  }
  // 取消保持(取消本地禁音)
  async unHoldCall() {
    try {
      await this.trtc.startLocalAudio();
    } catch (error) {
      console.error(error);
    }
  }
  // 开始录音
  startAudioRecord() {
    const mediaControl = document.getElementById(this.singleMediaId).querySelector("video");
    if (!mediaControl) {
      throw new Error("未找到视频空间");
    }
    this.buffer = [];
    const recordSteam = new MediaStream();
    recordSteam.addTrack(mediaControl.srcObject.getAudioTracks()[0]);
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
    await this._exitTRTCRoom();
    this.makeCall(targetNumber, "", this.mediaType === "VIDEO");
  }
  // 拉取拉远端视频流
  async _startRemoteVideo(userId) {
    if (!this.trtc) {
      throw new Error("未初始化trtc");
    }
    if (this.callingType === "SINGLE") {
      this.trtc.startRemoteVideo({ userId: userId, streamType: "main", view: this.singleMediaId });
    } else {
      this.setMemberVideo(userId, true);
      await this.trtc.startRemoteVideo({ userId: userId, streamType: "main", view: `member-control-${userId}` });
    }
  }
  async setMemberVideo(userId, openVideo) {
    const members = store.getters.conferenceMembers;
    const member = members.find((item) => item.userId === userId);
    if (!member) return;
    member.openVideo = openVideo;
    store.commit("commandDispatch/SET_CONFERENCE_MEMBERS", members);
  }
  async _stopRemoteVideo(userId) {
    if (!this.trtc) {
      throw new Error("未初始化trtc");
    }
    this.setMemberVideo(userId, false);
    this.trtc.stopRemoteVideo({ userId: userId, streamType: "main" });
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
      this.callingType = "CONFERENCE";
      this.localStart = true;
      this.mediaType = isVideo ? "VIDEO" : "AUDIO";
      this.callState = CALL_STATE.WAIT;
      await this._enterTRTCRoom();
      await startCommunicate({
        roomNumber: this.roomId,
        mediaType: this.mediaType,
        callingType: "CONFERENCE",
        proposeUserId: this.userId,
        conferenceUsers: members,
      });

      if (isVideo) {
        this.trtc.startLocalVideo({ view: conferenceControl });
      }
    } catch (error) {
      console.error(error);
    }
  }
  // 拒绝加入会议
  async rejectJoinConference() {
    // todo 调用接口发送消息
    console.log("拒绝加入会议");
    try {
      this.roomId && (await refuseJoinRoom({ roomNumber: this.roomId }));
    } catch (error) {
      console.error(error);
    } finally {
      this.callState = CALL_STATE.IDLE;
      this.roomId = "";
    }
  }
  // 打开会议成员视频
  async openMemberVideo(userId) {
    try {
      this._startRemoteVideo(userId);
    } catch (error) {
      console.error(error);
    }
  }
  // 移除会议成员
  removeMember(member) {
    removeRoomUser({
      roomNumber: this.roomId,
      userIds: [member],
    });
  }
  // 结束会议
  async endConference() {
    try {
      await this._exitTRTCRoom();
      store.commit("commandDispatch/SET_CONFERENCE_MEMBERS", []);
    } catch (error) {
      console.error(error);
    }
  }
  // 销毁客户端
  exitClient() {
    this.roomId = null;
    this.trtc && this.trtc.destroy();
    this.trtc = null;
  }
  // 关闭成员视频
  async closeMemberVideo(userId) {
    try {
      this.trtc.stopRemoteVideo({
        userId: userId,
        streamType: "main",
      });
    } catch (error) {
      console.error(error);
    }
  }
  // 全体禁言/取消禁言
  async setAllSpeak(members = [], allowSpeak = false) {
    for (const member of members) {
      await this.trtc.muteRemoteAudio(member, !allowSpeak);
    }
  }
  // 禁言/取消禁言
  async setMemberSpeak(member, allowSpeak) {
    await this.trtc.muteRemoteAudio(member, !allowSpeak);
    const members = store.getters.conferenceMembers;
    const index = members.findIndex((item) => item.userId === member);
    if (index > -1) {
      members[index].allowSpeak = allowSpeak;
      store.commit("commandDispatch/SET_CONFERENCE_MEMBERS", members);
    }
  }
  // 本地禁音及禁言/取消禁音及禁言
  setLocalMute(mute = true) {
    mute ? this.trtc.updateLocalAudio({ mute }) : this.trtc.updateLocalAudio({ mute });
  }
  // 本地禁止视频/取消禁止视频
  setLocalVideo(mute) {
    !mute ? this.trtc.stopLocalVideo() : this.trtc.startLocalVideo({ view: "member-control-host", publish: true });
  }
  // 退出房间
  async _exitTRTCRoom() {
    if (!this.trtc) {
      this.roomId = null;
      return;
    }
    try {
      const membersCount = store.getters.conferenceMembers.length;
      if (this.localStart && membersCount === 0) {
        this.roomId && (await endRoom({ roomNumber: this.roomId }));
        return;
      }
      if (membersCount === 0) {
        this.roomId && (await endRoom({ roomNumber: this.roomId }));
      } else {
        this.roomId &&
          (await leaveRoom({
            roomNumber: this.roomId,
          }));
      }
    } finally {
      this.offTrtcEvent();
      await this.trtc.exitRoom();
      await this.trtc.stopLocalVideo();
      await this.trtc.stopLocalAudio();
      this.roomId = null;
      this.callState = CALL_STATE.IDLE;
      this.trtc.destroy();
      this.trtc = null;
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
}
export const TRTCPlugin = singleton(TRTCMessagePlugin);
