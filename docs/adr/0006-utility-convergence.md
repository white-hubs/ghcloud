# 0006 — 工具函数统一收口 cube-utils

- **Status**: accepted
- **Date**: 2026-04-24
- **Tags**: utils, lodash, cube-utils

## Context

各应用中普遍直接依赖 `lodash`、`dayjs`、`qs` 等小工具；随之产生：

- 多处重复封装（如 "节流拿表格尺寸"、"深拷贝 JSON"）
- `lodash` 全量引入导致 bundle 臃肿
- 仓库内部存在 `@ghcloud/cube-utils`，但覆盖度有限，业务仍倾向直接用 `lodash`

## Decision

### 1. 默认禁止直接依赖 `lodash`

新应用 `package.json` 禁止出现 `lodash`；`bun lint` 会在未来增加扫描规则。

**替代方案**：

- 简单操作用**原生 ES 语法**（`{...obj}`、`arr.filter`、`arr.find`）
- 需要"节流 / 防抖 / 深 equal / 克隆"等工具时，**先看 `@ghcloud/cube-utils`** 是否已有；若无，**补充进去**
- 仅当 `cube-utils` 暂不接受该 PR 时才可临时在应用内实现，且需注释标注"TODO: move to cube-utils"

### 2. `cube-utils` 收口范围

- 业务中 hooks 形态的组合函数（`usePageName`、`useApplicationInfo`、`useFeature`）
- 工具函数（`passwordEncoder`、`queryParameter`、`filePreview`、`tableExportExcel` 等）
- 涉及 DOM/session 的包装函数

### 3. 第三方库的直接依赖

- `dayjs` 保留（日期格式是业务强需求）
- `qs` 不推荐：用原生 `URLSearchParams` 或 `cube-gateway` 内的 `makeURLParams`
- `axios` 不需要：接口调用已由 `cube-gateway` 的 `fetch` 封装

## Consequences

### 正面

- 公共逻辑收敛到一个包，更新受益全仓
- bundle 体积下降（去掉 lodash 全量 + 重复工具）

### 负面

- 增量工具需要走 `cube-utils` PR 流程，审核周期略长
- 团队需建立"先查 cube-utils"的习惯
