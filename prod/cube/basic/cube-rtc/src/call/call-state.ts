import { CallUser } from '../data/call-user'
import { CallRole, CallStatus, CallScene, CallMediaType } from '../data/call-define'
import { RTCCore } from '../core/rtc-core'
import { Constants } from '../data/constants'
import { CallingBellFeature } from './calling-bell-feature'

declare global {
  interface Window {
    __CUBE_RTC_CALL_STATE_INSTANCE__?: CallState;
  }
}

export interface ExposeCallStateData {
  mediaType: CallMediaType;
  selfUser: CallUser;
  remoteUserList: CallUser[];
}

// 数据状态
export class CallState {

  private static instance: CallState;
  public static getInstance (): CallState {
    if (!this.instance) {
      this.instance = window.__CUBE_RTC_CALL_STATE_INSTANCE__ ?? new CallState()
      window.__CUBE_RTC_CALL_STATE_INSTANCE__ = this.instance
    }
    return this.instance;
  }
  // 自己的信息
  public selfUser: CallUser = new CallUser()

  /** 呼叫着 */
  public caller: CallUser = new CallUser()

  // 房间号
  public roomId: string = ''

  // 通话场景
  public scene: CallScene = CallScene.single

  // 通话类型
  public mediaType: CallMediaType = CallMediaType.none

  // 远端用户
  public remoteUserList: CallUser[] = []

  // 被邀请的用户
  public calledIdList: string[] = []
  public calledUserList: CallUser[] = []

  // 麦克风是否开启
  public isMicrophoneOpen = false;

  // 是否开启摄像头
  public isCameraOpen = false;

  // 扬声器是否开启
  public isSpeakerphoneOn = false;
  // 通话时长

  private constructor () {
    RTCCore.getInstance().registerEvent(Constants.RTC_EVENT.REMOTE_AUDIO_AVAILABLE, this.handleRemoteAudioAvailable)
    RTCCore.getInstance().registerEvent(Constants.RTC_EVENT.REMOTE_AUDIO_UNAVAILABLE, this.handleRemoteAudioUnavailable)
    RTCCore.getInstance().registerEvent(Constants.RTC_EVENT.REMOTE_VIDEO_AVAILABLE, this.handleRemoteVideoAvailable)
    RTCCore.getInstance().registerEvent(Constants.RTC_EVENT.REMOTE_VIDEO_UNAVAILABLE, this.handleRemoteVideoUnavailable)
  }

  /**
   * 设置自己的信息(todo: 具体将业务中的用户信息改为CallUser)
   * @param user
   */
  public setSelfUser = (user: Partial<CallUser>): void => {
    Object.assign(this.selfUser, user)
    RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.SET_STATE);
  }

  /**
   * 接听通话-数据状态变更
   */
  public onAccept = (): void => {
    if (CallStatus.waiting === CallState.instance.selfUser.callStatus) {
      CallState.instance.selfUser.callStatus = CallStatus.accept
    }
    RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.SET_STATE);
  }

  /**
   * 来电-数据状态变更
   */
  public onIncomingCall = (params: Record<string, any>): void => {
    const callerId = params['callingUser']
    const roomId = params['roomNumber']
    const calleeIds = params['members'] ?? []
    const callScene = params['callingType']
    const callMediaType = params['mediaType']
    if (this.roomId && this.selfUser.callStatus !== CallStatus.none) {
      // TODO 用户正在通话中-来电，弹窗提示用户 or 挂断当前通话
      throw new Error('用户正在通话中，挂断/拒绝新的来电')
    }
    this.caller.id = callerId
    this.calledIdList.push(...calleeIds)
    this.roomId = roomId
    this.scene = callScene
    this.mediaType = callMediaType
    this.selfUser.callStatus = CallStatus.waiting
    this.selfUser.callRole = CallRole.called
    if (callMediaType === CallMediaType.none || calleeIds.isEmpty) {
      return
    }
    // 验证邀请用户数据
    const allUserId = [callerId, ...calleeIds]
    for (const userId of allUserId) {
      if (userId === this.selfUser.id) {
        if (userId === callerId) {
          this.caller = this.selfUser
        } else {
          CallState.instance.calledUserList.push(this.selfUser)
        }
        continue
      }
      const user = new CallUser()
      user.id = userId
      if (userId === callerId) {
        user.callRole = CallRole.caller
        this.caller = user
      } else {
        this.calledUserList.push(user);
      }
    }
    // 验证远端用户数据
    if (this.caller.id && this.selfUser.id !== this.caller.id) {
      this.remoteUserList.push(this.caller)
    }
    for (const called of this.calledUserList) {
      if (this.selfUser.id === called.id) {
        continue;
      }
      CallState.instance.remoteUserList.push(called);
    }
    RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.SET_STATE);
  }

  /**
   * 远端用户加入房间
   * @param params
   */
  public onRemoteUserEnterRoom = (params: Record<string, any>): void => {
    const userId = params['member']
    let isExist = false
    for (const remoteUser of this.remoteUserList) {
      if (remoteUser.id === userId) {
        remoteUser.callStatus = CallStatus.accept;
        isExist = true;
        break;
      }
    }
    if (!isExist && this.selfUser.id !== userId) {
      const user = new CallUser();
      user.id = userId;
      user.callStatus = CallStatus.accept;
      user.callRole = CallRole.called;
      this.remoteUserList.push(user);
    }
    if (CallStatus.waiting === this.selfUser.callStatus) {
      CallingBellFeature.stopRing();
      this.selfUser.callStatus = CallStatus.accept;
    } else {
      if (CallScene.single === this.scene && this.remoteUserList.length > 1) {
        // 单呼=>多呼（单呼时邀请人员加入后，呼叫类型变为多呼）
        this.scene = CallScene.conference;
      }
    }
    RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.SET_STATE);
  }

  /**
   * 远端用户离开房间
   * @param params
   */
  public onRemoteUserLeaveRoom = (params: Record<string, any>): void => {
    const userId = params['member'];
    this.remoteUserList = this.remoteUserList.filter((user) => {
      return user.id !== userId
    })
    RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.SET_STATE);
  }

  /**
   * 远端用户拒绝加入房间
   * @param params
   */
  public onRemoteUserRefuseEnterRoom = (params: Record<string, any>): void => {
    const userId = params['member'];
    this.remoteUserList = this.remoteUserList.filter((user) => {
      return user.id !== userId
    })
    this.calledIdList = this.calledIdList.filter((id) => id !== userId);
    RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.SET_STATE);
  }

  /**
   * 被踢出房间
   * @param params
   */
  public onRemoteUserOutOfTheRoom = (params: Record<string, any>): void => {
    const userIds = params['members'] as string[] ;
    this.remoteUserList = this.remoteUserList.filter((user) => {
      return !userIds.includes(user.id!)
    })
    RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.SET_STATE);
  }

  /**
   * 清空数据状态
   */
  public cleanState = (): void => {
    this.selfUser.callRole = CallRole.none
    this.selfUser.callStatus = CallStatus.none
    this.selfUser.view = ''
    this.roomId = ''
    this.caller = new CallUser()
    this.remoteUserList = []
    this.calledUserList = []
    this.scene = CallScene.single
    this.mediaType = CallMediaType.none
    RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.SET_STATE);
  }

  /**
   * 处理远端用户音频状态变更-可用
   * @param params
   */
  private handleRemoteAudioAvailable = (params: Record<string, any>): void => {
    const targetUser = this.remoteUserList.find((user) => {
      return user.id === params.userId
    })
    if (targetUser) {
      targetUser.audioAvailable = true
    }
    RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.SET_STATE);
  }

  /**
   * 处理远端用户音频状态变更-不可用
   * @param params
   */
  private handleRemoteAudioUnavailable = (params: Record<string, any>): void => {
    const targetUser = this.remoteUserList.find((user) => {
      return user.id === params.userId
    })
    if (targetUser) {
      targetUser.audioAvailable = false
    }
    RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.SET_STATE);
  }

  /**
   * 处理远端用户视频状态变更-可用
   * @param params
   */
  private handleRemoteVideoAvailable = (params: Record<string, any>): void => {
    const targetUser = this.remoteUserList.find((user) => {
      return user.id === params.userId
    })
    if (targetUser) {
      targetUser.videoAvailable = true
    }
    RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.SET_STATE);
  }

  /**
   * 处理远端用户视频状态变更-不可用
   * @param params
   */
  private handleRemoteVideoUnavailable = (params: Record<string, any>): void => {
    const targetUser = this.remoteUserList.find((user) => {
      return user.id === params.userId
    })
    if (targetUser) {
      targetUser.videoAvailable = false
    }
    RTCCore.getInstance().notifyEvent(Constants.STATE_EVENT.SET_STATE);
  }

}