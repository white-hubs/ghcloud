import { describe, expect, test } from "bun:test";

import { buildTagsWithAgentAvatar, parseAgentAvatarFromTags, resolveAgentAvatarUrlFromContent } from "./agent-avatar";

describe("agent avatar tags", () => {
  test("round-trips avatar url and file id through tags", () => {
    const tags = buildTagsWithAgentAvatar(["keep-me", "ghcloud.agent.avatarUrl:stale"], {
      avatarUrl: "https://cdn.example/a.png",
      avatarFileId: "file_1",
    });
    expect(tags).toContain("keep-me");
    expect(tags.some((tag) => tag.includes("stale"))).toBe(false);
    expect(parseAgentAvatarFromTags(tags)).toEqual({
      avatarUrl: "https://cdn.example/a.png",
      avatarFileId: "file_1",
    });
  });

  test("clears avatar tags when url and file id empty", () => {
    const tags = buildTagsWithAgentAvatar(["ghcloud.agent.avatarUrl:x", "other"], {
      avatarUrl: "",
      avatarFileId: "",
    });
    expect(tags).toEqual(["other"]);
    expect(parseAgentAvatarFromTags(tags)).toEqual({ avatarUrl: "", avatarFileId: "" });
  });

  test("resolves avatar url from content tags", () => {
    expect(
      resolveAgentAvatarUrlFromContent({
        tags: [`ghcloud.agent.avatarUrl:${encodeURIComponent("/files/agent.png")}`],
      }),
    ).toBe("/files/agent.png");
    expect(resolveAgentAvatarUrlFromContent({ tags: [] })).toBe("");
    expect(resolveAgentAvatarUrlFromContent(null)).toBe("");
  });
});
