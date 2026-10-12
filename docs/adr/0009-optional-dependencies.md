# 0009 — 可选依赖通过独立模板扩展

- **Status**: accepted
- **Date**: 2026-04-24
- **Tags**: template, dependencies

## Context

不是所有应用都需要 `echarts`、`exceljs`、`xlsx`、`file-saver`、`@antv/x6` 等"体积大 / 只在某些领域用"的依赖。如果把它们都塞进基础模板：

- 新应用默认体积浮高
- AI 误以为这些是"必装"依赖，在不相关的业务中也会引入

## Decision

### 1. 基础模板 `prod/cube/template/app`

只包含通用、必需的依赖（见 `prod/cube/template/app/package.json`）：

```
@ghcloud/cube-theme / cube-ui / cube-app-design / cube-services-client
@ghcloud/cube-service-interface / cube-utils / cube-permission-codes / logger
ant-design-vue / dayjs / pinia / vue / vue-router
```

**禁止在基础模板中预装** `echarts` / `exceljs` / `xlsx` / `three` / `@antv/x6` 等专用库。

### 2. 场景模板（未来扩展）

在 `prod/cube/template/` 下新增场景模板：

```
prod/cube/template/
├── app/                          # 基础模板（本 ADR 推荐默认使用）
├── app-with-echarts/             # 含 echarts 的数据大屏模板
├── app-with-excel/               # 含 exceljs 导出模板
└── app-with-x6/                  # 含 X6 流程图模板
```

每个场景模板基于 `app/` + 领域特定的依赖与示例页面。

### 3. 现有应用临时需要大依赖时

- 先判断该功能是否"一次性"：能用 `@ghcloud/cube-utils` 里的 `tableExportExcel` 覆盖的导出场景就不必引入 `exceljs`
- 如必须，临时加进 `package.json`，并在 PR 描述中说明理由；同时评估是否应沉淀到场景模板

## Consequences

### 正面

- 基础模板保持最小体积与最窄依赖面
- 专项能力独立版本化，升级更可控

### 负面

- 场景模板数量会增加；需要建立场景模板的维护责任人
