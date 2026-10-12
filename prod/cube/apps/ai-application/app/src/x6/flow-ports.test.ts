import { describe, expect, test } from "bun:test";

import {
  buildFlowPortDefinitions,
  coerceInputPortId,
  coerceOutputPortId,
  extractPromptTemplatePlaceholders,
  flowEdgeFeedsIfElseInputText,
  flowEdgeFeedsLanguageModelInput,
  inputPortId,
  outputPortId,
} from "./flow-ports";

describe("flow-ports", () => {
  test("extractPromptTemplatePlaceholders dedupes and preserves order", () => {
    expect(extractPromptTemplatePlaceholders("")).toEqual([]);
    expect(extractPromptTemplatePlaceholders("no placeholders")).toEqual([]);
    expect(extractPromptTemplatePlaceholders("a ${x} b ${y} c ${x}")).toEqual(["x", "y"]);
    expect(extractPromptTemplatePlaceholders("${ a }${b}")).toEqual(["a", "b"]);
  });

  test("buildFlowPortDefinitions creates one input port per ${} placeholder for prompt-template", () => {
    const ports = buildFlowPortDefinitions({
      componentKey: "prompt-template",
      config: { template: "hi ${name}, ${ctx}" },
      protocolInputs: [],
      protocolOutputs: ["prompt"],
    });
    expect(ports.inputs.map((p) => p.name)).toEqual(["name", "ctx"]);
    expect(ports.inputs.map((p) => p.id)).toEqual([inputPortId("name"), inputPortId("ctx")]);
    expect(ports.outputs.map((p) => p.id)).toEqual([outputPortId("prompt")]);
  });

  test("coerceInputPortId maps legacy i-variables to first prompt-template dynamic port", () => {
    const cfg = {
      componentKey: "prompt-template" as const,
      config: { template: "${u}" },
      protocolInputs: [] as string[],
      protocolOutputs: ["prompt"],
    };
    expect(coerceInputPortId(cfg, "i-variables")).toBe(inputPortId("u"));
  });

  test("buildFlowPortDefinitions derives smart-router dynamic outputs from routes", () => {
    const ports = buildFlowPortDefinitions({
      componentKey: "smart-router",
      config: {
        routes: [{ route_category: "意图分类" }, { route_category: "知识问答" }],
      },
      protocolInputs: ["input_text", "model"],
      protocolOutputs: ["route"],
    });

    expect(ports.inputs.map((item) => item.id)).toEqual([inputPortId("input_text"), inputPortId("model")]);
    expect(ports.outputs.map((item) => item.id)).toEqual([outputPortId("category_1_result"), outputPortId("category_2_result")]);
  });

  test("buildFlowPortDefinitions agent uses cube Agent ports with Chinese labels metadata", () => {
    const ports = buildFlowPortDefinitions({
      componentKey: "agent",
      config: { systemPrompt: "" },
      protocolInputs: ["input_value"],
      protocolOutputs: ["response"],
    });
    expect(ports.inputs.map((p) => [p.name, p.label])).toEqual([["input_value", "用户消息"]]);
    expect(ports.outputs.map((p) => [p.name, p.label])).toEqual([["response", "输出"]]);
  });

  test("buildFlowPortDefinitions if-else exposes three canvas inputs", () => {
    const ports = buildFlowPortDefinitions({
      componentKey: "if-else",
      config: {},
      protocolInputs: [],
      protocolOutputs: ["if", "else"],
    });

    expect(ports.inputs.map((item) => item.id)).toEqual([inputPortId("input_text"), inputPortId("operator"), inputPortId("match_text")]);
    expect(ports.inputs.map((item) => item.label)).toEqual(["文本输入", "运算符", "匹配文本"]);
    expect(ports.outputs.map((item) => item.id)).toEqual([outputPortId("if"), outputPortId("else")]);
    expect(ports.outputs.map((item) => item.label)).toEqual(["IF", "ELSE"]);
  });

  test("buildFlowPortDefinitions if-else hides canvas inputs when all three switches off", () => {
    const ports = buildFlowPortDefinitions({
      componentKey: "if-else",
      config: {
        enable_text_input: false,
        enable_operator: false,
        enable_match_text: false,
      },
      protocolInputs: [],
      protocolOutputs: ["if", "else"],
    });
    expect(ports.inputs.length).toBe(0);
    expect(ports.outputs.map((p) => p.name)).toEqual(["if", "else"]);
  });

  test("buildFlowPortDefinitions loop uses items looping inputs and labels", () => {
    const ports = buildFlowPortDefinitions({
      componentKey: "loop",
      config: { item_key: "text" },
      protocolInputs: ["items", "looping"],
      protocolOutputs: ["item", "done"],
    });
    expect(ports.inputs.map((p) => [p.name, p.label])).toEqual([
      ["items", "列表"],
      ["looping", "下一项"],
    ]);
    expect(ports.outputs.map((p) => [p.name, p.label])).toEqual([
      ["item", "当前项"],
      ["done", "完成"],
    ]);
  });

  test("coerceOutputPortId maps legacy output placeholder to real magnet id", () => {
    const cfg = {
      componentKey: "chat-input",
      config: {},
      protocolInputs: [],
      protocolOutputs: ["message"],
    };
    expect(coerceOutputPortId(cfg, "output")).toBe(outputPortId("message"));
    expect(coerceOutputPortId(cfg, outputPortId("message"))).toBe(outputPortId("message"));
  });

  test("coerce resolves built-in message port when persisted protocol arrays are empty", () => {
    const emptyPersisted = {
      componentKey: "chat-input",
      config: {},
      protocolInputs: [] as string[],
      protocolOutputs: [] as string[],
    };
    expect(coerceOutputPortId(emptyPersisted, "o:message")).toBe(outputPortId("message"));
    expect(coerceOutputPortId(emptyPersisted, "o-message")).toBe(outputPortId("message"));
    expect(coerceOutputPortId(emptyPersisted, undefined)).toBe(outputPortId("message"));

    const emptyChatOut = {
      componentKey: "chat-output",
      config: {},
      protocolInputs: [] as string[],
      protocolOutputs: [] as string[],
    };
    expect(coerceInputPortId(emptyChatOut, "i:message")).toBe(inputPortId("input_value"));
    expect(coerceInputPortId(emptyChatOut, "i-message")).toBe(inputPortId("input_value"));
  });

  test("flowEdgeFeedsLanguageModelInput is true when edge targets LM primary input port", () => {
    const lm = {
      componentKey: "language-model" as const,
      config: {},
      protocolInputs: ["input"],
      protocolOutputs: ["message"],
    };
    expect(flowEdgeFeedsLanguageModelInput([{ target: "lm-1", targetPort: "i-input" }], "lm-1", lm)).toBe(true);
    expect(flowEdgeFeedsLanguageModelInput([{ target: "lm-1", targetPort: "i-message" }], "lm-1", lm)).toBe(true);
    expect(flowEdgeFeedsLanguageModelInput([{ target: "lm-1", targetPort: "i-temperature" }], "lm-1", lm)).toBe(false);
    expect(flowEdgeFeedsLanguageModelInput([], "lm-1", lm)).toBe(false);
  });

  test("flowEdgeFeedsIfElseInputText is true only when edge hits input_text port", () => {
    const ieOpen = {
      componentKey: "if-else" as const,
      config: {
        enable_text_input: true,
        enable_operator: true,
        enable_match_text: true,
      },
      protocolInputs: [],
      protocolOutputs: ["if", "else"],
    };
    expect(flowEdgeFeedsIfElseInputText([{ target: "x", targetPort: "i-input_text" }], "x", ieOpen)).toBe(true);
    expect(flowEdgeFeedsIfElseInputText([{ target: "x", targetPort: "i-operator" }], "x", ieOpen)).toBe(false);
    expect(flowEdgeFeedsIfElseInputText([{ target: "y", targetPort: "i-input_text" }], "x", ieOpen)).toBe(false);
    expect(flowEdgeFeedsIfElseInputText([], "x", ieOpen)).toBe(false);
    const ieNoText = {
      componentKey: "if-else" as const,
      config: {
        enable_text_input: false,
        enable_operator: true,
        enable_match_text: true,
      },
      protocolInputs: [],
      protocolOutputs: ["if", "else"],
    };
    expect(flowEdgeFeedsIfElseInputText([{ target: "x", targetPort: "i-input_text" }], "x", ieNoText)).toBe(false);
  });

  test("coerce maps language-model legacy output port to message magnet", () => {
    const lm = {
      componentKey: "language-model" as const,
      config: {},
      protocolInputs: ["input"],
      protocolOutputs: ["message"],
    };
    expect(coerceInputPortId(lm, "i-message")).toBe(inputPortId("input"));
    expect(coerceOutputPortId(lm, "o-output")).toBe(outputPortId("message"));
    expect(coerceOutputPortId(lm, "o-message")).toBe(outputPortId("message"));
    expect(coerceOutputPortId(lm, "o-model")).toBe(outputPortId("message"));
  });

  test("coerceInputPortId maps legacy input placeholder to real magnet id", () => {
    const cfg = {
      componentKey: "chat-output",
      config: {},
      protocolInputs: ["input_value"],
      protocolOutputs: ["message"],
    };
    expect(coerceInputPortId(cfg, "input")).toBe(inputPortId("input_value"));
    expect(coerceInputPortId(cfg, inputPortId("input_value"))).toBe(inputPortId("input_value"));
  });

  test("buildFlowPortDefinitions notify exposes message and result ports", () => {
    const ports = buildFlowPortDefinitions({
      componentKey: "notify",
      config: {},
      protocolInputs: ["message"],
      protocolOutputs: ["result"],
    });
    expect(ports.inputs.map((p) => [p.name, p.label])).toEqual([["message", "输入数据"]]);
    expect(ports.outputs.map((p) => [p.name, p.label])).toEqual([["result", "数据"]]);
  });

  test("knowledge-retrieval uses SEARCH_RESULTS output; legacy documents ports coerce", () => {
    const kr = {
      componentKey: "knowledge-retrieval" as const,
      config: { knowledgeSources: [] },
      protocolInputs: ["query"],
      protocolOutputs: ["SEARCH_RESULTS"],
    };
    const krLegacyPersisted = {
      ...kr,
      protocolOutputs: ["documents"] as string[],
    };
    expect(buildFlowPortDefinitions(kr).outputs.map((p) => p.id)).toEqual([outputPortId("SEARCH_RESULTS")]);
    expect(buildFlowPortDefinitions(krLegacyPersisted).outputs.map((p) => p.id)).toEqual([outputPortId("SEARCH_RESULTS")]);
    expect(coerceOutputPortId(kr, "o-documents")).toBe(outputPortId("SEARCH_RESULTS"));
    expect(coerceOutputPortId(kr, outputPortId("SEARCH_RESULTS"))).toBe(outputPortId("SEARCH_RESULTS"));
  });
});
