# 0003 — API 调用分层

- **Status**: accepted
- **Date**: 2026-04-24
- **Tags**: api, client, interface, gateway

## Context

早期各应用自建 `api/server.ts`，每个应用独立 `new CubeXxxService(authStore)`，同一个后端接口在多个应用中**重复定义**，类型也不统一。部分应用还通过 `GatewayProxy` 做统一错误处理，但并非所有项目都跟进。

2026 年起，仓库引入三层架构 `prod/cube-services/`：

```
interfaces/   →  @ghcloud/cube-service-interface     # 纯类型/枚举，全仓唯一来源
gateway/      →  @ghcloud/cube-gateway(后端)          # BFF 服务端
client/       →  @ghcloud/cube-services-client       # 前端 SDK（deep-import）
```

目标：**全仓任一接口类型定义只有一份；前端调用唯一推荐 `cube-services-client`**。

## Decision

### 1. 类型/枚举/请求/响应

一律从 `@ghcloud/cube-service-interface/<module>` **deep-import**：

```typescript
import type { TemplateDemoRecord } from '@ghcloud/cube-service-interface/template-demo'
import { TemplateDemoStatus } from '@ghcloud/cube-service-interface/template-demo'
```

禁止在应用内重复定义后端已有的类型。

### 2. API 调用

一律从 `@ghcloud/cube-services-client/<module>.client` **deep-import**：

```typescript
import { useAuthRequest } from '@ghcloud/cube-services-client/auth-request'
import { listTemplateDemo } from '@ghcloud/cube-services-client/template-demo.client'

const result = await useAuthRequest(() => listTemplateDemo(params))
```

### 3. 未接入 BFF 的接口

当前 BFF 覆盖的接口较少，大量接口仍直连原服务。过渡期规则：

- **`interface` 层照写**（类型是统一资产，不受 BFF 进度影响）
- **`client` 层的 URL 先指向原服务路径**（不经 `/gw-bff/`）
- BFF 开始代理后，**仅改 client 的 URL 前缀**为 `/gw-bff/...`，上游业务零改动

示例：[`prod/cube-services/client/src/template-demo.client.ts`](../../prod/cube-services/client/src/template-demo.client.ts)

### 4. 禁止项

| 反模式 | 替代方案 |
|---|---|
| 在 `src/api/` 中做 client 中转 | 页面直接 deep-import client |
| `new CubeXxxService(authStore)` | `useAuthRequest(() => xxxClient(...))` |
| 从 `@ghcloud/cube-services-client` **根路径** import | deep-import `/xxx.client` 子路径（见 ADR-0010） |
| 应用内重复定义后端类型 | 补充到 `cube-service-interface/<module>` |

### 5. `src/api/` 目录的特例

仅当 **一次请求需要组合多个 client + 做领域级转换** 时，才允许建一个 `src/api/` 文件作为组合点；**文件里不得新增接口定义**。此类情况需在 PR 描述中说明。

## Consequences

### 正面

- 接口定义全仓唯一，类型漂移问题消失
- BFF 渐进代理不影响业务代码
- Tree-shaking 彻底（deep-import）

### 负面

- 新增接口需要先提 PR 到 `cube-services/interfaces` 和 `cube-services/client`，而非在应用内现写
- 过渡期 client 中同时存在"走 BFF"和"走原服务"两种 URL 约定

## 参考

- [`prod/cube-services/readme.md`](../../prod/cube-services/readme.md)
- ADR-0004、ADR-0010
