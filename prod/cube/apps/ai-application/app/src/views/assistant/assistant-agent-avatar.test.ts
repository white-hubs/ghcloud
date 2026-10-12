import type { LibraryItemView } from "@cube-ai/contracts";
import { describe, expect, test } from "bun:test";

import {
  applyPendingAssistantAgentAvatars,
  enrichAssistantAgentAvatars,
  patchAssistantAgentAvatar,
  resolveAssistantAgentAvatarFromLibraryItem,
} from "./assistant-agent-avatar";
import type { AssistantAgentOption } from "./assistant-agent-options-builder";

describe("assistant agent avatar", () => {
  test("resolves avatar from library content tags", () => {
    const item = {
      ref: "agt_1",
      content: {
        tags: [`ghcloud.agent.avatarUrl:${encodeURIComponent("/files/a.png")}`],
      },
    } as LibraryItemView;
    expect(resolveAssistantAgentAvatarFromLibraryItem(item)).toBe("/files/a.png");
  });

  test("enrichAssistantAgentAvatars fills missing avatarUrl from library", () => {
    const options: AssistantAgentOption[] = [
      { id: "agt_1", name: "A", description: "" },
      { id: "agt_2", name: "B", description: "", avatarUrl: "/keep.png" },
    ];
    const libraryByRef = new Map<string, LibraryItemView>([
      [
        "agt_1",
        {
          ref: "agt_1",
          content: { tags: [`ghcloud.agent.avatarUrl:${encodeURIComponent("/from-lib.png")}`] },
        } as LibraryItemView,
      ],
    ]);
    expect(enrichAssistantAgentAvatars(options, libraryByRef)).toEqual([
      { id: "agt_1", name: "A", description: "", avatarUrl: "/from-lib.png" },
      { id: "agt_2", name: "B", description: "", avatarUrl: "/keep.png" },
    ]);
  });

  test("patchAssistantAgentAvatar writes avatar for matching id only when empty", () => {
    const options: AssistantAgentOption[] = [
      { id: "agt_1", name: "A", description: "" },
      { id: "agt_2", name: "B", description: "", avatarUrl: "/keep.png" },
    ];
    expect(patchAssistantAgentAvatar(options, "agt_1", "/new.png")).toEqual([
      { id: "agt_1", name: "A", description: "", avatarUrl: "/new.png" },
      { id: "agt_2", name: "B", description: "", avatarUrl: "/keep.png" },
    ]);
    expect(patchAssistantAgentAvatar(options, "agt_2", "/overwrite.png")).toEqual(options);
  });

  test("patch caches avatar when agent options not ready, applyPending writes back", () => {
    expect(patchAssistantAgentAvatar([], "agt_late", "/pending.png")).toEqual([]);
    const options: AssistantAgentOption[] = [{ id: "agt_late", name: "Late", description: "" }];
    expect(applyPendingAssistantAgentAvatars(options)).toEqual([
      { id: "agt_late", name: "Late", description: "", avatarUrl: "/pending.png" },
    ]);
  });
});
