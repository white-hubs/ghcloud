# @ghcloud/cube-site-data-puller

从 `generator-config`（网站管理后台）接口拉取业务数据，组装成与 `local-deploy/site-20260630092422` 一致的 5 个 JSON 文件，并打包为 ZIP 输出到 `dist/`。

## 环境变量

| 变量 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `SSG_API_BASE_URL` | 是 | - | API 基础地址。`generator-config` 开发时代理到 `https://cube-dev.guhecloud.com:30000/api`，因此接口 base 为 `https://cube-dev.guhecloud.com:30000/api/guhecloudWebsite` |
| `SSG_API_TOKEN` | 是 | - | Bearer Token。从浏览器 `sessionStorage.getItem('GH-Token')` 中解析 `access_token` |
| `SSG_API_TENANT` | 是 | - | `tenant` Header。从浏览器 `sessionStorage.getItem('GH-NowEnterprise')` 中解析 `code` |
| `SSG_API_TERMINAL` | 否 | `bimops-manage-web` | `terminal` Header，对应 `CubeTerminalEnum.BUSINESS` |
| `SSG_OUTPUT_DIR` | 否 | `./dist` | 输出目录 |
| `SSG_SITE_DIR_NAME` | 否 | `site-<timestamp>` | 输出文件夹名 |
| `SSG_PAGE_SIZE` | 否 | `100` | 文章分页大小 |
| `SSG_RATE_LIMIT_MS` | 否 | `150` | 请求间隔（ms） |
| `SSG_DRY_RUN` | 否 | - | 设置为 `1` 时只打印待请求的接口，不实际调用 |

## 使用 .env 文件

Bun 启动时会自动加载同目录下的 `.env` 文件。可先将示例文件复制为 `.env` 并填写真实值：

```bash
cp .env.example .env
# 编辑 .env，填入 SSG_API_BASE_URL / SSG_API_TOKEN / SSG_API_TENANT 等必填项
bun src/main.ts
```

`.env` 已加入 `.gitignore`，不会被提交。

## 运行

```bash
cd prod/cube/apps/static-site-generator/site-data-puller
SSG_API_BASE_URL="https://cube-dev.guhecloud.com:30000/api/guhecloudWebsite" \
SSG_API_TOKEN="eyJ..." \
SSG_API_TENANT="58197260" \
bun src/main.ts
```

或使用脚本：

```bash
bun run pull
```

也可直接加载 `.env`：

```bash
bun --env-file=.env src/main.ts
```

## 输出

执行成功后在 `dist/` 下生成：

```
dist/
├── site-20260703014012/
│   ├── site-setting.json
│   ├── site-layouts.json
│   ├── site-pages.json
│   ├── article-categories.json
│   └── articles.json
└── site-20260703014012.zip
```
