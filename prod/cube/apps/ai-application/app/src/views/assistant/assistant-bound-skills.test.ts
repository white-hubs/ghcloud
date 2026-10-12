import { describe, expect, test } from "bun:test";

import {
  ensureBoundSkillsSelected,
  filterComposerReferenceTokens,
  mergeComposerBoundKnowledgeAndSkillRuntimeRefs,
  resolveBoundSkillRefsFromContent,
  syncComposerBoundSkillSelections,
} from "./assistant-bound-skills";

describe("assistant bound skills", () => {
  test("resolveBoundSkillRefsFromContent filters internal defaults", () => {
    expect(
      resolveBoundSkillRefsFromContent(
        { skillRefs: ["skl_a", "default-reasoning", "html-output"] },
        new Map([["html-output", "报告输出"]]),
      ),
    ).toEqual([
      { skillId: "skl_a", displayName: "skl_a" },
      { skillId: "html-output", displayName: "报告输出" },
    ]);
  });

  test("merge puts deselected bound skills into disabledSkillIds", () => {
    const runtime = mergeComposerBoundKnowledgeAndSkillRuntimeRefs(
      [{ type: "skill", id: "skl_keep", label: "保留", description: "" }],
      [],
      [
        { skillId: "skl_keep", displayName: "保留" },
        { skillId: "skl_drop", displayName: "取消" },
      ],
    );
    expect(runtime).toEqual({
      disabledSkillIds: ["skl_drop"],
    });
  });

  test("merge sends non-bound selected skills as userSkills", () => {
    const runtime = mergeComposerBoundKnowledgeAndSkillRuntimeRefs(
      [
        { type: "skill", id: "skl_bound", label: "绑定", description: "" },
        { type: "skill", id: "skl_extra", label: "临时", description: "" },
      ],
      [],
      [{ skillId: "skl_bound", displayName: "绑定" }],
    );
    expect(runtime).toEqual({
      userSkills: [{ skillId: "skl_extra", displayName: "临时" }],
    });
  });

  test("ensureBoundSkillsSelected only adds missing bound skills", () => {
    const selected = ensureBoundSkillsSelected(
      [{ type: "skill", id: "skl_bound", label: "旧名", description: "x" }],
      [
        { skillId: "skl_bound", displayName: "绑定" },
        { skillId: "skl_new", displayName: "新绑定" },
      ],
    );
    expect(selected).toEqual([
      { type: "skill", id: "skl_bound", label: "旧名", description: "x" },
      { type: "skill", id: "skl_new", label: "新绑定", description: "智能体绑定" },
    ]);
  });

  test("ensureBoundSkillsSelected upgrades skl_* label when display name arrives", () => {
    expect(
      ensureBoundSkillsSelected(
        [{ type: "skill", id: "skl_1", label: "skl_1", description: "智能体绑定" }],
        [{ skillId: "skl_1", displayName: "专属图片生成服务" }],
      ),
    ).toEqual([{ type: "skill", id: "skl_1", label: "专属图片生成服务", description: "智能体绑定" }]);
  });

  test("filterComposerReferenceTokens hides skills already shown as chips", () => {
    expect(
      filterComposerReferenceTokens([
        { type: "skill", id: "skl_1", label: "A" },
        { type: "kb", id: "kb_1", label: "库" },
      ]),
    ).toEqual([{ type: "kb", id: "kb_1", label: "库" }]);
  });

  test("syncComposerBoundSkillSelections re-applies bound skills after empty draft restore", () => {
    expect(
      syncComposerBoundSkillSelections(
        [],
        [
          { skillId: "skl_a", displayName: "A" },
          { skillId: "skl_b", displayName: "B" },
        ],
      ),
    ).toEqual([
      { type: "skill", id: "skl_a", label: "A", description: "智能体绑定" },
      { type: "skill", id: "skl_b", label: "B", description: "智能体绑定" },
    ]);
  });

  test("syncComposerBoundSkillSelections drops stale bound selections", () => {
    expect(
      syncComposerBoundSkillSelections(
        [
          { type: "skill", id: "skl_old", label: "旧", description: "智能体绑定" },
          { type: "skill", id: "skl_manual", label: "手动", description: "" },
        ],
        [{ skillId: "skl_new", displayName: "新" }],
      ),
    ).toEqual([
      { type: "skill", id: "skl_manual", label: "手动", description: "" },
      { type: "skill", id: "skl_new", label: "新", description: "智能体绑定" },
    ]);
  });
});
