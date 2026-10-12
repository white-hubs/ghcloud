import { describe, expect, test } from "bun:test";

import { matchesSearchText } from "./assistant-search";

describe("matchesSearchText", () => {
  test("matches raw text case-insensitively", () => {
    expect(matchesSearchText(["Qwen3.6 Max Preview"], "max")).toBe(true);
    expect(matchesSearchText(["qwen3.6-max-preview"], "QWEN3.6")).toBe(true);
  });

  test("matches Chinese labels by full pinyin and initials", () => {
    expect(matchesSearchText(["知识库"], "zhishi")).toBe(true);
    expect(matchesSearchText(["知识库"], "zsk")).toBe(true);
    expect(matchesSearchText(["安全智能体"], "anquan")).toBe(true);
    expect(matchesSearchText(["用户级技能"], "jineng")).toBe(true);
    expect(matchesSearchText(["消防安全"], "xiaofang")).toBe(true);
    expect(matchesSearchText(["消防安全"], "xf")).toBe(true);
  });

  test("does not match unrelated pinyin", () => {
    expect(matchesSearchText(["知识库"], "moxing")).toBe(false);
  });
});
