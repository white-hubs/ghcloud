export class WebSocketConnectMethod {
  private speechSocket: WebSocket | null
  private readonly msgHandle: (jsonMsg: { data: string; }) => void
  private readonly stateHandle: (connState: 'SUCCESS' | 'ERROR' | 'CLOSE') => void
  public constructor (config: { msgHandle: (jsonMsg: { data: string; }) => void; stateHandle: (connState: 'SUCCESS' | 'ERROR' | 'CLOSE') => void; }) {
    this.speechSocket = null
    this.msgHandle = config.msgHandle
    this.stateHandle = config.stateHandle
  }

  public wsStart (wssip: string): void {
    const Uri = wssip
    if (!Uri.match(/wss:\S*|ws:\S*/)) {
      throw new Error('请检查wss地址正确性')
    }

    if ('WebSocket' in window) {
      this.speechSocket = new WebSocket(Uri)
      this.speechSocket.onopen = (): void=> {
        this.stateHandle('SUCCESS')
      }
      this.speechSocket.onclose = this.onClose.bind(this)
      this.speechSocket.onmessage = this.onMessage.bind(this)
      this.speechSocket.onerror = this.onError.bind(this)
    } else {
      throw new Error('当前浏览器不支持 WebSocket')
    }
  }

  public wsStop (): void {
    if (this.speechSocket !== undefined) {
      this.speechSocket?.close()
    }
  }

  public wsSend (oneData: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (this.speechSocket === undefined) return
    if (this.speechSocket?.readyState === 1) { // WebSocket is open
      this.speechSocket.send(oneData)
    }
  }

  public beforeNewRecord (): void {
    const chunk_size = [5, 10, 5]
    const request = {
      chunk_size,
      wav_name: 'h5',
      is_speaking: true,
      chunk_interval: 10,
      itn: false,
      mode: '2pass',
      hotwords: '{"小安":60,"小安小安":80}'
    }
    this.speechSocket?.send(JSON.stringify(request))
  }

  public beforeEndRecord (sampleBuf: Int16Array): void {
    const chunk_size = [5, 10, 5]
    const request = {
      chunk_size,
      wav_name: 'h5',
      is_speaking: false,
      chunk_interval: 10,
      mode: '2pass',
    }
    if (sampleBuf.length > 0) {
      this.wsSend(sampleBuf)
    }
    this.wsSend(JSON.stringify(request))
  }

  public onClose (): void {
    this.stateHandle('CLOSE')
  }

  public onMessage (e: { data: string; }): void {
    this.msgHandle(e)
  }

  public onError (e: unknown): void {
    this.stateHandle('ERROR')
  }

  public getSocketState (): number {
    return this.speechSocket?.readyState ?? 3
  }
}
