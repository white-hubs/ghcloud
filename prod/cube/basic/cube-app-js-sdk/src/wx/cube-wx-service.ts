import wx from 'weixin-js-sdk'

export class CubeWxService {
  private static readonly cubeWxService = new CubeWxService()
  public static getInstance (): CubeWxService {
    return this.cubeWxService
  }

  /** 是否处于微信小程序环境下 */
  public async getWxEnv (): Promise<boolean> {
    return new Promise((resolve) => {
      wx.miniProgram.getEnv((res: { miniprogram: boolean; }) => {
        if (res.miniprogram) {
          resolve(true)
        } else {
          resolve(false)
        }
      })
      if (window?.__wxjs_environment) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }

  /**
   * 跳转小程序桥页，由原生调用 wx.getLocation（uni.getLocation）获取经纬度，再通过 web-view URL 回传给 H5。
   * H5 侧请配合 useMpLocation / 读取路由参数 mpLocationResult。
   */
  public requestMiniProgramLocation (): void {
    const bridgeParams = {
      action: 'getLocation',
      params: {},
      returnPage: '/pages/device/device',
    }
    wx.miniProgram.navigateTo({
      url: `/pages/bridge-page/bridge-page?params=${encodeURIComponent(JSON.stringify(bridgeParams))}`,
    })
  }

  // 新增：调用小程序扫码功能
  public async scanCode (param: {
    scanType: string[];
    path: string;
    query?: string;
  }): Promise<{ success: boolean; rawData?: string; result?: string; error?: unknown }> {
    return new Promise((resolve) => {
      param.query = param.query || ''
      param.scanType = param.scanType || ['qrCode']
      const bridgeParams = {
        action: 'scanCode',
        params: param,
        returnPage: '/pages/web-page/web-page'
      }
      wx.miniProgram.navigateTo({
        url: `/pages/bridge-page/bridge-page?params=${encodeURIComponent(JSON.stringify(bridgeParams))}`
      })
    })
  }
  
  // 新增：向小程序发送导航请求
  public async navigateTo (url: string): Promise<void> {
    this.postMessage({
      action: 'navigateTo',
      url
    })
  }
  
  // 新增：向小程序发送H5页面跳转请求
  public async navigateToH5 (url: string): Promise<void> {
    this.postMessage({
      action: 'navigateToH5',
      url
    })
  }
  
  // 发送消息给微信小程序
  public async postMessage (data?: Record<string, unknown>, autoNavigateBack: boolean = true): Promise<void> {
    if (autoNavigateBack) {
      wx.miniProgram.navigateBack({delta: 1})
    }
    wx.miniProgram.postMessage({ data })
  }

  // 返回微信端小程序页面
  public async backHome (url: string = '/pages/index/index'): Promise<void> {
    wx.miniProgram.switchTab({ url })
  }
  
}

export const cubeWxServiceInstance = CubeWxService.getInstance()
