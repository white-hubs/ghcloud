# AI Application App

`prod/cube/apps/ai-application/app` 是 AI 应用中心微前端，当前包含模型管理、知识文档列表、文档分段与召回测试、助手聊天等页面。

## 本地运行

```bash
cd prod/cube/apps/ai-application/app
bun install
bun run dev
```

默认端口：`8890`。

## 构建与预览

```bash
bun run build:dev
bun run build:test
bun run build:prod
bun run preview
```

## 联调说明

- 页面路由：
  - `/knowledge-documents`
  - `/knowledge-documents/:bizDocumentId/segmentation`
  - `/knowledge-documents/:bizDocumentId/retrieval-test`
  - `/model-management`
- 微前端挂载基路径：`/portal/ai-application`
- 默认容器：`#AiApplicationApp`
- AI 能力经 `@ghcloud/cube-ai-application-service` 调用 **AI Center**（网关前缀 `/api/ai-center`），见 `../service/src/transport/gateway-fetch.ts`
- 本地联调可在 `.env.dev` 设置 `VITE_AI_CENTER_API_BASE=http://localhost:8890/api/ai-center`（qiankun 子应用需绝对 URL）
- 开发代理（`vite.dev.config.ts`）：`/api`、`/api/ai-center` → `DEV_PROXY_TARGET`（默认 `http://192.168.0.133:13145/`，可在 `.env` / `.env.dev` 覆盖）

## 接口依赖

前端经 service 层访问 AI Center（`@cube-ai/*` SDK + `CubeGateway`），主要路径形如：

- `GET /api/ai-center/llm/console/provider-types`
- `GET /api/ai-center/llm/console/providers`
- `GET /api/ai-center/llm/console/providers/:providerId`
- `POST /api/ai-center/llm/console/providers`
- `PUT /api/ai-center/llm/console/providers/:providerId`
- `DELETE /api/ai-center/llm/console/providers/:providerId`
- `PUT /api/ai-center/llm/console/providers/:providerId/settings`
- `POST /api/ai-center/llm/console/providers/:providerId/test-connection`
- `GET /api/ai-center/llm/console/providers/:providerId/models`
- `POST /api/ai-center/kb/documents/:bizDocumentId/reindex`（分段）
- `GET /api/ai-center/kb/documents/:bizDocumentId/chunks`
- `POST /api/ai-center/kb/search/by-documents`（召回测试）
- `GET /api/management/knowledge/page`（业务知识文档列表，cube2 内容管理）
- `GET /api/management/knowledge/detail`
- `${VITE_AI_CENTER_API_BASE}/agent`（助手 SSE，见 `assistant-chat.tsx`）

旧 ghcloud `ai-server` / `/ai/*` 栈已移除；后端能力由 **cube-ai-project** 的 `apps/ai-center` 提供。

## 说明

- API 返回中的 `bigint` / 超安全整数 ID 已在客户端统一转为 `string`，避免精度问题。
- 文档分段页支持“预览分段”“查看已分段”“确认并分段”“编辑分段”“召回测试”整条链路。
- 业务知识文档列表复用知识问答应用已有分页接口。

## 验证

建议至少执行以下检查：

```bash
bun test prod/cube/apps/ai-application/service/src/service.test.ts
bun x tsc --noEmit -p prod/cube/apps/ai-application/service/tsconfig.json
```

说明：

- 前端页面相关文件已通过 IDE lint 检查。
- `bun x tsc --noEmit -p prod/cube/apps/ai-application/app/tsconfig.json` 可能被 monorepo 内现存的 `cube-ui` 类型问题阻塞。
