/**
 * 工具名 → 中文展示名（前端临时映射；grill 2026-07-07）。
 *
 * 背景：`steps` 时间线的工具卡名来自 `resolveThinkingToolLabel`，只有 SDK `resolveStepActivity`
 * 识别出的三类内置活动（web-search / knowledge-retrieval / skill-load）有硬编码中文，其余工具
 * 直接回退到英文 `toolName`（如 `mcp.biz-ontology.search_ontology`）。在服务端 `cube-agentic-engine`
 * 于 wire 事件里补齐工具展示名之前，这里在前端做一层「精确表 + 模糊语义兜底」，保证任何工具都以
 * 中文呈现、**永不泄漏原始字段名**。
 *
 * 维护约定：
 *   - `TOOL_LABEL_EXACT`：已知工具的精准中文名。权威来源是 cube-ai 的工具注册表（tool title /
 *     description）。新增工具优先补这里。
 *   - `resolveFuzzyToolLabel`：精确表未命中时，按工具名「动作段」关键词推断模糊中文动作短语；
 *     全都不认识时兜底为 `GENERIC_TOOL_LABEL`。任何分支都返回中文，不返回英文 toolName。
 */

/** 精确映射：`toolName` → 中文名。键必须与服务端注册的 `toolName` 完全一致（大小写敏感）。 */
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

/** 连一个动作关键词都识别不出时的最终兜底（仍是中文）。 */
export const GENERIC_TOOL_LABEL = "调用工具";

/**
 * 模糊语义词表：动作关键词 → 中文动作短语。同一短语可对应多个近义关键词。
 * 顺序即优先级——`resolveFuzzyToolLabel` 按工具名 token 从左到右扫描，命中第一个即返回，
 * 因此更具体的动作应排在更靠前（如 `generate` 早于 `create`，避免「生成图片」被判成「新建数据」）。
 */
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

/** token → 中文短语（由 `FUZZY_ACTION_GROUPS` 展开；靠前的组先写入，不覆盖已存在的 token）。 */
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

/**
 * 取工具名的「动作段」（最后一个 `.` 段），再按 `_`/`-`/camelCase 切成小写 token。
 * 只取最后一段是为了避开 server / domain 前缀（如 `mcp`、`biz-ontology`）里的干扰词。
 */
export function tokenizeToolAction(toolName: string): string[] {
  const segments = toolName.split(".");
  const action = segments.at(-1) ?? toolName;
  return action
    .replaceAll(/(?<lower>[a-z0-9])(?<upper>[A-Z])/gu, "$<lower> $<upper>")
    .split(/[^a-zA-Z0-9]+/u)
    .map((token) => token.toLowerCase())
    .filter((token) => token !== "");
}

/** 精确表未命中时的模糊语义兜底：按动作 token 推断中文短语，全不认识则返回 `GENERIC_TOOL_LABEL`。 */
export function resolveFuzzyToolLabel(toolName: string): string {
  for (const token of tokenizeToolAction(toolName)) {
    const label = FUZZY_KEYWORD_LABEL.get(token);
    if (label !== undefined) {
      return label;
    }
  }
  return GENERIC_TOOL_LABEL;
}

/**
 * 仅精确命中：命中返回精确表中文名，未命中返回 `undefined`。
 * 与 `resolveToolDisplayLabel` 的区别是「不做模糊兜底」，调用方可据此区分「登记过」与「没登记」，
 * 用于让精确表优先于内置活动名（如 web-search 活动下的 `fetch_page` 恢复成自己的名字）。
 */
export function lookupExactToolLabel(toolName: string | null | undefined): string | undefined {
  const name = typeof toolName === "string" ? toolName.trim() : "";
  if (name === "") {
    return undefined;
  }
  return TOOL_LABEL_EXACT[name];
}

/**
 * 工具名 → 中文展示名的统一入口：先查精确表，未命中走模糊语义兜底。
 * `toolName` 为空/缺失时返回 `GENERIC_TOOL_LABEL`。返回值恒为中文，绝不回退英文原名。
 */
export function resolveToolDisplayLabel(toolName: string | null | undefined): string {
  const name = typeof toolName === "string" ? toolName.trim() : "";
  if (name === "") {
    return GENERIC_TOOL_LABEL;
  }
  return lookupExactToolLabel(name) ?? resolveFuzzyToolLabel(name);
}
