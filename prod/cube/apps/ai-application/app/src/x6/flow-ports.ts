import type { FlowNodeConfig } from "@/types/flow";

/** 与 ai-application FlowComponentService 内置 protocolSchema 对齐；ChatOutput 输入口与 cube-ai 协议一致为 input_value（勿用冒号：避免 SVG/CSS #id 与 querySelector 歧义） */
const BUILTIN_FLOW_PROTOCOLS: Record<string, { inputs: string[]; outputs: string[] }> = {
  "chat-input": { inputs: [], outputs: ["message"] },
  "chat-output": { inputs: ["input_value"], outputs: ["message"] },
  /** 画布仅用户消息入口；tools / agent_llm 由服务端 compile 注入 MCP 与伴侣 LLM */
  agent: { inputs: ["input_value"], outputs: ["response"] },
  /** 画布语言模型仅暴露文本输出；连 SmartRouter 的 model 口由 sync 时注入的伴侣 LLM 负责，不再在普通 LM 节点上画第二出口 */
  "language-model": { inputs: ["input"], outputs: ["message"] },
  "image-generation": { inputs: ["prompt"], outputs: ["imageUrl"] },
  /** 动态：由模板内 ${xxx} 占位推导输入端口，参见 promptTemplateInputPortsFromTemplate */
  "prompt-template": { inputs: [], outputs: ["prompt"] },
  /** 与 Langflow SmartRouter：`input_text` 主入边，`model` 为伴侣 LLM（画布自动连线） */
  "smart-router": { inputs: ["input_text", "model"], outputs: ["route"] },
  /** 与 cube-ai Prompt Template 的 SEARCH_RESULTS 入边/变量类型一致，勿用 documents */
  "knowledge-retrieval": { inputs: ["query"], outputs: ["SEARCH_RESULTS"] },
  /** 见 ifElseDynamicInputPortNames：画布入桩随 enable_* 开关变化 */
  "if-else": { inputs: [], outputs: ["if", "else"] },
  /** items：列表；looping：子链回连进入下一项（与 Langflow Loop 一致） */
  loop: { inputs: ["items", "looping"], outputs: ["item", "done"] },
  notify: { inputs: ["message"], outputs: ["result"] },
};

/** 供 flow.ts 与端口推导共用，避免「持久化里无 protocol 字段 → coerce 回退」与画布 magnet 不一致 */
export function builtinProtocolPorts(componentKey: string): { inputs: string[]; outputs: string[] } {
  return BUILTIN_FLOW_PROTOCOLS[componentKey] ?? { inputs: [], outputs: [] };
}

export interface FlowPortDefinition {
  id: string;
  name: string;
  label: string;
  group: "input" | "output";
}

export function inputPortId(name: string): string {
  return `i-${name}`;
}

/** 从模板文案中提取 `${...}` 内占位名（去重且保持首次出现顺序），用于端口与运行时替换 */
export function extractPromptTemplatePlaceholders(template: unknown): string[] {
  if (typeof template !== "string" || template.trim() === "") {
    return [];
  }
  const seen = new Set<string>();
  const ordered: string[] = [];
  const re = /\$\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(template)) !== null) {
    const inner = (m[1] ?? "").trim();
    if (inner === "" || seen.has(inner)) {
      continue;
    }
    seen.add(inner);
    ordered.push(inner);
  }
  return ordered;
}

/** 将占位名映射为端口 id 段（同一模板内去重冲突） */
function promptTemplatePortSlug(rawName: string, usedSlugs: Set<string>): string {
  const base =
    rawName.trim() === ""
      ? "_"
      : rawName
          .trim()
          .replace(/[^\w\u4e00-\u9fff.-]/g, "_")
          .replace(/_+/g, "_") || "_";
  let slug = base;
  let n = 1;
  while (usedSlugs.has(slug)) {
    slug = `${base}_${n}`;
    n += 1;
  }
  usedSlugs.add(slug);
  return slug;
}

export function outputPortId(name: string): string {
  return `o-${name}`;
}

/** cube-ai 条件分支：开启的字段才出现左侧连接桩（顺序与侧栏一致） */
export function ifElseResolvedEnableFlags(cfg: Record<string, unknown> | undefined): {
  enable_text_input: boolean;
  enable_operator: boolean;
  enable_match_text: boolean;
  enable_case_sensitive: boolean;
  enable_case_true: boolean;
  enable_case_false: boolean;
  enable_max_iterations: boolean;
} {
  const c = cfg ?? {};
  const hasToggleKeys = c.enable_text_input !== undefined || c.enable_operator !== undefined || c.enable_match_text !== undefined;
  if (hasToggleKeys) {
    return {
      enable_text_input: Boolean(c.enable_text_input),
      enable_operator: Boolean(c.enable_operator),
      enable_match_text: Boolean(c.enable_match_text),
      enable_case_sensitive: Boolean(c.enable_case_sensitive),
      enable_case_true: Boolean(c.enable_case_true),
      enable_case_false: Boolean(c.enable_case_false),
      enable_max_iterations: Boolean(c.enable_max_iterations),
    };
  }
  return {
    enable_text_input: true,
    enable_operator: true,
    enable_match_text: true,
    enable_case_sensitive: false,
    enable_case_true: false,
    enable_case_false: false,
    enable_max_iterations: false,
  };
}

/**
 * 画布与 cube 连边：仅「文本输入 / 运算符 / 匹配文本」三类；是否出现由侧栏开关控制（无开关 key 时三者默认开启，兼容旧数据）
 */
export function ifElseDynamicInputPortNames(cfg: Record<string, unknown> | undefined): string[] {
  const f = ifElseResolvedEnableFlags(cfg);
  const list: string[] = [];
  if (f.enable_text_input) {
    list.push("input_text");
  }
  if (f.enable_operator) {
    list.push("operator");
  }
  if (f.enable_match_text) {
    list.push("match_text");
  }
  return list;
}

function ifElseInputPortCanvasLabel(portName: string): string {
  const map: Record<string, string> = {
    input_text: "文本输入",
    operator: "运算符",
    match_text: "匹配文本",
    case_sensitive: "区分大小写",
    case_true: "条件为真",
    case_false: "条件为假",
    max_iterations: "最大迭代",
    default_route: "默认路由",
  };
  return map[portName] ?? portName;
}

/** 持久化旧数据 o:name / i:name → 与当前 magnet id（o-name）对齐 */
function canonicalEditorPortId(portId: string): string {
  const legacy = /^([io]):(.+)$/.exec(portId);
  return legacy ? `${legacy[1]}-${legacy[2]}` : portId;
}

/** 画布左侧入桩旁展示（协议名或简短中文，避免纯隐式桩） */
function canvasInputPortLabel(componentKey: string, portName: string): string {
  const n = portName.trim();
  if (componentKey === "smart-router") {
    if (n === "input_text") {
      return "输入";
    }
    if (n === "model") {
      return "语言模型";
    }
    return n;
  }
  if (componentKey === "agent") {
    if (n === "input_value") {
      return "用户消息";
    }
    return n;
  }
  if (componentKey === "loop") {
    if (n === "items") {
      return "列表";
    }
    if (n === "looping") {
      return "下一项";
    }
    return n;
  }
  if (componentKey === "language-model") {
    if (n === "input") {
      return "输入";
    }
    if (n === "model") {
      return "模型";
    }
    return n;
  }
  if (componentKey === "chat-output" && n === "input_value") {
    return "input_value";
  }
  if (componentKey === "knowledge-retrieval" && n === "query") {
    return "query";
  }
  if (componentKey === "notify" && n === "message") {
    return "输入数据";
  }
  return n;
}

export function buildFlowPortDefinitions(config: Pick<FlowNodeConfig, "componentKey" | "config" | "protocolInputs" | "protocolOutputs">): {
  inputs: FlowPortDefinition[];
  outputs: FlowPortDefinition[];
} {
  const fb = builtinProtocolPorts(config.componentKey);
  const normalizedIn = normalizePortList(config.protocolInputs);
  const normalizedOutRaw = normalizePortList(config.protocolOutputs);
  /** 持久化曾用 documents；与 Prompt Template / cube-ai 的 SEARCH_RESULTS 对齐 */
  const normalizedOut =
    config.componentKey === "knowledge-retrieval"
      ? normalizedOutRaw.map((n) => (n === "documents" ? "SEARCH_RESULTS" : n))
      : normalizedOutRaw;
  const inputNames =
    config.componentKey === "prompt-template" || config.componentKey === "if-else"
      ? []
      : normalizedIn.length > 0
        ? normalizedIn
        : fb.inputs;
  const outputNames =
    config.componentKey === "smart-router"
      ? smartRouterOutputNames(config.config, normalizedOut.length > 0 ? normalizedOut : fb.outputs)
      : normalizedOut.length > 0
        ? normalizedOut
        : fb.outputs;
  const inputs =
    config.componentKey === "if-else"
      ? ifElseDynamicInputPortNames(config.config).map((name) => ({
          id: inputPortId(name),
          name,
          label: ifElseInputPortCanvasLabel(name),
          group: "input" as const,
        }))
      : config.componentKey === "prompt-template"
        ? (() => {
            const usedSlugs = new Set<string>();
            const placeholders = extractPromptTemplatePlaceholders(config.config?.template);
            return placeholders.map((raw) => {
              const slug = promptTemplatePortSlug(raw, usedSlugs);
              return {
                id: inputPortId(slug),
                name: raw,
                label: raw,
                group: "input" as const,
              };
            });
          })()
        : inputNames.map((name) => ({
            id: inputPortId(name),
            name,
            label: canvasInputPortLabel(config.componentKey, name),
            group: "input" as const,
          }));
  const outputs = outputNames.map((name, index) => ({
    id: outputPortId(name),
    name,
    label:
      config.componentKey === "smart-router"
        ? smartRouterOutputLabel(config.config, name, index)
        : config.componentKey === "agent" && name === "response"
          ? "输出"
          : config.componentKey === "knowledge-retrieval" && name === "SEARCH_RESULTS"
            ? "检索结果"
            : config.componentKey === "if-else" && name === "if"
              ? "IF"
              : config.componentKey === "if-else" && name === "else"
                ? "ELSE"
                : config.componentKey === "loop" && name === "item"
                  ? "当前项"
                  : config.componentKey === "loop" && name === "done"
                    ? "完成"
                    : config.componentKey === "notify" && name === "result"
                      ? "数据"
                      : name,
    group: "output" as const,
  }));
  return {
    inputs,
    outputs,
  };
}

export function firstInputPortId(config: Pick<FlowNodeConfig, "componentKey" | "config" | "protocolInputs" | "protocolOutputs">): string {
  const { inputs } = buildFlowPortDefinitions(config);
  if (inputs.length > 0) {
    return inputs[0].id;
  }
  if (config.componentKey === "prompt-template") {
    return inputPortId("variables");
  }
  if (config.componentKey === "if-else") {
    return inputPortId("input_text");
  }
  return inputPortId("input");
}

/**
 * 是否存在指向语言模型节点「主输入」口的连线（现协议 i-input；旧数据 i-message 仍识别）。
 * 有连线时 DSL 优先用上游 input，表单「用户输入」仅无连线兜底，面板应禁用编辑。
 */
export function flowEdgeFeedsLanguageModelInput(
  edges: Array<{ target: string; targetPort?: string }>,
  languageModelNodeId: string,
  lmNodeConfig: Pick<FlowNodeConfig, "componentKey" | "config" | "protocolInputs" | "protocolOutputs">,
): boolean {
  if (lmNodeConfig.componentKey !== "language-model") {
    return false;
  }
  const primaryInputId = firstInputPortId(lmNodeConfig);
  const legacyPorts = new Set(["i-message", "i:message", "i-input", primaryInputId]);
  return edges.some((edge) => {
    if (edge.target !== languageModelNodeId) {
      return false;
    }
    const raw = edge.targetPort?.trim() ?? "";
    if (raw === "") {
      return true;
    }
    return legacyPorts.has(raw);
  });
}

/** @deprecated 使用 flowEdgeFeedsLanguageModelInput */
export const flowEdgeFeedsLanguageModelMessageInput = flowEdgeFeedsLanguageModelInput;

/** 是否存在指向图像生成节点「提示词」口的连线 */
export function flowEdgeFeedsImageGenerationPrompt(
  edges: Array<{ target: string; targetPort?: string }>,
  imageNodeId: string,
  nodeConfig: Pick<FlowNodeConfig, "componentKey" | "config" | "protocolInputs" | "protocolOutputs">,
): boolean {
  if (nodeConfig.componentKey !== "image-generation") {
    return false;
  }
  const primaryInputId = firstInputPortId(nodeConfig);
  const legacyPorts = new Set(["i-prompt", "i:prompt", primaryInputId]);
  return edges.some((edge) => {
    if (edge.target !== imageNodeId) {
      return false;
    }
    const raw = edge.targetPort?.trim() ?? "";
    if (raw === "") {
      return true;
    }
    return legacyPorts.has(raw);
  });
}

/**
 * 条件分支「文本输入」口存在入边时，侧栏静态文案与运行时上游冲突，应禁用编辑。
 */
export function flowEdgeFeedsIfElseInputText(
  edges: Array<{ target: string; targetPort?: string }>,
  ifElseNodeId: string,
  nodeConfig: Pick<FlowNodeConfig, "componentKey" | "config" | "protocolInputs" | "protocolOutputs">,
): boolean {
  if (nodeConfig.componentKey !== "if-else") {
    return false;
  }
  const { inputs } = buildFlowPortDefinitions(nodeConfig);
  const textPortId = inputPortId("input_text");
  if (!inputs.some((p) => p.id === textPortId)) {
    return false;
  }
  const firstInputId = inputs[0]?.id ?? "";
  return edges.some((edge) => {
    if (edge.target !== ifElseNodeId) {
      return false;
    }
    const raw = edge.targetPort?.trim() ?? "";
    if (raw === "") {
      return firstInputId === textPortId;
    }
    return coerceInputPortId(nodeConfig, raw) === textPortId;
  });
}

export function firstOutputPortId(config: Pick<FlowNodeConfig, "componentKey" | "config" | "protocolInputs" | "protocolOutputs">): string {
  return buildFlowPortDefinitions(config).outputs[0]?.id ?? outputPortId("output");
}

/** 将持久化/旧数据中的端口 id 规范为当前节点上存在的 magnet id（避免误用 output/input 导致连线落到节点角） */
export function coerceOutputPortId(
  config: Pick<FlowNodeConfig, "componentKey" | "config" | "protocolInputs" | "protocolOutputs">,
  savedPortId: string | undefined | null,
): string {
  const { outputs } = buildFlowPortDefinitions(config);
  const validIds = new Set(outputs.map((p) => p.id));
  const candidate = savedPortId != null && savedPortId !== "" ? canonicalEditorPortId(savedPortId) : null;
  if (config.componentKey === "knowledge-retrieval") {
    const legacyDocs = new Set(["o-documents", "o:documents", "documents", "o_documents"]);
    if (candidate != null && legacyDocs.has(candidate)) {
      return outputPortId("SEARCH_RESULTS");
    }
  }
  if (config.componentKey === "language-model" && (candidate === "o-output" || candidate === "o:output" || candidate === "output")) {
    return outputPortId("message");
  }
  if (
    config.componentKey === "language-model" &&
    (candidate === "o-language_model" || candidate === "o:language_model" || candidate === "o-model" || candidate === "o:model")
  ) {
    return outputPortId("message");
  }
  if (candidate != null && validIds.has(candidate)) {
    return candidate;
  }
  return firstOutputPortId(config);
}

export function coerceInputPortId(
  config: Pick<FlowNodeConfig, "componentKey" | "config" | "protocolInputs" | "protocolOutputs">,
  savedPortId: string | undefined | null,
): string {
  const { inputs } = buildFlowPortDefinitions(config);
  const validIds = new Set(inputs.map((p) => p.id));
  const candidate = savedPortId != null && savedPortId !== "" ? canonicalEditorPortId(savedPortId) : null;
  if (config.componentKey === "language-model" && (candidate === "i-message" || candidate === "i:message")) {
    return inputPortId("input");
  }
  if (candidate != null && validIds.has(candidate)) {
    return candidate;
  }
  /** 旧画布曾用 i-message 作为主输入；Langflow SmartRouter 主字段为 input_text */
  if (config.componentKey === "smart-router" && (candidate === "i-message" || candidate === "i:message")) {
    return inputPortId("input_text");
  }
  if (config.componentKey === "agent" && (candidate === "i-message" || candidate === "i:message")) {
    return inputPortId("input_value");
  }
  if (config.componentKey === "smart-router" && (candidate === "i-language_model" || candidate === "i:language_model")) {
    return inputPortId("model");
  }
  if (config.componentKey === "prompt-template") {
    /** 旧版单一入口 variables → 迁移到第一个动态占位端口 */
    const legacy = new Set(["i-variables", "i:variable", "variables", "i_variables"]);
    if (candidate != null && legacy.has(candidate)) {
      return inputs[0]?.id ?? candidate;
    }
    return inputs[0]?.id ?? firstInputPortId(config);
  }
  /** 旧持久化曾用 i-message 表示 ChatOutput 入边，现协议名为 input_value */
  if (config.componentKey === "chat-output" && (candidate === "i-message" || candidate === "i:message")) {
    return inputPortId("input_value");
  }
  /** 旧条件分支单入口 context → 优先映射到 input_text */
  if (config.componentKey === "if-else") {
    const legacyDefaultRoute = new Set(["i-default_route", "i:default_route", "default_route"]);
    if (candidate != null && legacyDefaultRoute.has(candidate)) {
      return inputPortId("input_text");
    }
    const legacyContext = new Set(["i-context", "i:context", "context"]);
    if (candidate != null && legacyContext.has(candidate)) {
      const prefer = inputPortId("input_text");
      if (validIds.has(prefer)) {
        return prefer;
      }
      return inputs[0]?.id ?? firstInputPortId(config);
    }
  }
  return firstInputPortId(config);
}

function normalizePortList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item).trim()).filter((item) => item !== "");
}

function smartRouterOutputNames(nodeConfig: Record<string, unknown>, fallbackOutputs: string[]): string[] {
  const outputs: string[] = [];
  const routes = nodeConfig.routes;
  if (Array.isArray(routes)) {
    for (const [index] of routes.entries()) {
      outputs.push(`category_${index + 1}_result`);
    }
  }
  return outputs.length > 0 ? outputs : normalizePortList(fallbackOutputs);
}

function smartRouterOutputLabel(nodeConfig: Record<string, unknown>, outputName: string, index: number): string {
  const routes = nodeConfig.routes;
  if (!Array.isArray(routes)) {
    return outputName;
  }
  const route = routes[index];
  if (!route || typeof route !== "object") {
    return outputName;
  }
  const r = route as Record<string, unknown>;
  const name = r.route_name;
  if (typeof name === "string" && name.trim() !== "") {
    return name.trim();
  }
  const category = r.route_category;
  return typeof category === "string" && category.trim() !== "" ? category.trim() : outputName;
}
