import { SpeechAssistantCore, type SpeechAssistantResponse } from './speech'

// const KEYWORDS = ['显示', '隐藏', '切换', '请', '打开', '关闭', '展示', '输入', '帮', '开启']
export class CubeSpeechAI {
  private static instance: CubeSpeechAI
  public static getInstance (): CubeSpeechAI {
    if (!CubeSpeechAI.instance) {
      CubeSpeechAI.instance = new CubeSpeechAI()
    }
    return CubeSpeechAI.instance
  }

  public commandCallBack?: (command: unknown) => Promise<void>
  public onSpeakEndCallBack?: (text: string) => Promise<void>
  public onSpeakingCallBack?: (text: string) => Promise<void>
  public statesCallBack?: (state: {
    connectStatus: boolean;
    powerLevel: number;
  }) => void

  private readonly speechAssistant: SpeechAssistantCore
  /** 语音助手连接状态 */
  private _connectStatus: boolean = false
  private _powerLevel = 0
  private maxPowerLevel = 0
  private speakText = ''

  private get connectStatus (): boolean {
    return this._connectStatus
  }

  private set connectStatus (status: boolean) {
    this._connectStatus = status
    this.emitStates()
  }

  private get powerLevel (): number {
    return this._powerLevel
  }

  private set powerLevel (value: number) {
    this._powerLevel = value
    this.emitStates()
  }

  private constructor () {
    // 语音助手初始化
    this.speechAssistant = new SpeechAssistantCore('wss://cube-asr.guhecloud.com:30000/dc')
    this.speechAssistant.msgCallBack = (response: SpeechAssistantResponse): void => {
      if (this.maxPowerLevel < 10) {
        return
      }
      if (response.mode === '2pass-online') {
        this.speakText += response.text
        this.speakText && this.onSpeakingCallBack?.(this.speakText)
      }
      if (response.mode === '2pass-offline') {
        this.maxPowerLevel = 0
        this.speakText = ''
        this.onSpeakEndCallBack?.(response.text)
      }
    }
    this.speechAssistant.powerCallBack = (level: number): void => {
      this.powerLevel = level
      if (level > this.maxPowerLevel) {
        this.maxPowerLevel = level
      }
    }
    this.speechAssistant.stateCallBack = (connState: 'SUCCESS' | 'ERROR' | 'CLOSE'): void => {
      this.connectStatus = connState === 'SUCCESS'
      switch (connState) {
        case 'SUCCESS':
          this.connectStatus = true
          break
        case 'ERROR':
          this.connectStatus = false
          break
        case 'CLOSE':
          this.connectStatus = false
          break
      }
    }
  }

  public getInstance (): CubeSpeechAI {
    return CubeSpeechAI.getInstance()
  }

  public createWaveView (domSelector: string): void {
    this.speechAssistant.createWaveView(domSelector)
  }

  public connectService (): void {
    this.speechAssistant.connect()
  }

  /** 开启语音拾取 */
  public async startRecord (): Promise<void> {
    this.maxPowerLevel = 0
    this.speakText = ''
    await this.speechAssistant.startRecord()
  }

  public async stopRecord (): Promise<void> {
    await this.speechAssistant.stopRecord()
  }

  /** 状态派发 */
  private emitStates (): void {
    this.statesCallBack?.({
      connectStatus: this.connectStatus,
      powerLevel: this.powerLevel,
    })
  }
}
