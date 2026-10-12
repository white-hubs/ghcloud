export class SpeechRecognitionError extends Error {
  public readonly code: number

  public constructor (code: number, message: string) {
    super(message)
    this.name = 'SpeechRecognitionError'
    this.code = code
  }
}

