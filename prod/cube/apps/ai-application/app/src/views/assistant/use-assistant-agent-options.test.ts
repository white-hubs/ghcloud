import type { LibraryItemView, ShelfEntryView } from "@cube-ai/contracts";
import { describe, expect, test } from "bun:test";

import {
  enrichAssistantAgentDescriptions,
  resolveAssistantAgentDescriptionFromLibraryItem,
  visibleAssistantAgentDescription,
} from "./assistant-agent-description";
import { buildAssistantAgentOptionsFromShelf, resolveAssistantAgentDisplayName } from "./assistant-agent-options-builder";

function shelfEntry(partial: Partial<ShelfEntryView> & Pick<ShelfEntryView, "targetId" | "source">): ShelfEntryView {
  return {
    id: `she_${partial.targetId}`,
    targetKind: "agent",
    runnableStatus: "runnable",
    enabled: true,
    pinVersionNo: null,
    effectiveVersionNo: 1,
    ...partial,
  };
}

describe("buildAssistantAgentOptionsFromShelf", () => {
  test("derives authored agent name from shelf displayName without any detail fetch", () => {
    const options = buildAssistantAgentOptionsFromShelf([
      shelfEntry({ targetId: "agt_mine", source: "authored", displayName: "第一责任人助手" }),
    ]);
    expect(options).toEqual([{ id: "agt_mine", name: "第一责任人助手", description: "", source: "authored" }]);
  });

  test("derives ref agent name from shelf displayName without library lookup", () => {
    const options = buildAssistantAgentOptionsFromShelf([shelfEntry({ targetId: "agt_news", source: "ref", displayName: "新闻智能体" })]);
    expect(options).toEqual([{ id: "agt_news", name: "新闻智能体", description: "", source: "ref" }]);
  });

  test("falls back to targetId when shelf carries no displayName", () => {
    const options = buildAssistantAgentOptionsFromShelf([shelfEntry({ targetId: "agt_bare", source: "authored" })]);
    expect(options).toEqual([{ id: "agt_bare", name: "agt_bare", description: "", source: "authored" }]);
  });

  test("resolves system agent name when shelf displayName is missing or equals id", () => {
    const libraryByRef = new Map([["1934000000000000002", { displayName: "孪生智能体（库）" }]]);
    expect(
      buildAssistantAgentOptionsFromShelf([
        shelfEntry({ targetId: "1934000000000000001", source: "ref", displayName: "1934000000000000001" }),
      ]),
    ).toEqual([{ id: "1934000000000000001", name: "安全智能体", description: "", source: "ref" }]);
    expect(buildAssistantAgentOptionsFromShelf([shelfEntry({ targetId: "1934000000000000002", source: "ref" })], libraryByRef)).toEqual([
      { id: "1934000000000000002", name: "孪生智能体（库）", description: "", source: "ref" },
    ]);
  });

  test("excludes non-runnable (unresolvable / disabled) shelf agents", () => {
    const options = buildAssistantAgentOptionsFromShelf([
      shelfEntry({ targetId: "agt_stale", source: "ref", displayName: "旧智能体", runnableStatus: "unresolvable" }),
      shelfEntry({ targetId: "agt_off", source: "authored", displayName: "停用助手", runnableStatus: "disabled" }),
    ]);
    expect(options).toEqual([]);
  });

  test("excludes engine-internal shelf agents", () => {
    const options = buildAssistantAgentOptionsFromShelf([
      shelfEntry({ targetId: "cube-default", source: "ref", displayName: "CUBE Default Agent" }),
    ]);
    expect(options).toEqual([]);
  });

  test("deduplicates repeated targetId", () => {
    const options = buildAssistantAgentOptionsFromShelf([
      shelfEntry({ targetId: "agt_dup", source: "authored", displayName: "助手" }),
      shelfEntry({ targetId: "agt_dup", source: "ref", displayName: "助手副本" }),
    ]);
    expect(options).toEqual([{ id: "agt_dup", name: "助手", description: "", source: "authored" }]);
  });

  test("ignores non-agent shelf entries", () => {
    const options = buildAssistantAgentOptionsFromShelf([
      shelfEntry({ targetId: "skl_x", source: "authored", displayName: "技能", targetKind: "skill" }),
    ]);
    expect(options).toEqual([]);
  });
});

describe("resolveAssistantAgentDisplayName", () => {
  test("prefers meaningful shelf displayName over library and system map", () => {
    expect(
      resolveAssistantAgentDisplayName(
        { targetId: "1934000000000000002", displayName: "自定义孪生" },
        new Map([["1934000000000000002", { displayName: "库名" }]]),
      ),
    ).toBe("自定义孪生");
  });
});

describe("enrichAssistantAgentDescriptions", () => {
  test("fills description from library item for ref agents", () => {
    const shelf = [shelfEntry({ targetId: "1934000000000000002", source: "ref", displayName: "孪生智能体" })];
    const options = buildAssistantAgentOptionsFromShelf(shelf);
    const libraryByRef = new Map<string, LibraryItemView>([
      [
        "1934000000000000002",
        {
          kind: "agent",
          ref: "1934000000000000002",
          tier: "system",
          displayName: "孪生智能体",
          description: "面向数字孪生与复杂推演场景",
        } as LibraryItemView,
      ],
    ]);
    const enriched = enrichAssistantAgentDescriptions(shelf, options, libraryByRef);
    expect(enriched[0]?.description).toBe("面向数字孪生与复杂推演场景");
  });

  test("falls back to SYSTEM_ASSISTANT_AGENTS description when library missing", () => {
    const shelf = [shelfEntry({ targetId: "1934000000000000001", source: "ref", displayName: "安全智能体" })];
    const options = buildAssistantAgentOptionsFromShelf(shelf);
    const enriched = enrichAssistantAgentDescriptions(shelf, options, new Map());
    expect(enriched[0]?.description).toBe("聚焦安全规范、风险识别和事件处置建议。");
  });

  test("does not invent description for authored agents without library entry", () => {
    const shelf = [shelfEntry({ targetId: "agt_mine", source: "authored", displayName: "我的助手" })];
    const options = buildAssistantAgentOptionsFromShelf(shelf);
    const enriched = enrichAssistantAgentDescriptions(shelf, options, new Map());
    expect(enriched[0]?.description).toBe("");
  });
});

describe("resolveAssistantAgentDescriptionFromLibraryItem", () => {
  test("ignores placeholder descriptions", () => {
    expect(
      resolveAssistantAgentDescriptionFromLibraryItem({
        kind: "agent",
        ref: "agt_x",
        tier: "tenant",
        description: "暂无简介",
      } as LibraryItemView),
    ).toBe("");
  });
});

describe("visibleAssistantAgentDescription", () => {
  test("hides empty and placeholder", () => {
    expect(visibleAssistantAgentDescription("")).toBe("");
    expect(visibleAssistantAgentDescription("暂无简介")).toBe("");
    expect(visibleAssistantAgentDescription("系统预置智能体")).toBe("");
    expect(visibleAssistantAgentDescription("面向数字孪生")).toBe("面向数字孪生");
  });
});
