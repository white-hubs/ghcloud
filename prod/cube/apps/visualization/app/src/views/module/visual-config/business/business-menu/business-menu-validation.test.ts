import { describe, expect, test } from "bun:test";

import { getBusinessMenuSubmitErrorMessage, hasDuplicateMenuNameAtLevel, normalizeMenuName } from "./business-menu-validation";

const menuTree = [
  {
    id: "root-a",
    name: "综合管理",
    children: [
      { id: "child-a-1", name: "设备管理" },
      { id: "child-a-2", name: "综合管理" },
    ],
  },
  {
    id: "root-b",
    name: "设备管理",
    children: [{ id: "child-b-1", name: "报警管理" }],
  },
];

describe("business menu validation", () => {
  test("rejects duplicate names only at the same level", () => {
    expect(hasDuplicateMenuNameAtLevel(menuTree, null, "综合管理")).toBe(true);
    expect(hasDuplicateMenuNameAtLevel(menuTree, "root-a", "设备管理")).toBe(true);
    expect(hasDuplicateMenuNameAtLevel(menuTree, "root-b", "综合管理")).toBe(false);
  });

  test("excludes the current menu while editing", () => {
    expect(hasDuplicateMenuNameAtLevel(menuTree, "root-a", "设备管理", "child-a-1")).toBe(false);
    expect(hasDuplicateMenuNameAtLevel(menuTree, "root-a", "综合管理", "child-a-1")).toBe(true);
  });

  test("normalizes whitespace consistently", () => {
    expect(normalizeMenuName(" 设 备 管 理 ")).toBe("设备管理");
    expect(hasDuplicateMenuNameAtLevel(menuTree, "root-a", "设 备 管 理")).toBe(true);
  });

  test("uses the backend error message for the user prompt", () => {
    expect(getBusinessMenuSubmitErrorMessage(new Error("存在场景类型信息！"), "新增失败")).toBe("存在场景类型信息！");
    expect(getBusinessMenuSubmitErrorMessage({ message: "名称重复" }, "新增失败")).toBe("名称重复");
    expect(getBusinessMenuSubmitErrorMessage({}, "新增失败")).toBe("新增失败");
  });
});
