import { RTCPlatformType } from '../rtc/rtc-types';

export class CallOptions {
  private rtcPlatform: RTCPlatformType;
  private rtcConfig: any;
  private userRoomEventSource: 'socket' | 'rtc';

  public constructor (builder: CallOptionsBuilder) {
    this.rtcPlatform = builder.getRTCPlatform();
    this.rtcConfig = builder.getRTCConfig();
    this.userRoomEventSource = builder.getUserRoomEventSource();
  }

  public static builder (): CallOptionsBuilder {
    return new CallOptionsBuilder();
  }

  /**
   * 获取 RTC 平台类型
   * @returns RTC 平台类型
   */
  public getRTCPlatform (): RTCPlatformType {
    return this.rtcPlatform
  }

  /**
   * 获取 RTC 配置
   * @returns RTC 配置
   */
  public getRTCConfig (): any {
    return this.rtcConfig;
  }

  /**
   * 获取用户进出房间监听方式
   * @returns 'socket' 或 'rtc'
   */
  public getUserRoomEventSource (): 'socket' | 'rtc' {
    return this.userRoomEventSource;
  }

  /**
   * 是否使用socket消息处理用户房间事件
   * @returns boolean
   */
  public isSocketUserRoomEvent (): boolean {
    return this.getUserRoomEventSource() === 'socket'
  }

}

class CallOptionsBuilder {
  private rtcPlatform: RTCPlatformType = RTCPlatformType.TENCENT;
  private rtcConfig?: any;
  private userRoomEventSource: 'socket' | 'rtc' = 'socket';

  public setRTCPlatform (rtcPlatform: RTCPlatformType): this {
    this.rtcPlatform = rtcPlatform;
    return this;
  }

  public getRTCPlatform (): RTCPlatformType {
    return this.rtcPlatform;
  }

  public setRTCConfig (rtcConfig: any): this {
    this.rtcConfig = rtcConfig;
    return this;
  }

  public getRTCConfig (): any {
    return this.rtcConfig;
  }

  public setUserRoomEventSource (userRoomEventSource: 'socket' | 'rtc'): this {
    this.userRoomEventSource = userRoomEventSource;
    return this;
  }

  public getUserRoomEventSource (): 'socket' | 'rtc' {
    return this.userRoomEventSource;
  }

  public build (): CallOptions {
    return new CallOptions(this);
  }

}