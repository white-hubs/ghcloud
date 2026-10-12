import { type Dnd, type Graph, type Node } from "@antv/x6";
import { ConfigProvider as AntdConfigProvider } from "ant-design-vue/es";
import Checkbox from "ant-design-vue/es/checkbox";
import InputNumber from "ant-design-vue/es/input-number";

import type {
  FlowComponentCatalogItem,
  FlowDebugResult,
  FlowExecutionInputFileRef,
  FlowFileUploadResult,
  FlowIssueItem,
  ModelItem,
} from "@ghcloud/cube-ai-application-service";
import { CubeLayout } from "@ghcloud/cube-app-design";
import { SpeechInputController, type SpeechInputStatus } from "@ghcloud/cube-speech-assistant";
import {
  AntModal,
  AudioMutedOutlined,
  AudioOutlined,
  Button,
  Input,
  LoadingOutlined,
  SearchOutlined,
  Spin,
  Switch,
  Tooltip,
  message,
} from "@ghcloud/cube-ui";
/** 右侧面板专用：直接使用 ant 组件，避免 cube-ui Input 默认 showCount/maxlength */
import { Select as AntSelect } from "ant-design-vue";
import AntInput, { Textarea as AntTextarea } from "ant-design-vue/es/input";
import Pagination from "ant-design-vue/es/pagination";
import { Teleport, computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { KnowledgeDocumentModel } from "@ghcloud/cube-knowledge-document-service";

import { cubeKnowledgeDocumentService } from "@/api/service";
import { ThemedSlider } from "@/components/themed-slider/themed-slider";
import { useFlowEditorStore } from "@/store/flow-editor.store";
import {
  type FlowEdgeData,
  type FlowGraphData,
  type FlowNodeConfig,
  type FlowNodeShape,
  ensureBuiltinProtocols,
  fallbackFlowNodeConfig,
  flowNodeShapeForComponentKey,
  flowNodeSizeForComponentKey,
  resolveFlowNodeCanvasHeight,
} from "@/types/flow";
import { filterModelsForFlowNode, flowModelSelectKindFromComponentKey } from "@/util/llm-model-node-kind";
import { resolveLlmThinkingControl } from "@/util/llm-thinking-control";
import { FLOW_EDITOR_MODEL_ICON_FALLBACK, iconSrcFromModelIconUrl } from "@/util/model-canvas-icon";
import { WorkflowReplyContent } from "@/util/workflow-reply-content";
import { FLOW_EDGE_ATTRS, registerFlowEdges } from "@/x6/edges";
import {
  coerceInputPortId,
  coerceOutputPortId,
  firstInputPortId,
  flowEdgeFeedsIfElseInputText,
  flowEdgeFeedsImageGenerationPrompt,
  flowEdgeFeedsLanguageModelInput,
  ifElseDynamicInputPortNames,
  ifElseResolvedEnableFlags,
} from "@/x6/flow-ports";
import { createFlowDnd, createFlowGraph, resolveMagnetPortMeta } from "@/x6/graph";
import {
  buildFlowNodePorts,
  createPaletteNode,
  measureFlowNodeHeight,
  registerFlowNodes,
  syncFlowNodeOutlines,
  updateFlowNodePresentation,
} from "@/x6/nodes";

import styles from "./flow-editor.module.less";

function presentationFieldDescription(field: { description?: unknown }): string {
  if (typeof field.description === "string" && field.description.trim() !== "") {
    return field.description.trim();
  }
  return "";
}

/** 条件分支：持久化与 cube-ai 约定为字符串 true / false */
function normalizeIfElseDefaultRoute(raw: unknown): "true" | "false" {
  if (raw === false || raw === 0) {
    return "false";
  }
  if (raw === true || raw === 1) {
    return "true";
  }
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (s === "false" || s === "false_result" || s.endsWith("_false")) {
    return "false";
  }
  if (s === "true" || s === "true_result" || s.endsWith("_true")) {
    return "true";
  }
  return "true";
}

const IF_ELSE_OPERATOR_OPTIONS: { value: string; label: string }[] = [
  { value: "equals", label: "等于" },
  { value: "not_equals", label: "不等于" },
  { value: "contains", label: "包含" },
  { value: "not_contains", label: "不包含" },
  { value: "starts_with", label: "开头为" },
  { value: "ends_with", label: "结尾为" },
  { value: "regex", label: "正则匹配" },
  { value: "gt", label: "大于" },
  { value: "lt", label: "小于" },
  { value: "gte", label: "大于等于" },
  { value: "lte", label: "小于等于" },
];

/** Header「已自动保存」旁展示本地时钟「时:分」（24 小时制） */
function formatAutoSaveHm(date: Date | null): string {
  if (!date) {
    return "--:--";
  }
  const hh = date.getHours();
  const mm = date.getMinutes();
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** 与 knowledge-document-list 一致：静态资源走 `/resource/v1/ai-application/` */
const FLOW_PALETTE_ICON_PREFIX = "/resource/v1/ai-application/";
const FLOW_PALETTE_ICON_BY_KEY: Record<string, string> = {
  "chat-input": "chatinput.png",
  "chat-output": "chatoutput.png",
  agent: "agent.png",
  "language-model": "llm.png",
  "image-generation": "llm.png",
  "prompt-template": "promptTemplate.png",
  "smart-router": "smartRoute.png",
  "knowledge-retrieval": "kbSearch.png",
  "if-else": "ifElse.png",
  loop: "loop.png",
  notify: "notify.png",
  mcp: "mcp.png",
};

function paletteIconSrc(componentKey: string): string | null {
  const file = FLOW_PALETTE_ICON_BY_KEY[componentKey];
  return file ? `${FLOW_PALETTE_ICON_PREFIX}${file}` : null;
}

/** 左侧物料无图标资源时的字母色块：按 componentKey 稳定色相 */
function paletteHue(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h + key.charCodeAt(i) * 37) % 360;
  }
  return h;
}

/** 与下拉选项文案一致：展示模型编号 `modelCode`，不用 `display_name` */
function flowEditorModelOptionLabel(item: ModelItem, variant: "languagePanel" | "schemaRef" = "languagePanel"): string {
  if (typeof item.providerName === "string" && item.providerName.trim() !== "") {
    return `${item.providerName} · ${item.modelCode}`;
  }
  if (variant === "schemaRef") {
    return item.modelCode;
  }
  return `${item.modelCode} · ${item.groupName}`;
}

function flowEditorModelIconSrc(item: ModelItem): string {
  return iconSrcFromModelIconUrl(item.iconUrl);
}

function flowEditorModelOptionRow(item: ModelItem, variant: "languagePanel" | "schemaRef"): JSX.Element {
  const text = flowEditorModelOptionLabel(item, variant);
  return (
    <span class={styles.modelOptionRow}>
      <span class={styles.modelOptionIconWrap}>
        <img
          class={styles.modelOptionIcon}
          src={flowEditorModelIconSrc(item)}
          alt=""
          aria-hidden
          onError={(event) => {
            const el = event.currentTarget as HTMLImageElement;
            if (!el.src.includes("getModel.png")) {
              el.src = FLOW_EDITOR_MODEL_ICON_FALLBACK;
            }
          }}
        />
      </span>
      <span class={styles.modelOptionText}>{text}</span>
    </span>
  );
}

const statusTextMap: Record<string, string> = {
  draft: "草稿",
  compiled: "已编译",
  compile_failed: "编译失败",
};

/** 仅比较边的逻辑连接（含端口 id）；节点移动不会改变该签名，避免误触发整图重灌 */
function edgeSnapshotSignature(edges: FlowEdgeData[]): string {
  return edges
    .map((e) => `${e.id}|${e.source}|${e.target}|${e.sourcePort ?? ""}|${e.targetPort ?? ""}`)
    .sort()
    .join(";");
}

/** Pinia 与画布：节点集合或边的端口/拓扑不一致时需要 applyGraphToCanvas（仅节点 id 相同但边未同步时旧逻辑会漏掉） */
function canvasNeedsStoreResync(graph: Graph, graphData: FlowGraphData): boolean {
  const currentNodeIds = new Set(graph.getNodes().map((n) => n.id));
  const nextNodeIds = new Set(graphData.nodes.map((n) => n.id));
  if (currentNodeIds.size !== nextNodeIds.size || [...currentNodeIds].some((id) => !nextNodeIds.has(id))) {
    return true;
  }
  if (graph.getEdges().length !== graphData.edges.length) {
    return true;
  }
  return edgeSnapshotSignature(buildGraphDataFromGraph(graph).edges) !== edgeSnapshotSignature(graphData.edges);
}

function buildGraphDataFromGraph(graph: Graph): FlowGraphData {
  return {
    nodes: graph.getNodes().map((node) => {
      const position = node.position();
      const size = node.size();
      const data = node.getData<FlowNodeConfig>();
      const shape = (node.shape || flowNodeShapeForComponentKey(data.componentKey)) as FlowNodeShape;
      return {
        id: node.id,
        shape,
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
        data,
      };
    }),
    edges: graph.getEdges().map((edge) => ({
      id: edge.id,
      source: edge.getSourceCellId() ?? "",
      target: edge.getTargetCellId() ?? "",
      sourcePort: coerceOutputPortId(nodeConfigOrEmpty(graph, edge.getSourceCellId() ?? ""), edge.getSourcePortId()),
      targetPort: coerceInputPortId(nodeConfigOrEmpty(graph, edge.getTargetCellId() ?? ""), edge.getTargetPortId()),
    })),
  };
}

/** 用户输入 ↔ DSL `input`；旧数据仅有 userMessage */
function languageModelPanelInputValue(config: Record<string, unknown> | undefined): string {
  if (config == null) {
    return "";
  }
  if (Object.hasOwn(config, "input")) {
    const v = config.input;
    return v == null ? "" : String(v);
  }
  if (Object.hasOwn(config, "userMessage")) {
    return config.userMessage == null ? "" : String(config.userMessage);
  }
  return "";
}

/** 语言模型面板 · 采样参数（与 chat/completions 请求体字段对齐） */
const LLM_PANEL_INPUT_NUMBER_THEME = {
  components: {
    InputNumber: {
      colorText: "#475569",
      fontSize: 13,
    },
  },
};

function readLlmFloat(cfg: Record<string, unknown>, key: string, fallback: number, min: number, max: number): number {
  const raw = cfg[key];
  const n = typeof raw === "number" ? raw : Number.parseFloat(String(raw ?? ""));
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(Math.max(n, min), max);
}

function readLlmInt(cfg: Record<string, unknown>, key: string, fallback: number, min: number, max: number): number {
  const raw = cfg[key];
  const n = typeof raw === "number" ? raw : Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(Math.max(Math.round(n), min), max);
}

/** 智能体面板的滑动条：缺省回退到内置默认并钳制到滑轨范围 */
/** 可选；仅当 JSON 内 `bizData.url` 非空时 sync 会注入 MCPTools 并连到 Agent tools */
const AGENT_MCP_SERVICE_CONFIG_PLACEHOLDER = `{
  "bizData": {
    "url": "",
    "headers": {},
    "timeout": 50,
    "sse_read_timeout": 50
  }
}`;

const AGENT_DEFAULT_MAX_ITERATIONS = 15;
const AGENT_MAX_ITERATIONS_SLIDER_MAX = 100;
const AGENT_DEFAULT_N_MESSAGES = 20;
const AGENT_N_MESSAGES_SLIDER_MAX = 200;

/** 知识库检索：与运行时 normalizeTopK / normalizeScoreThreshold 默认一致 */
const KB_DEFAULT_TOPK = 5;
const KB_DEFAULT_SCORE = 0.4;
const KB_TOPK_MAX = 20;
/** 循环节点右侧面板仅展示说明，不展示 schema 表单项与配置 JSON */
const LOOP_NODE_PANEL_DESCRIPTION = "遍历 Data 或 Message 对象并逐项处理，汇总来自循环输入的结果。";

function clampKbTopK(n: number): number {
  if (!Number.isFinite(n) || n <= 0) {
    return KB_DEFAULT_TOPK;
  }
  return Math.min(Math.round(n), KB_TOPK_MAX);
}

function clampKbScore(n: number): number {
  if (!Number.isFinite(n)) {
    return KB_DEFAULT_SCORE;
  }
  const c = Math.min(Math.max(n, 0), 1);
  return Math.round(c * 10) / 10;
}

interface KnowledgeSourceEditorRow {
  documentId: string;
  documentName: string;
  topK: number;
  scoreThreshold: number;
}

function mergeNodeConfigPatch(base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) {
      delete next[key];
    } else {
      next[key] = value;
    }
  }
  return next;
}

/** 解析节点配置中的知识源列表（含旧版 documentIds + 全局 topK / 阈值） */
function parseKnowledgeSources(cfg: Record<string, unknown>): KnowledgeSourceEditorRow[] {
  const raw = cfg.knowledgeSources;
  if (Object.hasOwn(cfg, "knowledgeSources") && Array.isArray(raw)) {
    const rows: KnowledgeSourceEditorRow[] = [];
    for (const item of raw) {
      if (item == null || typeof item !== "object" || Array.isArray(item)) {
        continue;
      }
      const o = item as Record<string, unknown>;
      const documentId = typeof o.documentId === "string" ? o.documentId.trim() : "";
      if (documentId === "") {
        continue;
      }
      const documentName = typeof o.documentName === "string" ? o.documentName.trim() : "";
      const topK = clampKbTopK(
        typeof o.topK === "number"
          ? o.topK
          : typeof o.top_k === "number"
            ? o.top_k
            : Number.parseInt(String(o.topK ?? o.top_k ?? KB_DEFAULT_TOPK), 10),
      );
      const scoreThreshold = clampKbScore(
        Number.parseFloat(String(o.scoreThreshold ?? o.min_score ?? o.minScore ?? o.minSimilarity ?? KB_DEFAULT_SCORE)),
      );
      rows.push({ documentId, documentName, topK, scoreThreshold });
    }
    return rows;
  }
  const legacyIds = cfg.documentIds;
  if (!Array.isArray(legacyIds) || legacyIds.length === 0) {
    return [];
  }
  const legacyTopK = clampKbTopK(typeof cfg.topK === "number" ? cfg.topK : Number.parseInt(String(cfg.topK ?? KB_DEFAULT_TOPK), 10));
  const legacyScore = clampKbScore(Number.parseFloat(String(cfg.scoreThreshold ?? cfg.minScore ?? cfg.min_similarity ?? KB_DEFAULT_SCORE)));
  return legacyIds
    .map((id) => String(id).trim())
    .filter((id) => id !== "")
    .map((documentId) => ({
      documentId,
      documentName: "",
      topK: legacyTopK,
      scoreThreshold: legacyScore,
    }));
}

function readAgentIntField(
  cfg: Record<string, unknown>,
  snake: "max_iterations" | "n_messages",
  camel: "maxIterations" | "nMessages",
  fallback: number,
  min: number,
  max: number,
): number {
  let raw: unknown;
  if (Object.hasOwn(cfg, snake)) {
    raw = cfg[snake];
  } else if (Object.hasOwn(cfg, camel)) {
    raw = cfg[camel];
  } else {
    raw = undefined;
  }
  if (raw === undefined || raw === null || raw === "") {
    return fallback;
  }
  const n = typeof raw === "number" ? raw : Number.parseInt(String(raw), 10);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(Math.max(Math.round(n), min), max);
}

/** 语言模型采样项是否参与请求体（未持久化字段默认关闭） */
function readLlmUse(cfg: Record<string, unknown>, key: string, fallback: boolean): boolean {
  if (!Object.hasOwn(cfg, key)) {
    return fallback;
  }
  const v = cfg[key];
  if (typeof v === "boolean") {
    return v;
  }
  if (v === false || v === 0 || v === "0" || v === "false") {
    return false;
  }
  if (v === true || v === 1 || v === "1" || v === "true") {
    return true;
  }
  return fallback;
}

interface LlmInferenceParamDef {
  useKey: string;
  valueKey: string;
  label: string;
  tip: string;
  min: number;
  max: number;
  step: number;
  mode: "float" | "int";
  defaultNum: number;
  /** 小数位数（仅 float 行用于展示与步进；int 为 0） */
  precision: number;
}

function roundLlmFloatByPrecision(n: number, precision: number): number {
  if (precision <= 0) {
    return n;
  }
  const f = 10 ** precision;
  return Math.round(n * f) / f;
}

const LLM_INFERENCE_PARAM_DEFS: readonly LlmInferenceParamDef[] = [
  {
    useKey: "useTemperature",
    valueKey: "temperature",
    label: "温度",
    tip: "控制采样随机性；与 Top P 同界 0～1，仅一位小数",
    min: 0,
    max: 1,
    step: 0.1,
    mode: "float",
    defaultNum: 0.7,
    precision: 1,
  },
  {
    useKey: "useTopP",
    valueKey: "topP",
    label: "Top P",
    tip: "核采样；与温度同为 0～1，仅一位小数",
    min: 0,
    max: 1,
    step: 0.1,
    mode: "float",
    defaultNum: 1,
    precision: 1,
  },
  {
    useKey: "useTopK",
    valueKey: "topK",
    label: "Top K",
    tip: "每步仅从前 K 个候选中采样（厂商扩展字段）",
    min: 1,
    max: 100,
    step: 1,
    mode: "int",
    defaultNum: 1,
    precision: 0,
  },
  {
    useKey: "usePresencePenalty",
    valueKey: "presencePenalty",
    label: "存在惩罚",
    tip: "惩罚已出现过的 token，鼓励谈及新话题",
    min: -2,
    max: 2,
    step: 0.1,
    mode: "float",
    defaultNum: 0,
    precision: 1,
  },
  {
    useKey: "useFrequencyPenalty",
    valueKey: "frequencyPenalty",
    label: "频率惩罚",
    tip: "惩罚高频重复用词",
    min: -2,
    max: 2,
    step: 0.1,
    mode: "float",
    defaultNum: 0,
    precision: 1,
  },
  {
    useKey: "useMaxTokens",
    valueKey: "maxTokens",
    label: "最大输出 Token",
    tip: "单次回复生成的最大 token 数上限",
    min: 1,
    max: 8192,
    step: 1,
    mode: "int",
    defaultNum: 512,
    precision: 0,
  },
];

/** 焦点在可编辑控件内时不拦截快捷键（避免删画布节点误伤表单输入） */
interface PlaygroundMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  attachments?: PlaygroundAttachment[];
  issues?: FlowIssueItem[];
  /** 解析得到的最终回复正文 */
  finalOutputText?: string | null;
}

interface PlaygroundAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  previewUrl: string;
}

interface PlaygroundPendingAttachment extends PlaygroundAttachment {
  file: File;
}

function isEditableFieldTarget(target: EventTarget | null): boolean {
  const el = target instanceof HTMLElement ? target : null;
  if (!el) {
    return false;
  }
  if (el.isContentEditable) {
    return true;
  }
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
    return true;
  }
  return Boolean(el.closest('input, textarea, select, [contenteditable="true"]'));
}

function nodeConfigOrEmpty(graph: Graph, nodeId: string): FlowNodeConfig {
  const node = graph.getCellById(nodeId);
  if (node?.isNode()) {
    return ensureBuiltinProtocols(node.getData<FlowNodeConfig>());
  }
  return fallbackFlowNodeConfig("processor");
}

export const FlowEditor = defineComponent({
  name: "FlowEditor",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useFlowEditorStore();
    const graphContainerRef = ref<HTMLDivElement | null>(null);
    const minimapContainerRef = ref<HTMLDivElement | null>(null);
    const zoomPercent = ref(100);
    /** 调试对话请求进行中（仅侧栏内发送；与发布独立） */
    const playgroundRequesting = ref(false);
    /** 当前调试请求的 AbortController；请求结束后置空 */
    let playgroundDebugAbort: AbortController | null = null;
    /** 用户点击「停止响应」：立即收起加载态，并忽略随后迟到的调试结果 */
    const playgroundUserStopped = ref(false);
    /** 发布请求进行中 */
    const publishRequesting = ref(false);
    const debugDrawerVisible = ref(false);
    const playgroundMessages = ref<PlaygroundMessage[]>([]);
    const playgroundInput = ref("");
    const playgroundFileInputRef = ref<HTMLInputElement | null>(null);
    const playgroundPendingAttachments = ref<PlaygroundPendingAttachment[]>([]);
    /** 调试输入区：@ghcloud/cube-speech-assistant（SpeechInputController，PC 点击切换录音） */
    const playgroundSpeechStatus = ref<SpeechInputStatus>("idle");
    let playgroundSpeechController: SpeechInputController | undefined;

    function getPlaygroundSpeechController(): SpeechInputController {
      if (!playgroundSpeechController) {
        playgroundSpeechController = new SpeechInputController({
          onStateChange: (state) => {
            playgroundSpeechStatus.value = state.status;
          },
          onTranscribed: (text) => {
            const normalized = text.trim();
            if (normalized === "") {
              return;
            }
            const cur = playgroundInput.value;
            const needSpace = cur !== "" && !/\s$/.test(cur);
            playgroundInput.value = needSpace ? `${cur} ${normalized}` : `${cur}${normalized}`;
          },
          onError: (error) => {
            message.error(error instanceof Error ? error.message : "语音识别失败");
          },
        });
      }
      return playgroundSpeechController;
    }
    const playgroundScrollRef = ref<HTMLDivElement | null>(null);
    let playgroundScrollRaf: number | null = null;
    const syncingGraph = ref(false);
    const rawConfigText = ref("{}");
    const llmParamsModalVisible = ref(false);
    const knowledgePickModalVisible = ref(false);
    const knowledgeBatchModalVisible = ref(false);
    const KNOWLEDGE_PICK_PAGE_SIZE_DEFAULT = 20;
    const knowledgePickPage = ref(1);
    const knowledgePickPageSize = ref(KNOWLEDGE_PICK_PAGE_SIZE_DEFAULT);
    const knowledgePickTotal = ref(0);
    const knowledgePickRecords = ref<KnowledgeDocumentModel[]>([]);
    const knowledgePickLoading = ref(false);
    const knowledgePickKeyword = ref("");
    /** 弹窗内勾选待添加的文档 id（跨分页保留） */
    const knowledgePickCheckedIds = ref<string[]>([]);
    const knowledgePickNameById = ref<Record<string, string>>({});
    const knowledgeBatchTopK = ref(KB_DEFAULT_TOPK);
    const knowledgeBatchScore = ref(KB_DEFAULT_SCORE);
    const flowId = computed(() => String(route.params.flowId ?? ""));

    const componentGroups = computed(() => {
      const groups = new Map<string, FlowComponentCatalogItem[]>();
      for (const component of store.components) {
        if (component.componentKey === "webhook") {
          continue;
        }
        if (component.enabled === false) {
          continue;
        }
        const groupName = component.componentGroup ?? "未分组";
        if (!groups.has(groupName)) {
          groups.set(groupName, []);
        }
        groups.get(groupName)?.push(component);
      }
      return Array.from(groups.entries()).map(([groupName, items]) => ({ groupName, items }));
    });
    const selectedComponent = computed(() =>
      store.selectedNode ? (store.componentMap.get(store.selectedNode.data.componentKey) ?? null) : null,
    );
    /** 知识检索节点已在配置中的文档 id（弹窗列表中禁用勾选） */
    const existingKnowledgeDocIdsInNode = computed(() => {
      const n = store.selectedNode;
      if (!n || n.data.componentKey !== "knowledge-retrieval") {
        return new Set<string>();
      }
      return new Set(parseKnowledgeSources(n.data.config).map((r) => r.documentId));
    });
    /** 语言模型已有上游 input 连线时，面板「用户输入」与运行时合并策略冲突，故禁用（内容以连线为准） */
    const languageModelInputLocked = computed(() => {
      const n = store.selectedNode;
      if (!n || n.data.componentKey !== "language-model") {
        return false;
      }
      return flowEdgeFeedsLanguageModelInput(store.graphData.edges, n.id, ensureBuiltinProtocols(n.data));
    });
    const imageGenerationPromptLocked = computed(() => {
      const n = store.selectedNode;
      if (!n || n.data.componentKey !== "image-generation") {
        return false;
      }
      return flowEdgeFeedsImageGenerationPrompt(store.graphData.edges, n.id, ensureBuiltinProtocols(n.data));
    });
    /** 文本输入口有上游连线时禁用侧栏填写（与 LLM 用户输入一致） */
    const ifElseInputTextLocked = computed(() => {
      const n = store.selectedNode;
      if (!n || n.data.componentKey !== "if-else") {
        return false;
      }
      return flowEdgeFeedsIfElseInputText(store.graphData.edges, n.id, ensureBuiltinProtocols(n.data));
    });
    /** 语言模型 / 智能路由 共用的推理参数字段，供弹窗内采样行读取 */
    const llmInferencePanelConfig = computed((): Record<string, unknown> => {
      const n = store.selectedNode;
      if (!n || (n.data.componentKey !== "language-model" && n.data.componentKey !== "smart-router" && n.data.componentKey !== "agent")) {
        return {};
      }
      return n.data.config;
    });
    const selectedLlmThinkingControl = computed(() => {
      const n = store.selectedNode;
      if (!n || (n.data.componentKey !== "language-model" && n.data.componentKey !== "smart-router" && n.data.componentKey !== "agent")) {
        return null;
      }
      const { modelId } = n.data.config;
      if (typeof modelId !== "string" || modelId.trim() === "") {
        return null;
      }
      return resolveLlmThinkingControl(store.modelOptions.find((m) => m.id === modelId) ?? null);
    });
    const paletteKeyword = ref("");
    const lastAutoSavedAt = ref<Date | null>(null);
    const previousLayoutContentStyle = {
      overflowY: "",
      display: "",
      flexDirection: "",
      minHeight: "",
    };
    const canAutoSave = ref(false);
    /** 拖拽/改参会在短时间触发多次 sync，防抖后统一落库；过大会体感滞后，过小会频繁请求 */
    const FLOW_EDITOR_AUTOSAVE_DEBOUNCE_MS = 600;
    let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
    const undoDisabled = ref(true);
    const redoDisabled = ref(true);
    /** 抓手模式：拖动画布平移，暂时禁止拖动节点 */
    const handPanMode = ref(false);

    /** 出口桩快捷添加：弹窗与桩悬停态 */
    const quickAddOpen = ref(false);
    const quickAddPos = ref({ x: 0, y: 0 });
    const quickAddSourceNodeId = ref("");
    const quickAddSourcePortId = ref("");
    const quickAddKeyword = ref("");
    const hoveredOutputPort = ref<{ nodeId: string; portId: string } | null>(null);
    /**
     * 从出口拖出新边时，createEdge 里会先恢复常态，但指针仍在桩上会立刻再次触发 port:mouseenter，
     * 把悬停「+」画回去；连线过程中屏蔽出口桩的悬停放大，直至指针抬起或连线完成。
     */
    const suppressOutputPortHoverDuringEdgeDrag = ref(false);

    const flowTitle = computed(() => store.flowDetail?.name?.trim() || "未命名流程");

    const filteredComponentGroups = computed(() => {
      const kw = paletteKeyword.value.trim().toLowerCase();
      if (!kw) {
        return componentGroups.value;
      }
      return componentGroups.value
        .map(({ groupName, items }) => ({
          groupName,
          items: items.filter((item) => item.componentName.toLowerCase().includes(kw) || item.componentKey.toLowerCase().includes(kw)),
        }))
        .filter((g) => g.items.length > 0);
    });

    const filteredQuickAddGroups = computed(() => {
      const kw = quickAddKeyword.value.trim().toLowerCase();
      if (!kw) {
        return componentGroups.value;
      }
      return componentGroups.value
        .map(({ groupName, items }) => ({
          groupName,
          items: items.filter((item) => item.componentName.toLowerCase().includes(kw) || item.componentKey.toLowerCase().includes(kw)),
        }))
        .filter((g) => g.items.length > 0);
    });

    let graph: Graph | null = null;
    /** 串行化灌图，避免 watch(graphData) 与显式 apply 并发导致 clearCells/addNode 交错、画布叠层「幽灵」节点 */
    let applyGraphSerialChain: Promise<void> = Promise.resolve();
    let dnd: Dnd | null = null;
    let graphResizeObserver: ResizeObserver | null = null;
    let graphResizeStabilizeTimer: ReturnType<typeof setTimeout> | null = null;
    let flowEditorKeydownHandler: ((e: KeyboardEvent) => void) | null = null;
    /** mountGraph 内注册，unmount 时移除，避免泄漏 */
    let graphPointerLeaveCleanup: (() => void) | null = null;
    /** 连线拖拽结束后清除 suppressOutputPortHoverDuringEdgeDrag */
    let connectionDragPointerCleanup: (() => void) | null = null;

    /** 视口/缩放变化后强制按端口 id 重挂边的锚点，避免仍吸附到节点 bbox 角或错误边 */
    function stabilizeFlowEdgeAnchors(g: Graph): void {
      const gv = g as Graph & {
        findViewByCell?: (cell: unknown) => {
          update?: (options?: unknown) => void;
          updateConnection?: (options?: unknown) => void;
          updateTerminalProperties?: (type: "source" | "target") => boolean;
        } | null;
      };
      g.getNodes().forEach((node) => {
        const nodeView = gv.findViewByCell?.(node) as { updatePorts?: () => void } | null | undefined;
        nodeView?.updatePorts?.();
      });
      g.getEdges().forEach((edge) => {
        const srcId = edge.getSourceCellId();
        const tgtId = edge.getTargetCellId();
        const sp = edge.getSourcePortId();
        const tp = edge.getTargetPortId();
        if (!srcId || !tgtId) {
          return;
        }
        /* 含 port 时不要叠加 anchor/connectionPoint：否则 X6 会把锚点算在节点整体上，连线退化成与 bbox 相交（对角） */
        edge.setSource(sp ? { cell: srcId, port: sp } : { cell: srcId });
        edge.setTarget(tp ? { cell: tgtId, port: tp } : { cell: tgtId });
        /* setTerminal 可能覆盖注册边上的 attrs，显式回填箭头与线样式 */
        edge.attr(FLOW_EDGE_ATTRS, { deep: true });
        const edgeView = gv.findViewByCell?.(edge);
        if (edgeView?.updateTerminalProperties?.("source") === false) {
          return;
        }
        if (edgeView?.updateTerminalProperties?.("target") === false) {
          return;
        }
        edgeView?.updateConnection?.();
        edgeView?.update?.();
      });
    }

    /** 将当前 X6 图写入 store，不触发服务端保存 */
    function pushGraphToStore(): void {
      if (!graph || syncingGraph.value) {
        return;
      }
      store.replaceGraphData(buildGraphDataFromGraph(graph));
    }

    /** 画布与 store 同步，并在有编辑时安排防抖落库（仅因用户操作调用，不用 watch graphData 轮询） */
    function syncStoreFromGraph(): void {
      pushGraphToStore();
      scheduleAutoSave();
    }

    function paintFlowNodeOutlines(): void {
      if (!graph) {
        return;
      }
      syncFlowNodeOutlines(graph, store.debugResult?.issues ?? null);
    }

    /** 与 nodes.ts FLOW_PORT_R 一致；悬停时放大圆 + 显示白「+」，与设计稿一致 */
    const OUTPUT_PORT_R_IDLE = 6;
    const OUTPUT_PORT_R_HOVER = 9;

    /** 与 nodes.ts 出口桩 `plusMark` path 一致：矢量十字，不依赖字体 */
    const OUTPUT_PLUS_MARK_IDLE_ATTRS = {
      d: "M -5 0 L 5 0 M 0 -5 L 0 5",
      stroke: "#ffffff",
      strokeWidth: 2,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
      fill: "none",
      pointerEvents: "none" as const,
      refX: "50%",
      refY: "50%",
      opacity: 0,
      visibility: "hidden" as const,
    };

    const OUTPUT_PLUS_MARK_HOVER_ATTRS = {
      d: "M -5.5 0 L 5.5 0 M 0 -5.5 L 0 5.5",
      stroke: "#ffffff",
      strokeWidth: 2.25,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
      fill: "none",
      pointerEvents: "none" as const,
      refX: "50%",
      refY: "50%",
      opacity: 1,
      visibility: "visible" as const,
    };

    function applyOutputPortIdleVisual(n: Node, portId: string): void {
      n.setPortProp(portId, "attrs/circle", {
        magnet: true,
        r: OUTPUT_PORT_R_IDLE,
        strokeWidth: 1,
        stroke: "#1578ff",
        fill: "#1578ff",
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        cursor: "crosshair",
      });
      n.setPortProp(portId, "attrs/plusMark", OUTPUT_PLUS_MARK_IDLE_ATTRS);
    }

    function applyOutputPortHoverVisual(n: Node, portId: string): void {
      if (suppressOutputPortHoverDuringEdgeDrag.value) {
        return;
      }
      n.setPortProp(portId, "attrs/circle", {
        magnet: true,
        r: OUTPUT_PORT_R_HOVER,
        strokeWidth: 1,
        stroke: "#1578ff",
        fill: "#1578ff",
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        cursor: "crosshair",
      });
      n.setPortProp(portId, "attrs/plusMark", OUTPUT_PLUS_MARK_HOVER_ATTRS);
    }

    /** 快捷添加节点与已有节点的最小间隙（画布坐标） */
    const QUICK_ADD_NODE_GAP = 16;
    /** 防重叠：纵向扫描步长 */
    const QUICK_ADD_SCAN_STEP_Y = 28;
    /** 防重叠：一列扫完后向右平移的步长 */
    const QUICK_ADD_SCAN_COL_SHIFT_MIN = 56;

    function flowNodeRectsOverlapWithGap(
      ax: number,
      ay: number,
      aw: number,
      ah: number,
      bx: number,
      by: number,
      bw: number,
      bh: number,
      gap: number,
    ): boolean {
      return !(ax + aw + gap <= bx || bx + bw + gap <= ax || ay + ah + gap <= by || by + bh + gap <= ay);
    }

    /**
     * 在首选位置附近扫描，使新节点矩形不与图上其它节点重叠（含间隙）。
     */
    function findQuickAddPlacementAvoidOverlap(
      g: Graph,
      excludeNodeId: string,
      width: number,
      height: number,
      preferredX: number,
      preferredY: number,
    ): { x: number; y: number } {
      const gap = QUICK_ADD_NODE_GAP;
      const stepY = QUICK_ADD_SCAN_STEP_Y;
      const colShift = Math.max(QUICK_ADD_SCAN_COL_SHIFT_MIN, Math.ceil(width * 0.25));
      const others = g.getNodes().filter((n) => n.id !== excludeNodeId);

      const hits = (x: number, y: number): boolean => {
        for (const n of others) {
          const p = n.position();
          const s = n.size();
          if (flowNodeRectsOverlapWithGap(x, y, width, height, p.x, p.y, s.width, s.height, gap)) {
            return true;
          }
        }
        return false;
      };

      let x = preferredX;
      for (let col = 0; col < 60; col += 1) {
        let y = preferredY;
        for (let row = 0; row < 100; row += 1) {
          if (!hits(x, y)) {
            return { x, y };
          }
          y += stepY;
        }
        x += colShift;
      }
      return { x: preferredX, y: preferredY };
    }

    function closeQuickAddPalette(): void {
      quickAddOpen.value = false;
      quickAddKeyword.value = "";
      const nid = quickAddSourceNodeId.value;
      const pid = quickAddSourcePortId.value;
      if (nid !== "" && pid !== "" && graph) {
        const n = graph.getCellById(nid);
        if (n?.isNode()) {
          applyOutputPortIdleVisual(n, pid);
        }
      }
      hoveredOutputPort.value = null;
    }

    function pickQuickAddComponent(component: FlowComponentCatalogItem): void {
      const g = graph;
      if (!g) {
        return;
      }
      const srcId = quickAddSourceNodeId.value;
      const srcPort = quickAddSourcePortId.value;
      const srcNode = g.getCellById(srcId);
      if (!srcNode?.isNode()) {
        closeQuickAddPalette();
        return;
      }
      const meta = createPaletteNode(component, store.graphData.nodes.length);
      const added = g.addNode(meta);
      const srcPos = srcNode.position();
      const srcSize = srcNode.size();
      const sz = added.size();
      const preferredX = srcPos.x + srcSize.width + 48;
      const preferredY = srcPos.y;
      const pos = findQuickAddPlacementAvoidOverlap(g, added.id, sz.width, sz.height, preferredX, preferredY);
      added.position(pos.x, pos.y);
      const tgtCfg = added.getData() as FlowNodeConfig;
      const tgtPort = firstInputPortId(tgtCfg);
      g.addEdge({
        shape: "flow-edge",
        attrs: FLOW_EDGE_ATTRS,
        source: { cell: srcId, port: srcPort },
        target: { cell: added.id, port: tgtPort },
      });
      syncStoreFromGraph();
      paintFlowNodeOutlines();
      closeQuickAddPalette();
    }

    function bindOutputPortInteractions(g: Graph): void {
      graphPointerLeaveCleanup?.();
      graphPointerLeaveCleanup = null;

      function resetAllOutputPortsOnNode(n: Node): void {
        for (const portMeta of n.getPorts()) {
          const pid = portMeta.id;
          if (pid == null || pid === "") {
            continue;
          }
          const meta = n.getPort(pid);
          if (meta?.group === "output") {
            applyOutputPortIdleVisual(n, pid);
          }
        }
      }

      g.on("node:port:mouseenter", ({ node, port }) => {
        if (port == null || port === "") {
          return;
        }
        const meta = node.getPort(port);
        if (meta?.group !== "output") {
          return;
        }
        if (suppressOutputPortHoverDuringEdgeDrag.value) {
          return;
        }
        const prev = hoveredOutputPort.value;
        if (prev != null && (prev.nodeId !== node.id || prev.portId !== port)) {
          const pn = g.getCellById(prev.nodeId);
          if (pn?.isNode()) {
            applyOutputPortIdleVisual(pn, prev.portId);
          }
        }
        applyOutputPortHoverVisual(node, port);
        hoveredOutputPort.value = { nodeId: node.id, portId: port };
      });
      g.on("node:port:mouseleave", ({ node, port }) => {
        if (port == null || port === "") {
          return;
        }
        const meta = node.getPort(port);
        if (meta?.group !== "output") {
          return;
        }
        if (quickAddOpen.value && quickAddSourceNodeId.value === node.id && quickAddSourcePortId.value === port) {
          return;
        }
        applyOutputPortIdleVisual(node, port);
        if (hoveredOutputPort.value?.nodeId === node.id && hoveredOutputPort.value.portId === port) {
          hoveredOutputPort.value = null;
        }
      });
      g.on("node:magnet:click", ({ e, node, magnet }) => {
        const { portId } = resolveMagnetPortMeta(magnet);
        if (portId == null || portId === "") {
          return;
        }
        const pm = node.getPort(portId);
        if (pm?.group !== "output") {
          return;
        }
        const me = e as unknown as MouseEvent;
        me.preventDefault();
        me.stopPropagation();
        quickAddSourceNodeId.value = node.id;
        quickAddSourcePortId.value = portId;
        quickAddKeyword.value = "";
        const pad = 12;
        const panelW = 328;
        const panelH = 440;
        quickAddPos.value = {
          x: Math.max(pad, Math.min(me.clientX, window.innerWidth - panelW - pad)),
          y: Math.max(pad, Math.min(me.clientY, window.innerHeight - panelH - pad)),
        };
        quickAddOpen.value = true;
      });

      /** 移出整个节点时兜底恢复（部分环境下 node:port:mouseleave 不可靠） */
      g.on("node:mouseleave", ({ node }) => {
        if (!node.isNode()) {
          return;
        }
        if (quickAddOpen.value) {
          return;
        }
        resetAllOutputPortsOnNode(node);
        if (hoveredOutputPort.value?.nodeId === node.id) {
          hoveredOutputPort.value = null;
        }
      });

      /** 鼠标移到画布空白处时结束悬停态 */
      g.on("blank:mousemove", () => {
        if (quickAddOpen.value) {
          return;
        }
        const h = hoveredOutputPort.value;
        if (h == null) {
          return;
        }
        const cn = g.getCellById(h.nodeId);
        if (cn?.isNode()) {
          applyOutputPortIdleVisual(cn, h.portId);
        }
        hoveredOutputPort.value = null;
      });

      const wrap = g.container;
      if (wrap != null && typeof (wrap as HTMLElement).addEventListener === "function") {
        const el = wrap as HTMLElement;
        const onCanvasPointerLeave = (): void => {
          if (quickAddOpen.value) {
            return;
          }
          const h = hoveredOutputPort.value;
          if (h == null) {
            return;
          }
          const cn = g.getCellById(h.nodeId);
          if (cn?.isNode()) {
            applyOutputPortIdleVisual(cn, h.portId);
          }
          hoveredOutputPort.value = null;
        };
        el.addEventListener("pointerleave", onCanvasPointerLeave);
        graphPointerLeaveCleanup = () => {
          el.removeEventListener("pointerleave", onCanvasPointerLeave);
        };
      }
    }

    function safeJsonStringify(value: unknown, space = 2): string {
      try {
        return JSON.stringify(value, null, space);
      } catch {
        return String(value);
      }
    }

    function summarizeDebugForAssistant(result: FlowDebugResult): string {
      const lines: string[] = [];
      const { ok } = result;
      lines.push(`${ok ? "✓" : "✗"} 调试${ok ? "成功" : "未通过"} · 耗时 ${result.durationMs} ms`);
      if (result.issues.length > 0) {
        const errors = result.issues.filter((i) => i.level === "error").length;
        const warns = result.issues.length - errors;
        lines.push(`发现 ${errors} 个错误、${warns} 条提示；可与画布上的问题节点对照排查。`);
      } else if (ok) {
        lines.push(result.outputCount > 0 ? `已返回 ${result.outputCount} 段输出。` : "流程已执行；本次未解析到最终输出。");
      }
      return lines.join("\n");
    }

    function scrollPlaygroundToBottom(): void {
      const el = playgroundScrollRef.value;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }

    function schedulePlaygroundScrollToBottom(): void {
      if (playgroundScrollRaf != null) {
        cancelAnimationFrame(playgroundScrollRaf);
      }
      playgroundScrollRaf = requestAnimationFrame(() => {
        playgroundScrollRaf = null;
        scrollPlaygroundToBottom();
        requestAnimationFrame(scrollPlaygroundToBottom);
      });
    }

    function openDebugDrawer(): void {
      debugDrawerVisible.value = true;
      void nextTick(() => {
        schedulePlaygroundScrollToBottom();
      });
    }

    function resetPlaygroundSession(): void {
      revokePlaygroundObjectUrls();
      playgroundMessages.value = [];
      playgroundInput.value = "";
      playgroundPendingAttachments.value = [];
      if (playgroundSpeechStatus.value !== "idle") {
        void playgroundSpeechController?.cancelRecord().catch(() => {
          /* 忽略 */
        });
      }
      store.clearDebugResult();
      paintFlowNodeOutlines();
    }

    function revokePlaygroundObjectUrls(): void {
      for (const item of playgroundPendingAttachments.value) {
        URL.revokeObjectURL(item.previewUrl);
      }
      for (const msg of playgroundMessages.value) {
        for (const item of msg.attachments ?? []) {
          URL.revokeObjectURL(item.previewUrl);
        }
      }
    }

    function formatPlaygroundFileSize(size: number): string {
      if (size < 1024 * 1024) {
        return `${Math.max(1, Math.round(size / 1024))} KB`;
      }
      return `${(size / 1024 / 1024).toFixed(1)} MB`;
    }

    function removePlaygroundAttachment(id: string): void {
      const found = playgroundPendingAttachments.value.find((item) => item.id === id);
      if (found) {
        URL.revokeObjectURL(found.previewUrl);
      }
      playgroundPendingAttachments.value = playgroundPendingAttachments.value.filter((item) => item.id !== id);
    }

    function handlePlaygroundFileChange(event: Event): void {
      const input = event.target instanceof HTMLInputElement ? event.target : null;
      const files = Array.from(input?.files ?? []);
      if (input) {
        input.value = "";
      }
      if (files.length === 0) {
        return;
      }
      const next: PlaygroundPendingAttachment[] = [...playgroundPendingAttachments.value];
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          message.warning(`仅支持图片文件：${file.name}`);
          continue;
        }
        if (file.size > 20 * 1024 * 1024) {
          message.warning(`图片超过 20MB：${file.name}`);
          continue;
        }
        next.push({
          id: `att-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          previewUrl: URL.createObjectURL(file),
          file,
        });
      }
      playgroundPendingAttachments.value = next;
      void nextTick(() => {
        schedulePlaygroundScrollToBottom();
      });
    }

    function flowFileRefFromUpload(uploaded: FlowFileUploadResult): FlowExecutionInputFileRef {
      const filePath = uploaded.file_path ?? uploaded.filePath ?? uploaded.path ?? uploaded.url ?? uploaded.id ?? null;
      return {
        ...(filePath ? { file_path: filePath, filePath, path: filePath } : {}),
        ...(uploaded.id ? { id: uploaded.id } : {}),
        ...(uploaded.name ? { name: uploaded.name } : {}),
        ...(uploaded.mime ? { mime: uploaded.mime } : {}),
        ...(uploaded.url ? { url: uploaded.url } : {}),
        ...(uploaded.ext ? { ext: uploaded.ext } : {}),
      };
    }

    async function togglePlaygroundSpeechInput(): Promise<void> {
      if (playgroundRequesting.value || playgroundSpeechStatus.value === "starting" || playgroundSpeechStatus.value === "transcribing") {
        return;
      }
      await getPlaygroundSpeechController().handleClick();
    }

    function focusIssueNode(nodeId: string): void {
      if (!graph) {
        return;
      }
      const cell = graph.getCellById(nodeId);
      if (!cell?.isNode()) {
        message.warning("画布上未找到该节点");
        return;
      }
      graph.cleanSelection();
      graph.select(cell);
      graph.centerCell(cell);
      store.selectedNodeId = nodeId;
    }

    function abortPlaygroundDebug(): void {
      playgroundUserStopped.value = true;
      playgroundDebugAbort?.abort();
      playgroundRequesting.value = false;
    }

    function isAbortError(error: unknown): boolean {
      if (error instanceof DOMException && error.name === "AbortError") {
        return true;
      }
      return typeof error === "object" && error !== null && "name" in error && (error as { name: string }).name === "AbortError";
    }

    async function sendPlaygroundMessage(): Promise<void> {
      const text = playgroundInput.value.trim();
      const pendingAttachments = playgroundPendingAttachments.value;
      if ((text === "" && pendingAttachments.length === 0) || playgroundRequesting.value) {
        return;
      }
      playgroundInput.value = "";
      playgroundPendingAttachments.value = [];
      const userAttachments = pendingAttachments.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        size: item.size,
        previewUrl: item.previewUrl,
      }));
      playgroundMessages.value = [...playgroundMessages.value, { id: `u-${Date.now()}`, role: "user", text, attachments: userAttachments }];
      await nextTick();
      schedulePlaygroundScrollToBottom();
      playgroundUserStopped.value = false;
      playgroundRequesting.value = true;
      const ac = new AbortController();
      playgroundDebugAbort = ac;
      try {
        const uploaded = await store.uploadCurrentFlowFiles(pendingAttachments.map((item) => item.file));
        if (ac.signal.aborted || playgroundUserStopped.value) {
          return;
        }
        const files = uploaded.map(flowFileRefFromUpload);
        await store.debugCurrentFlow({
          input: files.length > 0 ? { query: text, files } : text,
          variables: {},
          signal: ac.signal,
        });
        if (playgroundUserStopped.value) {
          return;
        }
        /* 调试前 persist 使用 replaceGraphData:false，不触发 graphData 深度 watch 灌图；此处无需再 apply，
         * 避免 clearCells+addNode 与 watch 序列叠加导致 X6 节点叠层。描边见 finally 中 paintFlowNodeOutlines。 */
        const r = store.debugResult;
        if (r == null) {
          playgroundMessages.value = [
            ...playgroundMessages.value,
            { id: `a-${Date.now()}`, role: "assistant", text: "未收到调试结果，请稍后重试。" },
          ];
          return;
        }
        const baseAssistant: PlaygroundMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: summarizeDebugForAssistant(r),
        };
        if (r.issues.length > 0) {
          baseAssistant.issues = r.issues;
        }
        baseAssistant.finalOutputText = r.outputText;
        playgroundMessages.value = [...playgroundMessages.value, baseAssistant];
      } catch (error) {
        if (playgroundUserStopped.value || isAbortError(error)) {
          return;
        }
        const errText = error instanceof Error ? error.message : String(error);
        playgroundMessages.value = [
          ...playgroundMessages.value,
          { id: `a-${Date.now()}`, role: "assistant", text: `请求失败：${errText}` },
        ];
      } finally {
        playgroundRequesting.value = false;
        playgroundDebugAbort = null;
        playgroundUserStopped.value = false;
        await nextTick();
        schedulePlaygroundScrollToBottom();
        paintFlowNodeOutlines();
      }
    }

    /** 容器宽高为 0 时 X6 paper 与端口布局无效；轮询至有尺寸或超时（微前端/布局晚一拍常见） */
    async function waitUntilGraphContainerSized(maxFrames = 48): Promise<void> {
      for (let i = 0; i < maxFrames; i += 1) {
        const el = graphContainerRef.value;
        if (el && el.clientWidth > 0 && el.clientHeight > 0) {
          return;
        }
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });
      }
    }

    /** 先灌节点 → 等 NodeView/连接桩布局 → 再加边，避免「节点未就绪就连线」与 zoom 时序打架（对应 fromJSON/refresh 类问题） */
    async function applyGraphToCanvasCore(graphData: FlowGraphData): Promise<void> {
      const g = graph!;
      const nodeById = new Map(graphData.nodes.map((node) => [node.id, node]));
      g.clearCells();

      for (const node of graphData.nodes) {
        const enriched = ensureBuiltinProtocols(enrichCanvasNodeData(node.data));
        const { width: defaultW, height: defaultH } = flowNodeSizeForComponentKey(enriched.componentKey);
        /* 用与 buildFlowNodePorts 内部一致的高度创建节点，确保端口百分比锚点在初始布局时就能正确解析。
           若 JSON 里已存有明确高度则优先使用（用户手动调整过的节点），否则用度量值。 */
        const measuredH = measureFlowNodeHeight(enriched);
        const shape = node.shape ?? flowNodeShapeForComponentKey(enriched.componentKey);
        g.addNode({
          id: node.id,
          shape,
          x: node.x,
          y: node.y,
          width: node.width && node.width > 0 ? node.width : defaultW,
          height: resolveFlowNodeCanvasHeight(node.height, defaultH, measuredH),
          data: enriched,
          ports: buildFlowNodePorts(enriched),
        });
        const cell = g.getCellById(node.id);
        if (cell?.isNode()) {
          updateFlowNodePresentation(cell, enriched);
        }
      }

      await nextTick();
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

      for (const edge of graphData.edges) {
        const srcCfg = ensureBuiltinProtocols(nodeById.get(edge.source)?.data ?? nodeConfigOrEmpty(g, edge.source));
        const tgtCfg = ensureBuiltinProtocols(nodeById.get(edge.target)?.data ?? nodeConfigOrEmpty(g, edge.target));
        g.addEdge({
          id: edge.id,
          shape: "flow-edge",
          attrs: FLOW_EDGE_ATTRS,
          source: {
            cell: edge.source,
            port: coerceOutputPortId(srcCfg, edge.sourcePort),
          },
          target: {
            cell: edge.target,
            port: coerceInputPortId(tgtCfg, edge.targetPort),
          },
        });
      }

      g.cleanSelection();
      paintFlowNodeOutlines();
      await nextTick();
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          stabilizeFlowEdgeAnchors(g);
          requestAnimationFrame(() => {
            stabilizeFlowEdgeAnchors(g);
            requestAnimationFrame(() => {
              stabilizeFlowEdgeAnchors(g);
              resolve();
            });
          });
        });
      });
    }

    async function applyGraphToCanvas(graphData: FlowGraphData): Promise<void> {
      if (!graph) {
        return;
      }
      applyGraphSerialChain = applyGraphSerialChain
        .then(async () => {
          if (!graph) {
            return;
          }
          syncingGraph.value = true;
          try {
            await applyGraphToCanvasCore(graphData);
          } catch (error) {
            console.error("applyGraphToCanvas failed", error);
            try {
              await applyGraphToCanvasCore(graphData);
            } catch (recoveryError) {
              console.error("applyGraphToCanvas recovery failed", recoveryError);
              message.error("流程画布渲染失败，请刷新页面重试");
            }
          } finally {
            syncingGraph.value = false;
          }
        })
        .catch((chainError) => {
          console.error("applyGraphToCanvas serial chain failed", chainError);
          syncingGraph.value = false;
        });
      await applyGraphSerialChain;
    }

    function refreshZoomPct(): void {
      if (!graph) {
        return;
      }
      zoomPercent.value = Math.round(graph.zoom() * 100);
    }

    function resizeGraphToContainer(): void {
      if (!graph || !graphContainerRef.value) {
        return;
      }
      const el = graphContainerRef.value;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) {
        graph.resize(w, h);
      }
    }

    function lockLayoutContentScroll(): void {
      const layoutContent = document.getElementById("cube-layout-content");
      if (!layoutContent) {
        return;
      }
      previousLayoutContentStyle.overflowY = layoutContent.style.overflowY;
      previousLayoutContentStyle.display = layoutContent.style.display;
      previousLayoutContentStyle.flexDirection = layoutContent.style.flexDirection;
      previousLayoutContentStyle.minHeight = layoutContent.style.minHeight;
      layoutContent.style.overflowY = "hidden";
      layoutContent.style.display = "flex";
      layoutContent.style.flexDirection = "column";
      layoutContent.style.minHeight = "0";
    }

    function restoreLayoutContentScroll(): void {
      const layoutContent = document.getElementById("cube-layout-content");
      if (!layoutContent) {
        return;
      }
      layoutContent.style.overflowY = previousLayoutContentStyle.overflowY;
      layoutContent.style.display = previousLayoutContentStyle.display;
      layoutContent.style.flexDirection = previousLayoutContentStyle.flexDirection;
      layoutContent.style.minHeight = previousLayoutContentStyle.minHeight;
    }

    function handleBack(): void {
      void router.push("/flows");
    }

    function refreshUndoRedo(): void {
      if (!graph) {
        undoDisabled.value = true;
        redoDisabled.value = true;
        return;
      }
      undoDisabled.value = !graph.canUndo();
      redoDisabled.value = !graph.canRedo();
    }

    function applyHandPanMode(): void {
      if (!graph) {
        return;
      }
      const cur = graph.options.interacting;
      if (typeof cur === "object" && cur !== null) {
        graph.options.interacting = { ...cur, nodeMovable: !handPanMode.value };
      } else {
        graph.options.interacting = { nodeMovable: !handPanMode.value, edgeMovable: false };
      }
    }

    function toggleHandPanMode(): void {
      handPanMode.value = !handPanMode.value;
      applyHandPanMode();
    }

    /** 防抖落库：仅在 syncStoreFromGraph / 侧栏改参链路等显式调用后排队，无「定时间隔」轮询 */
    function scheduleAutoSave(): void {
      if (!canAutoSave.value || store.loading) {
        return;
      }
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      autoSaveTimer = setTimeout(() => {
        autoSaveTimer = null;
        void (async () => {
          if (!graph || !store.flowDetail) {
            return;
          }
          if (syncingGraph.value) {
            return;
          }
          try {
            pushGraphToStore();
            await store.persistCurrentFlow(false);
            lastAutoSavedAt.value = new Date();
          } catch {
            /* 自动保存失败不弹窗，避免打断操作 */
          }
        })();
      }, FLOW_EDITOR_AUTOSAVE_DEBOUNCE_MS);
    }

    async function mountGraph(): Promise<void> {
      if (!graphContainerRef.value || graph) {
        return;
      }
      connectionDragPointerCleanup?.();
      connectionDragPointerCleanup = null;
      /* 首次渲染时 minimap 节点可能比画布晚挂上 ref，空 ref 会导致未注册 MiniMap、缩放与主图永不同步 */
      for (let i = 0; i < 6 && !minimapContainerRef.value; i += 1) {
        await nextTick();
      }
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      registerFlowNodes();
      registerFlowEdges();
      graph = createFlowGraph(graphContainerRef.value, {
        minimapContainer: minimapContainerRef.value ?? null,
        onEdgeCreateFromMagnet: ({ sourceCell, sourceMagnet }) => {
          if (syncingGraph.value) {
            return;
          }
          const { portId, portGroup: group } = resolveMagnetPortMeta(sourceMagnet);
          if (group !== "output" || portId == null || portId === "") {
            return;
          }
          if (!sourceCell.isNode()) {
            return;
          }
          suppressOutputPortHoverDuringEdgeDrag.value = true;
          const n = sourceCell as Node;
          applyOutputPortIdleVisual(n, portId);
          if (hoveredOutputPort.value?.nodeId === n.id && hoveredOutputPort.value?.portId === portId) {
            hoveredOutputPort.value = null;
          }
        },
      });
      /* 开发环境：控制台可查边端口，例如
       * __FLOW_GRAPH__.getEdges().map((e) => ({ id: e.id, sp: e.getSourcePortId(), tp: e.getTargetPortId() }))
       * __FLOW_GRAPH__.getCellById('节点id')?.getPorts() */
      if (import.meta.env.DEV) {
        (window as unknown as { __FLOW_GRAPH__?: Graph }).__FLOW_GRAPH__ = graph;
      }
      dnd = createFlowDnd(graph);
      const endEdgeDragSuppress = (): void => {
        suppressOutputPortHoverDuringEdgeDrag.value = false;
      };
      window.addEventListener("pointerup", endEdgeDragSuppress, true);
      window.addEventListener("pointercancel", endEdgeDragSuppress, true);
      connectionDragPointerCleanup = () => {
        window.removeEventListener("pointerup", endEdgeDragSuppress, true);
        window.removeEventListener("pointercancel", endEdgeDragSuppress, true);
        connectionDragPointerCleanup = null;
      };
      graph.on("edge:connected", endEdgeDragSuppress);
      graph.on("cell:added", () => {
        syncStoreFromGraph();
      });
      graph.on("cell:removed", syncStoreFromGraph);
      graph.on("node:change:position", syncStoreFromGraph);
      graph.on("node:change:data", syncStoreFromGraph);
      graph.on("edge:connected", syncStoreFromGraph);
      graph.on("edge:change:target", syncStoreFromGraph);
      graph.on("edge:change:source", syncStoreFromGraph);
      graph.on("selection:changed", () => {
        paintFlowNodeOutlines();
        const selectedNodes = graph!.getSelectedCells().filter((cell) => cell.isNode());
        store.selectedNodeId = selectedNodes.length ? selectedNodes[selectedNodes.length - 1]!.id : null;
      });
      graph.on("scale", refreshZoomPct);
      graph.on("history:change", refreshUndoRedo);
      applyHandPanMode();
      bindOutputPortInteractions(graph);
      await waitUntilGraphContainerSized();
      /* 先按容器设 paper 尺寸再灌入节点，否则首次布局时宽高为 0 会导致端口百分比锚点错误 */
      resizeGraphToContainer();
      await applyGraphToCanvas(store.graphData);
      refreshUndoRedo();

      const containerEl = graphContainerRef.value;
      if (containerEl) {
        graphResizeObserver?.disconnect();
        graphResizeObserver = new ResizeObserver(() => {
          resizeGraphToContainer();
          if (graphResizeStabilizeTimer != null) {
            clearTimeout(graphResizeStabilizeTimer);
          }
          graphResizeStabilizeTimer = setTimeout(() => {
            graphResizeStabilizeTimer = null;
            if (graph != null && !syncingGraph.value) {
              stabilizeFlowEdgeAnchors(graph);
            }
          }, 80);
        });
        graphResizeObserver.observe(containerEl);
      }
      /* 必须在灌图与边 stabilize 结束之后再改视口缩放/平移，否则之前的连接点会按旧矩阵缓存（刷新后飘线） */
      await nextTick();
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      resizeGraphToContainer();
      graph?.zoomTo(1);
      graph?.centerContent();
      stabilizeFlowEdgeAnchors(graph!);
      refreshZoomPct();
      refreshUndoRedo();

      if (flowEditorKeydownHandler) {
        window.removeEventListener("keydown", flowEditorKeydownHandler);
      }
      flowEditorKeydownHandler = (e: KeyboardEvent): void => {
        if (e.key === "Escape" && quickAddOpen.value) {
          e.preventDefault();
          closeQuickAddPalette();
          return;
        }
        if (e.key !== "Delete" && e.key !== "Backspace") {
          return;
        }
        if (isEditableFieldTarget(e.target)) {
          return;
        }
        const g = graph;
        if (!g) {
          return;
        }
        const cells = g.getSelectedCells();
        if (cells.length === 0) {
          return;
        }
        e.preventDefault();
        g.removeCells(cells);
      };
      window.addEventListener("keydown", flowEditorKeydownHandler);
    }

    function getSmartRouterRoutesList(cfg: Record<string, unknown>): Record<string, string>[] {
      const raw = cfg.routes;
      if (!Array.isArray(raw) || raw.length === 0) {
        return [{ route_name: "路由 1", route_description: "", route_message: "" }];
      }
      return raw.map((item, idx) => {
        const o = item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
        /** 显式存过 route_name（含空串）时原样展示，避免清空输入时被兜底成「路由 n」导致无法自命名 */
        let routeName: string;
        if (typeof o.route_name === "string") {
          routeName = o.route_name;
        } else if (typeof o.route_category === "string" && o.route_category.trim() !== "") {
          routeName = o.route_category.trim();
        } else {
          routeName = `路由 ${idx + 1}`;
        }
        return {
          route_name: routeName,
          route_description: typeof o.route_description === "string" ? o.route_description : "",
          route_message: typeof o.route_message === "string" ? o.route_message : "",
        };
      });
    }

    /** 画布展示：为知识检索节点补全知识库名称（来自文档列表） */
    function enrichKnowledgeRetrievalCanvas(config: FlowNodeConfig): FlowNodeConfig {
      if (config.componentKey !== "knowledge-retrieval") {
        return config;
      }
      const raw = config.config.knowledgeSources;
      if (!Array.isArray(raw)) {
        return config;
      }
      let changed = false;
      const next = raw.map((item) => {
        if (item == null || typeof item !== "object" || Array.isArray(item)) {
          return item;
        }
        const o = item as Record<string, unknown>;
        const id = typeof o.documentId === "string" ? o.documentId.trim() : "";
        const existingName = typeof o.documentName === "string" ? o.documentName.trim() : "";
        if (id === "" || existingName !== "") {
          return item;
        }
        const doc = store.knowledgeOptions.find((d) => d.id === id);
        if (doc?.name != null && String(doc.name).trim() !== "") {
          changed = true;
          return { ...o, documentName: String(doc.name).trim() };
        }
        return item;
      });
      if (!changed) {
        return config;
      }
      return {
        ...config,
        config: {
          ...config.config,
          knowledgeSources: next as unknown[],
        },
      };
    }

    function enrichIfElseProtocols(cfg: FlowNodeConfig): FlowNodeConfig {
      if (cfg.componentKey !== "if-else") {
        return cfg;
      }
      const nextConfig = {
        ...cfg.config,
        default_route: normalizeIfElseDefaultRoute(cfg.config.default_route),
      };
      return {
        ...cfg,
        config: nextConfig,
        protocolInputs: ifElseDynamicInputPortNames(nextConfig),
        protocolOutputs: ["if", "else"],
      };
    }

    function enrichCanvasNodeData(config: FlowNodeConfig): FlowNodeConfig {
      return enrichKnowledgeRetrievalCanvas(enrichModelAwareDisplay(enrichIfElseProtocols(config)));
    }

    function enrichModelAwareDisplay(config: FlowNodeConfig): FlowNodeConfig {
      if (
        config.componentKey !== "language-model" &&
        config.componentKey !== "image-generation" &&
        config.componentKey !== "smart-router" &&
        config.componentKey !== "agent"
      ) {
        return config;
      }
      const { modelId } = config.config;
      if (typeof modelId !== "string" || !modelId) {
        return config;
      }
      const item = store.modelOptions.find((m) => m.id === modelId);
      if (!item) {
        return config;
      }
      const labelExisting = typeof config.config.selectedModelLabel === "string" ? config.config.selectedModelLabel.trim() : "";
      const tagExisting = typeof config.config.selectedModelGroupTag === "string" ? config.config.selectedModelGroupTag.trim() : "";
      return {
        ...config,
        config: {
          ...config.config,
          selectedModelLabel: labelExisting || flowEditorModelOptionLabel(item),
          selectedModelGroupTag:
            tagExisting || (item.groupName && item.groupName.trim() !== "" ? item.groupName.toUpperCase().slice(0, 12) : "CHAT"),
          selectedModelIconUrl: iconSrcFromModelIconUrl(item.iconUrl),
        },
      };
    }

    function updateLiveSelectedNode(config: FlowNodeConfig): void {
      if (!graph || !store.selectedNodeId) {
        return;
      }
      const cell = graph.getCellById(store.selectedNodeId);
      if (cell?.isNode()) {
        updateFlowNodePresentation(cell, enrichCanvasNodeData(config));
        paintFlowNodeOutlines();
      }
      syncStoreFromGraph();
    }

    function patchSelectedNodeConfig(patch: Record<string, unknown>): void {
      const { selectedNode } = store;
      if (!selectedNode) {
        return;
      }
      const nextConfig = mergeNodeConfigPatch(selectedNode.data.config, patch);
      store.updateSelectedNodeConfig(nextConfig);
      updateLiveSelectedNode({
        ...selectedNode.data,
        config: nextConfig,
      });
      rawConfigText.value = JSON.stringify(nextConfig, null, 2);
    }

    function persistKnowledgeSources(rows: KnowledgeSourceEditorRow[]): Record<string, unknown>[] {
      return rows.map((r) => ({
        documentId: r.documentId,
        documentName: r.documentName,
        topK: r.topK,
        scoreThreshold: r.scoreThreshold,
      }));
    }

    function knowledgeSourcesForPanel(): KnowledgeSourceEditorRow[] {
      const n = store.selectedNode;
      if (!n) {
        return [];
      }
      return parseKnowledgeSources(n.data.config);
    }

    function clearKnowledgeRetrievalLegacyKeys(): Record<string, unknown> {
      return {
        documentIds: undefined,
        topK: undefined,
        scoreThreshold: undefined,
        minScore: undefined,
        min_similarity: undefined,
      };
    }

    async function loadKnowledgePickPage(page: number): Promise<void> {
      knowledgePickLoading.value = true;
      try {
        const kw = knowledgePickKeyword.value.trim();
        const res = await cubeKnowledgeDocumentService.getKnowledgeDocumentList({
          pageNumber: page,
          pageSize: knowledgePickPageSize.value,
          name: kw === "" ? "" : kw,
          status: true,
        });
        knowledgePickRecords.value = res.records ?? [];
        knowledgePickTotal.value = Number(res.total ?? 0);
        knowledgePickPage.value = page;
      } catch (error) {
        console.error(error);
        message.error("加载知识文档列表失败");
      } finally {
        knowledgePickLoading.value = false;
      }
    }

    async function openKnowledgePickModal(): Promise<void> {
      knowledgePickCheckedIds.value = [];
      knowledgePickNameById.value = {};
      knowledgePickKeyword.value = "";
      knowledgePickPage.value = 1;
      knowledgePickPageSize.value = KNOWLEDGE_PICK_PAGE_SIZE_DEFAULT;
      knowledgePickModalVisible.value = true;
      await loadKnowledgePickPage(1);
    }

    function toggleKnowledgePickDoc(doc: KnowledgeDocumentModel, checked: boolean): void {
      if (existingKnowledgeDocIdsInNode.value.has(doc.id)) {
        return;
      }
      const set = new Set(knowledgePickCheckedIds.value);
      const names = { ...knowledgePickNameById.value };
      if (checked) {
        set.add(doc.id);
        names[doc.id] = doc.name;
      } else {
        set.delete(doc.id);
        delete names[doc.id];
      }
      knowledgePickCheckedIds.value = [...set];
      knowledgePickNameById.value = names;
    }

    function handleKnowledgePickPagination(page: number, pageSize?: number): void {
      const nextSize = pageSize ?? knowledgePickPageSize.value;
      if (nextSize !== knowledgePickPageSize.value) {
        knowledgePickPageSize.value = nextSize;
        void loadKnowledgePickPage(1);
        return;
      }
      void loadKnowledgePickPage(page);
    }

    function confirmKnowledgePick(): void {
      const ids = knowledgePickCheckedIds.value;
      const n = store.selectedNode;
      if (!n) {
        knowledgePickModalVisible.value = false;
        return;
      }
      if (ids.length === 0) {
        message.warning("请勾选至少一个知识库");
        return;
      }
      const current = parseKnowledgeSources(n.data.config);
      const existing = new Set(current.map((r) => r.documentId));
      const names = knowledgePickNameById.value;
      const additions: KnowledgeSourceEditorRow[] = [];
      for (const id of ids) {
        if (existing.has(id)) {
          continue;
        }
        const fromNames = typeof names[id] === "string" ? names[id]!.trim() : "";
        const fromStore = store.knowledgeOptions.find((d) => d.id === id)?.name?.trim() ?? "";
        additions.push({
          documentId: id,
          documentName: fromNames !== "" ? fromNames : fromStore,
          topK: KB_DEFAULT_TOPK,
          scoreThreshold: KB_DEFAULT_SCORE,
        });
        existing.add(id);
      }
      if (additions.length === 0) {
        message.info("所选知识库均已添加");
        knowledgePickModalVisible.value = false;
        return;
      }
      patchSelectedNodeConfig({
        ...clearKnowledgeRetrievalLegacyKeys(),
        knowledgeSources: persistKnowledgeSources([...current, ...additions]),
      });
      knowledgePickModalVisible.value = false;
    }

    function openKnowledgeBatchModal(): void {
      const rows = knowledgeSourcesForPanel();
      if (rows.length > 0) {
        knowledgeBatchTopK.value = clampKbTopK(rows[0]!.topK);
        knowledgeBatchScore.value = clampKbScore(rows[0]!.scoreThreshold);
      } else {
        knowledgeBatchTopK.value = KB_DEFAULT_TOPK;
        knowledgeBatchScore.value = KB_DEFAULT_SCORE;
      }
      knowledgeBatchModalVisible.value = true;
    }

    function confirmKnowledgeBatch(): void {
      const rows = knowledgeSourcesForPanel();
      if (rows.length === 0) {
        message.warning("请先添加知识库");
        knowledgeBatchModalVisible.value = false;
        return;
      }
      const tk = clampKbTopK(Number(knowledgeBatchTopK.value));
      const sc = clampKbScore(Number(knowledgeBatchScore.value));
      patchSelectedNodeConfig({
        knowledgeSources: persistKnowledgeSources(rows.map((r) => ({ ...r, topK: tk, scoreThreshold: sc }))),
      });
      knowledgeBatchModalVisible.value = false;
    }

    function ensureSelectedThinkingControlDefault(): void {
      const control = selectedLlmThinkingControl.value;
      const n = store.selectedNode;
      if (!control || !n) {
        return;
      }
      const cfg = n.data.config;
      if (
        Object.hasOwn(cfg, "enableThinking") ||
        Object.hasOwn(cfg, "enable_thinking") ||
        Object.hasOwn(cfg, "useEnableThinking") ||
        Object.hasOwn(cfg, "use_enable_thinking")
      ) {
        return;
      }
      patchSelectedNodeConfig({
        useEnableThinking: true,
        enableThinking: false,
      });
    }

    function openLlmParamsModal(): void {
      ensureSelectedThinkingControlDefault();
      llmParamsModalVisible.value = true;
    }

    function thinkingPatchForModel(item: ModelItem | undefined): Record<string, unknown> {
      const supportsThinking = resolveLlmThinkingControl(item ?? null) != null;
      return {
        useEnableThinking: supportsThinking,
        enableThinking: false,
      };
    }

    function renderLlmThinkingParamRow(): JSX.Element | null {
      const control = selectedLlmThinkingControl.value;
      if (!control) {
        return null;
      }
      const cfg = llmInferencePanelConfig.value;
      const enabled = readLlmUse(cfg, "enableThinking", readLlmUse(cfg, "enable_thinking", false));
      return (
        <div class={styles.llmThinkingRow}>
          <div class={styles.llmThinkingMeta}>
            <div class={styles.llmThinkingTitleRow}>
              <span class={styles.llmParamLabelText}>{control.label}</span>
              <Tooltip title={control.tip}>
                <span class={styles.llmParamHelpIcon} aria-hidden="true">
                  ?
                </span>
              </Tooltip>
            </div>
            <div class={styles.llmThinkingDesc}>关闭时会按模型规则显式写入关闭值。</div>
          </div>
          <Switch
            value={enabled}
            onChange={(checked: boolean) => {
              patchSelectedNodeConfig({
                useEnableThinking: true,
                enableThinking: checked,
              });
            }}
          />
        </div>
      );
    }

    function renderLlmInferenceParamRow(def: LlmInferenceParamDef): JSX.Element {
      const cfg = llmInferencePanelConfig.value;
      const enabled = readLlmUse(cfg, def.useKey, false);
      const numVal =
        def.mode === "float"
          ? readLlmFloat(cfg, def.valueKey, def.defaultNum, def.min, def.max)
          : readLlmInt(cfg, def.valueKey, def.defaultNum, def.min, def.max);
      return (
        <div class={[styles.llmParamRow, enabled ? "" : styles.llmParamRowOff]}>
          <div class={styles.llmParamSwitchCell}>
            <Switch
              value={enabled}
              onChange={(checked: boolean) => {
                patchSelectedNodeConfig({ [def.useKey]: checked });
              }}
            />
          </div>
          <div class={styles.llmParamLabelCell}>
            <span class={styles.llmParamLabelText}>{def.label}</span>
            <Tooltip title={def.tip}>
              <span class={styles.llmParamHelpIcon} aria-hidden="true">
                ?
              </span>
            </Tooltip>
          </div>
          <div class={styles.llmParamSliderHost}>
            <ThemedSlider
              value={numVal}
              min={def.min}
              max={def.max}
              step={def.step}
              disabled={!enabled}
              onUpdate:value={(v: number) => {
                if (def.mode === "float") {
                  patchSelectedNodeConfig({
                    [def.valueKey]: roundLlmFloatByPrecision(v, def.precision),
                  });
                } else {
                  patchSelectedNodeConfig({ [def.valueKey]: Math.round(v) });
                }
              }}
            />
          </div>
          <div class={styles.llmParamInputWrap}>
            <InputNumber
              class={styles.llmParamInputControl}
              value={numVal}
              min={def.min}
              max={def.max}
              step={def.step}
              disabled={!enabled}
              precision={def.precision}
              controls={false}
              onUpdate:value={(v: unknown) => {
                const base = llmInferencePanelConfig.value;
                const fallback = def.defaultNum;
                const raw =
                  v === null || v === undefined || v === ""
                    ? fallback
                    : typeof v === "number"
                      ? v
                      : def.mode === "float"
                        ? Number.parseFloat(String(v))
                        : Number.parseInt(String(v), 10);
                const nextRaw =
                  def.mode === "float"
                    ? readLlmFloat({ ...base, [def.valueKey]: raw }, def.valueKey, fallback, def.min, def.max)
                    : readLlmInt({ ...base, [def.valueKey]: raw }, def.valueKey, fallback, def.min, def.max);
                const next = def.mode === "float" ? roundLlmFloatByPrecision(nextRaw, def.precision) : nextRaw;
                patchSelectedNodeConfig({ [def.valueKey]: next });
              }}
            />
          </div>
        </div>
      );
    }

    /** 语言模型 / 智能路由 / 图像生成：模型下拉独占一行；按节点类型过滤可选模型 */
    function renderModelSelectField(): JSX.Element {
      const sn = store.selectedNode;
      if (!sn) {
        return <span />;
      }
      const cfg = sn.data.config;
      const selectKind = flowModelSelectKindFromComponentKey(sn.data.componentKey) ?? "language_model";
      const selectableModels = filterModelsForFlowNode(store.modelOptions, selectKind);
      return (
        <div class={styles.field}>
          <div class={styles.modelFieldHeader}>
            <label class={styles.label}>
              模型 <span class={styles.labelRequired}>*</span>
            </label>
            {selectKind === "language_model" ? (
              <Tooltip title="打开模型参数（温度、Top P、最大输出长度、思考模式等）">
                <button
                  type="button"
                  class={styles.modelParamsIconBtn}
                  aria-label="模型参数"
                  onClick={() => {
                    openLlmParamsModal();
                  }}
                >
                  <svg class={styles.modelParamsGearSvg} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="none" stroke="currentColor" stroke-width="1.6" />
                    <path
                      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c-.29.35-.46.78-.46 1.25s.17.9.46 1.25"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.25"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              </Tooltip>
            ) : null}
          </div>
          <AntSelect
            class={[styles.modelSelect, styles.modelSelectFullRow]}
            popupClassName={styles.modelSelectDropdown}
            placeholder="请选择模型"
            allowClear
            showSearch
            filterOption={(input: string, option: unknown) => {
              const id = String((option as { value?: string }).value ?? "");
              const item = selectableModels.find((m) => m.id === id);
              if (!item) {
                return false;
              }
              const hay = `${item.providerName ?? ""} ${item.modelCode} ${item.groupName}`.toLowerCase();
              return hay.includes(input.trim().toLowerCase());
            }}
            getPopupContainer={(trigger: HTMLElement) => trigger.closest(`.${styles.rightPanelDock}`) ?? document.body}
            value={typeof cfg.modelId === "string" && cfg.modelId !== "" ? cfg.modelId : undefined}
            onChange={(nextId: unknown) => {
              const id = nextId == null ? "" : String(nextId);
              const item = selectableModels.find((m) => m.id === id);
              const defaultTag = selectKind === "image_generation" ? "IMAGE" : "CHAT";
              patchSelectedNodeConfig({
                modelId: id,
                selectedModelLabel: item ? flowEditorModelOptionLabel(item) : "",
                selectedModelGroupTag:
                  item?.groupName && item.groupName.trim() !== "" ? item.groupName.toUpperCase().slice(0, 12) : defaultTag,
                selectedModelIconUrl: item ? iconSrcFromModelIconUrl(item.iconUrl) : "",
                ...thinkingPatchForModel(item),
              });
            }}
          >
            {selectableModels.map((modelOption) => (
              <AntSelect.Option key={modelOption.id} value={modelOption.id}>
                {flowEditorModelOptionRow(modelOption, "languagePanel")}
              </AntSelect.Option>
            ))}
          </AntSelect>
        </div>
      );
    }

    /** 关闭属性面板：取消画布选中（节点描边恢复默认） */
    function dismissRightPanel(): void {
      graph?.cleanSelection();
    }

    async function loadPage(): Promise<void> {
      if (!flowId.value) {
        message.error("缺少流程ID");
        await router.push("/flows");
        return;
      }
      await store.hydratePaletteAndResources();
      await Promise.all([store.loadFlow(flowId.value), store.loadFlowList()]);
      await nextTick();
      await mountGraph();
    }

    async function publishFlow(): Promise<void> {
      publishRequesting.value = true;
      try {
        await store.publishCurrentFlow();
        await applyGraphToCanvas(store.graphData);
        message.success("发布成功");
      } finally {
        publishRequesting.value = false;
      }
    }

    function startDragPalette(component: FlowComponentCatalogItem, event: MouseEvent): void {
      if (!graph || !dnd) {
        return;
      }
      const node = graph.createNode(createPaletteNode(component, store.graphData.nodes.length));
      dnd.start(node, event);
    }

    function addNodeFromClick(component: FlowComponentCatalogItem): void {
      if (!graph) {
        return;
      }
      const node = graph.createNode(createPaletteNode(component, store.graphData.nodes.length));
      graph.addNode(node);
      node.position(80 + store.graphData.nodes.length * 24, 80 + store.graphData.nodes.length * 16);
      graph.cleanSelection();
      graph.select(node);
      syncStoreFromGraph();
    }

    watch(
      () => store.selectedNode,
      (node) => {
        rawConfigText.value = JSON.stringify(node?.data.config ?? {}, null, 2);
      },
      { immediate: true },
    );

    watch(
      () => store.knowledgeOptions.length,
      () => {
        const n = store.selectedNode;
        if (!n || n.data.componentKey !== "knowledge-retrieval") {
          return;
        }
        const g = graph;
        if (!g || !store.selectedNodeId) {
          return;
        }
        const cell = g.getCellById(store.selectedNodeId);
        if (cell?.isNode()) {
          updateFlowNodePresentation(cell, enrichCanvasNodeData(n.data));
          paintFlowNodeOutlines();
        }
      },
    );

    watch(
      () => store.selectedNodeId,
      () => {
        llmParamsModalVisible.value = false;
        knowledgePickModalVisible.value = false;
        knowledgeBatchModalVisible.value = false;
      },
    );

    watch(
      () => store.graphData,
      (graphData) => {
        if (!graph || syncingGraph.value) {
          return;
        }
        if (canvasNeedsStoreResync(graph, graphData)) {
          void applyGraphToCanvas(graphData);
        }
      },
      { deep: true },
    );

    watch(
      () => [
        debugDrawerVisible.value,
        playgroundRequesting.value,
        playgroundMessages.value
          .map(
            (msg) =>
              `${msg.id}:${msg.text.length}:${msg.finalOutputText?.length ?? 0}:${msg.issues?.length ?? 0}:${msg.attachments?.length ?? 0}`,
          )
          .join("|"),
        playgroundPendingAttachments.value.length,
      ],
      () => {
        if (!debugDrawerVisible.value) {
          return;
        }
        void nextTick(() => {
          schedulePlaygroundScrollToBottom();
        });
      },
      { flush: "post" },
    );

    onMounted(() => {
      lockLayoutContentScroll();
      void (async () => {
        await loadPage();
        canAutoSave.value = true;
        lastAutoSavedAt.value = new Date();
      })();
    });

    onBeforeUnmount(() => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = null;
      }
      if (flowEditorKeydownHandler) {
        window.removeEventListener("keydown", flowEditorKeydownHandler);
        flowEditorKeydownHandler = null;
      }
      graphResizeObserver?.disconnect();
      graphResizeObserver = null;
      if (graphResizeStabilizeTimer != null) {
        clearTimeout(graphResizeStabilizeTimer);
        graphResizeStabilizeTimer = null;
      }
      if (playgroundScrollRaf != null) {
        cancelAnimationFrame(playgroundScrollRaf);
        playgroundScrollRaf = null;
      }
      revokePlaygroundObjectUrls();
      restoreLayoutContentScroll();
      graphPointerLeaveCleanup?.();
      graphPointerLeaveCleanup = null;
      connectionDragPointerCleanup?.();
      connectionDragPointerCleanup = null;
      if (import.meta.env.DEV) {
        delete (window as unknown as { __FLOW_GRAPH__?: Graph }).__FLOW_GRAPH__;
      }
      if (playgroundSpeechController) {
        void playgroundSpeechController.dispose().catch(() => {
          /* 卸载时尽力释放，忽略错误 */
        });
        playgroundSpeechController = undefined;
      }
      graph?.dispose();
      graph = null;
      dnd = null;
    });

    return () => (
      <CubeLayout
        showHeader={false}
        showFooter={false}
        title=""
        v-slots={{
          "layout-content": () => (
            <div class={styles.pageShell}>
              <div class={styles.page}>
                <div class={styles.pageHeaderBar}>
                  <div class={styles.pageHeaderLeft}>
                    <button type="button" class={styles.pageHeader} onClick={handleBack}>
                      <span class={styles.backIcon} aria-hidden="true">
                        <svg viewBox="0 0 16 16">
                          <path d="M14 8H3.5" />
                          <path d="M7 3.5 2.5 8 7 12.5" />
                        </svg>
                      </span>
                      <span class={styles.pageHeaderTextBlock}>
                        <span class={styles.pageHeaderTitle}>{flowTitle.value}</span>
                        <span class={styles.autoSaveLine}>
                          已自动保存 {formatAutoSaveHm(lastAutoSavedAt.value)}
                          <span class={styles.statusTagSubtle}>
                            {statusTextMap[store.flowDetail?.compileStatus ?? "draft"] ?? store.flowDetail?.compileStatus ?? "草稿"}
                          </span>
                        </span>
                      </span>
                    </button>
                  </div>
                  <div class={styles.pageHeaderActions}>
                    <Button class={styles.headerToolBtn} type="default" loading={playgroundRequesting.value} onClick={openDebugDrawer}>
                      调试
                    </Button>
                    <Button
                      class={styles.headerPublishBtn}
                      type="default"
                      loading={publishRequesting.value}
                      onClick={() => void publishFlow()}
                    >
                      <span class={styles.headerPublishLabel}>发布</span>
                    </Button>
                  </div>
                </div>

                <div class={styles.editorMainStage}>
                  <Spin spinning={store.loading}>
                    <div
                      class={[
                        styles.editorWorkspace,
                        store.selectedNode ? styles.editorWorkspacePropsOpen : "",
                        debugDrawerVisible.value ? styles.editorWorkspacePlaygroundOpen : "",
                      ]}
                    >
                      <div class={styles.canvasFull}>
                        <div ref={graphContainerRef} class={[styles.x6Canvas, handPanMode.value ? styles.x6CanvasHand : ""]} />
                        <div ref={minimapContainerRef} class={styles.minimapHost} />

                        <div class={styles.paletteDock}>
                          <div class={styles.paletteLead}>拖动到画布新建</div>
                          <div class={styles.paletteSearchRow}>
                            <Input
                              class={styles.paletteSearchInput}
                              value={paletteKeyword.value}
                              placeholder="搜索"
                              showCount={false}
                              allowClear={false}
                              prefix={<SearchOutlined class={styles.paletteSearchIcon} />}
                              onUpdate:value={(value: unknown) => {
                                paletteKeyword.value = String(value ?? "");
                              }}
                            />
                          </div>
                          <div class={styles.paletteScroll}>
                            {filteredComponentGroups.value.map((group) => (
                              <div key={group.groupName} class={styles.paletteGroup}>
                                <div class={styles.paletteGroupTitle}>{group.groupName}</div>
                                <div class={styles.paletteGroupItems}>
                                  {group.items.map((component) => {
                                    const iconSrc = paletteIconSrc(component.componentKey);
                                    return (
                                      <div
                                        key={component.componentKey}
                                        class={styles.paletteItem}
                                        onClick={() => addNodeFromClick(component)}
                                        onMousedown={(event) => startDragPalette(component, event)}
                                      >
                                        {iconSrc ? (
                                          <span class={styles.paletteIconWrap}>
                                            <img class={styles.paletteItemIcon} src={iconSrc} alt="" aria-hidden />
                                          </span>
                                        ) : (
                                          <span
                                            class={styles.paletteIconChip}
                                            style={{ background: `hsl(${paletteHue(component.componentKey)} 62% 52%)` }}
                                          >
                                            <span class={styles.paletteIconTxt}>{component.componentName.slice(0, 1)}</span>
                                          </span>
                                        )}
                                        <span class={styles.paletteItemLabel}>{component.componentName}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {store.selectedNode ? (
                          <div class={styles.rightPanelDock}>
                            <div class={styles.rightPanelHeader}>
                              <div class={styles.rightPanelHeaderLead}>
                                {(() => {
                                  const key = store.selectedNode.data.componentKey;
                                  const iconSrc = paletteIconSrc(key);
                                  return iconSrc ? (
                                    <span class={styles.rightPanelHeaderIconWrap}>
                                      <img class={styles.rightPanelHeaderIcon} src={iconSrc} alt="" aria-hidden />
                                    </span>
                                  ) : (
                                    <span
                                      class={styles.rightPanelHeaderIconChip}
                                      style={{ background: `hsl(${paletteHue(key)} 62% 52%)` }}
                                      aria-hidden
                                    >
                                      {store.selectedNode.data.componentName.slice(0, 1)}
                                    </span>
                                  );
                                })()}
                                <AntInput
                                  class={styles.rightPanelTitleInput}
                                  bordered={false}
                                  showCount={false}
                                  allowClear={false}
                                  maxlength={999999}
                                  value={store.selectedNode.data.label}
                                  placeholder="节点名称"
                                  onUpdate:value={(value: string) => {
                                    const nextLabel = String(value ?? "");
                                    store.updateSelectedNodeLabel(nextLabel);
                                    updateLiveSelectedNode({
                                      ...store.selectedNode!.data,
                                      label: nextLabel,
                                    });
                                  }}
                                />
                              </div>
                              <div class={styles.rightPanelHeaderActions}>
                                <button type="button" class={styles.rightPanelClose} aria-label="关闭属性面板" onClick={dismissRightPanel}>
                                  ×
                                </button>
                              </div>
                            </div>
                            {store.selectedNode.data.componentKey === "chat-input" ? (
                              <div class={[styles.rightPanelBody, styles.rightPanelBodyChatOnly]}>
                                <div class={styles.field}>
                                  <label class={styles.label}>输入</label>
                                  <AntTextarea
                                    class={styles.rightPanelChatTextarea}
                                    bordered
                                    rows={3}
                                    showCount={false}
                                    value={
                                      store.selectedNode.data.config.placeholder == null
                                        ? ""
                                        : String(store.selectedNode.data.config.placeholder)
                                    }
                                    placeholder="请输入"
                                    onUpdate:value={(value: string) => {
                                      patchSelectedNodeConfig({ placeholder: String(value ?? "") });
                                    }}
                                  />
                                </div>
                              </div>
                            ) : store.selectedNode.data.componentKey === "chat-output" ? (
                              <div class={[styles.rightPanelBody, styles.rightPanelBodyChatOnly]}>
                                <div class={styles.field}>
                                  <label class={styles.label}>输出</label>
                                  <AntTextarea
                                    class={styles.rightPanelChatTextarea}
                                    bordered
                                    rows={3}
                                    showCount={false}
                                    value={
                                      store.selectedNode.data.config.placeholder == null
                                        ? ""
                                        : String(store.selectedNode.data.config.placeholder)
                                    }
                                    placeholder="请输入"
                                    onUpdate:value={(value: string) => {
                                      patchSelectedNodeConfig({ placeholder: String(value ?? "") });
                                    }}
                                  />
                                </div>
                              </div>
                            ) : store.selectedNode.data.componentKey === "image-generation" ? (
                              <div class={[styles.rightPanelBody, styles.rightPanelBodyLlm]}>
                                {renderModelSelectField()}
                                <div class={[styles.field, imageGenerationPromptLocked.value ? styles.fieldUserInputLocked : ""]}>
                                  <label class={styles.label}>
                                    提示词 <span class={styles.labelRequired}>*</span>
                                  </label>
                                  <AntTextarea
                                    class={styles.rightPanelChatTextarea}
                                    bordered
                                    disabled={imageGenerationPromptLocked.value}
                                    rows={4}
                                    showCount={false}
                                    value={
                                      store.selectedNode.data.config.prompt == null ? "" : String(store.selectedNode.data.config.prompt)
                                    }
                                    placeholder={
                                      imageGenerationPromptLocked.value
                                        ? "已连接上游至 prompt 口，运行时使用连线传入内容。"
                                        : "描述要生成的图像内容"
                                    }
                                    onUpdate:value={(value: string) => {
                                      if (imageGenerationPromptLocked.value) {
                                        return;
                                      }
                                      patchSelectedNodeConfig({ prompt: String(value ?? "") });
                                    }}
                                  />
                                </div>
                                <div class={styles.field}>
                                  <label class={styles.label}>反向提示词</label>
                                  <AntInput
                                    bordered
                                    value={
                                      store.selectedNode.data.config.negative_prompt == null
                                        ? ""
                                        : String(store.selectedNode.data.config.negative_prompt)
                                    }
                                    placeholder="可选"
                                    onUpdate:value={(value: string) => {
                                      patchSelectedNodeConfig({ negative_prompt: String(value ?? "") });
                                    }}
                                  />
                                </div>
                                <div class={styles.field}>
                                  <label class={styles.label}>分辨率</label>
                                  <AntInput
                                    bordered
                                    value={store.selectedNode.data.config.size == null ? "" : String(store.selectedNode.data.config.size)}
                                    placeholder="例如 1024*1024"
                                    onUpdate:value={(value: string) => {
                                      patchSelectedNodeConfig({ size: String(value ?? "") });
                                    }}
                                  />
                                </div>
                                <div class={styles.field}>
                                  <div class={styles.agentSwitchHead}>
                                    <label class={styles.label}>提示词改写</label>
                                    <Switch
                                      checked={Boolean(store.selectedNode.data.config.prompt_extend)}
                                      onUpdate:checked={(checked: boolean) => {
                                        patchSelectedNodeConfig({ prompt_extend: checked });
                                      }}
                                    />
                                  </div>
                                </div>
                                <div class={styles.field}>
                                  <div class={styles.agentSwitchHead}>
                                    <label class={styles.label}>水印</label>
                                    <Switch
                                      checked={Boolean(store.selectedNode.data.config.watermark)}
                                      onUpdate:checked={(checked: boolean) => {
                                        patchSelectedNodeConfig({ watermark: checked });
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : store.selectedNode.data.componentKey === "language-model" ? (
                              <div class={[styles.rightPanelBody, styles.rightPanelBodyLlm]}>
                                {renderModelSelectField()}
                                <div class={[styles.field, languageModelInputLocked.value ? styles.fieldUserInputLocked : ""]}>
                                  <label class={styles.label}>用户输入</label>
                                  <AntTextarea
                                    class={styles.rightPanelChatTextarea}
                                    bordered
                                    disabled={languageModelInputLocked.value}
                                    rows={4}
                                    showCount={false}
                                    value={languageModelPanelInputValue(store.selectedNode.data.config)}
                                    placeholder={
                                      languageModelInputLocked.value ? "已连接上游至 input 口，运行时使用连线传入内容。" : undefined
                                    }
                                    onUpdate:value={(value: string) => {
                                      if (languageModelInputLocked.value) {
                                        return;
                                      }
                                      patchSelectedNodeConfig({ input: String(value ?? "") });
                                    }}
                                  />
                                </div>
                                <div class={styles.field}>
                                  <label class={styles.label}>系统 message</label>
                                  <AntTextarea
                                    class={styles.rightPanelChatTextarea}
                                    bordered
                                    rows={5}
                                    showCount={false}
                                    value={
                                      store.selectedNode.data.config.systemMessage == null
                                        ? ""
                                        : String(store.selectedNode.data.config.systemMessage)
                                    }
                                    placeholder="SYSTEM 角色与指令"
                                    onUpdate:value={(value: string) => {
                                      patchSelectedNodeConfig({ systemMessage: String(value ?? "") });
                                    }}
                                  />
                                </div>
                              </div>
                            ) : store.selectedNode!.data.componentKey === "smart-router" ? (
                              <div class={[styles.rightPanelBody, styles.rightPanelBodySmartRouter]}>
                                {renderModelSelectField()}
                                <div class={styles.field}>
                                  <label class={styles.label}>附加说明（可选）</label>
                                  <AntTextarea
                                    class={styles.rightPanelChatTextarea}
                                    bordered
                                    rows={5}
                                    showCount={false}
                                    placeholder="可选：补充路由模型的分类准则…"
                                    value={
                                      typeof store.selectedNode.data.config.custom_prompt === "string"
                                        ? store.selectedNode.data.config.custom_prompt
                                        : ""
                                    }
                                    onUpdate:value={(value: string) => {
                                      patchSelectedNodeConfig({ custom_prompt: String(value ?? "") });
                                    }}
                                  />
                                </div>
                                <div class={styles.field}>
                                  <label class={styles.label}>
                                    路由 <span class={styles.labelRequired}>*</span>
                                  </label>
                                  <p class={styles.helperText}>
                                    每条路由对应画布右侧一个输出连接点；名称、描述、消息会随流程保存并供运行态使用。
                                  </p>
                                  <div class={styles.smartRouteList}>
                                    {getSmartRouterRoutesList(store.selectedNode!.data.config).map((route, routeIndex) => (
                                      <div key={routeIndex} class={styles.smartRouteCard}>
                                        <div class={styles.smartRouteCardHead}>
                                          <span>路由 {routeIndex + 1}</span>
                                          <button
                                            type="button"
                                            class={styles.smartRouteRemove}
                                            onClick={() => {
                                              const list = getSmartRouterRoutesList(store.selectedNode!.data.config);
                                              if (list.length <= 1) {
                                                message.warning("至少保留一条路由");
                                                return;
                                              }
                                              const next = list.filter((_, j) => j !== routeIndex);
                                              patchSelectedNodeConfig({ routes: next });
                                            }}
                                          >
                                            删除
                                          </button>
                                        </div>
                                        <div class={styles.smartRouteField}>
                                          <label class={styles.subLabel}>路由名称</label>
                                          <AntInput
                                            class={styles.smartRouteInput}
                                            bordered
                                            value={route.route_name}
                                            placeholder="如：礼貌问答"
                                            onUpdate:value={(v: string) => {
                                              const list = getSmartRouterRoutesList(store.selectedNode!.data.config);
                                              const next = list.map((r, j) =>
                                                j === routeIndex ? { ...r, route_name: String(v ?? "") } : r,
                                              );
                                              patchSelectedNodeConfig({ routes: next });
                                            }}
                                          />
                                        </div>
                                        <div class={styles.smartRouteField}>
                                          <label class={styles.subLabel}>路由描述</label>
                                          <AntTextarea
                                            class={styles.smartRouteTextarea}
                                            bordered
                                            rows={2}
                                            showCount={false}
                                            value={route.route_description}
                                            placeholder="说明该路由适用的问题类型"
                                            onUpdate:value={(v: string) => {
                                              const list = getSmartRouterRoutesList(store.selectedNode!.data.config);
                                              const next = list.map((r, j) =>
                                                j === routeIndex ? { ...r, route_description: String(v ?? "") } : r,
                                              );
                                              patchSelectedNodeConfig({ routes: next });
                                            }}
                                          />
                                        </div>
                                        <div class={styles.smartRouteField}>
                                          <label class={styles.subLabel}>路由消息（可选）</label>
                                          <AntTextarea
                                            class={styles.smartRouteTextarea}
                                            bordered
                                            rows={2}
                                            showCount={false}
                                            value={route.route_message}
                                            placeholder="匹配该路由时可下发的固定回复或提示"
                                            onUpdate:value={(v: string) => {
                                              const list = getSmartRouterRoutesList(store.selectedNode!.data.config);
                                              const next = list.map((r, j) =>
                                                j === routeIndex ? { ...r, route_message: String(v ?? "") } : r,
                                              );
                                              patchSelectedNodeConfig({ routes: next });
                                            }}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    class={styles.smartRouteAdd}
                                    onClick={() => {
                                      const list = getSmartRouterRoutesList(store.selectedNode!.data.config);
                                      patchSelectedNodeConfig({
                                        routes: [
                                          ...list,
                                          {
                                            route_name: `路由 ${list.length + 1}`,
                                            route_description: "",
                                            route_message: "",
                                          },
                                        ],
                                      });
                                    }}
                                  >
                                    + 添加路由
                                  </button>
                                </div>
                              </div>
                            ) : store.selectedNode!.data.componentKey === "agent" ? (
                              <div class={[styles.rightPanelBody, styles.rightPanelBodyLlm]}>
                                {renderModelSelectField()}
                                <div class={styles.field}>
                                  <label class={styles.label}>MCP 服务配置（可选）</label>
                                  <p class={styles.helperText}>MCP服务配置，支持多个MCP服务。</p>
                                  <AntTextarea
                                    class={styles.rightPanelChatTextarea}
                                    bordered
                                    rows={10}
                                    showCount={false}
                                    placeholder={AGENT_MCP_SERVICE_CONFIG_PLACEHOLDER}
                                    value={
                                      typeof store.selectedNode.data.config.mcpServiceConfig === "string"
                                        ? store.selectedNode.data.config.mcpServiceConfig
                                        : ""
                                    }
                                    onUpdate:value={(value: string) => {
                                      patchSelectedNodeConfig({ mcpServiceConfig: String(value ?? "") });
                                    }}
                                  />
                                </div>
                                <div class={styles.field}>
                                  <div class={styles.agentSliderHead}>
                                    <label class={styles.label}>最大迭代次数</label>
                                    <span class={styles.agentSliderValueHint}>
                                      {readAgentIntField(
                                        store.selectedNode.data.config,
                                        "max_iterations",
                                        "maxIterations",
                                        AGENT_DEFAULT_MAX_ITERATIONS,
                                        1,
                                        AGENT_MAX_ITERATIONS_SLIDER_MAX,
                                      )}
                                      次<span class={styles.agentSliderDefaultTag}>默认 {AGENT_DEFAULT_MAX_ITERATIONS} 次</span>
                                    </span>
                                  </div>
                                  <p class={styles.helperText}>
                                    单次运行中推理与工具调用的最大轮数；拖动调节（1～{AGENT_MAX_ITERATIONS_SLIDER_MAX}）。
                                  </p>
                                  <div class={styles.agentSliderTrack}>
                                    <ThemedSlider
                                      min={1}
                                      max={AGENT_MAX_ITERATIONS_SLIDER_MAX}
                                      step={1}
                                      value={readAgentIntField(
                                        store.selectedNode.data.config,
                                        "max_iterations",
                                        "maxIterations",
                                        AGENT_DEFAULT_MAX_ITERATIONS,
                                        1,
                                        AGENT_MAX_ITERATIONS_SLIDER_MAX,
                                      )}
                                      onUpdate:value={(v: number) => {
                                        patchSelectedNodeConfig({
                                          max_iterations: v,
                                          maxIterations: undefined,
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                                <div class={styles.field}>
                                  <div class={styles.agentSwitchHead}>
                                    <label class={styles.label}>当前时间</label>
                                    <Switch
                                      value={Boolean(
                                        store.selectedNode.data.config.add_current_date_tool ??
                                        store.selectedNode.data.config.addCurrentDateTool,
                                      )}
                                      onChange={(checked: boolean) => {
                                        patchSelectedNodeConfig({
                                          add_current_date_tool: checked,
                                          addCurrentDateTool: undefined,
                                        });
                                      }}
                                    />
                                  </div>
                                  <p class={styles.helperText}>开关选项：开启后为智能体附加「当前日期」工具。</p>
                                </div>
                                <div class={styles.field}>
                                  <div class={styles.agentSliderHead}>
                                    <label class={styles.label}>最大回答历史数量</label>
                                    <span class={styles.agentSliderValueHint}>
                                      {readAgentIntField(
                                        store.selectedNode.data.config,
                                        "n_messages",
                                        "nMessages",
                                        AGENT_DEFAULT_N_MESSAGES,
                                        0,
                                        AGENT_N_MESSAGES_SLIDER_MAX,
                                      )}
                                      条<span class={styles.agentSliderDefaultTag}>默认 {AGENT_DEFAULT_N_MESSAGES} 条</span>
                                    </span>
                                  </div>
                                  <p class={styles.helperText}>
                                    纳入上下文的对话历史条数上限；拖动调节（0～{AGENT_N_MESSAGES_SLIDER_MAX}）。
                                  </p>
                                  <div class={styles.agentSliderTrack}>
                                    <ThemedSlider
                                      min={0}
                                      max={AGENT_N_MESSAGES_SLIDER_MAX}
                                      step={1}
                                      value={readAgentIntField(
                                        store.selectedNode.data.config,
                                        "n_messages",
                                        "nMessages",
                                        AGENT_DEFAULT_N_MESSAGES,
                                        0,
                                        AGENT_N_MESSAGES_SLIDER_MAX,
                                      )}
                                      onUpdate:value={(v: number) => {
                                        patchSelectedNodeConfig({
                                          n_messages: v,
                                          nMessages: undefined,
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                                <div class={styles.field}>
                                  <label class={styles.label}>智能体指令</label>
                                  <p class={styles.helperText}>描述角色、工具策略与安全边界；将作为系统指令下发至流程运行时。</p>
                                  <AntTextarea
                                    class={styles.rightPanelChatTextarea}
                                    bordered
                                    rows={8}
                                    showCount={false}
                                    value={
                                      typeof store.selectedNode.data.config.systemPrompt === "string"
                                        ? store.selectedNode.data.config.systemPrompt
                                        : typeof store.selectedNode.data.config.system_prompt === "string"
                                          ? String(store.selectedNode.data.config.system_prompt)
                                          : ""
                                    }
                                    placeholder="你是……"
                                    onUpdate:value={(value: string) => {
                                      patchSelectedNodeConfig({ systemPrompt: String(value ?? "") });
                                    }}
                                  />
                                </div>
                              </div>
                            ) : store.selectedNode!.data.componentKey === "knowledge-retrieval" ? (
                              <div class={[styles.rightPanelBody, styles.rightPanelBodyKnowledge]}>
                                <div class={styles.field}>
                                  <div class={styles.knowledgeKbHeaderRow}>
                                    <label class={styles.label}>
                                      知识库 <span class={styles.labelRequired}>*</span>
                                    </label>
                                    <div class={styles.knowledgeKbActions}>
                                      <button type="button" class={styles.knowledgeKbTextBtn} onClick={() => openKnowledgeBatchModal()}>
                                        召回设置
                                      </button>
                                      <button
                                        type="button"
                                        class={styles.knowledgeKbAddBtn}
                                        aria-label="添加知识库"
                                        onClick={() => openKnowledgePickModal()}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                  <p class={styles.helperText}>可多选知识文档；每项单独配置 TopK 与分数阈值</p>
                                  <div class={styles.smartRouteList}>
                                    {knowledgeSourcesForPanel().map((row, rowIndex) => {
                                      const displayName =
                                        row.documentName.trim() !== ""
                                          ? row.documentName
                                          : (store.knowledgeOptions.find((d) => d.id === row.documentId)?.name ?? row.documentId);
                                      return (
                                        <div key={`${row.documentId}-${rowIndex}`} class={styles.knowledgeKbCard}>
                                          <div class={styles.knowledgeKbCardTop}>
                                            <img class={styles.knowledgeKbCardIcon} src="/resource/v1/ai-application/kbSearch.png" alt="" />
                                            <span class={styles.knowledgeKbCardTitle}>{displayName}</span>
                                          </div>
                                          <div class={styles.knowledgeKbCardFields}>
                                            <div class={styles.knowledgeBatchSliderField}>
                                              <div class={styles.knowledgeBatchSliderHead}>
                                                <label class={styles.subLabel}>TopK</label>
                                                <span class={styles.knowledgeBatchSliderValueHint}>{row.topK}</span>
                                              </div>
                                              <div class={styles.knowledgeBatchSliderTrack}>
                                                <ThemedSlider
                                                  min={1}
                                                  max={KB_TOPK_MAX}
                                                  step={1}
                                                  value={row.topK}
                                                  onUpdate:value={(v: number) => {
                                                    const list = knowledgeSourcesForPanel();
                                                    const nextVal = clampKbTopK(v);
                                                    const next = list.map((r, j) => (j === rowIndex ? { ...r, topK: nextVal } : r));
                                                    patchSelectedNodeConfig({
                                                      knowledgeSources: persistKnowledgeSources(next),
                                                    });
                                                  }}
                                                />
                                              </div>
                                            </div>
                                            <div class={styles.knowledgeBatchSliderField}>
                                              <div class={styles.knowledgeBatchSliderHead}>
                                                <label class={styles.subLabel}>分数阈值</label>
                                                <span class={styles.knowledgeBatchSliderValueHint}>
                                                  {clampKbScore(row.scoreThreshold).toFixed(1)}
                                                </span>
                                              </div>
                                              <div class={styles.knowledgeBatchSliderTrack}>
                                                <ThemedSlider
                                                  min={0}
                                                  max={1}
                                                  step={0.1}
                                                  value={row.scoreThreshold}
                                                  onUpdate:value={(v: number) => {
                                                    const list = knowledgeSourcesForPanel();
                                                    const nextVal = clampKbScore(v);
                                                    const next = list.map((r, j) =>
                                                      j === rowIndex ? { ...r, scoreThreshold: nextVal } : r,
                                                    );
                                                    patchSelectedNodeConfig({
                                                      knowledgeSources: persistKnowledgeSources(next),
                                                    });
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                          <button
                                            type="button"
                                            class={styles.smartRouteRemove}
                                            onClick={() => {
                                              const list = knowledgeSourcesForPanel().filter((_, j) => j !== rowIndex);
                                              patchSelectedNodeConfig({
                                                ...clearKnowledgeRetrievalLegacyKeys(),
                                                knowledgeSources: persistKnowledgeSources(list),
                                              });
                                            }}
                                          >
                                            移除
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            ) : store.selectedNode!.data.componentKey === "if-else" ? (
                              <div class={[styles.rightPanelBody, styles.rightPanelBodyLlm, styles.ifElsePanelRoot]}>
                                <p class={styles.ifElsePanelHint}>
                                  关闭「画布入边」开关后，画布将隐藏该行与连接桩；IF / ELSE 始终在入参预览下方右侧。
                                </p>
                                <div class={styles.ifElsePanelSection}>
                                  <div class={styles.ifElseSectionHead}>
                                    <span class={styles.ifElseSectionTitle}>画布入边</span>
                                  </div>
                                  <p class={styles.ifElseSectionDesc}>以下为可与上游连线的三项；灰色预览与画布节点一致。</p>
                                  {(
                                    [
                                      {
                                        enableKey: "enable_text_input",
                                        title: "文本输入",
                                        hint: "参与比较的主文本。",
                                        kind: "textarea",
                                        valueKey: "input_text",
                                        rows: 3,
                                      },
                                      {
                                        enableKey: "enable_operator",
                                        title: "运算符",
                                        hint: "文本比较方式。",
                                        kind: "operator",
                                        valueKey: "operator",
                                      },
                                      {
                                        enableKey: "enable_match_text",
                                        title: "匹配文本",
                                        hint: "与文本输入比较的目标串。",
                                        kind: "textarea",
                                        valueKey: "match_text",
                                        rows: 3,
                                      },
                                    ] as const
                                  ).map((row) => {
                                    const cfg = store.selectedNode!.data.config;
                                    const flags = ifElseResolvedEnableFlags(cfg);
                                    const on = Boolean(flags[row.enableKey as keyof typeof flags]);
                                    const value = cfg[row.valueKey];
                                    const inputTextLocked = row.valueKey === "input_text" && ifElseInputTextLocked.value;
                                    return (
                                      <div
                                        key={row.enableKey}
                                        class={[styles.ifElseFieldBlock, inputTextLocked ? styles.fieldUserInputLocked : ""]}
                                      >
                                        <div class={styles.ifElseToggleRow}>
                                          <div class={styles.ifElseToggleMeta}>
                                            <div class={styles.ifElseToggleTitleRow}>
                                              <label class={styles.ifElseToggleLabel}>{row.title}</label>
                                              <Tooltip title={row.hint}>
                                                <span class={styles.ifElseHelpMark}>?</span>
                                              </Tooltip>
                                            </div>
                                          </div>
                                          <Switch
                                            value={on}
                                            onChange={(checked: boolean) => {
                                              patchSelectedNodeConfig({ [row.enableKey]: checked });
                                            }}
                                          />
                                        </div>
                                        {on && row.kind === "textarea" ? (
                                          <AntTextarea
                                            class={styles.rightPanelChatTextarea}
                                            bordered
                                            disabled={inputTextLocked}
                                            rows={"rows" in row ? row.rows : 3}
                                            showCount={false}
                                            value={value == null ? "" : String(value)}
                                            placeholder={
                                              inputTextLocked ? "已连接上游至「文本输入」口，运行时使用连线传入内容。" : undefined
                                            }
                                            onUpdate:value={(v: string) => {
                                              if (inputTextLocked) {
                                                return;
                                              }
                                              patchSelectedNodeConfig({ [row.valueKey]: String(v ?? "") });
                                            }}
                                          />
                                        ) : null}
                                        {on && row.kind === "operator" ? (
                                          <AntSelect
                                            class={styles.modelSelect}
                                            popupClassName={styles.modelSelectDropdown}
                                            placeholder="运算符"
                                            getPopupContainer={(trigger: HTMLElement) =>
                                              trigger.closest(`.${styles.rightPanelDock}`) ?? document.body
                                            }
                                            value={typeof value === "string" && value !== "" ? value : "equals"}
                                            onChange={(next: unknown) => {
                                              patchSelectedNodeConfig({
                                                operator: next == null ? "equals" : String(next),
                                              });
                                            }}
                                          >
                                            {IF_ELSE_OPERATOR_OPTIONS.map((opt) => (
                                              <AntSelect.Option key={opt.value} value={opt.value}>
                                                {opt.label}
                                              </AntSelect.Option>
                                            ))}
                                          </AntSelect>
                                        ) : null}
                                      </div>
                                    );
                                  })}
                                </div>
                                <div class={styles.ifElsePanelSection}>
                                  <div class={styles.ifElseSectionHead}>
                                    <span class={styles.ifElseSectionTitle}>条件与迭代</span>
                                  </div>
                                  <div class={styles.ifElseFieldBlock}>
                                    <div class={styles.ifElseToggleRow}>
                                      <div class={styles.ifElseToggleMeta}>
                                        <div class={styles.ifElseToggleTitleRow}>
                                          <label class={styles.ifElseToggleLabel}>区分大小写</label>
                                          <Tooltip title="比较字符串时是否区分英文字母大小写。">
                                            <span class={styles.ifElseHelpMark}>?</span>
                                          </Tooltip>
                                        </div>
                                      </div>
                                      <Switch
                                        value={Boolean(store.selectedNode!.data.config.case_sensitive)}
                                        onChange={(checked: boolean) => {
                                          patchSelectedNodeConfig({
                                            case_sensitive: checked,
                                            enable_case_sensitive: checked,
                                          });
                                        }}
                                      />
                                    </div>
                                  </div>
                                  {(
                                    [
                                      {
                                        enableKey: "enable_case_true",
                                        title: "条件为真时的消息",
                                        hint: "条件成立时的模板或固定文案。",
                                        kind: "textarea",
                                        valueKey: "case_true",
                                        rows: 3,
                                      },
                                      {
                                        enableKey: "enable_case_false",
                                        title: "条件为假时的消息",
                                        hint: "条件不成立时的模板或固定文案。",
                                        kind: "textarea",
                                        valueKey: "case_false",
                                        rows: 3,
                                      },
                                      {
                                        enableKey: "enable_max_iterations",
                                        title: "最大迭代次数",
                                        hint: "条件判定循环上限。",
                                        kind: "number",
                                        valueKey: "max_iterations",
                                      },
                                    ] as const
                                  ).map((row) => {
                                    const cfg = store.selectedNode!.data.config;
                                    const flags = ifElseResolvedEnableFlags(cfg);
                                    const on = Boolean(flags[row.enableKey as keyof typeof flags]);
                                    const value = cfg[row.valueKey];
                                    return (
                                      <div key={row.enableKey} class={styles.ifElseFieldBlock}>
                                        <div class={styles.ifElseToggleRow}>
                                          <div class={styles.ifElseToggleMeta}>
                                            <div class={styles.ifElseToggleTitleRow}>
                                              <label class={styles.ifElseToggleLabel}>{row.title}</label>
                                              <Tooltip title={row.hint}>
                                                <span class={styles.ifElseHelpMark}>?</span>
                                              </Tooltip>
                                            </div>
                                          </div>
                                          <Switch
                                            value={on}
                                            onChange={(checked: boolean) => {
                                              patchSelectedNodeConfig({ [row.enableKey]: checked });
                                            }}
                                          />
                                        </div>
                                        {on && row.kind === "textarea" ? (
                                          <AntTextarea
                                            class={styles.rightPanelChatTextarea}
                                            bordered
                                            rows={"rows" in row ? row.rows : 3}
                                            showCount={false}
                                            value={value == null ? "" : String(value)}
                                            onUpdate:value={(v: string) => {
                                              patchSelectedNodeConfig({ [row.valueKey]: String(v ?? "") });
                                            }}
                                          />
                                        ) : null}
                                        {on && row.kind === "number" ? (
                                          <InputNumber
                                            class={styles.ifElseNumberInput}
                                            min={0}
                                            max={999999}
                                            precision={0}
                                            value={
                                              value == null || value === "" ? undefined : typeof value === "number" ? value : Number(value)
                                            }
                                            onUpdate:value={(v: number | string | null) => {
                                              const next = v == null || v === "" ? 0 : typeof v === "number" ? v : Number(v);
                                              patchSelectedNodeConfig({
                                                max_iterations: Number.isFinite(next) ? next : 0,
                                              });
                                            }}
                                          />
                                        ) : null}
                                      </div>
                                    );
                                  })}
                                </div>
                                <div class={styles.ifElsePanelSection}>
                                  <div class={styles.ifElseDefaultRouteRow}>
                                    <label class={styles.ifElseDefaultRouteLabel}>默认路由</label>
                                    <Tooltip title="未明确命中时的布尔偏好；仅存于配置，无画布连接点。">
                                      <span class={styles.ifElseHelpMark}>?</span>
                                    </Tooltip>
                                    <div class={styles.ifElseDefaultRouteSelectWrap}>
                                      <AntSelect
                                        class={styles.modelSelect}
                                        popupClassName={styles.modelSelectDropdown}
                                        placeholder="请选择"
                                        style={{ width: "100%" }}
                                        getPopupContainer={(trigger: HTMLElement) =>
                                          trigger.closest(`.${styles.rightPanelDock}`) ?? document.body
                                        }
                                        value={normalizeIfElseDefaultRoute(store.selectedNode!.data.config.default_route)}
                                        onChange={(next: unknown) => {
                                          patchSelectedNodeConfig({
                                            default_route: normalizeIfElseDefaultRoute(next),
                                          });
                                        }}
                                      >
                                        <AntSelect.Option value="true">true</AntSelect.Option>
                                        <AntSelect.Option value="false">false</AntSelect.Option>
                                      </AntSelect>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : store.selectedNode!.data.componentKey === "loop" ? (
                              <div class={[styles.rightPanelBody, styles.rightPanelBodyChatOnly]}>
                                <p class={styles.helperText}>{LOOP_NODE_PANEL_DESCRIPTION}</p>
                              </div>
                            ) : store.selectedNode!.data.componentKey === "notify" ? (
                              <div class={styles.rightPanelBody}>
                                <p class={styles.rightPanelSectionTitle}>基础</p>
                                <div class={styles.field}>
                                  <label class={styles.label}>
                                    上下文键 <span class={styles.labelRequired}>*</span>
                                  </label>
                                  <p class={styles.helperText}>写入上下文的键名，供下游接收通知引用。</p>
                                  <AntInput
                                    bordered
                                    value={
                                      typeof store.selectedNode.data.config.context_key === "string"
                                        ? store.selectedNode.data.config.context_key
                                        : ""
                                    }
                                    placeholder="请输入上下文键"
                                    onUpdate:value={(v: string) => {
                                      patchSelectedNodeConfig({ context_key: String(v ?? "") });
                                    }}
                                  />
                                </div>
                                <div class={styles.field}>
                                  <div class={styles.agentSwitchHead}>
                                    <label class={styles.label}>追加</label>
                                    <Switch
                                      value={Boolean(store.selectedNode.data.config.append)}
                                      onChange={(checked: boolean) => {
                                        patchSelectedNodeConfig({ append: checked });
                                      }}
                                    />
                                  </div>
                                  <p class={styles.helperText}>是否在既有上下文上追加通知内容。</p>
                                </div>
                              </div>
                            ) : (
                              <div class={styles.rightPanelBody}>
                                {store.selectedNode.data.componentKey !== "prompt-template" &&
                                store.selectedNode.data.componentKey !== "smart-router" &&
                                store.selectedNode.data.componentKey !== "knowledge-retrieval" &&
                                store.selectedNode.data.componentKey !== "if-else" &&
                                store.selectedNode.data.componentKey !== "notify" ? (
                                  <>
                                    <p class={styles.rightPanelSectionTitle}>属性与结果</p>
                                    <div class={styles.field}>
                                      <label class={styles.label}>组件类型</label>
                                      <div class={styles.helperText}>
                                        {store.selectedNode.data.componentName} / {store.selectedNode.data.mappingType}
                                      </div>
                                    </div>
                                  </>
                                ) : null}

                                {selectedComponent.value &&
                                store.selectedNode.data.componentKey !== "smart-router" &&
                                store.selectedNode.data.componentKey !== "agent" &&
                                store.selectedNode.data.componentKey !== "knowledge-retrieval" &&
                                store.selectedNode.data.componentKey !== "if-else" &&
                                store.selectedNode.data.componentKey !== "notify" &&
                                Array.isArray(selectedComponent.value.presentationSchema?.fields) &&
                                selectedComponent.value.presentationSchema.fields.length > 0
                                  ? selectedComponent.value.presentationSchema.fields.map((field) => {
                                      const fieldKey = String(field.key ?? "");
                                      const fieldLabel = String(field.label ?? fieldKey);
                                      const fieldType = String(field.type ?? "string");
                                      const value = store.selectedNode?.data.config[fieldKey];
                                      const fieldDesc = presentationFieldDescription(field);
                                      const fieldRows =
                                        typeof (field as { rows?: unknown }).rows === "number" ? (field as { rows: number }).rows : 6;
                                      if (fieldType === "boolean") {
                                        return (
                                          <div key={fieldKey} class={styles.field}>
                                            <label class={styles.label}>{fieldLabel}</label>
                                            {fieldDesc !== "" ? <div class={styles.helperText}>{fieldDesc}</div> : null}
                                            <Switch
                                              value={Boolean(value)}
                                              onChange={(checked: boolean) => patchSelectedNodeConfig({ [fieldKey]: checked })}
                                            />
                                          </div>
                                        );
                                      }
                                      if (fieldType === "select") {
                                        const rawOpts = (field as { options?: unknown }).options;
                                        const options = Array.isArray(rawOpts) ? (rawOpts as { value?: unknown; label?: unknown }[]) : [];
                                        const selectVal = value == null || String(value) === "" ? undefined : String(value);
                                        return (
                                          <div key={fieldKey} class={styles.field}>
                                            <label class={styles.label}>{fieldLabel}</label>
                                            {fieldDesc !== "" ? <div class={styles.helperText}>{fieldDesc}</div> : null}
                                            <AntSelect
                                              class={styles.modelSelect}
                                              popupClassName={styles.modelSelectDropdown}
                                              placeholder="请选择"
                                              allowClear
                                              getPopupContainer={(trigger: HTMLElement) =>
                                                trigger.closest(`.${styles.rightPanelDock}`) ?? document.body
                                              }
                                              value={selectVal}
                                              onChange={(next: unknown) => {
                                                patchSelectedNodeConfig({
                                                  [fieldKey]: next == null ? "" : String(next),
                                                });
                                              }}
                                            >
                                              {options.map((opt) => {
                                                const v = opt.value == null ? "" : String(opt.value);
                                                return (
                                                  <AntSelect.Option key={v || "__empty"} value={v}>
                                                    {String(opt.label ?? opt.value ?? "")}
                                                  </AntSelect.Option>
                                                );
                                              })}
                                            </AntSelect>
                                          </div>
                                        );
                                      }
                                      if (fieldType === "model-ref") {
                                        return (
                                          <div key={fieldKey} class={styles.field}>
                                            <label class={styles.label}>{fieldLabel}</label>
                                            {fieldDesc !== "" ? <div class={styles.helperText}>{fieldDesc}</div> : null}
                                            <AntSelect
                                              class={styles.modelSelect}
                                              popupClassName={styles.modelSelectDropdown}
                                              placeholder="请选择模型"
                                              allowClear
                                              showSearch
                                              filterOption={(input: string, option: unknown) => {
                                                const optId = String((option as { value?: string }).value ?? "");
                                                const optItem = store.modelOptions.find((m) => m.id === optId);
                                                if (!optItem) {
                                                  return false;
                                                }
                                                const hay =
                                                  `${optItem.providerName ?? ""} ${optItem.modelCode} ${optItem.groupName}`.toLowerCase();
                                                return hay.includes(input.trim().toLowerCase());
                                              }}
                                              getPopupContainer={(trigger: HTMLElement) =>
                                                trigger.closest(`.${styles.rightPanelDock}`) ?? document.body
                                              }
                                              value={typeof value === "string" && value !== "" ? value : undefined}
                                              onChange={(nextId: unknown) => {
                                                patchSelectedNodeConfig({
                                                  [fieldKey]: nextId == null ? "" : String(nextId),
                                                });
                                              }}
                                            >
                                              {store.modelOptions.map((item) => (
                                                <AntSelect.Option key={item.id} value={item.id}>
                                                  {flowEditorModelOptionRow(item, "schemaRef")}
                                                </AntSelect.Option>
                                              ))}
                                            </AntSelect>
                                          </div>
                                        );
                                      }
                                      if (fieldType === "textarea" || (fieldKey === "template" && fieldType === "string")) {
                                        const strVal = value == null ? "" : String(value);
                                        const templateHint =
                                          fieldDesc !== ""
                                            ? fieldDesc
                                            : fieldKey === "template"
                                              ? "动态变量需使用 ${变量名} 占位；模板中每出现一个不同占位，画布左侧即多一个输入连接点，仅可对变量连线，模板正文不可连线。"
                                              : "";
                                        return (
                                          <div key={fieldKey} class={styles.field}>
                                            <label class={styles.label}>{fieldLabel}</label>
                                            {fieldKey !== "template" && fieldDesc !== "" ? (
                                              <div class={styles.helperText}>{fieldDesc}</div>
                                            ) : null}
                                            <AntTextarea
                                              class={styles.textarea}
                                              bordered
                                              rows={fieldKey === "template" ? 6 : fieldRows}
                                              value={strVal}
                                              placeholder={
                                                fieldKey === "template"
                                                  ? "例如：你是助手。用户问题：${question}\\n上下文：${context}"
                                                  : undefined
                                              }
                                              onUpdate:value={(next: string) => {
                                                patchSelectedNodeConfig({ [fieldKey]: String(next ?? "") });
                                              }}
                                            />
                                            {templateHint !== "" ? <div class={styles.helperText}>{templateHint}</div> : null}
                                          </div>
                                        );
                                      }
                                      if (fieldType === "number") {
                                        const num =
                                          value == null || value === "" ? undefined : typeof value === "number" ? value : Number(value);
                                        const safeNum = Number.isFinite(num) ? num : undefined;
                                        return (
                                          <div key={fieldKey} class={styles.field}>
                                            <label class={styles.label}>{fieldLabel}</label>
                                            {fieldDesc !== "" ? <div class={styles.helperText}>{fieldDesc}</div> : null}
                                            <InputNumber
                                              style={{ width: "100%" }}
                                              min={0}
                                              max={999999}
                                              precision={0}
                                              value={safeNum}
                                              onUpdate:value={(v: number | string | null) => {
                                                const next = v == null || v === "" ? 0 : typeof v === "number" ? v : Number(v);
                                                patchSelectedNodeConfig({
                                                  [fieldKey]: Number.isFinite(next) ? next : 0,
                                                });
                                              }}
                                            />
                                          </div>
                                        );
                                      }
                                      if (fieldType === "knowledge-ref") {
                                        const values = Array.isArray(value) ? value.map((item) => String(item)).join("\n") : "";
                                        return (
                                          <div key={fieldKey} class={styles.field}>
                                            <label class={styles.label}>{fieldLabel}</label>
                                            {fieldDesc !== "" ? <div class={styles.helperText}>{fieldDesc}</div> : null}
                                            <textarea
                                              class={styles.textarea}
                                              value={values}
                                              onInput={(event) =>
                                                patchSelectedNodeConfig({
                                                  [fieldKey]: String((event.target as HTMLTextAreaElement).value ?? "")
                                                    .split("\n")
                                                    .map((item) => item.trim())
                                                    .filter((item) => item !== ""),
                                                })
                                              }
                                            />
                                            <div class={styles.helperText}>
                                              已有文档：
                                              {store.knowledgeOptions
                                                .slice(0, 8)
                                                .map((item) => item.name)
                                                .join(" / ")}
                                            </div>
                                          </div>
                                        );
                                      }
                                      return (
                                        <div key={fieldKey} class={styles.field}>
                                          <label class={styles.label}>{fieldLabel}</label>
                                          {fieldDesc !== "" ? <div class={styles.helperText}>{fieldDesc}</div> : null}
                                          <Input
                                            value={value == null ? "" : String(value)}
                                            onUpdate:value={(nextValue: unknown) =>
                                              patchSelectedNodeConfig({
                                                [fieldKey]: fieldType === "number" ? Number(nextValue ?? 0) : String(nextValue ?? ""),
                                              })
                                            }
                                          />
                                        </div>
                                      );
                                    })
                                  : null}

                                {store.selectedNode.data.componentKey !== "prompt-template" &&
                                store.selectedNode.data.componentKey !== "smart-router" &&
                                store.selectedNode.data.componentKey !== "agent" &&
                                store.selectedNode.data.componentKey !== "knowledge-retrieval" &&
                                store.selectedNode.data.componentKey !== "if-else" &&
                                store.selectedNode.data.componentKey !== "notify" ? (
                                  <div class={styles.field}>
                                    <label class={styles.label}>配置 JSON</label>
                                    <textarea
                                      class={styles.textarea}
                                      value={rawConfigText.value}
                                      onInput={(event) => {
                                        rawConfigText.value = String((event.target as HTMLTextAreaElement).value ?? "");
                                      }}
                                    />
                                    <Button
                                      size="small"
                                      onClick={() => {
                                        try {
                                          const parsed = JSON.parse(rawConfigText.value) as Record<string, unknown>;
                                          store.updateSelectedNodeConfig(parsed);
                                          updateLiveSelectedNode({
                                            ...store.selectedNode!.data,
                                            config: parsed,
                                          });
                                          message.success("节点配置已更新");
                                        } catch {
                                          message.error("配置 JSON 非法");
                                        }
                                      }}
                                    >
                                      应用 JSON
                                    </Button>
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        ) : null}
                        {debugDrawerVisible.value ? (
                          <div class={styles.playgroundPanelDock} role="dialog" aria-label="调试对话">
                            <div class={styles.playgroundRoot}>
                              <header class={styles.playgroundHeader}>
                                <div class={styles.playgroundHeaderLead}>
                                  <span class={styles.playgroundHeaderIcon} aria-hidden="true">
                                    <svg viewBox="0 0 24 24" class={styles.playgroundHeaderChatSvg}>
                                      <path
                                        fill="currentColor"
                                        d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4l-4 3v-3H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
                                      />
                                    </svg>
                                  </span>
                                  <span class={styles.playgroundHeaderTitle}>调试</span>
                                </div>
                                <div class={styles.playgroundHeaderActions}>
                                  <button
                                    type="button"
                                    class={styles.playgroundHeaderClose}
                                    aria-label="关闭"
                                    onClick={() => {
                                      debugDrawerVisible.value = false;
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              </header>

                              <div ref={playgroundScrollRef} class={styles.playgroundScroll}>
                                {playgroundMessages.value.map((msg) => {
                                  if (msg.role === "user") {
                                    return (
                                      <div key={msg.id} class={styles.playgroundRowUser}>
                                        <div class={styles.playgroundBubbleUser}>
                                          {msg.text.trim() !== "" ? <div>{msg.text}</div> : null}
                                          {msg.attachments != null && msg.attachments.length > 0 ? (
                                            <div class={styles.playgroundUserAttachmentGrid}>
                                              {msg.attachments.map((item) => (
                                                <div key={item.id} class={styles.playgroundUserAttachment}>
                                                  <img src={item.previewUrl} alt={item.name} class={styles.playgroundUserAttachmentImage} />
                                                  <span class={styles.playgroundUserAttachmentName}>{item.name}</span>
                                                </div>
                                              ))}
                                            </div>
                                          ) : null}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div key={msg.id} class={styles.playgroundRowAssistant}>
                                      <div class={styles.playgroundAvatar} aria-hidden="true">
                                        <svg viewBox="0 0 24 24" class={styles.playgroundAvatarSvg}>
                                          <circle cx="12" cy="12" r="11" fill="#1578ff" />
                                          <path
                                            fill="#ffffff"
                                            d="M8 9.5c0-.8.7-1.5 1.5-1.5h5c.8 0 1.5.7 1.5 1.5v4c0 .8-.7 1.5-1.5 1.5h-1.2l-.8 1.2-.8-1.2H9.5A1.5 1.5 0 0 1 8 13.5v-4z"
                                          />
                                          <circle cx="10.2" cy="11.3" r="0.85" fill="#1578ff" />
                                          <circle cx="13.8" cy="11.3" r="0.85" fill="#1578ff" />
                                        </svg>
                                      </div>
                                      <div class={styles.playgroundAssistantCol}>
                                        <div class={styles.playgroundBubbleAssistant}>
                                          {msg.issues != null && msg.issues.length > 0 ? (
                                            <ul class={styles.playgroundIssueList}>
                                              {msg.issues.map((issue: FlowIssueItem, issueIndex: number) => {
                                                const nid = issue.nodeId?.trim();
                                                return (
                                                  <li key={`${msg.id}-iss-${issueIndex}`} class={styles.playgroundIssueRow}>
                                                    <span
                                                      class={[
                                                        styles.playgroundIssueBadge,
                                                        issue.level === "error"
                                                          ? styles.playgroundIssueBadgeErr
                                                          : styles.playgroundIssueBadgeWarn,
                                                      ].join(" ")}
                                                    >
                                                      {issue.level === "error" ? "错误" : "警告"}
                                                    </span>
                                                    <span class={styles.playgroundIssueText}>{issue.message}</span>
                                                    {nid != null && nid !== "" ? (
                                                      <Button
                                                        type="link"
                                                        size="small"
                                                        class={styles.playgroundIssueLocate}
                                                        onClick={() => {
                                                          focusIssueNode(nid);
                                                        }}
                                                      >
                                                        定位
                                                      </Button>
                                                    ) : null}
                                                  </li>
                                                );
                                              })}
                                            </ul>
                                          ) : null}

                                          {msg.finalOutputText != null && msg.finalOutputText.trim() !== "" ? (
                                            <WorkflowReplyContent
                                              text={msg.finalOutputText}
                                              proseClass={styles.workflowReplyProse}
                                              imageClass={styles.playgroundReplyImage}
                                              onContentLoad={schedulePlaygroundScrollToBottom}
                                            />
                                          ) : (
                                            <WorkflowReplyContent
                                              text={msg.text}
                                              proseClass={styles.workflowReplyProse}
                                              imageClass={styles.playgroundReplyImage}
                                              onContentLoad={schedulePlaygroundScrollToBottom}
                                            />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                                {playgroundRequesting.value ? (
                                  <div class={styles.playgroundRowAssistant}>
                                    <div class={styles.playgroundAvatarMuted} aria-hidden="true">
                                      <svg viewBox="0 0 24 24" class={styles.playgroundAvatarSvg}>
                                        <circle cx="12" cy="12" r="11" fill="#94b8ff" />
                                        <path
                                          fill="#ffffff"
                                          d="M8 9.5c0-.8.7-1.5 1.5-1.5h5c.8 0 1.5.7 1.5 1.5v4c0 .8-.7 1.5-1.5 1.5h-1.2l-.8 1.2-.8-1.2H9.5A1.5 1.5 0 0 1 8 13.5v-4z"
                                        />
                                      </svg>
                                    </div>
                                    <div class={[styles.playgroundAssistantCol, styles.playgroundAssistantColThinking].join(" ")}>
                                      <div class={[styles.playgroundBubbleAssistant, styles.playgroundBubbleAssistantThinking].join(" ")}>
                                        <div class={styles.playgroundWorkflowThinkingBar} aria-live="polite">
                                          <span class={styles.playgroundWorkflowThinkingSpinner} aria-hidden="true">
                                            <Spin size="small" />
                                          </span>
                                          <span class={styles.playgroundWorkflowThinkingLabel}>工作流</span>
                                          <span class={styles.playgroundWorkflowThinkingChevron} aria-hidden="true">
                                            ›
                                          </span>
                                        </div>
                                        <div class={styles.workflowLoadingDots} aria-hidden="true">
                                          <span />
                                          <span />
                                          <span />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : null}
                              </div>

                              <div class={styles.playgroundComposer}>
                                {playgroundRequesting.value ? (
                                  <div class={styles.playgroundStopBar}>
                                    <button
                                      type="button"
                                      class={styles.playgroundStopResponseBtn}
                                      aria-label="停止响应"
                                      onClick={(event: MouseEvent) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        abortPlaygroundDebug();
                                      }}
                                    >
                                      <span class={styles.playgroundStopResponseIcon} aria-hidden="true">
                                        <svg viewBox="0 0 18 18" class={styles.playgroundStopResponseSvg}>
                                          <circle cx="9" cy="9" r="7.25" fill="none" stroke="currentColor" stroke-width="1.25" />
                                          <rect x="6" y="6" width="6" height="6" rx="0.75" fill="currentColor" />
                                        </svg>
                                      </span>
                                      <span class={styles.playgroundStopResponseLabel}>停止响应</span>
                                    </button>
                                  </div>
                                ) : null}
                                <div class={styles.playgroundInputBlock}>
                                  <button
                                    type="button"
                                    class={styles.playgroundClearChatBtn}
                                    disabled={playgroundRequesting.value}
                                    aria-label="清除对话"
                                    title="清除对话"
                                    onClick={() => {
                                      resetPlaygroundSession();
                                    }}
                                  >
                                    <span class={styles.playgroundClearChatIcon} aria-hidden="true">
                                      <svg viewBox="0 0 14 14" class={styles.playgroundClearChatIconSvg} aria-hidden="true">
                                        <path
                                          fill="none"
                                          stroke="#444855"
                                          stroke-width="1.35"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                          d="M2.85 4.45h8.3M5.1 4.45V2.95h3.8v1.5M4 4.45l.55 7.9h4.9l.55-7.9z"
                                        />
                                      </svg>
                                    </span>
                                    <span class={styles.playgroundClearChatLabel}>清除对话</span>
                                  </button>
                                  <div class={styles.playgroundInputShell}>
                                    <input
                                      ref={playgroundFileInputRef}
                                      class={styles.playgroundFileInput}
                                      type="file"
                                      accept="image/*"
                                      multiple={true}
                                      disabled={playgroundRequesting.value}
                                      onChange={handlePlaygroundFileChange}
                                    />
                                    {playgroundPendingAttachments.value.length > 0 ? (
                                      <div class={styles.playgroundPendingAttachmentList}>
                                        {playgroundPendingAttachments.value.map((item) => (
                                          <div key={item.id} class={styles.playgroundPendingAttachment}>
                                            <img src={item.previewUrl} alt={item.name} class={styles.playgroundPendingAttachmentImage} />
                                            <span class={styles.playgroundPendingAttachmentMeta}>
                                              <span class={styles.playgroundPendingAttachmentName}>{item.name}</span>
                                              <span class={styles.playgroundPendingAttachmentSize}>
                                                {formatPlaygroundFileSize(item.size)}
                                              </span>
                                            </span>
                                            <button
                                              type="button"
                                              class={styles.playgroundPendingAttachmentRemove}
                                              disabled={playgroundRequesting.value}
                                              aria-label={`移除 ${item.name}`}
                                              onClick={() => removePlaygroundAttachment(item.id)}
                                            >
                                              ×
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : null}
                                    <AntTextarea
                                      class={styles.playgroundInput}
                                      bordered={false}
                                      value={playgroundInput.value}
                                      placeholder="输入您的问题"
                                      autoSize={{ minRows: 2, maxRows: 6 }}
                                      disabled={playgroundRequesting.value}
                                      onUpdate:value={(v: string) => {
                                        playgroundInput.value = String(v ?? "");
                                      }}
                                      onKeydown={(e: KeyboardEvent) => {
                                        if (playgroundRequesting.value) {
                                          if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                          }
                                          return;
                                        }
                                        if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault();
                                          void sendPlaygroundMessage();
                                        }
                                      }}
                                    />
                                    <div class={styles.playgroundInputActions}>
                                      <button
                                        type="button"
                                        class={styles.playgroundAttachBtn}
                                        disabled={playgroundRequesting.value}
                                        aria-label="上传图片"
                                        title="上传图片"
                                        onClick={() => {
                                          playgroundFileInputRef.value?.click();
                                        }}
                                      >
                                        <svg viewBox="0 0 24 24" class={styles.playgroundAttachSvg} aria-hidden="true">
                                          <path
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="1.9"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M19.2 12.4 12 19.6a5.1 5.1 0 0 1-7.2-7.2l8.4-8.4a3.5 3.5 0 0 1 5 5l-8.1 8.1a1.9 1.9 0 1 1-2.7-2.7l7.3-7.3"
                                          />
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        class={[
                                          styles.playgroundVoiceBtn,
                                          playgroundSpeechStatus.value === "recording" || playgroundSpeechStatus.value === "transcribing"
                                            ? styles.playgroundVoiceBtnBusy
                                            : "",
                                        ].join(" ")}
                                        disabled={
                                          playgroundRequesting.value ||
                                          playgroundSpeechStatus.value === "starting" ||
                                          playgroundSpeechStatus.value === "transcribing"
                                        }
                                        aria-label={
                                          playgroundSpeechStatus.value === "transcribing"
                                            ? "正在识别"
                                            : playgroundSpeechStatus.value === "starting"
                                              ? "准备录音"
                                              : playgroundSpeechStatus.value === "recording"
                                                ? "结束录音"
                                                : "开始录音"
                                        }
                                        title={
                                          playgroundSpeechStatus.value === "transcribing"
                                            ? "正在识别…"
                                            : playgroundSpeechStatus.value === "starting"
                                              ? "准备录音…"
                                              : playgroundSpeechStatus.value === "recording"
                                                ? "结束录音"
                                                : "开始录音（语音转文字）"
                                        }
                                        onClick={() => void togglePlaygroundSpeechInput()}
                                      >
                                        {playgroundSpeechStatus.value === "starting" || playgroundSpeechStatus.value === "transcribing" ? (
                                          <LoadingOutlined class={styles.playgroundVoiceAntIcon} spin={true} aria-hidden="true" />
                                        ) : playgroundSpeechStatus.value === "recording" ? (
                                          <AudioOutlined class={styles.playgroundVoiceAntIcon} aria-hidden="true" />
                                        ) : (
                                          <AudioMutedOutlined class={styles.playgroundVoiceAntIcon} aria-hidden="true" />
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        class={[
                                          styles.playgroundSendBtn,
                                          playgroundRequesting.value ? styles.playgroundSendBtnBusy : "",
                                        ].join(" ")}
                                        disabled={
                                          playgroundRequesting.value ||
                                          (playgroundInput.value.trim() === "" && playgroundPendingAttachments.value.length === 0)
                                        }
                                        aria-label={playgroundRequesting.value ? "发送中" : "发送"}
                                        onClick={() => void sendPlaygroundMessage()}
                                      >
                                        {playgroundRequesting.value ? (
                                          <span class={styles.playgroundSendLoading} aria-hidden="true" />
                                        ) : (
                                          <svg viewBox="0 0 24 24" class={styles.playgroundSendSvg} aria-hidden="true">
                                            <path
                                              fill="none"
                                              stroke="#ffffff"
                                              stroke-width="2"
                                              stroke-linecap="round"
                                              stroke-linejoin="round"
                                              d="M12 21V6.95M5.35 10.45L12 3.55L18.65 10.45"
                                            />
                                          </svg>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </Spin>
                  <AntModal
                    v-model:visible={llmParamsModalVisible.value}
                    title="模型参数"
                    width={560}
                    centered={true}
                    wrapClassName={styles.llmParamsModalWrap}
                    getContainer={() => document.body}
                    footer={null}
                    destroyOnClose={false}
                    maskClosable={true}
                    onCancel={() => {
                      llmParamsModalVisible.value = false;
                    }}
                  >
                    <p class={styles.llmParamsModalHint}>
                      温度、Top P、最大输出长度和思考模式等与语言模型节点一致；修改后立即写入当前选中节点。
                    </p>
                    <AntdConfigProvider theme={LLM_PANEL_INPUT_NUMBER_THEME}>
                      <div class={styles.llmParamsBlock}>
                        {renderLlmThinkingParamRow()}
                        {LLM_INFERENCE_PARAM_DEFS.map((def) => renderLlmInferenceParamRow(def))}
                      </div>
                    </AntdConfigProvider>
                    <div class={styles.llmParamsModalFooter}>
                      <Button
                        type="primary"
                        onClick={() => {
                          llmParamsModalVisible.value = false;
                        }}
                      >
                        完成
                      </Button>
                    </div>
                  </AntModal>
                  <AntModal
                    v-model:visible={knowledgePickModalVisible.value}
                    title="添加知识库"
                    width={720}
                    centered={true}
                    wrapClassName={styles.llmParamsModalWrap}
                    getContainer={() => document.body}
                    maskClosable={true}
                    okText="添加"
                    cancelText="取消"
                    onOk={() => confirmKnowledgePick()}
                    onCancel={() => {
                      knowledgePickModalVisible.value = false;
                    }}
                  >
                    <p class={styles.llmParamsModalHint}>
                      勾选需添加的知识文档（可多页勾选）；已加入当前节点的文档显示为已添加且不可勾选。
                    </p>
                    <div class={styles.knowledgePickModalToolbar}>
                      <AntInput
                        class={styles.knowledgePickModalSearch}
                        allowClear
                        placeholder="按文档名称搜索"
                        value={knowledgePickKeyword.value}
                        onUpdate:value={(v: string) => {
                          knowledgePickKeyword.value = String(v ?? "");
                        }}
                        onPressEnter={() => void loadKnowledgePickPage(1)}
                      />
                      <Button type="primary" size="small" onClick={() => void loadKnowledgePickPage(1)}>
                        搜索
                      </Button>
                    </div>
                    <Spin spinning={knowledgePickLoading.value}>
                      <div class={styles.knowledgePickModalList}>
                        {knowledgePickRecords.value.length === 0 ? (
                          <div class={styles.knowledgePickModalEmpty}>暂无数据</div>
                        ) : (
                          <>
                            <div class={styles.knowledgePickModalHeaderRow}>
                              <span class={styles.knowledgePickModalHeaderSpacer} aria-hidden />
                              <span class={styles.knowledgePickModalHeaderCell}>文档名称</span>
                              <span class={styles.knowledgePickModalHeaderCell}>知识分类</span>
                            </div>
                            {knowledgePickRecords.value.map((doc) => {
                              const already = existingKnowledgeDocIdsInNode.value.has(doc.id);
                              const picked = knowledgePickCheckedIds.value.includes(doc.id);
                              return (
                                <div
                                  key={doc.id}
                                  class={[styles.knowledgePickModalRow, already ? styles.knowledgePickModalRowDisabled : ""]}
                                >
                                  <Checkbox
                                    checked={already || picked}
                                    disabled={already}
                                    onChange={(e: { target: { checked: boolean } }) => {
                                      toggleKnowledgePickDoc(doc, e.target.checked);
                                    }}
                                  />
                                  <span class={styles.knowledgePickModalRowName}>{doc.name}</span>
                                  <span class={styles.knowledgePickModalRowMeta}>{doc.typeName ?? "—"}</span>
                                </div>
                              );
                            })}
                          </>
                        )}
                      </div>
                    </Spin>
                    <div class={styles.knowledgePickModalPagination}>
                      <Pagination
                        current={knowledgePickPage.value}
                        pageSize={knowledgePickPageSize.value}
                        total={knowledgePickTotal.value}
                        showSizeChanger
                        pageSizeOptions={["10", "20", "50", "100"]}
                        showTotal={(total: number) => `共 ${total} 条`}
                        disabled={knowledgePickLoading.value}
                        onChange={(page: number, pageSize: number) => {
                          handleKnowledgePickPagination(page, pageSize);
                        }}
                      />
                    </div>
                  </AntModal>
                  <AntModal
                    v-model:visible={knowledgeBatchModalVisible.value}
                    title="批量召回设置"
                    width={480}
                    centered={true}
                    wrapClassName={styles.llmParamsModalWrap}
                    getContainer={() => document.body}
                    maskClosable={true}
                    okText="应用到全部"
                    cancelText="取消"
                    onOk={() => confirmKnowledgeBatch()}
                    onCancel={() => {
                      knowledgeBatchModalVisible.value = false;
                    }}
                  >
                    <p class={styles.llmParamsModalHint}>将以下 TopK 与分数阈值应用到当前已选的全部知识库。</p>
                    <div class={styles.knowledgeBatchModalFields}>
                      <div class={styles.knowledgeBatchSliderField}>
                        <div class={styles.knowledgeBatchSliderHead}>
                          <label class={styles.subLabel}>TopK</label>
                          <span class={styles.knowledgeBatchSliderValueHint}>{knowledgeBatchTopK.value}</span>
                        </div>
                        <div class={styles.knowledgeBatchSliderTrack}>
                          <ThemedSlider
                            min={1}
                            max={KB_TOPK_MAX}
                            step={1}
                            value={knowledgeBatchTopK.value}
                            onUpdate:value={(v: number) => {
                              knowledgeBatchTopK.value = clampKbTopK(v);
                            }}
                          />
                        </div>
                      </div>
                      <div class={styles.knowledgeBatchSliderField}>
                        <div class={styles.knowledgeBatchSliderHead}>
                          <label class={styles.subLabel}>分数阈值</label>
                          <span class={styles.knowledgeBatchSliderValueHint}>{clampKbScore(knowledgeBatchScore.value).toFixed(1)}</span>
                        </div>
                        <div class={styles.knowledgeBatchSliderTrack}>
                          <ThemedSlider
                            min={0}
                            max={1}
                            step={0.1}
                            value={knowledgeBatchScore.value}
                            onUpdate:value={(v: number) => {
                              knowledgeBatchScore.value = clampKbScore(v);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </AntModal>
                </div>
                <Teleport to="body">
                  {quickAddOpen.value ? (
                    <>
                      <div
                        class={styles.flowQuickAddBackdrop}
                        role="presentation"
                        onPointerdown={() => {
                          closeQuickAddPalette();
                        }}
                      />
                      <div
                        class={styles.flowQuickAddPanel}
                        style={{
                          left: `${quickAddPos.value.x}px`,
                          top: `${quickAddPos.value.y}px`,
                        }}
                        role="dialog"
                        aria-label="快捷添加节点"
                        onPointerdown={(e: PointerEvent) => {
                          e.stopPropagation();
                        }}
                        onMousedown={(e: MouseEvent) => {
                          e.stopPropagation();
                        }}
                      >
                        <div class={styles.flowQuickAddSearch}>
                          <Input
                            class={styles.flowQuickAddSearchInput}
                            value={quickAddKeyword.value}
                            placeholder="搜索"
                            showCount={false}
                            allowClear={false}
                            prefix={<SearchOutlined class={styles.paletteSearchIcon} />}
                            onUpdate:value={(value: unknown) => {
                              quickAddKeyword.value = String(value ?? "");
                            }}
                          />
                        </div>
                        <div class={styles.flowQuickAddScroll}>
                          {filteredQuickAddGroups.value.map((group) => (
                            <div key={group.groupName} class={styles.flowQuickAddGroup}>
                              <div class={styles.flowQuickAddGroupTitle}>{group.groupName}</div>
                              <div class={styles.flowQuickAddGrid}>
                                {group.items.map((component: FlowComponentCatalogItem) => {
                                  const iconSrc = paletteIconSrc(component.componentKey);
                                  return (
                                    <button
                                      key={component.componentKey}
                                      type="button"
                                      class={styles.flowQuickAddCell}
                                      onClick={() => pickQuickAddComponent(component)}
                                    >
                                      {iconSrc ? (
                                        <span class={styles.flowQuickAddIconWrap}>
                                          <img class={styles.flowQuickAddIcon} src={iconSrc} alt="" aria-hidden />
                                        </span>
                                      ) : (
                                        <span
                                          class={styles.flowQuickAddIconChip}
                                          style={{
                                            background: `hsl(${paletteHue(component.componentKey)} 62% 52%)`,
                                          }}
                                        >
                                          <span>{component.componentName.slice(0, 1)}</span>
                                        </span>
                                      )}
                                      <span class={styles.flowQuickAddLabel}>{component.componentName}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}
                </Teleport>
                <Teleport to="body">
                  <div class={styles.canvasBottomBarPortal} role="presentation">
                    <div class={styles.canvasBottomBar} role="toolbar" aria-label="画布视图">
                      <button
                        type="button"
                        class={styles.cbIconBtn}
                        aria-label="缩小"
                        onClick={() => {
                          graph?.zoom(-0.1);
                          refreshZoomPct();
                        }}
                      >
                        −
                      </button>
                      <span class={styles.cbZoomPct}>{zoomPercent.value}%</span>
                      <button
                        type="button"
                        class={styles.cbIconBtn}
                        aria-label="放大"
                        onClick={() => {
                          graph?.zoom(0.1);
                          refreshZoomPct();
                        }}
                      >
                        +
                      </button>
                      <span class={styles.cbDivider} />
                      <button
                        type="button"
                        class={styles.cbToolBtn}
                        aria-label="适配画布"
                        onClick={() => {
                          graph?.zoomToFit({ padding: 48, maxScale: 3 });
                          refreshZoomPct();
                        }}
                      >
                        <svg class={styles.cbSvg} viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M4 8V4h4M16 4h4v4M4 16v4h4M20 16v4h-4" fill="none" stroke="currentColor" stroke-width="1.6" />
                          <circle cx="12" cy="12" r="2" fill="currentColor" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        class={[styles.cbToolBtn, handPanMode.value ? styles.cbToolBtnActive : ""]}
                        aria-label={handPanMode.value ? "退出抓手平移" : "抓手平移"}
                        aria-pressed={handPanMode.value}
                        onClick={toggleHandPanMode}
                      >
                        <svg class={styles.cbSvg} viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M18 11V8a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3M14 10V7a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v7M10 9V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v12a8 8 0 0 0 16 0v-5a2 2 0 0 0-2-2h-1"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.65"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </button>
                      <span class={styles.cbDivider} />
                      <button
                        type="button"
                        class={[styles.cbToolBtn, undoDisabled.value ? styles.cbToolBtnDisabled : ""]}
                        disabled={undoDisabled.value}
                        aria-label="撤销"
                        onClick={() => {
                          graph?.undo();
                          refreshUndoRedo();
                        }}
                      >
                        <svg class={styles.cbSvg} viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M9 14 4 9l5-5M4 9h12a4 4 0 0 1 4 4v1"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.7"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        class={[styles.cbToolBtn, redoDisabled.value ? styles.cbToolBtnDisabled : ""]}
                        disabled={redoDisabled.value}
                        aria-label="重做"
                        onClick={() => {
                          graph?.redo();
                          refreshUndoRedo();
                        }}
                      >
                        <svg class={styles.cbSvg} viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="m15 14 5-5-5-5M20 9H8a4 4 0 0 0-4 4v1"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.7"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Teleport>
              </div>
            </div>
          ),
        }}
      />
    );
  },
});
