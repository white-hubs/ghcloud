import { SpeechRecognitionError } from './speech-error'
import type { SpeechTranscribeConfig, SpeechTranscribeOptions } from './types'

const HTTP_OK_MIN = 200
const HTTP_OK_MAX = 300
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000
const BASE64_CHUNK_SIZE = 0x8000
const SSE_DATA_PREFIX = 'data:'

export const DEFAULT_SPEECH_TRANSCRIBE_CONFIG: SpeechTranscribeConfig = {
  url: 'https://cube-asr-qwen.guhecloud.com:30000/api/v1/chat/completions',
  apiKey: 'sk-asr-2024',
  model: 'Qwen3-ASR-1.7B',
  prompt: '请将这段音频转写为文字',
  timeoutMs: DEFAULT_TIMEOUT_MS,
}

interface SseChoiceDelta {
  content?: unknown
}

interface SseChoice {
  delta?: SseChoiceDelta
}

interface SseChunk {
  choices?: SseChoice[]
}

export class SpeechTranscribeService {
  private readonly config: SpeechTranscribeConfig

  public constructor (config: Partial<SpeechTranscribeConfig> = {}) {
    this.config = {
      ...DEFAULT_SPEECH_TRANSCRIBE_CONFIG,
      ...config,
    }
  }

  public async *transcribe (wavAudio: Blob | ArrayBuffer | Uint8Array, options: SpeechTranscribeOptions = {}): AsyncGenerator<string> {
    const wavBytes = await this.toUint8Array(wavAudio)
    if (wavBytes.length === 0) {
      throw new SpeechRecognitionError(-1, '音频数据不能为空')
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, this.config.timeoutMs)
    const abortListener = (): void => {
      controller.abort()
    }
    options.signal?.addEventListener('abort', abortListener, { once: true })

    try {
      if (options.signal?.aborted) {
        controller.abort()
      }
      const response = await fetch(this.config.url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.buildPayload(wavBytes, options.prompt)),
        signal: controller.signal,
      })

      if (response.status < HTTP_OK_MIN || response.status >= HTTP_OK_MAX) {
        throw new SpeechRecognitionError(response.status, response.statusText || '语音识别请求失败')
      }
      if (!response.body) {
        throw new SpeechRecognitionError(-1, '语音识别响应格式异常')
      }

      for await (const content of this.parseSseContent(response.body)) {
        yield content
      }
    } finally {
      clearTimeout(timeoutId)
      options.signal?.removeEventListener('abort', abortListener)
    }
  }

  public async transcribeToText (wavAudio: Blob | ArrayBuffer | Uint8Array, options: SpeechTranscribeOptions = {}): Promise<string> {
    let text = ''
    for await (const chunk of this.transcribe(wavAudio, options)) {
      text += chunk
    }
    return text
  }

  public getConfig (): SpeechTranscribeConfig {
    return { ...this.config }
  }

  private buildPayload (wavBytes: Uint8Array, prompt?: string): unknown {
    return {
      model: this.config.model,
      stream: true,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'input_audio',
              input_audio: {
                data: this.bytesToBase64(wavBytes),
                format: 'wav',
              },
            },
            {
              type: 'text',
              text: prompt ?? this.config.prompt,
            },
          ],
        },
      ],
    }
  }

  private async *parseSseContent (stream: ReadableStream<Uint8Array>): AsyncGenerator<string> {
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split(/\r?\n/)
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          const content = this.parseSseLine(line)
          if (content) {
            yield content
          }
        }
      }

      buffer += decoder.decode()
      const finalContent = this.parseSseLine(buffer)
      if (finalContent) {
        yield finalContent
      }
    } finally {
      reader.releaseLock()
    }
  }

  private parseSseLine (line: string): string {
    const trimmed = line.trim()
    if (!trimmed.startsWith(SSE_DATA_PREFIX)) {
      return ''
    }

    const data = trimmed.slice(SSE_DATA_PREFIX.length).trim()
    if (!data || data === '[DONE]') {
      return ''
    }

    try {
      const chunk = JSON.parse(data) as SseChunk
      const content = chunk.choices?.[0]?.delta?.content
      return typeof content === 'string' ? content : ''
    } catch (error) {
      return ''
    }
  }

  private async toUint8Array (audio: Blob | ArrayBuffer | Uint8Array): Promise<Uint8Array> {
    if (audio instanceof Uint8Array) {
      return audio
    }
    if (audio instanceof ArrayBuffer) {
      return new Uint8Array(audio)
    }
    return new Uint8Array(await audio.arrayBuffer())
  }

  private bytesToBase64 (bytes: Uint8Array): string {
    let binary = ''
    for (let offset = 0; offset < bytes.length; offset += BASE64_CHUNK_SIZE) {
      const chunk = bytes.subarray(offset, offset + BASE64_CHUNK_SIZE)
      binary += String.fromCharCode(...chunk)
    }
    return btoa(binary)
  }
}

