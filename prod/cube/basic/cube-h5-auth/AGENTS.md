# prod/cube/basic/cube-h5-auth/AGENTS.md

本目录是 `@ghcloud/cube-h5-auth` H5 鉴权复用包。

## Rules

- 修改登录页、路由守卫、`authSession`、租户、访客模式、Bearer token 前必须读取 `cube-h5-auth` skill。
- 不改变 token/Bearer 语义，除非同步检查所有消费者。
- 公共导出变化必须查 H5 宿主引用方。
- 构建产物默认不提交。

## Skills

以下路径均相对仓库根目录：

- 领域规则：`.agents/skills/cube-h5-auth/SKILL.md`
- 普通编码：`.agents/skills/project-coding/SKILL.md`
- 验证命令：`.agents/skills/project-verification/SKILL.md`
