import { SpeechPermissionService } from './speech-permission-service'
import { SpeechRecordService } from './speech-record-service'
import { SpeechRecognitionError } from './speech-error'
import { SpeechTranscribeService } from './speech-transcribe-service'
import { SpeechTranscribedTextCleaner } from './text-cleaner'
import type { SpeechFlowResult, SpeechPermissionResult, SpeechRecordOptions, SpeechTranscribeConfig, SpeechTranscribeOptions } from './types'

export interface SpeechServiceOptions {
  permissionService?: SpeechPermissionService
  recordService?: SpeechRecordService
  transcribeService?: SpeechTranscribeService
  transcribeConfig?: Partial<SpeechTranscribeConfig>
}

export class SpeechService {
  public readonly permissionService: SpeechPermissionService
  public readonly recordService: SpeechRecordService
  public readonly transcribeService: SpeechTranscribeService

  public constructor (options: SpeechServiceOptions = {}) {
    this.permissionService = options.permissionService ?? new SpeechPermissionService()
    this.recordService = options.recordService ?? new SpeechRecordService()
    this.transcribeService = options.transcribeService ?? new SpeechTranscribeService(options.transcribeConfig ?? {})
  }

  public async queryRecordPermission (): Promise<SpeechPermissionResult> {
    return this.permissionService.queryMicrophonePermission()
  }

  public async requestRecordPermission (options: SpeechRecordOptions = {}): Promise<SpeechPermissionResult> {
    const result = await this.permissionService.requestMicrophonePermission(options)
    if (result.stream) {
      this.permissionService.releaseStream(result.stream)
    }
    return result
  }

  public async startRecord (options: SpeechRecordOptions = {}): Promise<void> {
    const permissionResult = await this.permissionService.requestMicrophonePermission(options)
    if (!permissionResult.granted || !permissionResult.stream) {
      throw new SpeechRecognitionError(-1, permissionResult.message ?? '未获取录音权限')
    }
    try {
      await this.recordService.startRecord({
        ...options,
        mediaStream: permissionResult.stream,
      })
    } catch (error) {
      this.permissionService.releaseStream(permissionResult.stream)
      throw error
    }
  }

  public async *stopRecordAndTranscribeStream (options: SpeechTranscribeOptions = {}): AsyncGenerator<string> {
    const { wavBlob } = await this.recordService.stopRecord()
    for await (const chunk of this.transcribeService.transcribe(wavBlob, options)) {
      yield chunk
    }
  }

  public async stopRecordAndTranscribeText (options: SpeechTranscribeOptions = {}): Promise<SpeechFlowResult> {
    const recordResult = await this.recordService.stopRecord()
    const text = await this.transcribeService.transcribeToText(recordResult.wavBlob, options)
    return {
      ...recordResult,
      text: SpeechTranscribedTextCleaner.sanitize(text),
    }
  }

  public async cancelRecord (): Promise<void> {
    await this.recordService.cancelRecord()
  }

  public async dispose (): Promise<void> {
    await this.recordService.dispose()
  }
}

