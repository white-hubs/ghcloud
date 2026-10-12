# @ghcloud/cube-fire-management-app

消防管理 PC 端 qiankun 子应用，提供消防主机、消防点位、消防设备及数据记录等业务页面。

## 页面与路由

| 路径 | 页面 |
|---|---|
| `/` | 重定向至 `/fire-host-control` |
| `/fire-host-control` | 消防主机远程控制 |
| `/fire-host-config` | 消防主机配置 |
| `/fire-point-management` | 消防点位管理 |
| `/fire-device-list` | 消防设备管理 |
| `/fire-point-statistics` | 点位统计 |
| `/fire-event-records` | 事件记录 |
| `/fire-operation-records` | 操作记录 |

路由统一维护在 `src/router/index.ts`。

## 工程结构

```text
src/
├── app.ts                         # Vue、Router、Pinia 装配
├── app.tsx                        # 根组件
├── main.ts                        # qiankun 生命周期入口
├── bootstrap/                     # 应用会话初始化
├── hooks/                         # 业务通用 hooks
├── permission/                    # 应用权限码
├── router/                        # PC 端业务路由
├── stores/                        # 应用状态
└── views/
    ├── fire-host-control/         # 消防主机远程控制
    ├── fire-host-config/          # 消防主机配置
    ├── fire-point-management/     # 消防点位管理
    ├── fire-device-list/          # 消防设备管理
    ├── point-statistics/          # 点位统计
    ├── event-records/             # 事件记录
    └── operation-records/         # 操作记录
```

## 开发约定

- PC 端列表页统一使用 `@ghcloud/cube-app-design` 提供的 `CubeLayout`、`useCubeForm`、`useCubeTable` 等业务平台组件。
- API 通过 `@ghcloud/cube-services-client` 调用，并使用 `authRequest` 维护 qiankun 下发的鉴权信息。
- 通用 UI 组件使用 `@ghcloud/cube-ui`，工具函数优先使用 `@ghcloud/cube-utils`。
- 新增页面时同步维护 `src/router/index.ts`，确保刷新和直接访问均能恢复到对应业务路由。

## 开发命令

| 命令 | 作用 |
|---|---|
| `bun run dev` | 启动本地开发服务 |
| `bun run build` | 构建默认环境产物 |
| `bun run build:dev` | 构建开发环境产物 |
| `bun run build:test` | 构建测试环境产物 |
| `bun run build:prod` | 构建生产环境产物 |
| `bun run preview` | 本地预览构建结果 |
