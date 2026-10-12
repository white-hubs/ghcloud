interface Options {
  accessToken: string;
  tenant: number;
  terminal: string;
  subscribeType?: string;
  url?: string;
}

export interface MessageContent {
  msgType: string;
  msgContent?: unknown | null;
  msgHeader?: unknown | null;
  msg: string;
  level?: string | null;
  expireTime?: number | undefined;
  nowTime?: string | undefined;
}

/** 正常端口重连 Code */
const CLOSENORMAL = 1000

export class WSMessage {
  private readonly options: Options
  private ws: WebSocket | undefined | null
  private healthIntervalMsg: string | number | NodeJS.Timeout | undefined
  private lockReconnect: boolean

  public constructor (options: Options) {
    this.lockReconnect = false
    this.options = options
    this.initWebSocket()
  }

  public onmessage (callBack: ((messageContent: MessageContent) => void) | undefined): void {
    if (this.ws) {
      this.ws.onmessage = (e): void => {
        const messageEvent = new CustomEvent('CubeMessageEvent', { detail: e })
        dispatchEvent(messageEvent)
        callBack?.(JSON.parse(e.data as unknown as string))
      }
    }
  }

  public onsend (message: string): void {
    try {
      if (this.ws) {
        this.ws?.send(message)
      }
    } catch {
      this.reconnect()
    }
  }

  public dispose (): void {
    this.healthIntervalMsg && clearInterval(this.healthIntervalMsg)
    this.ws?.close(CLOSENORMAL)
    this.ws = null
  }

  private initWebSocket (): void {
    if (this.ws && this.ws.readyState === 1) {
      this.ws.close(CLOSENORMAL)
    }

    const env = (import.meta as unknown as { env: { VITEWSURL: string; MODE: string; }; }).env
    const websocketUrl = ['development', 'dev'].includes(env.MODE) ? env.VITEWSURL : `ws://${location.host}/ws`

    this.ws = new WebSocket(websocketUrl)
    this.ws.onopen = (): void => {
      this.openMsg()
    }
    this.ws.onerror = (): void => {
      this.errorMsg()
    }
    this.ws.onclose = (e): void => {
      this.closeMsg(e)
    }
  }

  private openMsg (): void {
    this.healthIntervalMsg && clearInterval(this.healthIntervalMsg)
    // 定时器判断连接状态
    this.healthIntervalMsg = setInterval(() => {
      // 未连接
      if (this.ws?.readyState === 3) {
        return
      }
      const health = {
        msgType: 'heartBeat',
        ts: new Date().getTime()
      }
      this.ws?.send(JSON.stringify(health))
    }, 1000 * 10)
  }

  private reconnect (): void {
    if (this.ws && this.ws.readyState === 0) { // 正在连接中
      return
    }
    if (this.lockReconnect) return
    this.lockReconnect = true
    setTimeout(() => {
      this.initWebSocket(); this.lockReconnect = false
    }, 500000)
  }

  private closeMsg (e: { code: number; }): void {
    this.healthIntervalMsg && clearInterval(this.healthIntervalMsg)
    if (e.code !== CLOSENORMAL) {
      this.reconnect()
    }
  }

  private errorMsg (): void {
    this.healthIntervalMsg && clearInterval(this.healthIntervalMsg)
    this.reconnect()
  }
}
