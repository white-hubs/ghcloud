export enum H5sPtzAction {
  zoomin = 'zoomin',
  zoomout = 'zoomout',
  stop = 'stop',
}

export class H5sService {
  public constructor (private readonly host: string, private readonly token: string, private readonly session: string) {}

  public async zoomin (): Promise<void> {
    await this.submitAction(H5sPtzAction.zoomin)
    await this.submitAction(H5sPtzAction.stop)
  }

  public async zoomout (): Promise<void> {
    await this.submitAction(H5sPtzAction.zoomout)
    await this.submitAction(H5sPtzAction.stop)
  }

  /**
   * 开始录像
   */
  public async manualRecordStart (): Promise<void> {
    const params = {
      token: this.token,
      limittime: 20,
      alwayscreate: false,
      session: this.session
    }
    await fetch(`//${this.host}/api/v1/ManualRecordStart?${this.toQueryString(params)}`, {
      method: 'POST',
      body: this.toFormData(params),
    })
  }

  /**
   * 结束录像
   */
  public async manualRecordStop (): Promise<void> {
    const params = {
      token: this.token,
      session: this.session
    }
    await fetch(`//${this.host}/api/v1/ManualRecordStop?${this.toQueryString(params)}`, {
      method: 'POST',
      body: this.toFormData(params),
    })
  }

  public async snapshot (): Promise<void> {
    const params = {
      token: this.token,
      session: this.session
    }
    await fetch(`//${this.host}/api/v1/Snapshot?${this.toQueryString(params)}`, {
      method: 'POST',
      body: this.toFormData(params),
    })
  }

  private async submitAction (action: H5sPtzAction): Promise<void> {
    const params = {
      token: this.token,
      session: this.session,
      action
    }
    await fetch(`//${this.host}/api/v1/Ptz?${this.toQueryString(params)}`, {
      method: 'POST',
      body: this.toFormData(params),
    })
  }

  private toQueryString (params: Record<string, unknown>): string {
    return Object.entries(params)
      .map(([k, v]) => {
        return `${k}=${v}`
      })
      .join('&')
  }

  private toFormData (params: Record<string, unknown>): FormData {
    const result = new FormData()
    Object.entries(params)
      .forEach(([k, v]) => {
        result.append(k, String(v))
      })
    return result
  }
}
