
/** 正常端口重连 Code */
const CLOSE_NORMAL = 1000

export class GHMessage {
  options;
  ws;
  healthIntervalMsg;
  lockReconnect;

  constructor(options) {
    if (!options.accessToken) {
      throw new Error('消息通道初始化：accessToken错误')
    }
    if (!options.tenant) {
      throw new Error('消息通道初始化：tenant错误')
    }
    if (!options.terminal) {
      throw new Error('消息通道初始化：terminal错误')
    }
    this.lockReconnect = false
    this.options = options
    this.initWebSocket()
  }

  onmessage(callBack) {
    if (this.ws) {
      this.ws.onmessage = (e) => {
        const messageEvent = new CustomEvent('CubeMessageEvent', { detail: e })
        dispatchEvent(messageEvent)
        callBack?.(JSON.parse(e.data))
      }
    }
  }

  dispose() {
    this.healthIntervalMsg && clearInterval(this.healthIntervalMsg)
    this.ws?.close(CLOSE_NORMAL)
    this.ws = null
  }

  initWebSocket() {
    const options = this.options
    if (this.ws && this.ws.readyState === 1) {
      this.ws.close(CLOSE_NORMAL)
    }
    const websoketUrl = `${location.protocol === 'http:' ? 'ws' : 'wss'}://${location.host}/api/message2/websocket/msg`
    const url = `${websoketUrl}?terminal=${options.terminal}&token=${options.accessToken}&tenant=${options.tenant}` + (options.subscribeType ? `&subscribeType=${options.subscribeType}` : '')
    this.ws = new WebSocket(url)
    this.ws.onopen = () => { this.openMsg() }
    this.ws.onerror = () => { this.errorMsg() }
    this.ws.onclose = (e) => { this.closeMsg(e) }
  }

  openMsg() {
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

  reconnect() {
    if (this.ws && this.ws.readyState === 0) { // 正在连接中
      return
    }
    if (this.lockReconnect) return
    this.lockReconnect = true
    setTimeout(() => { this.initWebSocket(); this.lockReconnect = false }, 5000)
  }

  closeMsg(e) {
    this.healthIntervalMsg && clearInterval(this.healthIntervalMsg)
    if (e.code !== CLOSE_NORMAL) {
      this.reconnect()
    }
  }

  errorMsg() {
    this.healthIntervalMsg && clearInterval(this.healthIntervalMsg)
    this.reconnect()
  }
}
