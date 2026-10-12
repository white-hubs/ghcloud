import { describe, expect, it } from "bun:test";

import { DEFAULT_PAGE_NAME, isNewPlaceholderPageContent } from "../src/views/page-save-name";

describe("page save name", () => {
  it("使用未命名画面作为新画面默认名称", () => {
    expect(DEFAULT_PAGE_NAME).toBe("未命名画面");
  });

  it("仅将空对象内容识别为尚未正式保存的新画面", () => {
    expect(isNewPlaceholderPageContent("{}")).toBe(true);
    expect(isNewPlaceholderPageContent("  { }  ")).toBe(true);
    expect(isNewPlaceholderPageContent(JSON.stringify({ version: "1", elements: [] }))).toBe(false);
    expect(isNewPlaceholderPageContent("[]")).toBe(false);
    expect(isNewPlaceholderPageContent("非法内容")).toBe(false);
  });
});
