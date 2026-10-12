# 0002 — 包管理与版本策略

- **Status**: accepted
- **Date**: 2026-04-24
- **Tags**: package, version, catalog, bun

## Context

仓库使用 Bun workspaces。实际 `package.json` 中三种版本声明并存：

- **固定版本号**（`"lodash": "4.17.21"`、`"exceljs": "^4.2.0"`）
- **workspace 引用**（`"@ghcloud/cube-ui": "workspace:^"`）
- **catalog 引用**（`"vue": "catalog:"`）

固定版本号在多个应用中出现，导致升级一次需要修 N 个文件；部分应用只因历史原因跟不上主线。

## Decision

**所有应用的所有依赖**都必须使用以下两种形式之一：

1. **`workspace:^`**：本仓库内的包（`@ghcloud/*`）
2. **`catalog:`** 或 **`catalog:<name>`**：外部 npm 依赖

禁止在应用的 `package.json` 中直接写版本号（`"vue": "3.5.0"` 不允许）。

### 新增外部依赖的流程

1. 先在**根 `package.json`** 的 `catalog` / `catalogs.<name>` 字段登记版本
2. 在应用 `package.json` 中写 `"xxx": "catalog:"`
3. `bun install` 会解析到根 catalog 中声明的版本

### 版本升级

- 改**根 `package.json` 一处**即可全仓升级
- 不得为单个应用"钉死"特殊版本；如确需，用 `catalogs.<name>` 建新 catalog

### 删除冗余依赖

- 业务不再使用的依赖必须从 `package.json` 移除；保留会被判定为 dead code
- `@types/node` 保留在 devDependencies 仅供构建配置/脚本使用（`vite.config.ts`、`scripts/`）

## Consequences

### 正面

- 版本升级成本常数级
- 避免"不同应用跑着不同版本 vue"的诡异 bug
- CI/lint 可脚本化检测"非 catalog 版本号"

### 负面

- 需要 catalog 维护者（当前是发版/中台团队）审核新增条目
- 新手需要学习 catalog 语法
