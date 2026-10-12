/**
 * RTC 平台类型枚举
 */
export enum RTCPlatformType {
  TENCENT = 'tencent',
}

// 腾讯云RTC参数类型
export namespace TencentRTCParams {
  // 进入房间参数
  export interface EnterRoomParams {
    roomId: string;
    userId: string;
    userSig: string;
  }

  // 开启本地摄像头参数
  export interface OpenLocalCameraParams {
    view: string | HTMLElement; // 视图ID或HTML元素
  }

  // 远端音频控制参数
  export interface RemoteAudioParams {
    userId: string; // 远端用户ID，'*'代表所有用户
  }

  // 远端视频控制参数
  export interface StartRemoteVideoParams {
    userId: string; // 远端用户ID
    view: string | HTMLElement; // 视图ID或HTML元素
    streamType?: 'main' | 'sub'; // 视频流类型，默认为main
  }

  // 停止远端视频参数
  export interface StopRemoteVideoParams {
    userId: string; // 远端用户ID，'*'代表所有用户
    streamType: 'main' | 'sub';
  }
}

// 未来可以添加其他平台的参数类型定义
// export namespace AnotherRTCParams {...}

/**
 * 根据平台类型获取对应的参数类型
 */
export type RTCParamsByPlatform<T extends RTCPlatformType, M extends keyof RTCMethodParams> =
  T extends RTCPlatformType.TENCENT ? RTCMethodParams[M]['tencent'] : never;

/**
 * 各方法对应的参数类型映射
 */
export interface RTCMethodParams {
  // 开启麦克风
  openMicrophone: {
    tencent: void; // 腾讯云无需参数
  };

  // 关闭麦克风
  closeMicrophone: {
    tencent: void; // 腾讯云无需参数
  };

  // 开启本地摄像头
  openLocalCamera: {
    tencent: TencentRTCParams.OpenLocalCameraParams;
  };

  // 关闭本地摄像头
  closeLocalCamera: {
    tencent: void; // 腾讯云无需参数
  };

  // 切换摄像头
  changeLocalCamera: {
    tencent: void; // 腾讯云无需参数
  };

  // 开启远端用户扬声器
  startRemoteAudio: {
    tencent: TencentRTCParams.RemoteAudioParams;
  };

  // 关闭远端用户扬声器
  stopRemoteAudio: {
    tencent: TencentRTCParams.RemoteAudioParams;
  };

  // 开启远端用户视频
  startRemoteVideo: {
    tencent: TencentRTCParams.StartRemoteVideoParams;
  };

  // 关闭远端用户视频
  stopRemoteVideo: {
    tencent: TencentRTCParams.StopRemoteVideoParams;
  };
}