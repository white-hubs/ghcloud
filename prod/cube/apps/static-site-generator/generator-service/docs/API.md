# Generator Service API 文档

## 启动开发服务器

```bash
cd /home/zee/code/ghcloud/prod/cube/apps/static-site-generator/generator-service
bun install
bun run dev
```

服务默认运行在 `http://localhost:3000`

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3000` | 服务端口 |
| `DATA_DIR` | `/app/data` | 数据存储目录 |

---

## API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/tasks` | 通过 URL 创建构建任务 |
| POST | `/tasks/upload` | 通过上传压缩包创建构建任务 |
| POST | `/tasks/byBusinessData` | 通过上传业务数据 ZIP 创建构建任务 |
| GET | `/tasks` | 查询任务列表 |
| GET | `/tasks/:id` | 查询单个任务 |
| DELETE | `/tasks/:id` | 删除任务 |
| POST | `/deploys` | 创建部署任务 |
| GET | `/deploys` | 查询部署列表 |
| GET | `/deploys/:id` | 查询单个部署 |
| DELETE | `/deploys/:id` | 删除部署 |
| POST | `/qiniu/refresh` | 刷新七牛 CDN 缓存 |

---

## Task API

### 创建任务（URL 方式）

**POST** `/tasks`

请求体：
```json
{
  "url": "https://example.com/source.tar.gz",
  "tenantCode": "guhecloud"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | string | 是 | 压缩包下载地址 |
| tenantCode | string | 是 | 租户代码 |
| downloadStatic | boolean | 否 | 是否下载外部静态资源，默认 `false` |
| excludeHosts | string[] | 否 | 下载外部静态资源时的排除名单（按域名后缀匹配）。命中的 URL 不下载、不本地化，配置中原样保留其原始地址。仅在 `downloadStatic=true` 时生效。例：`["qiniu.xxx.com"]` 会排除 `qiniu.xxx.com` 及其子域名 |

响应：
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "build",
    "status": "PENDING",
    "tenantCode": "guhecloud",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**任务状态说明：**
- `PENDING` - 等待执行
- `RUNNING` - 执行中
- `SUCCESS` - 执行成功，响应中会包含 `outputPath`
- `FAILED` - 执行失败，响应中会包含 `error`

### 创建任务（上传方式）

**POST** `/tasks/upload`

Content-Type: `multipart/form-data`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 压缩包文件 |
| tenantCode | string | 是 | 租户代码 |
| downloadStatic | string | 否 | 是否下载外部静态资源，`true` 或 `1` |
| excludeHosts | string | 否 | 下载外部静态资源时的排除名单（按域名后缀匹配），逗号分隔，如 `qiniu.xxx.com,cdn.foo.com`。命中的 URL 不下载、不本地化，配置中原样保留。仅在 `downloadStatic` 开启时生效 |

**支持的压缩包格式**：`.tar.gz`, `.tgz`, `.zip`, `.tar`, `.gz`

响应：
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "build",
    "status": "PENDING",
    "tenantCode": "guhecloud",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 创建任务（业务数据方式）

**POST** `/tasks/byBusinessData`

Content-Type: `multipart/form-data`

接收后端打包的业务数据 ZIP，先转换为 `generator-cli` 所需的文件树格式，再执行构建。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 业务数据 ZIP（含 site-setting.json / site-layouts.json / site-pages.json / article-categories.json / articles.json） |
| tenantCode | string | 是 | 租户代码 |
| downloadStatic | string | 否 | 是否下载外部静态资源，`true` 或 `1` |
| excludeHosts | string | 否 | 下载外部静态资源时的排除名单（按域名后缀匹配），逗号分隔，如 `qiniu.xxx.com,cdn.foo.com`。命中的 URL 不下载、不本地化，配置中原样保留。仅在 `downloadStatic` 开启时生效 |

**支持的压缩包格式**：`.zip`

响应格式同 `/tasks/upload`。

### 查询任务列表

**GET** `/tasks`

查询参数：
- `status` - 按状态筛选：`PENDING` | `RUNNING` | `SUCCESS` | `FAILED`
- `page` - 页码（默认 1）
- `pageSize` - 每页数量（默认 20）

### 查询单个任务

**GET** `/tasks/:id`

### 删除任务

**DELETE** `/tasks/:id`

---

## Deploy API

### 创建部署

**POST** `/deploys`

请求体：
```json
{
  "taskId": "对应的任务ID",
  "provider": "qiniu",
  "providerConfig": {
    "accessKey": "your-access-key",
    "secretKey": "your-secret-key",
    "bucket": "your-bucket",
    "zone": "z0",
    "domain": "cdn.example.com"
  },
  "tenantCode": "guhecloud"
}
```

**Provider 配置说明：**

| Provider | 必填配置 |
|----------|----------|
| qiniu | `accessKey`, `secretKey`, `bucket` |
| ftp | `host`, `username`, `password` |
| sftp | `host`, `username` + (`password` 或 `privateKey`) |

**Provider 完整配置字段：**

| 字段 | 说明 |
|------|------|
| accessKey | 七牛云 AccessKey |
| secretKey | 七牛云 SecretKey |
| bucket | 七牛云 Bucket 名称 |
| zone | 七牛云 Zone（z0/z1/z2） |
| domain | CDN 域名 |
| host | FTP/SFTP 主机地址 |
| port | 端口（默认 21/22） |
| username | 用户名 |
| password | 密码 |
| privateKey | SFTP 私钥 |
| remotePath | 远程目录路径 |

### 部署限制

- **全局单任务**：整个服务同时只能有一个部署任务在执行
- 新部署任务会在以下情况直接失败：
  - 已有部署任务正在运行时
  - 关联的任务状态不为 SUCCESS 时

**部署状态说明：**
- `PENDING` - 等待执行
- `RUNNING` - 执行中，响应中会包含 `progress` 进度
- `SUCCESS` - 执行成功，响应中会包含 `output` 部署地址
- `FAILED` - 执行失败，响应中会包含 `error`

### 查询部署列表

**GET** `/deploys`

查询参数同 Tasks

### 查询单个部署

**GET** `/deploys/:id`

响应示例：
```json
{
  "success": true,
  "data": {
    "id": "92c6fe72-26cc-4162-83f1-93d45c42a668",
    "taskId": "ffd6b3c9-0e78-42e9-ba69-c5b1e28d58ce",
    "provider": "qiniu",
    "providerConfig": { ... },
    "status": "RUNNING",
    "progress": 65,
    "output": null,
    "error": null,
    "tenantCode": "guhecloud",
    "createdAt": "2026-04-21T03:20:08.600Z",
    "updatedAt": "2026-04-21T03:25:25.468Z"
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| progress | number | 部署进度 (0-100)，仅 qiniu 支持实时进度，ftp/sftp 只有 0 → 100 跳跃 |

### 删除部署

**DELETE** `/deploys/:id`

---

## Qiniu CDN API

### 刷新 CDN 缓存

**POST** `/qiniu/refresh`

请求体：
```json
{
  "accessKey": "your-access-key",
  "secretKey": "your-secret-key",
  "domain": "cdn.example.com",
  "urls": ["https://cdn.example.com/page.html"],
  "dirs": ["https://cdn.example.com/"]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| accessKey | string | 是 | 七牛云 AccessKey |
| secretKey | string | 是 | 七牛云 SecretKey |
| domain | string | 否 | CDN 域名，提供时会自动补齐刷新 URL |
| urls | string[] | 否 | 需要刷新的 URL 列表 |
| dirs | string[] | 否 | 需要刷新的目录列表 |

**说明**：
- 若提供 `domain` 且 `urls` 和 `dirs` 均为空，则默认刷新域名首页和根目录
- `urls` 和 `dirs` 至少提供一项（或提供 `domain` 自动补齐）

---

## 通用响应格式

**成功：**
```json
{
  "success": true,
  "data": { ... }
}
```

**失败：**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

**错误码：**
| Code | 说明 |
|------|------|
| INVALID_PARAMS | 参数错误 |
| NOT_FOUND | 资源不存在 |
| INTERNAL_ERROR | 内部错误 |