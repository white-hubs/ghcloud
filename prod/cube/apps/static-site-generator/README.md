# 开河静态站点生成器

可视化拖拽配置 → 静态站点生成的完整链路。支持 59+ 开箱即用组件，Astro SSR 预渲染，一键部署到 CDN。

---

## 架构概览

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  generator-config│────▶│     service     │────▶│     DB / API    │
│   (设计器前端)    │     │  (配置数据服务)  │     │  (站点配置存储)  │
│  Vue + Vite     │     │  Vite Library   │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               ▲
         │  保存配置                                       │
         │                                               │
         ▼                                               │
┌─────────────────┐     ┌─────────────────┐     ┌───────┴─────────┐
│ generator-service│────▶│  generator-cli  │────▶│   部署目标       │
│  (构建调度服务)   │     │  (静态构建工具)  │     │ 七牛云 / SFTP   │
│  Bun Server     │     │  Astro + Vue    │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         ▲
         │ 触发构建
┌────────┴────────┐
│   管理后台 / CI  │
└─────────────────┘
```

### 数据流

1. **配置阶段**：用户在 `generator-config` 设计器中拖拽组件、填写 props，配置保存到后端
2. **构建阶段**：`generator-service` 接收构建任务，拉取配置 JSON，调用 `generator-cli` 执行 Astro 构建
3. **输出阶段**：`generator-cli` 读取 `schema.json` + `site.config.json`，SSR 渲染为纯静态 HTML
4. **部署阶段**：`generator-service` 将构建产物推送到七牛云 CDN 或 SFTP 服务器

---

## 子项目一览

| 目录 | 职责 | 技术栈 | 包名 |
|------|------|--------|------|
| `generator-config/` | 设计器前端（微应用） | Vue 3 + Vite + qiankun | `@ghcloud/cube-static-site-generator-app` |
| `ssg-components/` | 组件库（59+ 组件） | Vue 3 + TypeScript + Tailwind | `@ghcloud/cube-static-site-generator-components` |
| `generator-cli/` | 静态站点构建 CLI | Astro + @astrojs/vue + TypeScript | `@ghcloud/cube-static-site-generator-cli` |
| `generator-service/` | 构建调度与部署服务 | Bun Server | `@ghcloud/cube-generator-service` |
| `service/` | 配置数据服务（library） | Vite + TypeScript | `@ghcloud/cube-static-site-generator-service` |
| `migrate-scripts/` | 数据迁移脚本 | Bun + TypeScript | — |

---

## 组件开发

组件位于 `ssg-components/src/components/<kebab-case>/`，每个组件必须包含：

```
your-component/
├── your-component.vue    # Vue 3 Composition API + <script setup>
└── schema.ts             # 设计器表单配置
```

### schema.ts 规范

- `type: 'array'` 字段必须有 `defaultValue: []`
- `type: 'object'` 字段必须有 `defaultValue`
- 颜色字段必须有 `editor: 'color'`
- 图片/图标字段必须有 `editor: 'image'`
- 视频地址字段必须有 `editor: 'image'`（复用素材选择）

详见 [SSG Component Development Skill](../../.agents/skills/ssg-component-development/SKILL.md)

### 组件注册

新增组件需要在两处注册：

1. **`ssg-components/src/index.ts`** — 导出组件和 schema
2. **`generator-config/src/designer/component-map.ts`** — 映射到设计器预览组件

---

## 本地开发

### 设计器前端

```bash
cd generator-config
bun install
bun run dev          # 本地开发
bun run build        # 生产构建
```

### 组件库

```bash
cd ssg-components
bun install
bun run typecheck    # TypeScript 类型检查
```

### 构建服务

```bash
cd generator-service
bun install
bun run dev          # 启动 Bun Server（默认 3000 端口）
```

### 构建 CLI（本地测试构建）

```bash
cd generator-cli
bun install
bun run build

# 执行构建（需要准备 schema.json + site.config.json）
node dist/cli.js build --input ./data --output ./dist
```

---

## 构建与部署

### 构建任务 API

`generator-service` 提供 HTTP API 管理构建任务：

```bash
# 创建构建任务（从 URL 拉取配置）
POST /tasks
{ "url": "https://.../schema.json", "tenantCode": "demo", "downloadStatic": true }

# 上传配置直接构建
POST /tasks/upload
# multipart/form-data: file + tenantCode

# 查询任务状态
GET /tasks/:id

# 部署任务产物
POST /deploy/:taskId
{ "type": "qiniu", "bucket": "...", "domain": "..." }
```

### Docker 部署

```bash
# generator-service
cd generator-service
docker-compose up -d

# generator-cli（作为构建镜像使用）
cd generator-cli
docker build -t ssg-builder .
```

---

## 目录结构

```
static-site-generator/
├── generator-config/          # 设计器前端（qiankun 微应用）
│   ├── src/
│   │   ├── designer/         # 设计器核心：组件面板、属性表单、画布
│   │   ├── views/            # 页面路由
│   │   └── api/              # 接口封装
│   └── package.json
│
├── ssg-components/            # 组件库
│   ├── src/
│   │   ├── components/       # 59+ 组件（每个组件 = .vue + schema.ts）
│   │   ├── index.ts          # 组件注册入口
│   │   └── utils/            # 工具函数
│   └── package.json
│
├── generator-cli/             # 静态构建 CLI
│   ├── src/
│   │   ├── commands/build.ts # 构建命令核心
│   │   ├── utils/            # robots.txt / sitemap / layout 解析
│   │   └── pages/[...slug].astro  # Astro 动态路由
│   └── Dockerfile
│
├── generator-service/         # 构建调度服务
│   ├── src/
│   │   ├── routes/           # HTTP 路由：task / deploy / qiniu
│   │   ├── services/         # 业务逻辑
│   │   └── providers/        # 七牛 / SFTP 部署Provider
│   └── Dockerfile
│
├── service/                   # 配置数据服务（library）
│   └── src/
│       ├── public.ts         # 公开 API
│       └── types.ts          # 类型定义
│
└── migrate-scripts/           # 数据迁移脚本
    └── migrate-v2.ts
```

---

## 技术选型说明

| 层面 | 选型 | 理由 |
|------|------|------|
| 组件框架 | Vue 3 + Composition API | 类型友好，SSR 生态成熟 |
| 静态生成 | Astro SSR | 零 JS 默认输出，`astro-island` 按需水合 |
| 样式 | Tailwind CSS | 设计系统统一，流体排版支持 |
| 组件交互 | `client:load` / `interactive: true` | 非交互组件零运行时开销 |
| 设计器 | Vite + Vue + qiankun | 微前端嵌入，独立部署 |
| 构建服务 | Bun Server | 轻量快速，原生 TypeScript |
| 部署 | 七牛云 Qiniu / SFTP | CDN 加速 + 私有服务器双支持 |

---

## 相关文档

- [SSG 组件开发规范](../../.agents/skills/ssg-component-development/SKILL.md) — 组件开发、Schema 规范、Fluid Design
- [用户界面原型](https://pdd.guhecloud.com/CIDWVO/?id=1v41by&p=站点设置&g=1)
