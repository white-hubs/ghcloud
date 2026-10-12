# 0005 — UI 组件库选型

- **Status**: accepted
- **Date**: 2026-04-24
- **Tags**: ui, ant-design-vue, cube-ui, cube-app-design

## Context

仓库现有多个 UI 组件库，并非所有都活跃：

| 包 | 层级 | 状态 |
|---|---|---|
| `ant-design-vue` | 基础 | v4.x，catalog 中 |
| `@ghcloud/cube-ui` | 通用壳 | 基于 antdv 的二次封装（前缀、主题） |
| `@ghcloud/cube-app-design` | 业务壳 | 基于 cube-ui 的业务组件（CubeLayout/useCubeTable...） |
| `@ghcloud/generic-component` | 历史 | 即将合并至 `cube-app-design` |
| 应用私有 UI | 应用层 | 各应用 `src/components/` |

## Decision

### 1. 分层约束

```
ant-design-vue           ← 基础原子组件（业务代码一般不直接用）
  ↓
@ghcloud/cube-ui         ← 标准通用组件；优先从这里导入
  ↓
@ghcloud/cube-app-design ← 业务壳（CubeLayout / useCubeForm / useCubeTable / useCubeModal 等）
  ↓
应用 src/components/     ← 仅业务私有组件；跨应用复用的要下沉到 cube-app-design
```

### 2. 版本固化

- `ant-design-vue` 锁定 v4（catalog 中 `4.2.6`）
- `@ghcloud/cube-ui` 基于 antdv v4 封装，内部同步升级
- 应用 `package.json` 中写 `"ant-design-vue": "catalog:"`；禁止钉死版本

### 3. 导入约束

- **禁止 `import * as X from '@ghcloud/cube-app-design'`**（见 ADR-0010）
- **必须命名导入**：`import { CubeLayout, useCubeForm } from '@ghcloud/cube-app-design'`
- `cube-ui` 同理

### 4. 废弃/合并

- `@ghcloud/generic-component` 即将合并到 `@ghcloud/cube-app-design`
- 新应用**禁止**依赖 `@ghcloud/generic-component`；存量项目在迁移中逐步剔除

### 5. `prefixCls`

根组件 `ConfigProvider prefixCls="ant"`（见 `prod/cube/template/app/src/app.tsx`）。
历史应用中有用 projectName 作为 prefix 的，是 antdv3 时期遗留，升级时统一改回 `"ant"`。

## Consequences

### 正面

- 组件库栈清晰，类型收敛
- 版本一致避免混用冲突

### 负面

- 需要一轮清理 `@ghcloud/generic-component` 的使用
