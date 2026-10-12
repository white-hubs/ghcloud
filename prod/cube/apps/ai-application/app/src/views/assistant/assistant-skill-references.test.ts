import type { ShelfEntryView } from "@cube-ai/contracts";
import { describe, expect, test } from "bun:test";

import { buildAssistantSkillReferencesFromShelf } from "./assistant-skill-references";

function skillShelfEntry(partial: Partial<ShelfEntryView> & Pick<ShelfEntryView, "targetId" | "source">): ShelfEntryView {
  return {
    id: `she_${partial.targetId}`,
    targetKind: "skill",
    runnableStatus: "runnable",
    enabled: true,
    pinVersionNo: null,
    effectiveVersionNo: 1,
    ...partial,
  };
}

describe("buildAssistantSkillReferencesFromShelf", () => {
  test("derives authored skill reference from shelf displayName without any detail fetch", () => {
    const refs = buildAssistantSkillReferencesFromShelf([
      skillShelfEntry({ targetId: "skl_mine", source: "authored", displayName: "统计今日报警" }),
    ]);
    expect(refs).toEqual([{ type: "skill", id: "skl_mine", label: "统计今日报警", description: "我的技能" }]);
  });

  test("labels library-installed skills as 技能库", () => {
    const refs = buildAssistantSkillReferencesFromShelf([skillShelfEntry({ targetId: "skl_lib", source: "ref", displayName: "联网搜索" })]);
    expect(refs).toEqual([{ type: "skill", id: "skl_lib", label: "联网搜索", description: "技能库" }]);
  });

  test("resolves system skill code displayName to Chinese profile name", () => {
    const refs = buildAssistantSkillReferencesFromShelf([
      skillShelfEntry({ targetId: "model-interact", source: "ref", displayName: "model-interact" }),
    ]);
    expect(refs).toEqual([{ type: "skill", id: "model-interact", label: "模型交互", description: "技能库" }]);
  });

  test("resolves html-output code via static fallback when library lookup missing", () => {
    const refs = buildAssistantSkillReferencesFromShelf([
      skillShelfEntry({ targetId: "html-output", source: "ref", displayName: "html-output" }),
    ]);
    expect(refs).toEqual([{ type: "skill", id: "html-output", label: "报告输出", description: "技能库" }]);
  });

  test("prefers library browse displayName over shelf code", () => {
    const libraryByRef = new Map([["html-output", { displayName: "报告输出", tier: "system" as const }]]);
    const refs = buildAssistantSkillReferencesFromShelf(
      [skillShelfEntry({ targetId: "html-output", source: "ref", displayName: "html-output" })],
      libraryByRef,
    );
    expect(refs[0]?.label).toBe("报告输出");
  });

  test("falls back to targetId when shelf carries no displayName", () => {
    const refs = buildAssistantSkillReferencesFromShelf([skillShelfEntry({ targetId: "skl_bare", source: "authored" })]);
    expect(refs).toEqual([{ type: "skill", id: "skl_bare", label: "skl_bare", description: "我的技能" }]);
  });

  test("excludes non-runnable and engine-internal skills", () => {
    const refs = buildAssistantSkillReferencesFromShelf([
      skillShelfEntry({ targetId: "skl_stale", source: "ref", displayName: "旧技能", runnableStatus: "unresolvable" }),
      skillShelfEntry({ targetId: "default-reasoning", source: "ref", displayName: "内置推理" }),
    ]);
    expect(refs).toEqual([]);
  });

  test("deduplicates repeated targetId and ignores non-skill entries", () => {
    const refs = buildAssistantSkillReferencesFromShelf([
      skillShelfEntry({ targetId: "skl_dup", source: "authored", displayName: "技能" }),
      skillShelfEntry({ targetId: "skl_dup", source: "ref", displayName: "技能副本" }),
      skillShelfEntry({ targetId: "agt_x", source: "authored", displayName: "智能体", targetKind: "agent" }),
    ]);
    expect(refs).toEqual([{ type: "skill", id: "skl_dup", label: "技能", description: "我的技能" }]);
  });
});
