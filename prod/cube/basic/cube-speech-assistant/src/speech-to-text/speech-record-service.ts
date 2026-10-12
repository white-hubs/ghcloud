import { SpeechRecognitionError } from "./speech-error";
import type { SpeechRecordOptions, SpeechRecordResult } from "./types";

const DEFAULT_SAMPLE_RATE = 16000;
const SCRIPT_PROCESSOR_BUFFER_SIZE = 4096;
const WAV_HEADER_SIZE = 44;
const PCM_BYTES_PER_SAMPLE = 2;
const WAV_FORMAT_PCM = 1;
const WAV_BITS_PER_SAMPLE = 16;
const MONO_CHANNEL_COUNT = 1;
const SILENCE_RMS_THRESHOLD = 0.0005;
const SILENCE_PEAK_THRESHOLD = 0.005;
const RIFF_CHUNK_SIZE_OFFSET = 4;
const WAVE_FORMAT_OFFSET = 8;
const FMT_CHUNK_OFFSET = 12;
const FMT_CHUNK_SIZE_OFFSET = 16;
const AUDIO_FORMAT_OFFSET = 20;
const CHANNEL_COUNT_OFFSET = 22;
const SAMPLE_RATE_OFFSET = 24;
const BYTE_RATE_OFFSET = 28;
const BLOCK_ALIGN_OFFSET = 32;
const BITS_PER_SAMPLE_OFFSET = 34;
const DATA_CHUNK_OFFSET = 36;
const DATA_SIZE_OFFSET = 40;
const PCM_DATA_OFFSET = 44;

type BrowserWindow = Window & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

export class SpeechRecordService {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private inputSampleRate = DEFAULT_SAMPLE_RATE;
  private targetSampleRate = DEFAULT_SAMPLE_RATE;
  private chunks: Float32Array[] = [];
  private startedAt = 0;
  private recording = false;

  public get isRecording(): boolean {
    return this.recording;
  }

  public async startRecord(options: SpeechRecordOptions = {}): Promise<void> {
    if (this.recording) {
      return;
    }

    const AudioContextConstructor = this.getAudioContextConstructor();
    this.targetSampleRate = options.sampleRate ?? DEFAULT_SAMPLE_RATE;
    try {
      this.mediaStream = options.mediaStream ?? (await this.createMediaStream(options));
      this.audioContext = new AudioContextConstructor();
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
      this.inputSampleRate = this.audioContext.sampleRate;
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.processor = this.audioContext.createScriptProcessor(SCRIPT_PROCESSOR_BUFFER_SIZE, MONO_CHANNEL_COUNT, MONO_CHANNEL_COUNT);
      this.processor.onaudioprocess = (event: AudioProcessingEvent): void => {
        if (!this.recording) {
          return;
        }
        this.chunks.push(this.extractMonoChannel(event.inputBuffer));
      };
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      this.chunks = [];
      this.startedAt = Date.now();
      this.recording = true;
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  public async stopRecord(options: Pick<SpeechRecordOptions, "sampleRate"> = {}): Promise<SpeechRecordResult> {
    if (!this.recording) {
      throw new SpeechRecognitionError(-1, "当前没有可停止的录音任务");
    }

    this.recording = false;
    const durationMs = Date.now() - this.startedAt;
    const targetSampleRate = options.sampleRate ?? this.targetSampleRate;
    const sourceSamples = this.mergeChunks(this.chunks);
    this.cleanup();

    if (sourceSamples.length === 0) {
      throw new SpeechRecognitionError(-1, "录音数据为空");
    }

    const wavSamples = this.resample(sourceSamples, this.inputSampleRate, targetSampleRate);
    if (wavSamples.length === 0 || this.isSilentAudio(wavSamples)) {
      throw new SpeechRecognitionError(-1, "未录到有效声音，请检查麦克风后重试");
    }
    return {
      wavBlob: this.encodeWav(wavSamples, targetSampleRate),
      durationMs,
      sampleRate: targetSampleRate,
    };
  }

  public async cancelRecord(): Promise<void> {
    if (!this.recording && !this.mediaStream && !this.audioContext) {
      return;
    }
    this.recording = false;
    this.chunks = [];
    this.cleanup();
  }

  public async dispose(): Promise<void> {
    await this.cancelRecord();
  }

  private getAudioContextConstructor(): typeof AudioContext {
    const browserWindow = window as BrowserWindow;
    const AudioContextConstructor = browserWindow.AudioContext ?? browserWindow.webkitAudioContext;
    if (!AudioContextConstructor) {
      throw new SpeechRecognitionError(-1, "当前浏览器不支持 Web Audio");
    }
    return AudioContextConstructor;
  }

  private async createMediaStream(options: SpeechRecordOptions): Promise<MediaStream> {
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.getUserMedia) {
      throw new SpeechRecognitionError(-1, "当前浏览器不支持录音");
    }
    return mediaDevices.getUserMedia({
      audio: {
        sampleRate: options.sampleRate ?? DEFAULT_SAMPLE_RATE,
        channelCount: MONO_CHANNEL_COUNT,
        echoCancellation: options.echoCancellation ?? true,
        noiseSuppression: options.noiseSuppression ?? true,
        autoGainControl: options.autoGainControl ?? false,
      },
    });
  }

  private extractMonoChannel(audioBuffer: AudioBuffer): Float32Array {
    const output = new Float32Array(audioBuffer.length);
    const channelCount = audioBuffer.numberOfChannels;
    for (let channelIndex = 0; channelIndex < channelCount; channelIndex += 1) {
      const channelData = audioBuffer.getChannelData(channelIndex);
      for (let index = 0; index < channelData.length; index += 1) {
        output[index] += channelData[index] / channelCount;
      }
    }
    return output;
  }

  private mergeChunks(chunks: Float32Array[]): Float32Array {
    const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
    const samples = new Float32Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      samples.set(chunk, offset);
      offset += chunk.length;
    }
    return samples;
  }

  private resample(samples: Float32Array, inputSampleRate: number, outputSampleRate: number): Float32Array {
    if (inputSampleRate === outputSampleRate) {
      return samples;
    }

    const ratio = inputSampleRate / outputSampleRate;
    const outputLength = Math.round(samples.length / ratio);
    const output = new Float32Array(outputLength);
    for (let index = 0; index < outputLength; index += 1) {
      const inputIndex = index * ratio;
      const leftIndex = Math.floor(inputIndex);
      const rightIndex = Math.min(leftIndex + 1, samples.length - 1);
      const weight = inputIndex - leftIndex;
      output[index] = samples[leftIndex] * (1 - weight) + samples[rightIndex] * weight;
    }
    return output;
  }

  private isSilentAudio(samples: Float32Array): boolean {
    let squareSum = 0;
    let peak = 0;
    for (const sample of samples) {
      const absSample = Math.abs(sample);
      squareSum += sample * sample;
      if (absSample > peak) {
        peak = absSample;
      }
    }
    const rms = Math.sqrt(squareSum / samples.length);
    return rms < SILENCE_RMS_THRESHOLD && peak < SILENCE_PEAK_THRESHOLD;
  }

  private encodeWav(samples: Float32Array, sampleRate: number): Blob {
    const dataSize = samples.length * PCM_BYTES_PER_SAMPLE;
    const buffer = new ArrayBuffer(WAV_HEADER_SIZE + dataSize);
    const view = new DataView(buffer);

    this.writeAscii(view, 0, "RIFF");
    view.setUint32(RIFF_CHUNK_SIZE_OFFSET, WAV_HEADER_SIZE - 8 + dataSize, true);
    this.writeAscii(view, WAVE_FORMAT_OFFSET, "WAVE");
    this.writeAscii(view, FMT_CHUNK_OFFSET, "fmt ");
    view.setUint32(FMT_CHUNK_SIZE_OFFSET, 16, true);
    view.setUint16(AUDIO_FORMAT_OFFSET, WAV_FORMAT_PCM, true);
    view.setUint16(CHANNEL_COUNT_OFFSET, MONO_CHANNEL_COUNT, true);
    view.setUint32(SAMPLE_RATE_OFFSET, sampleRate, true);
    view.setUint32(BYTE_RATE_OFFSET, sampleRate * MONO_CHANNEL_COUNT * PCM_BYTES_PER_SAMPLE, true);
    view.setUint16(BLOCK_ALIGN_OFFSET, MONO_CHANNEL_COUNT * PCM_BYTES_PER_SAMPLE, true);
    view.setUint16(BITS_PER_SAMPLE_OFFSET, WAV_BITS_PER_SAMPLE, true);
    this.writeAscii(view, DATA_CHUNK_OFFSET, "data");
    view.setUint32(DATA_SIZE_OFFSET, dataSize, true);

    let offset = PCM_DATA_OFFSET;
    for (const sample of samples) {
      const clamped = Math.max(-1, Math.min(1, sample));
      const pcm = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      view.setInt16(offset, pcm, true);
      offset += PCM_BYTES_PER_SAMPLE;
    }
    return new Blob([view], { type: "audio/wav" });
  }

  private writeAscii(view: DataView, offset: number, text: string): void {
    for (let index = 0; index < text.length; index += 1) {
      view.setUint8(offset + index, text.charCodeAt(index));
    }
  }

  private cleanup(): void {
    this.processor?.disconnect();
    this.source?.disconnect();
    this.mediaStream?.getTracks().forEach((track) => {
      track.stop();
    });
    void this.audioContext?.close();
    this.processor = null;
    this.source = null;
    this.mediaStream = null;
    this.audioContext = null;
  }
}
