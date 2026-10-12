import { computed, defineComponent, nextTick, onMounted, onUnmounted, ref, watch, type PropType } from "vue";

/**
 * AI 助手聊天主面板（ADR-0022 — 全量走 @cube-ai/agent-sdk-client-vue）。
 *
 * 设计要点：
 *   1. 状态：本组件 setup() 内 `provideAssistant({...})` 单次注入，子组件
 *      （`ReasoningTreeView` 等）通过 `useAssistant*` 切片读取响应式视图。
 *      不再持有 messageMap / sessions / streamAbortController 等任何本地状态——
 *      全部由 `@cube-ai/agent-sdk-client-assistant.AssistantStore` 持有 + 自动 reduce。
 *   2. HTTP：直 fetch 全部删除；唯一的 HTTP 客户端 = `createAgenticClient()`，
 *      tenant / terminal / authorization 三个 header 由 `headersProvider` + `auth`
 *      回调动态注入（与原 `authStore` 联动；ADR-0022 §D2）。
 *   3. 模型目录：`listModels` 走 `cubeAiApplicationService.listTenantModels()`
 *      （中台 endpoint，**不**经 cube-agentic-engine），同时排除 embedding。
 *   4. SSE / turn 生命周期 / reasoning 树折叠 / 占位 id 替换 / IDB 落盘 / 失败
 *      回滚 / 取消——**全部**由 sdk-assistant 内部处理；本组件零分支逻辑。
 *   5. Token 用量：由 sdk-assistant 归一化 usage-delta / turn-completed 后展示当前 turn。
 *
 * 本组件保留的本地状态全部是「纯 UI」：textarea 自适应高度、模型/知识库下拉显隐、
 * 选中的 agentId / modelCode / kb 字段、以及 ghcloud 业务侧的「会话软删除」
 * localStorage 黑名单（前端独立功能，与 engine 无关）。
 *
 * ref: ADR-0022 §D6 / sdk-vue/composables/assistant/*
 * **/
import {
  buildSystemSuffixFromMessages,
  createAgenticClient,
  createAgenticEnginePort,
  formatReasoningElapsedMs,
  groupSessionsByDate,
  hasVisibleReasoning,
  provideAssistant,
  shouldExpandReasoningStepByDefault,
  useAssistant,
  useAssistantGrants,
  useAssistantLlmModels,
  useAssistantMessages,
  useAssistantSessions,
  useAssistantTokenUsage,
  type AssistantMessage,
  type LlmOption,
  type ReasoningStep,
  type ReasoningTree,
  type TokenUsageSnapshot,
} from "@cube-ai/agent-sdk-client-vue";

import type { CubeAuth } from "@ghcloud/cube-protocol";
import {
  AudioOutlined,
  Avatar,
  BookOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  MessageOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined,
  Spin,
  StopOutlined,
  ThunderboltOutlined,
  message,
} from "@ghcloud/cube-ui";

import { resolveAgenticEngineBase } from "../../api/ai-center-api-base";
import { authStore, initAuthStore } from "../../api/auth-store";
import { cubeAiApplicationService, cubeKnowledgeDocumentService } from "../../api/service";
import { resolveAssistantCommandDisplay } from "../../host/assistant-command";
import { ensureAssistantAgentAvatar } from "./assistant-agent-avatar";
import { visibleAssistantAgentDescription } from "./assistant-agent-description";
import { resolveAgenticEngineAuthToken } from "./assistant-agentic-auth";
import {
  filterComposerReferenceTokens,
  mergeComposerBoundKnowledgeAndSkillRuntimeRefs,
  syncComposerBoundSkillSelections,
} from "./assistant-bound-skills";
import {
  COPY_NO_USER_AGENTS,
  COPY_COMPOSER_PLACEHOLDER,
  COPY_EMPTY_REPLY_HINT,
  COPY_REASONING_PANEL_COLLAPSED,
  COPY_REASONING_PANEL_DONE,
  COPY_REASONING_PANEL_STREAMING,
  COPY_REASONING_STEP_IN_PROGRESS_ARIA,
  COPY_REPLY_GENERATING,
  COPY_TOKEN_USAGE_APPROXIMATE_HINT,
  formatReasoningStepStatus,
} from "./assistant-chat-strings";
import { aggregateUsageForStep, formatTokenInline, isApproximateUsageForStep, pickMessageTokenUsage } from "./assistant-chat-token-usage";
import {
  DEFAULT_ASSISTANT_SESSION_TITLE,
  composerReferenceKey,
  createEmptyAssistantComposerDraft,
  formatAssistantSessionTitle,
  getReasoningStepChildren,
  indexReasoningSteps,
  reasoningStepHasExpandableBody,
  removeSessionIfFresh,
  warnNoUserAgents,
  type AssistantComposerDraft,
  type AssistantComposerReference,
} from "./assistant-chat-ui";
import { AssistantConsentModal } from "./assistant-consent-modal";
import { readDefaultAgentId, writeDefaultAgentId } from "./assistant-default-agent";
import { readGeneratedImages } from "./assistant-generated-media";
import { readHostUserProfile } from "./assistant-host-user-profile";
import { filterManualComposerReferences, isAssistantKbRefsUiEnabled } from "./assistant-kb-refs-config";
import { renderAssistantMarkdownToHtml } from "./assistant-markdown";
import { AssistantMessageBody } from "./assistant-message-body";
import { groupVisibleLlmOptions } from "./assistant-model-menu";
import {
  MAX_COMPOSER_IMAGES,
  isAllowedImageMime,
  pendingToImageAttachments,
  resolveAttachmentPreviewSrc,
  uploadComposerImage,
  type ComposerPendingAttachment,
} from "./assistant-multimodal";
import { AssistantNoAgentsPrompt } from "./assistant-no-agents-prompt";
import { matchesSearchText } from "./assistant-search";
import { fetchSessionAgentId } from "./assistant-session-agent";
import { fetchAssistantSkillReferences } from "./assistant-skill-references";
import { AssistantUserAttachments } from "./assistant-user-attachments";
import { ReferencePickerPopover } from "./reference-picker-popover";
import { useAgentBoundKnowledge } from "./use-agent-bound-knowledge";
import { useAssistantAgentOptions } from "./use-assistant-agent-options";
import { useComposerReferenceMenu } from "./use-composer-reference-menu";

import styles from "./assistant-chat.module.less";

export interface AssistantChatDrawerContext {
  source?: string;
  [key: string]: unknown;
}

const DELETED_SESSIONS_STORAGE_KEY = "ghcloud-ai-assistant-deleted-session-ids";
const CONTEXT_TURNS = 6;
/** 侧边聊天智能体品牌图标（设计稿指定） */
const DRAWER_BRAND_ICON_SRC = "/resource/v1/ai-application/chart.png";

/** 模型头像：取展示名首字/首字母（大写）；空则回退 M */
function modelNameInitial(name: string | null | undefined): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) {
    return "M";
  }
  const first = [...trimmed][0] ?? "M";
  return /[a-z]/iu.test(first) ? first.toUpperCase() : first;
}

function readDeletedSessionIds(): string[] {
  if (typeof localStorage === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(DELETED_SESSIONS_STORAGE_KEY);
    if (raw == null || raw === "") {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function persistDeletedSessionIds(ids: string[]): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.setItem(DELETED_SESSIONS_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage 写入失败不影响会话列表使用。
  }
}

/**
 * 模型下拉数据走中台 `GET /api/ai-center/llm/console/providers` + `GET .../models`，由 service 端聚合
 * 后返回扁平 model 数组（`listTenantModels()`）。这里在 SDK 侧 inject：
 *   - 通过 `provideAssistant({ listModels })` 写入 `AssistantStore.state.models`
 *   - 子组件 `useAssistantLlmModels()` 取 reactive 视图
 *
 * 不经 cube-agentic-engine — 模型管理是中台职责域。engine 在每次 chat 时通过
 * LlmCatalogPort 直连同一个中台拿 runtime-config；前后端共享同一份 `modelCode`
 * 命名空间即可对得上。
 *
 * ref: docs/technical-design/plans/2026-05-12-engine-ghcloud-chat-loop-handoff.zh.md §5.2
 */

/** 与 kaihe-ai-management-platform App.tsx kbList 一致 */
const KB_LIST = ["产品设计规范.Word", "研发设计规范.Word", "团队规范.Word", "产研知识文档规范.Word", "应急预案.Word", "架构规范.Word"];

type ComposerReference = AssistantComposerReference;

const KB_REFERENCE_OPTIONS: ComposerReference[] = KB_LIST.map((title) => ({
  type: "kb",
  id: title,
  label: title,
  description: "知识库",
}));

function formatMessageTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * qiankun：子应用运行时 `location` 是 mf-root 的域，相对路径 `/api/ai-center/agent`
 * 会变成 `https://<主壳>/api/ai-center/agent`，走网关而不是子应用 Vite 的 proxy。
 *
 * 本地联调时在 `.env.dev` / `.env.development.local` 里设置：
 *   `VITE_AI_CENTER_API_BASE=https://ai-center.cube.orb.local/api/ai-center`
 * 或 `VITE_AI_CENTER_API_BASE=http://localhost:8890/api/ai-center`
 * （让 Vite proxy 再转发；需 Vite 对主壳 origin 开 CORS）。
 *
 * 返回值为 `${VITE_AI_CENTER_API_BASE}/agent`，默认 `/api/ai-center/agent`。
 * agent SDK 路由（sessions、files 等）直接拼在此 base 后，不带 `/v1` 前缀。
 *
 * 生产同域网关反代时保留默认相对路径即可。
 */
/**
 * UI 过滤：助手仅选对话模型；endpointType=embedding 或 modelTypes 含 embedding 的不展示。
 *
 * 防御性扁平化：上游 `listTenantModels()` 设计上返回扁平 `ModelItem[]`（已注入
 * `providerName`），但实际链路里偶发把 `ModelGroupItem[]`（`{ groupName, items }`）
 * 透传过来——例如：
 *   - 中台 proxy 错误捕获后返回上游 `/providers/:id/models` 的原始 group 形态；
 *   - tenant 还未注入时 listProviders 失败，回退到原始 group 缓存；
 * 本函数对两种 shape 都能落到正确的 `LlmOption[]`。
 */
interface GroupedShape {
  groupName?: string;
  items?: Array<{
    modelCode?: string;
    displayName?: string | null;
    providerName?: string | null;
    endpointType?: string | null;
    modelTypes?: string[];
  }>;
}
interface FlatShape {
  modelCode?: string;
  displayName?: string | null;
  providerName?: string | null;
  endpointType?: string | null;
  modelTypes?: string[];
  groupName?: string;
}

function isGroupedShape(rows: unknown[]): rows is GroupedShape[] {
  return rows.some(
    (r) =>
      r != null &&
      typeof r === "object" &&
      Array.isArray((r as GroupedShape).items) &&
      ((r as FlatShape).modelCode == null || (r as FlatShape).modelCode === ""),
  );
}

function isEmbeddingModel(m: { endpointType?: string | null; modelTypes?: string[] | null }): boolean {
  const et = (m.endpointType ?? "").trim().toLowerCase();
  if (et === "embedding") {
    return true;
  }
  return (m.modelTypes ?? []).some((t) => String(t).toLowerCase() === "embedding");
}

async function fetchLlmOptionsFromService(): Promise<LlmOption[]> {
  const raw = await cubeAiApplicationService.listTenantModels();
  const rows: unknown[] = Array.isArray(raw) ? raw : [];

  const flat: FlatShape[] = [];
  if (isGroupedShape(rows)) {
    for (const group of rows) {
      const groupName = (group as GroupedShape).groupName ?? "";
      for (const item of (group as GroupedShape).items ?? []) {
        flat.push({ ...item, providerName: item.providerName ?? groupName });
      }
    }
  } else {
    flat.push(...(rows as FlatShape[]));
  }

  const options = flat
    .filter((m) => !isEmbeddingModel(m) && typeof m.modelCode === "string" && m.modelCode !== "")
    .map((m) => ({
      modelCode: String(m.modelCode),
      displayName: m.displayName && String(m.displayName).trim() ? String(m.displayName) : String(m.modelCode),
      providerName: m.providerName ?? "",
    }));

  if (options.length === 0) {
    // eslint-disable-next-line no-console
    console.warn("[assistant-chat] listTenantModels 返回 0 个可用对话模型；原始 rows =", rows);
  }
  return options;
}

function formatToolPayload(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  try {
    const json = JSON.stringify(value, null, 2);
    return json == null ? String(value) : json;
  } catch {
    return String(value);
  }
}

const KNOWLEDGE_TOOL_NAME = "platform.knowledge.query";
const RUNTIME_SKILL_REFS_TOOL_NAME = "runtime.skill.refs";

interface KnowledgeHitSummary {
  title: string;
  snippet: string;
  kbId?: string;
  score?: number;
  link?: string;
}

interface SkillRefSummary {
  skillId: string;
  displayName?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function readStringField(value: Record<string, unknown>, key: string): string | undefined {
  const raw = value[key];
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim() !== "").map((item) => item.trim())
    : [];
}

function readKnowledgeHits(output: unknown): KnowledgeHitSummary[] {
  const record = asRecord(output);
  const hits = record?.hits;
  if (!Array.isArray(hits)) {
    return [];
  }
  return hits
    .map((item): KnowledgeHitSummary | null => {
      const hit = asRecord(item);
      if (!hit) {
        return null;
      }
      const snippet = readStringField(hit, "snippet") ?? readStringField(hit, "content") ?? readStringField(hit, "text");
      if (!snippet) {
        return null;
      }
      const { score } = hit;
      const kbId = readStringField(hit, "kbId");
      const link = readStringField(hit, "link");
      return {
        title: readStringField(hit, "title") ?? readStringField(hit, "docId") ?? "知识片段",
        snippet,
        ...(kbId !== undefined ? { kbId } : {}),
        ...(typeof score === "number" && Number.isFinite(score) ? { score } : {}),
        ...(link !== undefined ? { link } : {}),
      };
    })
    .filter((item): item is KnowledgeHitSummary => item != null);
}

function readSkillRefs(output: unknown, args: Record<string, unknown> | undefined): SkillRefSummary[] {
  const record = asRecord(output);
  const skills = record?.skills;
  if (Array.isArray(skills)) {
    return skills
      .map((item): SkillRefSummary | null => {
        const skill = asRecord(item);
        if (!skill) {
          return null;
        }
        const skillId = readStringField(skill, "skillId");
        if (!skillId) {
          return null;
        }
        const displayName = readStringField(skill, "displayName");
        return {
          skillId,
          ...(displayName !== undefined ? { displayName } : {}),
        };
      })
      .filter((item): item is SkillRefSummary => item != null);
  }
  return readStringArray(args?.skillIds).map((skillId) => ({ skillId }));
}

function reasoningToolName(step: ReasoningStep): string {
  return step.toolName ?? step.label.replace(/^调用\s+/, "");
}

function reasoningStepLabel(step: ReasoningStep): string {
  const toolName = reasoningToolName(step);
  if (toolName === KNOWLEDGE_TOOL_NAME) {
    return "知识库检索";
  }
  if (toolName === RUNTIME_SKILL_REFS_TOOL_NAME) {
    return "技能引用";
  }
  return step.label;
}

function hasObjectEntries(value: Record<string, unknown> | undefined): boolean {
  return value != null && Object.keys(value).length > 0;
}

/**
 * Reasoning 树渲染组件（ADR-0021 / sdk-assistant 类型）。
 *
 * 设计要点：
 *   - 顶层把 `tree.steps` 按 `parentStepId` 建索引，递归渲染 lifecycle → tool-loop → tool-call。
 *   - tool-loop 无 reasoning 文本时，仍会因子 tool-call 可展开（见 `reasoningStepHasExpandableBody`）。
 *   - `<details open>` 默认状态由 `shouldExpandReasoningStepByDefault` 决定。
 *   - Reasoning 文本走 `renderAssistantMarkdownToHtml`。
 */
const ReasoningTreeView = defineComponent({
  name: "ReasoningTreeView",
  props: {
    tree: { type: Object as () => ReasoningTree, required: true },
    /**
     * 该 message 当前可用的 token 明细（usage-delta 归一化后的 items[]）。
     * 传入后 step 行尾会渲染 `· ↑ X / ↓ Y`：
     *   - 与 tachu 对齐：按 `attribution.parentId === step.stepId` 归属（同 step 内多次 LLM 各自有独立 id）
     *   - 父级聚合子树内所有命中的 I/O
     * 不传或为空数组时不渲染 token 区域。
     */
    tokenItems: { type: Array as () => TokenUsageSnapshot[], default: () => [] },
  },
  setup(props) {
    const tickNow = ref(Date.now());
    let tickTimer: ReturnType<typeof setInterval> | undefined;

    const hasAnyInProgressStep = computed(() => props.tree.steps.some((s) => s.ok === undefined));

    watch(
      hasAnyInProgressStep,
      (active) => {
        if (tickTimer != undefined) {
          clearInterval(tickTimer);
          tickTimer = undefined;
        }
        if (active) {
          tickTimer = setInterval(() => {
            tickNow.value = Date.now();
          }, 150);
        }
      },
      { immediate: true },
    );

    onUnmounted(() => {
      if (tickTimer != undefined) {
        clearInterval(tickTimer);
      }
    });

    const grouped = computed(() => indexReasoningSteps(props.tree.steps));

    const stepElapsedMs = (step: ReasoningStep): number => {
      const start = typeof step.startTime === "number" && Number.isFinite(step.startTime) ? step.startTime : tickNow.value;
      const end =
        step.ok === undefined
          ? tickNow.value
          : typeof step.endTime === "number" && Number.isFinite(step.endTime)
            ? step.endTime
            : tickNow.value;
      return Math.max(0, end - start);
    };

    const renderDuration = (step: ReasoningStep, depth: number): JSX.Element | null => {
      if (depth > 1) {
        return null;
      }
      return (
        <span class={styles.thinkingDuration} aria-hidden="true">
          {" "}
          · {formatReasoningElapsedMs(stepElapsedMs(step))}
        </span>
      );
    };

    /**
     * step 行尾追加的 token 段。`aggregateUsageForStep` 按 parentId 归属并聚合子树。
     * 无命中 → 返回 null。
     */
    const renderStepTokens = (step: ReasoningStep): JSX.Element | null => {
      const items = props.tokenItems;
      if (items.length === 0) {
        return null;
      }
      const agg = aggregateUsageForStep(step.stepId, props.tree.steps, items);
      if (agg == null) {
        return null;
      }
      const approximate = isApproximateUsageForStep(step.stepId, props.tree.steps, items);
      return (
        <span class={styles.thinkingDuration} aria-hidden="true" title={approximate ? COPY_TOKEN_USAGE_APPROXIMATE_HINT : undefined}>
          {" "}
          · {approximate ? "约 " : ""}
          {formatTokenInline(agg.input, agg.output)}
        </span>
      );
    };

    const renderKnowledgeToolBody = (step: ReasoningStep): JSX.Element => {
      const args = step.args ?? {};
      const query = typeof args.query === "string" ? args.query : "";
      const kbIds = readStringArray(args.kbIds);
      const hits = readKnowledgeHits(step.output);
      return (
        <div class={styles.toolCallBody}>
          <div class={styles.toolCallSummary}>
            <span class={styles.toolCallChip}>知识库检索</span>
            {query ? <span class={styles.toolCallQuery}>{query}</span> : null}
            {kbIds.map((kbId) => (
              <span key={kbId} class={styles.toolCallChip}>
                {kbId}
              </span>
            ))}
          </div>
          {hits.length > 0 ? (
            <div class={styles.knowledgeHitList}>
              {hits.map((hit, index) => (
                <div key={`${hit.title}-${index}`} class={styles.knowledgeHit}>
                  <div class={styles.knowledgeHitTitle}>
                    <span>{hit.title}</span>
                    {hit.kbId ? <span class={styles.knowledgeHitMeta}>{hit.kbId}</span> : null}
                    {typeof hit.score === "number" ? <span class={styles.knowledgeHitMeta}>{Math.round(hit.score * 100)}%</span> : null}
                  </div>
                  <div class={styles.knowledgeHitSnippet}>{hit.snippet}</div>
                </div>
              ))}
            </div>
          ) : step.output !== undefined ? (
            <div class={styles.toolCallMuted}>未从已选知识库返回匹配片段</div>
          ) : null}
          {step.error ? (
            <div class={styles.toolCallSection}>
              <div class={styles.toolCallSectionLabel}>错误</div>
              <pre class={styles.toolCallPre}>{formatToolPayload(step.error)}</pre>
            </div>
          ) : null}
        </div>
      );
    };

    const renderRuntimeSkillRefsBody = (step: ReasoningStep): JSX.Element => {
      const refs = readSkillRefs(step.output, step.args);
      return (
        <div class={styles.toolCallBody}>
          <div class={styles.toolCallSummary}>
            <span class={styles.toolCallChip}>本轮技能</span>
            {refs.length === 0 ? <span class={styles.toolCallMuted}>未解析到技能引用</span> : null}
            {refs.map((ref) => (
              <span key={ref.skillId} class={[styles.toolCallChip, styles.toolCallChipSkill]}>
                {ref.displayName && ref.displayName !== ref.skillId ? `${ref.displayName} · ${ref.skillId}` : ref.skillId}
              </span>
            ))}
          </div>
        </div>
      );
    };

    const renderToolBody = (step: ReasoningStep): JSX.Element | null => {
      if (step.kind !== "tool-call") {
        return null;
      }
      const toolName = reasoningToolName(step);
      if (toolName === KNOWLEDGE_TOOL_NAME) {
        return renderKnowledgeToolBody(step);
      }
      if (toolName === RUNTIME_SKILL_REFS_TOOL_NAME) {
        return renderRuntimeSkillRefsBody(step);
      }
      const sections: JSX.Element[] = [];
      if (hasObjectEntries(step.args)) {
        sections.push(
          <div class={styles.toolCallSection} key="args">
            <div class={styles.toolCallSectionLabel}>参数</div>
            <pre class={styles.toolCallPre}>{formatToolPayload(step.args)}</pre>
          </div>,
        );
      }
      if (step.output !== undefined) {
        const images = readGeneratedImages(step.output, resolveAgenticEngineBase());
        if (images.length > 0) {
          sections.push(
            <div class={styles.toolCallSection} key="images">
              <div class={styles.toolCallSectionLabel}>生成图片</div>
              <div class={styles.generatedMediaGrid}>
                {images.map((image) => (
                  <a key={image.fileName} class={styles.generatedMediaLink} href={image.url} target="_blank" rel="noreferrer">
                    <img class={styles.generatedMediaImage} src={image.url} alt={image.fileName} />
                  </a>
                ))}
              </div>
            </div>,
          );
        }
        sections.push(
          <div class={styles.toolCallSection} key="output">
            <div class={styles.toolCallSectionLabel}>结果</div>
            <pre class={styles.toolCallPre}>{formatToolPayload(step.output)}</pre>
          </div>,
        );
      }
      if (step.error) {
        sections.push(
          <div class={styles.toolCallSection} key="error">
            <div class={styles.toolCallSectionLabel}>错误</div>
            <pre class={styles.toolCallPre}>{formatToolPayload(step.error)}</pre>
          </div>,
        );
      }
      return sections.length > 0 ? <div class={styles.toolCallBody}>{sections}</div> : null;
    };

    const renderStepLabel = (step: ReasoningStep): JSX.Element => {
      const label = reasoningStepLabel(step);
      const toolName = reasoningToolName(step);
      const showToolName = step.kind === "tool-call" && label !== step.label && toolName !== label;
      return (
        <span class={styles.thinkingStepLabel}>
          <span>{label}</span>
          {showToolName ? <span class={styles.thinkingStepSubLabel}>{toolName}</span> : null}
        </span>
      );
    };

    const renderStep = (step: ReasoningStep, depth: number): JSX.Element => {
      const statusText = formatReasoningStepStatus(step);
      const text = step.text.trim();
      const children = getReasoningStepChildren(step.stepId, grouped.value.childrenByParent);
      const toolBody = renderToolBody(step);
      const hasBody = reasoningStepHasExpandableBody(step, grouped.value.childrenByParent, toolBody != null);
      const inProgress = step.ok === undefined;
      const open = shouldExpandReasoningStepByDefault(step) || (step.kind === "tool-call" && inProgress);

      if (!hasBody) {
        return (
          <div key={step.stepId} class={[styles.thinkingStepEmpty, depth > 0 && styles.thinkingDetailsNested]}>
            <span class={styles.thinkingStepMain}>
              {renderStepLabel(step)}
              <span style={{ opacity: 0.6, fontWeight: 400 }}>
                · {statusText}
                {renderDuration(step, depth)}
                {renderStepTokens(step)}
              </span>
            </span>
            {inProgress ? (
              <span class={styles.thinkingSummaryTail}>
                <span class={styles.thinkingSpin} role="status" aria-label={COPY_REASONING_STEP_IN_PROGRESS_ARIA} />
              </span>
            ) : null}
          </div>
        );
      }

      return (
        <details key={step.stepId} class={[styles.thinkingDetails, depth > 0 && styles.thinkingDetailsNested]} open={open}>
          <summary class={styles.thinkingSummary}>
            <span class={styles.thinkingSummaryLeading}>
              <span class={styles.thinkingSummaryCaret} aria-hidden="true" />
              {renderStepLabel(step)}
              <span style={{ opacity: 0.6, fontWeight: 400 }}>
                · {statusText}
                {renderDuration(step, depth)}
                {renderStepTokens(step)}
              </span>
            </span>
            {inProgress ? (
              <span class={styles.thinkingSummaryTail}>
                <span class={styles.thinkingSpin} role="status" aria-label={COPY_REASONING_STEP_IN_PROGRESS_ARIA} />
              </span>
            ) : null}
          </summary>
          {text !== "" ? (
            <div class={styles.thinkingBody} v-html={renderAssistantMarkdownToHtml(text, { mediaBaseUrl: resolveAgenticEngineBase() })} />
          ) : null}
          {toolBody}
          {children.map((child) => renderStep(child, depth + 1))}
        </details>
      );
    };

    return () => <div>{grouped.value.topLevel.map((step) => renderStep(step, 0))}</div>;
  },
});

export const AssistantChatDrawer = defineComponent({
  name: "AssistantChatDrawer",
  props: {
    auth: {
      type: Object as PropType<CubeAuth | null>,
      default: null,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    initialDraft: {
      type: String,
      default: "",
    },
    context: {
      type: Object as PropType<AssistantChatDrawerContext>,
      default: () => ({}),
    },
    /** 宿主侧边栏是否已全屏（控制标题栏图标态） */
    fullscreen: {
      type: Boolean,
      default: false,
    },
    /** 是否展示全屏切换按钮（主壳侧边聊天开启，全页聊天可关） */
    showFullscreenToggle: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close", "ready", "response", "thinking", "session-change", "state-change", "toggle-fullscreen"],
  setup(props, { emit, expose }) {
    if (props.auth != null) {
      initAuthStore(props.auth);
    }
    const kbRefsUiEnabled = isAssistantKbRefsUiEnabled();
    const {
      agentOptions,
      hasUserAgents,
      loading: agentOptionsLoading,
      loadAgentOptions,
      resolveInitialAgentId,
    } = useAssistantAgentOptions();
    const fallbackAgentId = readDefaultAgentId() ?? "";

    /**
     * Step 1 — 注入 AssistantStore 单例。
     *   - `headersProvider` 把 tenant/terminal 注入到每次 HTTP；
     *   - `auth.provider` 提供裸 JWT（SDK 自动加 Bearer 前缀）；
     *   - `autoLoad: 'sessions-and-first'` 加载会话列表 + 打开首条；
     *   - `listModels` 由 store 在挂载时 fetch 一次写入 state.models。
     */
    const agenticEngineBase = resolveAgenticEngineBase();
    const client = createAgenticClient({
      baseUrl: agenticEngineBase,
      auth: {
        provider: () => resolveAgenticEngineAuthToken(authStore.token),
      },
      headersProvider: () => ({
        tenant: authStore.tenant,
        terminal: String(authStore.terminal),
      }),
    });
    provideAssistant({
      engine: createAgenticEnginePort(client),
      defaultAgentId: fallbackAgentId,
      listModels: fetchLlmOptionsFromService,
      autoLoad: "sessions-and-first",
      debugEventBuffer: { max: 50 },
    });

    // Step 2 — slices
    const {
      sessions,
      currentSessionId,
      loading: loadingSessions,
      open: openSession,
      create: createNewSession,
      remove: removeSession,
    } = useAssistantSessions();
    const { messages, sending, send, cancel } = useAssistantMessages();
    const { pendingGrants, respondGrant } = useAssistantGrants();
    const { models: llmOptions, loading: llmOptionsLoading } = useAssistantLlmModels();
    const { tokenUsage: liveTurnTokenUsage } = useAssistantTokenUsage();
    /** 仅用来读 `activeTurnIdBySessionId`（per-message token 选择源依赖此） */
    const { state: assistantState } = useAssistant();
    const activeTurnId = computed<string | null>(() => {
      const sid = assistantState.currentSessionId;
      return sid ? (assistantState.activeTurnIdBySessionId[sid] ?? null) : null;
    });

    // Step 3 — 本地 UI 状态
    const inputText = ref("");
    /** 主应用当前用户（头像与顶栏同源：GH-UserInfo.fileVO.path） */
    const hostUserProfile = ref(readHostUserProfile());
    const refreshHostUserProfile = (): void => {
      hostUserProfile.value = readHostUserProfile();
    };
    /** 指令消息 id → 下发回执文案（覆盖原气泡，不另起沉底消息） */
    const commandAckByMessageId = ref<Record<string, string>>({});
    const pendingAttachments = ref<ComposerPendingAttachment[]>([]);
    const composerImageUploading = ref(false);
    const composerFileInputRef = ref<HTMLInputElement | null>(null);
    const selectedAgentId = ref(fallbackAgentId);
    const showAgentMenu = ref(false);
    const agentMenuQuery = ref("");
    const agentSearchInputRef = ref<HTMLInputElement>();
    const selectedModelCode = ref<string>("");
    const showModelMenu = ref(false);
    const modelMenuQuery = ref("");
    const selectedReferences = ref<ComposerReference[]>([]);
    const knowledgeReferenceOptions = ref<ComposerReference[]>(KB_REFERENCE_OPTIONS);
    const skillReferenceOptions = ref<ComposerReference[]>([]);
    const skillLabelById = computed(() => new Map(skillReferenceOptions.value.map((item) => [item.id, item.label] as const)));
    const { boundKnowledgeRefs, boundSkillRefs } = useAgentBoundKnowledge(selectedAgentId, agentOptions, skillLabelById);
    const skillChipOptions = computed(() => {
      const byId = new Map(skillReferenceOptions.value.map((item) => [item.id, item]));
      for (const bound of boundSkillRefs.value) {
        if (!byId.has(bound.skillId)) {
          byId.set(bound.skillId, {
            type: "skill",
            id: bound.skillId,
            label: bound.displayName,
            description: "智能体绑定",
          });
        }
      }
      return [...byId.values()];
    });
    const composerReferences = computed(() => [...knowledgeReferenceOptions.value, ...skillChipOptions.value]);
    const referenceMenu = useComposerReferenceMenu({
      references: composerReferences,
      kbRefsUiEnabled: () => kbRefsUiEnabled,
    });
    const modelSearchInputRef = ref<HTMLInputElement>();
    const composerTextareaRef = ref<HTMLTextAreaElement | null>(null);
    const messageAreaRef = ref<HTMLElement | null>(null);
    const showHistoryPanel = ref(false);
    const deletedSessionIds = ref<string[]>([]);
    const composerDraftBySessionId = new Map<string, AssistantComposerDraft>();
    let lastComposerSessionId: string | null = null;

    const visibleSessions = computed(() => sessions.value.filter((s) => !deletedSessionIds.value.includes(s.id)));
    const groupedSessions = computed(() => groupSessionsByDate(visibleSessions.value));

    // Step 5 — 模型选择派生
    const selectedModel = computed<LlmOption | null>(() => {
      const code = selectedModelCode.value;
      if (!code) {
        return null;
      }
      return llmOptions.value.find((option) => option.modelCode === code) ?? null;
    });
    const selectedModelLabel = computed<string>(() => {
      if (selectedModel.value) {
        return selectedModel.value.displayName;
      }
      if (llmOptionsLoading.value) {
        return "模型加载中…";
      }
      return llmOptions.value.length > 0 ? "请选择模型" : "暂无可用模型";
    });
    /** 按 providerName 分组，并按显示名 / modelCode / providerName 搜索过滤。 */
    const groupedLlmOptions = computed(() => groupVisibleLlmOptions(llmOptions.value, modelMenuQuery.value));

    const currentAgent = computed(() => agentOptions.value.find((item) => item.id === selectedAgentId.value) ?? agentOptions.value[0]);
    const currentAgentDescription = computed(() => visibleAssistantAgentDescription(currentAgent.value?.description));
    const currentAgentWelcomeTitle = computed(() =>
      currentAgent.value != null ? `你好，我是${currentAgent.value.name}` : "你好，我是开河 AI",
    );
    const filteredAgentOptions = computed(() =>
      agentOptions.value.filter((agent) => matchesSearchText([agent.name, agent.description, agent.id], agentMenuQuery.value)),
    );

    const selectedReferenceKeys = computed(() => new Set(selectedReferences.value.map(composerReferenceKey)));
    const selectedKbCount = computed(() => selectedReferences.value.filter((ref) => ref.type === "kb").length);

    const canUseAssistant = computed(() => hasUserAgents.value && !agentOptionsLoading.value);

    const canComposerSend = computed(
      () =>
        canUseAssistant.value &&
        (inputText.value.trim().length > 0 || pendingAttachments.value.length > 0) &&
        !composerImageUploading.value,
    );

    // Step 6 — UI helpers
    const COMPOSER_TEXTAREA_MIN_PX = 40;
    const COMPOSER_TEXTAREA_MAX_PX = 220;

    const adjustComposerTextareaHeight = (): void => {
      const el = composerTextareaRef.value;
      if (!el) {
        return;
      }
      el.style.height = "auto";
      const next = Math.min(Math.max(el.scrollHeight, COMPOSER_TEXTAREA_MIN_PX), COMPOSER_TEXTAREA_MAX_PX);
      el.style.height = `${next}px`;
    };

    const scrollMessagesToBottom = (): void => {
      void nextTick(() => {
        const el = messageAreaRef.value;
        if (el == null) {
          return;
        }
        el.scrollTop = el.scrollHeight;
      });
    };

    const revokePendingLocalPreviews = (items: readonly ComposerPendingAttachment[]): void => {
      for (const item of items) {
        if (item.localPreviewUrl != null) {
          URL.revokeObjectURL(item.localPreviewUrl);
        }
      }
    };

    const captureComposerDraft = (): AssistantComposerDraft => ({
      inputText: inputText.value,
      selectedReferences: [...selectedReferences.value],
      pendingAttachments: pendingAttachments.value.map((item) => ({ ...item })),
    });

    const closeComposerTransientState = (): void => {
      referenceMenu.closeReferenceMenu();
      showModelMenu.value = false;
      modelMenuQuery.value = "";
      showAgentMenu.value = false;
      agentMenuQuery.value = "";
    };

    const restoreComposerDraft = (sessionId: string | null): void => {
      revokePendingLocalPreviews(pendingAttachments.value);
      const draft =
        sessionId == null
          ? createEmptyAssistantComposerDraft()
          : (composerDraftBySessionId.get(sessionId) ?? createEmptyAssistantComposerDraft());
      inputText.value = draft.inputText;
      // 草稿恢复会清空勾选；同一智能体下 boundSkillRefs 不变时 watch 不重跑，此处补回默认绑定技能
      selectedReferences.value = syncComposerBoundSkillSelections(
        filterManualComposerReferences(draft.selectedReferences),
        boundSkillRefs.value,
      );
      pendingAttachments.value = draft.pendingAttachments.map((item) => ({ ...item }));
      closeComposerTransientState();
      void nextTick(() => {
        adjustComposerTextareaHeight();
      });
    };

    const loadKnowledgeReferences = async (): Promise<void> => {
      try {
        const page = await cubeKnowledgeDocumentService.getKnowledgeDocumentList({
          pageNumber: 1,
          pageSize: 100,
          status: true,
        });
        const records = Array.isArray(page.records) ? page.records : [];
        if (records.length === 0) {
          return;
        }
        knowledgeReferenceOptions.value = records.map((doc) => ({
          type: "kb",
          id: doc.id,
          label: doc.name,
          description: doc.typeName ? `知识库 · ${doc.typeName}` : "知识库",
        }));
      } catch {
        knowledgeReferenceOptions.value = KB_REFERENCE_OPTIONS;
      }
    };

    const loadSkillReferences = async (): Promise<void> => {
      try {
        skillReferenceOptions.value = await fetchAssistantSkillReferences();
      } catch {
        skillReferenceOptions.value = [];
      }
    };

    const bootstrapAgentOptions = async (): Promise<void> => {
      await loadAgentOptions();
      const sessionId = currentSessionId.value?.trim();
      if (sessionId) {
        try {
          const sessionAgentId = await fetchSessionAgentId((id) => client.sessions.get(id), sessionId);
          if (sessionAgentId) {
            if (selectedAgentId.value !== sessionAgentId) {
              selectedAgentId.value = sessionAgentId;
            }
            const ensured = await ensureAssistantAgentAvatar(sessionAgentId, agentOptions.value);
            agentOptions.value = ensured.options;
            return;
          }
        } catch {
          /* 回填失败再走默认智能体 */
        }
      }
      const nextAgentId = resolveInitialAgentId(agentOptions.value);
      if (!nextAgentId) {
        return;
      }
      if (!selectedAgentId.value || !agentOptions.value.some((item) => item.id === selectedAgentId.value)) {
        selectedAgentId.value = nextAgentId;
      }
      const ensured = await ensureAssistantAgentAvatar(selectedAgentId.value, agentOptions.value);
      agentOptions.value = ensured.options;
    };

    watch(
      () => props.auth,
      (auth) => {
        if (auth != null) {
          initAuthStore(auth);
          if (auth.token) {
            void loadKnowledgeReferences();
            void loadSkillReferences();
            void bootstrapAgentOptions();
          }
        }
      },
      { deep: true, immediate: true },
    );

    watch(
      messages,
      () => {
        scrollMessagesToBottom();
      },
      { deep: true, flush: "post" },
    );

    watch(
      () => sending.value,
      (active) => {
        if (active) {
          scrollMessagesToBottom();
        }
      },
    );

    watch(
      () => currentSessionId.value,
      (nextSessionId, previousSessionId) => {
        if (previousSessionId != null) {
          composerDraftBySessionId.set(previousSessionId, captureComposerDraft());
        } else if (lastComposerSessionId != null && lastComposerSessionId !== nextSessionId) {
          composerDraftBySessionId.set(lastComposerSessionId, captureComposerDraft());
        }
        lastComposerSessionId = nextSessionId;
        restoreComposerDraft(nextSessionId);
      },
      { immediate: true },
    );

    // 切换历史会话时，回填该会话绑定的智能体（服务端 Session.agentId）
    watch(
      () => currentSessionId.value,
      (sessionId) => {
        if (!sessionId) {
          return;
        }
        void fetchSessionAgentId((id) => client.sessions.get(id), sessionId)
          .then((agentId) => {
            if (agentId && selectedAgentId.value !== agentId) {
              selectedAgentId.value = agentId;
            }
          })
          .catch(() => {
            /* 回填失败不阻断历史浏览 */
          });
      },
      { immediate: true },
    );

    // 智能体绑定技能：默认勾选；切换智能体时移除上一智能体的绑定勾选；displayName 就绪后升级 skl_* 文案
    watch(
      () => boundSkillRefs.value.map((item) => `${item.skillId}\u0002${item.displayName}`).join("\u0001"),
      () => {
        selectedReferences.value = syncComposerBoundSkillSelections(selectedReferences.value, boundSkillRefs.value);
      },
    );

    // Step 7 — 模型加载完后默认选第一个；若当前选中不在新列表里也重置
    //   注意：用 getter 形式而非把 ComputedRef 直接传给 watch，避免下游消费者 vue 类型
    //   被 sdk-vue 链路里另一份 vue type 污染时 callback 参数 unwrap 失败。
    watch(
      () => llmOptions.value,
      (next: LlmOption[]) => {
        if (next.length === 0) {
          return;
        }
        const first = next[0];
        if (first && (!selectedModelCode.value || !next.some((o) => o.modelCode === selectedModelCode.value))) {
          selectedModelCode.value = first.modelCode;
        }
      },
      { immediate: true },
    );

    // Step 8 — 业务动作（全部代理到 store slices；本地仅做用户提示文案）
    const removePendingAttachment = (attachmentId: string): void => {
      const removed = pendingAttachments.value.find((item) => item.attachmentId === attachmentId);
      if (removed?.localPreviewUrl != null) {
        URL.revokeObjectURL(removed.localPreviewUrl);
      }
      pendingAttachments.value = pendingAttachments.value.filter((item) => item.attachmentId !== attachmentId);
    };

    const addComposerImageFiles = async (files: readonly File[]): Promise<void> => {
      if (files.length === 0 || composerImageUploading.value) {
        return;
      }
      const remaining = MAX_COMPOSER_IMAGES - pendingAttachments.value.length;
      if (remaining <= 0) {
        message.warning(`最多添加 ${MAX_COMPOSER_IMAGES} 张图片`);
        return;
      }
      const batch = files.slice(0, remaining);
      if (files.length > remaining) {
        message.warning(`最多添加 ${MAX_COMPOSER_IMAGES} 张图片，已忽略多余文件`);
      }
      composerImageUploading.value = true;
      try {
        for (const file of batch) {
          if (!isAllowedImageMime(file.type)) {
            message.warning(`不支持的图片类型：${file.type || "unknown"}`);
            continue;
          }
          const localPreviewUrl = URL.createObjectURL(file);
          try {
            const uploaded = await uploadComposerImage(client, file);
            pendingAttachments.value = [...pendingAttachments.value, { ...uploaded, localPreviewUrl }];
          } catch (error) {
            URL.revokeObjectURL(localPreviewUrl);
            message.error(`图片上传失败：${String(error)}`);
          }
        }
      } finally {
        composerImageUploading.value = false;
      }
    };

    const handleComposerPaste = (event: ClipboardEvent): void => {
      const items = event.clipboardData?.items;
      if (items == null) {
        return;
      }
      const imageFiles: File[] = [];
      for (const item of items) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file != null) {
            imageFiles.push(file);
          }
        }
      }
      if (imageFiles.length === 0) {
        return;
      }
      event.preventDefault();
      void addComposerImageFiles(imageFiles);
    };

    const handleSend = async (): Promise<void> => {
      if (!warnNoUserAgents(hasUserAgents.value, message)) {
        return;
      }
      const text = inputText.value.trim();
      const attachmentsOnSend = pendingToImageAttachments(pendingAttachments.value);
      if ((!text && attachmentsOnSend.length === 0) || sending.value || composerImageUploading.value) {
        return;
      }
      const restoreOnFail = inputText.value;
      const restoreAttachments = pendingAttachments.value.map((item) => ({ ...item }));
      const refsOnSend = filterManualComposerReferences(selectedReferences.value);
      inputText.value = "";
      revokePendingLocalPreviews(pendingAttachments.value);
      pendingAttachments.value = [];
      referenceMenu.closeReferenceMenu();
      try {
        const modelCode = selectedModelCode.value.trim();
        const runtimeRefs = mergeComposerBoundKnowledgeAndSkillRuntimeRefs(refsOnSend, boundKnowledgeRefs.value, boundSkillRefs.value);
        await send(text, {
          ...(modelCode ? { modelCode } : {}),
          ...(runtimeRefs !== undefined ? { runtimeRefs } : {}),
          ...(attachmentsOnSend.length > 0 ? { attachments: attachmentsOnSend } : {}),
        });
      } catch (error) {
        // 占位回滚由 store 在 startTurn 失败时执行；这里仅做 UX 文案
        inputText.value = restoreOnFail;
        pendingAttachments.value = restoreAttachments;
        const errStr = String(error);
        if (
          errStr.includes("SESSION_BUSY") ||
          errStr.includes("SessionBusyError") ||
          errStr.includes("RESOURCE_CONFLICT_SESSION_BUSY") ||
          errStr.includes("409") ||
          errStr.includes("already has a running turn")
        ) {
          message.warning("上一条回复尚未结束，请稍后再试");
        } else {
          message.error(`发送失败：${errStr}`);
        }
      }
    };

    const handleCancel = async (): Promise<void> => {
      if (!sending.value) {
        return;
      }
      try {
        await cancel();
      } catch (error) {
        message.error(`停止失败：${String(error)}`);
      }
    };

    const setDraft = (text: string): void => {
      inputText.value = text;
      void nextTick(() => {
        adjustComposerTextareaHeight();
        composerTextareaRef.value?.focus();
      });
    };

    const submitExternalMessage = async (text: string): Promise<void> => {
      setDraft(text);
      await nextTick();
      await handleSend();
    };

    const createNewConversation = async (): Promise<void> => {
      if (!warnNoUserAgents(hasUserAgents.value, message)) {
        return;
      }
      try {
        await removeSessionIfFresh({
          messages: messages.value,
          sessionId: currentSessionId.value,
          removeSession,
          onRemoved: (id) => {
            composerDraftBySessionId.delete(id);
          },
        });
        const modelCode = selectedModelCode.value.trim();
        const sessionId = await createNewSession({
          agentId: selectedAgentId.value,
          title: DEFAULT_ASSISTANT_SESSION_TITLE,
          ...(modelCode ? { modelCode } : {}),
        });
        composerDraftBySessionId.set(sessionId, createEmptyAssistantComposerDraft());
        showHistoryPanel.value = false;
      } catch (error) {
        message.error(`创建会话失败：${String(error)}`);
      }
    };

    const changeAgent = async (agentId: string): Promise<void> => {
      if (agentId === selectedAgentId.value) {
        return;
      }
      const previousAgentId = selectedAgentId.value;
      const oldMessages = [...messages.value];
      selectedAgentId.value = agentId;
      const systemSuffix = buildSystemSuffixFromMessages(oldMessages, CONTEXT_TURNS);
      const modelCode = selectedModelCode.value.trim();
      try {
        await removeSessionIfFresh({
          messages: oldMessages,
          sessionId: currentSessionId.value,
          removeSession,
          onRemoved: (id) => {
            composerDraftBySessionId.delete(id);
          },
        });
        await createNewSession({
          agentId,
          title: DEFAULT_ASSISTANT_SESSION_TITLE,
          ...(modelCode ? { modelCode } : {}),
          ...(systemSuffix ? { context: { systemSuffix } } : {}),
        });
        writeDefaultAgentId(agentId);
      } catch (error) {
        selectedAgentId.value = previousAgentId;
        message.error(`切换智能体失败：${String(error)}`);
        void loadAgentOptions();
      }
    };

    const pickAgent = (agentId: string): void => {
      closeAgentMenu();
      void changeAgent(agentId);
    };

    const openHistorySession = async (sessionId: string): Promise<void> => {
      try {
        await openSession(sessionId);
        showHistoryPanel.value = false;
        scrollMessagesToBottom();
      } catch (error) {
        message.error(`打开会话失败：${String(error)}`);
      }
    };

    const deleteSessionLocal = async (event: MouseEvent, sessionId: string): Promise<void> => {
      event.stopPropagation();
      if (!deletedSessionIds.value.includes(sessionId)) {
        deletedSessionIds.value = [...deletedSessionIds.value, sessionId];
        persistDeletedSessionIds(deletedSessionIds.value);
      }
      try {
        await removeSession(sessionId);
      } catch (error) {
        message.warning(`已从列表移除；服务端删除未确认：${String(error)}`);
      }
    };

    const handleConsentApprove = async (scopeChoice: "ONCE" | "SESSION" | "PERSISTENT"): Promise<void> => {
      const grant = pendingGrants.value[0];
      if (!grant) {
        return;
      }
      try {
        await respondGrant({ grantRequestId: grant.grantRequestId, decision: "APPROVE", scopeChoice });
        message.success("已同意授权请求");
      } catch (error) {
        message.error(`授权提交失败：${String(error)}`);
      }
    };

    const handleConsentDeny = async (reason?: string): Promise<void> => {
      const grant = pendingGrants.value[0];
      if (!grant) {
        return;
      }
      try {
        await respondGrant({ grantRequestId: grant.grantRequestId, decision: "DENY", note: reason });
        if (reason !== "expired") {
          message.info("已拒绝授权请求");
        }
      } catch (error) {
        message.error(`拒绝操作失败：${String(error)}`);
      }
    };

    const toggleAgentMenu = (event: MouseEvent): void => {
      event.stopPropagation();
      showAgentMenu.value = !showAgentMenu.value;
      showModelMenu.value = false;
      referenceMenu.closeReferenceMenu();
      if (showAgentMenu.value) {
        void nextTick(() => {
          agentSearchInputRef.value?.focus();
        });
      } else {
        agentMenuQuery.value = "";
      }
    };

    const closeAgentMenu = (): void => {
      showAgentMenu.value = false;
      agentMenuQuery.value = "";
    };

    const toggleModelMenu = (event: MouseEvent): void => {
      event.stopPropagation();
      showModelMenu.value = !showModelMenu.value;
      referenceMenu.closeReferenceMenu();
      showAgentMenu.value = false;
      if (showModelMenu.value) {
        nextTick(() => {
          const input = modelSearchInputRef.value;
          if (input !== undefined) {
            input.focus();
          }
        });
      } else {
        modelMenuQuery.value = "";
      }
    };

    const closeModelMenu = (): void => {
      showModelMenu.value = false;
      modelMenuQuery.value = "";
    };

    const pickModel = (modelCode: string): void => {
      showModelMenu.value = false;
      modelMenuQuery.value = "";
      if (modelCode === selectedModelCode.value) {
        return;
      }
      selectedModelCode.value = modelCode;
    };

    const removeReference = (ref: ComposerReference): void => {
      selectedReferences.value = selectedReferences.value.filter((item) => composerReferenceKey(item) !== composerReferenceKey(ref));
    };

    const toggleReference = (ref: ComposerReference): void => {
      const selected = selectedReferenceKeys.value.has(composerReferenceKey(ref));
      if (selected) {
        removeReference(ref);
      } else {
        selectedReferences.value = [...selectedReferences.value, ref];
      }
      if (referenceMenu.activeReferenceTrigger.value != null) {
        const active = referenceMenu.activeReferenceTrigger.value;
        const nextText = `${inputText.value.slice(0, active.start)}${inputText.value.slice(active.end)}`
          .replaceAll(/[ \t]{2,}/g, " ")
          .trimStart();
        inputText.value = nextText;
        referenceMenu.closeReferenceMenu();
        void nextTick(() => {
          const el = composerTextareaRef.value;
          if (el != null) {
            const caret = Math.min(active.start, nextText.length);
            el.focus();
            el.setSelectionRange(caret, caret);
            adjustComposerTextareaHeight();
          }
        });
      }
    };

    const appendPrompt = (text: string): void => {
      inputText.value = inputText.value ? `${inputText.value} ${text}` : text;
    };

    watch(
      () => inputText.value,
      () => {
        void nextTick(() => {
          adjustComposerTextareaHeight();
        });
      },
    );

    onMounted(() => {
      refreshHostUserProfile();
      deletedSessionIds.value = readDeletedSessionIds();
      if (props.initialDraft.trim() !== "") {
        setDraft(props.initialDraft);
      }
      emit("ready");
      void nextTick(() => {
        adjustComposerTextareaHeight();
      });
    });

    onUnmounted(() => {
      revokePendingLocalPreviews(pendingAttachments.value);
    });

    watch(
      () => props.visible,
      (visible) => {
        if (visible) {
          refreshHostUserProfile();
        }
      },
    );
    watch(
      () => props.initialDraft,
      (draft) => {
        if (draft.trim() !== "") {
          setDraft(draft);
        }
      },
    );

    const setCommandAckForMessage = (messageId: string, text: string): void => {
      const id = messageId.trim();
      const content = text.trim();
      if (!id || !content) {
        return;
      }
      if (commandAckByMessageId.value[id] === content) {
        return;
      }
      commandAckByMessageId.value = { ...commandAckByMessageId.value, [id]: content };
    };

    watch(
      () => currentSessionId.value,
      (sessionId) => {
        commandAckByMessageId.value = {};
        emit("session-change", { sessionId });
        emit("state-change", { sessionId, sending: sending.value, context: props.context });
      },
    );

    watch(
      () => sending.value,
      (active) => {
        emit("state-change", { sessionId: currentSessionId.value, sending: active, context: props.context });
      },
    );

    watch(
      messages,
      (items) => {
        const latest = items.at(-1);
        if (latest?.role === "assistant") {
          if (sending.value) {
            emit("thinking", { message: latest, context: props.context });
          } else {
            emit("response", { message: latest, context: props.context });
          }
        }
      },
      { deep: true },
    );

    expose({
      setDraft,
      submitMessage: submitExternalMessage,
      createNewConversation,
      close: () => emit("close"),
      setCommandAckForMessage,
    });

    const renderHistoryGroup = (title: string, items: typeof groupedSessions.value.today) => (
      <div class={styles.historyGroup}>
        <div class={styles.groupTitle}>{title}</div>
        <div class={styles.historyList}>
          {items.map((session) => (
            <div key={session.id} class={styles.historyRow}>
              <button
                type="button"
                class={[
                  styles.historyItem,
                  styles.historyItemGrow,
                  styles.historyItemYesterday,
                  currentSessionId.value === session.id && styles.historyItemActive,
                ]}
                onClick={() => void openHistorySession(session.id)}
              >
                <MessageOutlined class={styles.historyIcon} />
                <span class={styles.historyTitle}>{formatAssistantSessionTitle(session.title)}</span>
              </button>
              <button
                type="button"
                class={styles.historyTrash}
                title="删除"
                onClick={(event: MouseEvent) => void deleteSessionLocal(event, session.id)}
              >
                <DeleteOutlined style={{ fontSize: "14px" }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );

    const renderHistoryView = () => (
      <div class={styles.drawerHistoryView}>
        <div class={styles.drawerHistoryInlineHeader}>
          <span>历史对话</span>
          <button
            type="button"
            onClick={() => {
              showHistoryPanel.value = false;
            }}
          >
            返回聊天
          </button>
        </div>
        <div class={styles.historySpin}>
          <Spin spinning={loadingSessions.value}>
            <div class={styles.historySection}>
              {renderHistoryGroup("今天", groupedSessions.value.today)}
              {renderHistoryGroup("昨天", groupedSessions.value.yesterday)}
              {groupedSessions.value.earlier.length > 0 ? renderHistoryGroup("更早", groupedSessions.value.earlier) : null}
            </div>
          </Spin>
        </div>
      </div>
    );

    return () => (
      <div class={[styles.page, styles.drawerPage]}>
        <section class={[styles.mainPane, styles.drawerMainPane]}>
          <div class={styles.drawerHeader}>
            <div class={styles.drawerHeaderTitle}>
              <button type="button" class={styles.drawerAgentTrigger} onClick={toggleAgentMenu}>
                {currentAgent.value?.avatarUrl?.trim() ? (
                  <img class={[styles.drawerBrandIcon, styles.drawerAgentAvatarImg]} src={currentAgent.value.avatarUrl.trim()} alt="" />
                ) : (
                  <img class={styles.drawerBrandIcon} src={DRAWER_BRAND_ICON_SRC} alt="" aria-hidden="true" />
                )}
                <span class={styles.drawerAgentTriggerLabel}>
                  {currentAgent.value?.name ?? (hasUserAgents.value ? "智能体" : COPY_NO_USER_AGENTS)}
                </span>
                <DownOutlined class={styles.modelChevron} />
              </button>
            </div>
            <div class={styles.drawerHeaderActions}>
              {props.showFullscreenToggle ? (
                <button
                  type="button"
                  class={styles.drawerFullscreenButton}
                  title={props.fullscreen ? "退出全屏" : "全屏"}
                  aria-label={props.fullscreen ? "退出全屏" : "全屏"}
                  onClick={() => emit("toggle-fullscreen")}
                >
                  <svg class={styles.drawerFullscreenIcon} viewBox="0 0 24 24" aria-hidden="true">
                    {props.fullscreen ? (
                      <path
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"
                      />
                    ) : (
                      <path
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"
                      />
                    )}
                  </svg>
                </button>
              ) : null}
              <button type="button" class={styles.drawerCloseButton} title="关闭" onClick={() => emit("close")}>
                ×
              </button>
            </div>
          </div>

          <div
            ref={messageAreaRef}
            class={[styles.messageArea, styles.drawerMessageArea, showHistoryPanel.value && styles.drawerMessageAreaHistory]}
          >
            {showHistoryPanel.value ? (
              renderHistoryView()
            ) : messages.value.length === 0 ? (
              !canUseAssistant.value ? (
                <AssistantNoAgentsPrompt compact />
              ) : (
                <div class={styles.drawerWelcomeBubble}>
                  <div class={styles.drawerWelcomeTitle}>{currentAgentWelcomeTitle.value}</div>
                  {currentAgentDescription.value ? <p class={styles.drawerWelcomeDesc}>{currentAgentDescription.value}</p> : null}
                </div>
              )
            ) : (
              <div class={styles.messageList}>
                {messages.value.map((item: AssistantMessage, index: number) => {
                  if (item.role === "system") {
                    return (
                      <div key={item.id} class={[styles.messageThread, styles.messageThreadSystem]}>
                        <div class={[styles.messageBubble, styles.messageBubbleSystem]}>{item.content}</div>
                      </div>
                    );
                  }
                  const isUser = item.role === "user";
                  const isLast = index === messages.value.length - 1;
                  const commandAck = item.role === "assistant" ? commandAckByMessageId.value[item.id] : undefined;
                  const commandDisplay =
                    item.role === "assistant" ? (commandAck ?? resolveAssistantCommandDisplay(item.content, props.context)) : null;
                  const assistantBodyContent = commandDisplay ?? item.content;
                  const hasReasoning = hasVisibleReasoning(item.reasoning);
                  const reasoningPanelStreamingOpen = item.role === "assistant" && isLast && sending.value && hasReasoning;
                  const showThinkingPlaceholder =
                    item.role === "assistant" && isLast && sending.value && item.content.trim() === "" && !hasReasoning && !commandDisplay;
                  return (
                    <div key={item.id} class={[styles.messageThread, isUser ? styles.messageThreadUser : styles.messageThreadAssistant]}>
                      <div class={[styles.messageThreadInner, styles.drawerMessageThreadInner, isUser && styles.messageThreadInnerUser]}>
                        {isUser ? (
                          <div class={styles.drawerHostUserAvatarWrap}>
                            {/* 内容/样式对齐顶栏 user-dropdown：a-avatar 30px + fileVO.path / name||username */}
                            {hostUserProfile.value.hasFileVO ? (
                              <Avatar size={{ width: "30px", height: "30px" }} src={hostUserProfile.value.avatarSrc}>
                                {hostUserProfile.value.name}
                              </Avatar>
                            ) : (
                              <Avatar class={styles.drawerHostUserAvatarFallback} size={{ width: "30px", height: "30px" }}>
                                {hostUserProfile.value.name}
                              </Avatar>
                            )}
                          </div>
                        ) : (
                          <div
                            class={[
                              styles.messageAvatar,
                              styles.drawerMessageAvatar,
                              styles.messageAvatarAssistant,
                              currentAgent.value?.avatarUrl?.trim() && styles.messageAvatarHasImage,
                            ]}
                          >
                            <img
                              class={currentAgent.value?.avatarUrl?.trim() ? styles.messageAvatarImg : styles.drawerBrandIcon}
                              src={currentAgent.value?.avatarUrl?.trim() || DRAWER_BRAND_ICON_SRC}
                              alt=""
                              aria-hidden="true"
                            />
                          </div>
                        )}
                        <div
                          class={[
                            styles.messageBubble,
                            styles.drawerMessageBubble,
                            isUser ? styles.messageBubbleUser : styles.drawerMessageBubbleAssistant,
                          ]}
                        >
                          {item.role === "assistant" ? (
                            <>
                              {hasReasoning && item.reasoning && !commandDisplay ? (
                                <details
                                  class={styles.thinkingDetails}
                                  key={`reasoning-wrap-${item.id}-${reasoningPanelStreamingOpen ? "open" : "shut"}`}
                                  {...(reasoningPanelStreamingOpen ? { open: true } : {})}
                                >
                                  <summary class={styles.thinkingSummary}>
                                    <span class={styles.thinkingSummaryLeading}>
                                      {reasoningPanelStreamingOpen ? (
                                        <span>{COPY_REASONING_PANEL_STREAMING}</span>
                                      ) : (
                                        <span>{COPY_REASONING_PANEL_COLLAPSED}</span>
                                      )}
                                    </span>
                                    {reasoningPanelStreamingOpen ? (
                                      <span class={styles.thinkingSummaryTail}>
                                        <span class={styles.thinkingSpin} role="status" aria-label={COPY_REASONING_PANEL_STREAMING} />
                                      </span>
                                    ) : (
                                      <span class={styles.thinkingSummaryTail} aria-hidden="true">
                                        <span class={styles.thinkingPanelDoneMark} title={COPY_REASONING_PANEL_DONE}>
                                          <svg class={styles.thinkingPanelDoneSvg} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                            <path
                                              d="M20 6L9 17l-5-5"
                                              fill="none"
                                              stroke="#16a34a"
                                              stroke-width="2.6"
                                              stroke-linecap="round"
                                              stroke-linejoin="round"
                                            />
                                          </svg>
                                        </span>
                                      </span>
                                    )}
                                  </summary>
                                  <ReasoningTreeView
                                    tree={item.reasoning}
                                    tokenItems={pickMessageTokenUsage(item, liveTurnTokenUsage.value, activeTurnId.value)?.items ?? []}
                                  />
                                </details>
                              ) : null}
                              {showThinkingPlaceholder ? (
                                <div class={styles.thinkingPlaceholder}>
                                  <span class={styles.thinkingPlaceholderLabel}>{COPY_REPLY_GENERATING}</span>
                                  <span class={styles.thinkingSpin} role="status" aria-label={COPY_REPLY_GENERATING} />
                                  <span class={styles.typingDots}>
                                    <span />
                                    <span />
                                    <span />
                                  </span>
                                </div>
                              ) : null}
                              {assistantBodyContent.trim() !== "" ? (
                                commandDisplay ? (
                                  <p>{commandDisplay}</p>
                                ) : (
                                  <AssistantMessageBody content={assistantBodyContent} mediaBaseUrl={agenticEngineBase} />
                                )
                              ) : sending.value && !showThinkingPlaceholder ? (
                                <span class={styles.typingDots} role="status" aria-label={COPY_REPLY_GENERATING}>
                                  <span />
                                  <span />
                                  <span />
                                </span>
                              ) : item.role === "assistant" && isLast && !sending.value && item.content.trim() === "" ? (
                                <p class={styles.replyBodyEmptyHint} role="status">
                                  {COPY_EMPTY_REPLY_HINT}
                                </p>
                              ) : null}
                            </>
                          ) : (
                            <>
                              {item.attachments != null && item.attachments.length > 0 ? (
                                <AssistantUserAttachments attachments={item.attachments} mediaBaseUrl={agenticEngineBase} />
                              ) : null}
                              {item.content.trim() !== "" ? <p>{item.content}</p> : null}
                            </>
                          )}
                          <div class={styles.messageTime}>{formatMessageTime(item.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <AssistantConsentModal
            grant={pendingGrants.value[0] ?? null}
            onApprove={(scope) => void handleConsentApprove(scope)}
            onDeny={(reason) => void handleConsentDeny(reason)}
          />

          <div class={[styles.composerWrap, styles.drawerComposerWrap, props.fullscreen && styles.drawerComposerWrapFullscreen]}>
            <div class={[styles.composerInner, styles.drawerComposerInner]}>
              <div class={styles.drawerQuickActions}>
                <button
                  type="button"
                  class={styles.drawerQuickButton}
                  disabled={!canUseAssistant.value}
                  onClick={() => void createNewConversation()}
                >
                  <PlusCircleOutlined class={styles.drawerQuickButtonIcon} />
                  <span>新建对话</span>
                </button>
                <button
                  type="button"
                  class={[styles.drawerQuickButton, showHistoryPanel.value && styles.drawerQuickButtonActive]}
                  onClick={() => {
                    showHistoryPanel.value = !showHistoryPanel.value;
                  }}
                >
                  <ClockCircleOutlined class={styles.drawerQuickButtonIcon} />
                  <span>历史对话</span>
                </button>
              </div>
              {skillChipOptions.value.length > 0 && (
                <div class={styles.skillChipRow}>
                  {skillChipOptions.value.map((skill) => {
                    const selected = selectedReferenceKeys.value.has(composerReferenceKey(skill));
                    return (
                      <button
                        type="button"
                        key={composerReferenceKey(skill)}
                        class={[styles.skillChip, selected && styles.skillChipSelected]}
                        title={skill.description || skill.label}
                        onClick={() => toggleReference(skill)}
                      >
                        {skill.label}
                      </button>
                    );
                  })}
                </div>
              )}
              <div class={[styles.composer, styles.drawerComposer]}>
                {pendingAttachments.value.length > 0 && (
                  <div class={styles.composerPendingRow}>
                    {pendingAttachments.value.map((att) => (
                      <span key={att.attachmentId} class={styles.composerPendingThumb}>
                        <img
                          src={att.localPreviewUrl ?? resolveAttachmentPreviewSrc(att.previewUrl, agenticEngineBase)}
                          alt={att.fileName ?? att.fileId}
                        />
                        <button
                          type="button"
                          class={styles.composerPendingRemove}
                          title="移除图片"
                          onClick={() => removePendingAttachment(att.attachmentId)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {filterComposerReferenceTokens(filterManualComposerReferences(selectedReferences.value)).length > 0 && (
                  <div class={styles.referenceTokenRow}>
                    {filterComposerReferenceTokens(filterManualComposerReferences(selectedReferences.value)).map((ref) => (
                      <span
                        key={composerReferenceKey(ref)}
                        class={[styles.referenceToken, ref.type === "kb" ? styles.referenceTokenKb : styles.referenceTokenSkill]}
                      >
                        {ref.type === "kb" ? (
                          <BookOutlined class={styles.referenceTokenIcon} />
                        ) : (
                          <ThunderboltOutlined class={styles.referenceTokenIcon} />
                        )}
                        <span class={styles.referenceTokenType}>{ref.type === "kb" ? "知识库" : "技能"}</span>
                        <span class={styles.referenceTokenLabel}>{ref.label}</span>
                        <button
                          type="button"
                          class={styles.referenceTokenRemove}
                          title="移除引用"
                          onClick={(event: MouseEvent) => {
                            event.stopPropagation();
                            removeReference(ref);
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  ref={composerFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  class={styles.composerFileInputHidden}
                  onChange={(event: Event) => {
                    const input = event.target as HTMLInputElement;
                    const files = input.files != null ? [...input.files] : [];
                    input.value = "";
                    void addComposerImageFiles(files);
                  }}
                />
                <textarea
                  ref={composerTextareaRef}
                  class={[styles.textareaNative, styles.drawerTextareaNative]}
                  value={inputText.value}
                  disabled={!canUseAssistant.value}
                  placeholder={canUseAssistant.value ? COPY_COMPOSER_PLACEHOLDER : COPY_NO_USER_AGENTS}
                  onPaste={handleComposerPaste}
                  onInput={(event: Event) => {
                    const el = event.target as HTMLTextAreaElement;
                    inputText.value = el.value;
                    referenceMenu.syncFromTextarea(el.value, el.selectionStart ?? el.value.length);
                    if (referenceMenu.activeReferenceTrigger.value != null) {
                      showModelMenu.value = false;
                    }
                    adjustComposerTextareaHeight();
                  }}
                  onKeydown={(event: KeyboardEvent) => {
                    if (event.key === "Escape" && referenceMenu.showReferenceMenu.value) {
                      event.preventDefault();
                      referenceMenu.closeReferenceMenu();
                      return;
                    }
                    if (
                      (event.key === "Enter" || event.key === "Tab") &&
                      referenceMenu.activeReferenceTrigger.value != null &&
                      referenceMenu.showReferenceMenu.value &&
                      referenceMenu.filteredReferenceList.value.length > 0
                    ) {
                      event.preventDefault();
                      toggleReference(referenceMenu.filteredReferenceList.value[0]!);
                      return;
                    }
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                />
                <div class={styles.composerDock}>
                  <div class={styles.dockLeft}>
                    <button
                      type="button"
                      class={styles.iconBtn}
                      title="添加图片"
                      disabled={composerImageUploading.value || pendingAttachments.value.length >= MAX_COMPOSER_IMAGES}
                      onClick={() => composerFileInputRef.value?.click()}
                    >
                      <PlusOutlined />
                    </button>
                    <span class={styles.dockDivider} />
                    <div class={styles.composerModelWrap}>
                      <button
                        type="button"
                        class={styles.composerModelTrigger}
                        onClick={toggleModelMenu}
                        disabled={llmOptions.value.length === 0}
                        title={selectedModel.value?.modelCode ?? selectedModelLabel.value}
                      >
                        <span class={styles.composerModelTriggerLabel}>{selectedModel.value?.displayName ?? selectedModelLabel.value}</span>
                        <DownOutlined class={styles.modelChevron} />
                      </button>
                      {showModelMenu.value && (
                        <>
                          <div class={styles.modelOverlay} onClick={closeModelMenu} />
                          <div
                            class={[styles.modelDropdown, styles.composerModelDropdown]}
                            onClick={(event: MouseEvent) => event.stopPropagation()}
                          >
                            <div class={styles.modelDropdownHead}>选择模型</div>
                            <div class={styles.modelDropdownSearch}>
                              <div class={styles.modelSearchWrap}>
                                <SearchOutlined class={styles.modelSearchIcon} />
                                <input
                                  ref={modelSearchInputRef}
                                  class={styles.modelSearchInput}
                                  placeholder="搜索模型名称或编码"
                                  value={modelMenuQuery.value}
                                  onInput={(event: Event) => {
                                    modelMenuQuery.value = (event.target as HTMLInputElement).value;
                                  }}
                                />
                              </div>
                            </div>
                            <div class={styles.modelOptionList}>
                              {llmOptionsLoading.value && llmOptions.value.length === 0 ? (
                                <div class={styles.modelOption}>加载中…</div>
                              ) : llmOptions.value.length === 0 ? (
                                <div class={styles.modelOption}>暂无可用模型，请先到模型管理新增</div>
                              ) : groupedLlmOptions.value.length === 0 ? (
                                <div class={styles.modelEmpty}>未找到匹配模型</div>
                              ) : (
                                groupedLlmOptions.value.map((group) => (
                                  <div key={group.providerName} class={styles.modelProviderGroup}>
                                    {group.providerName ? <div class={styles.modelProviderHead}>{group.providerName}</div> : null}
                                    {group.items.map((option) => (
                                      <button
                                        type="button"
                                        key={option.modelCode}
                                        class={[
                                          styles.modelOption,
                                          selectedModelCode.value === option.modelCode && styles.modelOptionActive,
                                        ]}
                                        title={option.modelCode}
                                        onClick={() => pickModel(option.modelCode)}
                                      >
                                        <span class={[styles.modelOptionIcon, styles.modelOptionIconLetter]} aria-hidden="true">
                                          {modelNameInitial(option.displayName ?? option.modelCode)}
                                        </span>
                                        <span class={styles.modelOptionBody}>
                                          <span class={styles.modelOptionTitle}>{option.displayName}</span>
                                          <span class={styles.modelOptionCode}>{option.modelCode}</span>
                                        </span>
                                        {selectedModelCode.value === option.modelCode && <span class={styles.modelOptionCheck} />}
                                      </button>
                                    ))}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {kbRefsUiEnabled ? (
                      <button
                        type="button"
                        class={[
                          styles.toolPill,
                          (selectedKbCount.value > 0 ||
                            (referenceMenu.showReferenceMenu.value && referenceMenu.referenceMenuType.value === "kb")) &&
                            styles.toolPillKbActive,
                        ]}
                        onClick={(event: MouseEvent) => {
                          referenceMenu.toggleForKb(event);
                          showModelMenu.value = false;
                          showAgentMenu.value = false;
                        }}
                      >
                        <BookOutlined class={styles.toolPillIcon} />
                        <span>{selectedKbCount.value > 0 ? `知识库 ${selectedKbCount.value}` : "知识库"}</span>
                      </button>
                    ) : null}
                    {referenceMenu.showReferenceMenu.value && (
                      <ReferencePickerPopover
                        menuType={referenceMenu.referenceMenuType.value}
                        query={referenceMenu.referenceMenuQuery.value}
                        items={referenceMenu.filteredReferenceList.value}
                        selectedKeys={selectedReferenceKeys.value}
                        onClose={() => referenceMenu.closeReferenceMenu()}
                        onUpdate:query={(query) => {
                          referenceMenu.referenceMenuQuery.value = query;
                        }}
                        onToggle={toggleReference}
                      />
                    )}
                  </div>
                  <div class={styles.dockRight}>
                    <button type="button" class={styles.iconBtn} title="语音">
                      <AudioOutlined />
                    </button>
                    <button
                      type="button"
                      class={[
                        styles.sendBtn,
                        sending.value ? styles.stopBtnReady : canComposerSend.value ? styles.sendBtnReady : styles.sendBtnDisabled,
                      ]}
                      disabled={!sending.value && !canComposerSend.value}
                      title={sending.value ? "停止生成" : "发送"}
                      aria-label={sending.value ? "停止生成" : "发送"}
                      onClick={() => {
                        if (sending.value) {
                          void handleCancel();
                        } else {
                          void handleSend();
                        }
                      }}
                    >
                      {sending.value ? <StopOutlined /> : <SendOutlined />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showAgentMenu.value && (
            <>
              <div class={styles.modelOverlay} onClick={closeAgentMenu} />
              <div class={[styles.modelDropdown, styles.drawerAgentDropdown]} onClick={(event: MouseEvent) => event.stopPropagation()}>
                <div class={styles.modelDropdownHead}>选择智能体</div>
                <div class={styles.modelDropdownSearch}>
                  <div class={styles.modelSearchWrap}>
                    <SearchOutlined class={styles.modelSearchIcon} />
                    <input
                      ref={agentSearchInputRef}
                      class={styles.modelSearchInput}
                      placeholder="搜索智能体名称"
                      value={agentMenuQuery.value}
                      onInput={(event: Event) => {
                        agentMenuQuery.value = (event.target as HTMLInputElement).value;
                      }}
                    />
                  </div>
                </div>
                <div class={styles.modelOptionList}>
                  {agentOptionsLoading.value && agentOptions.value.length === 0 ? (
                    <div class={styles.modelOption}>加载中…</div>
                  ) : !hasUserAgents.value ? (
                    <div class={styles.modelEmpty}>{COPY_NO_USER_AGENTS}</div>
                  ) : filteredAgentOptions.value.length === 0 ? (
                    <div class={styles.modelEmpty}>未找到匹配智能体</div>
                  ) : (
                    filteredAgentOptions.value.map((agent) => (
                      <button
                        type="button"
                        key={agent.id}
                        class={[styles.modelOption, selectedAgentId.value === agent.id && styles.modelOptionActive]}
                        title={agent.description}
                        onClick={() => pickAgent(agent.id)}
                      >
                        <span class={[styles.modelOptionIcon, agent.avatarUrl?.trim() ? styles.modelOptionIconHasImage : undefined]}>
                          <img
                            class={agent.avatarUrl?.trim() ? styles.modelOptionIconImg : styles.drawerBrandIcon}
                            src={agent.avatarUrl?.trim() || DRAWER_BRAND_ICON_SRC}
                            alt=""
                            aria-hidden="true"
                          />
                        </span>
                        <span class={styles.modelOptionBody}>
                          <span class={styles.modelOptionTitle}>{agent.name}</span>
                          {agent.description ? <span class={styles.modelOptionCode}>{agent.description}</span> : null}
                        </span>
                        {selectedAgentId.value === agent.id && <span class={styles.modelOptionCheck} />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    );
  },
});
