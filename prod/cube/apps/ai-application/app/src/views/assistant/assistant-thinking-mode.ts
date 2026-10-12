import { resolveStepActivity } from "@cube-ai/agent-sdk-client-assistant";
import type { ReasoningStep } from "@cube-ai/agent-sdk-client-vue";

import { lookupExactToolLabel, resolveToolDisplayLabel } from "./assistant-tool-labels";

/**
 * 思考过程渲染模式（grill 2026-07-07 定；术语见 `CONTEXT.md`「思考过程展示」）。
 *
 *   - `steps`       默认：思考步骤（方案 B）。把一轮拍平成**线性步骤时间线**（每步：叙述 + 内联工具卡 +
 *     耗时），配合 alpha.16「正文气泡真流式」——叙述留在步骤区、正文气泡只流最终答案；结束折叠为
 *     「思考过程 · N 步 · M 次工具 · 已思考 Xs」。见迁移指南 message-reset-v1 / 上游 ADR-0035。
 *   - `prose`       可选：思考文本。一轮所有阶段拍平成**一段连续叙述**，打字机匀速吐字，结束折叠。
 *     注意：alpha.16 后正文气泡也会真流式中间叙述，多工具轮下 prose 面板与气泡会短暂**双重叙述**。
 *   - `feed`        可选：思考流。把过程拍平成**追加式状态行**（每行一个活动），窗口封顶、结束折叠。
 *   - `descriptive` 可选：单行摘要。单行覆盖 + 流式摘要短语（客户端截取思考文本首句）+ 常驻计时；不展开。
 *   - `compact`     可选：无详细过程，单行覆盖粗粒度阶段短语（"正在思考"等），不展开。
 *   - `silent`      可选：无思考过程，等待中整条替换为等待动画，收到正文才流式渲染。
 *   - `detailed`    可选（调试）：完整可展开 reasoning 树（思考树），含 token / 参数 / 输出。
 */
export type AssistantThinkingRenderMode = "steps" | "prose" | "feed" | "silent" | "compact" | "descriptive" | "detailed";

export const ASSISTANT_THINKING_RENDER_MODE_DEFAULT: AssistantThinkingRenderMode = "steps";

/** 调试逃生口：localStorage key（持久化）。 */
export const ASSISTANT_THINKING_RENDER_MODE_STORAGE_KEY = "ghcloud-ai-assistant-thinking-render-mode";
/** 调试逃生口：URL query key（如 `?thinkingMode=detailed`，优先级最高，不持久化）。 */
export const ASSISTANT_THINKING_RENDER_MODE_QUERY_KEY = "thinkingMode";

const VALID_MODES = new Set<AssistantThinkingRenderMode>(["steps", "prose", "feed", "silent", "compact", "descriptive", "detailed"]);

function normalizeMode(value: string | null | undefined): AssistantThinkingRenderMode | null {
  const trimmed = (value ?? "").trim().toLowerCase();
  return VALID_MODES.has(trimmed as AssistantThinkingRenderMode) ? (trimmed as AssistantThinkingRenderMode) : null;
}

export interface ResolveAssistantThinkingRenderModeInput {
  /** URL query（如 `?thinkingMode=detailed`）；调试逃生口，优先级最高。 */
  queryValue?: string | null;
  /** localStorage 持久化的调试选择；优先级次之。 */
  storedValue?: string | null;
  /** 构建期 env 全局默认（`VITE_ASSISTANT_THINKING_RENDER_MODE`）。 */
  envValue?: string | null;
}

/** 纯函数：按 query > storage > env > 默认 的优先级解析渲染模式；非法值逐级下穿。 */
export function resolveAssistantThinkingRenderMode(input: ResolveAssistantThinkingRenderModeInput): AssistantThinkingRenderMode {
  return (
    normalizeMode(input.queryValue) ??
    normalizeMode(input.storedValue) ??
    normalizeMode(input.envValue) ??
    ASSISTANT_THINKING_RENDER_MODE_DEFAULT
  );
}

/**
 * 单行覆盖模式（compact）取「最新一个进行中的 step」：
 * reasoning reducer 按事件到达顺序 append，同一时刻活跃的最深层 step 必然排在最后
 * （父 step START 后才会派生子 step）。全部结束或树为空时返回 null。
 */
export function pickActiveReasoningStep(steps: readonly ReasoningStep[]): ReasoningStep | null {
  for (let i = steps.length - 1; i >= 0; i -= 1) {
    const step = steps[i];
    if (step && step.ok === undefined) {
      return step;
    }
  }
  return null;
}

const MARKDOWN_HEADING_LINE = /^#{1,6}\s+(?<heading>.+)$/u;

/**
 * 从流式累积文本中提取「最近一条已完整换行」的 Markdown 标题行。
 * 只认被 `\n` 收尾的完整行——正在流式输入中的半截标题（不论是否形似标题）一律不返回，
 * 避免重现逐字抖动。标题在一次生成里出现次数少（几次/轮），天然满足「粗粒度、低频切换」
 * 的展示要求，可安全用作 descriptive 模式的具体描述来源。
 */
export function extractLatestCompletedHeading(text: string): string | null {
  const completedLines = text.split("\n").slice(0, -1);
  for (let i = completedLines.length - 1; i >= 0; i -= 1) {
    const line = completedLines[i];
    if (line === undefined) {
      continue;
    }
    const match = MARKDOWN_HEADING_LINE.exec(line.trim());
    if (match?.groups?.heading !== undefined) {
      const heading = match.groups.heading.trim();
      if (heading !== "") {
        return heading;
      }
    }
  }
  return null;
}

/**
 * 单行覆盖模式（compact）取「粗粒度固定短语」而非拼接原始流式文本——业内共识
 * （Perplexity「Searching/Reading/Writing」、Claude thinking 摘要等）：模型思考文本
 * 本身逐块到达、天然不稳定，直接拿它做高频刷新的状态行必然闪烁；只有阶段切换次数少、
 * 与 token 速率解耦的固定短语才能在流式期间稳定展示。
 *
 * 分类依据为 SDK `resolveStepActivity`（读 wire `meta.activity`，不对 toolName/label 猜测）。
 */
export function resolveThinkingPhaseLabel(step: ReasoningStep): string {
  if (step.kind === "lifecycle" && step.point === "turnStop") {
    return "正在整理结果";
  }

  switch (resolveStepActivity(step)) {
    case "thinking":
      return "正在思考";
    case "web-search":
      return "正在搜索网页";
    case "knowledge-retrieval":
      return "知识库检索";
    case "skill-load":
      return "技能引用";
    case "tool":
      return resolveToolDisplayLabel(step.toolName);
    case "working":
      return "正在处理";
  }
}

/**
 * descriptive 模式专用：在 compact 通用短语基础上「附加」细节，不修改 compact 的既有语义。
 *
 *   - knowledge-retrieval / web-search：检索词来自 `tool-call-started-v1.args`，一次性到达、
 *     不随流式文本增长，可安全展示。
 *   - thinking / working（model-reasoning / tool-loop）：只有流式自由文本、没有结构化参数，
 *     但其中出现的 Markdown 标题行同样「一次性完整、低频出现」，见 `extractLatestCompletedHeading`；
 *     覆盖「本轮未触发任何工具调用」（如纯生成图表/文案）的最常见场景。
 *   - 其余情况原样委托给 compact 的短语。
 */
export function resolveThinkingDescriptiveLabel(step: ReasoningStep): string {
  const activity = resolveStepActivity(step);

  if (activity === "knowledge-retrieval") {
    const query = typeof step.args?.query === "string" ? step.args.query.trim() : "";
    if (query !== "") {
      return `知识库检索：${query}`;
    }
    return "知识库检索";
  }

  if (activity === "web-search") {
    const query = typeof step.args?.query === "string" ? step.args.query.trim() : "";
    if (query !== "") {
      return `网页搜索：${query}`;
    }
    return "正在搜索网页";
  }

  if (activity === "thinking" || activity === "working") {
    const heading = extractLatestCompletedHeading(step.text);
    if (heading !== null) {
      return `正在生成：${heading}`;
    }
  }

  return resolveThinkingPhaseLabel(step);
}

/** compact 单行当前展示状态：`since` 是这个 label 开始展示的时间戳（用于计算最小展示时长）。 */
export interface ThinkingLabelHoldState {
  label: string;
  since: number;
}

/** 单行覆盖模式的最小展示时长（ms）：业内 skeleton/toast 常用下限，兼顾「不闪」与「不拖沓」。 */
export const COMPACT_THINKING_LABEL_MIN_HOLD_MS = 500;

/**
 * 单行覆盖模式的「最小展示时长」防抖状态机（业内 skeleton/toast 常用心法）：
 * 候选 label 变了但离上次切换不足 `minHoldMs`，先按兵不动，等攒够时长再切换，
 * 避免嵌套 step 快速 start/end（如 lifecycle → model-reasoning → tool-call 连续切换）
 * 导致状态行本身也跟着跳变。
 *
 * 纯函数：调用方负责在每次响应式更新时传入最新的 `nowMs`（如 `Date.now()`）与候选 label。
 *   - `candidateLabel` 为 `null`（本次没有新信息，如两次 step 之间的空隙）→ 原样保留上次展示值。
 *   - 首次出现的候选 label → 立即展示，不做人为延迟。
 *   - 候选与当前展示的 label 相同 → 保留原 `since`（避免同一状态被误判为「刚切换」）。
 */
export function holdThinkingLabel(
  previous: ThinkingLabelHoldState | null,
  candidateLabel: string | null,
  nowMs: number,
  minHoldMs: number,
): ThinkingLabelHoldState | null {
  if (candidateLabel === null) {
    return previous;
  }
  if (previous === null) {
    return { label: candidateLabel, since: nowMs };
  }
  if (previous.label === candidateLabel) {
    return previous;
  }
  if (nowMs - previous.since < minHoldMs) {
    return previous;
  }
  return { label: candidateLabel, since: nowMs };
}

/**
 * 轻量剥离思考文本里的 Markdown 语法记号（标题 `#`、加粗 `**`、行内代码 `` ` ``），
 * 供 `prose` 口味以纯文本 `white-space: pre-wrap` 渲染时读起来更像自然叙述——
 * 不做完整 Markdown 解析（那会引入逐字重排与半截闪烁，与打字机匀速吐字相冲）。
 */
export function stripLightThinkingMarkdown(text: string): string {
  return text
    .replace(/^\s{0,3}#{1,6}\s+/gmu, "")
    .replace(/\*\*(.+?)\*\*/gu, "$1")
    .replace(/`([^`]+)`/gu, "$1");
}

const SENTENCE_BOUNDARY = /[。！？；.!?;]/u;

/**
 * 从流式累积文本中提取「最近一条已完整」的句子（被句末标点或换行收尾），用于 `descriptive`
 * 单行流式摘要。与 `extractLatestCompletedHeading` 同一心法：只认已收尾的完整句，正在流式输入
 * 的半截句一律不返回，避免逐字抖动。超过 `maxLen` 时截断加省略号。
 */
export function extractLatestCompletedSentence(text: string, maxLen = 48): string | null {
  const trimmed = text.replace(/\s+$/u, "");
  let lastEnd = -1;
  for (let i = trimmed.length - 1; i >= 0; i -= 1) {
    const ch = trimmed[i];
    if (ch !== undefined && (ch === "\n" || SENTENCE_BOUNDARY.test(ch))) {
      lastEnd = i;
      break;
    }
  }
  if (lastEnd < 0) {
    return null;
  }
  let startIdx = 0;
  for (let i = lastEnd - 1; i >= 0; i -= 1) {
    const ch = trimmed[i];
    if (ch !== undefined && (ch === "\n" || SENTENCE_BOUNDARY.test(ch))) {
      startIdx = i + 1;
      break;
    }
  }
  const sentence = stripLightThinkingMarkdown(trimmed.slice(startIdx, lastEnd)).trim();
  if (sentence === "") {
    return null;
  }
  return sentence.length > maxLen ? `${sentence.slice(0, maxLen - 1)}…` : sentence;
}

/**
 * `descriptive` 单行流式摘要的候选来源（在旧 `resolveThinkingDescriptiveLabel` 基础上优化）：
 *   - knowledge-retrieval / web-search：沿用检索词（原子到达、安全）。
 *   - thinking / working：优先「最近完成的句子」（比标题更新频繁，单行也不易显得卡住），
 *     退化到已完成标题，再退化到通用阶段短语。
 *   - 其余：委托 compact 短语。
 */
export function resolveThinkingSummaryLabel(step: ReasoningStep): string {
  const activity = resolveStepActivity(step);
  if (activity === "knowledge-retrieval" || activity === "web-search") {
    return resolveThinkingDescriptiveLabel(step);
  }
  if (activity === "thinking" || activity === "working") {
    const sentence = extractLatestCompletedSentence(step.text);
    if (sentence !== null) {
      return sentence;
    }
    const heading = extractLatestCompletedHeading(step.text);
    if (heading !== null) {
      return `正在生成：${heading}`;
    }
  }
  return resolveThinkingPhaseLabel(step);
}

/** 尽力从工具结果结构中数出「命中条数」，用于 prose 叙述里的完成小句；数不出返回 null。 */
function countToolResultItems(output: unknown): number | null {
  if (Array.isArray(output)) {
    return output.length;
  }
  if (output !== null && typeof output === "object") {
    const record = output as Record<string, unknown>;
    for (const key of ["hits", "results", "items", "data", "documents", "matches", "chunks"]) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value.length;
      }
    }
  }
  return null;
}

/**
 * 把一个 tool-call step「伪装成一句思考叙述」（prose 口味核心）。分类依据 SDK `resolveStepActivity`：
 *   - 进行中：只给动作短语（「检索知识库：X」），保持简短、不泄漏原始输出；
 *   - 已完成：附加「命中 N 条 / 未成功」小句，让容器在工具返回时又「动」一下。
 * 与 model-reasoning 的原始思考文本一起，汇成同一容器里的连续叙述。
 */
function narrateToolCall(step: ReasoningStep): string | null {
  const activity = resolveStepActivity(step);
  const query = typeof step.args?.query === "string" ? step.args.query.trim() : "";
  const done = step.ok !== undefined;
  const failed = step.ok === false;

  if (activity === "knowledge-retrieval" || activity === "web-search") {
    const verb = activity === "knowledge-retrieval" ? "检索知识库" : "联网搜索";
    const base = query !== "" ? `${verb}：${query}` : verb;
    if (failed) {
      return `${base}（未成功）`;
    }
    if (done) {
      const hits = countToolResultItems(step.output);
      return hits !== null ? `${base}，命中 ${hits} 条` : base;
    }
    return base;
  }
  if (activity === "skill-load") {
    return failed ? "引用技能（未成功）" : "引用技能";
  }
  if (activity === "tool") {
    const label = resolveToolDisplayLabel(step.toolName);
    return failed ? `${label}（未成功）` : label;
  }
  return null;
}

function narrateStep(step: ReasoningStep): string | null {
  if (step.kind === "model-reasoning" || step.kind === "tool-loop") {
    const text = stripLightThinkingMarkdown(step.text).trim();
    return text !== "" ? text : null;
  }
  if (step.kind === "tool-call") {
    return narrateToolCall(step);
  }
  return null;
}

/**
 * `prose` 口味的拍平叙述构建器：把扁平 `ReasoningStep[]` 按到达顺序拍平成**一段连续叙述**
 * （模型推理原文 + 工具/阶段合成句），段间以空行分隔。纯函数，供打字机匀速吐字的 target。
 * 不分支、不成树——这正是 prose 与 `detailed`（思考树）的根本区别。
 */
export function buildThinkingNarration(steps: readonly ReasoningStep[]): string {
  const pieces: string[] = [];
  for (const step of steps) {
    const piece = narrateStep(step);
    if (piece !== null && piece !== "") {
      pieces.push(piece);
    }
  }
  return pieces.join("\n\n");
}

/**
 * `feed` 口味的拍平状态行构建器：把过程拍平成**追加式短标签**（每行一个活动），相邻同标签去重。
 * 视图侧只渲染最近 N 行 + 顶部渐隐。复用 `resolveThinkingDescriptiveLabel` 的安全短语。
 */
export function buildThinkingFeedLines(steps: readonly ReasoningStep[]): string[] {
  const lines: string[] = [];
  const push = (label: string | null): void => {
    if (label !== null && label !== "" && lines[lines.length - 1] !== label) {
      lines.push(label);
    }
  };
  for (const step of steps) {
    if (step.kind === "tool-call") {
      push(resolveThinkingDescriptiveLabel(step));
    } else if (step.kind === "model-reasoning" || step.kind === "tool-loop") {
      const heading = extractLatestCompletedHeading(step.text);
      push(heading !== null ? `正在生成：${heading}` : "正在思考");
    } else if (step.kind === "lifecycle" && step.point === "turnStop") {
      push("正在整理结果");
    }
  }
  return lines;
}

/** SDK `resolveStepActivity` 的返回联合（thinking / web-search / knowledge-retrieval / skill-load / tool / working）。 */
export type StepActivity = ReturnType<typeof resolveStepActivity>;

/** `steps` 时间线里工具卡的名词标签（区别于 compact 的动词短语）：联网搜索 / 知识库检索 / 技能引用 / 工具名。 */
export function resolveThinkingToolLabel(step: ReasoningStep): string {
  // 精确表优先于内置活动：让被活动聚合「吞名」的工具（如 web-search 活动下的 fetch_page）
  // 回到自己的名字；未登记的工具再回落到活动内置名，最后模糊兜底。恒为中文，绝不回退英文。
  const exact = lookupExactToolLabel(step.toolName);
  if (exact !== undefined) {
    return exact;
  }
  switch (resolveStepActivity(step)) {
    case "web-search":
      return "联网搜索";
    case "knowledge-retrieval":
      return "知识库检索";
    case "skill-load":
      return "技能引用";
    default:
      return resolveToolDisplayLabel(step.toolName);
  }
}

/** `steps` 时间线里一次工具调用的结构化视图（图标由视图层按 activity 映射）。 */
export interface ThinkingTimelineTool {
  key: string;
  label: string;
  activity: StepActivity;
  /** 与 ReasoningStep.ok 一致：undefined=进行中，true=完成，false=失败。 */
  ok: boolean | undefined;
}

/** `steps` 时间线里的一个「步骤」：一段模型叙述 + 它触发的工具卡；耗时由视图层用 start/end + tick 计算。 */
export interface ThinkingTimelineStep {
  key: string;
  narration: string;
  tools: ThinkingTimelineTool[];
  inProgress: boolean;
  startTime: number | undefined;
  endTime: number | undefined;
}

function toTimelineTool(step: ReasoningStep): ThinkingTimelineTool {
  return { key: step.stepId, label: resolveThinkingToolLabel(step), activity: resolveStepActivity(step), ok: step.ok };
}

function toTimelineStep(step: ReasoningStep, narration: string, tools: ThinkingTimelineTool[]): ThinkingTimelineStep {
  return {
    key: step.stepId,
    narration,
    tools,
    inProgress: step.ok === undefined,
    startTime: typeof step.startTime === "number" ? step.startTime : undefined,
    endTime: typeof step.endTime === "number" ? step.endTime : undefined,
  };
}

/**
 * `steps`（方案 B）的拍平构建器。mapper 实际发出的是一棵
 * `lifecycle(turnStart) → tool-loop 第 N 轮 → tool-call` 的树（`model-reasoning` 挂在其所属轮次或 lifecycle 下），
 * 本函数把它拍平成**线性步骤时间线**：
 *
 *   - 「一步」= 一个 `tool-loop` 轮次，或未归属任何轮次的顶层 `model-reasoning`。
 *   - `lifecycle` 只是整轮容器，不单独成步，但要**穿透**它取内部的轮次/工具——否则「顶层只剩空容器」会拍成 0 步。
 *   - 每步叙述 = 该轮自身文本 + 挂在该轮下的 `model-reasoning` 文本（均剥轻量 Markdown）。
 *   - 每步工具卡 = `parentStepId` 指向该轮的 `tool-call`。
 *   - 跳过「无叙述且无工具」的步骤（turnStart 容器、无内容的终轮）；任何没被认领的 `tool-call` 兜底自成一步，避免丢失。
 *   - 未认领的 `tool-call` 按 `startTime`（缺省则按 `steps` 原序）插入时间线，而不是追加到末尾——
 *     接地预取工具通常最早到达，应成为步骤 1。
 *
 * 纯函数，供视图直接 map；不做树状嵌套——这正是 steps 与 detailed（思考树）的根本区别。
 */
export function buildThinkingSteps(steps: readonly ReasoningStep[]): ThinkingTimelineStep[] {
  const kindById = new Map<string, ReasoningStep["kind"]>();
  for (const step of steps) {
    kindById.set(step.stepId, step.kind);
  }

  const toolsByParent = new Map<string, ReasoningStep[]>();
  const reasoningByParent = new Map<string, ReasoningStep[]>();
  const groupInto = (map: Map<string, ReasoningStep[]>, key: string, step: ReasoningStep): void => {
    const list = map.get(key);
    if (list) {
      list.push(step);
    } else {
      map.set(key, [step]);
    }
  };
  for (const step of steps) {
    if (step.kind === "tool-call") {
      groupInto(toolsByParent, step.parentStepId ?? "", step);
    } else if (step.kind === "model-reasoning") {
      groupInto(reasoningByParent, step.parentStepId ?? "", step);
    }
  }

  type TimelineEntry = { item: ThinkingTimelineStep; order: number; startTime: number | undefined };
  const entries: TimelineEntry[] = [];
  const claimedTools = new Set<string>();
  const claimTools = (stepId: string): ThinkingTimelineTool[] => {
    const raw = toolsByParent.get(stepId) ?? [];
    for (const tool of raw) {
      claimedTools.add(tool.stepId);
    }
    return raw.map(toTimelineTool);
  };

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    const parentIsToolLoop = step.parentStepId !== undefined && kindById.get(step.parentStepId) === "tool-loop";
    const isTimelineStep = step.kind === "tool-loop" || (step.kind === "model-reasoning" && !parentIsToolLoop);
    if (!isTimelineStep) {
      // lifecycle 容器 / 已并入某轮的 model-reasoning / tool-call → 不单独成步。
      continue;
    }
    const parts: string[] = [];
    const own = stripLightThinkingMarkdown(step.text).trim();
    if (own !== "") {
      parts.push(own);
    }
    if (step.kind === "tool-loop") {
      for (const child of reasoningByParent.get(step.stepId) ?? []) {
        const childText = stripLightThinkingMarkdown(child.text).trim();
        if (childText !== "") {
          parts.push(childText);
        }
      }
    }
    const narration = parts.join("\n");
    const tools = claimTools(step.stepId);
    if (narration === "" && tools.length === 0) {
      continue;
    }
    const item = toTimelineStep(step, narration, tools);
    entries.push({ item, order: i, startTime: item.startTime });
  }

  // 兜底：parentStepId 指向 lifecycle / 缺失的 tool-call（未归属任何轮次）不能丢，各自成一步。
  // 按 startTime 插入时间线（预取通常最早）；缺 startTime 时回退到 steps 原序，避免永远钉在末尾。
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    if (step.kind === "tool-call" && !claimedTools.has(step.stepId)) {
      const item = toTimelineStep(step, "", [toTimelineTool(step)]);
      entries.push({ item, order: i, startTime: item.startTime });
    }
  }

  entries.sort((a, b) => {
    if (typeof a.startTime === "number" && typeof b.startTime === "number" && a.startTime !== b.startTime) {
      return a.startTime - b.startTime;
    }
    return a.order - b.order;
  });

  return entries.map((entry) => entry.item);
}
