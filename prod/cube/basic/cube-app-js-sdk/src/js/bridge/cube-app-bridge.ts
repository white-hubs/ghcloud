import { getEnvironment } from '../cube-h5-config'
import { type CubeH5Bridge, getCubeH5Bridge } from './cube-h5-bridge'

export interface CubeAppBridge {
  call: <T, D = unknown>(api: string, data: D) => Promise<T>;
}

/** 向APP 发送消息 */
class CubeAppBridgeImpl implements CubeAppBridge {
  private callbackIdCounter = 0

  public constructor (private readonly cubeH5Bridge: CubeH5Bridge) {}

  public async call <T, D> (api: string, data: D): Promise<T> {
    if (getEnvironment() !== 'cubeApp') {
      throw new Error('不在 cube-app 环境')
    }
    const callbackId = this.genCallbackId()
    const message: CubeBridgeMessage = {
      api,
      data: typeof data === 'object' ? JSON.stringify(data) : (data as string),
      callbackId,
    }
    window.cubeAppBridge?.postMessage(JSON.stringify(message))
    return this.cubeH5Bridge.receiveMessage(callbackId)
  }

  private genCallbackId (): string {
    this.callbackIdCounter++
    return `${this.callbackIdCounter}`
  }
}

export const cubeAppBridge = new CubeAppBridgeImpl(getCubeH5Bridge())
