# TODO：@cube-ai/agent-sdk-client-* 依赖与 Vue 单例

## 背景

`@cube-ai/agent-sdk-client-vue` 等 SDK 通过 `peerDependencies.vue` 消费 Vue。若 SDK 与 app 解析到**不同** `node_modules/vue`（版本或路径不一致），prod 打包后会出现**两份 Vue 运行时**：

- app 侧：`ref` / `watch` / 组件渲染走一份 Vue
- SDK 侧（`provideAssistant` 等）：`ref()` 走另一份 Vue

表现为：接口均 200，store 状态已更新，但 UI 一直「模型加载中…」/ Spin 不消失。dev 往往正常（Vite 预构建易合并 vue），prod / preview dist 复现。

**2026-06 临时修复**：`vite.config.ts` 对 `vue`、`vue-router` 做 `resolve.alias` + `dedupe`（见文件内注释）。

SDK 侧同步做了 `loadingModels` / `loadingSessions` 独立 ref（`@cube-ai/agent-sdk-client-vue` `provide-assistant.ts`），属于防御性改进；**根因仍是 Vue 双实例**。

## 依赖迁移状态

`package.json` 已改为根 catalog `catalog:cube-ai`（`0.0.0-m2-skeleton-c`），**不再**使用 `link:@cube-ai/...`。

### 1. 依赖声明

- [x] `package.json` 中 `@cube-ai/agent-sdk-client-*` / `@cube-ai/contracts` 使用 `catalog:cube-ai`
- [ ] 确认 SDK 的 `peerDependencies.vue` 与 app 的 `vue` 版本一致（同一 catalog 条目）
- [ ] 上游重发：发布 manifest 的 `exports` 须指向 **`dist/`**（`0.0.1-alpha.0` 已修复）

### 2. 构建配置

- [ ] 验证 prod / preview build 仅解析**一份** vue：

  ```bash
  cd prod/cube/apps/ai-application/app
  bun -e "
  import { createRequire } from 'node:module';
  const req = createRequire(import.meta.url);
  const sdkReq = createRequire(req.resolve('@cube-ai/agent-sdk-client-vue/package.json'));
  console.log('app', req.resolve('vue'));
  console.log('sdk', sdkReq.resolve('vue'));
  console.log('same', req.resolve('vue') === sdkReq.resolve('vue'));
  "
  ```

  期望 `same: true`。

- [ ] 若正式包 + 单例 vue 已稳定，评估**移除** `vite.config.ts` 中 vue alias/dedupe（或保留为 monorepo 通用防护，需团队共识）

### 3. 功能回归

- [ ] `bun run build:prod` 部署路径：主壳 qiankun 打开 AI 助手，模型列表加载完成，无永久 Spin
- [ ] `bun run build:preview` + `preview:local`：entry 为 `http://localhost:8890/apps/@ghcloud/cube-ai-application-app/`
- [ ] 会话列表、发消息、模型下拉、左侧历史 Spin 行为与 dev 一致

### 4. 上游 cube-ai-project

- [ ] 发布前确认 `agent-sdk-client-vue` 不将 `vue` 打进 bundle（`external vue`）
- [ ] 发布流程合并 `publishConfig`，manifest 中 `exports` / `dependencies` 不得残留 `workspace:*` 或 `catalog:`
- [ ] 文档注明：消费方须在 Vite/Webpack 中保证 vue 单例（peer + dedupe）

## 相关文件

| 文件 | 说明 |
|------|------|
| `vite.config.ts` | vue alias / dedupe（防 SDK peer 解析到第二份 vue） |
| `package.json` | `catalog:cube-ai` 依赖 |
| `vite.build.preview.config.ts` / `.env.preview` | 本地 qiankun preview（与 prod 部署 publicPath 不同） |
| `@cube-ai/agent-sdk-client-vue` → `provide-assistant.ts` | loading ref + useAssistant 自身 provides 优先 |

## 参考

- Debug 会话结论：duplicate Vue 导致 `loadingModels` ref 更新无法触发 app 侧 watch（2026-06）
- ADR：`@cube-ai/agent-sdk-client-vue` ADR-0022 §D6（provideAssistant / useAssistant）
