/**
 * 工具名到中文展示名的前端兜底映射。
 *
 * SDK alpha.17 起会通过 activity 区分知识库、技能加载等能力，但具体工具名
 * 仍可能是服务端注册字段。H5 与 PC 保持同一层展示兜底，避免把英文 toolName
 * 直接暴露到思考过程里。
 */

export const TOOL_LABEL_EXACT: Readonly<Record<string, string>> = {
  currentDate: "获取当前时间",
  "image.qwen": "生成图片",
  "mcp.biz-ontology.list_business_domains": "查询业务域",
  "mcp.biz-ontology.list_databases": "查询数据库",
  "mcp.biz-ontology.query_database": "查询业务数据",
  "mcp.biz-ontology.read_ontology": "读取本体定义",
  "mcp.biz-ontology.search_by_domain": "按业务域检索",
  "mcp.biz-ontology.search_ontology": "检索本体",
  "mcp.web-search.web_search": "联网搜索",
  "mcp.web-search.fetch_page": "抓取网页",
  "platform.flow.invoke": "执行工作流",
  "platform.flow.list": "查询工作流",
  "platform.descriptor.list": "列出描述符",
  "platform.descriptor.get": "查看描述符",
  "platform.descriptor.propose": "起草描述符",
  "platform.descriptor.create": "新建草稿",
  "platform.descriptor.update": "更新草稿",
  "platform.descriptor.publish": "发布描述符",
  "platform.descriptor.delete": "删除描述符",
  "platform.knowledge.query": "知识库检索",
  load_skill: "加载技能",
  read_skill_resource: "读取技能资源",
  search_skills: "检索技能",
};

export const GENERIC_TOOL_LABEL = "调用工具";

const FUZZY_ACTION_GROUPS: readonly (readonly [readonly string[], string])[] = [
  [["list", "catalog"], "查询列表"],
  [["search", "query", "find", "lookup", "retrieve", "match"], "检索数据"],
  [["generate", "gen", "draw", "image", "render", "paint"], "生成内容"],
  [["read", "get", "fetch", "load", "detail", "view", "show", "describe", "inspect"], "读取信息"],
  [["create", "add", "new", "insert", "register"], "新建数据"],
  [["update", "edit", "modify", "set", "save", "patch", "change"], "更新数据"],
  [["delete", "remove", "drop", "del", "clear"], "删除数据"],
  [["invoke", "run", "execute", "exec", "call", "trigger", "start", "dispatch"], "执行操作"],
  [["upload"], "上传文件"],
  [["download", "export", "dump"], "导出数据"],
  [["import"], "导入数据"],
  [["analyze", "analysis", "stat", "stats", "count", "summary", "aggregate", "report"], "分析数据"],
  [["send", "publish", "notify", "push", "email"], "发送消息"],
  [["approve", "confirm", "review", "audit"], "处理审批"],
];

const FUZZY_KEYWORD_LABEL = ((): ReadonlyMap<string, string> => {
  const map = new Map<string, string>();
  for (const [keywords, label] of FUZZY_ACTION_GROUPS) {
    for (const keyword of keywords) {
      if (!map.has(keyword)) {
        map.set(keyword, label);
      }
    }
  }
  return map;
})();

export function tokenizeToolAction(toolName: string): string[] {
  const segments = toolName.split(".");
  const action = segments.at(-1) ?? toolName;
  return action
    .replaceAll(/(?<lower>[a-z0-9])(?<upper>[A-Z])/gu, "$<lower> $<upper>")
    .split(/[^a-zA-Z0-9]+/u)
    .map((token) => token.toLowerCase())
    .filter((token) => token !== "");
}

export function resolveFuzzyToolLabel(toolName: string): string {
  for (const token of tokenizeToolAction(toolName)) {
    const label = FUZZY_KEYWORD_LABEL.get(token);
    if (label !== undefined) {
      return label;
    }
  }
  return GENERIC_TOOL_LABEL;
}

export function lookupExactToolLabel(toolName: string | null | undefined): string | undefined {
  const name = typeof toolName === "string" ? toolName.trim() : "";
  if (name === "") {
    return undefined;
  }
  return TOOL_LABEL_EXACT[name];
}

export function resolveToolDisplayLabel(toolName: string | null | undefined): string {
  const name = typeof toolName === "string" ? toolName.trim() : "";
  if (name === "") {
    return GENERIC_TOOL_LABEL;
  }
  return lookupExactToolLabel(name) ?? resolveFuzzyToolLabel(name);
}
