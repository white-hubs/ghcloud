# @ghcloud/cube-fetch-service

平台级、领域无关的通用 HTTP 抓取微服务（Bun + `@dangao/bun-server`）。

本服务只做 **HTTP GET → 内容解码 → 结构化输出**，不含信源配置、定时调度、关键词过滤、LLM 等业务逻辑。任意后端微服务、Agent、BFF 等调用方均可接入。

- **HTTP REST（双路径）**：索引拆条 `POST /fetch/index`；单篇正文 `POST /fetch/article`
- **MCP 工具**：Agent 单篇抓取 `web_fetch`（`url`、`prompt` 必填，claw-code WebFetch 兼容，**不支持列表/limit**）
- 含 SSRF 防护（DNS resolve + IP 黑名单 + redirect 重校验）

## 双路径架构

不再使用统一的 `POST /fetch`。索引与正文职责分离，避免 HTML 页面上「猜列表还是文章」的不稳定启发式。

```
POST /fetch/index   → RSS / JSON / HTML 列表 → items[{ title, url, publishedAt }]（无 content）
POST /fetch/article → 单 URL 单条正文（claw-code WebFetch：HTML Readability / 其余整页文本）
MCP web_fetch       → fetchArticle + prompt → { result, … }（claw-code 省 token）
```

典型两阶段工作流：

1. `POST /fetch/index` 拉 Feed 或列表页，拿到 `items[].url`
2. 对每个 URL 调用 `POST /fetch/article`（REST）或 MCP `web_fetch`（Agent）获取正文

## 调用方与双入口

REST 与 MCP 共用 `FetchService`，仅是传输层不同。

| 调用方 | 推荐入口 | 说明 |
|--------|----------|------|
| 任意后端微服务 | `POST /fetch/index` / `POST /fetch/article` | Bearer 鉴权 |
| Agent / LLM 运行时 | MCP `web_fetch` | 单篇 + `prompt`，省 token |
| BFF / 平台内 TS 服务 | REST 双路径 | 同上 |
| Cursor 等远程 MCP 客户端 | MCP HTTP `/mcp` | 与 REST 同进程、同端口 |

| 入口 | 典型场景 | 鉴权 | 必填字段 | 典型输出 |
|------|----------|------|----------|----------|
| `POST /fetch/index` | Feed / 列表页拆条 | Bearer | `url`, `limit` | `items[]`（title/url/publishedAt） |
| `POST /fetch/article` | 单 URL 正文（始终 1 条 item） | Bearer | `url` | `items[1].content`（可选 `prompt` → `result`） |
| MCP `web_fetch` | Agent 读单页 | 无 | `url`, `prompt` | `{ url, result, items?, … }` |
| MCP HTTP `/mcp` | Agent 远程接入 | 无（内网） | `url`, `prompt` | Streamable HTTP |

**`prompt` 说明：**

- REST `/fetch/index`：**不传** `prompt`，返回完整 `items[]`
- REST `/fetch/article`、MCP `web_fetch`：可传 `prompt`（MCP 必填），额外填充 claw-code 风格 `result` 并截断 item 正文以省 token

## 快速启动

```bash
cd prod/cube-services/fetch-service
export FETCH_SERVICE_TOKEN=your-secret-token
bun install
bun run start
```

默认端口 `30210`，配置文件见 `config/app.example.json`。

### MCP stdio（Cursor 子进程）

```bash
bun run mcp:stdio
```

Cursor MCP 配置示例：

```json
{
  "mcpServers": {
    "cube-fetch": {
      "command": "bun",
      "args": ["run", "mcp:stdio"],
      "cwd": "/path/to/ghcloud-new/prod/cube-services/fetch-service"
    }
  }
}
```

### MCP HTTP（与 REST 同进程）

服务启动后默认暴露 `http://127.0.0.1:30210/mcp`（Streamable HTTP，stateless）。可通过 `mcpHttpEnabled` / `mcpPath` 配置。

## 环境变量

| 变量 | 说明 | 默认 |
|------|------|------|
| `PORT` | 服务端口 | `30210` |
| `HOSTNAME` | 监听地址 | `0.0.0.0` |
| `FETCH_SERVICE_TOKEN` | REST Bearer 鉴权令牌 | 空（未配置时拒绝 `/fetch/*`） |
| `MCP_HTTP_ENABLED` | 是否启用 `/mcp` | `true` |
| `MCP_PATH` | MCP HTTP 路径 | `/mcp` |
| `MAX_LIMIT` | `/fetch/index` 的 `limit` 上限 | `200` |
| `MAX_BODY_BYTES` | 响应体上限 | `5242880` |
| `MAX_REQUEST_BODY_BYTES` | 请求体 Content-Length 上限 | `65536` |
| `DEFAULT_TIMEOUT_MS` | 默认超时 | `20000` |
| `MAX_TIMEOUT_MS` | `timeoutMs` 上限 | `60000` |
| `DEFAULT_MAX_REDIRECTS` | 默认 redirect 次数 | `10` |
| `MAX_REDIRECTS` | `maxRedirects` 上限 | `10` |

## API

### GET /health

无需鉴权。

### POST /fetch/index

索引 / Feed / 列表页拆条：

```bash
curl -sS -X POST 'http://127.0.0.1:30210/fetch/index' \
  -H 'Authorization: Bearer your-secret-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://example.com/feed.xml",
    "limit": 20
  }'
```

支持 `rss`、`json`、`html`（同站链接列表或 JSON-LD ItemList）。`text` / `unknown` 会返回错误，请改用 `/fetch/article`。

请求体类型见 `FetchIndexRequest`（`src/contracts/types.ts`）。

### POST /fetch/article

对齐 claw-code **WebFetch**：任意 URL 只返回 **1 条** `items`，`totalMatched` 恒为 1。

| 响应类型 | 处理方式 |
|----------|----------|
| **HTML** | Readability 提取正文（单条） |
| **RSS / JSON / 纯文本等** | 整页 body 归一化：`html/xml` 去标签纯文本，JSON 等 trim（**1 条 item**） |

需要拆条请用 `/fetch/index`（RSS/JSON/HTML 列表）。

```bash
curl -sS -X POST 'http://127.0.0.1:30210/fetch/article' \
  -H 'Authorization: Bearer your-secret-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://example.com/article"
  }'
```

请求体类型见 `FetchArticleRequest`。

### `prompt` 模式（Agent 省 token）

MCP `web_fetch` 与 REST `/fetch/article` 均可传 `prompt`，返回 claw-code 同款 `result` 短文本：

| prompt 关键词 | `result` |
|---------------|----------|
| 含 `title` | `Title: …` 或 ~600 字 preview |
| 含 `summary` / `summarize` | ~900 字 preview |
| 其他 | `Prompt: …` + ~900 字 preview |

REST 示例：

```bash
curl -sS -X POST 'http://127.0.0.1:30210/fetch/article' \
  -H 'Authorization: Bearer your-secret-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://example.com/article",
    "prompt": "summarize this page"
  }'
```

## `items[].content` 语义

| 路径 / 场景 | `content` 行为 |
|-------------|----------------|
| **`/fetch/article`（HTML）** | Readability 正文（**1 条 item**） |
| **`/fetch/article`（RSS/JSON 等）** | RSS/XML 去标签纯文本；JSON 为 trim 后原文（**1 条 item**） |
| **`/fetch/index`（RSS）** | 仅 `content:encoded` / Atom `content` 全文；**不用** `description` 摘要 |
| **`/fetch/index`（HTML 列表）** | **不填** `content` |
| **`/fetch/index`（JSON）** | 优先 `content` / `body` / `text` 字段 |

列表页或 Feed 摘要**不能代替正文**。需要正文时，对 `items[].url` 再调用 **`POST /fetch/article`** 或 MCP `web_fetch`。

## 后端服务集成示例

1. 配置 fetch-service 地址与 `FETCH_SERVICE_TOKEN`
2. `POST /fetch/index` 获取条目列表（`{ url, limit }`）
3. 对需要的 URL 调用 `POST /fetch/article` 获取 `content`
4. `totalMatched` 为过滤空 item 后、截断前的条数

**示例：安全舆情定时采集**

- 信源配置、调度、cron、关键词过滤、入库均在业务服务侧
- 列表：`POST /fetch/index`；正文：`POST /fetch/article`

## 开发

```bash
bun test
bun run build
bun run build:node   # 打包 Node 可运行单文件 dist/cube-fetch-service.mjs
bun run mcp:stdio   # 单独测 MCP stdio
```

## Docker 镜像（aarch64）

与 `gateway/Dockerfile.aarch64` 相同：Bun 构建 + Node slim 运行。

```bash
# 在含 id_rsa 的构建目录执行（与 gateway 一致）
docker build -f prod/cube-services/fetch-service/Dockerfile.aarch64 \
  --build-arg BRANCH=lc/publicopinion/feat \
  -t cube-fetch-service:latest .
```

运行时统一通过环境变量配置，例如：

| 变量 | 说明 | 默认 |
|------|------|------|
| `FETCH_SERVICE_TOKEN` | REST Bearer 鉴权 token | 空 |
| `PORT` | 服务端口 | `30210` |
| `HOSTNAME` | 监听地址 | `0.0.0.0` |
| `LOG_LEVEL` | 日志级别 | `info` |
| `MCP_HTTP_ENABLED` | 是否启用 MCP HTTP | `true` |
| `MCP_PATH` | MCP HTTP 路径 | `/mcp` |

其余超时、重定向、body 大小等见 `src/config/app.config.ts`。
