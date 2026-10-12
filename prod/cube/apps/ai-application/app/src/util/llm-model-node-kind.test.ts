import { describe, expect, test } from "bun:test";

import type { ModelItem } from "@ghcloud/cube-ai-application-service";

import { filterModelsForFlowNode, isImageGenerationCapableModel, isLanguageModelSelectable } from "./llm-model-node-kind";

function baseModel(overrides: Partial<ModelItem> = {}): ModelItem {
  return {
    id: "1",
    providerId: "p1",
    providerName: "Test",
    modelCode: "gpt-4o",
    displayName: "GPT-4o",
    groupName: "General",
    sortOrder: 0,
    remark: null,
    iconUrl: null,
    apiBaseUrl: null,
    systemModelId: null,
    endpointType: "openai",
    requestSchema: null,
    responseSchema: null,
    dslSchema: null,
    modelTypes: ["reasoning"],
    isFree: false,
    supportsTest: true,
    ...overrides,
  };
}

describe("llm-model-node-kind", () => {
  test("detects image generation by dslSchema.nodeKind", () => {
    const item = baseModel({
      modelCode: "qwen-image-2.0-pro",
      dslSchema: { nodeKind: "image_generation", interactionMode: "async", primaryInput: "prompt" },
    });
    expect(isImageGenerationCapableModel(item)).toBe(true);
    expect(isLanguageModelSelectable(item)).toBe(false);
  });

  test("language model list excludes image capable models", () => {
    const models = [
      baseModel(),
      baseModel({
        id: "2",
        modelCode: "qwen-image",
        modelTypes: ["image_generation"],
        endpointType: "dashscope_text2image",
      }),
    ];
    const filtered = filterModelsForFlowNode(models, "language_model");
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.modelCode).toBe("gpt-4o");
  });

  test("detects image generation by openai_image endpointType", () => {
    const item = baseModel({
      modelCode: "dall-e-3",
      endpointType: "openai_image",
      modelTypes: ["image_generation"],
    });
    expect(isImageGenerationCapableModel(item)).toBe(true);
  });

  test("image generation list only includes image capable models", () => {
    const models = [
      baseModel(),
      baseModel({
        id: "2",
        modelCode: "qwen-image",
        dslSchema: { nodeKind: "image_generation" },
        modelTypes: ["image_generation"],
      }),
    ];
    const filtered = filterModelsForFlowNode(models, "image_generation");
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.modelCode).toBe("qwen-image");
  });
});
