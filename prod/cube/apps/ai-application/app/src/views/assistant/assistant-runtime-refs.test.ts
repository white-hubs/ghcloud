import { describe, expect, test } from "bun:test";

import { mergeComposerAndBoundKnowledgeRefs } from "./assistant-runtime-refs";

describe("mergeComposerAndBoundKnowledgeRefs", () => {
  test("merges bound knowledge when composer has no kb", () => {
    const refs = mergeComposerAndBoundKnowledgeRefs([], [{ kbId: "kb-bound", displayName: "绑定库" }]);
    expect(refs).toEqual({
      knowledgeBases: [{ kbId: "kb-bound", displayName: "绑定库" }],
    });
  });

  test("dedupes composer kb over bound", () => {
    const refs = mergeComposerAndBoundKnowledgeRefs(
      [{ type: "kb", id: "kb-1", label: "手动", description: "" }],
      [
        { kbId: "kb-1", displayName: "绑定同名" },
        { kbId: "kb-2", displayName: "另一库" },
      ],
    );
    expect(refs?.knowledgeBases).toEqual([
      { kbId: "kb-1", displayName: "手动" },
      { kbId: "kb-2", displayName: "另一库" },
    ]);
  });

  test("keeps skills and returns undefined when empty", () => {
    expect(mergeComposerAndBoundKnowledgeRefs([], [])).toBeUndefined();
    const withSkill = mergeComposerAndBoundKnowledgeRefs([{ type: "skill", id: "skl_1", label: "技能A", description: "" }], []);
    expect(withSkill).toEqual({
      userSkills: [{ skillId: "skl_1", displayName: "技能A" }],
    });
  });
});
