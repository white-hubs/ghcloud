# @ghcloud/cube-risk-graded-control-app

风险分级管控 PC 子应用（qiankun micro-app）。

## 本地开发

```bash
cd prod/cube/apps/risk-graded-control/app
bun run dev
```

独立 dev 无 Portal 登录时，`main.ts` 会注入 `DEV_MOCK_AUTH` 以便 GIS 字典等能力可用。

## 数据与接口

- 业务接口通过 BFF `@ghcloud/cube-services-client/risk-graded-control.client` 调用（`/gw-bff/risk-graded-control/*` → 开河 `/risk-control/*`）
- Gateway 需配置 `riskControlUrl`（或环境变量 `RISK_CONTROL_URL`）
- GIS 地图中心点通过 `src/api/dispatch-map-config.ts` 读取平台字典（`COMMAND_DISPATCH_MAP_CONFIG`）

## 标识

| 项 | 值 |
|---|---|
| slug | `risk-graded-control` |
| mount id | `#RiskGradedControl` |
| APPLICATION_CODE | `RISK_GRADED_CONTROL` |

## 构建

```bash
bun run build
```
