import TRTC from "trtc-sdk-v5";
import type { TRTCStreamType } from "trtc-sdk-v5";

import { RTCCore } from "../core/rtc-core";
import { Constants } from "../data/constants";
import { AbsRTC } from "./abs-rtc";

export class TencentRTC extends AbsRTC {
  private sdkAppId: number;
  private trtc: TRTC | null = null;

  public constructor(sdkAppId?: number) {
    super();
    this.sdkAppId = sdkAppId ?? 0;
  }

  public override initRTC(): void {}
  public override async startCall(params?: any): Promise<void> {
    this.enterRoom(params);
  }
  public override async endCall(): Promise<void> {
    await this.exitRoom();
  }
  public override async hangUp(): Promise<void> {
    await this.exitRoom();
  }
  public override async accept(params: any): Promise<void> {
    this.enterRoom(params);
  }
  public override async reject(): Promise<void> {
    await this.exitRoom();
  }
  public override async openMicrophone(): Promise<void> {
    // 如果没声音或画面，确认下 trtc 是否创建成功
    await this.trtc?.startLocalAudio();
  }
  public override async closeMicrophone(): Promise<void> {
    await this.trtc?.stopLocalAudio();
  }
  public override async openLocalCamera(params: { view: string | HTMLElement }): Promise<void> {
    const cameraList = await TRTC.getCameraList();
    if (cameraList[0]) {
      const config = {
        view: params.view,
        option: {
          cameraId: cameraList[0].deviceId,
        },
      };
      await this.trtc?.startLocalVideo(config);
    }
  }
  public override async closeLocalCamera(): Promise<void> {
    await this.trtc?.stopLocalVideo();
  }
  public override async changeLocalCamera(): Promise<void> {
    const cameraList = await TRTC.getCameraList();
    if (cameraList.length > 1 && cameraList[1]) {
      const config = {
        option: {
          cameraId: cameraList[1].deviceId,
        },
      };
      await this.trtc?.updateLocalVideo(config);
    }
  }
  public override async startRemoteAudio(params: { userId: string }): Promise<void> {
    await this.trtc?.muteRemoteAudio(params.userId, false);
  }
  public override async stopRemoteAudio(params: { userId: string }): Promise<void> {
    await this.trtc?.muteRemoteAudio(params.userId, true);
  }
  public override async startRemoteVideo(params: {
    userId: string;
    view: string | HTMLElement;
    streamType?: "main" | "sub";
  }): Promise<void> {
    await this.trtc?.startRemoteVideo({
      userId: params.userId,
      view: params.view,
      streamType: (params?.streamType ?? "main") as TRTCStreamType,
    });
  }
  public override async stopRemoteVideo(params: { userId: string }): Promise<void> {
    // userId，'*'代表所有用户
    await this.trtc?.stopRemoteVideo({ userId: params.userId });
  }
  public override destroy(): void {
    this.trtc?.destroy();
    this.trtc = null;
  }

  private enterRoom = async (params: { roomId: string; userId: string; userSig: string }): Promise<void> => {
    if (!this.trtc) {
      this.trtc = TRTC.create();
      this.addListener();
    }
    if (!this.sdkAppId) {
      return;
    }
    this.trtc.startLocalAudio();
    await this.trtc?.enterRoom({
      sdkAppId: this.sdkAppId,
      userId: params.userId,
      userSig: params.userSig,
      strRoomId: params.roomId,
    });
  };

  private exitRoom = async (): Promise<void> => {
    await this.trtc?.exitRoom();
  };

  private addListener = (): void => {
    this.trtc?.on(TRTC.EVENT.ERROR, (err) => {
      RTCCore.getInstance().notifyEvent(Constants.RTC_EVENT.ERROR, err);
    });
    this.trtc?.on(TRTC.EVENT.REMOTE_USER_ENTER, (event) => {
      RTCCore.getInstance().notifyEvent(Constants.RTC_EVENT.REMOTE_USER_ENTER, event);
    });
    this.trtc?.on(TRTC.EVENT.REMOTE_USER_EXIT, (event) => {
      RTCCore.getInstance().notifyEvent(Constants.RTC_EVENT.REMOTE_USER_EXIT, event);
    });
    this.trtc?.on(TRTC.EVENT.REMOTE_AUDIO_AVAILABLE, (event) => {
      RTCCore.getInstance().notifyEvent(Constants.RTC_EVENT.REMOTE_AUDIO_AVAILABLE, event);
    });
    this.trtc?.on(TRTC.EVENT.REMOTE_AUDIO_UNAVAILABLE, (event) => {
      RTCCore.getInstance().notifyEvent(Constants.RTC_EVENT.REMOTE_AUDIO_UNAVAILABLE, event);
    });
    this.trtc?.on(TRTC.EVENT.REMOTE_VIDEO_AVAILABLE, (event) => {
      RTCCore.getInstance().notifyEvent(Constants.RTC_EVENT.REMOTE_VIDEO_AVAILABLE, event);
    });
    this.trtc?.on(TRTC.EVENT.REMOTE_VIDEO_UNAVAILABLE, (event) => {
      RTCCore.getInstance().notifyEvent(Constants.RTC_EVENT.REMOTE_VIDEO_UNAVAILABLE, event);
    });
  };
}
