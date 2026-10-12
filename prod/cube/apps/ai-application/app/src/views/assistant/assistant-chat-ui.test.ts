import type { ReasoningStep } from "@cube-ai/agent-sdk-client-vue";
import { describe, expect, mock, test } from "bun:test";

import { COPY_NO_USER_AGENTS, referenceMenuHeadLabel, referenceMenuSearchPlaceholder } from "./assistant-chat-strings";
import {
  filterComposerReferences,
  isFreshAssistantSession,
  reasoningStepLabel,
  reasoningToolName,
  removeSessionIfFresh,
  warnNoUserAgents,
  findActiveReferenceTrigger,
  type AssistantComposerReference,
} from "./assistant-chat-ui";

function toolCallStep(overrides: Partial<ReasoningStep> = {}): ReasoningStep {
  return {
    stepId: "tool:1",
    kind: "tool-call",
    label: "调用 image.generate",
    toolName: "image.generate",
    startTime: 0,
    text: "",
    ...overrides,
  };
}

describe("isFreshAssistantSession", () => {
  test("empty messages are fresh", () => {
    expect(isFreshAssistantSession([])).toBe(true);
  });

  test("assistant placeholder without content is fresh", () => {
    expect(isFreshAssistantSession([{ role: "assistant", content: "" }])).toBe(true);
  });

  test("user message makes session not fresh", () => {
    expect(isFreshAssistantSession([{ role: "user", content: "hi" }])).toBe(false);
  });

  test("assistant reply makes session not fresh", () => {
    expect(isFreshAssistantSession([{ role: "assistant", content: "hello" }])).toBe(false);
  });
});

describe("removeSessionIfFresh", () => {
  test("removes fresh session and calls onRemoved", async () => {
    const removeSession = mock(async () => {});
    const onRemoved = mock(() => {});
    await removeSessionIfFresh({
      messages: [],
      sessionId: "sess_1",
      removeSession,
      onRemoved,
    });
    expect(removeSession).toHaveBeenCalledWith("sess_1");
    expect(onRemoved).toHaveBeenCalledWith("sess_1");
  });

  test("skips when session has user messages", async () => {
    const removeSession = mock(async () => {});
    await removeSessionIfFresh({
      messages: [{ role: "user", content: "hi" }],
      sessionId: "sess_1",
      removeSession,
    });
    expect(removeSession).not.toHaveBeenCalled();
  });
});

describe("reasoningToolName", () => {
  test("prefers the explicit toolName field", () => {
    expect(reasoningToolName(toolCallStep({ toolName: "platform.knowledge.query" }))).toBe("platform.knowledge.query");
  });

  test("falls back to stripping the 调用 prefix from label when toolName is missing", () => {
    const step = toolCallStep({ label: "调用 legacy.tool" });
    delete (step as { toolName?: string }).toolName;
    expect(reasoningToolName(step)).toBe("legacy.tool");
  });
});

describe("reasoningStepLabel", () => {
  test("maps the knowledge query tool to a friendly Chinese label", () => {
    expect(reasoningStepLabel(toolCallStep({ toolName: "platform.knowledge.query" }))).toBe("知识库检索");
  });

  test("maps the runtime skill refs tool to a friendly Chinese label", () => {
    expect(reasoningStepLabel(toolCallStep({ toolName: "runtime.skill.refs" }))).toBe("技能引用");
  });

  test("falls back to the raw step label for unrecognized tools", () => {
    expect(reasoningStepLabel(toolCallStep({ toolName: "image.generate", label: "调用 image.generate" }))).toBe("调用 image.generate");
  });
});

describe("findActiveReferenceTrigger", () => {
  test("typing @ opens knowledge-base reference menu with query after trigger", () => {
    const text = "你好 @应急";
    const trigger = findActiveReferenceTrigger(text, text.length);
    expect(trigger).toEqual({
      trigger: "@",
      menuType: "kb",
      start: 3,
      end: 6,
      query: "应急",
    });
  });

  test("typing / opens skill reference menu with query after trigger", () => {
    const text = "分析 /培训";
    const trigger = findActiveReferenceTrigger(text, text.length);
    expect(trigger).toEqual({
      trigger: "/",
      menuType: "skill",
      start: 3,
      end: 6,
      query: "培训",
    });
  });

  test("returns null when caret is not inside a reference trigger", () => {
    expect(findActiveReferenceTrigger("你好世界", 2)).toBeNull();
  });
});

const SAMPLE_REFERENCES: AssistantComposerReference[] = [
  { type: "kb", id: "kb-1", label: "应急预案", description: "知识库" },
  { type: "skill", id: "skill-1", label: "培训效果分析", description: "我的技能" },
];

describe("filterComposerReferences", () => {
  test("kb menu type excludes skills", () => {
    const filtered = filterComposerReferences(SAMPLE_REFERENCES, "", "kb");
    expect(filtered.map((item) => item.id)).toEqual(["kb-1"]);
  });

  test("skill menu type excludes knowledge bases", () => {
    const filtered = filterComposerReferences(SAMPLE_REFERENCES, "", "skill");
    expect(filtered.map((item) => item.id)).toEqual(["skill-1"]);
  });
});

describe("referenceMenuCopy", () => {
  test("kb menu copy targets knowledge bases", () => {
    expect(referenceMenuSearchPlaceholder("kb")).toBe("搜索知识库");
    expect(referenceMenuHeadLabel("kb")).toBe("选择知识库");
  });

  test("skill menu copy targets skills", () => {
    expect(referenceMenuSearchPlaceholder("skill")).toBe("搜索技能");
    expect(referenceMenuHeadLabel("skill")).toBe("选择技能");
  });
});

describe("warnNoUserAgents", () => {
  test("returns true when user has agents", () => {
    const warnings: string[] = [];
    expect(warnNoUserAgents(true, { warning: (text) => warnings.push(text) })).toBe(true);
    expect(warnings).toEqual([]);
  });

  test("warns and returns false when shelf is empty", () => {
    const warnings: string[] = [];
    expect(warnNoUserAgents(false, { warning: (text) => warnings.push(text) })).toBe(false);
    expect(warnings).toEqual([COPY_NO_USER_AGENTS]);
  });
});
