interface Options {
  accessToken: string;
  tenant: number;
  terminal: string;
  subscribeType?: string;
}

interface MessageContent {
  msgType: string;
  eventDataDTO: unknown;
}

/** 正常端口重连 Code */
const CLOSE_NORMAL = 1000

export class GHMessage {
  private readonly options: Options
  private ws: WebSocket | undefined | null
  private healthIntervalMsg: string | number | NodeJS.Timeout | undefined
  private lockReconnect: boolean
  private callBack: ((messageContent: MessageContent) => void) | undefined

  public constructor (options: Options) {
    if (!options.accessToken) {
      throw new Error('消息通道初始化：accessToken错误')
    }
    if (typeof options.tenant === 'undefined') {
      throw new Error('消息通道初始化：tenant错误')
    }
    if (!options.terminal) {
      throw new Error('消息通道初始化：terminal错误')
    }
    this.lockReconnect = false
    this.options = options
    this.initWebSocket()
  }

  public onmessage (callBack: ((messageContent: MessageContent) => void) | undefined): void {
    callBack && (this.callBack = callBack)
    if (this.ws) {
      this.ws.onmessage = (e): void=> {
        const messageEvent = new CustomEvent('CubeMessageEvent', { detail: e })
        dispatchEvent(messageEvent)
        this.callBack?.(JSON.parse(e.data as unknown as string))
      }
    }
  }

  public dispose (): void {
    this.healthIntervalMsg && clearInterval(this.healthIntervalMsg)
    this.ws?.close(CLOSE_NORMAL)
    this.ws = null
  }

  private initWebSocket (): void {
    const options = this.options
    if (this.ws && this.ws.readyState === 1) {
      this.ws.close(CLOSE_NORMAL)
    }
    const websocketUrl = `${location.protocol === 'http:' ? 'ws' : 'wss'}://${location.host}/api/message2/websocket/msg`
    // const websocketUrl = 'ws://192.168.0.243:40201/api/message2/websocket/msg'
    const url = `${websocketUrl}?terminal=${options.terminal}&token=${options.accessToken}&tenant=${options.tenant}` + (options.subscribeType ? `&subscribeType=${options.subscribeType}` : '')
    this.ws = new WebSocket(url)
    this.ws.onopen = (): void => {
      this.openMsg()
    }
    this.ws.onerror = (): void=> {
      this.errorMsg()
    }
    this.ws.onclose = (e): void => {
      this.closeMsg(e)
    }

    // 如果已经存在回调函数则给新的ws对象设置消息回调
    this.callBack && this.onmessage(this.callBack)
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
        msgType: 'health',
        eventDataDTO: 'ping',
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
    }, 5000)
  }

  private closeMsg (e: { code: number; }): void {
    this.healthIntervalMsg && clearInterval(this.healthIntervalMsg)
    if (e.code !== CLOSE_NORMAL) {
      this.reconnect()
    }
  }

  private errorMsg (): void {
    this.healthIntervalMsg && clearInterval(this.healthIntervalMsg)
    this.reconnect()
  }
}
