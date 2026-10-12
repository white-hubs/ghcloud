import type { AssistantMessage, ReasoningStep, TokenUsageSnapshot, TurnTokenUsage } from "@cube-ai/agent-sdk-client-vue";
import { describe, expect, test } from "bun:test";

/**
 * 单元测试：`assistant-chat-token-usage.ts` 纯函数。
 *
 * 重点验证 `aggregateUsageForStep` 必须按
 * **`attribution.parentId === step.stepId`** 关联（spec
 * `cube-agentic-engine/docs/superpowers/specs/2026-05-15-realtime-token-usage-design.md` §UI
 * 第 240 行明确约定）。
 *
 * 历史 bug：早期实现误用 `attribution.id` 命中，子 step 一律拿不到 token；
 * tachu 多个 LLM call attribution（turnStart / direct-answer / tool-use）
 * 都把 `parentId` 设为 lifecycle 或 tool-loop `stepId`，而 `attribution.id`
 * 是 LLM call 自己的唯一 id（一个 lifecycle step 内可能有多次 LLM call，例如 turnStart 的
 * fallback-summary + final-answer），永远不会等于 `step.stepId`。
 */
import {
  aggregateUsageForStep,
  formatTokenInline,
  isApproximateUsageForStep,
  isApproximateTokenUsage,
  pickMessageTokenUsage,
  terminalKindBadge,
} from "./assistant-chat-token-usage";

function makeStep(stepId: string, parentStepId?: string): ReasoningStep {
  return {
    stepId,
    ...(parentStepId !== undefined ? { parentStepId } : {}),
    kind: "lifecycle",
    label: stepId,
    startTime: 0,
    text: "",
  };
}

function makeUsageItem(opts: { attrId: string; parentId?: string; input: number; output: number }): TokenUsageSnapshot {
  return {
    turnId: "T1",
    usage: { input: opts.input, output: opts.output, total: opts.input + opts.output },
    cumulative: { input: opts.input, output: opts.output, total: opts.input + opts.output },
    attribution: {
      id: opts.attrId,
      kind: "llm_call",
      ...(opts.parentId !== undefined ? { parentId: opts.parentId } : {}),
    },
    accuracy: "final",
    updatedAt: 0,
  };
}

describe("aggregateUsageForStep", () => {
  // ⭐ 当前 bug 修复主验证：parentId 命中
  test("按 attribution.parentId 命中（spec §UI 主路径）", () => {
    const steps = [makeStep("STEP_OUTPUT")];
    const items = [makeUsageItem({ attrId: "LLM_CALL_001", parentId: "STEP_OUTPUT", input: 100, output: 200 })];
    const result = aggregateUsageForStep("STEP_OUTPUT", steps, items);
    expect(result).toEqual({ input: 100, output: 200 });
  });

  test("一个 step 多次 LLM call → 全部累加（turnStart fallback-summary + final-answer 场景）", () => {
    const steps = [makeStep("STEP_OUTPUT")];
    const items = [
      makeUsageItem({ attrId: "LLM_CALL_001", parentId: "STEP_OUTPUT", input: 50, output: 100 }),
      makeUsageItem({ attrId: "LLM_CALL_002", parentId: "STEP_OUTPUT", input: 30, output: 80 }),
    ];
    const result = aggregateUsageForStep("STEP_OUTPUT", steps, items);
    expect(result).toEqual({ input: 80, output: 180 });
  });

  test("DFS 收集子树 → 子孙 step 的 LLM call 也归属祖先", () => {
    const steps = [makeStep("PHASE_EXEC"), makeStep("TOOL_LOOP_1", "PHASE_EXEC"), makeStep("TOOL_LOOP_2", "PHASE_EXEC")];
    const items = [
      makeUsageItem({ attrId: "LLM_A", parentId: "TOOL_LOOP_1", input: 10, output: 20 }),
      makeUsageItem({ attrId: "LLM_B", parentId: "TOOL_LOOP_2", input: 30, output: 40 }),
    ];
    const result = aggregateUsageForStep("PHASE_EXEC", steps, items);
    expect(result).toEqual({ input: 40, output: 60 });
  });

  test("兜底：attribution.id 直接等于 step.stepId 也命中（向前兼容）", () => {
    const steps = [makeStep("STEP_X")];
    const items = [makeUsageItem({ attrId: "STEP_X", input: 7, output: 9 })];
    const result = aggregateUsageForStep("STEP_X", steps, items);
    expect(result).toEqual({ input: 7, output: 9 });
  });

  test("完全不命中（attrId / parentId 都不在子树）→ null", () => {
    const steps = [makeStep("STEP_OUTPUT")];
    const items = [makeUsageItem({ attrId: "LLM_X", parentId: "STEP_INTENT", input: 5, output: 5 })];
    const result = aggregateUsageForStep("STEP_OUTPUT", steps, items);
    expect(result).toBeNull();
  });

  test("items 为空 → null", () => {
    const steps = [makeStep("STEP_OUTPUT")];
    const result = aggregateUsageForStep("STEP_OUTPUT", steps, []);
    expect(result).toBeNull();
  });

  test("attribution 缺失（unattributed usage-delta）→ 不命中、跳过", () => {
    const steps = [makeStep("STEP_OUTPUT")];
    const items: TokenUsageSnapshot[] = [
      {
        turnId: "T1",
        usage: { input: 1, output: 1, total: 2 },
        cumulative: { input: 1, output: 1, total: 2 },
        accuracy: "estimated",
        updatedAt: 0,
      },
    ];
    const result = aggregateUsageForStep("STEP_OUTPUT", steps, items);
    expect(result).toBeNull();
  });
});

describe("pickMessageTokenUsage", () => {
  function makeMessage(opts: Partial<AssistantMessage> = {}): AssistantMessage {
    return {
      id: "M1",
      role: "assistant",
      content: "",
      createdAt: 0,
      ...opts,
    };
  }

  test("归档优先：message.tokenUsage 存在则直接返回（含 terminalKind）", () => {
    const archived = {
      cumulative: { input: 100, output: 200, total: 300 },
      items: [],
      terminalKind: "completed" as const,
    };
    const msg = makeMessage({ turnId: "T1", tokenUsage: archived });
    const result = pickMessageTokenUsage(msg, null, "T1");
    expect(result).toBe(archived);
  });

  test("无归档 + 当前 active turn 命中 → 用 live snapshot（不带 terminalKind）", () => {
    const live: TurnTokenUsage = {
      turnId: "T1",
      cumulative: { input: 50, output: 80, total: 130 },
      items: [],
      updatedAt: 0,
    };
    const msg = makeMessage({ turnId: "T1" });
    const result = pickMessageTokenUsage(msg, live, "T1");
    expect(result).toEqual({ cumulative: live.cumulative, items: live.items });
    expect(result).not.toHaveProperty("terminalKind");
  });

  test("turnId 不匹配 → null（避免把别的 turn 用量串到本 message）", () => {
    const live: TurnTokenUsage = {
      turnId: "T2",
      cumulative: { input: 1, output: 1, total: 2 },
      items: [],
      updatedAt: 0,
    };
    const msg = makeMessage({ turnId: "T1" });
    const result = pickMessageTokenUsage(msg, live, "T1");
    expect(result).toBeNull();
  });

  test("activeTurnId 为 null → 不返回 live（防御）", () => {
    const live: TurnTokenUsage = {
      turnId: "T1",
      cumulative: { input: 1, output: 1, total: 2 },
      items: [],
      updatedAt: 0,
    };
    const msg = makeMessage({ turnId: "T1" });
    const result = pickMessageTokenUsage(msg, live, null);
    expect(result).toBeNull();
  });
});

describe("formatTokenInline", () => {
  test("小数字直接展示（输入 / 输出 tokens）", () => {
    expect(formatTokenInline(12, 34)).toBe("输入 12 · 输出 34 tokens");
  });

  test("大数字使用千分位（zh-CN locale）", () => {
    expect(formatTokenInline(1234, 56789)).toBe("输入 1,234 · 输出 56,789 tokens");
  });
});

describe("isApproximateTokenUsage", () => {
  test("live usage with estimated attribution is approximate", () => {
    expect(
      isApproximateTokenUsage({
        cumulative: { input: 100, output: 20, total: 120 },
        items: [makeUsageItem({ attrId: "LLM_A", parentId: "STEP_1", input: 100, output: 20 })],
      }),
    ).toBe(false);
    expect(
      isApproximateTokenUsage({
        cumulative: { input: 100, output: 20, total: 120 },
        items: [
          {
            ...makeUsageItem({ attrId: "LLM_A", parentId: "STEP_1", input: 100, output: 20 }),
            accuracy: "estimated",
          },
        ],
      }),
    ).toBe(true);
  });

  test("terminal estimated snapshots stay approximate after archive", () => {
    expect(
      isApproximateTokenUsage({
        cumulative: { input: 50, output: 10, total: 60 },
        items: [
          {
            ...makeUsageItem({ attrId: "LLM_A", parentId: "STEP_1", input: 50, output: 10 }),
            terminal: "cancelled",
            accuracy: "estimated",
          },
        ],
        terminalKind: "cancelled",
      }),
    ).toBe(true);
  });
});

describe("isApproximateUsageForStep", () => {
  test("marks parent step approximate when any matched subtree item is estimated", () => {
    const steps = [makeStep("PHASE_EXEC"), makeStep("TOOL_LOOP_1", "PHASE_EXEC")];
    const items = [
      {
        ...makeUsageItem({ attrId: "LLM_A", parentId: "TOOL_LOOP_1", input: 10, output: 20 }),
        accuracy: "estimated" as const,
      },
    ];
    expect(isApproximateUsageForStep("PHASE_EXEC", steps, items)).toBe(true);
    expect(isApproximateUsageForStep("TOOL_LOOP_1", steps, items)).toBe(true);
  });
});

describe("terminalKindBadge", () => {
  test("cancelled", () => {
    expect(terminalKindBadge("cancelled")).toBe("（已取消）");
  });

  test("failed", () => {
    expect(terminalKindBadge("failed")).toBe("（失败）");
  });

  test("completed → 空串（不显示徽标）", () => {
    expect(terminalKindBadge("completed")).toBe("");
  });

  test("undefined → 空串", () => {
    expect(terminalKindBadge(undefined)).toBe("");
  });
});
