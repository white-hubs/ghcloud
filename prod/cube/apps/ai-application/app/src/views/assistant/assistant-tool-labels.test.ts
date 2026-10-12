import { describe, expect, test } from "bun:test";

import {
  GENERIC_TOOL_LABEL,
  lookupExactToolLabel,
  resolveFuzzyToolLabel,
  resolveToolDisplayLabel,
  TOOL_LABEL_EXACT,
  tokenizeToolAction,
} from "./assistant-tool-labels";

describe("resolveToolDisplayLabel", () => {
  test("uses the exact table for known tools", () => {
    expect(resolveToolDisplayLabel("mcp.biz-ontology.search_ontology")).toBe("检索本体");
    expect(resolveToolDisplayLabel("mcp.biz-ontology.query_database")).toBe("查询业务数据");
    expect(resolveToolDisplayLabel("platform.flow.invoke")).toBe("执行工作流");
    expect(resolveToolDisplayLabel("currentDate")).toBe("获取当前时间");
    expect(resolveToolDisplayLabel("load_skill")).toBe("加载技能");
  });

  test("falls back to a fuzzy Chinese label for unknown tools (never the raw name)", () => {
    expect(resolveToolDisplayLabel("image.generate")).toBe("生成内容");
    expect(resolveToolDisplayLabel("calendar.query")).toBe("检索数据");
    expect(resolveToolDisplayLabel("mcp.foo.list_items")).toBe("查询列表");
    expect(resolveToolDisplayLabel("mcp.foo.read_config")).toBe("读取信息");
    expect(resolveToolDisplayLabel("mcp.foo.run_job")).toBe("执行操作");
  });

  test("returns the generic label when no action keyword matches", () => {
    expect(resolveToolDisplayLabel("mcp.foo.frobnicate")).toBe(GENERIC_TOOL_LABEL);
  });

  test("returns the generic label for empty / missing tool names", () => {
    expect(resolveToolDisplayLabel("")).toBe(GENERIC_TOOL_LABEL);
    expect(resolveToolDisplayLabel("   ")).toBe(GENERIC_TOOL_LABEL);
    expect(resolveToolDisplayLabel(undefined)).toBe(GENERIC_TOOL_LABEL);
    expect(resolveToolDisplayLabel(null)).toBe(GENERIC_TOOL_LABEL);
  });

  test("never leaks the raw English tool name (always returns a Chinese label)", () => {
    for (const toolName of ["mcp.unknown.doThing", "SomeRandomTool", "a.b.c.zzz"]) {
      const label = resolveToolDisplayLabel(toolName);
      expect(label).not.toBe(toolName);
      expect(/[\u4E00-\u9FFF]/u.test(label)).toBe(true);
    }
  });
});

describe("resolveFuzzyToolLabel", () => {
  test("scans only the action segment and picks the first matching keyword", () => {
    // 前缀段里的 "report"（分析数据）不应干扰动作段 "list"（查询列表）。
    expect(resolveFuzzyToolLabel("mcp.report.list_all")).toBe("查询列表");
  });

  test("prefers 生成 over 新建 when both keywords are present", () => {
    expect(resolveFuzzyToolLabel("image.generate")).toBe("生成内容");
  });
});

describe("tokenizeToolAction", () => {
  test("keeps only the last dot-segment and splits snake_case + camelCase", () => {
    expect(tokenizeToolAction("mcp.biz-ontology.list_business_domains")).toEqual(["list", "business", "domains"]);
    expect(tokenizeToolAction("currentDate")).toEqual(["current", "date"]);
    expect(tokenizeToolAction("platform.flow.invoke")).toEqual(["invoke"]);
  });
});

describe("lookupExactToolLabel", () => {
  test("returns the mapped label for known tools and undefined otherwise", () => {
    expect(lookupExactToolLabel("mcp.web-search.fetch_page")).toBe("抓取网页");
    expect(lookupExactToolLabel("platform.descriptor.publish")).toBe("发布描述符");
    expect(lookupExactToolLabel("mcp.unknown.tool")).toBeUndefined();
    expect(lookupExactToolLabel("")).toBeUndefined();
    expect(lookupExactToolLabel(undefined)).toBeUndefined();
  });
});

describe("TOOL_LABEL_EXACT", () => {
  test("every mapped label is Chinese and non-empty", () => {
    for (const [toolName, label] of Object.entries(TOOL_LABEL_EXACT)) {
      expect(label.length).toBeGreaterThan(0);
      expect(label).not.toBe(toolName);
      expect(/[\u4E00-\u9FFF]/u.test(label)).toBe(true);
    }
  });
});
