import type { LlmOption } from "@cube-ai/agent-sdk-client-vue";
import { describe, expect, test } from "bun:test";

import { groupVisibleLlmOptions } from "./assistant-model-menu";

function makeModel(partial: Partial<LlmOption> & Pick<LlmOption, "modelCode" | "displayName">): LlmOption {
  return {
    modelCode: partial.modelCode,
    displayName: partial.displayName,
    providerName: partial.providerName ?? "",
  };
}

describe("groupVisibleLlmOptions", () => {
  test("keeps provider grouping when query is empty", () => {
    const groups = groupVisibleLlmOptions(
      [
        makeModel({ providerName: "阿里云百炼", displayName: "Qwen3.6 Max Preview", modelCode: "qwen3.6-max-preview" }),
        makeModel({ providerName: "DeepSeek", displayName: "DeepSeek V4 Pro", modelCode: "deepseek-v4-pro" }),
      ],
      "",
    );

    expect(groups).toEqual([
      {
        providerName: "阿里云百炼",
        items: [makeModel({ providerName: "阿里云百炼", displayName: "Qwen3.6 Max Preview", modelCode: "qwen3.6-max-preview" })],
      },
      {
        providerName: "DeepSeek",
        items: [makeModel({ providerName: "DeepSeek", displayName: "DeepSeek V4 Pro", modelCode: "deepseek-v4-pro" })],
      },
    ]);
  });

  test("filters by display name, model code, and provider name", () => {
    const qwenModel = makeModel({ providerName: "阿里云百炼", displayName: "Qwen3.6 Max Preview", modelCode: "qwen3.6-max-preview" });
    const deepSeekModel = makeModel({ providerName: "DeepSeek", displayName: "DeepSeek V4 Pro", modelCode: "deepseek-v4-pro" });
    const miniMaxModel = makeModel({ providerName: "MiniMax", displayName: "MiniMax M2.5", modelCode: "MiniMax-M2.5" });
    const models = [qwenModel, deepSeekModel, miniMaxModel];

    expect(groupVisibleLlmOptions(models, "max")).toEqual([
      {
        providerName: "阿里云百炼",
        items: [qwenModel],
      },
      {
        providerName: "MiniMax",
        items: [miniMaxModel],
      },
    ]);
    expect(groupVisibleLlmOptions(models, "deepseek-v4")).toEqual([
      {
        providerName: "DeepSeek",
        items: [deepSeekModel],
      },
    ]);
    expect(groupVisibleLlmOptions(models, "阿里")).toEqual([
      {
        providerName: "阿里云百炼",
        items: [qwenModel],
      },
    ]);
  });

  test("filters Chinese provider names by pinyin", () => {
    const qwenModel = makeModel({ providerName: "阿里云百炼", displayName: "Qwen3.6 Max Preview", modelCode: "qwen3.6-max-preview" });
    const deepSeekModel = makeModel({ providerName: "DeepSeek", displayName: "DeepSeek V4 Pro", modelCode: "deepseek-v4-pro" });

    expect(groupVisibleLlmOptions([qwenModel, deepSeekModel], "aliyun")).toEqual([
      {
        providerName: "阿里云百炼",
        items: [qwenModel],
      },
    ]);
  });
});
