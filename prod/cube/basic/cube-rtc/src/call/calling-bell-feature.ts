import { CallRole } from "../data/call-define";
import { CallState } from "./call-state";

/** 通话铃声（MinIO） */
const incoming = "/resource/v1/audio/incoming_music.mp3";
const outgoing = "/resource/v1/audio/make_calling.mp3";
const hangup = "/resource/v1/audio/refuse_calling.mp3";

/**
 * 音频类型枚举
 */
enum AudioType {
  INCOMING = "incoming",
  OUTGOING = "outgoing",
  HANGUP = "hangup",
}

/**
 * 通话铃声功能类
 * 负责管理通话过程中的各种音频播放
 */
export class CallingBellFeature {
  // 音频元素
  private static audioElement: HTMLAudioElement | null = null;

  // 是否已初始化
  private static isInitialized = false;

  // 默认音量
  private static volume = 1.0;

  // 音频资源映射
  private static readonly audioResources = {
    [AudioType.INCOMING]: incoming,
    [AudioType.OUTGOING]: outgoing,
    [AudioType.HANGUP]: hangup,
  };

  /**
   * 初始化音频系统
   */
  public static initialize = (): void => {
    if (this.isInitialized) return;
    this.audioElement = new Audio();
    this.audioElement.preload = "auto";
    this.audioElement.volume = this.volume;
    // 预加载所有音频资源
    this.preloadAudios();
    this.isInitialized = true;
  };

  /**
   * 设置音量
   * @param volume 音量值 (0.0 - 1.0)
   */
  public static setVolume = (volume: number): void => {
    this.volume = Math.max(0, Math.min(1, volume));

    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
  };

  /**
   * 开始铃声
   */
  public static startRing = (): void => {
    this.initialize();
    if (CallRole.caller === CallState.getInstance().selfUser.callRole) {
      this.startDiaLing();
    } else {
      this.startRingIng();
    }
  };

  /**
   * 来电铃声
   */
  public static startRingIng = (): void => {
    this.playAudio(AudioType.INCOMING, true);
  };

  /**
   * 去电铃声
   */
  public static startDiaLing = (): void => {
    this.playAudio(AudioType.OUTGOING, true);
  };

  /**
   * 挂断铃声
   */
  public static startHangUp = (): void => {
    this.playAudio(AudioType.HANGUP, false);
  };

  /**
   * 停止铃声
   */
  public static stopRing = (): void => {
    if (!this.audioElement) return;

    try {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;

      // 移除可能存在的事件监听器
      this.audioElement.onended = null;
    } catch (error) {
      throw new Error("停止音频失败:", { cause: error });
    }
  };

  /**
   * 释放资源
   */
  public static dispose = (): void => {
    this.stopRing();
    this.audioElement = null;
    this.isInitialized = false;
  };

  /**
   * 预加载所有音频资源
   */
  private static preloadAudios = (): void => {
    // 创建临时音频元素预加载资源
    Object.values(this.audioResources).forEach((src) => {
      const tempAudio = new Audio();
      tempAudio.src = src;
      // 只加载元数据，不播放
      tempAudio.preload = "metadata";
      tempAudio.load();
    });
  };

  /**
   * 播放音频
   * @param type 音频类型
   * @param loop 是否循环播放
   */
  private static playAudio = (type: AudioType, loop: boolean): void => {
    if (!this.isInitialized) {
      this.initialize();
    }

    // 先停止当前可能正在播放的音频
    this.stopRing();

    if (!this.audioElement) return;

    try {
      const src = this.audioResources[type];
      this.audioElement.src = src;
      this.audioElement.loop = loop;
      this.audioElement.volume = this.volume;

      // 如果不循环播放，添加结束事件监听器
      if (!loop) {
        this.audioElement.onended = (): void => {
          this.stopRing();
        };
      }

      // 尝试播放音频
      const playPromise = this.audioElement.play();
      // 处理可能的播放错误
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // 处理自动播放策略导致的错误
          if (error.name === "NotAllowedError") {
          } else {
          }
        });
      }
    } catch (error) {
    }
  };
}
