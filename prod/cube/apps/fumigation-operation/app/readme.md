# @ghcloud/cube-fumigation-operation-app

开河平台熏蒸作业 PC 子应用。

## 页面

- 作业列表：`/works`
- 新增熏蒸：`/works/create`
- 审批页面：`/approval`
- 三步校验：`/precheck`
- 监护看板：`/monitor`
- 实时态势：`/realtime`
- 合规档案：`/archive`

## 关键约定

- 业务页面使用 `@ghcloud/cube-app-design` 和 `@ghcloud/cube-ui`。
- 作业数据、状态流转、设备、人员、档案均通过 `@ghcloud/cube-services-client/fumigation-operation.client` 调用真实接口。
- 熏蒸作业状态机由后端 `security-management/fumigation` 分包实现，不复用 `work-permit`，不走通用流引擎。
- 仓房和仓房下品种从 `intelligent-grain` 服务获取；作业单保存仓房名称、编号、品种名称冗余字段。
- `src/mocks` 只保留 `useCubeTable({ tableCode })` 独立开发所需的 AliasTable 字典兜底，不提供熏蒸业务 mock 数据。

## 脚本

| 命令 | 作用 |
|---|---|
| `bun run dev` | 本地开发 |
| `bun run build` | 构建产物 |
| `bun run build:dev` / `build:test` / `build:prod` | 按环境构建 |
| `bun run preview` | 预览构建结果 |
