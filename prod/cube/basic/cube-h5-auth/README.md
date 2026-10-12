# @ghcloud/cube-h5-auth

H5 鉴权复用模块，提供登录页、路由守卫、Session 管理、租户选择与访客模式能力。

## 包定位

- 路径：`prod/cube/basic/cube-h5-auth`
- 包名：`@ghcloud/cube-h5-auth`
- 主要场景：
  - Vue H5 应用统一登录拦截
  - 登录页能力复用（含企业租户选择）
  - 访客模式（可按业务关闭）

## 对外导出（`src/main.ts`）

- `installH5AuthGuard(router, options)`
- `LoginPage`
- `authSession`
- `api/login` 相关能力

## 核心能力

- 路由鉴权守卫：按 `meta` 规则控制访问
- 登录态管理：token / tenant 的 session 存取
- 登录页复用：用户名密码登录 + 企业选择
- 访客进入：可配置是否展示
- 运行时扩展：支持 runtime login（`runtimeProvider/runtimeUrl`）

## 快速接入

### 1) 安装依赖（消费者）

```json
{
  "dependencies": {
    "@ghcloud/cube-h5-auth": "workspace:^"
  }
}
```

### 2) 注册登录页路由

```ts
{
  path: "/auth/login",
  component: () => import("@ghcloud/cube-h5-auth").then((m) => m.LoginPage),
  meta: { title: "登录", public: true },
}
```

### 3) 业务路由声明需登录

```ts
{
  path: "/entry",
  component: Entry,
  meta: { requiresAuth: true },
}
```

### 4) 入口安装守卫

```ts
import { installH5AuthGuard } from "@ghcloud/cube-h5-auth";

installH5AuthGuard(router, {
  loginPath: "/auth/login",
  defaultRedirectPath: "/entry",
  getToken: () => authStore.token,
  isInApp: () => getEnvironment() === "cubeApp",
  onAuthChanged: (authInfo) => {
    initAuthStore(authInfo);
  },
  onAuthCleared: () => {
    initAuthStore({ token: "", tenant: "", terminal: "bimops-manage-app" });
  },
});
```

## 路由规则

- 公开页：`meta.public === true`（默认 key，可配）
- 需登录页：`meta.requiresAuth === true`（默认 key，可配）
- 守卫放行条件（任一满足）：
  - `authSession.isInApp()`
  - `authSession.hasToken()`
  - `authSession.isGuestMode()`

## Token 规范

- Session 存储时会自动规范为 `Bearer ` 前缀。
- `onAuthChanged` 回调中的 `token` 为去前缀后的值（便于业务 store 二次拼接 header 时避免 `Bearer Bearer`）。

## 访客模式

- 登录页默认显示「游客进入」。
- 可通过 `showGuestEnter: false` 关闭该入口。
- 游客进入会清空登录态并标记 guest mode；真实登录后会自动清理 guest mode。

## 运行时扩展（可选）

支持在宿主注入运行时登录逻辑：

- `runtimeProvider?: () => Promise<AuthRuntime>`
- `runtimeUrl?: string`

优先级：`runtimeProvider` > `runtimeUrl` > 包内默认登录流程。

## 常见坑位

- `isInApp` 不等于“已登录”，接口鉴权请以 token 存在与否为准。
- `loginPath` 必须与登录页路由 path 一致。
- 需要登录的路由必须显式声明 `meta.requiresAuth`。
- 登录页路由必须声明 `meta.public`，避免自身被守卫重定向。

## 构建与发布

```bash
cd prod/cube/basic/cube-h5-auth
bun run build
```

- 开发入口：`src/main.ts`
- 发布入口：`publishConfig.main/module -> lib/main.js`
- 发布内容：`files` 仅包含 `lib/` 与 `package.json`
