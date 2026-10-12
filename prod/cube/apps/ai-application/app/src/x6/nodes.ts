import { Graph, type Node } from "@antv/x6";

import type { FlowComponentCatalogItem } from "@ghcloud/cube-ai-application-service";

import {
  buildFlowPortDefinitions,
  extractPromptTemplatePlaceholders,
  ifElseDynamicInputPortNames,
  ifElseResolvedEnableFlags,
} from "./flow-ports";
import {
  FLOW_AGENT_NODE_MIN_HEIGHT,
  FLOW_AGENT_NODE_WIDTH,
  FLOW_CHAT_INPUT_NODE_HEIGHT,
  FLOW_CHAT_INPUT_NODE_WIDTH,
  FLOW_LOOP_NODE_HEIGHT,
  FLOW_NOTIFY_NODE_DEFAULT_HEIGHT,
  FLOW_KNOWLEDGE_RETRIEVAL_NODE_HEIGHT,
  FLOW_KNOWLEDGE_RETRIEVAL_NODE_WIDTH,
  FLOW_LLM_NODE_HEIGHT,
  FLOW_LLM_NODE_WIDTH,
  FLOW_NODE_HEIGHT,
  FLOW_NODE_WIDTH,
  FLOW_PROMPT_TEMPLATE_NODE_MIN_HEIGHT,
  FLOW_PROMPT_TEMPLATE_NODE_WIDTH,
  FLOW_SMART_ROUTER_NODE_MIN_HEIGHT,
  FLOW_SMART_ROUTER_NODE_WIDTH,
  flowNodeSizeForComponentKey,
  type FlowNodeConfig,
} from "@/types/flow";
import { FLOW_EDITOR_MODEL_ICON_FALLBACK, languageModelRowIconHref, LLM_NODE_DEFAULT_CANVAS_ICON } from "@/util/model-canvas-icon";

const CHAT_INPUT_ICON_SRC = "/resource/v1/ai-application/chatinput.png";
const CHAT_OUTPUT_ICON_SRC = "/resource/v1/ai-application/chatoutput.png";
const PROMPT_TEMPLATE_ICON_SRC = "/resource/v1/ai-application/promptTemplate.png";
const SMART_ROUTER_ICON_SRC = "/resource/v1/ai-application/smartRoute.png";
const AGENT_ICON_SRC = "/resource/v1/ai-application/agent.png";
const KNOWLEDGE_RETRIEVAL_ICON_SRC = "/resource/v1/ai-application/kbSearch.png";
const IF_ELSE_ICON_SRC = "/resource/v1/ai-application/ifElse.png";
const LOOP_ICON_SRC = "/resource/v1/ai-application/loop.png";
const NOTIFY_ICON_SRC = "/resource/v1/ai-application/notify.png";

/** 通知节点：上下文键 / 输入数据 / 追加 区块高度（须与 buildNotifyNodeAttrs 同步） */
const NOTIFY_CONTENT_TOP = 52;
const NOTIFY_CTX_BLOCK = 34;
const NOTIFY_INPUT_BLOCK = 34;
const NOTIFY_APPEND_BLOCK = 26;
const NOTIFY_BOTTOM_PAD = 14;

/** 条件分支画布：标题下按开关显示「标签 + 灰框预览」；IF/ELSE 固定在入参区下方的右侧出口带（不与左侧行交错） */
const IF_ELSE_ROW_TOP0 = 46;
const IF_ELSE_ROW_H = 28;
const IF_ELSE_ROW_GAP = 8;
const IF_ELSE_ROW_STEP = IF_ELSE_ROW_H + IF_ELSE_ROW_GAP;
/** 标签列与灰框起点留出间距，避免「匹配文本」等与输入条重叠 */
const IF_ELSE_ROW_STRIP_X = 72;
const IF_ELSE_ROW_STRIP_W = FLOW_CHAT_INPUT_NODE_WIDTH - IF_ELSE_ROW_STRIP_X - 12;
/** 入参最后一行底边与 IF/ELSE 出口带之间的间距 */
const IF_ELSE_GAP_BEFORE_OUTPUTS = 10;
/** IF、ELSE 两个出口在竖直方向间距（圆心） */
const IF_ELSE_OUTPUT_PAIR_STEP = 26;
/** 出口带内首个桩相对带顶偏移（大致居中上半段） */
const IF_ELSE_OUTPUT_FIRST_OFFSET = 14;
/** 节点底留白 */
const IF_ELSE_NODE_BOTTOM_PAD = 12;

const IF_ELSE_OPERATOR_CANVAS_LABEL: Record<string, string> = {
  equals: "等于",
  not_equals: "不等于",
  contains: "包含",
  not_contains: "不包含",
  starts_with: "开头为",
  ends_with: "结尾为",
  regex: "正则匹配",
  gt: "大于",
  lt: "小于",
  gte: "大于等于",
  lte: "小于等于",
};

function ifElseInputPortCenterY(index: number): number {
  return IF_ELSE_ROW_TOP0 + IF_ELSE_ROW_H / 2 + index * IF_ELSE_ROW_STEP;
}

/** 入参区底边 Y（像素）；无入参时取首行起始位置，使 IF/ELSE 仍压在标题区下方 */
function ifElseInputBlockBottomPx(inputRowCount: number): number {
  if (inputRowCount <= 0) {
    return IF_ELSE_ROW_TOP0;
  }
  return IF_ELSE_ROW_TOP0 + (inputRowCount - 1) * IF_ELSE_ROW_STEP + IF_ELSE_ROW_H;
}

/** IF=0、ELSE=1；圆心 Y 放在入参区之下的右侧带内 */
function ifElseOutputPortCenterY(outIndex: 0 | 1, inputRowCount: number): number {
  const bottom = ifElseInputBlockBottomPx(inputRowCount);
  const bandStart = bottom + IF_ELSE_GAP_BEFORE_OUTPUTS;
  return bandStart + IF_ELSE_OUTPUT_FIRST_OFFSET + outIndex * IF_ELSE_OUTPUT_PAIR_STEP;
}

function measureIfElseNodeHeight(inputRowCount: number): number {
  const elseCy = ifElseOutputPortCenterY(1, inputRowCount);
  return Math.ceil(elseCy + IF_ELSE_NODE_BOTTOM_PAD);
}

function ifElseOperatorCanvasLabel(op: string): string {
  const t = op.trim();
  return IF_ELSE_OPERATOR_CANVAS_LABEL[t] ?? t;
}

function buildIfElseRowStripAttrs(index: number): {
  refX: number;
  refY: number;
  width: number;
  height: number;
  rx: number;
  ry: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
} {
  return {
    refX: IF_ELSE_ROW_STRIP_X,
    refY: IF_ELSE_ROW_TOP0 + index * IF_ELSE_ROW_STEP,
    width: IF_ELSE_ROW_STRIP_W,
    height: IF_ELSE_ROW_H,
    rx: 6,
    ry: 6,
    fill: "#f5f7fb",
    stroke: "#e2e8f0",
    strokeWidth: 1,
  };
}

function buildIfElseRowLabelAttrs(index: number, text: string): Record<string, unknown> {
  const cy = ifElseInputPortCenterY(index);
  return {
    refX: 14,
    refY: cy,
    transform: "translate(0, -2)",
    fontSize: 10,
    fontWeight: 500,
    fill: "#86909c",
    textAnchor: "start",
    dominantBaseline: "middle",
    fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
    text,
  };
}

function buildIfElseRowValueAttrs(index: number, text: string): Record<string, unknown> {
  const cy = ifElseInputPortCenterY(index);
  return {
    refX: IF_ELSE_ROW_STRIP_X + 8,
    refY: cy,
    transform: "translate(0, -2)",
    fontSize: 11,
    fontWeight: 400,
    fill: "#4e5969",
    textAnchor: "start",
    dominantBaseline: "middle",
    fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
    text,
  };
}

function buildIfElseCanvasPreviews(config: FlowNodeConfig): { labels: string[]; values: string[] } {
  const c = config.config;
  const rawIn = typeof c.input_text === "string" ? c.input_text.trim() : "";
  const opRaw = typeof c.operator === "string" ? c.operator.trim() : "";
  const op = opRaw !== "" ? opRaw : "equals";
  const rawMatch = typeof c.match_text === "string" ? c.match_text.trim() : "";
  return {
    labels: ["文本输入", "运算符", "匹配文本"],
    values: [
      rawIn === "" ? "侧栏填写" : truncateCanvasText(rawIn.replace(/\s+/g, " "), 26),
      ifElseOperatorCanvasLabel(op),
      rawMatch === "" ? "侧栏填写" : truncateCanvasText(rawMatch.replace(/\s+/g, " "), 26),
    ],
  };
}

/** 知识检索节点：标题区底边与 LLM 模型条对齐；下方按需堆叠浅灰行（条数与 nodes 内度量一致） */
const FLOW_KR_CONTENT_TOP = 44;
const FLOW_KR_ROW_H = 30;
const FLOW_KR_ROW_GAP = 6;
const FLOW_KR_ROW_STRIDE = FLOW_KR_ROW_H + FLOW_KR_ROW_GAP;
const FLOW_KR_BOTTOM_PAD = 14;
const FLOW_KR_MAX_ROWS = 20;
const FLOW_KR_ROW_NAME_FONT_SIZE = 13;
/** 行条左右各 12px，图标区至文字起点 42px，右侧再留 12px 留白 */
const FLOW_KR_ROW_NAME_MAX_WIDTH_PX = FLOW_KNOWLEDGE_RETRIEVAL_NODE_WIDTH - 42 - 24;

/** 画布智能体：与 LLM 节点同结构的模型条；指令仅在侧栏编辑，不在画布展示 */
const FLOW_AGENT_MODEL_TOP = 44;
const FLOW_AGENT_MODEL_H = 36;
const FLOW_AGENT_HINT_TOP = 86;

/** 智能路由：与语言模型同宽的模型条 + 动态路由行 */
const FLOW_SR_MODEL_TOP = 44;
const FLOW_SR_MODEL_H = 36;
const FLOW_SR_ROUTES_GAP = 8;
const FLOW_SR_ROUTES_START = FLOW_SR_MODEL_TOP + FLOW_SR_MODEL_H + FLOW_SR_ROUTES_GAP;
const FLOW_SR_ROUTE_ROW_H = 56;
const FLOW_SR_ROUTE_STRIP_INSET = 12;
const FLOW_SR_BOTTOM_PAD = 16;
const FLOW_SR_MAX_ROUTE_ROWS = 20;
const FLOW_SR_ROUTE_NAME_MAX = 20;

/** 提示词模板画布：模板块高度固定 100px，变量行在节点内排布，端口与行中心对齐 */
const FLOW_PT_TEMPLATE_TOP = 44;
const FLOW_PT_TEMPLATE_H = 100;
const FLOW_PT_VARS_GAP = 10;
const FLOW_PT_MAX_PREVIEW_LINES = 5;
const FLOW_PT_MAX_VAR_LABEL_SLOTS = 20;
const FLOW_PT_VARS_START = FLOW_PT_TEMPLATE_TOP + FLOW_PT_TEMPLATE_H + FLOW_PT_VARS_GAP;
const FLOW_PT_VAR_INPUT_H = 24;
const FLOW_PT_VAR_LABEL_MAX_CHARS = 16;
/** 变量行浅底条与卡片左右内边距 */
const FLOW_PT_VAR_STRIP_INSET = 14;
/** 行与行之间：上下各一半，条带之间留出可视间距 */
const FLOW_PT_VAR_STRIP_PAD_Y = 5;
/** 条带内左右留白，变量名与输入框左对齐 */
const FLOW_PT_VAR_STRIP_INNER_PAD_X = 10;
/** 相对条带顶：变量名文字中线 */
const FLOW_PT_VAR_LABEL_DY = 13;
/** 相对条带顶：下方伪输入框顶（与标签拉开间距） */
const FLOW_PT_VAR_INPUT_TOP_DY = 30;
/** 变量条带内：输入框底与条带底之间的留白（避免贴底） */
const FLOW_PT_VAR_STRIP_BOTTOM_INNER = 12;
/** 变量区单行高度：条带内容高 + 行间留白（与 INPUT_TOP/H/BOTTOM_INNER 一致） */
const FLOW_PT_VAR_ROW_H = FLOW_PT_VAR_INPUT_TOP_DY + FLOW_PT_VAR_INPUT_H + FLOW_PT_VAR_STRIP_BOTTOM_INNER + FLOW_PT_VAR_STRIP_PAD_Y * 2;
const FLOW_PT_BOTTOM_PAD = 20;
/** 模板灰框内首行文字距框顶的留白（避免贴顶） */
const FLOW_PT_TEMPLATE_TEXT_PAD_TOP = 14;
const FLOW_PT_TEMPLATE_LINE_START_Y = FLOW_PT_TEMPLATE_TOP + FLOW_PT_TEMPLATE_TEXT_PAD_TOP;
const FLOW_PT_TEMPLATE_LINE_STEP = 18;
/** 与 templatePreview 文本一致，用于按像素宽度换行 */
const FLOW_PT_PREVIEW_FONT_SIZE = 11;
/** 灰底区内可用宽度；略收紧避免字号/字体度量与估算误差导致溢出 */
const FLOW_PT_PREVIEW_INNER_WIDTH_PX = FLOW_PROMPT_TEMPLATE_NODE_WIDTH - 40;

function estimatePromptTemplateCharWidthPx(char: string, fontSize: number): number {
  const cp = char.codePointAt(0) ?? 0;
  if (cp <= 0x007f) {
    return fontSize * 0.52;
  }
  if (
    (cp >= 0x1100 && cp <= 0x11ff) ||
    (cp >= 0x2e80 && cp <= 0x9fff) ||
    (cp >= 0xff00 && cp <= 0xffef) ||
    (cp >= 0x3040 && cp <= 0x30ff)
  ) {
    return fontSize;
  }
  return fontSize * 0.58;
}

function estimatePromptTemplateTextWidthPx(text: string, fontSize: number): number {
  let w = 0;
  for (let i = 0; i < text.length; ) {
    const cp = text.codePointAt(i) ?? 0;
    const step = cp >= 0x10000 ? 2 : 1;
    w += estimatePromptTemplateCharWidthPx(text.slice(i, i + step), fontSize);
    i += step;
  }
  return w;
}

/** 在不超过 maxWidthPx 的前提下，尽可能多取 rest 的前缀作为一行（支持中英文混排） */
function takeGreedyLinePrefix(rest: string, maxWidthPx: number, fontSize: number): string {
  if (rest === "") {
    return "";
  }
  let acc = "";
  let w = 0;
  for (let i = 0; i < rest.length; ) {
    const cp = rest.codePointAt(i) ?? 0;
    const step = cp >= 0x10000 ? 2 : 1;
    const slice = rest.slice(i, i + step);
    const cw = estimatePromptTemplateCharWidthPx(slice, fontSize);
    if (w + cw > maxWidthPx) {
      break;
    }
    acc += slice;
    w += cw;
    i += step;
  }
  return acc.length > 0 ? acc : rest.slice(0, 1);
}

function ellipsizePromptTemplateLine(text: string, maxWidthPx: number, fontSize: number): string {
  const ellipsis = "…";
  if (estimatePromptTemplateTextWidthPx(text, fontSize) <= maxWidthPx) {
    return text;
  }
  let low = 0;
  let high = text.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    const candidate = `${text.slice(0, mid)}${ellipsis}`;
    if (estimatePromptTemplateTextWidthPx(candidate, fontSize) <= maxWidthPx) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return low > 0 ? `${text.slice(0, low)}${ellipsis}` : ellipsis;
}

function measurePromptTemplateNodeHeight(inputCount: number): number {
  return FLOW_PT_TEMPLATE_TOP + FLOW_PT_TEMPLATE_H + FLOW_PT_VARS_GAP + inputCount * FLOW_PT_VAR_ROW_H + FLOW_PT_BOTTOM_PAD;
}

function promptTemplateInputPortCenterY(index: number): number {
  return FLOW_PT_VARS_START + index * FLOW_PT_VAR_ROW_H + FLOW_PT_VAR_ROW_H / 2;
}

function promptTemplateOutputPortCenterY(): number {
  return FLOW_PT_TEMPLATE_TOP + FLOW_PT_TEMPLATE_H / 2;
}

function measureSmartRouterNodeHeight(config: FlowNodeConfig): number {
  const { outputs } = buildFlowPortDefinitions(config);
  const n = Math.max(outputs.length, 1);
  return FLOW_SR_ROUTES_START + n * FLOW_SR_ROUTE_ROW_H + FLOW_SR_BOTTOM_PAD;
}

function measureAgentNodeHeight(_config: FlowNodeConfig): number {
  return FLOW_AGENT_NODE_MIN_HEIGHT;
}

function ellipsizeKnowledgeRetrievalRowLabel(text: string): string {
  const trimmed = text.trim();
  if (trimmed === "") {
    return "";
  }
  return ellipsizePromptTemplateLine(trimmed, FLOW_KR_ROW_NAME_MAX_WIDTH_PX, FLOW_KR_ROW_NAME_FONT_SIZE);
}

function knowledgeRetrievalHeaderTitle(cfg: FlowNodeConfig): string {
  const trimmed = cfg.label.trim();
  if (trimmed !== "") {
    return trimmed;
  }
  const name = cfg.componentName.trim();
  if (name !== "") {
    return name;
  }
  return "知识库检索";
}

/** 画布每行展示文案：有 documentName 用名称，否则用 documentId 缩写 */
function knowledgeRetrievalRowLabels(cfg: FlowNodeConfig): string[] {
  const c = cfg.config;
  const labels: string[] = [];
  const raw = c.knowledgeSources;
  if (Object.hasOwn(c, "knowledgeSources") && Array.isArray(raw)) {
    for (const item of raw) {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const o = item as Record<string, unknown>;
        const did = typeof o.documentId === "string" ? o.documentId.trim() : "";
        if (did === "") {
          continue;
        }
        const dn = typeof o.documentName === "string" ? o.documentName.trim() : "";
        labels.push(dn !== "" ? ellipsizeKnowledgeRetrievalRowLabel(dn) : ellipsizeKnowledgeRetrievalRowLabel(did));
      }
    }
    return labels;
  }
  const legacy = c.documentIds;
  if (Array.isArray(legacy)) {
    for (const id of legacy) {
      const s = String(id).trim();
      if (s !== "") {
        labels.push(ellipsizeKnowledgeRetrievalRowLabel(s));
      }
    }
  }
  return labels;
}

function measureKnowledgeRetrievalNodeHeight(config: FlowNodeConfig): number {
  const n = Math.min(knowledgeRetrievalRowLabels(config).length, FLOW_KR_MAX_ROWS);
  if (n === 0) {
    return FLOW_KR_CONTENT_TOP + FLOW_KR_BOTTOM_PAD;
  }
  return FLOW_KR_CONTENT_TOP + n * FLOW_KR_ROW_H + (n - 1) * FLOW_KR_ROW_GAP + FLOW_KR_BOTTOM_PAD;
}

function buildKnowledgeRetrievalNodeAttrs(config: FlowNodeConfig): Record<string, Record<string, unknown>> {
  const labels = knowledgeRetrievalRowLabels(config);
  const n = Math.min(labels.length, FLOW_KR_MAX_ROWS);
  const attrs: Record<string, Record<string, unknown>> = {
    body: {
      rx: 10,
      ry: 10,
      stroke: "#1578ff",
      strokeWidth: 1,
      fill: "#ffffff",
    },
    icon: {
      href: KNOWLEDGE_RETRIEVAL_ICON_SRC,
      "xlink:href": KNOWLEDGE_RETRIEVAL_ICON_SRC,
      refX: 12,
      refY: 12,
      width: 28,
      height: 28,
      preserveAspectRatio: "xMidYMid meet",
    },
    title: {
      text: knowledgeRetrievalHeaderTitle(config),
      refX: 48,
      refY: 26,
      transform: "translate(0, -2.5)",
      fontSize: 15,
      fontWeight: 600,
      fill: "#1d2129",
      textAnchor: "start",
      dominantBaseline: "middle",
      fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
    },
  };
  for (let i = 0; i < FLOW_KR_MAX_ROWS; i += 1) {
    const show = i < n;
    const top = FLOW_KR_CONTENT_TOP + i * FLOW_KR_ROW_STRIDE;
    attrs[`krRowStrip${i}`] = {
      refX: 12,
      refY: top,
      width: FLOW_KNOWLEDGE_RETRIEVAL_NODE_WIDTH - 24,
      height: FLOW_KR_ROW_H,
      rx: 8,
      ry: 8,
      fill: "#f5f7fb",
      stroke: "#e2e8f0",
      strokeWidth: 1,
      display: show ? "block" : "none",
    };
    attrs[`krRowIcon${i}`] = {
      refX: 20,
      refY: top + 7,
      width: 16,
      height: 16,
      href: KNOWLEDGE_RETRIEVAL_ICON_SRC,
      "xlink:href": KNOWLEDGE_RETRIEVAL_ICON_SRC,
      preserveAspectRatio: "xMidYMid meet",
      display: show ? "block" : "none",
    };
    attrs[`krRowName${i}`] = {
      refX: 42,
      refY: top + FLOW_KR_ROW_H / 2,
      transform: "translate(0, -2)",
      fontSize: 13,
      fontWeight: 500,
      fill: "#1d2129",
      textAnchor: "start",
      dominantBaseline: "middle",
      fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
      text: show ? labels[i]! : "",
      display: show ? "block" : "none",
    };
  }
  return attrs;
}

function buildKnowledgeRetrievalRegistryDefaultAttrs(): Record<string, Record<string, unknown>> {
  return buildKnowledgeRetrievalNodeAttrs({
    componentKey: "knowledge-retrieval",
    componentName: "知识库检索",
    componentType: "processor",
    mappingType: "preset-node",
    mappingTarget: "KnowledgeRetrieval",
    label: "",
    description: null,
    config: { knowledgeSources: [] },
    protocolInputs: ["query"],
    protocolOutputs: ["SEARCH_RESULTS"],
  });
}

function smartRouterInputPortCenterY(): number {
  return FLOW_SR_MODEL_TOP + FLOW_SR_MODEL_H / 2;
}

function smartRouterOutputPortCenterY(index: number): number {
  return FLOW_SR_ROUTES_START + index * FLOW_SR_ROUTE_ROW_H + FLOW_SR_ROUTE_ROW_H / 2;
}

function smartRouterHeaderTitle(cfg: FlowNodeConfig): string {
  const trimmed = cfg.label.trim();
  if (trimmed !== "") {
    return trimmed;
  }
  const name = cfg.componentName.trim();
  if (name !== "") {
    return name;
  }
  return "智能路由";
}

function smartRouterRouteNameForRow(outputIndex: number, routeRow: unknown): string {
  if (routeRow && typeof routeRow === "object") {
    const r = routeRow as Record<string, unknown>;
    const rn = r.route_name;
    if (typeof rn === "string" && rn.trim() !== "") {
      return rn.trim();
    }
    const rc = r.route_category;
    if (typeof rc === "string" && rc.trim() !== "") {
      return rc.trim();
    }
  }
  return `路由 ${outputIndex + 1}`;
}

function buildSmartRouterNodeAttrs(config: FlowNodeConfig): Record<string, Record<string, unknown>> {
  const defs = buildFlowPortDefinitions(config);
  const { outputs } = defs;
  const routes = Array.isArray(config.config.routes) ? config.config.routes : [];
  const rawModel = typeof config.config.selectedModelLabel === "string" ? config.config.selectedModelLabel.trim() : "";
  const modelLine = rawModel !== "" ? truncateCanvasText(rawModel, 18) : "请选择模型";
  const rowIconSrc = languageModelRowIconHref(config.config);
  const attrs: Record<string, Record<string, unknown>> = {
    body: {
      rx: 10,
      ry: 10,
      stroke: "#1578ff",
      strokeWidth: 1,
      fill: "#ffffff",
    },
    title: {
      text: smartRouterHeaderTitle(config),
      refX: 48,
      refY: 26,
      transform: "translate(0, -2.5)",
      fontSize: 15,
      fontWeight: 600,
      fill: "#1d2129",
      textAnchor: "start",
      dominantBaseline: "middle",
      fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
    },
    icon: {
      href: SMART_ROUTER_ICON_SRC,
      "xlink:href": SMART_ROUTER_ICON_SRC,
      refX: 12,
      refY: 12,
      width: 28,
      height: 28,
      preserveAspectRatio: "xMidYMid meet",
    },
    modelArea: {
      refX: 12,
      refY: FLOW_SR_MODEL_TOP,
      width: FLOW_SMART_ROUTER_NODE_WIDTH - 24,
      height: FLOW_SR_MODEL_H,
      rx: 8,
      ry: 8,
      fill: "#f5f7fb",
      stroke: "#e2e8f0",
      strokeWidth: 1,
    },
    modelIcon: {
      refX: 20,
      refY: FLOW_SR_MODEL_TOP + 8,
      width: 20,
      height: 20,
      href: rowIconSrc,
      "xlink:href": rowIconSrc,
      preserveAspectRatio: "xMidYMid meet",
    },
    tagPill: { display: "none" },
    modelName: {
      refX: 48,
      refY: FLOW_SR_MODEL_TOP + FLOW_SR_MODEL_H / 2,
      transform: "translate(0, -2)",
      fontSize: 13,
      fontWeight: 500,
      fill: "#1d2129",
      textAnchor: "start",
      dominantBaseline: "middle",
      fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
      text: modelLine,
    },
    modelTag: { text: "", display: "none" },
  };
  for (let i = 0; i < FLOW_SR_MAX_ROUTE_ROWS; i += 1) {
    const show = i < outputs.length;
    const routeRow = routes[i];
    const nameText = truncateCanvasText(smartRouterRouteNameForRow(i, routeRow), FLOW_SR_ROUTE_NAME_MAX);
    const indexText = `路由 ${i + 1}`;
    const stripTop = FLOW_SR_ROUTES_START + i * FLOW_SR_ROUTE_ROW_H + 2;
    const stripH = FLOW_SR_ROUTE_ROW_H - 4;
    attrs[`srRowStrip${i}`] = {
      refX: FLOW_SR_ROUTE_STRIP_INSET,
      refY: stripTop,
      width: FLOW_SMART_ROUTER_NODE_WIDTH - FLOW_SR_ROUTE_STRIP_INSET * 2,
      height: stripH,
      rx: 8,
      ry: 8,
      fill: "#f6f7f9",
      stroke: "#e9ecf2",
      strokeWidth: 1,
      display: show ? "block" : "none",
    };
    attrs[`srRowIndex${i}`] = {
      refX: FLOW_SR_ROUTE_STRIP_INSET + 8,
      refY: stripTop + 14,
      text: indexText,
      fontSize: 10,
      fontWeight: 400,
      fill: "#86909c",
      textAnchor: "start",
      dominantBaseline: "middle",
      fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
      display: show ? "block" : "none",
    };
    attrs[`srRowName${i}`] = {
      refX: FLOW_SR_ROUTE_STRIP_INSET + 8,
      refY: stripTop + 34,
      text: nameText,
      fontSize: 12,
      fontWeight: 600,
      fill: "#1d2129",
      textAnchor: "start",
      dominantBaseline: "middle",
      fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
      display: show ? "block" : "none",
    };
  }
  return attrs;
}

function buildSmartRouterRegistryDefaultAttrs(): Record<string, Record<string, unknown>> {
  return buildSmartRouterNodeAttrs({
    componentKey: "smart-router",
    componentName: "智能路由",
    componentType: "router",
    mappingType: "subgraph-template",
    mappingTarget: "cube.lf.SmartRouter",
    label: "",
    description: null,
    config: {
      routes: [
        { route_name: "路由 1", route_description: "", route_message: "" },
        { route_name: "路由 2", route_description: "", route_message: "" },
      ],
    },
    protocolInputs: ["message"],
    protocolOutputs: ["route"],
  });
}

function truncateCanvasText(text: string, maxChars: number): string {
  const t = text.trim();
  if (t.length <= maxChars) {
    return t;
  }
  if (maxChars <= 1) {
    return "…";
  }
  return `${t.slice(0, maxChars - 1)}…`;
}

function ifElseHeaderTitle(config: FlowNodeConfig): string {
  const trimmed = config.label.trim();
  if (trimmed !== "") {
    return trimmed;
  }
  const name = config.componentName.trim();
  if (name !== "") {
    return name;
  }
  return "条件分支";
}

function loopHeaderTitle(config: FlowNodeConfig): string {
  const trimmed = config.label.trim();
  if (trimmed !== "") {
    return trimmed;
  }
  const name = config.componentName.trim();
  if (name !== "") {
    return name;
  }
  return "循环";
}

/** 与条件分支共用行几何：入桩在标题区下方，出口在入参区之下的右侧带 */
function measureLoopNodeHeight(): number {
  return measureIfElseNodeHeight(2);
}

function loopInputPortCenterY(index: number): number {
  return ifElseInputPortCenterY(index);
}

function loopOutputPortCenterY(outIndex: 0 | 1): number {
  return ifElseOutputPortCenterY(outIndex, 2);
}

function buildLoopCanvasPreviews(config: FlowNodeConfig): { labels: string[]; values: string[] } {
  const rawKey = typeof config.config.item_key === "string" ? config.config.item_key.trim() : "";
  const keyLine = rawKey !== "" ? rawKey : "text";
  return {
    labels: ["列表", "下一项"],
    values: [`逐项字段：${truncateCanvasText(keyLine, 22)}`, "子链尾部回连"],
  };
}

function buildIfElseNodeAttrs(config: FlowNodeConfig): Record<string, Record<string, unknown>> {
  const prev = buildIfElseCanvasPreviews(config);
  const vis = ifElseResolvedEnableFlags(config.config);
  const slotOn = [vis.enable_text_input, vis.enable_operator, vis.enable_match_text];
  const attrs: Record<string, Record<string, unknown>> = {
    body: {
      rx: 8,
      ry: 8,
      stroke: "#1578ff",
      strokeWidth: 1,
      fill: "#ffffff",
    },
    icon: {
      refX: 12,
      refY: 12,
      width: 28,
      height: 28,
      href: IF_ELSE_ICON_SRC,
      "xlink:href": IF_ELSE_ICON_SRC,
      preserveAspectRatio: "xMidYMid meet",
    },
    title: {
      refX: 48,
      refY: 26,
      transform: "translate(0, -2.5)",
      fontSize: 15,
      fontWeight: 600,
      fill: "#1d2129",
      textAnchor: "start",
      dominantBaseline: "middle",
      fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
      text: ifElseHeaderTitle(config),
    },
  };
  for (const i of [0, 1, 2] as const) {
    const show = Boolean(slotOn[i]);
    const visAttr = show ? "visible" : "hidden";
    attrs[`rowBg${i}`] = { ...buildIfElseRowStripAttrs(i), visibility: visAttr };
    attrs[`rowLbl${i}`] = { ...buildIfElseRowLabelAttrs(i, prev.labels[i] ?? ""), visibility: visAttr };
    attrs[`rowVal${i}`] = { ...buildIfElseRowValueAttrs(i, prev.values[i] ?? ""), visibility: visAttr };
  }
  return attrs;
}

function buildIfElseRegistryDefaultAttrs(): Record<string, Record<string, unknown>> {
  return buildIfElseNodeAttrs({
    componentKey: "if-else",
    componentName: "条件分支",
    componentType: "branch",
    mappingType: "direct-node",
    mappingTarget: "cube.lf.ConditionalRouter",
    label: "",
    description: null,
    config: {
      enable_text_input: true,
      enable_operator: true,
      enable_match_text: true,
      enable_case_sensitive: false,
      enable_case_true: false,
      enable_case_false: false,
      enable_max_iterations: false,
      input_text: "",
      operator: "equals",
      match_text: "",
      case_sensitive: false,
      case_true: "",
      case_false: "",
      max_iterations: 10,
      default_route: "true",
    },
    protocolInputs: ifElseDynamicInputPortNames({
      enable_text_input: true,
      enable_operator: true,
      enable_match_text: true,
      enable_case_sensitive: false,
      enable_case_true: false,
      enable_case_false: false,
      enable_max_iterations: false,
    }),
    protocolOutputs: ["if", "else"],
  });
}

function buildLoopNodeAttrs(config: FlowNodeConfig): Record<string, Record<string, unknown>> {
  const prev = buildLoopCanvasPreviews(config);
  const attrs: Record<string, Record<string, unknown>> = {
    body: {
      rx: 8,
      ry: 8,
      stroke: "#1578ff",
      strokeWidth: 1,
      fill: "#ffffff",
    },
    icon: {
      refX: 12,
      refY: 12,
      width: 28,
      height: 28,
      href: LOOP_ICON_SRC,
      "xlink:href": LOOP_ICON_SRC,
      preserveAspectRatio: "xMidYMid meet",
    },
    title: {
      refX: 48,
      refY: 26,
      transform: "translate(0, -2.5)",
      fontSize: 15,
      fontWeight: 600,
      fill: "#1d2129",
      textAnchor: "start",
      dominantBaseline: "middle",
      fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
      text: loopHeaderTitle(config),
    },
  };
  for (const i of [0, 1] as const) {
    attrs[`rowBg${i}`] = { ...buildIfElseRowStripAttrs(i), visibility: "visible" };
    attrs[`rowLbl${i}`] = { ...buildIfElseRowLabelAttrs(i, prev.labels[i] ?? ""), visibility: "visible" };
    attrs[`rowVal${i}`] = { ...buildIfElseRowValueAttrs(i, prev.values[i] ?? ""), visibility: "visible" };
  }
  return attrs;
}

function buildLoopRegistryDefaultAttrs(): Record<string, Record<string, unknown>> {
  return buildLoopNodeAttrs({
    componentKey: "loop",
    componentName: "循环",
    componentType: "control",
    mappingType: "direct-node",
    mappingTarget: "cube.lf.LoopComponent",
    label: "",
    description: null,
    config: { item_key: "text" },
    protocolInputs: ["items", "looping"],
    protocolOutputs: ["item", "done"],
  });
}

function notifyHeaderTitle(config: FlowNodeConfig): string {
  const trimmed = config.label.trim();
  if (trimmed !== "") {
    return trimmed;
  }
  const name = config.componentName.trim();
  if (name !== "") {
    return name;
  }
  return "通知发送";
}

function readNotifyContextKey(config: FlowNodeConfig): string {
  const c = config.config;
  if (typeof c.context_key === "string") {
    return c.context_key.trim();
  }
  if (typeof (c as { contextKey?: string }).contextKey === "string") {
    return String((c as { contextKey?: string }).contextKey).trim();
  }
  return "";
}

function buildNotifyLayoutMetrics(): {
  height: number;
  inputCy: number;
  outputCy: number;
} {
  let y = NOTIFY_CONTENT_TOP;
  y += NOTIFY_CTX_BLOCK;
  const inputCy = y + NOTIFY_INPUT_BLOCK / 2;
  y += NOTIFY_INPUT_BLOCK;
  y += NOTIFY_APPEND_BLOCK;
  const height = Math.max(FLOW_CHAT_INPUT_NODE_HEIGHT, y + NOTIFY_BOTTOM_PAD);
  const outputCy = height - 18;
  return { height, inputCy, outputCy };
}

function measureNotifyNodeHeight(_config: FlowNodeConfig): number {
  return buildNotifyLayoutMetrics().height;
}

function notifyInputPortCenterY(_config: FlowNodeConfig): number {
  return buildNotifyLayoutMetrics().inputCy;
}

function notifyOutputPortCenterY(_config: FlowNodeConfig): number {
  return buildNotifyLayoutMetrics().outputCy;
}

function buildNotifyNodeAttrs(config: FlowNodeConfig): Record<string, Record<string, unknown>> {
  const rawCtx = readNotifyContextKey(config);
  const ctxPreview = rawCtx !== "" ? truncateCanvasText(rawCtx, 26) : "上下文键";
  const appendOn = Boolean(config.config.append);
  const commonFont = "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif";
  const attrs: Record<string, Record<string, unknown>> = {
    body: {
      rx: 8,
      ry: 8,
      stroke: "#1578ff",
      strokeWidth: 1,
      fill: "#ffffff",
    },
    icon: {
      refX: 12,
      refY: 12,
      width: 28,
      height: 28,
      href: NOTIFY_ICON_SRC,
      "xlink:href": NOTIFY_ICON_SRC,
      preserveAspectRatio: "xMidYMid meet",
    },
    title: {
      refX: 48,
      refY: 26,
      transform: "translate(0, -2.5)",
      fontSize: 15,
      fontWeight: 600,
      fill: "#1d2129",
      textAnchor: "start",
      dominantBaseline: "middle",
      fontFamily: commonFont,
      text: notifyHeaderTitle(config),
    },
    subTitle: {
      refX: 48,
      refY: 40,
      fontSize: 10,
      fontWeight: 500,
      fill: "#86909c",
      textAnchor: "start",
      dominantBaseline: "middle",
      fontFamily: commonFont,
      letterSpacing: 0.6,
      text: "组件",
    },
  };
  let rowTop = NOTIFY_CONTENT_TOP;
  attrs.ctxStrip = {
    refX: 12,
    refY: rowTop,
    width: 247,
    height: 26,
    rx: 6,
    ry: 6,
    fill: "#f5f7fb",
    stroke: "#e2e8f0",
    strokeWidth: 1,
  };
  attrs.ctxVal = {
    refX: 20,
    refY: rowTop + 13,
    transform: "translate(0, -2)",
    fontSize: 11,
    fontWeight: 500,
    fill: "#4e5969",
    textAnchor: "start",
    dominantBaseline: "middle",
    fontFamily: commonFont,
    text: ctxPreview,
  };
  rowTop += NOTIFY_CTX_BLOCK;
  attrs.inputRowLbl = {
    refX: 24,
    refY: rowTop + NOTIFY_INPUT_BLOCK / 2,
    transform: "translate(0, -2)",
    fontSize: 11,
    fontWeight: 500,
    fill: "#4e5969",
    textAnchor: "start",
    dominantBaseline: "middle",
    fontFamily: commonFont,
    text: "输入数据",
  };
  rowTop += NOTIFY_INPUT_BLOCK;
  attrs.appendLbl = {
    refX: 24,
    refY: rowTop + NOTIFY_APPEND_BLOCK / 2,
    transform: "translate(0, -2)",
    fontSize: 11,
    fontWeight: 400,
    fill: "#86909c",
    textAnchor: "start",
    dominantBaseline: "middle",
    fontFamily: commonFont,
    text: appendOn ? "追加：开启" : "追加：关闭",
  };
  return attrs;
}

function buildNotifyRegistryDefaultAttrs(): Record<string, Record<string, unknown>> {
  return buildNotifyNodeAttrs({
    componentKey: "notify",
    componentName: "通知发送",
    componentType: "action",
    mappingType: "direct-node",
    mappingTarget: "cube.lf.Notify",
    label: "",
    description: null,
    config: {
      context_key: "",
      append: false,
    },
    protocolInputs: ["message"],
    protocolOutputs: ["result"],
  });
}

/** 入口 / 出口桩：实心品牌蓝圆点（与连线色一致） */
const FLOW_PORT_R = 6;
const FLOW_PORT_STROKE = "#1578ff";
/** 实心圆：描边与填充同色，避免空心环观感 */
const FLOW_PORT_SOLID_CIRCLE = {
  magnet: true,
  r: FLOW_PORT_R,
  strokeWidth: 1,
  stroke: FLOW_PORT_STROKE,
  fill: FLOW_PORT_STROKE,
  cursor: "crosshair",
} as const;

const inputPortCircleAttrs = { ...FLOW_PORT_SOLID_CIRCLE };

/**
 * 出口桩：默认实心蓝圆；悬停时由 flow-editor 略放大并显示「+」（仅出口）
 * 文案桩必须用非 `text` 的 selector：X6 端口在解析 `label` 时会注入 selector `text`，与自定义 markup 冲突并报
 * 「Selectors within port must be unique」。
 */
/** 十字用 path 绘制，避免依赖字体渲染（否则易出现只剩竖笔、圆内无「+」） */
const outputPortMarkup = [
  { tagName: "circle", selector: "circle" },
  { tagName: "text", selector: "labelText" },
  { tagName: "path", selector: "plusMark" },
];

const PORTS = {
  groups: {
    input: {
      position: {
        name: "absolute" as const,
        args: { x: 0, y: 0 },
      },
      attrs: {
        circle: inputPortCircleAttrs,
      },
    },
    output: {
      position: {
        name: "absolute" as const,
        args: { x: "100%", y: 0 },
      },
      markup: outputPortMarkup,
      attrs: {
        circle: {
          ...FLOW_PORT_SOLID_CIRCLE,
        },
        plusMark: {
          d: "M -5 0 L 5 0 M 0 -5 L 0 5",
          stroke: "#ffffff",
          strokeWidth: 2,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          fill: "none",
          opacity: 0,
          visibility: "hidden",
          pointerEvents: "none",
          refX: "50%",
          refY: "50%",
        },
      },
    },
  },
  items: [],
};

export function registerFlowNodes(): void {
  Graph.registerNode(
    "flow-node-chat-input",
    {
      inherit: "rect",
      width: FLOW_CHAT_INPUT_NODE_WIDTH,
      height: FLOW_CHAT_INPUT_NODE_HEIGHT,
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "rect", selector: "inputArea" },
        { tagName: "image", selector: "icon" },
        { tagName: "text", selector: "title" },
        { tagName: "text", selector: "inputHint" },
      ],
      attrs: {
        body: {
          rx: 8,
          ry: 8,
          stroke: "#e8eaef",
          strokeWidth: 1,
          fill: "#ffffff",
        },
        inputArea: {
          refX: 12,
          refY: 48,
          width: 247,
          height: 32,
          rx: 6,
          ry: 6,
          fill: "#f5f7fb",
          stroke: "#e2e8f0",
          strokeWidth: 1,
        },
        icon: {
          refX: 12,
          refY: 12,
          width: 28,
          height: 28,
          href: CHAT_INPUT_ICON_SRC,
          "xlink:href": CHAT_INPUT_ICON_SRC,
          preserveAspectRatio: "xMidYMid meet",
        },
        title: {
          refX: 48,
          /* icon 中心约 y=26；略上移对齐图标 */
          refY: 26,
          transform: "translate(0, -2.5)",
          fontSize: 15,
          fontWeight: 600,
          fill: "#1d2129",
          textAnchor: "start",
          dominantBaseline: "middle",
          fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
        },
        inputHint: {
          /* 灰区高 32、竖直中心 y=64；X6 文本易偏下，用负向 translate 上移到视觉居中 */
          refX: 20,
          refY: 64,
          transform: "translate(0, -3)",
          fontSize: 14,
          fontWeight: 400,
          fill: "#b7b9c1",
          textAnchor: "start",
          dominantBaseline: "middle",
          fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
        },
      },
      ports: PORTS,
    },
    true,
  );

  Graph.registerNode(
    "flow-node-chat-output",
    {
      inherit: "rect",
      width: FLOW_CHAT_INPUT_NODE_WIDTH,
      height: FLOW_CHAT_INPUT_NODE_HEIGHT,
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "rect", selector: "outputArea" },
        { tagName: "image", selector: "icon" },
        { tagName: "text", selector: "title" },
        { tagName: "text", selector: "outputHint" },
      ],
      attrs: {
        body: {
          rx: 8,
          ry: 8,
          stroke: "#e8eaef",
          strokeWidth: 1,
          fill: "#ffffff",
        },
        outputArea: {
          refX: 12,
          refY: 48,
          width: 247,
          height: 32,
          rx: 6,
          ry: 6,
          fill: "#f5f7fb",
          stroke: "#e2e8f0",
          strokeWidth: 1,
        },
        icon: {
          refX: 12,
          refY: 12,
          width: 28,
          height: 28,
          href: CHAT_OUTPUT_ICON_SRC,
          "xlink:href": CHAT_OUTPUT_ICON_SRC,
          preserveAspectRatio: "xMidYMid meet",
        },
        title: {
          refX: 48,
          refY: 26,
          transform: "translate(0, -2.5)",
          fontSize: 15,
          fontWeight: 600,
          fill: "#1d2129",
          textAnchor: "start",
          dominantBaseline: "middle",
          fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
        },
        outputHint: {
          refX: 20,
          refY: 64,
          transform: "translate(0, -3)",
          fontSize: 14,
          fontWeight: 400,
          fill: "#b7b9c1",
          textAnchor: "start",
          dominantBaseline: "middle",
          fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
        },
      },
      ports: PORTS,
    },
    true,
  );

  Graph.registerNode(
    "flow-node-notify",
    {
      inherit: "rect",
      width: FLOW_CHAT_INPUT_NODE_WIDTH,
      height: FLOW_NOTIFY_NODE_DEFAULT_HEIGHT,
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "image", selector: "icon" },
        { tagName: "text", selector: "title" },
        { tagName: "text", selector: "subTitle" },
        { tagName: "rect", selector: "ctxStrip" },
        { tagName: "text", selector: "ctxVal" },
        { tagName: "text", selector: "inputRowLbl" },
        { tagName: "text", selector: "appendLbl" },
      ],
      attrs: buildNotifyRegistryDefaultAttrs(),
      ports: PORTS,
    },
    true,
  );

  Graph.registerNode(
    "flow-node-if-else",
    {
      inherit: "rect",
      width: FLOW_CHAT_INPUT_NODE_WIDTH,
      height: measureIfElseNodeHeight(3),
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "image", selector: "icon" },
        { tagName: "text", selector: "title" },
        { tagName: "rect", selector: "rowBg0" },
        { tagName: "rect", selector: "rowBg1" },
        { tagName: "rect", selector: "rowBg2" },
        { tagName: "text", selector: "rowLbl0" },
        { tagName: "text", selector: "rowLbl1" },
        { tagName: "text", selector: "rowLbl2" },
        { tagName: "text", selector: "rowVal0" },
        { tagName: "text", selector: "rowVal1" },
        { tagName: "text", selector: "rowVal2" },
      ],
      attrs: buildIfElseRegistryDefaultAttrs(),
      ports: PORTS,
    },
    true,
  );

  Graph.registerNode(
    "flow-node-loop",
    {
      inherit: "rect",
      width: FLOW_CHAT_INPUT_NODE_WIDTH,
      height: measureLoopNodeHeight(),
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "image", selector: "icon" },
        { tagName: "text", selector: "title" },
        { tagName: "rect", selector: "rowBg0" },
        { tagName: "rect", selector: "rowBg1" },
        { tagName: "text", selector: "rowLbl0" },
        { tagName: "text", selector: "rowLbl1" },
        { tagName: "text", selector: "rowVal0" },
        { tagName: "text", selector: "rowVal1" },
      ],
      attrs: buildLoopRegistryDefaultAttrs(),
      ports: PORTS,
    },
    true,
  );

  Graph.registerNode(
    "flow-node-language-model",
    {
      inherit: "rect",
      width: FLOW_LLM_NODE_WIDTH,
      height: FLOW_LLM_NODE_HEIGHT,
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "rect", selector: "modelArea" },
        { tagName: "image", selector: "modelIcon" },
        { tagName: "rect", selector: "tagPill" },
        { tagName: "image", selector: "icon" },
        { tagName: "text", selector: "title" },
        { tagName: "text", selector: "modelName" },
        { tagName: "text", selector: "modelTag" },
      ],
      attrs: {
        body: {
          rx: 10,
          ry: 10,
          stroke: "#1578ff",
          strokeWidth: 1,
          fill: "#ffffff",
        },
        modelArea: {
          refX: 12,
          refY: 44,
          width: FLOW_LLM_NODE_WIDTH - 24,
          height: 36,
          rx: 8,
          ry: 8,
          fill: "#f5f7fb",
          stroke: "#e2e8f0",
          strokeWidth: 1,
        },
        /* 与右侧面板模型选项一致：灰条内、文案前小图（非标题行大图标） */
        modelIcon: {
          refX: 20,
          refY: 52,
          width: 20,
          height: 20,
          href: FLOW_EDITOR_MODEL_ICON_FALLBACK,
          "xlink:href": FLOW_EDITOR_MODEL_ICON_FALLBACK,
          preserveAspectRatio: "xMidYMid meet",
        },
        tagPill: {
          refX: "100%",
          refDx: -56,
          refY: 52,
          width: 44,
          height: 20,
          rx: 6,
          ry: 6,
          fill: "#e8eaef",
        },
        icon: {
          refX: 12,
          refY: 12,
          width: 28,
          height: 28,
          href: LLM_NODE_DEFAULT_CANVAS_ICON,
          "xlink:href": LLM_NODE_DEFAULT_CANVAS_ICON,
          preserveAspectRatio: "xMidYMid meet",
        },
        title: {
          refX: 48,
          refY: 26,
          transform: "translate(0, -2.5)",
          fontSize: 15,
          fontWeight: 600,
          fill: "#1d2129",
          textAnchor: "start",
          dominantBaseline: "middle",
          fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
        },
        modelName: {
          /* 左侧 modelIcon 20px + 间距，与灰条内文案对齐 */
          refX: 48,
          refY: 62,
          transform: "translate(0, -2)",
          fontSize: 13,
          fontWeight: 500,
          fill: "#1d2129",
          textAnchor: "start",
          dominantBaseline: "middle",
          fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
        },
        modelTag: {
          refX: "100%",
          refDx: -34,
          refY: 62,
          transform: "translate(0, -2)",
          fontSize: 10,
          fontWeight: 600,
          fill: "#86909c",
          textAnchor: "middle",
          dominantBaseline: "middle",
          fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
        },
      },
      ports: PORTS,
    },
    true,
  );

  Graph.registerNode(
    "flow-node-image-generation",
    {
      inherit: "rect",
      width: FLOW_LLM_NODE_WIDTH,
      height: FLOW_LLM_NODE_HEIGHT,
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "rect", selector: "modelArea" },
        { tagName: "image", selector: "modelIcon" },
        { tagName: "rect", selector: "tagPill" },
        { tagName: "image", selector: "icon" },
        { tagName: "text", selector: "title" },
        { tagName: "text", selector: "modelName" },
        { tagName: "text", selector: "modelTag" },
      ],
      attrs: {
        body: {
          rx: 10,
          ry: 10,
          stroke: "#7c3aed",
          strokeWidth: 1,
          fill: "#ffffff",
        },
        modelArea: {
          refX: 12,
          refY: 44,
          width: FLOW_LLM_NODE_WIDTH - 24,
          height: 36,
          rx: 8,
          ry: 8,
          fill: "#f5f7fb",
          stroke: "#e2e8f0",
          strokeWidth: 1,
        },
        modelIcon: {
          refX: 20,
          refY: 52,
          width: 20,
          height: 20,
          href: FLOW_EDITOR_MODEL_ICON_FALLBACK,
          "xlink:href": FLOW_EDITOR_MODEL_ICON_FALLBACK,
          preserveAspectRatio: "xMidYMid meet",
        },
        tagPill: {
          refX: "100%",
          refDx: -56,
          refY: 52,
          width: 44,
          height: 20,
          rx: 6,
          ry: 6,
          fill: "#e8eaef",
        },
        icon: {
          refX: 12,
          refY: 12,
          width: 28,
          height: 28,
          href: LLM_NODE_DEFAULT_CANVAS_ICON,
          "xlink:href": LLM_NODE_DEFAULT_CANVAS_ICON,
          preserveAspectRatio: "xMidYMid meet",
        },
        title: {
          refX: 48,
          refY: 26,
          transform: "translate(0, -2.5)",
          fontSize: 15,
          fontWeight: 600,
          fill: "#1d2129",
          textAnchor: "start",
          dominantBaseline: "middle",
          fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
        },
        modelName: {
          refX: 48,
          refY: 62,
          transform: "translate(0, -2)",
          fontSize: 13,
          fontWeight: 500,
          fill: "#1d2129",
          textAnchor: "start",
          dominantBaseline: "middle",
          fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
        },
        modelTag: {
          refX: "100%",
          refDx: -34,
          refY: 62,
          transform: "translate(0, -2)",
          fontSize: 10,
          fontWeight: 600,
          fill: "#86909c",
          textAnchor: "middle",
          dominantBaseline: "middle",
          fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
        },
      },
      ports: PORTS,
    },
    true,
  );

  Graph.registerNode(
    "flow-node-prompt-template",
    {
      inherit: "rect",
      width: FLOW_PROMPT_TEMPLATE_NODE_WIDTH,
      height: FLOW_PROMPT_TEMPLATE_NODE_MIN_HEIGHT,
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "rect", selector: "templateArea" },
        { tagName: "image", selector: "icon" },
        { tagName: "text", selector: "title" },
        ...Array.from({ length: FLOW_PT_MAX_PREVIEW_LINES }, (_, i) => ({
          tagName: "text",
          selector: `templateLine${i}`,
        })),
        ...Array.from({ length: FLOW_PT_MAX_VAR_LABEL_SLOTS }, (_, i) => [
          { tagName: "rect", selector: `varRowStrip${i}` },
          { tagName: "rect", selector: `varInputBg${i}` },
          { tagName: "text", selector: `varInputHint${i}` },
        ]).flat(),
        ...Array.from({ length: FLOW_PT_MAX_VAR_LABEL_SLOTS }, (_, i) => ({
          tagName: "text",
          selector: `varSlot${i}`,
        })),
      ],
      attrs: buildPromptTemplateRegistryDefaultAttrs(),
      ports: PORTS,
    },
    true,
  );

  Graph.registerNode(
    "flow-node-smart-router",
    {
      inherit: "rect",
      width: FLOW_SMART_ROUTER_NODE_WIDTH,
      height: FLOW_SMART_ROUTER_NODE_MIN_HEIGHT,
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "rect", selector: "modelArea" },
        { tagName: "image", selector: "modelIcon" },
        { tagName: "rect", selector: "tagPill" },
        { tagName: "image", selector: "icon" },
        { tagName: "text", selector: "title" },
        { tagName: "text", selector: "modelName" },
        { tagName: "text", selector: "modelTag" },
        ...Array.from({ length: FLOW_SR_MAX_ROUTE_ROWS }, (_, i) => [
          { tagName: "rect", selector: `srRowStrip${i}` },
          { tagName: "text", selector: `srRowIndex${i}` },
          { tagName: "text", selector: `srRowName${i}` },
        ]).flat(),
      ],
      attrs: buildSmartRouterRegistryDefaultAttrs(),
      ports: PORTS,
    },
    true,
  );

  Graph.registerNode(
    "flow-node-agent",
    {
      inherit: "rect",
      width: FLOW_AGENT_NODE_WIDTH,
      height: FLOW_AGENT_NODE_MIN_HEIGHT,
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "rect", selector: "modelArea" },
        { tagName: "image", selector: "modelIcon" },
        { tagName: "rect", selector: "tagPill" },
        { tagName: "image", selector: "icon" },
        { tagName: "text", selector: "title" },
        { tagName: "text", selector: "modelName" },
        { tagName: "text", selector: "modelTag" },
        { tagName: "text", selector: "hintLine" },
      ],
      attrs: buildAgentRegistryDefaultAttrs(),
      ports: PORTS,
    },
    true,
  );

  Graph.registerNode(
    "flow-node-knowledge-retrieval",
    {
      inherit: "rect",
      width: FLOW_KNOWLEDGE_RETRIEVAL_NODE_WIDTH,
      height: FLOW_KNOWLEDGE_RETRIEVAL_NODE_HEIGHT,
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "image", selector: "icon" },
        { tagName: "text", selector: "title" },
        ...Array.from({ length: FLOW_KR_MAX_ROWS }, (_, i) => [
          { tagName: "rect", selector: `krRowStrip${i}` },
          { tagName: "image", selector: `krRowIcon${i}` },
          { tagName: "text", selector: `krRowName${i}` },
        ]).flat(),
      ],
      attrs: buildKnowledgeRetrievalRegistryDefaultAttrs(),
      ports: PORTS,
    },
    true,
  );

  Graph.registerNode(
    "flow-node",
    {
      inherit: "rect",
      width: FLOW_NODE_WIDTH,
      height: FLOW_NODE_HEIGHT,
      markup: [
        { tagName: "rect", selector: "body" },
        { tagName: "text", selector: "title" },
        { tagName: "text", selector: "subtitle" },
        { tagName: "text", selector: "description" },
      ],
      attrs: {
        body: {
          rx: 8,
          ry: 8,
          stroke: "#e5e7eb",
          strokeWidth: 1,
          fill: "#ffffff",
          filter: {
            name: "dropShadow",
            args: {
              color: "rgba(15, 23, 42, 0.06)",
              dx: 0,
              dy: 2,
              blur: 10,
            },
          },
        },
        title: {
          refX: 16,
          refY: 24,
          fontSize: 15,
          fontWeight: 600,
          fill: "#1d2129",
          textAnchor: "start",
        },
        subtitle: {
          refX: 16,
          refY: 48,
          fontSize: 12,
          fill: "#4e5969",
          textAnchor: "start",
        },
        description: {
          refX: 16,
          refY: 76,
          fontSize: 11,
          fill: "#86909c",
          textAnchor: "start",
        },
      },
      ports: PORTS,
    },
    true,
  );
}

/** 画布内标题：优先用户编辑的「节点标题」，否则使用组件名（如「聊天输入」） */
function chatInputHeaderTitle(config: FlowNodeConfig): string {
  const trimmed = config.label.trim();
  if (trimmed !== "") {
    return trimmed;
  }
  const name = config.componentName.trim();
  if (name !== "") {
    return name;
  }
  return "聊天输入";
}

function chatOutputHeaderTitle(config: FlowNodeConfig): string {
  const trimmed = config.label.trim();
  if (trimmed !== "") {
    return trimmed;
  }
  const name = config.componentName.trim();
  if (name !== "") {
    return name;
  }
  return "聊天输出";
}

function llmHeaderTitle(config: FlowNodeConfig): string {
  const trimmed = config.label.trim();
  if (trimmed !== "") {
    return trimmed;
  }
  const name = config.componentName.trim();
  if (name !== "") {
    return name;
  }
  return "语言模型";
}

function imageGenerationHeaderTitle(config: FlowNodeConfig): string {
  const trimmed = config.label.trim();
  if (trimmed !== "") {
    return trimmed;
  }
  const name = config.componentName.trim();
  if (name !== "") {
    return name;
  }
  return "图像生成";
}

function agentHeaderTitle(config: FlowNodeConfig): string {
  const trimmed = config.label.trim();
  if (trimmed !== "") {
    return trimmed;
  }
  const name = config.componentName.trim();
  if (name !== "") {
    return name;
  }
  return "智能体";
}

function buildAgentNodeAttrs(config: FlowNodeConfig): Record<string, Record<string, unknown>> {
  const rawModel = typeof config.config.selectedModelLabel === "string" ? config.config.selectedModelLabel.trim() : "";
  const modelLine = rawModel !== "" ? truncateCanvasText(rawModel, 18) : "请选择模型";
  const rowIconSrc = languageModelRowIconHref(config.config);
  return {
    body: {
      rx: 10,
      ry: 10,
      stroke: "#1578ff",
      strokeWidth: 1,
      fill: "#ffffff",
    },
    modelArea: {
      refX: 12,
      refY: FLOW_AGENT_MODEL_TOP,
      width: FLOW_AGENT_NODE_WIDTH - 24,
      height: FLOW_AGENT_MODEL_H,
      rx: 8,
      ry: 8,
      fill: "#f5f7fb",
      stroke: "#e2e8f0",
      strokeWidth: 1,
    },
    modelIcon: {
      refX: 20,
      refY: FLOW_AGENT_MODEL_TOP + 8,
      width: 20,
      height: 20,
      href: rowIconSrc,
      "xlink:href": rowIconSrc,
      preserveAspectRatio: "xMidYMid meet",
    },
    tagPill: { display: "none" },
    icon: {
      refX: 12,
      refY: 12,
      width: 28,
      height: 28,
      href: AGENT_ICON_SRC,
      "xlink:href": AGENT_ICON_SRC,
      preserveAspectRatio: "xMidYMid meet",
    },
    title: {
      refX: 48,
      refY: 26,
      transform: "translate(0, -2.5)",
      fontSize: 15,
      fontWeight: 600,
      fill: "#1d2129",
      textAnchor: "start",
      dominantBaseline: "middle",
      fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
      text: agentHeaderTitle(config),
    },
    modelName: {
      refX: 48,
      refY: FLOW_AGENT_MODEL_TOP + FLOW_AGENT_MODEL_H / 2,
      transform: "translate(0, -2)",
      fontSize: 13,
      fontWeight: 500,
      fill: "#1d2129",
      textAnchor: "start",
      dominantBaseline: "middle",
      fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
      text: modelLine,
    },
    modelTag: { text: "", display: "none" },
    hintLine: {
      refX: 14,
      refY: FLOW_AGENT_HINT_TOP,
      fontSize: 11,
      text: "",
      display: "none",
    },
  };
}

function buildAgentRegistryDefaultAttrs(): Record<string, Record<string, unknown>> {
  return buildAgentNodeAttrs({
    componentKey: "agent",
    componentName: "智能体",
    componentType: "processor",
    mappingType: "preset-node",
    mappingTarget: "cube.lf.Agent",
    label: "",
    description: null,
    config: {},
    protocolInputs: ["input_value"],
    protocolOutputs: ["response"],
  });
}

function promptTemplateHeaderTitle(config: FlowNodeConfig): string {
  const trimmed = config.label.trim();
  if (trimmed !== "") {
    return trimmed;
  }
  const name = config.componentName.trim();
  if (name !== "") {
    return name;
  }
  return "提示词模板";
}

function promptTemplatePreviewLines(config: FlowNodeConfig): string[] {
  const raw = typeof config.config.template === "string" ? config.config.template : "";
  const t = raw.trim();
  if (t === "") {
    return ["在属性中编辑模板"];
  }
  const fs = FLOW_PT_PREVIEW_FONT_SIZE;
  const maxW = FLOW_PT_PREVIEW_INNER_WIDTH_PX;
  const maxLines = FLOW_PT_MAX_PREVIEW_LINES;
  /** 画布预览：换行折叠为空格，避免整段作为一行撑破宽度 */
  const flat = t.replace(/\s+/g, " ");
  const wrapped: string[] = [];
  let rest = flat;
  while (rest.length > 0) {
    const line = takeGreedyLinePrefix(rest, maxW, fs);
    wrapped.push(line);
    rest = rest.slice(line.length).trimStart();
  }
  if (wrapped.length === 0) {
    return ["在属性中编辑模板"];
  }
  if (wrapped.length <= maxLines) {
    return wrapped;
  }
  const head = wrapped.slice(0, maxLines - 1);
  const tailJoined = wrapped.slice(maxLines - 1).join("");
  return [...head, ellipsizePromptTemplateLine(tailJoined, maxW, fs)];
}

const promptTemplateTextCommon = {
  fontSize: FLOW_PT_PREVIEW_FONT_SIZE,
  fill: "#4e5969",
  textAnchor: "start" as const,
  dominantBaseline: "middle" as const,
  fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
};

function buildPromptTemplateNodeAttrs(config: FlowNodeConfig): Record<string, Record<string, unknown>> {
  const lines = promptTemplatePreviewLines(config);
  const placeholders = extractPromptTemplatePlaceholders(config.config.template);
  const attrs: Record<string, Record<string, unknown>> = {
    body: {
      rx: 10,
      ry: 10,
      stroke: "#1578ff",
      strokeWidth: 1,
      fill: "#ffffff",
    },
    title: {
      text: promptTemplateHeaderTitle(config),
      refX: 48,
      refY: 26,
      transform: "translate(0, -2.5)",
      fontSize: 15,
      fontWeight: 600,
      fill: "#1d2129",
      textAnchor: "start",
      dominantBaseline: "middle",
      fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
    },
    icon: {
      href: PROMPT_TEMPLATE_ICON_SRC,
      "xlink:href": PROMPT_TEMPLATE_ICON_SRC,
      refX: 12,
      refY: 12,
      width: 28,
      height: 28,
      preserveAspectRatio: "xMidYMid meet",
    },
    templateArea: {
      refX: 12,
      refY: FLOW_PT_TEMPLATE_TOP,
      width: FLOW_PROMPT_TEMPLATE_NODE_WIDTH - 24,
      height: FLOW_PT_TEMPLATE_H,
      rx: 8,
      ry: 8,
      fill: "#f5f7fb",
      stroke: "#e2e8f0",
      strokeWidth: 1,
    },
  };
  for (let i = 0; i < FLOW_PT_MAX_PREVIEW_LINES; i += 1) {
    const text = lines[i] ?? "";
    attrs[`templateLine${i}`] = {
      ...promptTemplateTextCommon,
      text,
      refX: 18,
      refY: FLOW_PT_TEMPLATE_LINE_START_Y + i * FLOW_PT_TEMPLATE_LINE_STEP,
      display: text !== "" ? "block" : "none",
    };
  }
  const stripW = FLOW_PROMPT_TEMPLATE_NODE_WIDTH - FLOW_PT_VAR_STRIP_INSET * 2;
  const stripH = FLOW_PT_VAR_ROW_H - FLOW_PT_VAR_STRIP_PAD_Y * 2;
  const contentLeft = FLOW_PT_VAR_STRIP_INSET + FLOW_PT_VAR_STRIP_INNER_PAD_X;
  const varInputW = stripW - FLOW_PT_VAR_STRIP_INNER_PAD_X * 2;
  for (let i = 0; i < FLOW_PT_MAX_VAR_LABEL_SLOTS; i += 1) {
    const show = i < placeholders.length;
    const raw = placeholders[i];
    const cy = promptTemplateInputPortCenterY(i);
    const stripTop = cy - stripH / 2;
    const labelY = stripTop + FLOW_PT_VAR_LABEL_DY;
    const inputTop = stripTop + FLOW_PT_VAR_INPUT_TOP_DY;
    const hintY = inputTop + FLOW_PT_VAR_INPUT_H / 2;
    attrs[`varRowStrip${i}`] = {
      refX: FLOW_PT_VAR_STRIP_INSET,
      refY: stripTop,
      width: stripW,
      height: stripH,
      rx: 8,
      ry: 8,
      fill: "#f6f7f9",
      stroke: "#e9ecf2",
      strokeWidth: 1,
      display: show ? "block" : "none",
    };
    attrs[`varInputBg${i}`] = {
      refX: contentLeft,
      refY: inputTop,
      width: varInputW,
      height: FLOW_PT_VAR_INPUT_H,
      rx: 4,
      ry: 4,
      fill: "#fafbfc",
      stroke: "#e4e7ec",
      strokeWidth: 1,
      display: show ? "block" : "none",
    };
    attrs[`varInputHint${i}`] = {
      refX: contentLeft + 8,
      refY: hintY,
      text: "连线传入",
      fontSize: 10,
      fontWeight: 400,
      fill: "#9ca3af",
      textAnchor: "start",
      dominantBaseline: "middle",
      fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
      display: show ? "block" : "none",
    };
    attrs[`varSlot${i}`] = {
      ...promptTemplateTextCommon,
      text: show && raw !== undefined ? truncateCanvasText(raw, FLOW_PT_VAR_LABEL_MAX_CHARS) : "",
      fontSize: 11,
      fontWeight: 600,
      fill: "#4e5969",
      refX: contentLeft,
      refY: labelY,
      display: show ? "block" : "none",
    };
  }
  return attrs;
}

function buildPromptTemplateRegistryDefaultAttrs(): Record<string, Record<string, unknown>> {
  return buildPromptTemplateNodeAttrs({
    componentKey: "prompt-template",
    componentName: "提示词模板",
    componentType: "processor",
    mappingType: "direct-node",
    mappingTarget: null,
    label: "",
    description: null,
    config: {},
    protocolInputs: [],
    protocolOutputs: ["prompt"],
  });
}

export function createPaletteNode(
  component: FlowComponentCatalogItem,
  index: number,
  initialConfig: Record<string, unknown> = {},
): Record<string, unknown> {
  const isChatInput = component.componentKey === "chat-input";
  const isChatOutput = component.componentKey === "chat-output";
  const isLanguageModel = component.componentKey === "language-model";
  const isImageGeneration = component.componentKey === "image-generation";
  const isPromptTemplate = component.componentKey === "prompt-template";
  const isSmartRouter = component.componentKey === "smart-router";
  const isAgent = component.componentKey === "agent";
  const isKnowledgeRetrieval = component.componentKey === "knowledge-retrieval";
  const isIfElse = component.componentKey === "if-else";
  const isLoop = component.componentKey === "loop";
  const isNotify = component.componentKey === "notify";
  const mergedConfig = isSmartRouter
    ? {
        routes: [
          { route_name: "路由 1", route_description: "", route_message: "" },
          { route_name: "路由 2", route_description: "", route_message: "" },
        ],
        custom_prompt: "",
        ...initialConfig,
      }
    : isAgent
      ? {
          systemPrompt: "",
          max_iterations: 15,
          add_current_date_tool: false,
          n_messages: 20,
          mcpServiceConfig: "",
          ...initialConfig,
        }
      : isKnowledgeRetrieval
        ? {
            knowledgeSources: [],
            ...initialConfig,
          }
        : isIfElse
          ? {
              enable_text_input: true,
              enable_operator: true,
              enable_match_text: true,
              enable_case_sensitive: false,
              enable_case_true: false,
              enable_case_false: false,
              enable_max_iterations: false,
              input_text: "",
              operator: "equals",
              match_text: "",
              case_sensitive: false,
              case_true: "",
              case_false: "",
              max_iterations: 10,
              default_route: "true",
              ...initialConfig,
            }
          : isLoop
            ? {
                item_key: "text",
                ...initialConfig,
              }
            : isNotify
              ? {
                  context_key: "",
                  append: false,
                  ...initialConfig,
                }
              : initialConfig;
  const { width, height: baseHeight } = flowNodeSizeForComponentKey(component.componentKey);
  const config = {
    componentKey: component.componentKey,
    componentName: component.componentName,
    componentType: component.componentType,
    mappingType: component.mappingType,
    mappingTarget: component.mappingTarget,
    label: component.componentName,
    description: componentDescription(component),
    config: mergedConfig,
    protocolInputs:
      component.componentKey === "if-else" ? ifElseDynamicInputPortNames(mergedConfig) : readProtocolPorts(component, "inputs"),
    protocolOutputs: component.componentKey === "if-else" ? ["if", "else"] : readProtocolPorts(component, "outputs"),
  } satisfies FlowNodeConfig;
  const height = isSmartRouter
    ? measureSmartRouterNodeHeight(config)
    : isAgent
      ? measureAgentNodeHeight(config)
      : isKnowledgeRetrieval
        ? measureKnowledgeRetrievalNodeHeight(config)
        : isIfElse
          ? (() => {
              const defs = buildFlowPortDefinitions(config);
              return measureIfElseNodeHeight(defs.inputs.length);
            })()
          : isLoop
            ? measureLoopNodeHeight()
            : isNotify
              ? measureNotifyNodeHeight(config)
              : baseHeight;
  const baseAttrs = isChatInput
    ? {
        title: { text: chatInputHeaderTitle(config) },
        inputHint: { text: "输入：" },
        icon: {
          href: CHAT_INPUT_ICON_SRC,
          "xlink:href": CHAT_INPUT_ICON_SRC,
        },
      }
    : isChatOutput
      ? {
          title: { text: chatOutputHeaderTitle(config) },
          outputHint: { text: "输出：" },
          icon: {
            href: CHAT_OUTPUT_ICON_SRC,
            "xlink:href": CHAT_OUTPUT_ICON_SRC,
          },
        }
      : isLanguageModel
        ? (() => {
            const rowIconSrc = languageModelRowIconHref(config.config);
            return {
              title: { text: llmHeaderTitle(config) },
              modelName: { text: "请选择模型" },
              modelTag: { text: "", display: "none" },
              tagPill: { display: "none" },
              icon: {
                href: LLM_NODE_DEFAULT_CANVAS_ICON,
                "xlink:href": LLM_NODE_DEFAULT_CANVAS_ICON,
              },
              modelIcon: {
                href: rowIconSrc,
                "xlink:href": rowIconSrc,
              },
            };
          })()
        : isImageGeneration
          ? (() => {
              const rowIconSrc = languageModelRowIconHref(config.config);
              return {
                title: { text: imageGenerationHeaderTitle(config) },
                modelName: { text: "请选择模型" },
                modelTag: { text: "", display: "none" },
                tagPill: { display: "none" },
                icon: {
                  href: LLM_NODE_DEFAULT_CANVAS_ICON,
                  "xlink:href": LLM_NODE_DEFAULT_CANVAS_ICON,
                },
                modelIcon: {
                  href: rowIconSrc,
                  "xlink:href": rowIconSrc,
                },
              };
            })()
          : isAgent
            ? buildAgentNodeAttrs(config)
            : isPromptTemplate
              ? buildPromptTemplateNodeAttrs(config)
              : isSmartRouter
                ? buildSmartRouterNodeAttrs(config)
                : isKnowledgeRetrieval
                  ? buildKnowledgeRetrievalNodeAttrs(config)
                  : isIfElse
                    ? buildIfElseNodeAttrs(config)
                    : isLoop
                      ? buildLoopNodeAttrs(config)
                      : isNotify
                        ? buildNotifyNodeAttrs(config)
                        : {
                            title: { text: component.componentName },
                            subtitle: { text: `${component.componentType} / ${component.mappingType}` },
                            description: { text: componentDescription(component) ?? "" },
                          };
  return {
    shape: isChatInput
      ? "flow-node-chat-input"
      : isChatOutput
        ? "flow-node-chat-output"
        : isLanguageModel
          ? "flow-node-language-model"
          : isImageGeneration
            ? "flow-node-image-generation"
            : isAgent
              ? "flow-node-agent"
              : isPromptTemplate
                ? "flow-node-prompt-template"
                : isSmartRouter
                  ? "flow-node-smart-router"
                  : isKnowledgeRetrieval
                    ? "flow-node-knowledge-retrieval"
                    : isIfElse
                      ? "flow-node-if-else"
                      : isLoop
                        ? "flow-node-loop"
                        : isNotify
                          ? "flow-node-notify"
                          : "flow-node",
    width,
    height,
    x: 40 + (index % 3) * 36,
    y: 40 + index * 18,
    attrs: baseAttrs,
    ports: buildNodePorts(config),
    data: config,
  };
}

export function updateFlowNodePresentation(node: Node, config: FlowNodeConfig): void {
  // X6 setData 默认 deep merge，嵌套 config 里删掉的字段（如 documentIds）会残留；侧栏改参须整包替换。
  node.replaceData(config);
  const ports = buildNodePorts(config);
  if (config.componentKey === "chat-input") {
    node.resize(FLOW_CHAT_INPUT_NODE_WIDTH, FLOW_CHAT_INPUT_NODE_HEIGHT);
    node.setAttrs({
      title: { text: chatInputHeaderTitle(config) },
      inputHint: { text: "输入：" },
      icon: {
        href: CHAT_INPUT_ICON_SRC,
        "xlink:href": CHAT_INPUT_ICON_SRC,
      },
    });
    node.setProp("ports", ports);
    return;
  }
  if (config.componentKey === "chat-output") {
    node.resize(FLOW_CHAT_INPUT_NODE_WIDTH, FLOW_CHAT_INPUT_NODE_HEIGHT);
    node.setAttrs({
      title: { text: chatOutputHeaderTitle(config) },
      outputHint: { text: "输出：" },
      icon: {
        href: CHAT_OUTPUT_ICON_SRC,
        "xlink:href": CHAT_OUTPUT_ICON_SRC,
      },
    });
    node.setProp("ports", ports);
    return;
  }
  if (config.componentKey === "language-model" || config.componentKey === "image-generation") {
    node.resize(FLOW_LLM_NODE_WIDTH, FLOW_LLM_NODE_HEIGHT);
    const rawLabel = typeof config.config.selectedModelLabel === "string" ? config.config.selectedModelLabel.trim() : "";
    const modelLine = rawLabel !== "" ? truncateCanvasText(rawLabel, 18) : "请选择模型";
    const rowIconSrc = languageModelRowIconHref(config.config);
    const headerTitle = config.componentKey === "image-generation" ? imageGenerationHeaderTitle(config) : llmHeaderTitle(config);
    node.setAttrs({
      title: { text: headerTitle },
      modelName: { text: modelLine },
      /** 不在画布展示分组角标（如 DEEPSEEK）；配置里仍可保留 selectedModelGroupTag 供编译/同步 */
      modelTag: { text: "", display: "none" },
      tagPill: { display: "none" },
      icon: {
        href: LLM_NODE_DEFAULT_CANVAS_ICON,
        "xlink:href": LLM_NODE_DEFAULT_CANVAS_ICON,
      },
      modelIcon: {
        href: rowIconSrc,
        "xlink:href": rowIconSrc,
      },
    });
    node.setProp("ports", ports);
    return;
  }
  if (config.componentKey === "prompt-template") {
    const defs = buildFlowPortDefinitions(config);
    const nextHeight = measurePromptTemplateNodeHeight(defs.inputs.length);
    node.resize(FLOW_PROMPT_TEMPLATE_NODE_WIDTH, nextHeight);
    node.setAttrs(buildPromptTemplateNodeAttrs(config));
    node.setProp("ports", ports);
    return;
  }
  if (config.componentKey === "smart-router") {
    const nextHeight = measureSmartRouterNodeHeight(config);
    node.resize(FLOW_SMART_ROUTER_NODE_WIDTH, nextHeight);
    node.setAttrs(buildSmartRouterNodeAttrs(config));
    node.setProp("ports", ports);
    return;
  }
  if (config.componentKey === "agent") {
    node.resize(FLOW_AGENT_NODE_WIDTH, measureAgentNodeHeight(config));
    node.setAttrs(buildAgentNodeAttrs(config));
    node.setProp("ports", ports);
    return;
  }
  if (config.componentKey === "knowledge-retrieval") {
    node.resize(FLOW_KNOWLEDGE_RETRIEVAL_NODE_WIDTH, measureKnowledgeRetrievalNodeHeight(config));
    node.setAttrs(buildKnowledgeRetrievalNodeAttrs(config));
    node.setProp("ports", ports);
    return;
  }
  if (config.componentKey === "if-else") {
    const defs = buildFlowPortDefinitions(config);
    const nextHeight = measureIfElseNodeHeight(defs.inputs.length);
    node.resize(FLOW_CHAT_INPUT_NODE_WIDTH, nextHeight);
    node.setAttrs(buildIfElseNodeAttrs(config));
    node.setProp("ports", ports);
    return;
  }
  if (config.componentKey === "loop") {
    node.resize(FLOW_CHAT_INPUT_NODE_WIDTH, FLOW_LOOP_NODE_HEIGHT);
    node.setAttrs(buildLoopNodeAttrs(config));
    node.setProp("ports", ports);
    return;
  }
  if (config.componentKey === "notify") {
    node.resize(FLOW_CHAT_INPUT_NODE_WIDTH, measureNotifyNodeHeight(config));
    node.setAttrs(buildNotifyNodeAttrs(config));
    node.setProp("ports", ports);
    return;
  }
  node.setAttrs({
    title: { text: config.label || config.componentName },
    subtitle: { text: `${config.componentType} / ${config.mappingType}` },
    description: { text: config.description ?? "" },
  });
  node.setProp("ports", ports);
  node.resize(FLOW_NODE_WIDTH, measureNodeHeight(ports.items.length, config));
}

function componentDescription(component: FlowComponentCatalogItem): string | null {
  const description = component.presentationSchema?.description;
  return typeof description === "string" && description.trim() !== "" ? description.trim() : null;
}

function readProtocolPorts(component: FlowComponentCatalogItem, key: "inputs" | "outputs"): string[] {
  const schema = component.protocolSchema;
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    return [];
  }
  const value = (schema as Record<string, unknown>)[key];
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item).trim()).filter((item) => item !== "");
}

function buildNodePorts(config: FlowNodeConfig): {
  groups: typeof PORTS.groups;
  items: Record<string, unknown>[];
} {
  const { inputs, outputs } = buildFlowPortDefinitions(config);
  const height =
    config.componentKey === "prompt-template"
      ? measurePromptTemplateNodeHeight(inputs.length)
      : config.componentKey === "smart-router"
        ? measureSmartRouterNodeHeight(config)
        : config.componentKey === "agent"
          ? measureAgentNodeHeight(config)
          : config.componentKey === "knowledge-retrieval"
            ? measureKnowledgeRetrievalNodeHeight(config)
            : config.componentKey === "if-else"
              ? measureIfElseNodeHeight(inputs.length)
              : config.componentKey === "loop"
                ? measureLoopNodeHeight()
                : config.componentKey === "notify"
                  ? measureNotifyNodeHeight(config)
                  : measureNodeHeight(Math.max(inputs.length, outputs.length), config);
  return {
    groups: PORTS.groups,
    items: [
      ...inputs.map((port, index) =>
        buildPortItem(
          port.id,
          "input",
          "",
          index,
          inputs.length,
          height,
          config.componentKey === "prompt-template"
            ? promptTemplateInputPortCenterY(index)
            : config.componentKey === "smart-router"
              ? smartRouterInputPortCenterY()
              : config.componentKey === "if-else"
                ? ifElseInputPortCenterY(index)
                : config.componentKey === "loop"
                  ? loopInputPortCenterY(index)
                  : config.componentKey === "notify"
                    ? notifyInputPortCenterY(config)
                    : undefined,
          undefined,
          "default",
          undefined,
        ),
      ),
      ...outputs.map((port, index) =>
        buildPortItem(
          port.id,
          "output",
          config.componentKey === "if-else" || config.componentKey === "loop" || config.componentKey === "notify" ? port.label : "",
          index,
          outputs.length,
          height,
          config.componentKey === "prompt-template"
            ? promptTemplateOutputPortCenterY()
            : config.componentKey === "smart-router"
              ? smartRouterOutputPortCenterY(index)
              : config.componentKey === "if-else"
                ? ifElseOutputPortCenterY(index === 0 ? 0 : 1, inputs.length)
                : config.componentKey === "loop"
                  ? loopOutputPortCenterY(index === 0 ? 0 : 1)
                  : config.componentKey === "notify"
                    ? notifyOutputPortCenterY(config)
                    : undefined,
          config.componentKey === "if-else" || config.componentKey === "loop" || config.componentKey === "notify" ? "left" : undefined,
          config.componentKey === "if-else" || config.componentKey === "loop" || config.componentKey === "notify" ? "branch" : "default",
          undefined,
        ),
      ),
    ],
  };
}

/** 创建节点时即带上 ports（与物料拖拽 createPaletteNode 一致）。避免 resetCells 后边线与端口 magnet 尚未就绪时布局，导致连线落到节点左上角。 */
export function buildFlowNodePorts(config: FlowNodeConfig): {
  groups: typeof PORTS.groups;
  items: Record<string, unknown>[];
} {
  return buildNodePorts(config);
}

/**
 * 返回与 buildNodePorts 内部一致的节点高度。
 * 用于 g.addNode() 时传入正确的 height，确保端口百分比锚点在初始布局时就能正确解析，
 * 避免节点以占位高度（flowNodeSizeForComponentKey 的最小值）创建后端口位置偏移。
 */
export function measureFlowNodeHeight(config: FlowNodeConfig): number {
  const { inputs, outputs } = buildFlowPortDefinitions(config);
  if (config.componentKey === "prompt-template") {
    return measurePromptTemplateNodeHeight(inputs.length);
  }
  if (config.componentKey === "smart-router") {
    return measureSmartRouterNodeHeight(config);
  }
  if (config.componentKey === "agent") {
    return measureAgentNodeHeight(config);
  }
  if (config.componentKey === "knowledge-retrieval") {
    return measureKnowledgeRetrievalNodeHeight(config);
  }
  if (config.componentKey === "if-else") {
    return measureIfElseNodeHeight(inputs.length);
  }
  if (config.componentKey === "loop") {
    return measureLoopNodeHeight();
  }
  if (config.componentKey === "notify") {
    return measureNotifyNodeHeight(config);
  }
  return measureNodeHeight(Math.max(inputs.length, outputs.length), config);
}

function buildPortItem(
  id: string,
  group: "input" | "output",
  portLabelText: string,
  index: number,
  count: number,
  height: number,
  yCenterPx?: number,
  /** 输出桩：条件分支 IF/ELSE 文字在连接点左侧（节点内） */
  outputLabelAnchor?: "left" | "right",
  labelStyle: "default" | "branch" = "default",
  /** 输入桩：左侧桩文字在连接点右侧（节点内） */
  inputLabelAnchor?: "left" | "right",
): Record<string, unknown> {
  const display = portLabelText.trim();
  const branchText =
    labelStyle === "branch" && display !== ""
      ? {
          text: display,
          fill: "#1d2129",
          fontSize: 11,
          fontWeight: 600,
          fontFamily: "Source Han Sans CN, Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif",
        }
      : {
          text: display === "" ? "" : truncateCanvasText(display, 14),
          fill: "#4e5969",
          fontSize: 10,
        };
  const y = yCenterPx != null ? yCenterPx : portPositionY(index, count, height);
  /** 左侧入桩：默认 `right` 使文案画在圆点右侧（节点内侧）；`left` 易落到节点外被裁切 */
  const labelAnchor = group === "input" ? (inputLabelAnchor ?? "right") : (outputLabelAnchor ?? "right");

  /**
   * 出口桩若挂 X6 的 `label` 布局的同时又用自定义 markup（circle / labelText / plus），易与内部裁切盒叠加，
   * 表现为圆点半透明、「+」只剩一条竖线。仅对「有分支文案」的出口保留 `label`；纯圆点出口仅用 args + attrs。
   */
  const outputUsesPortLabelLayout = labelStyle === "branch" || display !== "";

  const attrs =
    group === "output"
      ? {
          labelText:
            !outputUsesPortLabelLayout && display === ""
              ? {
                  text: "",
                  visibility: "hidden",
                  fontSize: 0,
                }
              : branchText,
        }
      : {
          text: branchText,
        };

  const item: Record<string, unknown> = {
    id,
    group,
    args: { x: group === "input" ? 0 : "100%", y },
    attrs,
  };

  if (group === "input" || (group === "output" && outputUsesPortLabelLayout)) {
    item.label = {
      position: {
        name: labelAnchor,
      },
    };
  }

  return item;
}

function portPositionY(index: number, count: number, height: number): number | string {
  const safeCount = Math.max(count, 1);
  if (safeCount === 1) {
    /* 用像素半高代替 '50%'：容器/SVG 尺寸未稳定时百分比锚点易偏到顶角或底边，连线误吸附 */
    return height / 2;
  }
  const top = 28;
  const bottom = height - 28;
  const step = (bottom - top) / (safeCount - 1);
  return `${((top + index * step) / height) * 100}%`;
}

function measureNodeHeight(portCount: number, config?: FlowNodeConfig): number {
  if (config?.componentKey === "chat-input" || config?.componentKey === "chat-output") {
    return FLOW_CHAT_INPUT_NODE_HEIGHT;
  }
  if (config?.componentKey === "loop") {
    return FLOW_LOOP_NODE_HEIGHT;
  }
  if (config?.componentKey === "notify") {
    return measureNotifyNodeHeight(config);
  }
  if (config?.componentKey === "language-model") {
    return FLOW_LLM_NODE_HEIGHT;
  }
  if (config?.componentKey === "smart-router") {
    return measureSmartRouterNodeHeight(config);
  }
  if (config?.componentKey === "agent") {
    return measureAgentNodeHeight(config);
  }
  if (config?.componentKey === "knowledge-retrieval") {
    return measureKnowledgeRetrievalNodeHeight(config);
  }
  const safeCount = Math.max(portCount, 1);
  return Math.max(FLOW_NODE_HEIGHT, 88 + (safeCount - 1) * 24);
}

/** 未选中节点描边（与 register body 初始值一致） */
const FLOW_NODE_BODY_IDLE = {
  stroke: "#e5e7eb",
  strokeWidth: 1,
};

/** 未选中但保持品牌蓝细描边（语言模型 / 条件分支等与画布初始样式一致） */
const FLOW_NODE_BODY_BRAND_IDLE = {
  stroke: "#1578ff",
  strokeWidth: 1,
};

/** 参考编排器：选中节点约 2px 品牌蓝描边 */
const FLOW_NODE_BODY_SELECTED = {
  stroke: "#1578ff",
  strokeWidth: 2,
};

/** 调试 / 校验：问题节点错误级描边 */
const FLOW_NODE_BODY_DEBUG_ERROR = {
  stroke: "#f5222d",
  strokeWidth: 2,
};

/** 调试 / 校验：问题节点警告级描边 */
const FLOW_NODE_BODY_DEBUG_WARNING = {
  stroke: "#fa8c16",
  strokeWidth: 2,
};

export interface FlowOutlineIssueLike {
  level: "error" | "warning";
  nodeId?: string;
}

/** 同步节点矩形描边：调试问题高亮优先于选中态 */
export function syncFlowNodeOutlines(graph: Graph, issueHighlight: readonly FlowOutlineIssueLike[] | null | undefined): void {
  const worst = new Map<string, "error" | "warning">();
  for (const issue of issueHighlight ?? []) {
    const nid = issue.nodeId?.trim();
    if (!nid) {
      continue;
    }
    if (issue.level === "error") {
      worst.set(nid, "error");
    } else if (!worst.has(nid)) {
      worst.set(nid, "warning");
    }
  }
  const selectedIds = new Set(
    graph
      .getSelectedCells()
      .filter((c) => c.isNode())
      .map((c) => c.id),
  );
  graph.getNodes().forEach((node) => {
    const data = node.getData<FlowNodeConfig>();
    const idle = flowNodeBodyIdleAttr(data);
    const level = worst.get(node.id);
    if (level === "error") {
      node.attr("body", FLOW_NODE_BODY_DEBUG_ERROR);
    } else if (level === "warning") {
      node.attr("body", FLOW_NODE_BODY_DEBUG_WARNING);
    } else {
      node.attr("body", selectedIds.has(node.id) ? FLOW_NODE_BODY_SELECTED : idle);
    }
  });
}

function flowNodeBodyIdleAttr(data: FlowNodeConfig | undefined): Record<string, unknown> {
  const key = data?.componentKey;
  if (
    key === "language-model" ||
    key === "image-generation" ||
    key === "agent" ||
    key === "prompt-template" ||
    key === "smart-router" ||
    key === "if-else" ||
    key === "loop" ||
    key === "notify"
  ) {
    return FLOW_NODE_BODY_BRAND_IDLE;
  }
  return FLOW_NODE_BODY_IDLE;
}

/** 根据当前多选状态刷新节点矩形描边（与右侧属性面板选中一致） */
export function syncFlowNodeSelectionOutline(graph: Graph): void {
  syncFlowNodeOutlines(graph, null);
}
