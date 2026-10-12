import type { LlmSchemaField, ModelItem } from "@ghcloud/cube-ai-application-service";

export interface LlmThinkingControl {
  label: string;
  tip: string;
}

const THINKING_FEATURE = "thinking";
const LEGACY_THINKING_KEYS = new Set(["enable_thinking", "enableThinking", "extra_body.enable_thinking", "thinking.type"]);

function isThinkingFeature(field: LlmSchemaField): boolean {
  return typeof field.feature === "string" && field.feature.trim() === THINKING_FEATURE;
}

function isEnableThinkingField(field: LlmSchemaField): boolean {
  if (field.type !== "boolean") {
    return false;
  }
  if (isThinkingFeature(field)) {
    return true;
  }
  return LEGACY_THINKING_KEYS.has(field.key.trim());
}

export function resolveLlmThinkingControl(model: ModelItem | null | undefined): LlmThinkingControl | null {
  const fields = model?.requestSchema?.extraBodyFields;
  if (!Array.isArray(fields) || fields.length === 0) {
    return null;
  }
  const field = fields.find(isEnableThinkingField);
  if (!field) {
    return null;
  }
  const label = typeof field.label === "string" && field.label.trim() !== "" ? field.label.trim() : "开启思考";
  return {
    label,
    tip: typeof field.description === "string" && field.description.trim() !== "" ? field.description.trim() : "当前模型支持思考模式",
  };
}
