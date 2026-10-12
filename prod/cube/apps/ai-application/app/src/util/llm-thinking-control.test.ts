import { describe, expect, test } from "bun:test";

import type { ModelItem } from "@ghcloud/cube-ai-application-service";

import { resolveLlmThinkingControl } from "./llm-thinking-control";

function baseModel(overrides: Partial<ModelItem> = {}): ModelItem {
  return {
    id: "1",
    providerId: "p1",
    providerName: "Test",
    modelCode: "qwen3.6-plus",
    displayName: "Qwen3.6 Plus",
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

describe("llm-thinking-control", () => {
  test("detects enable_thinking from request schema extra body fields", () => {
    const control = resolveLlmThinkingControl(
      baseModel({
        requestSchema: {
          requestShape: "openai_chat_compatible",
          extraBodyFields: [{ key: "enable_thinking", label: "开启思考", type: "boolean", wirePath: "extra_body.enable_thinking" }],
        },
      }),
    );

    expect(control).toEqual({
      label: "开启思考",
      tip: "当前模型支持思考模式",
    });
  });

  test("detects thinking feature without exposing provider parameter names to frontend", () => {
    const control = resolveLlmThinkingControl(
      baseModel({
        modelCode: "doubao-seed-2-0-pro-260215",
        requestSchema: {
          requestShape: "openai_chat_compatible",
          extraBodyFields: [
            {
              key: "enableThinking",
              label: "开启思考",
              type: "boolean",
              feature: "thinking",
              wirePath: "thinking.type",
              wireTransform: "boolean:enabled_disabled",
            },
          ],
        },
      }),
    );

    expect(control).toEqual({
      label: "开启思考",
      tip: "当前模型支持思考模式",
    });
  });

  test("does not expose thinking switch without explicit schema support", () => {
    expect(resolveLlmThinkingControl(baseModel())).toBeNull();
    expect(
      resolveLlmThinkingControl(
        baseModel({
          requestSchema: { requestShape: "openai_chat_compatible", extraBodyFields: [{ key: "seed", type: "integer" }] },
        }),
      ),
    ).toBeNull();
    expect(
      resolveLlmThinkingControl(
        baseModel({
          requestSchema: { requestShape: "openai_chat_compatible", extraBodyFields: [{ key: "stream", type: "boolean" }] },
        }),
      ),
    ).toBeNull();
  });
});
