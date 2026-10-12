# @ghcloud/cube-hazard-governance-app

Cube 前端子应用的**工程模板**。新应用通过 `bun run scaffold` 从这里一键生成，保证全仓工程结构、调用约定、qiankun 集成完全一致。

## 快速开始

### 方式 A：使用脚手架（推荐）

```bash
cd prod/cube/template/app
bun run scaffold
# 按提示依次输入：
#   slug      - 应用 kebab-case 名，如 "alarm-center"
#   zhName    - 中文名，如 "报警中心"
#   targetDir - 目标目录，默认 ../../apps/<slug>/app
```

脚手架会：

1. 把整个 `prod/cube/template/app/` 复制到目标目录
2. 自动替换占位符：`hazard-governance` → `<slug>`，`HazardGovernance` → `<Pascal>`，`HAZARD_GOVERNANCE` → `<UPPER_SNAKE>`，`cube-hazard-governance-app` → `cube-<slug>-app`，`隐患治理` → `<中文名>`
3. 打印后续命令

之后：

```bash
cd ../../apps/<slug>/app
bun install
bun run dev    # 使用 .env.dev，可直接在 http://localhost:8888 访问
```

### 方式 B：命令行参数（适合 CI）

```bash
bun run scaffold --slug=alarm-center --zhName=报警中心 --targetDir=../../apps/alarm-center/app
```

## 工程结构

```
.
├── .env.dev                 # 开发环境配置
├── .env.test                # 测试环境配置
├── .env.prod                # 生产环境配置
├── index.html               # qiankun 挂载点 #HazardGovernance
├── package.json             # 只用 catalog: / workspace:^
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts           # 基础配置（define __ENV__、css 前缀、base 等）
├── vite.dev.config.ts       # dev：port 8888
├── vite.build.config.ts     # build：产物 hash
├── vite.preview.config.ts   # preview：port 9999
├── public/favicon.png
├── scripts/
│   └── scaffold.ts          # 脚手架脚本
└── src/
    ├── main.ts              # qiankun 生命周期入口
    ├── app.ts               # Vue + Router + Pinia 装配
    ├── app.tsx              # 根组件（ConfigProvider）
    ├── logger.ts            # 子 logger
    ├── global.d.ts          # 业务全局类型占位
    ├── vue-app-env.d.ts     # __ENV__、*.less 声明
    ├── assets/
    │   └── style.less
    ├── constants/
    │   └── env.ts           # __ENV__ / import.meta.env 的唯一出口
    ├── permission/
    │   └── permission.ts    # appFunctionCodes
    ├── router/
    │   └── index.ts         # 路由表
    ├── stores/
    │   └── app.ts           # Pinia 示例 store
    ├── hooks/
    │   ├── use-table-scroll.ts
    │   └── use-toggle.ts
    └── views/
        ├── demo-home/demo-home.tsx
        ├── demo-list/
        │   ├── demo-list.tsx
        │   └── demo-list.const.ts
        ├── demo-detail/demo-detail.tsx
        ├── demo-edit/demo-edit.tsx
        └── module/
            └── demo-module/
                ├── module-index.tsx
                └── module-item.tsx
```

## 核心约定（必读）

全部细节详见 [`docs/adr/`](../../../docs/adr/)。要点一览：

- **API 调用**：`@ghcloud/cube-services-client` deep-import；禁止从包根路径或 `src/api/` 中转（[ADR-0003](../../../docs/adr/0003-api-calling-convention.md), [ADR-0010](../../../docs/adr/0010-tree-shaking-constraints.md)）
- **鉴权**：只用 `authRequest.updateAuth(props.auth)` + `useAuthRequest(() => clientFn())`（[ADR-0004](../../../docs/adr/0004-auth-request-only.md)）
- **版本**：`package.json` 只写 `catalog:` / `workspace:^`（[ADR-0002](../../../docs/adr/0002-package-version-strategy.md)）
- **UI**：业务级从 `@ghcloud/cube-app-design`，通用级从 `@ghcloud/cube-ui`（[ADR-0005](../../../docs/adr/0005-ui-component-library.md)）
- **工具函数**：优先 `@ghcloud/cube-utils`；禁止直依赖 `lodash`（[ADR-0006](../../../docs/adr/0006-utility-convergence.md)）
- **qiankun 四元组**：`projectName` / `base` / 挂载 id / scope-selector 必须联动（[ADR-0008](../../../docs/adr/0008-qiankun-integration.md)）
- **环境变量**：直接使用 `.env.dev` / `.env.test` / `.env.prod`

AI 协作请先读：[`.agents/skills/cube-app-development/SKILL.md`](../../../.agents/skills/cube-app-development/SKILL.md)

## 示例页面一览

| 路径 | 页面 | 演示重点 |
|---|---|---|
| `/` | `demo-home` | 基础 Card + 内部导航 |
| `/demo-list` | `demo-list` | `CubeLayout` + `useCubeForm` + `useCubeTable` + 分页 + 操作列 |
| `/demo-detail?id=xxx` | `demo-detail` | `Descriptions` + query 参数读取 + 鉴权请求 |
| `/demo-edit?id=xxx` | `demo-edit` | 表单校验 + 创建/更新分支 + 异步提交 |
| `/module/demo` | `module-index` | 子模块入口 + 小规模列表 |
| `/module/demo/:id` | `module-item` | 子模块详情 + 动态路由参数 |

## 可选能力：独立模板

**不要**在基础模板中加领域依赖。需要以下能力时，请拉独立模板（规划中）：

- **echarts 大屏** → `prod/cube/template/app-with-echarts/`
- **Excel 导出** → `prod/cube/template/app-with-excel/`
- **X6 流程图** → `prod/cube/template/app-with-x6/`

详见 [ADR-0009](../../../docs/adr/0009-optional-dependencies.md)。

## 环境配置

- `bun run dev` 使用 `.env.dev`
- `bun run build:dev` 使用 `.env.dev`
- `bun run build:test` 使用 `.env.test`
- `bun run build:prod` 使用 `.env.prod`
- 三套环境文件直接提交到项目中，当前主要配置 `PUBLIC_PATH`

### useCubeTable 的隐式请求（重要）

`@ghcloud/cube-app-design` 的 `useCubeTable({ tableCode })` 在初始化时会自动加载 tenant / user 列配置，调用 `@ghcloud/cube-dictionary-service` 的下列接口：

- `GET /api/dictionary/getDataDictionaryByItem`
- `GET /api/dictionary/user-dictionary/list`

独立开发时请使用真实 session 鉴权或在 `vite.dev.config.ts#server.proxy` 配置真实后端代理。

## cube-services-client 教学示例

`prod/cube-services/client/src/template-demo.client.ts` 是**教学占位**，仅供本模板演示使用。生产应用请按 `metadata.client.ts` / `dictionary.client.ts` 的风格添加自己的 client 模块，**禁止引用 `template-demo.client`**。

## 脚本

| 命令 | 作用 |
|---|---|
| `bun run dev` | 本地开发，读取 `.env.dev` |
| `bun run build` | 构建产物 |
| `bun run build:dev` / `build:test` / `build:prod` | 按环境构建 |
| `bun run preview` | 预览构建结果 |
| `bun run scaffold` | 脚手架生成新应用 |

## FAQ

**Q: 为什么没有 `src/api/` 目录？**
A: API 调用直接 deep-import client，避免中转层破坏 tree-shaking。详见 [ADR-0003](../../../docs/adr/0003-api-calling-convention.md)。

**Q: 为什么没有 `src/hooks/auth-request.ts`？**
A: `@ghcloud/cube-services-client/auth-request` 已导出 `authRequest` 单例和 `useAuthRequest` hook。qiankun 的 JS 沙箱保证每个子应用独立模块作用域，无需本地再实例化。详见 [ADR-0004](../../../docs/adr/0004-auth-request-only.md)。

**Q: 独立 `bun run dev` 时报 `Login state is not ready!`？**
A: 非 qiankun 模式下主应用不会透传 auth，模板已在 `main.ts#renderWithDefault` 用 `DEV_MOCK_AUTH` 占位。如果自己改了 `main.ts` 请保留这句：`authRequest.updateAuth(DEV_MOCK_AUTH)`。详见 [ADR-0004](../../../docs/adr/0004-auth-request-only.md) §3。

**Q: 使用 `useCubeTable({ tableCode })` 时表头右上角齿轮按钮被遮挡？**
A: `AliasTable` 会把齿轮塞进最后一列表头；如果最后一列是 `fixed: 'right'`，AntDV 固定列阴影会盖住它。模板 `demo-list.tsx` 的"操作"列已**主动取消 `fixed: 'right'`**来规避。需要固定操作列时请参考 `.agents/skills/cube-app-development/SKILL.md` 里的三种处理姿势。

**Q: 新应用的 `applicationCode` 是什么？**
A: 脚手架会用 slug 的大写蛇形格式（`alarm-center` → `ALARM_CENTER`）替换占位符。如需自定义，改 `vite.config.ts#__ENV__.applicationCode`。
