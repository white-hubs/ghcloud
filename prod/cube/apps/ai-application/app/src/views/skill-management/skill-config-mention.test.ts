import { describe, expect, test } from "bun:test";

import { applyConfigMentionSelection, filterConfigMentionOptions, findActiveConfigMention } from "./skill-config-mention";

describe("skill-config-mention", () => {
  test("findActiveConfigMention detects @ at line start", () => {
    expect(findActiveConfigMention("@使用", 3)).toEqual({
      start: 0,
      end: 3,
      query: "使用",
    });
  });

  test("findActiveConfigMention detects @ after whitespace", () => {
    expect(findActiveConfigMention("请修改 @输出", 7)).toEqual({
      start: 4,
      end: 7,
      query: "输出",
    });
  });

  test("findActiveConfigMention returns null when no active mention", () => {
    expect(findActiveConfigMention("@使用示例 继续修改", 8)).toBeNull();
  });

  test("filterConfigMentionOptions matches label prefix", () => {
    const options = filterConfigMentionOptions("输出");
    expect(options.map((item) => item.label)).toEqual(["输出规范"]);
  });

  test("applyConfigMentionSelection inserts full label with trailing space", () => {
    const mention = { start: 0, end: 3, query: "使用" };
    expect(applyConfigMentionSelection("@使用", mention, "使用示例")).toEqual({
      text: "@使用示例 ",
      caret: 6,
    });
  });
});
