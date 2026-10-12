import { SpeechService, type SpeechServiceOptions } from './speech-service'
import { SpeechTranscribedTextCleaner } from './text-cleaner'
import type { SpeechInputState, SpeechPermissionResult, SpeechRecordOptions, SpeechTranscribeOptions } from './types'

const DEFAULT_POINTER_ID = -1

export interface SpeechInputControllerOptions {
  speechService?: SpeechService
  speechServiceOptions?: SpeechServiceOptions
  recordOptions?: SpeechRecordOptions
  transcribeOptions?: SpeechTranscribeOptions
  onStateChange?: (state: SpeechInputState) => void
  onRecordStart?: () => void
  onRecordStop?: () => void
  onTranscribing?: (chunk: string, text: string) => void
  onTranscribed?: (text: string) => void
  onError?: (error: unknown) => void
}

export class SpeechInputController {
  public readonly speechService: SpeechService
  private readonly recordOptions: SpeechRecordOptions
  private readonly transcribeOptions: SpeechTranscribeOptions
  private readonly callbacks: SpeechInputControllerOptions
  private state: SpeechInputState = {
    status: 'idle',
    text: '',
  }
  private activePointerId: number | null = null
  private fingerDown = false
  private abortController: AbortController | null = null

  public constructor (options: SpeechInputControllerOptions = {}) {
    this.speechService = options.speechService ?? new SpeechService(options.speechServiceOptions)
    this.recordOptions = options.recordOptions ?? {}
    this.transcribeOptions = options.transcribeOptions ?? {}
    this.callbacks = options
  }

  public getState (): SpeechInputState {
    return { ...this.state }
  }

  public async queryRecordPermission (): Promise<SpeechPermissionResult> {
    return this.speechService.queryRecordPermission()
  }

  public async requestRecordPermission (): Promise<SpeechPermissionResult> {
    return this.speechService.requestRecordPermission(this.recordOptions)
  }

  public async handleClick (): Promise<void> {
    if (this.state.status === 'idle') {
      await this.startRecord()
      return
    }
    if (this.state.status === 'recording') {
      await this.stopAndTranscribe()
    }
  }

  public async handlePressStart (pointerId: number = DEFAULT_POINTER_ID): Promise<void> {
    if (this.state.status !== 'idle' || this.activePointerId !== null) {
      return
    }
    this.activePointerId = pointerId
    this.fingerDown = true
    await this.startRecord(() => this.fingerDown && this.activePointerId === pointerId)
  }

  public async handlePressEnd (pointerId: number = DEFAULT_POINTER_ID): Promise<void> {
    if (!this.isActivePointer(pointerId)) {
      return
    }
    this.activePointerId = null
    this.fingerDown = false
    if (this.state.status === 'starting') {
      return
    }
    await this.stopAndTranscribe()
  }

  public async handlePressCancel (pointerId: number = DEFAULT_POINTER_ID): Promise<void> {
    if (!this.isActivePointer(pointerId)) {
      return
    }
    this.activePointerId = null
    this.fingerDown = false
    await this.cancelRecord()
  }

  public async cancelRecord (): Promise<void> {
    this.abortController?.abort()
    await this.speechService.cancelRecord()
    this.setState({ status: 'idle', text: '' })
  }

  public async dispose (): Promise<void> {
    this.abortController?.abort()
    await this.speechService.dispose()
  }

  private async startRecord (shouldKeepRecording: () => boolean = () => true): Promise<void> {
    if (this.state.status !== 'idle') {
      return
    }
    this.setState({ status: 'starting', text: '' })
    try {
      await this.speechService.startRecord(this.recordOptions)
      if (!shouldKeepRecording()) {
        await this.speechService.cancelRecord()
        this.setState({ status: 'idle', text: '' })
        return
      }
      this.setState({ status: 'recording', text: '' })
      this.callbacks.onRecordStart?.()
    } catch (error) {
      this.setState({ status: 'idle', text: '' })
      this.callbacks.onError?.(error)
    }
  }

  private async stopAndTranscribe (): Promise<void> {
    if (this.state.status !== 'recording') {
      return
    }
    this.abortController = new AbortController()
    let text = ''
    this.setState({ status: 'transcribing', text })
    this.callbacks.onRecordStop?.()

    try {
      for await (const chunk of this.speechService.stopRecordAndTranscribeStream({
        ...this.transcribeOptions,
        signal: this.abortController.signal,
      })) {
        text += chunk
        this.setState({ status: 'transcribing', text })
        this.callbacks.onTranscribing?.(chunk, text)
      }

      text = SpeechTranscribedTextCleaner.sanitize(text)
      this.setState({ status: 'idle', text })
      this.callbacks.onTranscribed?.(text)
    } catch (error) {
      this.setState({ status: 'idle', text })
      this.callbacks.onError?.(error)
    } finally {
      this.abortController = null
    }
  }

  private isActivePointer (pointerId: number): boolean {
    return this.activePointerId === pointerId
  }

  private setState (state: SpeechInputState): void {
    this.state = state
    this.callbacks.onStateChange?.({ ...this.state })
  }
}

