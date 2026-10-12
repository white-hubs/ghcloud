import { describe, expect, test } from "bun:test";

import { extractSkillConfigSection } from "./skill-instructions";

describe("extractSkillConfigSection", () => {
  test("extracts only output spec section from structured markdown", () => {
    const instructions = [
      "## 使用示例",
      "示例内容",
      "",
      "## 输出规范",
      "【输出格式】",
      "表格模板",
      "",
      "## 输入要求",
      "必填项",
      "",
      "## 避坑指南",
      "不要编造",
    ].join("\n");

    expect(extractSkillConfigSection(instructions, "outputSpec")).toBe("【输出格式】\n表格模板");
  });

  test("trims embedded section labels inside a single section body", () => {
    const instructions = ["## 输出规范", "【输出格式】", "表格模板", "", "输入要求", "用户需提供场景", "", "避坑指南", "不要编造数据"].join(
      "\n",
    );

    expect(extractSkillConfigSection(instructions, "outputSpec")).toBe("【输出格式】\n表格模板");
  });

  test("uses plain response as focused field when no markdown headers", () => {
    expect(extractSkillConfigSection("仅更新后的输出规范内容", "outputSpec")).toBe("仅更新后的输出规范内容");
  });

  test("extracts section with level-3 heading", () => {
    const instructions = ["### 输出规范", "表格格式", "", "### 输入要求", "必填"].join("\n");

    expect(extractSkillConfigSection(instructions, "outputSpec")).toBe("表格格式");
  });

  test("extracts section when label appears as plain line", () => {
    const instructions = ["输出规范", "表格格式", "", "输入要求", "必填"].join("\n");

    expect(extractSkillConfigSection(instructions, "outputSpec")).toBe("表格格式");
  });
});
