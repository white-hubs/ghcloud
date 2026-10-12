# AGENTS.md

本文件是通用 Agent 入口。项目级 Agent 知识以 `.agents/` 为权威来源；本文件只做跨工具分流。

## Scope

- 适用于整个仓库。
- 子目录若存在 `AGENTS.md`，子目录规则优先。
- 真实规则、技能、索引、记忆协议维护在 `.agents/`。

## Authority

按可信度排序：

1. 当前源码、`package.json`、`tsconfig`、构建/校验配置。
2. `.agents/README.md`、`.agents/repo-map.md`、`.agents/skills/INDEX.md`、`.agents/standards/INDEX.md`。
3. 目标目录内的 README 或局部文档。
4. 历史说明和记忆，仅作为线索。

发现文档与代码冲突时，先核对代码，再修正文档或标记失效；不要把冲突内容当强规则执行。

## Entry Points

- Agent 总入口：`.agents/README.md`
- 仓库地图：`.agents/repo-map.md`
- Skill 路由：`.agents/skills/INDEX.md`
- 标准索引：`.agents/standards/INDEX.md`
- 命令发现：`.agents/standards/command-discovery.md`

## First Move

开始任务前先判断任务类型并加载对应 skill。若不确定，从 `project-search` 开始定位上下文，再按 `INDEX.md` 路由到更具体的 skill。
