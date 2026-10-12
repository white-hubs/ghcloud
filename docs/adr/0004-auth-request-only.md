# 0004 — 认证上下文注入统一用 authRequest

- **Status**: accepted
- **Date**: 2026-04-24
- **Tags**: auth, qiankun, authRequest

## Context

历史上子应用的鉴权/租户信息有两种注入方式：

1. **老路径**：`initAuthStore(props.auth)` + `initGenericComponentAuth(props.auth)` + 各 service 各自读 authStore
2. **新路径**：`authRequest.updateAuth(props.auth)` + `useAuthRequest(() => xxx())` 拦截器注入 headers

两者并行导致：

- `alarm-center` 同时调用两个，其中任一 update 失败都可能导致鉴权不一致
- `@ghcloud/generic-component` 即将合并到 `@ghcloud/cube-app-design`，`initGenericComponentAuth` 会消亡

## Decision

### 1. 模板 / 新应用

**只使用 `authRequest`**：

```typescript
// src/main.ts
import { authRequest, type AuthState } from '@ghcloud/cube-services-client/auth-request'

private mount (props: QiankunProps): void {
  const { auth } = props as { auth: AuthState }
  authRequest.updateAuth(auth)
  // ...
}
```

业务层：

```typescript
import { useAuthRequest } from '@ghcloud/cube-services-client/auth-request'
import { listTemplateDemo } from '@ghcloud/cube-services-client/template-demo.client'

const result = await useAuthRequest(() => listTemplateDemo(params))
```

### 2. 禁止项

- 禁止在新应用中调用 `initAuthStore` / `initGenericComponentAuth`
- 禁止在应用内 `new CubeAuthRequest()`。`cube-services-client` 导出的 `authRequest` 在每个子应用 bundle 内都是独立实例，无跨应用污染
  - 例外：同一应用内需要多份独立身份上下文（如双租户切换）时可本地 `new CubeAuthRequest()`，并在 PR 中说明
- 禁止从 `@ghcloud/cube-services-client` **根路径** 导入 `authRequest`/`useAuthRequest`；必须 deep-import `/auth-request`（见 ADR-0010）

### 3. 独立运行（非 qiankun）兜底

子应用必须支持本地 `bun run dev` 独立启动（见 ADR-0008 §3）。此时没有主应用注入 auth，业务第一次 `useAuthRequest(...)` 会抛 `Error: Login state is not ready!`。

**规范做法**：在 `main.ts` 的 `renderWithDefault()`（非 qiankun 分支）里用 client 导出的 `DEV_MOCK_AUTH` 占位：

```typescript
import { authRequest, DEV_MOCK_AUTH } from '@ghcloud/cube-services-client/auth-request'

private renderWithDefault (): void {
  authRequest.updateAuth(DEV_MOCK_AUTH)
  this.app = new Application({})
  void this.app.install()
}
```

- `DEV_MOCK_AUTH` 由 `@ghcloud/cube-services-client/auth-request` 统一提供，值是占位 token + 0 号租户
- 只在**独立运行**分支注入，qiankun 分支继续用 `props.auth`
- 依赖 dev 默认 mock（ADR-0007）拦截请求，占位 token 不会到达真实后端

### 4. 存量项目迁移

短期内保留 `initAuthStore`，但所有**新增**代码按本 ADR 执行。`authStore`/`generic-component` 随 `cube-app-design` 合并完成后统一清理。

## Consequences

### 正面

- 鉴权链路唯一，心智负担降低
- 移除 `generic-component` 依赖可减少 bundle 体积
- AI 和新成员可直接看 `prod/cube/template/app/src/main.ts` 学习

### 负面

- 存量项目需要一次性迁移（纳入各自重构计划）
