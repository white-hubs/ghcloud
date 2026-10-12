# @ghcloud/cube-speech-assistant

通用语音转文字模块（H5 优先），提供从权限检查、按住录音、流式转写到文本清洗的一体化能力。

## 包定位

- 路径：`prod/cube/basic/cube-speech-assistant`
- 包名：`@ghcloud/cube-speech-assistant`
- 主要场景：
  - 移动端 H5 对话输入（按住说话）
  - PC Web 对话输入（点击开始/结束录音）
  - 巡检记录语音录入、表单语音辅助输入

## 核心能力

- 权限层：查询/申请麦克风权限（含 insecure/unsupported 场景提示）
- 录音层：基于 Web Audio 采集并编码 WAV（默认 16kHz）
- 转写层：对接 ASR 接口，支持 SSE 流式增量文本
- 控制层：`SpeechInputController` 封装按住说话完整状态机
- 清洗层：去除模型回包中的标签与语言前缀噪音

## 对外导出（`src/speech-to-text/index.ts`）

- 类：
  - `SpeechInputController`
  - `SpeechService`
  - `SpeechPermissionService`
  - `SpeechRecordService`
  - `SpeechTranscribeService`
  - `SpeechTranscribedTextCleaner`
  - `SpeechRecognitionError`
- 常量：
  - `DEFAULT_SPEECH_TRANSCRIBE_CONFIG`
- 类型：
  - `SpeechInputStatus`
  - `SpeechInputState`
  - `SpeechInputControllerOptions`
  - `SpeechRecordOptions`
  - `SpeechTranscribeConfig`
  - `SpeechTranscribeOptions`
  - `SpeechFlowResult` 等

## 推荐集成方式（控制器模式）

```ts
import { SpeechInputController, type SpeechInputStatus } from "@ghcloud/cube-speech-assistant";

const voiceStatus = ref<SpeechInputStatus>("idle");
const controller = new SpeechInputController({
  onStateChange: (state) => {
    voiceStatus.value = state.status;
  },
  onTranscribed: (text) => {
    // 将 text 追加到输入框或消息列表
  },
  onError: (error) => {
    // toast error.message
  },
});

const onPressStart = (pointerId: number): void => {
  void controller.handlePressStart(pointerId);
};
const onPressEnd = (pointerId: number): void => {
  void controller.handlePressEnd(pointerId);
};
const onPressCancel = (pointerId: number): void => {
  void controller.handlePressCancel(pointerId);
};

onBeforeUnmount(() => {
  void controller.dispose();
});
```

## PC 端调用方式（点击切换录音）

PC 端通常不使用“按住说话”，推荐使用点击开始/点击结束：

```ts
const voiceStatus = ref<SpeechInputStatus>("idle");
const controller = new SpeechInputController({
  onStateChange: (state) => {
    voiceStatus.value = state.status;
  },
  onTranscribed: (text) => {
    const normalized = text.trim();
    if (!normalized) return;
    appendUserMessage(normalized);
  },
  onError: (error) => {
    showToast(error instanceof Error ? error.message : "语音识别失败");
  },
});

const onClickMic = (): void => {
  // idle -> startRecord, recording -> stopAndTranscribe
  void controller.handleClick();
};
```

PC 端按钮文案建议：

- `idle`：开始录音
- `starting`：准备录音...
- `recording`：结束录音
- `transcribing`：识别中...

## 状态机说明

`SpeechInputStatus`：

- `idle`：空闲，未录音
- `starting`：申请权限/初始化录音中
- `recording`：正在录音（按住说话）
- `transcribing`：录音结束后转写中

交互建议：

- `starting`：展示“准备录音...”
- `recording`：展示“松开结束说话”
- `transcribing`：按钮禁用，展示“正在识别...”
- `idle`：展示“按住说话”

## 配置项

### 1) 录音参数（`SpeechRecordOptions`）

- `sampleRate`（默认 16000）
- `echoCancellation`（默认 `true`）
- `noiseSuppression`（默认 `true`）
- `autoGainControl`（默认 `false`）

### 2) 转写参数（`SpeechTranscribeConfig`）

可通过 `SpeechServiceOptions.transcribeConfig` 覆盖：

- `url`：ASR 接口地址
- `apiKey`：鉴权 token
- `model`：模型名称
- `prompt`：默认转写提示词
- `timeoutMs`：超时毫秒数（默认 5 分钟）

## 错误与异常处理

- 模块抛出 `SpeechRecognitionError`（含 `code`）
- 常见错误：
  - 浏览器不支持录音/AudioContext
  - 权限拒绝
  - 音频数据为空
  - ASR 请求失败或超时

建议统一在 `onError` 中 toast，并在 UI 里回退到 `idle` 状态。

## 与业务页对齐建议

- 语音转写结果进入消息流前，先执行 trim 和空串过滤
- 页面卸载时务必 `dispose()`，避免麦克风资源泄漏
- 在非 H5 容器或不支持环境下，隐藏语音按钮或降级为文本输入
- 区分端侧交互：
  - 移动端优先 `press start/end/cancel`
  - PC 端优先 `handleClick` 单按钮切换录音状态

## 构建与发布

```bash
cd prod/cube/basic/cube-speech-assistant
bun run build
```

- 产物目录：`dist/`
- `package.json#files` 已配置发布 `dist/`
