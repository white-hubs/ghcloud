import type { SpeechPermissionResult, SpeechRecordOptions } from './types'

type BrowserNavigator = Navigator & {
  permissions?: {
    query: (permission: { name: 'microphone' }) => Promise<PermissionStatus>
  }
}

export class SpeechPermissionService {
  public async queryMicrophonePermission (): Promise<SpeechPermissionResult> {
    const supportResult = this.checkBrowserSupport()
    if (supportResult) {
      return supportResult
    }

    const browserNavigator = navigator as BrowserNavigator
    if (!browserNavigator.permissions?.query) {
      return {
        status: 'prompt',
        granted: false,
        message: '当前浏览器需要在录音时请求麦克风权限',
      }
    }

    try {
      const status = await browserNavigator.permissions.query({ name: 'microphone' })
      return {
        status: status.state,
        granted: status.state === 'granted',
      }
    } catch (_ignore) {
      return {
        status: 'prompt',
        granted: false,
        message: '当前浏览器需要在录音时请求麦克风权限',
      }
    }
  }

  public async requestMicrophonePermission (options: SpeechRecordOptions = {}): Promise<SpeechPermissionResult> {
    const supportResult = this.checkBrowserSupport()
    if (supportResult) {
      return supportResult
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: this.buildAudioConstraints(options),
      })
      return {
        status: 'granted',
        granted: true,
        stream,
      }
    } catch (error) {
      return {
        status: this.resolveDeniedStatus(error),
        granted: false,
        message: '未获取录音权限',
        error,
      }
    }
  }

  public releaseStream (stream: MediaStream): void {
    stream.getTracks().forEach((track) => {
      track.stop()
    })
  }

  private checkBrowserSupport (): SpeechPermissionResult | null {
    if (!window.isSecureContext) {
      return {
        status: 'insecure',
        granted: false,
        message: '当前页面需要在 HTTPS 或 localhost 环境下使用录音',
      }
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      return {
        status: 'unsupported',
        granted: false,
        message: '当前浏览器不支持录音',
      }
    }
    return null
  }

  private buildAudioConstraints (options: SpeechRecordOptions): MediaTrackConstraints {
    return {
      echoCancellation: options.echoCancellation ?? true,
      noiseSuppression: options.noiseSuppression ?? true,
      autoGainControl: options.autoGainControl ?? false,
    }
  }

  private resolveDeniedStatus (error: unknown): 'denied' | 'unsupported' {
    if (error instanceof DOMException && (error.name === 'NotFoundError' || error.name === 'OverconstrainedError')) {
      return 'unsupported'
    }
    return 'denied'
  }
}

