/**
 * 解析流程运行接口返回的 {@link raw.outputs}（与 Kaihe / Langflow 顶点输出对齐），
 * 用于调试侧栏展示每步耗时、token（若存在）及输入/输出详情。
 */

export interface WorkflowVertexStep {
  stepKey: string;
  displayName: string;
  componentId: string;
  durationLabel: string;
  durationMs: number | null;
  tokenLabel: string | null;
  ok: boolean;
  inputsPretty: string;
  outputsPretty: string;
}

function safeJsonStringify(value: unknown, space = 2): string {
  try {
    return JSON.stringify(value, null, space);
  } catch {
    return String(value);
  }
}

function normalizeDuration(d: unknown): { label: string; ms: number | null } {
  if (d == null || d === "") {
    return { label: "—", ms: null };
  }
  const n = typeof d === "string" ? Number.parseFloat(d) : typeof d === "number" ? d : Number.NaN;
  if (!Number.isFinite(n)) {
    return { label: "—", ms: null };
  }
  /** 较大的数视为毫秒（如 149、1250）；较小正数视为秒（Langflow 常为秒浮点） */
  if (n >= 50 && n < 86_400_000) {
    return {
      label: n < 2000 ? `${n.toFixed(3).replace(/\.?0+$/, "")} ms` : `${(n / 1000).toFixed(2)} s`,
      ms: n,
    };
  }
  const ms = n * 1000;
  if (ms >= 1000) {
    return { label: `${n.toFixed(3).replace(/\.?0+$/, "")} s`, ms };
  }
  return { label: `${ms.toFixed(3).replace(/\.?0+$/, "")} ms`, ms };
}

function formatDurationMs(ms: number): { label: string; ms: number } {
  return {
    label: ms < 2000 ? `${ms.toFixed(3).replace(/\.?0+$/, "")} ms` : `${(ms / 1000).toFixed(2)} s`,
    ms,
  };
}

function deepFindFirstNumberKey(obj: unknown, keys: string[], depth = 0): number | null {
  if (depth > 14 || obj == null) {
    return null;
  }
  if (typeof obj !== "object") {
    return null;
  }
  if (Array.isArray(obj)) {
    for (const x of obj) {
      const t = deepFindFirstNumberKey(x, keys, depth + 1);
      if (t != null) {
        return t;
      }
    }
    return null;
  }
  const o = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) {
      return v;
    }
  }
  for (const v of Object.values(o)) {
    const t = deepFindFirstNumberKey(v, keys, depth + 1);
    if (t != null) {
      return t;
    }
  }
  return null;
}

function formatTokenLabel(total: number): string {
  if (total >= 1000) {
    return `${(total / 1000).toFixed(3).replace(/\.?0+$/, "")}K tokens`;
  }
  return `${Math.round(total)} tokens`;
}

function extractTokenLabel(vertex: Record<string, unknown>): string | null {
  const direct =
    typeof vertex.total_tokens === "number" ? vertex.total_tokens : typeof vertex.totalTokens === "number" ? vertex.totalTokens : null;
  if (direct != null && Number.isFinite(direct)) {
    return formatTokenLabel(direct);
  }
  const nested = deepFindFirstNumberKey(vertex, ["total_tokens", "totalTokens", "prompt_tokens", "completion_tokens"]);
  if (nested != null) {
    return formatTokenLabel(nested);
  }
  return null;
}

function vertexHasError(vertex: Record<string, unknown>): boolean {
  const results = vertex.results;
  if (results != null && typeof results === "object" && !Array.isArray(results)) {
    for (const v of Object.values(results as Record<string, unknown>)) {
      if (v != null && typeof v === "object") {
        const mr = v as Record<string, unknown>;
        if (mr.error === true) {
          return true;
        }
        const data = mr.data;
        if (data != null && typeof data === "object") {
          const d = data as Record<string, unknown>;
          if (d.error === true) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

function extractVertexInputs(batch: Record<string, unknown>, vertex: Record<string, unknown>): unknown {
  const flowInputs = batch.inputs;
  const vin = vertex.inputs ?? vertex.input;
  if (flowInputs != null || vin != null) {
    return { flowInputs: flowInputs ?? null, vertexInputs: vin ?? null };
  }
  return { note: "本步未单独携带 inputs 字段，详见下方 outputs / results。" };
}

function extractVertexOutputs(vertex: Record<string, unknown>): unknown {
  const { results, outputs, artifacts, messages, logs } = vertex;
  const compact: Record<string, unknown> = {};
  if (results != null) {
    compact.results = results;
  }
  if (outputs != null) {
    compact.outputs = outputs;
  }
  if (artifacts != null) {
    compact.artifacts = artifacts;
  }
  if (messages != null) {
    compact.messages = messages;
  }
  if (logs != null) {
    compact.logs = logs;
  }
  return Object.keys(compact).length > 0 ? compact : vertex;
}

function firstStringValue(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "string" && v.trim() !== "") {
      return v;
    }
  }
  return null;
}

function firstValue(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return obj[key];
    }
  }
  return undefined;
}

function monitorBuildRows(monitorBuilds: unknown): Record<string, unknown>[] {
  if (monitorBuilds == null || typeof monitorBuilds !== "object") {
    return [];
  }
  if (Array.isArray(monitorBuilds)) {
    return monitorBuilds.filter(
      (item): item is Record<string, unknown> => item != null && typeof item === "object" && !Array.isArray(item),
    );
  }
  const root = monitorBuilds as Record<string, unknown>;
  for (const key of ["vertex_builds", "vertexBuilds", "records", "items", "data", "builds"]) {
    const value = root[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is Record<string, unknown> => item != null && typeof item === "object" && !Array.isArray(item));
    }
    if (value != null && typeof value === "object" && !Array.isArray(value)) {
      return Object.entries(value as Record<string, unknown>).flatMap(([id, item]) => {
        if (item == null || typeof item !== "object" || Array.isArray(item)) {
          return [];
        }
        return [{ id, ...(item as Record<string, unknown>) }];
      });
    }
  }
  return Object.entries(root).flatMap(([id, item]) => {
    if (item == null || typeof item !== "object" || Array.isArray(item)) {
      return [];
    }
    return [{ id, ...(item as Record<string, unknown>) }];
  });
}

function monitorBuildOk(row: Record<string, unknown>): boolean {
  const status = firstStringValue(row, ["status", "state", "build_status"]);
  if (status != null) {
    const s = status.toLowerCase();
    if (s.includes("error") || s.includes("fail")) {
      return false;
    }
    if (s.includes("success") || s.includes("complete")) {
      return true;
    }
  }
  for (const key of ["success", "ok", "valid"]) {
    const v = row[key];
    if (typeof v === "boolean") {
      return v;
    }
  }
  return !vertexHasError(row) && row.error == null;
}

function extractMonitorBuildInputs(row: Record<string, unknown>): unknown {
  const buildData = row.build_data ?? row.buildData;
  const buildObj =
    buildData != null && typeof buildData === "object" && !Array.isArray(buildData) ? (buildData as Record<string, unknown>) : null;
  const direct = firstValue(row, ["inputs", "input"]);
  const nested = buildObj != null ? firstValue(buildObj, ["inputs", "input"]) : undefined;
  if (direct != null || nested != null) {
    return direct ?? nested;
  }
  return { note: "本步未单独携带 inputs 字段，详见输出详情。" };
}

function extractMonitorBuildOutputs(row: Record<string, unknown>): unknown {
  const buildData = row.build_data ?? row.buildData;
  const buildObj =
    buildData != null && typeof buildData === "object" && !Array.isArray(buildData) ? (buildData as Record<string, unknown>) : null;
  const compact: Record<string, unknown> = {};
  for (const key of ["outputs", "results", "artifacts", "messages", "logs", "error"]) {
    if (row[key] != null) {
      compact[key] = row[key];
    }
    if (buildObj?.[key] != null) {
      compact[key] = buildObj[key];
    }
  }
  return Object.keys(compact).length > 0 ? compact : row;
}

/**
 * 将 Monitor API `builds` 响应归一为调试侧栏可渲染的顶点步骤。
 * cube-ai 透传执行后端结构，字段随 Langflow 版本变化，所以这里只依赖常见语义字段。
 */
export function parseWorkflowMonitorBuildSteps(monitorBuilds: unknown): WorkflowVertexStep[] {
  return monitorBuildRows(monitorBuilds).map((row, idx) => {
    const componentId = firstStringValue(row, ["id", "vertex_id", "vertexId", "component_id", "componentId"]) ?? `monitor-step-${idx}`;
    const displayName =
      firstStringValue(row, ["display_name", "displayName", "component_display_name", "componentDisplayName", "name"]) ?? componentId;
    const durationMsRaw = firstValue(row, ["duration_ms", "durationMs", "latency_ms", "latencyMs"]);
    const durationRaw = durationMsRaw ?? firstValue(row, ["duration", "timedelta"]);
    const durationMsNumber =
      typeof durationMsRaw === "string" ? Number.parseFloat(durationMsRaw) : typeof durationMsRaw === "number" ? durationMsRaw : Number.NaN;
    const { label: durationLabel, ms: durationMs } = Number.isFinite(durationMsNumber)
      ? formatDurationMs(durationMsNumber)
      : normalizeDuration(durationRaw);
    return {
      stepKey: `monitor-${componentId}-${idx}`,
      displayName,
      componentId,
      durationLabel,
      durationMs,
      tokenLabel: extractTokenLabel(row),
      ok: monitorBuildOk(row),
      inputsPretty: safeJsonStringify(extractMonitorBuildInputs(row)),
      outputsPretty: safeJsonStringify(extractMonitorBuildOutputs(row)),
    };
  });
}

/**
 * 将单次 {@link RunResponse}（或网关透传的等价 JSON）解析为按执行顺序排列的顶点列表。
 */
export function parseWorkflowVertexSteps(runResponse: unknown): WorkflowVertexStep[] {
  const steps: WorkflowVertexStep[] = [];
  if (runResponse == null || typeof runResponse !== "object") {
    return steps;
  }
  const raw = (runResponse as Record<string, unknown>).raw;
  if (raw == null || typeof raw !== "object") {
    return steps;
  }
  const topOutputs = (raw as Record<string, unknown>).outputs;
  if (!Array.isArray(topOutputs)) {
    return steps;
  }

  let idx = 0;
  for (const batch of topOutputs) {
    if (batch == null || typeof batch !== "object") {
      continue;
    }
    const batchObj = batch as Record<string, unknown>;
    const inner = batchObj.outputs;
    if (!Array.isArray(inner)) {
      continue;
    }
    for (const item of inner) {
      if (item == null || typeof item !== "object") {
        continue;
      }
      const row = item as Record<string, unknown>;
      const displayName =
        typeof row.component_display_name === "string"
          ? row.component_display_name
          : typeof row.componentDisplayName === "string"
            ? row.componentDisplayName
            : "节点";
      const componentIdRaw =
        typeof row.component_id === "string" ? row.component_id : typeof row.componentId === "string" ? row.componentId : `step-${idx}`;
      const { label: durationLabel, ms: durationMs } = normalizeDuration(row.duration ?? row.timedelta);
      const ok = !vertexHasError(row);
      const tokenLabel = extractTokenLabel(row);
      steps.push({
        stepKey: `${componentIdRaw}-${idx}`,
        displayName,
        componentId: componentIdRaw,
        durationLabel,
        durationMs,
        tokenLabel,
        ok,
        inputsPretty: safeJsonStringify(extractVertexInputs(batchObj, row)),
        outputsPretty: safeJsonStringify(extractVertexOutputs(row)),
      });
      idx += 1;
    }
  }
  return steps;
}

function deepFindMessageText(obj: unknown, depth = 0): string | null {
  if (depth > 18 || obj == null) {
    return null;
  }
  if (typeof obj === "string" && obj.trim() !== "") {
    return obj;
  }
  if (typeof obj !== "object") {
    return null;
  }
  if (Array.isArray(obj)) {
    for (let i = obj.length - 1; i >= 0; i -= 1) {
      const t = deepFindMessageText(obj[i], depth + 1);
      if (t != null) {
        return t;
      }
    }
    return null;
  }
  const o = obj as Record<string, unknown>;
  if (typeof o.text === "string" && o.text.trim() !== "") {
    return o.text;
  }
  for (const v of Object.values(o)) {
    const t = deepFindMessageText(v, depth + 1);
    if (t != null) {
      return t;
    }
  }
  return null;
}

function extractPrimaryMessageFromVertex(vertex: unknown): string | null {
  if (vertex == null || typeof vertex !== "object") {
    return null;
  }
  const row = vertex as Record<string, unknown>;
  const results = row.results;
  if (results == null || typeof results !== "object" || Array.isArray(results)) {
    return null;
  }
  const msg = (results as Record<string, unknown>).message;
  if (msg != null && typeof msg === "object") {
    const text = (msg as Record<string, unknown>).text;
    if (typeof text === "string" && text.trim() !== "") {
      return text;
    }
  }
  return null;
}

/**
 * 尝试提取对用户最有意义的最终文本（通常为最后一条 chat message）。
 */
export function extractFinalAssistantText(runResponse: unknown): string | null {
  if (runResponse == null || typeof runResponse !== "object") {
    return null;
  }
  const raw = (runResponse as Record<string, unknown>).raw;
  if (raw == null || typeof raw !== "object") {
    return null;
  }
  const topOutputs = (raw as Record<string, unknown>).outputs;
  if (!Array.isArray(topOutputs)) {
    return null;
  }
  for (let bi = topOutputs.length - 1; bi >= 0; bi -= 1) {
    const batch = topOutputs[bi];
    if (batch == null || typeof batch !== "object") {
      continue;
    }
    const inner = (batch as Record<string, unknown>).outputs;
    if (!Array.isArray(inner)) {
      continue;
    }
    for (let ii = inner.length - 1; ii >= 0; ii -= 1) {
      const item = inner[ii];
      const direct = extractPrimaryMessageFromVertex(item);
      if (direct != null) {
        return direct;
      }
      const fallback = deepFindMessageText(item);
      if (fallback != null && fallback.trim() !== "") {
        return fallback;
      }
    }
  }
  return null;
}
