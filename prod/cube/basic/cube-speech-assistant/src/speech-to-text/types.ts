export interface SpeechTranscribeConfig {
  url: string
  apiKey: string
  model: string
  prompt: string
  timeoutMs: number
}

export interface SpeechTranscribeOptions {
  prompt?: string
  signal?: AbortSignal
}

export interface SpeechRecordOptions {
  sampleRate?: number
  echoCancellation?: boolean
  noiseSuppression?: boolean
  autoGainControl?: boolean
  mediaStream?: MediaStream
}

export interface SpeechRecordResult {
  wavBlob: Blob
  durationMs: number
  sampleRate: number
}

export interface SpeechFlowResult extends SpeechRecordResult {
  text: string
}

export type SpeechInputStatus = 'idle' | 'starting' | 'recording' | 'transcribing'

export interface SpeechInputState {
  status: SpeechInputStatus
  text: string
}

export type SpeechPermissionStatus = 'granted' | 'prompt' | 'denied' | 'unsupported' | 'insecure'

export interface SpeechPermissionResult {
  status: SpeechPermissionStatus
  granted: boolean
  stream?: MediaStream
  message?: string
  error?: unknown
}

