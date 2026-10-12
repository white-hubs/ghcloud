import { describe, expect, test } from "bun:test";

import { resolveShelfSkillDescription, resolveShelfSkillDisplayName } from "./skill-shelf-display-name";

describe("resolveShelfSkillDisplayName", () => {
  test("prefers library Chinese displayName over shelf code-like displayName", () => {
    expect(
      resolveShelfSkillDisplayName({ targetId: "html-output", displayName: "html-output" }, { displayName: "报告输出", tier: "system" }),
    ).toBe("报告输出");
  });

  test("falls back to system builtin profile when library lookup misses", () => {
    expect(resolveShelfSkillDisplayName({ targetId: "model-interact", displayName: "model-interact" })).toBe("模型交互");
  });

  test("falls back to static display name for html-output", () => {
    expect(resolveShelfSkillDisplayName({ targetId: "html-output", displayName: "html-output" })).toBe("报告输出");
  });

  test("keeps non-code shelf displayName when library has no better name", () => {
    expect(resolveShelfSkillDisplayName({ targetId: "skl_custom", displayName: "我的自定义技能" })).toBe("我的自定义技能");
  });
});

describe("resolveShelfSkillDescription", () => {
  test("prefers library description", () => {
    expect(resolveShelfSkillDescription({ targetId: "html-output" }, { description: "生成完整报告" })).toBe("生成完整报告");
  });
});
