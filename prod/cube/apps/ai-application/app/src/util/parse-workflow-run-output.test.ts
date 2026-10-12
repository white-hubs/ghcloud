import { describe, expect, test } from "bun:test";

import { parseWorkflowMonitorBuildSteps } from "./parse-workflow-run-output";

describe("parseWorkflowMonitorBuildSteps", () => {
  test("normalizes Langflow vertex_builds objects into workflow steps", () => {
    const steps = parseWorkflowMonitorBuildSteps({
      vertex_builds: {
        ChatInput: {
          id: "ChatInput",
          display_name: "聊天输入",
          timedelta: 0.012,
          valid: true,
          inputs: { input_value: "你好" },
          outputs: { message: "你好" },
        },
        LLM: {
          id: "LLM",
          display_name: "语言模型",
          duration: 128,
          status: "success",
          build_data: {
            inputs: { input: "你好" },
            results: { message: { text: "您好" } },
          },
        },
      },
    });

    expect(steps.map((step) => step.displayName)).toEqual(["聊天输入", "语言模型"]);
    expect(steps.map((step) => step.componentId)).toEqual(["ChatInput", "LLM"]);
    expect(steps.map((step) => step.durationMs)).toEqual([12, 128]);
    expect(steps.every((step) => step.ok)).toBe(true);
    expect(steps[0].inputsPretty).toContain("input_value");
    expect(steps[1].outputsPretty).toContain("您好");
  });

  test("normalizes paged records and marks failed builds", () => {
    const steps = parseWorkflowMonitorBuildSteps({
      records: [
        {
          vertex_id: "Prompt",
          component_display_name: "提示词",
          duration_ms: 33,
          success: false,
          error: "模板变量缺失",
        },
      ],
    });

    expect(steps).toHaveLength(1);
    expect(steps[0].componentId).toBe("Prompt");
    expect(steps[0].durationLabel).toBe("33 ms");
    expect(steps[0].ok).toBe(false);
    expect(steps[0].outputsPretty).toContain("模板变量缺失");
  });
});
