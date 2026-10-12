import type { LlmDslNodeKind, ModelItem } from "@ghcloud/cube-ai-application-service";

export type FlowModelSelectKind = "language_model" | "image_generation";

function modelTypesOf(item: ModelItem): string[] {
  return Array.isArray(item.modelTypes) ? item.modelTypes.map((t) => t.trim()).filter(Boolean) : [];
}

/** 模型是否具备文生图能力（dsl / modelTypes / endpointType 任一命中） */
export function isImageGenerationCapableModel(item: ModelItem): boolean {
  const nodeKind = item.dslSchema?.nodeKind?.trim();
  if (nodeKind === "image_generation") {
    return true;
  }
  if (modelTypesOf(item).includes("image_generation")) {
    return true;
  }
  const endpointType = item.endpointType?.trim();
  return endpointType === "dashscope_text2image" || endpointType === "openai_image";
}

/** 模型是否仅应出现在语言类节点（排除文生图能力模型） */
export function isLanguageModelSelectable(item: ModelItem): boolean {
  return !isImageGenerationCapableModel(item);
}

/** 模型是否仅应出现在图像生成节点 */
export function isImageGenerationSelectable(item: ModelItem): boolean {
  return isImageGenerationCapableModel(item);
}

export function filterModelsForFlowNode(models: ModelItem[], kind: FlowModelSelectKind): ModelItem[] {
  if (kind === "image_generation") {
    return models.filter((item) => isImageGenerationSelectable(item));
  }
  return models.filter((item) => isLanguageModelSelectable(item));
}

export function flowModelSelectKindFromComponentKey(componentKey: string): FlowModelSelectKind | null {
  if (componentKey === "image-generation") {
    return "image_generation";
  }
  if (componentKey === "language-model" || componentKey === "smart-router" || componentKey === "agent") {
    return "language_model";
  }
  return null;
}

export function assertFlowModelSelectKind(nodeKind: string | undefined): nodeKind is LlmDslNodeKind {
  return nodeKind === "language_model" || nodeKind === "image_generation";
}
