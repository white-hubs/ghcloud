# 0008 — qiankun 集成规范

- **Status**: accepted
- **Date**: 2026-04-24
- **Tags**: qiankun, micro-frontend

## Context

仓库内所有 `prod/cube/apps/*` 都是 qiankun 子应用。集成细节分散在各应用的 `main.ts`/`vite.config.ts` 中，升级维护成本高；部分应用还存在：

- 挂载 id / projectName / base 三者不一致，导致样式作用域错位
- 独立运行模式（非 qiankun）丢失；只能嵌到主应用才能调试
- 卸载时没有完全清理 Vue 实例和事件

## Decision

### 1. 四元组一致性

每个子应用的下列四个标识必须**完全一致**（仅大小写约定不同）：

| 位置 | 值 | 示例 |
|---|---|---|
| `vite.config.ts` 的 `projectName` | kebab-case | `template-app` |
| `main.ts` 中 `mount` 的 `base` | `/portal/<projectName>` | `/portal/template-app` |
| `index.html` 的挂载 `id` | PascalCase | `TemplateApp` |
| `vite.config.ts` 的 `@cube-theme-antd3-scope-selector` | `#<id>` | `#TemplateApp` |

脚手架 `bun run scaffold` 会一次性生成正确的四元组。

### 2. 生命周期

`main.ts` 必须实现 bootstrap/mount/unmount/update 四个钩子，且：

```typescript
private mount (props: QiankunProps): void {
  const { auth } = props as { auth: AuthState }
  authRequest.updateAuth(auth)   // 必须先注入鉴权
  this.app = new Application({ base: '/portal/<slug>', ...props })
  void this.app.install()
}

private unmount (): void {
  this.app?.uninstall()  // 调用 Vue 的 unmount()，释放事件/响应式订阅
}
```

### 3. 独立运行

所有子应用必须支持 `qiankunWindow.__POWERED_BY_QIANKUN__ === false` 时的独立运行，以便：

- 本地只起一个 8888 端口就可以调试，不必起主应用
- Dev 默认启用 mock（见 ADR-0007），用独立运行 + mock 即可覆盖 90% 业务场景

### 4. 样式隔离

**不要**依赖 qiankun 的 `sandbox.experimentalStyleIsolation` / `strictStyleIsolation`。我们通过 **Less 变量作用域** + **`ConfigProvider prefixCls`** 隔离：

```less
@cube-theme-antd3-scope-selector: '#TemplateApp';
```

这样每个子应用的 antd v3 残留样式只作用在自身根 `id` 下。

### 5. 路由

- `createWebHistory(base)`，`base` 由主应用透传
- 路由 `meta` 的 `title`/`permission` 在主应用下发菜单时被 `Application#handleRouter` 覆盖
- **不要**在 `router.beforeEach` 中自己查 menu；交由 `useCubeLayout`/`usePageName` 处理

### 6. 资源 publicPath

- Vite 的 `base` 默认 `'/'`，不绑定任何 nexus/仓库路径后缀（历史遗留的 `/apps/@ghcloud/<pkg>` 已废弃）
- 构建侧变量 **`PUBLIC_PATH`**（**不**加 `VITE_` 前缀）用来按部署环境覆盖，读取方式：

  ```ts
  const env = loadEnv(mode, process.cwd(), '')  // 空前缀同时拿到构建/运行时变量
  const publicPath = env.PUBLIC_PATH ?? '/'
  ```

- 生产部署由主应用/nginx 决定前缀，CI 注入 `PUBLIC_PATH` 即可；本地 dev 无需配置
- 不要把 publicPath 写死在 `vite.config.ts` 里

## Consequences

### 正面

- 四元组脚手架化，人工出错的空间缩小
- 独立运行+mock 显著提升开发体验
- 样式隔离方案稳定，无需依赖 qiankun 沙箱实验特性

### 负面

- 新增子应用必须同步改四处；未遵守规范会导致样式错位（CI 可脚本化检测）
