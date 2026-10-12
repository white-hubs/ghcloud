import { describe, expect, test } from "bun:test";

import {
  extractDescriptorName,
  formatDescriptorDocumentFrontmatter,
  hasDescriptorFrontmatter,
  isValidDescriptorName,
  normalizeDescriptorNameSlug,
  slugifyDescriptorName,
} from "./descriptor-document-format";

describe("formatDescriptorDocumentFrontmatter", () => {
  test("fixes wrapped scalar and normalizes nested/list indentation", () => {
    const source = [
      "---",
      "name: reply-prefix-zhugong",
      "description: Prepends the fixed greeting to the very start of every",
      "assistant reply, before any other content.",
      "activation:",
      "mode: always",
      "tags:",
      "- greeting",
      "- format",
      "---",
      "# Reply Prefix",
    ].join("\n");

    expect(formatDescriptorDocumentFrontmatter(source)).toBe(
      [
        "---",
        "name: reply-prefix-zhugong",
        "description: Prepends the fixed greeting to the very start of every assistant reply, before any other content.",
        "activation:",
        "  mode: always",
        "tags:",
        "  - greeting",
        "  - format",
        "---",
        "# Reply Prefix",
      ].join("\n"),
    );
  });

  test("leaves documents without frontmatter unchanged", () => {
    const source = "# Skill\n\nNo frontmatter.";
    expect(formatDescriptorDocumentFrontmatter(source)).toBe(source);
  });

  test("normalizes a pasted skill descriptor even when YAML is already parseable", () => {
    const source = [
      "---",
      "name: reply-greeting-prefix",
      "version: 1.0.0",
      "description: 在每一次回复的最开头固定加上问候前缀「【好的，主公大人～】」，不改变回复的实际内容与语气。",
      "displayName: 主公问候前缀",
      "activation:",
      "  mode: always",
      "tags:",
      "  - greeting",
      "  - format",
      "resources: []",
      "---",
      "",
      "## 技能详情",
    ].join("\n");

    expect(formatDescriptorDocumentFrontmatter(source)).toBe(
      [
        "---",
        "name: reply-greeting-prefix",
        "displayName: 主公问候前缀",
        "description: 在每一次回复的最开头固定加上问候前缀「【好的，主公大人～】」，不改变回复的实际内容与语气。",
        "version: 1.0.0",
        "activation:",
        "  mode: always",
        "tags:",
        "  - greeting",
        "  - format",
        "resources: []",
        "---",
        "",
        "## 技能详情",
      ].join("\n"),
    );
  });

  test("dedents a uniformly-indented frontmatter and merges CJK wrapped scalar without inserting spaces", () => {
    const source = [
      "---",
      "  name: reply-greeting-prefix",
      "  version: 1.0.0",
      "  description: 在每一次回复的最开头固定加上问候前缀「【好的，主公大人～】」，不改变",
      "  回复的实际内容与语气。",
      "  displayName: 主公问候前缀",
      "  activation:",
      "    mode: always",
      "  tags:",
      "    - greeting",
      "    - format",
      "  resources: []",
      "---",
      "## 技能详情",
    ].join("\n");

    expect(formatDescriptorDocumentFrontmatter(source)).toBe(
      [
        "---",
        "name: reply-greeting-prefix",
        "displayName: 主公问候前缀",
        "description: 在每一次回复的最开头固定加上问候前缀「【好的，主公大人～】」，不改变回复的实际内容与语气。",
        "version: 1.0.0",
        "activation:",
        "  mode: always",
        "tags:",
        "  - greeting",
        "  - format",
        "resources: []",
        "---",
        "## 技能详情",
      ].join("\n"),
    );
  });

  test("hasDescriptorFrontmatter distinguishes header presence from body-only documents", () => {
    expect(hasDescriptorFrontmatter(["---", "  name: x", "---", "# body"].join("\n"))).toBe(true);
    expect(hasDescriptorFrontmatter("# Skill\n\nNo frontmatter.")).toBe(false);
  });
});

describe("isValidDescriptorName", () => {
  test("accepts lowercase kebab slugs", () => {
    expect(isValidDescriptorName("reply-prefix-zhugong")).toBe(true);
    expect(isValidDescriptorName("a")).toBe(true);
    expect(isValidDescriptorName("a1-b2")).toBe(true);
  });

  test("rejects uppercase, CJK, spaces, and leading/trailing/double hyphens", () => {
    expect(isValidDescriptorName("My-Agent")).toBe(false);
    expect(isValidDescriptorName("我的技能")).toBe(false);
    expect(isValidDescriptorName("my agent")).toBe(false);
    expect(isValidDescriptorName("-my-agent")).toBe(false);
    expect(isValidDescriptorName("my-agent-")).toBe(false);
    expect(isValidDescriptorName("my--agent")).toBe(false);
    expect(isValidDescriptorName("")).toBe(false);
  });
});

describe("slugifyDescriptorName", () => {
  test("lowercases and collapses non-alnum runs into single hyphens", () => {
    expect(slugifyDescriptorName("My Agent!!")).toBe("my-agent");
    expect(slugifyDescriptorName("  --Leading Trailing--  ")).toBe("leading-trailing");
  });

  test("falls back to a generic placeholder when nothing alnum survives (e.g. pure CJK)", () => {
    expect(slugifyDescriptorName("我的技能")).toBe("descriptor");
  });

  test("output always satisfies isValidDescriptorName", () => {
    for (const input of ["My Agent", "我的技能", "  ", "a_b_c", "已--存在--的-slug"]) {
      expect(isValidDescriptorName(slugifyDescriptorName(input))).toBe(true);
    }
  });
});

describe("extractDescriptorName", () => {
  test("reads the top-level name field", () => {
    expect(extractDescriptorName(["---", "name: my-skill", "displayName: 我的技能", "---", "# body"].join("\n"))).toBe("my-skill");
  });

  test("returns null when frontmatter or name is missing", () => {
    expect(extractDescriptorName("# no frontmatter")).toBeNull();
    expect(extractDescriptorName(["---", "displayName: 我的技能", "---", "# body"].join("\n"))).toBeNull();
  });
});

describe("normalizeDescriptorNameSlug", () => {
  test("slugifies an invalid name in place and leaves other fields untouched", () => {
    const source = ["---", "name: 我的技能", "displayName: 我的技能", "---", "", "## 技能详情"].join("\n");
    const normalized = normalizeDescriptorNameSlug(source);
    expect(extractDescriptorName(normalized)).toBe("descriptor");
    expect(normalized).toContain("displayName: 我的技能");
  });

  test("leaves an already-valid name untouched", () => {
    const source = ["---", "name: my-skill", "displayName: 我的技能", "---", "# body"].join("\n");
    expect(normalizeDescriptorNameSlug(source)).toBe(source);
  });

  test("returns source unchanged when there is no name field or no frontmatter", () => {
    expect(normalizeDescriptorNameSlug("# no frontmatter")).toBe("# no frontmatter");
    const noName = ["---", "displayName: 我的技能", "---", "# body"].join("\n");
    expect(normalizeDescriptorNameSlug(noName)).toBe(noName);
  });
});
