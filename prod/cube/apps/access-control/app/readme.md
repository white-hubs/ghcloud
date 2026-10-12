# @ghcloud/cube-access-control-app

门禁管理 Cube 子应用，路由前缀为 `/portal/access-control`，qiankun 挂载节点为 `#AccessControl`。

## 页面

| 路径 | 页面 |
|---|---|
| `/roomHome` | 门禁概览、今日通行、通行趋势、门禁排名与最近事件 |
| `/roomDevicePage` | 门禁设备查询、关联、移除与远程控制 |
| `/roomLogPage` | 通行趋势与通行记录 |
| `/roomEventPage` | 异常事件记录 |

历史路径 `/accessView`、`/accessDevice`、`/accessRecords`、`/abnormalEvents` 等保留为重定向，兼容已有菜单配置。

## 工程约定

- 页面使用 TSX，不保留 `.vue` 文件。
- 页面骨架和列表使用 `@ghcloud/cube-app-design` 的 `CubeLayout`、`useCubeForm`、`useCubeTable`。
- 通用组件统一从 `@ghcloud/cube-ui` 引入。
- 门禁接口直接 deep-import `@ghcloud/cube-services-client/access-control.client`。
- qiankun mount 时通过 `authRequest.updateAuth(props.auth)` 初始化鉴权。
- 不使用 legacy app factory、Vuex、全局 `$api`、`g-table` 或 `g-select`。

## 接口链路

```text
access-control app
  -> @ghcloud/cube-services-client/access-control.client
  -> /gw-bff/access-control/*
  -> gateway AccessControlController / AccessControlProxyService
  -> 原门禁服务
```

请求中的可选查询条件由页面使用空字符串表示未选择状态，不传 `null`。

## 开发与构建

```bash
bun run dev
bun run build:prod
```

应用不提供独立运行模式，也不包含 mock。开发调试需由主应用通过 qiankun 挂载，并使用主应用下发的鉴权信息请求真实 BFF。

## 目录

```text
src/
├── app.ts                 # Vue、Router、Pinia 装配
├── app.tsx                # ConfigProvider 与 RouterView
├── main.ts                # qiankun 生命周期与 authRequest 初始化
├── constants/env.ts
├── router/index.ts
└── views/pages/
    ├── roomHome.tsx
    ├── roomDevicePage.tsx
    ├── roomLogPage.tsx
    ├── roomEventPage.tsx
    └── components/
```
