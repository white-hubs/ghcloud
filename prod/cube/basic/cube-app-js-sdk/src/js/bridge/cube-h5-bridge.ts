export interface CubeH5Bridge {
  receiveMessage: <T>(callbackId: string) => Promise<T>;
}
type ReceiveHandler = (message: string) => void
/** H5 接收消息 */
class CubeH5BridgeImpl implements CubeH5Bridge {
  private readonly callers = new Map<string, ReceiveHandler>()
  public constructor () {
    window.cubeH5Bridge = {
      receiveMessage: (message?: CubeBridgeMessage): void => {
        if (message === undefined) {
          return
        }
        const receiveHandler = this.callers.get(message.callbackId)
        this.callers.delete(message.callbackId)
        if (receiveHandler !== undefined) {
          receiveHandler(message.data)
        }
      }
    }
  }

  public async receiveMessage<T = unknown> (callbackId: string): Promise<T> {
    return new Promise((resolve) => {
      this.callers.set(callbackId, (message: string) => {
        function isPureNumber (str: string): boolean {
          return /^\d+$/.test(str)
        }
        try {
          resolve(isPureNumber(message) ? message : JSON.parse(message))
        } catch (error) {
          resolve(message as T)
        }
      })
    })
  }
}

let cubeH5Bridge: CubeH5Bridge | null = null

export function getCubeH5Bridge (): CubeH5Bridge {
  if (cubeH5Bridge !== null) {
    return cubeH5Bridge
  }
  const bridge = new CubeH5BridgeImpl()
  cubeH5Bridge = bridge
  return bridge
}
