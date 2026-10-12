import type { ReasoningStep } from "@cube-ai/agent-sdk-client-vue";
import { describe, expect, test } from "bun:test";

import {
  buildThinkingFeedLines,
  buildThinkingNarration,
  buildThinkingSteps,
  COMPACT_THINKING_LABEL_MIN_HOLD_MS,
  extractLatestCompletedHeading,
  extractLatestCompletedSentence,
  holdThinkingLabel,
  pickActiveReasoningStep,
  resolveAssistantThinkingRenderMode,
  resolveThinkingDescriptiveLabel,
  resolveThinkingPhaseLabel,
  resolveThinkingSummaryLabel,
  resolveThinkingToolLabel,
  stripLightThinkingMarkdown,
} from "./assistant-thinking-mode";

function step(overrides: Partial<ReasoningStep> = {}): ReasoningStep {
  return {
    stepId: "step-1",
    kind: "lifecycle",
    label: "处理中",
    startTime: 0,
    text: "",
    ...overrides,
  };
}

describe("resolveAssistantThinkingRenderMode", () => {
  test("defaults to steps when nothing is configured", () => {
    expect(resolveAssistantThinkingRenderMode({})).toBe("steps");
  });

  test("accepts steps, prose and feed as explicit overrides", () => {
    expect(resolveAssistantThinkingRenderMode({ queryValue: "steps" })).toBe("steps");
    expect(resolveAssistantThinkingRenderMode({ queryValue: "prose" })).toBe("prose");
    expect(resolveAssistantThinkingRenderMode({ queryValue: "feed" })).toBe("feed");
  });

  test("accepts descriptive as an explicit override", () => {
    expect(resolveAssistantThinkingRenderMode({ queryValue: "descriptive" })).toBe("descriptive");
  });

  test("query value wins over stored and env values", () => {
    expect(
      resolveAssistantThinkingRenderMode({
        queryValue: "detailed",
        storedValue: "silent",
        envValue: "silent",
      }),
    ).toBe("detailed");
  });

  test("stored value wins over env value when query is absent", () => {
    expect(
      resolveAssistantThinkingRenderMode({
        storedValue: "silent",
        envValue: "detailed",
      }),
    ).toBe("silent");
  });

  test("falls back to env value when query and stored are absent", () => {
    expect(resolveAssistantThinkingRenderMode({ envValue: "detailed" })).toBe("detailed");
  });

  test("invalid query value is ignored and falls through to stored value", () => {
    expect(
      resolveAssistantThinkingRenderMode({
        queryValue: "verbose",
        storedValue: "silent",
      }),
    ).toBe("silent");
  });

  test("invalid stored and env values fall back to default", () => {
    expect(
      resolveAssistantThinkingRenderMode({
        storedValue: "nonsense",
        envValue: "also-nonsense",
      }),
    ).toBe("steps");
  });
});

describe("pickActiveReasoningStep", () => {
  test("returns null when there are no steps", () => {
    expect(pickActiveReasoningStep([])).toBeNull();
  });

  test("returns null when all steps are finished", () => {
    const steps = [step({ stepId: "a", ok: true }), step({ stepId: "b", ok: false })];
    expect(pickActiveReasoningStep(steps)).toBeNull();
  });

  test("returns the only in-progress step", () => {
    const target = step({ stepId: "a", ok: undefined });
    expect(pickActiveReasoningStep([step({ stepId: "z", ok: true }), target])).toBe(target);
  });

  test("returns the most recently started in-progress step when several are active", () => {
    const earlier = step({ stepId: "a", kind: "lifecycle", ok: undefined });
    const latest = step({ stepId: "b", kind: "tool-call", ok: undefined });
    expect(pickActiveReasoningStep([earlier, latest])).toBe(latest);
  });
});

describe("resolveThinkingPhaseLabel", () => {
  test("labels a turnStart lifecycle step as generic processing", () => {
    expect(resolveThinkingPhaseLabel(step({ kind: "lifecycle", point: "turnStart" }))).toBe("正在处理");
  });

  test("labels a turnStop lifecycle step as wrapping up", () => {
    expect(resolveThinkingPhaseLabel(step({ kind: "lifecycle", point: "turnStop" }))).toBe("正在整理结果");
  });

  test("labels a model-reasoning step as thinking", () => {
    expect(resolveThinkingPhaseLabel(step({ kind: "model-reasoning", text: "streaming raw thought that must not leak" }))).toBe("正在思考");
  });

  test("labels a tool-loop step as generic processing", () => {
    expect(resolveThinkingPhaseLabel(step({ kind: "tool-loop" }))).toBe("正在处理");
  });

  test("labels a knowledge-retrieval tool-call via meta.activity", () => {
    expect(
      resolveThinkingPhaseLabel(
        step({
          kind: "tool-call",
          toolName: "platform.knowledge.query",
          label: "调用 platform.knowledge.query",
          meta: { activity: "knowledge-retrieval" },
        }),
      ),
    ).toBe("知识库检索");
  });

  test("labels a web-search tool-call via meta.activity", () => {
    expect(
      resolveThinkingPhaseLabel(
        step({
          kind: "tool-call",
          toolName: "mcp.web-search.query",
          label: "调用 mcp.web-search.query",
          meta: { activity: "web-search" },
        }),
      ),
    ).toBe("正在搜索网页");
  });

  test("labels a skill-load tool-call via meta.activity", () => {
    expect(
      resolveThinkingPhaseLabel(
        step({
          kind: "tool-call",
          toolName: "runtime.skill.refs",
          label: "调用 runtime.skill.refs",
          meta: { activity: "skill-load" },
        }),
      ),
    ).toBe("技能引用");
  });

  test("maps an unrecognized tool-call to a fuzzy Chinese label (never the streaming tool output text or raw name)", () => {
    expect(
      resolveThinkingPhaseLabel(
        step({ kind: "tool-call", toolName: "image.generate", label: "调用 image.generate", text: "raw tool output must not leak" }),
      ),
    ).toBe("生成内容");
  });

  test("recovers a Chinese label via the exact table when meta.activity is absent (historical / old engine events)", () => {
    expect(
      resolveThinkingPhaseLabel(step({ kind: "tool-call", toolName: "platform.knowledge.query", label: "调用 platform.knowledge.query" })),
    ).toBe("知识库检索");
  });
});

describe("resolveThinkingDescriptiveLabel", () => {
  test("includes the search query for a knowledge-retrieval tool-call (args arrive atomically, safe to show)", () => {
    expect(
      resolveThinkingDescriptiveLabel(
        step({
          kind: "tool-call",
          toolName: "platform.knowledge.query",
          label: "调用 platform.knowledge.query",
          meta: { activity: "knowledge-retrieval" },
          args: { query: "安全规范", kbIds: ["kb-1"] },
        }),
      ),
    ).toBe("知识库检索：安全规范");
  });

  test("falls back to the generic knowledge-retrieval label when args has no query yet", () => {
    expect(
      resolveThinkingDescriptiveLabel(
        step({
          kind: "tool-call",
          toolName: "platform.knowledge.query",
          label: "调用 platform.knowledge.query",
          meta: { activity: "knowledge-retrieval" },
          args: {},
        }),
      ),
    ).toBe("知识库检索");
  });

  test("includes the search query for a web-search tool-call", () => {
    expect(
      resolveThinkingDescriptiveLabel(
        step({
          kind: "tool-call",
          toolName: "mcp.web-search.query",
          label: "调用 mcp.web-search.query",
          meta: { activity: "web-search" },
          args: { query: "2024 安全规范" },
        }),
      ),
    ).toBe("网页搜索：2024 安全规范");
  });

  test("delegates to the compact phase label when model-reasoning text has no completed heading", () => {
    expect(resolveThinkingDescriptiveLabel(step({ kind: "model-reasoning", text: "streaming raw thought that must not leak" }))).toBe(
      "正在思考",
    );
  });

  test("surfaces the latest completed markdown heading from model-reasoning free text", () => {
    expect(
      resolveThinkingDescriptiveLabel(
        step({ kind: "model-reasoning", text: '### 1. 全员安全培训完成率分布（饼图）\n```echarts\n{ "title":' }),
      ),
    ).toBe("正在生成：1. 全员安全培训完成率分布（饼图）");
  });

  test("surfaces the latest completed markdown heading from tool-loop free text", () => {
    expect(resolveThinkingDescriptiveLabel(step({ kind: "tool-loop", text: "### 2. 近半年隐患治理效能趋势\nsome json body" }))).toBe(
      "正在生成：2. 近半年隐患治理效能趋势",
    );
  });

  test("delegates to the compact phase label (fuzzy Chinese) for unrecognized tool-calls", () => {
    expect(resolveThinkingDescriptiveLabel(step({ kind: "tool-call", toolName: "image.generate", label: "调用 image.generate" }))).toBe(
      "生成内容",
    );
  });
});

describe("extractLatestCompletedHeading", () => {
  test("returns null for empty text", () => {
    expect(extractLatestCompletedHeading("")).toBeNull();
  });

  test("returns null when there are no heading lines", () => {
    expect(extractLatestCompletedHeading("some plain text\nno headings here")).toBeNull();
  });

  test("extracts a completed heading followed by more (incomplete) text", () => {
    expect(extractLatestCompletedHeading("### Chart 1\nsome body text")).toBe("Chart 1");
  });

  test("extracts a completed heading that is itself newline-terminated", () => {
    expect(extractLatestCompletedHeading("### Chart 1\n")).toBe("Chart 1");
  });

  test("does not surface a heading that is still mid-stream (no trailing newline yet)", () => {
    expect(extractLatestCompletedHeading("### Chart 1")).toBeNull();
  });

  test("returns the most recently completed heading when several exist", () => {
    expect(extractLatestCompletedHeading("### Chart 1\nbody\n## Chart 2\nmore body")).toBe("Chart 2");
  });

  test("matches any heading level from H1 to H6", () => {
    expect(extractLatestCompletedHeading("###### Deep heading\n")).toBe("Deep heading");
  });

  test("does not match a hash without a following space (not a heading)", () => {
    expect(extractLatestCompletedHeading("#nospace\nbody")).toBeNull();
  });

  test("trims surrounding whitespace from the heading text", () => {
    expect(extractLatestCompletedHeading("###   Spaced heading   \nbody")).toBe("Spaced heading");
  });
});

describe("holdThinkingLabel", () => {
  const MIN_HOLD_MS = COMPACT_THINKING_LABEL_MIN_HOLD_MS;

  test("stays null when there is neither a previous nor a candidate label", () => {
    expect(holdThinkingLabel(null, null, 1000, MIN_HOLD_MS)).toBeNull();
  });

  test("adopts the first candidate immediately with no artificial delay", () => {
    expect(holdThinkingLabel(null, "正在思考", 1000, MIN_HOLD_MS)).toEqual({ label: "正在思考", since: 1000 });
  });

  test("keeps the original since timestamp when the candidate repeats unchanged", () => {
    const previous = { label: "正在思考", since: 1000 };
    expect(holdThinkingLabel(previous, "正在思考", 1800, MIN_HOLD_MS)).toEqual({ label: "正在思考", since: 1000 });
  });

  test("keeps showing the previous label when there is no new candidate this tick", () => {
    const previous = { label: "正在思考", since: 1000 };
    expect(holdThinkingLabel(previous, null, 1800, MIN_HOLD_MS)).toEqual(previous);
  });

  test("suppresses a label switch that arrives before the minimum hold time elapses", () => {
    const previous = { label: "正在思考", since: 1000 };
    expect(holdThinkingLabel(previous, "知识库检索", 1300, MIN_HOLD_MS)).toEqual({ label: "正在思考", since: 1000 });
  });

  test("switches once the minimum hold time has elapsed, resetting since to now", () => {
    const previous = { label: "正在思考", since: 1000 };
    expect(holdThinkingLabel(previous, "知识库检索", 1600, MIN_HOLD_MS)).toEqual({ label: "知识库检索", since: 1600 });
  });

  test("switches exactly at the minimum hold boundary", () => {
    const previous = { label: "正在思考", since: 1000 };
    expect(holdThinkingLabel(previous, "知识库检索", 1500, MIN_HOLD_MS)).toEqual({ label: "知识库检索", since: 1500 });
  });
});

describe("stripLightThinkingMarkdown", () => {
  test("strips leading heading markers on every line", () => {
    expect(stripLightThinkingMarkdown("# 标题\n正文\n### 三级标题")).toBe("标题\n正文\n三级标题");
  });

  test("unwraps bold and inline code without touching the content", () => {
    expect(stripLightThinkingMarkdown("先看 **关键指标** 与 `count` 字段")).toBe("先看 关键指标 与 count 字段");
  });

  test("leaves plain text untouched", () => {
    expect(stripLightThinkingMarkdown("这是一段没有任何标记的思考文本")).toBe("这是一段没有任何标记的思考文本");
  });
});

describe("extractLatestCompletedSentence", () => {
  test("returns null when no sentence has been completed yet", () => {
    expect(extractLatestCompletedSentence("正在分析这份数据的分布情况")).toBeNull();
  });

  test("returns the last sentence completed by a full-width period", () => {
    expect(extractLatestCompletedSentence("先梳理指标。再看趋势。还差")).toBe("再看趋势");
  });

  test("treats a newline as a sentence boundary", () => {
    expect(extractLatestCompletedSentence("第一步：读取数据\n继续写")).toBe("第一步：读取数据");
  });

  test("strips light markdown from the extracted sentence", () => {
    expect(extractLatestCompletedSentence("看 **命中率** 指标。下一步")).toBe("看 命中率 指标");
  });

  test("truncates an over-long sentence with an ellipsis", () => {
    const long = `${"数".repeat(60)}。尾巴`;
    const result = extractLatestCompletedSentence(long, 10);
    expect(result).not.toBeNull();
    expect(result?.endsWith("…")).toBe(true);
    expect([...(result ?? "")].length).toBe(10);
  });
});

describe("resolveThinkingSummaryLabel", () => {
  test("prefers the latest completed sentence over a heading for thinking text", () => {
    expect(resolveThinkingSummaryLabel(step({ kind: "model-reasoning", text: "### 标题\n我先确认数据口径是否一致。接着" }))).toBe(
      "我先确认数据口径是否一致",
    );
  });

  test("falls back to a completed heading when no sentence is complete yet", () => {
    expect(resolveThinkingSummaryLabel(step({ kind: "model-reasoning", text: "### 全员安全培训完成率分布\n" }))).toBe(
      "正在生成：全员安全培训完成率分布",
    );
  });

  test("falls back to the compact phase label when neither sentence nor heading is complete", () => {
    expect(resolveThinkingSummaryLabel(step({ kind: "model-reasoning", text: "仍在流式输出的半截思考" }))).toBe("正在思考");
  });

  test("keeps the retrieval query for knowledge-retrieval tool-calls", () => {
    expect(
      resolveThinkingSummaryLabel(
        step({
          kind: "tool-call",
          toolName: "platform.knowledge.query",
          label: "调用 platform.knowledge.query",
          meta: { activity: "knowledge-retrieval" },
          args: { query: "安全规范" },
        }),
      ),
    ).toBe("知识库检索：安全规范");
  });
});

describe("buildThinkingNarration", () => {
  test("returns an empty string when there is nothing to narrate", () => {
    expect(buildThinkingNarration([])).toBe("");
  });

  test("flattens model reasoning and tool calls into one blank-line-separated narrative", () => {
    const narration = buildThinkingNarration([
      step({ stepId: "a", kind: "model-reasoning", text: "先看看用户想要什么。" }),
      step({
        stepId: "b",
        kind: "tool-call",
        toolName: "platform.knowledge.query",
        label: "调用 platform.knowledge.query",
        meta: { activity: "knowledge-retrieval" },
        args: { query: "安全规范" },
        ok: true,
        output: { hits: [{ id: 1 }, { id: 2 }, { id: 3 }] },
      }),
      step({ stepId: "c", kind: "model-reasoning", text: "现在整理成图表。" }),
    ]);
    expect(narration).toBe("先看看用户想要什么。\n\n检索知识库：安全规范，命中 3 条\n\n现在整理成图表。");
  });

  test("marks a failed tool-call in the narrative without leaking raw output", () => {
    const narration = buildThinkingNarration([
      step({
        stepId: "a",
        kind: "tool-call",
        toolName: "mcp.web-search.query",
        label: "调用 mcp.web-search.query",
        meta: { activity: "web-search" },
        args: { query: "2024 规范" },
        ok: false,
        text: "raw failure payload must not leak",
      }),
    ]);
    expect(narration).toBe("联网搜索：2024 规范（未成功）");
  });

  test("strips markdown from model reasoning text", () => {
    expect(buildThinkingNarration([step({ kind: "model-reasoning", text: "## 计划\n先做 **A**" })])).toBe("计划\n先做 A");
  });
});

describe("buildThinkingFeedLines", () => {
  test("returns an empty list when there are no steps", () => {
    expect(buildThinkingFeedLines([])).toEqual([]);
  });

  test("collapses consecutive duplicate labels into a single line", () => {
    const lines = buildThinkingFeedLines([
      step({ stepId: "a", kind: "model-reasoning", text: "没有标题的半截思考" }),
      step({ stepId: "b", kind: "model-reasoning", text: "仍然没有标题" }),
    ]);
    expect(lines).toEqual(["正在思考"]);
  });

  test("emits a status line per distinct activity in arrival order", () => {
    const lines = buildThinkingFeedLines([
      step({ stepId: "a", kind: "model-reasoning", text: "先想一下" }),
      step({
        stepId: "b",
        kind: "tool-call",
        toolName: "platform.knowledge.query",
        label: "调用 platform.knowledge.query",
        meta: { activity: "knowledge-retrieval" },
        args: { query: "安全规范" },
      }),
      step({ stepId: "c", kind: "model-reasoning", text: "### 生成图表\n" }),
      step({ stepId: "d", kind: "lifecycle", point: "turnStop" }),
    ]);
    expect(lines).toEqual(["正在思考", "知识库检索：安全规范", "正在生成：生成图表", "正在整理结果"]);
  });
});

describe("resolveThinkingToolLabel", () => {
  test("maps web-search / knowledge-retrieval / skill-load to noun labels", () => {
    expect(
      resolveThinkingToolLabel(step({ kind: "tool-call", toolName: "mcp.web-search.query", label: "x", meta: { activity: "web-search" } })),
    ).toBe("联网搜索");
    expect(
      resolveThinkingToolLabel(
        step({ kind: "tool-call", toolName: "platform.knowledge.query", label: "x", meta: { activity: "knowledge-retrieval" } }),
      ),
    ).toBe("知识库检索");
    expect(
      resolveThinkingToolLabel(step({ kind: "tool-call", toolName: "runtime.skill.refs", label: "x", meta: { activity: "skill-load" } })),
    ).toBe("技能引用");
  });

  test("maps a generic tool-call to a Chinese label (fuzzy) instead of the raw tool name", () => {
    expect(resolveThinkingToolLabel(step({ kind: "tool-call", toolName: "image.generate", label: "调用 image.generate" }))).toBe(
      "生成内容",
    );
  });

  test("maps a known MCP tool to its exact Chinese label instead of the raw tool name", () => {
    expect(
      resolveThinkingToolLabel(
        step({ kind: "tool-call", toolName: "mcp.biz-ontology.search_ontology", label: "调用 mcp.biz-ontology.search_ontology" }),
      ),
    ).toBe("检索本体");
  });

  test("lets the exact table win over the built-in activity (fetch_page is not swallowed by web-search)", () => {
    expect(
      resolveThinkingToolLabel(
        step({ kind: "tool-call", toolName: "mcp.web-search.fetch_page", label: "x", meta: { activity: "web-search" } }),
      ),
    ).toBe("抓取网页");
  });

  test("falls back to the built-in activity name when the tool is not in the exact table", () => {
    expect(
      resolveThinkingToolLabel(step({ kind: "tool-call", toolName: "mcp.web-search.query", label: "x", meta: { activity: "web-search" } })),
    ).toBe("联网搜索");
  });
});

describe("buildThinkingSteps", () => {
  test("returns an empty timeline when there are no steps", () => {
    expect(buildThinkingSteps([])).toEqual([]);
  });

  test("flattens a tool-loop round (with its tool-call) and a top-level reasoning into flat steps (no nesting)", () => {
    const timeline = buildThinkingSteps([
      step({ stepId: "s1", kind: "tool-loop", text: "我先查一下明天上午的天气。", ok: true, startTime: 0, endTime: 100 }),
      step({
        stepId: "t1",
        parentStepId: "s1",
        kind: "tool-call",
        toolName: "mcp.web-search.query",
        label: "调用 mcp.web-search.query",
        meta: { activity: "web-search" },
        ok: true,
      }),
      step({ stepId: "s2", kind: "model-reasoning", text: "明天上午多云 26°C。", ok: true }),
    ]);
    expect(timeline).toHaveLength(2);
    expect(timeline[0]?.narration).toBe("我先查一下明天上午的天气。");
    expect(timeline[0]?.tools).toEqual([{ key: "t1", label: "联网搜索", activity: "web-search", ok: true }]);
    expect(timeline[0]?.inProgress).toBe(false);
    expect(timeline[0]?.endTime).toBe(100);
    expect(timeline[1]?.narration).toBe("明天上午多云 26°C。");
    expect(timeline[1]?.tools).toEqual([]);
  });

  test("counts total tools across steps and skips empty lifecycle steps", () => {
    const timeline = buildThinkingSteps([
      step({ stepId: "start", kind: "lifecycle", point: "turnStart", text: "" }),
      step({ stepId: "s1", kind: "tool-loop", text: "查天气", ok: true }),
      step({
        stepId: "t1",
        parentStepId: "s1",
        kind: "tool-call",
        toolName: "mcp.web-search.query",
        label: "x",
        meta: { activity: "web-search" },
        ok: true,
      }),
      step({ stepId: "s2", kind: "tool-loop", text: "查日程", ok: true }),
      step({ stepId: "t2", parentStepId: "s2", kind: "tool-call", toolName: "calendar.query", label: "调用 calendar.query", ok: true }),
    ]);
    expect(timeline).toHaveLength(2);
    const toolCount = timeline.reduce((sum, s) => sum + s.tools.length, 0);
    expect(toolCount).toBe(2);
    expect(timeline[1]?.tools[0]).toEqual({ key: "t2", label: "检索数据", activity: "tool", ok: true });
  });

  test("flattens the real mapper tree lifecycle→tool-loop→tool-call (regression: never 0 步 when a tool ran)", () => {
    // mapper 实发形状：唯一顶层是 lifecycle(turnStart)，各轮 tool-loop 的 parent 指向它，工具挂在轮次下。
    // 旧实现只看顶层 → 顶层只剩空 lifecycle → 拍成 0 步；新实现须穿透容器。
    const timeline = buildThinkingSteps([
      step({ stepId: "L", kind: "lifecycle", point: "turnStart", text: "", startTime: 0 }),
      step({ stepId: "T1", parentStepId: "L", kind: "tool-loop", text: "", ok: true, startTime: 10, endTime: 90 }),
      step({
        stepId: "tool:call_1",
        parentStepId: "T1",
        kind: "tool-call",
        toolName: "mcp.web-search.web_search",
        label: "调用 mcp.web-search.web_search",
        meta: { activity: "web-search" },
        ok: true,
      }),
      step({ stepId: "T2", parentStepId: "L", kind: "tool-loop", text: "", ok: true, startTime: 95, endTime: 140 }),
    ]);
    expect(timeline).toHaveLength(1);
    expect(timeline[0]?.key).toBe("T1");
    expect(timeline[0]?.narration).toBe("");
    expect(timeline[0]?.tools).toEqual([{ key: "tool:call_1", label: "联网搜索", activity: "web-search", ok: true }]);
  });

  test("folds a model-reasoning child into its parent tool-loop's narration (not a separate step)", () => {
    const timeline = buildThinkingSteps([
      step({ stepId: "L", kind: "lifecycle", point: "turnStart", text: "" }),
      step({ stepId: "T1", parentStepId: "L", kind: "tool-loop", text: "", ok: true }),
      step({ stepId: "r1", parentStepId: "T1", kind: "model-reasoning", text: "先查网页，再汇总结论。", ok: true }),
      step({
        stepId: "tool:call_1",
        parentStepId: "T1",
        kind: "tool-call",
        toolName: "mcp.web-search.web_search",
        label: "x",
        meta: { activity: "web-search" },
        ok: true,
      }),
    ]);
    expect(timeline).toHaveLength(1);
    expect(timeline[0]?.narration).toBe("先查网页，再汇总结论。");
    expect(timeline[0]?.tools).toHaveLength(1);
  });

  test("strips light markdown from step narration", () => {
    const timeline = buildThinkingSteps([step({ stepId: "s1", kind: "model-reasoning", text: "## 计划\n先做 **A**", ok: true })]);
    expect(timeline[0]?.narration).toBe("计划\n先做 A");
  });

  test("renders a standalone top-level tool-call as its own step with an in-progress flag", () => {
    const timeline = buildThinkingSteps([
      step({ stepId: "x", kind: "tool-call", toolName: "image.generate", label: "调用 image.generate", ok: undefined }),
    ]);
    expect(timeline).toHaveLength(1);
    expect(timeline[0]?.narration).toBe("");
    expect(timeline[0]?.inProgress).toBe(true);
    expect(timeline[0]?.tools).toEqual([{ key: "x", label: "生成内容", activity: "tool", ok: undefined }]);
  });

  test("places an orphan prefetch tool-call before later tool-loop rounds by startTime (not at the end)", () => {
    // 生产形状：接地预取 tool-call 在 lifecycle/tool-loop 之前到达，parent 为空或指向 lifecycle，
    // 旧实现把未认领工具追加到末尾 →「读取本体定义」错成最后一步。
    const timeline = buildThinkingSteps([
      step({ stepId: "L", kind: "lifecycle", point: "turnStart", text: "", startTime: 0 }),
      step({
        stepId: "prefetch:read_ontology",
        parentStepId: "L",
        kind: "tool-call",
        toolName: "mcp.biz-ontology.read_ontology",
        label: "读取本体定义",
        ok: true,
        startTime: 1,
        endTime: 5,
      }),
      step({ stepId: "T1", parentStepId: "L", kind: "tool-loop", text: "先搜技能。", ok: true, startTime: 10, endTime: 50 }),
      step({
        stepId: "tool:search_skills",
        parentStepId: "T1",
        kind: "tool-call",
        toolName: "search_skills",
        label: "调用 search_skills",
        ok: true,
        startTime: 12,
        endTime: 40,
      }),
      step({
        stepId: "T2",
        parentStepId: "L",
        kind: "tool-loop",
        text: "根据结果整理回答。",
        ok: true,
        startTime: 20,
        endTime: 80,
      }),
    ]);
    expect(timeline).toHaveLength(3);
    expect(timeline[0]?.key).toBe("prefetch:read_ontology");
    expect(timeline[0]?.tools.map((t) => t.key)).toEqual(["prefetch:read_ontology"]);
    expect(timeline[1]?.key).toBe("T1");
    expect(timeline[1]?.tools.map((t) => t.key)).toEqual(["tool:search_skills"]);
    expect(timeline[2]?.key).toBe("T2");
  });
});
