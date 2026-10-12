import { apiProxy } from "../api/server";
import { RTCCore } from "../core/rtc-core";
import { CallMediaType, CallRole, CallScene, CallStatus } from "../data/call-define";
import { Constants } from "../data/constants";
import type { AbsRTC } from "../rtc/abs-rtc";
import { RTCFactory } from "../rtc/rtc-factory";
import { RTCPlatformType } from "../rtc/rtc-types";
import type { RTCParamsByPlatform } from "../rtc/rtc-types";
import { CallOptions } from "./call-options";
import { CallState, type ExposeCallStateData } from "./call-state";
import { CallingBellFeature } from "./calling-bell-feature";

declare global {
  interface Window {
    __CUBE_RTC_CALL_MANAGER_INSTANCE__?: CallManager;
  }
}

/**
 * 通话管理器
 * 负责通话的创建、销毁、接听、挂断等操作
 * 注意：在项目中Socket消息处理中，需要通知 SOCKET_COMMUNICATE_MESSAGE 通讯消息类型的事件,在该管理器才能及时处理通讯的socket消息
 * -例如：RTCCore.getInstance().notifyEvent(Constants.SOCKET_EVENT.SOCKET_COMMUNICATE_MESSAGE, msg)
 */
export class CallManager {
  private static instance: CallManager;
  public static getInstance(): CallManager {
    if (!this.instance) {
      this.instance = window.__CUBE_RTC_CALL_MANAGER_INSTANCE__ ?? new CallManager();
      window.__CUBE_RTC_CALL_MANAGER_INSTANCE__ = this.instance;
    }
    return this.instance;
  }

  private options: CallOptions | null = null;
  private rtcInstance: AbsRTC | null = null;
  private callReceivedCallBack: (() => void) | null = null;
  private callEndCallBack: (() => void) | null = null;
  private localCameraParams: unknown = null;
  private remoteCameraParams: unknown = null;
  private callStateChangeCallBack: ((data: ExposeCallStateData) => void) | null = null;
  // 保活定时器
  private keepAliveTimer: number | null = null;
  // 是否正在运行保活
  private isKeepAliveRunning: boolean = false;
  // 保活接口调用间隔,默认1分钟
  private keepAliveInterval: number = 60 * 1000;
  private constructor() {
    // 注册socket-通讯消息监听
    RTCCore.getInstance().registerEvent(Constants.SOCKET_EVENT.SOCKET_COMMUNICATE_MESSAGE, this.handleSocketMessage);
    // 注册rtc-处理通话结束
    RTCCore.getInstance().registerEvent(Constants.STATE_EVENT.CALL_END, this.handleCallEnd);
    // 监听CallState状态变更
    RTCCore.getInstance().registerEvent(Constants.STATE_EVENT.SET_STATE, () => {
      const callState = CallState.getInstance();
      const data: ExposeCallStateData = {
        mediaType: callState.mediaType,
        selfUser: callState.selfUser,
        remoteUserList: callState.remoteUserList,
      };
      this.callStateChangeCallBack?.(data);
    });
    CallingBellFeature.initialize();
  }

  public getCallState = (): CallState => {
    return CallState.getInstance();
  };

  /**
   * 登录通讯
   */
  public login = async (): Promise<void> => {
    await apiProxy.cubeCommunicateServiceProxy.login();
    if (this.isKeepAliveRunning) {
      this.stopKeepAlive();
      this.startKeepAlive();
    } else {
      this.startKeepAlive();
    }
  };

  /**
   * 退出通讯
   */
  public logout = async (): Promise<void> => {
    await apiProxy.cubeCommunicateServiceProxy.logout();
    this.stopKeepAlive();
  };

  /**
   * 配置信息
   * @param options
   * @param rtcPlatform RTC平台类型，默认腾讯云
   * @param rtcConfig RTC配置信息，不传则自动获取后端配置信息
   * @param userRoomEventSource 用户房间事件源，socket | rtc，默认socket
   * @param keepAliveInterval 保活接口调用间隔,默认1分钟（60*1000）
   *
   * 注意：每次设置完成之后，需要调用createRTC()
   */
  public setOptions = async (options: {
    rtcPlatform?: RTCPlatformType;
    rtcConfig?: any;
    userRoomEventSource?: "socket" | "rtc";
    keepAliveInterval?: number;
  }): Promise<void> => {
    const rtcPlatform = options?.rtcPlatform ?? RTCPlatformType.TENCENT;
    let rtcConfig = options?.rtcConfig;
    const userRoomEventSource = options?.userRoomEventSource ?? "socket";
    if (!options || !rtcConfig) {
      switch (rtcPlatform) {
        case RTCPlatformType.TENCENT:
          const response = await apiProxy.cubeCommunicateServiceProxy.getTencentAuth();
          rtcConfig = response.sdkAppId;
          CallState.getInstance().setSelfUser({ userSig: response.sig });
          break;
        default:
          break;
      }
    }

    this.options = CallOptions.builder()
      .setRTCPlatform(rtcPlatform)
      .setRTCConfig(rtcConfig)
      .setUserRoomEventSource(userRoomEventSource)
      .build();

    this.setKeepAliveInterval(options?.keepAliveInterval ?? 60 * 1000);

    this.createRTC();
  };

  /**
   * 配置当前用户信息
   * @param user
   */
  public setSelfUser = (user: {
    id?: string;
    name?: string;
    avatar?: string;
    callRole?: CallRole;
    callStatus?: CallStatus;
    view?: string | HTMLElement;
    userSig?: string;
    audioAvailable?: boolean;
    videoAvailable?: boolean;
  }): void => {
    CallState.getInstance().setSelfUser(user);
  };

  public onCallReceived = (callback: () => void): void => {
    this.callReceivedCallBack = callback;
  };

  public onCallEnd = (callback: () => void): void => {
    this.callEndCallBack = callback;
  };

  public onCallStateChange = (callback: (callState: ExposeCallStateData) => void): void => {
    this.callStateChangeCallBack = callback;
  };

  /**
   * 初始化 RTC
   *
   * 注意：每次setOptions完成之后，需要再次该函数
   */
  public createRTC = (): void => {
    if (!this.options) {
      throw new Error("配置信息未配置");
    }
    if (this.rtcInstance) {
      this.rtcInstance.destroy();
      this.rtcInstance = null;
      this.cleanRTCUserRoomEvent();
    }
    const platform = this.options.getRTCPlatform();
    const config = this.options.getRTCConfig();
    this.rtcInstance = RTCFactory.createRTC(platform, config);
    this.rtcInstance.initRTC();
    // 使用rtc的用户加入/离开房间事件
    if (!this.options.isSocketUserRoomEvent()) {
      this.addRTCUserRoomEvent();
    }
  };

  /**
   * 销毁通话管理器
   */
  public destroy = (): void => {
    this.rtcInstance?.destroy();
    this.rtcInstance = null;
    this.cleanRTCUserRoomEvent();
    this.stopKeepAlive();
  };

  /**
   * 挂断通话
   */
  public hangUp = async (): Promise<void> => {
    CallingBellFeature.stopRing();
    const roomId = CallState.getInstance().roomId;
    const callRole = CallState.getInstance().selfUser.callRole;
    try {
      if (CallStatus.accept === CallState.getInstance().selfUser.callStatus) {
        await apiProxy.cubeCommunicateServiceProxy.leaveConferenceRoom({ roomNumber: roomId });
      } else {
        // 等待状态下-电话发起者能显示出-挂断按钮
        if (CallRole.caller === callRole) {
          await apiProxy.cubeCommunicateServiceProxy.closeConferenceRoom({ roomNumber: roomId });
        } else {
          await apiProxy.cubeCommunicateServiceProxy.refuseJoinConferenceRoom({ roomNumber: roomId });
        }
      }
    } finally {
      CallState.getInstance().cleanState();
      this.closeMicrophone();
      if (this.localCameraParams) {
        this.closeLocalCamera(this.localCameraParams as unknown as Parameters<typeof this.closeLocalCamera>[0]);
      }
      if (this.remoteCameraParams) {
        this.stopRemoteVideo(this.remoteCameraParams as unknown as Parameters<typeof this.stopRemoteVideo>[0]);
      }
    }
    await this.rtcInstance?.hangUp();
  };

  /**
   * 接听通话
   * */
  public accept = async (): Promise<void> => {
    CallingBellFeature.stopRing();
    await this.rtcInstance?.accept({
      roomId: CallState.getInstance().roomId,
      userId: CallState.getInstance().selfUser.id,
      userSig: CallState.getInstance().selfUser.userSig,
    });
    CallState.getInstance().onAccept();
    await apiProxy.cubeCommunicateServiceProxy.joinConferenceRoom({ roomNumber: CallState.getInstance().roomId });
  };

  /**
   * 拒绝通话
   */
  public reject = async (): Promise<void> => {
    CallingBellFeature.stopRing();
    this.rtcInstance?.reject();
    const roomId = CallState.getInstance().roomId;
    CallState.getInstance().cleanState();
    await apiProxy.cubeCommunicateServiceProxy.refuseJoinConferenceRoom({ roomNumber: roomId });
  };

  /**
   * 单人通话-音频
   * @param userId 被呼叫者id
   */
  public singleCallAudio = async (userId: string): Promise<void> => {
    await this.singleCall(userId, CallMediaType.audio);
  };

  /**
   * 单人通话-视频
   * @param userId 被呼叫者id
   */
  public singleCallVideo = async (userId: string): Promise<void> => {
    await this.singleCall(userId, CallMediaType.video);
  };

  /**
   * 多人通话-音频
   * @param userIds 被呼叫者id
   */
  public multipleCallAudio = async (userIds: string[]): Promise<void> => {
    await this.multipleCall(userIds, CallMediaType.audio);
  };

  /**
   * 多人通话-视频
   * @param userIds 被呼叫者id
   */
  public multipleCallVideo = async (userIds: string[]): Promise<void> => {
    await this.multipleCall(userIds, CallMediaType.video);
  };

  /**
   * 邀请成员
   * @param users
   * @returns
   */
  public inviteUser = async (userIds: string[]): Promise<void> => {
    if (userIds.length === 0) {
      return;
    }
    for (const userId of userIds) {
      if (CallState.getInstance().calledIdList.includes(userId)) {
        continue;
      }
      CallState.getInstance().calledIdList.push(userId);
    }
    await apiProxy.cubeCommunicateServiceProxy.inviteUserOfConferenceRoom({
      roomNumber: CallState.getInstance().roomId,
      mediaType: CallState.getInstance().mediaType,
      callingType: CallScene.conference,
      proposeUserId: CallState.getInstance().selfUser.id!,
      conferenceUsers: userIds,
    });
  };

  /**
   * 开启麦克风
   * @param params 根据平台类型自动推导参数类型
   * -腾讯：无参
   */
  public openMicrophone = <T extends RTCPlatformType = RTCPlatformType.TENCENT>(
    params?: RTCParamsByPlatform<T, "openMicrophone">,
  ): void => {
    this.rtcInstance?.openMicrophone(params);
  };

  /**
   * 关闭麦克风
   * @param params 根据平台类型自动推导参数类型
   * -腾讯：无参
   */
  public closeMicrophone = <T extends RTCPlatformType = RTCPlatformType.TENCENT>(
    params?: RTCParamsByPlatform<T, "closeMicrophone">,
  ): void => {
    this.rtcInstance?.closeMicrophone(params);
  };

  /**
   * 开启摄像头
   * @param params 根据平台类型自动推导参数类型
   * -腾讯： string-viewId 或 HTMLElement
   */
  public openLocalCamera = <T extends RTCPlatformType = RTCPlatformType.TENCENT>(
    params: RTCParamsByPlatform<T, "openLocalCamera">,
  ): void => {
    this.localCameraParams = params;
    this.rtcInstance?.openLocalCamera(params);
  };

  /**
   * 关闭本地摄像头
   * @param params 根据平台类型自动推导参数类型
   * -腾讯：无参
   */
  public closeLocalCamera = <T extends RTCPlatformType = RTCPlatformType.TENCENT>(
    params: RTCParamsByPlatform<T, "closeLocalCamera">,
  ): void => {
    this.rtcInstance?.closeLocalCamera(params);
  };

  /**
   * 切换摄像头
   * @param params 根据平台类型自动推导参数类型
   * -腾讯：无参
   */
  public changeLocalCamera = <T extends RTCPlatformType = RTCPlatformType.TENCENT>(
    params?: RTCParamsByPlatform<T, "changeLocalCamera">,
  ): void => {
    this.rtcInstance?.changeLocalCamera(params);
  };

  /**
   * 开启远端用户扬声器
   * @param params 根据平台类型自动推导参数类型
   * -腾讯：userId: 远端用户id,'*'代表所有用户
   */
  public startRemoteAudio = <T extends RTCPlatformType = RTCPlatformType.TENCENT>(
    params: RTCParamsByPlatform<T, "startRemoteAudio">,
  ): void => {
    this.rtcInstance?.startRemoteAudio(params);
  };

  /**
   * 关闭远端用户扬声器
   * @param params 根据平台类型自动推导参数类型
   * -腾讯：userId-远端用户id,'*'代表所有用户
   */
  public stopRemoteAudio = <T extends RTCPlatformType = RTCPlatformType.TENCENT>(
    params: RTCParamsByPlatform<T, "stopRemoteAudio">,
  ): void => {
    this.rtcInstance?.stopRemoteAudio(params);
  };

  /**
   * 开启远端用户视频
   * @param params 根据平台类型自动推导参数类型
   * -腾讯：{ userId: 远端用户id; view: 视图viewId/试图html; streamType: 视频流类型, 默认为TRTCStreamType.Main }
   */
  public startRemoteVideo = <T extends RTCPlatformType = RTCPlatformType.TENCENT>(
    params: RTCParamsByPlatform<T, "startRemoteVideo">,
  ): void => {
    this.remoteCameraParams = params;
    this.rtcInstance?.startRemoteVideo(params);
  };

  /**
   * 关闭远端用户视频
   * @param params 根据平台类型自动推导参数类型
   * -腾讯：userId-远端用户id,'*'代表所有用户
   */
  public stopRemoteVideo = <T extends RTCPlatformType = RTCPlatformType.TENCENT>(
    params: RTCParamsByPlatform<T, "stopRemoteVideo">,
  ): void => {
    params.streamType = params.streamType ?? "main";
    this.rtcInstance?.stopRemoteVideo(params);
  };

  /**
   * 单人通话
   * @param userId 被呼叫者
   * @param mediaType 通话类型
   */
  private singleCall = async (userId: string, mediaType: CallMediaType): Promise<void> => {
    try {
      if (CallState.getInstance().selfUser.callStatus !== CallStatus.none) {
        throw new Error("当前用户正在通话");
      }
      CallingBellFeature.startRing();
      const roomId = await this.getCallRoomId();
      CallState.getInstance().scene = CallScene.single;
      CallState.getInstance().mediaType = mediaType;
      CallState.getInstance().roomId = roomId;
      CallState.getInstance().selfUser.callRole = CallRole.caller;
      CallState.getInstance().selfUser.callStatus = CallStatus.waiting;
      CallState.getInstance().remoteUserList.push({
        id: userId,
        callRole: CallRole.called,
        callStatus: CallStatus.waiting,
      });
      await apiProxy.cubeCommunicateServiceProxy.proposeConferenceRoom({
        roomNumber: roomId,
        mediaType: mediaType,
        callingType: CallScene.single,
        proposeUserId: CallState.getInstance().selfUser.id!,
        conferenceUsers: [userId],
      });
      this.rtcInstance?.startCall({
        roomId: CallState.getInstance().roomId,
        userId: CallState.getInstance().selfUser.id,
        userSig: CallState.getInstance().selfUser.userSig,
      });
    } catch {
      CallingBellFeature.stopRing();
      this.closeRoom();
    }
  };

  /**
   * 多人通话
   * @param userIds 被呼叫者
   * @param mediaType 通话类型
   */
  private multipleCall = async (userIds: string[], mediaType: CallMediaType): Promise<void> => {
    try {
      if (CallState.getInstance().selfUser.callStatus !== CallStatus.none) {
        throw new Error("当前用户正在通话");
      }
      const roomId = await this.getCallRoomId();
      CallState.getInstance().scene = CallScene.conference;
      CallState.getInstance().roomId = roomId;
      CallState.getInstance().mediaType = mediaType;
      CallState.getInstance().selfUser.callRole = CallRole.caller;
      CallState.getInstance().selfUser.callStatus = CallStatus.waiting;
      const calledUsers = userIds.map((userId) => {
        return {
          id: userId,
          callRole: CallRole.called,
          callStatus: CallStatus.waiting,
        };
      });
      CallState.getInstance().calledUserList.push(...calledUsers);
      await apiProxy.cubeCommunicateServiceProxy.proposeConferenceRoom({
        roomNumber: roomId,
        mediaType: mediaType,
        callingType: CallScene.conference,
        proposeUserId: CallState.getInstance().selfUser.id!,
        conferenceUsers: userIds,
      });
      this.rtcInstance?.startCall({
        roomId: CallState.getInstance().roomId,
        userId: CallState.getInstance().selfUser.id,
        userSig: CallState.getInstance().selfUser.userSig,
      });
    } catch {
      this.closeRoom();
    }
  };

  /**
   * 通话房间号
   * 向后端索取，后端生成
   */
  private getCallRoomId = async (): Promise<string> => {
    return apiProxy.cubeCommunicateServiceProxy.createConferenceRoom();
  };

  /**
   * 关闭房间
   * 通知后端-取消房间号
   */
  private closeRoom = async (): Promise<void> => {
    try {
      await apiProxy.cubeCommunicateServiceProxy.closeConferenceRoom({ roomNumber: CallState.getInstance().roomId });
      await this.rtcInstance?.endCall();
    } finally {
      RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.CALL_END);
      CallState.getInstance().cleanState();
      this.closeMicrophone();
      if (this.localCameraParams) {
        this.closeLocalCamera(this.localCameraParams as unknown as Parameters<typeof this.closeLocalCamera>[0]);
      }
      if (this.remoteCameraParams) {
        this.stopRemoteVideo(this.remoteCameraParams as unknown as Parameters<typeof this.stopRemoteVideo>[0]);
      }
    }
  };

  /**
   * 处理通话接收
   * UI弹窗的显示
   */
  private handleStateEvenCallReceived = (): void => {
    CallingBellFeature.startRing();
    if (!this.callReceivedCallBack) {
      throw new Error("未设置通话接收回调,请在onCallReceived中设置,用于处理UI逻辑");
    }
    this.callReceivedCallBack?.();
  };

  /**
   * 处理通话结束
   * UI弹窗的关闭
   */
  private handleCallEnd = (): void => {
    CallingBellFeature.stopRing();
    if (!this.callEndCallBack) {
      throw new Error("未设置通话结束回调,请在onCallEnd中设置,用于处理UI逻辑");
    }
    this.callEndCallBack?.();
  };

  /**
   * 处理 socket 消息
   * @param msg (msg.event 事件名称, msg.data 事件数据)
   */
  private handleSocketMessage = (msg: any): void => {
    const data = JSON.parse(msg.data);
    switch (msg.event) {
      case Constants.SOCKET_EVENT.INCOMING_CALL:
        this.handleCallReceived(data);
        break;
      case Constants.SOCKET_EVENT.USER_JOIN_ROOM:
        if (this.options?.isSocketUserRoomEvent()) {
          this.handleRemoteUserEnterRoom(data);
        }
        break;
      case Constants.SOCKET_EVENT.USER_LEAVE_ROOM:
        if (this.options?.isSocketUserRoomEvent()) {
          this.handleRemoteUserLeaveRoom(data);
        }
        break;
      case Constants.SOCKET_EVENT.USER_REFUSE_JOIN_ROOM:
        this.handleRemoteUserRefuseEnterRoom(data);
        break;
      case Constants.SOCKET_EVENT.USER_CLOSE_ROOM:
        this.handleRemoteUserCloseRoom(data);
        break;
      case Constants.SOCKET_EVENT.USER_OTHER_TERMINAL_JOIN:
        this.handleRemoteUserOtherTerminalAccept(data);
        break;
      case Constants.SOCKET_EVENT.REMOVE_USER:
        this.handleRemoteUserOutOfTheRoom(data);
        break;
      case Constants.SOCKET_EVENT.INVITE_USER_JOIN_ROOM:
        this.handleCallReceived(data);
        break;
      default:
        break;
    }
  };

  /**
   * RTC平台通知事件-用户进入房间
   * @param data
   */
  private addRTCUserRoomEvent = (): void => {
    RTCCore.getInstance().registerEvent(Constants.RTC_EVENT.REMOTE_USER_EXIT, this.handleRTCUserLeaveRoom);
    RTCCore.getInstance().registerEvent(Constants.RTC_EVENT.REMOTE_USER_ENTER, this.handleRTCUserEnterRoom);
  };

  /**
   * 取消rtc用户房间监听
   */
  private cleanRTCUserRoomEvent = (): void => {
    RTCCore.getInstance().unregisterEvent(Constants.RTC_EVENT.REMOTE_USER_EXIT, this.handleRTCUserLeaveRoom);
    RTCCore.getInstance().unregisterEvent(Constants.RTC_EVENT.REMOTE_USER_ENTER, this.handleRTCUserEnterRoom);
  };

  /**
   * 处理RTC平台通知事件-用户进入房间
   */
  private handleRTCUserEnterRoom = (event: any): void => {
    const rtcPlatform = this.options?.getRTCPlatform();
    switch (rtcPlatform) {
      case RTCPlatformType.TENCENT:
        const userId = event.userId;
        this.handleRemoteUserEnterRoom({ member: userId });
        break;
      default:
        break;
    }
  };

  /**
   * 处理RTC平台通知事件-用户离开房间
   */
  private handleRTCUserLeaveRoom = (event: any): void => {
    const rtcPlatform = this.options?.getRTCPlatform();
    switch (rtcPlatform) {
      case RTCPlatformType.TENCENT:
        const userId = event.userId;
        this.handleRemoteUserLeaveRoom({ member: userId });
        break;
      default:
        break;
    }
  };

  /**
   * 处理呼叫消息
   * @param params
   */
  private handleCallReceived = (params: Record<string, any>): void => {
    const callerId = params["callingUser"];
    if (CallState.getInstance().selfUser.id === callerId) {
      return;
    }
    CallState.getInstance().onIncomingCall(params);
    this.handleStateEvenCallReceived();
  };

  /**
   * 远端用户加入房间
   * @param params
   */
  private handleRemoteUserEnterRoom = (params: Record<string, any>): void => {
    CallState.getInstance().onRemoteUserEnterRoom(params);
  };

  /**
   * 远端用户离开房间
   * @param params
   */
  private handleRemoteUserLeaveRoom = (params: Record<string, any>): void => {
    CallState.getInstance().onRemoteUserLeaveRoom(params);
    // 远端用户集合没有用户时-对话结束，并关闭房间
    if (CallState.getInstance().remoteUserList.length === 0) {
      this.closeRoom();
    } else {
      RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.SET_STATE);
    }
  };

  /**
   * 远端用户拒绝加入房间
   * @param params
   */
  private handleRemoteUserRefuseEnterRoom = (params: Record<string, any>): void => {
    CallState.getInstance().onRemoteUserRefuseEnterRoom(params);
    if (CallState.getInstance().remoteUserList.length === 0) {
      if (CallScene.single === CallState.getInstance().scene) {
        this.closeRoom();
      } else {
        if (CallState.getInstance().calledIdList.length === 0) {
          this.closeRoom();
        } else {
          RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.SET_STATE);
        }
      }
    } else {
      RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.SET_STATE);
    }
  };

  /**
   * 远端用户关闭房间
   * @param params
   */
  private handleRemoteUserCloseRoom = (params: Record<string, any>): void => {
    const roomId = params["roomNumber"];
    if (CallState.getInstance().roomId === roomId) {
      this.rtcInstance?.endCall();
      RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.CALL_END);
      CallState.getInstance().cleanState();
    }
  };

  /**
   * 其他客户端接听
   * @param params
   */
  private handleRemoteUserOtherTerminalAccept = (params: Record<string, any>): void => {
    const roomId = params["roomNumber"];
    if (CallState.getInstance().roomId === roomId) {
      this.rtcInstance?.endCall();
      RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.CALL_END);
      CallState.getInstance().cleanState();
    }
  };

  /**
   * 被踢出房间
   * @param params
   */
  private handleRemoteUserOutOfTheRoom = (params: Record<string, any>): void => {
    const roomId = params["roomNumber"];
    const userIds = params["members"] as string[];
    if (CallState.getInstance().roomId === roomId) {
      if (userIds.includes(CallState.getInstance().selfUser.id!)) {
        this.rtcInstance?.endCall();
        RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.CALL_END);
        CallState.getInstance().cleanState();
      } else {
        CallState.getInstance().onRemoteUserOutOfTheRoom(params);
        RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.SET_STATE);
      }
    }
  };

  /**
   * 设置保活间隔时间
   * @param intervalMs 保活接口调用间隔时间毫秒
   * 最小间隔时间（10秒）防止过于频繁调用
   */
  private setKeepAliveInterval = (intervalMs: number): void => {
    if (intervalMs < 10 * 1000) {
      this.keepAliveInterval = 10 * 1000;
    } else {
      this.keepAliveInterval = intervalMs;
    }
    // 如果正在运行，则重新启动
    if (this.isKeepAliveRunning) {
      this.stopKeepAlive();
      this.startKeepAlive();
    }
  };

  /**
   * 启动保活机制
   */
  private startKeepAlive = (): void => {
    if (this.isKeepAliveRunning) {
      return;
    }
    this.isKeepAliveRunning = true;

    this.executeKeepAlive().catch((error) => {});

    this.keepAliveTimer = window.setInterval(() => {
      this.executeKeepAlive().catch((error) => {});
    }, this.keepAliveInterval);
  };

  /**
   * 停止保活机制
   */
  private stopKeepAlive = (): void => {
    if (!this.isKeepAliveRunning) return;

    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    this.isKeepAliveRunning = false;
  };

  /**
   * 执行保活请求
   */
  private executeKeepAlive = async (): Promise<void> => {
    try {
      await apiProxy.cubeCommunicateServiceProxy.keepAlive();
    } catch (error) {
      throw error;
    }
  };
}
