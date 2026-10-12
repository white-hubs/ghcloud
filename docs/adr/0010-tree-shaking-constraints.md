# 0010 — Tree-shaking 约束

- **Status**: accepted
- **Date**: 2026-04-24
- **Tags**: tree-shaking, deep-import, bundle-size

## Context

`@ghcloud/cube-services-client`、`@ghcloud/cube-service-interface`、`@ghcloud/cube-app-design` 等包都配置了 `exports` 子路径（deep-import），但实际业务代码中常见 "**导入整个包**" 的反模式：

```typescript
// ❌ 会把整个包拖进 bundle
import * as client from '@ghcloud/cube-services-client'
import { metadataClient } from '@ghcloud/cube-services-client'
```

在未开启 side effect free 的包里，这种写法会让 Rollup/Vite 无法删除未用到的模块，bundle 体积显著上浮。

## Decision

### 1. Deep-import 强制规范

以下包**必须通过 `exports` 字段中的子路径**导入，禁止从根路径导入：

- `@ghcloud/cube-service-interface/<module>`
- `@ghcloud/cube-services-client/<module>.client`
- `@ghcloud/cube-services-client/auth-request`

### 2. 命名导入强制

禁止 `import * as X from 'pkg'`；必须使用命名导入：

```typescript
// ✅
import { listTemplateDemo } from '@ghcloud/cube-services-client/template-demo.client'
import { useAuthRequest } from '@ghcloud/cube-services-client/auth-request'
import { CubeLayout, useCubeForm } from '@ghcloud/cube-app-design'
```

### 3. 副作用声明

所有仓库内的 `@ghcloud/*` 包都应在 `package.json` 声明 `"sideEffects": false`（或白名单文件）；否则 Rollup 无法安全 tree-shake。

当前状态检查项：

- [x] `@ghcloud/cube-services-client` 已配 `exports`
- [x] `@ghcloud/cube-service-interface` 已配 `exports`
- [ ] `@ghcloud/cube-app-design`、`@ghcloud/cube-ui` 需要明确 `sideEffects`（后续 PR 补齐）

### 4. 对业务应用的影响

- 应用 `src/**/*.tsx` 中只要看到 `from '@ghcloud/cube-services-client'`（根路径），一律视为反模式
- 新增 deep-import 子路径时，必须同步更新包的 `package.json#exports`

### 5. Lint / 自动化

- 短期：code review 肉眼把关
- 中期：在 `.oxlintrc.json` 增加规则：禁止从指定包的根路径导入

## Consequences

### 正面

- bundle 体积显著下降（cube-services-client 根路径包含全部 client，deep-import 仅拉取用到的）
- API 变更的爆炸半径变小：改某个 client 只影响引用它的文件

### 负面

- import 路径更长，视觉上略啰嗦
- 手动为每个新 client 维护 `exports` 子路径；需要工程约束和代码评审保障
