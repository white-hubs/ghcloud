# 0007 — 环境变量策略

- **Status**: accepted
- **Date**: 2026-04-24
- **Tags**: env, vite, gitignore

## Context

历史上 `prod/cube/apps/*` 各自有 `.env.dev`、`.env.test`、`.env.prod`，其中部分**被意外提交**导致 QA/prod 配置泄漏；也存在"运维本地写入的敏感值和仓库版本冲突"的长期问题。

## Decision

### 1. 仓库只保留 `.env.example`

新应用 `.gitignore`：

```gitignore
.env
.env.*
!.env.example
```

具体环境的 `.env.dev` / `.env.test` / `.env.prod` 不进入仓库；由各环境的 CI/部署脚本注入。

### 2. 全局常量走 Vite `define`

构建时注入的静态常量（`applicationCode`、`mock` 等）写在 `vite.config.ts` 的 `define.__ENV__`，在 `src/vue-app-env.d.ts` 中声明类型。

业务从 `@/constants/env` 读取，不直接访问 `import.meta.env`。

### 3. 运行时可变的 env 走 `import.meta.env`

`VITE_USE_MOCK`、`VITE_API_BASE` 等"按环境差异化"的值走 Vite 标准 env（必须带 `VITE_` 前缀）：

```ts
// .env.dev（不进入仓库）
VITE_USE_MOCK=true

// vite.config.ts —— 空前缀可同时读到 VITE_* 和 构建侧变量（如 PUBLIC_PATH）
const env = loadEnv(mode, process.cwd(), '')
const useMock = env.VITE_USE_MOCK !== 'false'
```

### 4. 构建侧变量不加 VITE_ 前缀

仅在 `vite.config.ts` 内部消费、不应泄漏到业务代码的变量**不加 `VITE_` 前缀**：

| 变量 | 用途 |
|---|---|
| `PUBLIC_PATH` | Vite `base` / 资源 CDN 前缀，默认 `/`，由部署环境注入 |

这样业务在 `@/constants/env` 层无法直接访问构建配置，避免误用。

### 5. 敏感信息禁止入 `.env.example`

`.env.example` 仅列字段名和注释，不含任何真实密钥。

## Consequences

### 正面

- 杜绝环境配置泄漏
- 每个开发者本地自由定制，不影响其他人

### 负面

- 新同事拉代码后需额外一步"从同事那里拷 `.env.dev`"
- CI 需统一注入机制（目前已在 `.gitlab-ci.yml` 中实现）
