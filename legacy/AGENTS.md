# legacy/AGENTS.md

本目录是迁移遗留项目集合。

## Rules

- 默认只做最小必要修改，不做顺手现代化、重构或依赖升级。
- 不把 legacy 项目的结构、命令或技术栈反推为 `prod/` 标准。
- 改动前读取目标项目最近的 `package.json`，命令以目标 scripts 为准。
- 删除或迁移文件前必须查引用。

## Skills

以下路径均相对仓库根目录：

- 常规修改：`.agents/skills/project-coding/SKILL.md`
- 重构/删除/迁移：`.agents/skills/project-refactor/SKILL.md`
- 前端问题：`.agents/skills/project-frontend/SKILL.md`
- 验证命令：`.agents/skills/project-verification/SKILL.md`
