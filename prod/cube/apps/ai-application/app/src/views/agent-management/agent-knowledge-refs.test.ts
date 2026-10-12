import { describe, expect, test } from "bun:test";

import { AGENT_KNOWLEDGE_TAG_PREFIX, buildTagsWithKnowledgeRefs, parseKnowledgeRefsFromTags } from "./agent-knowledge-refs";

describe("agent-knowledge-refs", () => {
  test("round-trips kbId and displayName via tags", () => {
    const tags = buildTagsWithKnowledgeRefs(
      ["keep-me", `${AGENT_KNOWLEDGE_TAG_PREFIX}stale`],
      [
        { kbId: "kb-1", displayName: "产品手册" },
        { kbId: "kb-2", displayName: "kb-2" },
      ],
    );
    expect(tags).toContain("keep-me");
    expect(tags.every((tag) => !tag.endsWith("stale"))).toBe(true);
    expect(parseKnowledgeRefsFromTags(tags)).toEqual([
      { kbId: "kb-1", displayName: "产品手册" },
      { kbId: "kb-2", displayName: "kb-2" },
    ]);
  });

  test("deduplicates by kbId", () => {
    const tags = buildTagsWithKnowledgeRefs(
      [],
      [
        { kbId: "kb-1", displayName: "A" },
        { kbId: "kb-1", displayName: "B" },
      ],
    );
    expect(parseKnowledgeRefsFromTags(tags)).toEqual([{ kbId: "kb-1", displayName: "A" }]);
  });

  test("ignores empty kbId", () => {
    expect(buildTagsWithKnowledgeRefs([], [{ kbId: "  ", displayName: "x" }])).toEqual([]);
  });
});
