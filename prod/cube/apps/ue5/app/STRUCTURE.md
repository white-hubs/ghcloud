# UE5 应用目录结构

本文是 `@ghcloud/cube-ue5-app` 当前目录边界、分组依据和文件放置规则的唯一结构说明。源码结构发生变化时，必须同步更新本文与 `scripts/check-structure.mjs`。

## 1. 结构目标

目录设计遵循以下优先级：

1. **按职责划分顶层边界**：启动编排、可视化内核、业务功能、共享 UI、基础设施和路由页面互不混放。
2. **按业务域内聚功能**：仅服务某个业务的组件、类型、请求和样式留在该业务域内。
3. **按表现形态归类跨域面板能力**：面板模板、表格、指标、图表、媒体组件分别归档。
4. **组件与其资源同目录**：组件、CSS Module、局部类型和测试文件放在一起，移动组件时不遗漏依赖。
5. **根目录只保留稳定入口**：禁止把暂时无法归类的文件直接堆在 `src/` 或 `panel-shell/` 根目录。

判断一个文件放在哪里时，先判断它属于哪个业务边界，再判断它在边界内的功能类型；不能只根据文件名或 UI 外观归类。

## 2. 源码总览

```text
src/
├── main.ts                         # 应用启动入口
├── app.ts                          # Vue、Pinia、主题等应用装配
├── app.tsx                         # 根 ConfigProvider 与 RouterView
├── App.module.less                 # 根组件样式
├── application/                    # 启动、鉴权、配置、路由、宿主运行时
├── visualization-core/             # 场景、模型 SDK、事件、状态和可视化交互
├── features/                       # 业务域、设备能力和应用级功能组件
├── shared-ui/                      # 无业务语义的通用展示组件
├── infrastructure/                 # API、请求、socket 和技术适配
├── views/                          # Vue Router 直接加载的页面组合层
├── assets/                         # 字体、图标等静态资源
├── styles/                         # 全局样式、主题和动画
├── constants/                      # 应用级常量与环境出口
├── directives/                     # Vue DOM 指令
├── locales/                        # 国际化资源
├── typings/                        # 应用全局类型
└── *.d.ts                          # Vite、Vue 与 window 类型声明
```

### 顶层目录职责

| 目录 | 负责 | 不负责 |
|---|---|---|
| `application/` | 应用如何启动和运行 | 业务卡片、图表实现 |
| `visualization-core/` | 场景如何渲染和交互 | 具体业务面板 |
| `features/` | 业务能力和有业务语义的 UI | 路由页面、底层请求实现 |
| `shared-ui/` | 可跨业务使用的纯展示组件 | 业务请求、业务状态、场景操作 |
| `infrastructure/` | 后端和第三方技术通信 | 页面布局、业务 UI |
| `views/` | 路由页面布局和功能组合 | 被 feature 反向调用的能力 |

## 3. 依赖方向

```text
main / app / views
        │
        ├──────────────→ application
        │                    │
        ├──────────────→ features ──────────→ visualization-core
        │                    │                       │
        └──────────────→ shared-ui                  │
                             ▲                      │
                             └──────────────────────┘

application / features / visualization-core ─────→ infrastructure
```

强制规则：

- `shared-ui` 不依赖 `application`、`features`、`views` 或具体业务状态。
- `features` 不依赖 `views`。
- `visualization-core` 不依赖 `views` 或 `features/cards` 中的具体业务域。
- `infrastructure` 不依赖 `views`、`features`、`shared-ui`。
- 页面级可复用动作进入 `visualization-core/scene`，不能让 feature 反向导入页面。
- 业务组件通过 `infrastructure` 或服务 client 获取数据，不在多个组件里复制请求配置。

## 4. `application/`：应用运行边界

```text
application/
├── auth/          # 登录态、session、应用 auth store
├── bootstrap/     # 启动时只执行一次的准备逻辑
├── config/        # 项目、租户、模型、2D/3D 运行配置
├── permission/    # 功能权限码
├── router/        # 路由表、history、登录守卫
└── runtime/       # qiankun/宿主、RTC、告警通知等运行时编排
```

分组依据是“是否决定应用如何启动和持续运行”。业务组件、图表、设备面板不得放入此目录。`main.ts`、`app.ts` 和 `app.tsx` 应保持为薄入口，把具体初始化职责下沉到对应子目录。

## 5. `visualization-core/`：可视化内核

```text
visualization-core/
├── ai/            # AI 指令到场景动作的适配
├── event/         # 模型与 UI 事件协议、注册和分发
├── hooks/         # 跨业务可复用的可视化交互 composables
├── model-sdk/     # UE5、WebGL、GIS 模型操作门面
├── scene/         # 场景动作与模型交互用例
└── stores/        # 场景、面板、菜单、区域、socket 等状态
```

分组依据是“能力是否与某个具体业务无关，并直接服务场景或渲染运行时”。渲染引擎对象避免进入深层 reactive；瞬时通知优先走事件，长期共享状态才进入 store。

## 6. `features/`：业务功能边界

```text
features/
├── cards/             # 按业务域组织的可视化卡片
├── equipment/         # 设备详情、告警详情、控制和设备弹层
├── panel-registry/    # legacy/设备面板的集中注册
├── panel-shell/       # 跨业务面板壳层能力
└── widgets/           # 应用壳层导航、标题栏、弹窗等部件
```

### 6.1 `cards/`：业务域卡片

`cards/` 当前有 100 个一级目录，其中包括业务域以及 `_register`、`_shared` 等内部支持目录。业务域继续采用 `cards/<domain>/` 组织，不把所有卡片按“图表/表格”打散到全局目录。

```text
cards/
├── _register/                 # 全部业务域的卡片注册聚合
├── _shared/                   # 仅供 cards 域共享的能力
├── <domain>/                  # 一个可识别的业务域
│   ├── left.tsx               # 可选：左侧面板组合
│   ├── right.tsx              # 可选：右侧面板组合
│   ├── cards/                 # 该域的卡片实现
│   ├── components/            # 该域内部复用组件
│   ├── data-access/           # 可选：该域的数据访问封装
│   ├── types.ts               # 可选：该域类型
│   └── *.module.less          # 对应组件样式
└── ...
```

分组规则：

- 只被一个业务域使用的组件，留在该域的 `components/` 或 `cards/`。
- 只在 cards 之间复用、但仍带卡片语义的能力，放 `cards/_shared/`。
- 不允许通过 `panel-shell` 建一个文件，仅转发某个业务域内部组件；调用方应直接引用所属域的公开实现。
- 一个业务域不得深导入另一个业务域的内部文件。确有共享语义时，先确认它应上移到 `cards/_shared`、`panel-shell`、`shared-ui` 还是服务契约。
- `_register/` 只做注册聚合和重复 code 校验，不承载卡片实现。

### 6.2 `equipment/`：设备业务能力

```text
equipment/
├── alarm-chart-components/   # 告警详情使用的图表
├── alarmPanel/               # 告警面板
├── alarmdetails/             # 告警详情
├── equipmentPanel/           # 设备业务面板和控制
├── equipmentdetails/         # 设备详情
└── modal-table/              # 设备、告警、面板放大等业务弹层
```

分组依据是“是否识别设备/告警业务语义或触发设备操作”。纯展示表格不应进入这里；能打开设备详情、告警详情或执行控制的组件属于这里。

### 6.3 `panel-registry/`：面板注册

当前入口为 `legacy-panel-registry.ts`。该目录只负责把 card code、设备类型与面板实现建立映射，不放 JSX 实现、请求逻辑或样式。业务实现仍归所属 `cards/<domain>` 或 `equipment/`。

### 6.4 `panel-shell/`：跨业务面板壳层

`panel-shell` 只保存被多个业务域复用、且仍带有面板交互语义的组件。根目录禁止放置源码文件，必须进入以下五类之一：

```text
panel-shell/
├── charts/
│   ├── panel-zoom-context.ts
│   ├── stacked-bar/
│   │   ├── chart.ts
│   │   ├── stacked-bar.tsx
│   │   └── stacked-bar.module.less
│   └── stacked-line/
│       ├── stacked-line.tsx
│       └── stacked-line.module.less
├── media/
│   └── monitor-video-grid/
│       ├── monitor-video-grid.tsx
│       └── monitor-video-grid.module.less
├── metrics/
│   ├── grid-container/
│   │   ├── grid-container.tsx
│   │   └── grid-container.module.less
│   └── operate-days/
│       ├── operate-days.tsx
│       └── operate-days.module.less
├── tables/
│   ├── duty-person-list/
│   │   ├── duty-person-list.tsx
│   │   └── duty-person-list.module.less
│   └── roll-table/
│       ├── roll-table.tsx
│       ├── roll-table.module.less
│       └── scroll-params.ts
└── templates/
    └── sub-panel-template/
        ├── sub-panel-template.tsx
        └── sub-panel-template.module.less
```

| 分组 | 进入条件 | 当前内容 |
|---|---|---|
| `templates/` | 定义面板外框、标题、插槽、放大交互等标准容器 | `sub-panel-template` |
| `tables/` | 以行列或连续列表展示数据，包含表格专用滚动参数 | `roll-table`、`duty-person-list` |
| `metrics/` | 展示紧凑 KPI/状态摘要，并可能触发详情弹层 | `grid-container`、`operate-days` |
| `charts/` | 跨业务 ECharts 实现或图表放大上下文 | `stacked-bar`、`stacked-line`、`panel-zoom-context` |
| `media/` | 视频、图片或其他媒体宫格 | `monitor-video-grid` |

归类边界：

- 纯展示、无业务状态和业务弹层的基础面板组件优先放 `shared-ui/panel`。
- 带具体业务语义且只服务一个 domain 的图表或列表，留在 `cards/<domain>`。
- 同一组件的 `.tsx`、`.module.less`、辅助类型和专用 hook 必须同目录。
- 跨同一分组共享的上下文或 hook 放在分组根部，例如 `charts/panel-zoom-context.ts`。
- `index.ts` 只用于明确的公共出口聚合，不使用无语义的 `index.tsx` 存放组件实现。

本次整理删除了未被引用的 `alarm-table`，并移除了指向 `security-overview` 域组件的 `device-statistics` 转发文件；业务调用现在直接引用真实所属域。

### 6.5 `widgets/`：应用壳层部件

```text
widgets/
├── area-nav/             # 区域导航
├── business-cards/       # 应用级业务卡片组合
├── business-nav/         # 业务导航
├── components/           # widgets 内部共享组件
├── device-icon-legend/   # 设备图例
├── heatmap-overlay/      # 人流热力图开关与模型连接生命周期
├── modal/                # 应用壳层弹窗
├── roaming-point/        # 漫游点交互
└── title-bar/             # 顶部标题栏
```

分组依据是“是否属于整个可视化应用外壳，而不是某张业务卡片”。仅供单个 widget 使用的组件留在对应 widget 目录，多个 widget 共用时才进入 `widgets/components`。

## 7. `shared-ui/`：无业务语义的共享 UI

```text
shared-ui/
├── basic/          # 基础 UI 和历史基础件
├── gearposition/   # 通用位置展示
├── modals/         # 无业务请求的通用弹窗视图
└── panel/          # 纯展示面板、基础图表和统计展示
```

组件通过 typed props 接收数据，通过 emits/回调报告交互。若组件需要识别业务 code、打开设备/告警弹窗、调用业务 API 或直接操作 ModelSDK，则它不属于 `shared-ui`。

## 8. `infrastructure/`：技术与通信适配

```text
infrastructure/
├── api/            # legacy API、模型和服务兼容层
├── service/        # request/axios 配置
├── utils/          # socket、通信、图表 host 及迁移期技术工具
└── logger.ts       # 应用日志出口
```

该目录向上暴露稳定、可测试的 client 或函数，不暴露页面组件。新服务优先通过 `@ghcloud/cube-services-client` 接入；不要继续扩大集中式 `api/service.ts`。纯计算工具与有副作用的通信适配应逐步分离。

## 9. `views/`：路由页面组合

```text
views/
├── login/          # `/login` 登录与企业选择
└── visualization/  # `/home` 主可视化页面组合
```

页面可以组合其他边界，但不向 feature 暴露可复用业务动作。`views/visualization` 负责选择渲染层并装配标题栏、导航和左右面板；独立能力应下沉到 `features` 或 `visualization-core`。

## 10. 资源和工程目录

| 路径 | 内容 | 维护要求 |
|---|---|---|
| `src/assets/` | 字体、图标字体、应用静态资源 | 不保存访问凭据；大字体考虑子集化 |
| `src/styles/` | 全局 reset、布局、动画、主题 | 局部样式优先与组件同目录 |
| `src/constants/` | 应用码、路由前缀、环境常量 | 作为环境读取的统一出口 |
| `src/directives/` | DOM 行为型 Vue 指令 | 仅在 composable/component 不适合时新增 |
| `src/locales/` | 国际化消息 | 按 locale 维护一致键值 |
| `src/typings/`、`src/*.d.ts` | 全局类型 | 避免新增无类型全局变量 |
| `public/` | 不经 Vite 模块图处理的资源 | 配置文件不得包含 token/JWT |
| `scripts/` | 结构迁移和校验脚本 | package script 必须指向真实文件 |

## 11. 新文件放置决策

按顺序回答：

1. 决定启动、鉴权、路由、配置或宿主生命周期吗？放 `application/`。
2. 是与业务无关的 UE5/WebGL/GIS 场景能力吗？放 `visualization-core/`。
3. 属于单一业务域吗？放 `features/cards/<domain>/`。
4. 识别设备、告警或执行设备操作吗？放 `features/equipment/`。
5. 是跨业务复用且带面板交互语义吗？按形态放 `features/panel-shell/<group>/`。
6. 是应用导航、标题栏或壳层部件吗？放 `features/widgets/`。
7. 是无业务语义的纯展示组件吗？放 `shared-ui/`。
8. 封装网络、socket、RTC 或第三方 SDK 吗？放 `infrastructure/`。
9. 是 Vue Router 直接加载的组合页面吗？放 `views/`。

仍无法判断时，先查看调用者：只有一个业务域调用则就近内聚；至少两个独立业务域稳定复用后再上移，禁止创建“临时公共目录”。

## 12. 命名与共址规则

- 新目录和文件统一使用 `kebab-case`；存量非标准名称在修改对应模块时逐步迁移。
- Vue JSX 组件使用 `.tsx`，普通逻辑使用 `.ts`，局部样式使用 `.module.less`。
- 组件文件名表达组件语义，例如 `roll-table.tsx`，不使用 `index.tsx` 作为实现名。
- 相对导入只用于同一组件目录内资源；跨目录使用 `@/` 别名表达边界。
- `index.ts` 仅作为稳定公共 API 出口；不要通过多层 barrel 隐藏真实依赖。
- 专用 hook、context、类型、测试与所属组件或分组共址；形成跨域稳定能力后再上移。
- 不在 `features/` 根目录或 `panel-shell/` 根目录新增零散源码。

## 13. 维护检查清单

目录调整或新增模块后至少确认：

- 文件是否放在最小且明确的业务边界，而不是过早上移到公共目录。
- 组件、样式、专用 hook 和测试是否共址。
- 是否产生跨业务域深导入或反向依赖。
- 是否需要更新注册表、本文和结构检查脚本。
- 是否遗留旧路径引用、空目录或仅做转发的无意义文件。

在 `prod/cube/apps/ue5/app` 下执行：

```bash
bun run check:structure
rg --files src/features/panel-shell -g '*.vue'
bun run build:dev
```

`check:structure` 会校验顶层边界、主要反向依赖、`STRUCTURE.md` 是否存在，以及 `panel-shell` 是否严格使用 `charts / media / metrics / tables / templates` 五个分组且根目录无零散文件。

## 14. 禁止项

- 不恢复 `src/api`、`src/cards`、`src/components`、`src/pages`、`src/stores` 等旧一级目录。
- 不在 `panel-shell` 根目录堆放暂未归类的组件。
- 不为缩短 import 创建只转发一个业务域内部文件的 facade。
- 不从 `features` 导入 `views`，不从 `shared-ui` 调用业务 API 或操作场景。
- 不新增跨 workspace 包的 `/src/` 深导入。
- 不复制旧服务契约；新服务契约按 Cube Services 的 interface/gateway/client 边界维护。
