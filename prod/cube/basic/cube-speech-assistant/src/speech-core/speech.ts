import { WebSocketConnectMethod } from "./speech-websocket-connect-method";
import Recorder from "recorder-core";
import "recorder-core/src/engine/pcm";
import "recorder-core/src/extensions/waveview";

export interface SpeechAssistantResponse {
  text: string;
  mode: "2pass-online" | "2pass-offline";
  timestamp?: string;
  isAwakenCommand: boolean;
}

/** 语音助手核心 */
export class SpeechAssistantCore {
  public msgCallBack: ((msg: SpeechAssistantResponse) => void) | null = null;
  public stateCallBack: ((connState: "SUCCESS" | "ERROR" | "CLOSE") => void) | null = null;
  public powerCallBack: ((powerLevel: number) => void) | null = null;
  public readonly hotWords: string = "小安";
  private recorder: any;
  private readonly wssip: string;
  private readonly wsConnecter;
  private sampleBuf = new Int16Array();
  private sendBuf = new Int16Array();
  private wave = {
    input: (..._args: unknown[]): void => {
      // do noting
    },
  };

  public constructor(wssip: string) {
    this.wssip = wssip;
    this.wsConnecter = new WebSocketConnectMethod({
      msgHandle: (jsonMsg: { data: string }): void => {
        const jsonObject = JSON.parse(jsonMsg.data) as SpeechAssistantResponse;
        jsonObject.text = jsonObject.text.replace(/[^\u4e00-\u9fff]/g, "");
        this.msgCallBack?.(jsonObject);
      },
      stateHandle: (connState: "SUCCESS" | "ERROR" | "CLOSE"): void => {
        this.stateCallBack?.(connState);
      },
    });
  }

  public connect(): void {
    this.wsConnecter.wsStart(this.wssip);
  }

  public async startRecord(): Promise<void> {
    const socketStatus = this.wsConnecter.getSocketState();
    if (socketStatus !== 1) {
      throw new Error("语音服务不可用");
    }
    // let inputDeviceInfo: InputDeviceInfo | null = null
    // await navigator.mediaDevices.enumerateDevices()
    //   .then(devices => {
    //     const inputDevice = devices.filter(e => e.kind === 'audioinput' && e.deviceId !== 'default') as InputDeviceInfo[]
    //     if (inputDevice.length) {
    //       inputDeviceInfo = inputDevice[0]
    //     }
    //   })
    //   .catch(error => {
    //     (function(){})('Error enumerating devices:', error)
    //   })
    this.wsConnecter.beforeNewRecord();
    this.recorder = new Recorder({
      type: "pcm",
      bitRate: 16,
      sampleRate: 16000,
      audioTrackSet: {
        // deviceId: inputDeviceInfo ? (inputDeviceInfo as InputDeviceInfo).deviceId : '',
        // groupId: inputDeviceInfo ? (inputDeviceInfo as InputDeviceInfo).groupId : '',
        echoCancellation: true, // 回声消除（AEC）开关，不设置时由浏览器控制（一般为默认自动打开），设为true明确打开，设为false明确关闭
        noiseSuppression: true, // 降噪（ANS）开关，取值和回声消除开关一样
        autoGainControl: false, // 自动增益（AGC）开关，取值和回声消除开关一样
      },
      onProcess: (
        buffers: Int16Array[],
        powerLevel: number,
        _bufferDuration: unknown,
        bufferSampleRate: unknown,
        _newBufferIdx: unknown,
        _asyncEnd: unknown,
      ): void => {
        this.wave.input(buffers[buffers.length - 1], powerLevel, bufferSampleRate); // 输入音频数据，更新显示波形
        const data_48k = buffers[buffers.length - 1];
        const array_48k = [data_48k];
        const data_16k = Recorder.SampleData(array_48k, bufferSampleRate, 16000).data;
        this.sampleBuf = Int16Array.from([...this.sampleBuf, ...data_16k]);
        const chunk_size = 960;
        this.powerCallBack && this.powerCallBack(powerLevel);
        while (this.sampleBuf.length >= chunk_size) {
          this.sendBuf = this.sampleBuf.slice(0, chunk_size);
          this.sampleBuf = this.sampleBuf.slice(chunk_size, this.sampleBuf.length);
          this.wsConnecter.wsSend(this.sendBuf);
        }
      },
    });
    return new Promise((resolve) => {
      this.recorder.open(() => {
        this.recorder.start();
        resolve();
      });
    });
  }

  public async stopRecord(): Promise<void> {
    this.wsConnecter.beforeEndRecord(this.sampleBuf);
    this.sampleBuf = new Int16Array();
    this.recorder.stop();
    this.recorder = null;
    Recorder.Destroy();
  }

  public createWaveView(domSelector: string): void {
    this.wave = Recorder.WaveView({ elem: domSelector });
  }
}
