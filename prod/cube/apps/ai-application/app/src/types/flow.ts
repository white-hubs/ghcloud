import type {
  FlowComponentCatalogItem,
  FlowDetailItem,
  FlowEditorEdge,
  FlowEditorGraph,
  FlowEditorNode,
} from "@ghcloud/cube-ai-application-service";

import { builtinProtocolPorts, coerceInputPortId, coerceOutputPortId, ifElseDynamicInputPortNames } from "@/x6/flow-ports";

export type FlowNodeShape =
  | "flow-node"
  | "flow-node-chat-input"
  | "flow-node-chat-output"
  | "flow-node-language-model"
  | "flow-node-image-generation"
  | "flow-node-prompt-template"
  | "flow-node-smart-router"
  | "flow-node-agent"
  | "flow-node-knowledge-retrieval"
  | "flow-node-if-else"
  | "flow-node-loop"
  | "flow-node-notify";

export interface FlowNodeConfig {
  componentKey: string;
  componentName: string;
  componentType: string;
  mappingType: string;
  mappingTarget: string | null;
  label: string;
  description: string | null;
  config: Record<string, unknown>;
  protocolInputs: string[];
  protocolOutputs: string[];
}

export interface FlowNodeData {
  id: string;
  shape: FlowNodeShape;
  x: number;
  y: number;
  width: number;
  height: number;
  data: FlowNodeConfig;
}

export interface FlowEdgeData {
  id: string;
  source: string;
  target: string;
  sourcePort?: string;
  targetPort?: string;
}

export interface FlowGraphData {
  nodes: FlowNodeData[];
  edges: FlowEdgeData[];
}

export const FLOW_NODE_WIDTH = 240;
export const FLOW_NODE_HEIGHT = 112;
/** 画布「聊天输入」节点卡片尺寸（设计稿 dp→px） */
export const FLOW_CHAT_INPUT_NODE_WIDTH = 271;
export const FLOW_CHAT_INPUT_NODE_HEIGHT = 92;
/** 条件分支：三入边全开 + 下方 IF/ELSE 出口带；须与 `nodes.ts` measureIfElseNodeHeight(3) 一致 */
export const FLOW_IF_ELSE_NODE_HEIGHT = 208;
/** 循环：双入边（列表 / 下一项）+ 下方出口带；须与 `nodes.ts` measureIfElseNodeHeight(2) 一致 */
export const FLOW_LOOP_NODE_HEIGHT = 172;
/** 通知发送：三项画布字段全开时的兜底高度；加载后由 `measureNotifyNodeHeight` 随高级开关重算 */
export const FLOW_NOTIFY_NODE_DEFAULT_HEIGHT = 160;
/** 画布「语言模型」节点卡片（设计稿：蓝描边 + 模型行 + 类型标签） */
export const FLOW_LLM_NODE_WIDTH = 280;
export const FLOW_LLM_NODE_HEIGHT = 96;
/** 画布「提示词模板」节点（与语言模型卡片宽度一致；模板区固定 100px 高，变量行在下方堆叠） */
export const FLOW_PROMPT_TEMPLATE_NODE_WIDTH = 280;
/** 无占位变量时：标题区 + 100px 模板区 + 与变量区间距 + 底部留白 */
export const FLOW_PROMPT_TEMPLATE_NODE_MIN_HEIGHT = 174;
/** 智能路由：标题 + 模型条 + 默认 2 条路由 + 底部留白（与 nodes 内度量一致） */
export const FLOW_SMART_ROUTER_NODE_WIDTH = 280;
export const FLOW_SMART_ROUTER_NODE_MIN_HEIGHT = 216;
/** 智能体：与语言模型同宽 + 模型条；底部留白与 LLM 卡片对齐（96） */
export const FLOW_AGENT_NODE_WIDTH = 280;
export const FLOW_AGENT_NODE_MIN_HEIGHT = 96;
/** 知识库检索：仅标题时的最小高度（未选知识库无内容区）；多选在 nodes 内动态增高 */
export const FLOW_KNOWLEDGE_RETRIEVAL_NODE_WIDTH = 280;
export const FLOW_KNOWLEDGE_RETRIEVAL_NODE_HEIGHT = 58;
export const FLOW_INPUT_PORT_ID = "i-input";
export const FLOW_OUTPUT_PORT_ID = "o-output";

/** 须与 ai-application `flow-runtime-mapper` / compile 注入的伴侣节点 id 规则一致 */
export const SMART_ROUTER_COMPANION_NODE_PREFIX = "__aiapp_sr_llm__";
export const SMART_ROUTER_SYNTHETIC_EDGE_PREFIX = "__aiapp_sr_lm_edge__";
export const AGENT_COMPANION_NODE_PREFIX = "__aiapp_agent_llm__";
export const AGENT_SYNTHETIC_EDGE_PREFIX = "__aiapp_agent_lm_edge__";
export const AGENT_MCP_COMPANION_NODE_PREFIX = "__aiapp_agent_mcp__";
export const AGENT_MCP_SYNTHETIC_EDGE_PREFIX = "__aiapp_agent_mcp_edge__";

export function smartRouterCompanionCanvasNodeId(routerGraphNodeId: string): string {
  return `${SMART_ROUTER_COMPANION_NODE_PREFIX}${routerGraphNodeId}`;
}

export function isSmartRouterCompanionCanvasNodeId(nodeId: string): boolean {
  return nodeId.startsWith(SMART_ROUTER_COMPANION_NODE_PREFIX);
}

export function isSmartRouterSyntheticCanvasEdge(edge: Pick<FlowEdgeData, "id" | "source">): boolean {
  return edge.id.startsWith(SMART_ROUTER_SYNTHETIC_EDGE_PREFIX) || isSmartRouterCompanionCanvasNodeId(edge.source);
}

export function agentCompanionCanvasNodeId(agentGraphNodeId: string): string {
  return `${AGENT_COMPANION_NODE_PREFIX}${agentGraphNodeId}`;
}

export function isAgentCompanionCanvasNodeId(nodeId: string): boolean {
  return nodeId.startsWith(AGENT_COMPANION_NODE_PREFIX);
}

export function isAgentSyntheticCanvasEdge(edge: Pick<FlowEdgeData, "id" | "source">): boolean {
  return edge.id.startsWith(AGENT_SYNTHETIC_EDGE_PREFIX) || isAgentCompanionCanvasNodeId(edge.source);
}

export function isAgentMcpCompanionCanvasNodeId(nodeId: string): boolean {
  return nodeId.startsWith(AGENT_MCP_COMPANION_NODE_PREFIX);
}

export function isAgentMcpSyntheticCanvasEdge(edge: Pick<FlowEdgeData, "id" | "source">): boolean {
  return edge.id.startsWith(AGENT_MCP_SYNTHETIC_EDGE_PREFIX) || isAgentMcpCompanionCanvasNodeId(edge.source);
}

export function flowNodeShapeForComponentKey(componentKey: string): FlowNodeShape {
  if (componentKey === "chat-input") {
    return "flow-node-chat-input";
  }
  if (componentKey === "chat-output") {
    return "flow-node-chat-output";
  }
  if (componentKey === "language-model") {
    return "flow-node-language-model";
  }
  if (componentKey === "image-generation") {
    return "flow-node-image-generation";
  }
  if (componentKey === "prompt-template") {
    return "flow-node-prompt-template";
  }
  if (componentKey === "smart-router") {
    return "flow-node-smart-router";
  }
  if (componentKey === "agent") {
    return "flow-node-agent";
  }
  if (componentKey === "knowledge-retrieval") {
    return "flow-node-knowledge-retrieval";
  }
  if (componentKey === "if-else") {
    return "flow-node-if-else";
  }
  if (componentKey === "loop") {
    return "flow-node-loop";
  }
  if (componentKey === "notify") {
    return "flow-node-notify";
  }
  return "flow-node";
}

export function flowNodeSizeForComponentKey(componentKey: string): { width: number; height: number } {
  if (componentKey === "chat-input" || componentKey === "chat-output") {
    return { width: FLOW_CHAT_INPUT_NODE_WIDTH, height: FLOW_CHAT_INPUT_NODE_HEIGHT };
  }
  if (componentKey === "language-model" || componentKey === "image-generation") {
    return { width: FLOW_LLM_NODE_WIDTH, height: FLOW_LLM_NODE_HEIGHT };
  }
  if (componentKey === "prompt-template") {
    return { width: FLOW_PROMPT_TEMPLATE_NODE_WIDTH, height: FLOW_PROMPT_TEMPLATE_NODE_MIN_HEIGHT };
  }
  if (componentKey === "smart-router") {
    return { width: FLOW_SMART_ROUTER_NODE_WIDTH, height: FLOW_SMART_ROUTER_NODE_MIN_HEIGHT };
  }
  if (componentKey === "agent") {
    return { width: FLOW_AGENT_NODE_WIDTH, height: FLOW_AGENT_NODE_MIN_HEIGHT };
  }
  if (componentKey === "knowledge-retrieval") {
    /** 加载流程时的占位高度；画布会根据 knowledgeSources 条数重算 */
    return { width: FLOW_KNOWLEDGE_RETRIEVAL_NODE_WIDTH, height: FLOW_KNOWLEDGE_RETRIEVAL_NODE_HEIGHT };
  }
  if (componentKey === "if-else") {
    return { width: FLOW_CHAT_INPUT_NODE_WIDTH, height: FLOW_IF_ELSE_NODE_HEIGHT };
  }
  if (componentKey === "loop") {
    /** 与条件分支同款标题下行带 + 右侧出口带 */
    return { width: FLOW_CHAT_INPUT_NODE_WIDTH, height: FLOW_LOOP_NODE_HEIGHT };
  }
  if (componentKey === "notify") {
    return { width: FLOW_CHAT_INPUT_NODE_WIDTH, height: FLOW_NOTIFY_NODE_DEFAULT_HEIGHT };
  }
  return { width: FLOW_NODE_WIDTH, height: FLOW_NODE_HEIGHT };
}

/**
 * `toFlowGraphData` 初次装载时只能给动态节点填入组件默认高度占位值；
 * 画布真正灌图时若继续沿用该占位高度，ports 的百分比锚点会按错误高度计算，导致连线端点错位。
 * 一旦 store 中已有与默认值不同的高度，则说明它来自当前画布的真实节点尺寸，应原样保留。
 */
export function resolveFlowNodeCanvasHeight(storedHeight: number | undefined, defaultHeight: number, measuredHeight: number): number {
  if (!(storedHeight != null && storedHeight > 0)) {
    return measuredHeight;
  }
  if (storedHeight === defaultHeight && measuredHeight > 0 && measuredHeight !== defaultHeight) {
    return measuredHeight;
  }
  return storedHeight;
}

function readProtocolPorts(component: FlowComponentCatalogItem | undefined, key: "inputs" | "outputs"): string[] {
  const schema = component?.protocolSchema;
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    return [];
  }
  const value = (schema as Record<string, unknown>)[key];
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item).trim()).filter((item) => item !== "");
}

function mergeProtocolListsFromCatalog(
  componentKey: string,
  component: FlowComponentCatalogItem | undefined,
  editorNodeConfig?: Record<string, unknown>,
): { protocolInputs: string[]; protocolOutputs: string[] } {
  if (componentKey === "if-else") {
    return {
      protocolInputs: ifElseDynamicInputPortNames(editorNodeConfig ?? {}),
      protocolOutputs: ["if", "else"],
    };
  }
  const fromCatalogInputs = readProtocolPorts(component, "inputs");
  const fromCatalogOutputs = readProtocolPorts(component, "outputs");
  const fb = builtinProtocolPorts(componentKey);
  return {
    protocolInputs: fromCatalogInputs.length > 0 ? fromCatalogInputs : fb.inputs,
    protocolOutputs: fromCatalogOutputs.length > 0 ? fromCatalogOutputs : fb.outputs,
  };
}

/** 未知节点或占位：至少保证内置组件能解析端口 id */
export function fallbackFlowNodeConfig(componentKey: string): FlowNodeConfig {
  const bp = builtinProtocolPorts(componentKey);
  return {
    componentKey,
    componentName: componentKey,
    componentType: "processor",
    mappingType: "direct-node",
    mappingTarget: null,
    label: componentKey,
    description: null,
    config: {},
    protocolInputs: bp.inputs,
    protocolOutputs: bp.outputs,
  };
}

function sameStringArray(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** Pinia 中已存在 protocol 为空的历史数据：渲染前补全，否则 X6 无边 magnet，连线落到对角 */
export function ensureBuiltinProtocols(config: FlowNodeConfig): FlowNodeConfig {
  const fb = builtinProtocolPorts(config.componentKey);
  /** 画布 Agent 仅保留 `input_value`，旧版三输入会在加载后统一收敛 */
  if (config.componentKey === "agent") {
    const protocolInputs = fb.inputs;
    const protocolOutputs = config.protocolOutputs.length > 0 ? config.protocolOutputs : fb.outputs;
    if (sameStringArray(protocolInputs, config.protocolInputs) && sameStringArray(protocolOutputs, config.protocolOutputs)) {
      return config;
    }
    return { ...config, protocolInputs, protocolOutputs };
  }
  if (config.componentKey === "if-else") {
    const protocolInputs = ifElseDynamicInputPortNames(config.config);
    const protocolOutputs = ["if", "else"];
    if (sameStringArray(protocolInputs, config.protocolInputs) && sameStringArray(protocolOutputs, config.protocolOutputs)) {
      return config;
    }
    return { ...config, protocolInputs, protocolOutputs };
  }
  /** 画布仅暴露 imageUrl；taskId/taskStatus 在 DSL 内部轮询，不对外连线 */
  if (config.componentKey === "image-generation") {
    const protocolInputs = config.protocolInputs.length > 0 ? config.protocolInputs : fb.inputs;
    const protocolOutputs = fb.outputs;
    if (sameStringArray(protocolInputs, config.protocolInputs) && sameStringArray(protocolOutputs, config.protocolOutputs)) {
      return config;
    }
    return { ...config, protocolInputs, protocolOutputs };
  }
  /** 历史 Loop 仅持久化 items；补齐 looping 与内置协议一致 */
  if (config.componentKey === "loop") {
    const needsMigrate =
      config.protocolInputs.length === 0 || !config.protocolInputs.includes("items") || !config.protocolInputs.includes("looping");
    const protocolInputs =
      needsMigrate && fb.inputs.length > 0 ? fb.inputs : config.protocolInputs.length > 0 ? config.protocolInputs : fb.inputs;
    const protocolOutputs = config.protocolOutputs.length > 0 ? config.protocolOutputs : fb.outputs;
    if (sameStringArray(protocolInputs, config.protocolInputs) && sameStringArray(protocolOutputs, config.protocolOutputs)) {
      return config;
    }
    return { ...config, protocolInputs, protocolOutputs };
  }
  const protocolInputs = config.protocolInputs.length > 0 ? config.protocolInputs : fb.inputs;
  const protocolOutputs = config.protocolOutputs.length > 0 ? config.protocolOutputs : fb.outputs;
  if (sameStringArray(protocolInputs, config.protocolInputs) && sameStringArray(protocolOutputs, config.protocolOutputs)) {
    return config;
  }
  return { ...config, protocolInputs, protocolOutputs };
}

export function componentDescription(component: FlowComponentCatalogItem): string | null {
  const schema = component.presentationSchema;
  const description = schema?.description;
  return typeof description === "string" && description.trim() !== "" ? description.trim() : null;
}

/**
 * 部分网关/历史数据会把 editorFlowJson 以字符串返回，或缺少 nodes/edges，直接 .map 会抛错导致整页无法灌图。
 */
export function normalizeEditorFlowJson(raw: FlowEditorGraph | string | null | undefined): FlowEditorGraph {
  if (raw == null) {
    return { schemaVersion: "ai-application-flow/v1", nodes: [], edges: [], metadata: {} };
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed === "") {
      return { schemaVersion: "ai-application-flow/v1", nodes: [], edges: [], metadata: {} };
    }
    try {
      const parsed: unknown = JSON.parse(trimmed);
      return normalizeEditorFlowJson(parsed as FlowEditorGraph | null);
    } catch {
      return { schemaVersion: "ai-application-flow/v1", nodes: [], edges: [], metadata: {} };
    }
  }
  if (typeof raw !== "object" || Array.isArray(raw)) {
    return { schemaVersion: "ai-application-flow/v1", nodes: [], edges: [], metadata: {} };
  }
  const o = raw as Record<string, unknown>;
  const nodes = Array.isArray(o.nodes)
    ? (o.nodes as FlowEditorNode[]).filter((node) => typeof node?.id === "string" && node.id !== "")
    : [];
  const edges = Array.isArray(o.edges)
    ? (o.edges as FlowEditorEdge[]).filter(
        (edge) => typeof edge?.id === "string" && edge.id !== "" && typeof edge.source === "string" && typeof edge.target === "string",
      )
    : [];
  const schemaVersion = typeof o.schemaVersion === "string" ? o.schemaVersion : "ai-application-flow/v1";
  const metadata =
    o.metadata != null && typeof o.metadata === "object" && !Array.isArray(o.metadata) ? (o.metadata as Record<string, unknown>) : {};
  return { schemaVersion, nodes, edges, metadata };
}

export function toFlowGraphData(detail: FlowDetailItem, componentMap: Map<string, FlowComponentCatalogItem>): FlowGraphData {
  const editorGraph = normalizeEditorFlowJson(detail.editorFlowJson);
  const nodes = editorGraph.nodes.map((node) => {
    const component = componentMap.get(node.componentKey);
    const config =
      node.data != null &&
      typeof node.data === "object" &&
      !Array.isArray(node.data) &&
      node.data.config != null &&
      typeof node.data.config === "object" &&
      !Array.isArray(node.data.config)
        ? (node.data.config as Record<string, unknown>)
        : ((node.data as Record<string, unknown> | null) ?? {});
    const componentKey = node.componentKey;
    const { width: nodeW, height: nodeH } = flowNodeSizeForComponentKey(componentKey);
    const { protocolInputs, protocolOutputs } = mergeProtocolListsFromCatalog(componentKey, component, config);
    return {
      id: node.id,
      shape: flowNodeShapeForComponentKey(componentKey),
      x: Number(node.position?.x ?? 0),
      y: Number(node.position?.y ?? 0),
      width: nodeW,
      height: nodeH,
      data: {
        componentKey: node.componentKey,
        componentName: component?.componentName ?? node.label ?? node.componentKey,
        componentType: component?.componentType ?? "processor",
        mappingType: component?.mappingType ?? "direct-node",
        mappingTarget: component?.mappingTarget ?? null,
        label: node.label ?? component?.componentName ?? node.componentKey,
        description: component ? componentDescription(component) : null,
        config,
        protocolInputs,
        protocolOutputs,
      },
    };
  });

  /** 智能路由 / 智能体 的 LLM 仅在 sync 时由服务端注入伴侣节点；持久化编辑器 JSON 不保存合成节点。 */
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const baseEdges = editorGraph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourcePort: coerceOutputPortId(nodeMap.get(edge.source)?.data ?? fallbackFlowNodeConfig("processor"), edge.sourcePort),
    targetPort: coerceInputPortId(nodeMap.get(edge.target)?.data ?? fallbackFlowNodeConfig("processor"), edge.targetPort),
  }));
  return {
    nodes,
    edges: baseEdges,
  };
}

export function toEditorGraphData(graphData: FlowGraphData, previous?: FlowEditorGraph | null): FlowEditorGraph {
  const persistedNodes = graphData.nodes.filter(
    (node) =>
      !isSmartRouterCompanionCanvasNodeId(node.id) && !isAgentCompanionCanvasNodeId(node.id) && !isAgentMcpCompanionCanvasNodeId(node.id),
  );
  const persistedEdges = graphData.edges.filter(
    (edge) => !isSmartRouterSyntheticCanvasEdge(edge) && !isAgentSyntheticCanvasEdge(edge) && !isAgentMcpSyntheticCanvasEdge(edge),
  );

  const previousNodes = new Map((previous?.nodes ?? []).map((node) => [node.id, node]));
  const previousEdges = new Map((previous?.edges ?? []).map((edge) => [edge.id, edge]));
  const nodeDataById = new Map(persistedNodes.map((node) => [node.id, node.data]));
  const nodes: FlowEditorNode[] = persistedNodes.map((node) => {
    const existing = previousNodes.get(node.id);
    return {
      id: node.id,
      componentKey: node.data.componentKey,
      label: node.data.label,
      position: { x: node.x, y: node.y },
      data: {
        ...(existing?.data && typeof existing.data === "object" && !Array.isArray(existing.data)
          ? (existing.data as Record<string, unknown>)
          : {}),
        config: node.data.config,
      },
    };
  });
  const edges: FlowEditorEdge[] = persistedEdges.map((edge) => {
    const existing = previousEdges.get(edge.id);
    const sourceCfg = nodeDataById.get(edge.source) ?? fallbackFlowNodeConfig("processor");
    const targetCfg = nodeDataById.get(edge.target) ?? fallbackFlowNodeConfig("processor");
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourcePort: coerceOutputPortId(sourceCfg, edge.sourcePort),
      targetPort: coerceInputPortId(targetCfg, edge.targetPort),
      data:
        existing?.data && typeof existing.data === "object" && !Array.isArray(existing.data)
          ? (existing.data as Record<string, unknown>)
          : {},
    };
  });
  return {
    schemaVersion: previous?.schemaVersion ?? "ai-application-flow/v1",
    nodes,
    edges,
    metadata: previous?.metadata ?? {},
  };
}
