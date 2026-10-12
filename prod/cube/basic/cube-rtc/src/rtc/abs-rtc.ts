import type { RTCPlatformType } from './rtc-types';
import type { RTCParamsByPlatform } from './rtc-types'

export abstract class AbsRTC {
  public abstract initRTC (): void;
  public abstract startCall (params?: any): Promise<void>;
  public abstract endCall (params?: any): Promise<void>;
  public abstract hangUp (params?: any): Promise<void>;
  public abstract accept (params?: any): Promise<void>;
  public abstract reject (params?: any): Promise<void>;

  public abstract openMicrophone<T extends RTCPlatformType>(
    params?: RTCParamsByPlatform<T, 'openMicrophone'>
  ): Promise<void>;

  public abstract closeMicrophone<T extends RTCPlatformType>(
    params?: RTCParamsByPlatform<T, 'closeMicrophone'>
  ): Promise<void>;

  public abstract openLocalCamera<T extends RTCPlatformType>(
    params: RTCParamsByPlatform<T, 'openLocalCamera'>
  ): Promise<void>;

  public abstract closeLocalCamera<T extends RTCPlatformType>(
    params?: RTCParamsByPlatform<T, 'closeLocalCamera'>
  ): Promise<void>;

  public abstract changeLocalCamera<T extends RTCPlatformType>(
    params?: RTCParamsByPlatform<T, 'changeLocalCamera'>
  ): Promise<void>;

  public abstract startRemoteAudio<T extends RTCPlatformType>(
    params: RTCParamsByPlatform<T, 'startRemoteAudio'>
  ): Promise<void>;

  public abstract stopRemoteAudio<T extends RTCPlatformType>(
    params: RTCParamsByPlatform<T, 'stopRemoteAudio'>
  ): Promise<void>;

  public abstract startRemoteVideo<T extends RTCPlatformType>(
    params: RTCParamsByPlatform<T, 'startRemoteVideo'>
  ): Promise<void>;

  public abstract stopRemoteVideo<T extends RTCPlatformType>(
    params: RTCParamsByPlatform<T, 'stopRemoteVideo'>
  ): Promise<void>;

  public abstract destroy (): void;
}