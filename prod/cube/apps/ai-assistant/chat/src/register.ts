
interface RegisterOptions {
  entry?: string;
  containerDom: HTMLElement;
}

export enum PostMessageEvent {
  CLOSE = 'cube-ai-assistant-close',
  MINIMIZE = 'cube-ai-assistant-minimize',
  MAXIMIZE = 'cube-ai-assistant-maximize',
  ONLOAD = 'cube-ai-assistant-onload',
  COMMAND = 'cube-ai-assistant-command',
  COMMAND_EXECUTE_RESULT = 'cube-ai-assistant-command-execute-result',
  SUBMIT_MESSAGE = 'cube-ai-assistant-submit-message',
  AI_RESPONSE = 'cube-ai-assistant-ai-response',
  AI_THINKING = 'cube-ai-assistant-ai-thinking',
  SET_INPUT_REAL_TIME = 'cube-ai-assistant-set-input-real-time',
  VOICE_ENABLE = 'cube-ai-assistant-voice-enable'
}

export interface Command {
  callbackId: string;
  action: string;
  params: {
    value: unknown;
  };
}

export interface CommandExecuteResult {
  callbackId: string;
  result: 'success' | 'fail';
  message?: string;
  data?: unknown;
}

export class CubeAIAssistant {
  private iframeDom: HTMLIFrameElement | null = null
  private readonly modalOptions: RegisterOptions | null = null
  private handleClose: (() => void) | null = null
  private handleMinimize: (() => void) | null = null
  private handleMaximize: (() => void) | null = null
  private handleOnLoad: (() => void) | null = null
  private handleAIResponse: ((data: string) => void) | null = null
  private handleAIThinking: ((data: string) => void) | null = null
  private handleVoiceEnable: ((data: boolean) => void) | null = null

  /** 弹窗初始化 */
  public constructor (options: RegisterOptions) {
    this.modalOptions = options
    // 创建一个新的div元素
    this.iframeDom = document.createElement('iframe')
    this.iframeDom.src = this.modalOptions?.entry ?? '/apps/@ghcloud/cube-ai-assistant-chat'
    this.iframeDom.className = 'cube-ai-assistant-container'
    this.iframeDom.style.width = '100%'
    this.iframeDom.style.height = '100%'
    this.iframeDom.style.border = 'none'
    this.iframeDom.allowFullscreen = true
    this.iframeDom.allow = 'autoplay'
    options.containerDom.appendChild(this.iframeDom)
    window.addEventListener('message', this.message.bind(this))
  }

  /** 弹窗卸载 */
  public dispose (): void {
    if (this.iframeDom) {
      document.body.removeChild(this.iframeDom)
      this.iframeDom = null
    }
    window.removeEventListener('message', this.message.bind(this))
  }

  /** 关闭事件回调 */
  public onClose (callBack: (() => void)): void {
    this.handleClose = callBack
  }

  public onMinimize (callBack: (() => void)): void {
    this.handleMinimize = callBack
  }

  public onMaximize (callBack: (() => void)): void {
    this.handleMaximize = callBack
  }

  public onLoad (callBack: (() => void)): void {
    this.handleOnLoad = callBack
  }

  public onAIResponse (callBack: ((data: string) => void)): void {
    this.handleAIResponse = callBack
  }

  public onAIThinking (callBack: ((data: string) => void)): void {
    this.handleAIThinking = callBack
  }

  public onVoiceEnable (callBack: ((data: boolean) => void)): void {
    this.handleVoiceEnable = callBack
  }

  public message (event: { data: { type: PostMessageEvent; data: unknown; }; }): void {
    if (!this.iframeDom) {
      return
    }
    const msgType = event.data.type
    if (msgType === PostMessageEvent.CLOSE) {
      this.handleClose && this.handleClose()
    }
    if (msgType === PostMessageEvent.MINIMIZE) {
      this.handleMinimize && this.handleMinimize()
    }
    if (msgType === PostMessageEvent.MAXIMIZE) {
      this.handleMaximize && this.handleMaximize()
    }
    if (msgType === PostMessageEvent.ONLOAD) {
      this.handleOnLoad && this.handleOnLoad()
    }
    if (msgType === PostMessageEvent.AI_RESPONSE) {
      this.handleAIResponse && this.handleAIResponse(event.data.data as string)
    }
    if (msgType === PostMessageEvent.AI_THINKING) {
      this.handleAIThinking && this.handleAIThinking(event.data.data as string)
    }
    if (msgType === PostMessageEvent.VOICE_ENABLE) {
      this.handleVoiceEnable && this.handleVoiceEnable(event.data.data as boolean)
    }
  }

  public commandExecuteResult (result: CommandExecuteResult): void {
    this.iframeDom?.contentWindow?.postMessage({ type: PostMessageEvent.COMMAND_EXECUTE_RESULT, data: result }, '*')
  }

  public submitMessage (message: string): void {
    this.iframeDom?.contentWindow?.postMessage({ type: PostMessageEvent.SUBMIT_MESSAGE, data: message }, '*')
  }

  public setInputRealTime (message: string): void {
    this.iframeDom?.contentWindow?.postMessage({ type: PostMessageEvent.SET_INPUT_REAL_TIME, data: message }, '*')
  }
}
