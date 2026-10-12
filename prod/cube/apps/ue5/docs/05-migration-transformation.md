# UE5 三维可视化应用迁移改造

**文档类型**：项目
**应用名称**：三维可视化（three-dimensional-visualization）  
**版本**：@ghcloud/cube-ue5-app v0.1.0  
**日期**：2026-07-27

---

## 一、项目概述

本次工作将原 **legacy 三维可视化前端**（ue5-migrate）迁移并重构为 Cube 体系下的 **可视化应用**。应用需同时支持：

1. **Standalone 独立全屏** — bimops 新窗口打开，通过 `cube-secret` 完成 SSO（当前已实现、优先验收）
2. **Qiankun 子应用嵌入** — 由 bimops / portal 主应用内嵌加载（**计划新增，暂未开发**）

面向大屏展示 UE5、WebGL、GIS 及 2D 组态等多种渲染场景。

**一句话总结**：主体工程已完成「工程归位 + 架构收敛 + 全量 TSX 化 + 单入口壳层」；下一步在 standalone 切流验收之外，**补充 qiankun 子应用集成能力**（仅文档规划，代码改造暂缓）。

---

## 二、为什么要改

原系统长期存在以下问题，制约维护效率与后续扩展：

1. **双轨架构并存**  
   早期有一套基于巨型 Vue 单文件的 Legacy 壳层，后期又在 `pages/` 下并行建设 TSX 壳层，两套入口、两套组织方式，新人难以判断改哪里。

2. **多入口、多 Shell**  
   通过运行时配置在不同入口（3D 主视图、2D 组态、部分 3D 变体等）之间切换，部署和排错成本高。

3. **卡片体量巨大且均为 Vue 单文件**  
   约 104 个业务域、960 余个面板组件全部是 `.vue`，与 Cube 子应用 TSX 规范不一致，也无法享受统一的类型检查与 JSX 开发体验。

4. **目录命名混乱**  
   `pages/`、`components/`、`piniaStore/` 等命名与 Cube 其他子应用不统一，公共组件与业务卡片边界模糊。

5. **构建资源消耗高**  
   全量构建需要约 8GB 内存，CI 与本地开发压力较大（后续阶段优化）。

---

## 三、改造目标

### 3.1 已完成 / 进行中（主体迁移）

| 维度     | 目标                                                      | 状态        |
| -------- | --------------------------------------------------------- | ----------- |
| 页面技术 | 全部使用 TSX（Vue 3 + JSX），仓库内零 Vue 单文件          | ✅ 已完成   |
| 壳层     | 单一可视化入口，按租户配置的渲染类型自动切换 3D / 2D      | ✅ 已完成   |
| 业务卡片 | 协议不变，仍对接可视化 SDK 的卡片注册机制                 | ✅ 已完成   |
| 工程规范 | 对齐 Cube PC 子应用目录与依赖约定                         | ✅ 已完成   |
| Standalone | 独立 SPA，路径 `/ue5`；bimops 新窗口 + `cube-secret`   | ✅ 已实现，待切流验收 |

### 3.2 计划调整（2026-07）— 双模式集成

| 维度       | 原规划                         | **新规划**                                                                 |
| ---------- | ------------------------------ | -------------------------------------------------------------------------- |
| 部署形态   | 仅 standalone SPA              | **Standalone + Qiankun 子应用** 双模式并存                                 |
| 集成方式   | 仅 bimops 新窗口，不改为 qiankun | **保留新窗口**；**新增** portal / bimops 微前端容器内嵌（参考 inspection-command-screen） |
| 访问路径   | `/ue5`                         | Standalone：`/ue5`；子应用：`/portal/ue5`（与 Cube 子应用惯例一致）        |
| 鉴权来源   | URL `cube-secret` + session    | Standalone 同上；子应用额外接收主应用 `props.auth`（`CubeMfRootGlobalState`） |
| 实施节奏   | —                              | **先完成 standalone 切流与 TSX 运行时修复**；qiankun **仅文档规划，暂不改造** |

> 参考实现：[`inspection-command-screen/app/src/main.ts`](../../inspection-command-screen/app/src/main.ts)（`renderWithQiankun` + `qiankunAppBase` / `standaloneAppBase` 双 base）。

---

## 四、具体做了什么

### 4.1 新建独立应用工程

在 Cube 应用目录下新建 **ue5 子应用**，配置 Vite 构建、大屏 rem 适配、环境变量与静态资源迁移。应用可脱离 legacy 包独立 `dev` / `build`，不再依赖旧 npm 包发布流程。

**成果**：具备完整 standalone 工程能力，版本号 v0.1.0。

---

### 4.2 目录结构重组

将原先分散在 `pages/`、`components/`、`piniaStore/` 等位置的代码，按职责重新归类为清晰的一级目录：

- **widgets** — 标题栏、业务导航、区域导航、布局框架、各类弹窗
- **cards** — 全部业务数据卡片（原 businessPanel）
- **shared** — 卡片共用的面板模板、图表、表格等
- **equipment** — 设备详情、设备侧栏、告警相关 UI
- **stores / model-sdk / event / config** — 状态、三维 SDK、事件总线、项目配置
- **views** — 登录页、主可视化页

同时删除了演示页、showcase、重复 mock 等无效代码，以及已废弃的多套 Legacy Shell。

**成果**：目录职责单一、依赖方向明确（页面 → 壳组件 → 公共组件；卡片不得反向依赖页面）。

---

### 4.3 壳层统一：从「多入口」到「单入口」

**改造前**  
运行时根据配置加载不同 Shell（3D 主界面、2D 组态、其他 3D 变体等），路由与入口逻辑分散。

**改造后**  
只保留一个主可视化页面。系统读取租户配置的 **渲染类型（renderType）**，在同一页面内分支：

| 渲染类型 | 行为                                      |
| -------- | ----------------------------------------- |
| UE5      | 加载 UE5 流媒体渲染                       |
| WEBGL    | 加载 WebGL 画布渲染                       |
| GIS      | 加载 GIS 地图渲染                         |
| 2D       | 展示 2D 组态 SCADA 界面，不初始化三维 SDK |

2D 组态不再单独占一条路由或独立 entry，而是作为主可视化页的一种模式内嵌展示。

路由层面简化为 **登录页 + 主页** 两条；鉴权守卫在进入主页前完成 token / cube-secret 校验，并初始化播放器与全局状态。

**成果**：Shell 逻辑集中、易维护；2D 与 3D 共用同一套导航与配置加载流程。

---

### 4.4 壳层与公共组件 TSX 化

以下部分已全部从 Vue 单文件改写为 TSX：

- 约 **78 个**公共面板组件（面板模板、折线图、滚动表格、无数据占位等）
- 登录页
- 设备详情与设备弹层、告警弹层
- 标题栏、业务导航、区域导航、Layout 及主要 Modal

**成果**：壳层与卡片之间的「公共 UI 层」已 100% TSX，为卡片 TSX 化扫清依赖障碍。

---

### 4.5 业务卡片全量 TSX 化

这是本次改造中工作量最大的一块。

- 覆盖 **104 个业务域**（总览、安防、停车、能耗、巡更、医疗、平湖演示等）
- 累计 **960+** 个卡片/组件由 `.vue` 转为 `.tsx`
- 仓库内 **Vue 单文件数量为零**（已通过自动化门禁校验）

卡片与后端的对接方式 **没有改动**：仍通过卡片注册表关联可视化 SDK 中的卡片定义与面板定义，租户侧配置无需变更。

卡片注册表由原先一个超大文件，按优先级拆分为多个域级文件（总览、安防总览、通用面板等已拆分，其余域按计划在后续迭代继续拆分）。

**组件写法升级**  
批量转换分两轮完成：

1. 第一轮自动生成 Vue 内部 render 函数形式，可读性差；
2. 第二轮统一重写为 **标准 JSX 写法**（`defineComponent` + JSX 返回），消除编译器生成的 `_createElementBlock` 等底层调用，便于后续人工维护与 Code Review。

**成果**：全仓统一 TSX 技术栈；卡片行为与原系统对齐，协议层零 Breaking Change。

---

### 4.6 鉴权与配置加载

- 新增 **会话模块**：支持 URL 携带 `cube-secret` 的 SSO 场景，并与 session 存储互为兜底。
- **配置加载器**不再强依赖微前端根应用的 ConfigLoader，改为使用本应用会话信息拉取可视化项目配置。
- 当前以 **standalone** 方式启动（`app.ts` → `Application.install()`），**尚未**注册 qiankun 生命周期。

**Standalone（当前）**

- 入口：`app.ts` / 路由前缀 `/ue5`
- 鉴权：`cube-secret` URL 同步 + session fallback + 独立登录页

**Qiankun 子应用（计划，未开发）**

- 入口：`main.ts` 增加 `renderWithQiankun`，参考 inspection-command-screen
- 路由 base：qiankun 模式下 `/portal/ue5`，独立模式下 `/ue5`
- 鉴权：优先使用主应用下发的 `props.auth`，与 URL / session 互为兜底
- 卸载：`unmount` 时调用 `Application.uninstall()`，释放 ModelSDK / WebSocket 等资源

**尚未完成**：登录页与主应用登录模式的完全统一、HTTP 请求层全面收口到标准 authRequest、配置文件中敏感信息清理、**qiankun 双模式改造**。

---

### 4.7 工程化与质量门禁

建立了可重复的迁移工具链，用于 Vue → TSX 转换、import 路径修正、多根 JSX 包裹、引号修复等批量操作，并配置 CI 脚本：

- **零 Vue 检查** — 全仓及壳层分层校验
- **构建验证** — 开发模式全量构建通过（当前仍需约 8GB 堆内存）

---

## 五、改造前后对比

```
改造前                              改造后（当前）                 计划补充（未开发）
────────────────────────────────────────────────────────────────────────────────────
/apps-legacy/ue5                    /ue5 standalone               /portal/ue5 qiankun 子应用
多套 Shell、多 entry                单一可视化入口                 同一套壳层，双入口挂载
700+ 行 Legacy 壳 + 部分 TSX 壳     统一 TSX 壳层
960+ Vue 卡片                       960+ TSX 卡片，零 .vue
pages + components 双轨目录         widgets / cards / shared 等
运行时切换 entry                    运行时按 renderType 分支
仅新窗口打开                        新窗口（已实现）               主应用内嵌（待做）
```

---

## 六、当前完成情况

| 项                              | 状态        |
| ------------------------------- | ----------- |
| 独立应用工程搭建                | ✅ 已完成   |
| 目录重组与死代码清理            | ✅ 已完成   |
| 壳层 TSX 化                     | ✅ 已完成   |
| 全卡片 TSX 化                   | ✅ 已完成   |
| 标准 JSX 写法（非 render 函数） | ✅ 已完成   |
| 单入口 + 2D 内嵌                | ✅ 已完成   |
| 鉴权与会话改造（standalone）    | ✅ 已完成   |
| P0 卡片域注册表拆分             | ✅ 已完成   |
| 全量构建通过                    | ✅ 已完成   |
| bimops SSO 端到端验收（新窗口） | ⬜ 待做     |
| 各 renderType 现场联调          | ⬜ 待做     |
| nginx 新路径部署与切流          | ⬜ 待做     |
| **Qiankun 子应用集成（Phase 5）** | ⬜ **计划新增，暂不开发** |
| 构建内存优化、TS 严格模式       | ⬜ 后续阶段 |

---

## 七、风险与待办

**上线前必须完成（P0 — Standalone）**

1. 在真实 bimops 环境验证：新窗口打开 `/ue5?cube-secret=...` 可完成登录并进入可视化页。
2. 至少选一种租户配置，走通 **模型加载 → 面板展示 → 模型与面板联动** 全链路（UE5 / WebGL / GIS / 2D 至少一种）。
3. 运维配置 nginx，使 `/ue5` 指向新构建产物；bimops 终端下拉菜单地址从 legacy 路径切到新路径（可先灰度并行）。

**子应用集成（P1 — Phase 5，文档已规划，代码暂缓）**

1. `main.ts` 双模式启动：`renderWithQiankun` + standalone 直挂（参考 inspection-command-screen）。
2. Vite 接入 `vite-plugin-qiankun`，配置 `qiankunAppBase = "/portal/ue5"`。
3. bimops / portal 注册微应用路由，支持菜单内打开（非仅新窗口）。
4. 验收：主应用内嵌加载、auth 透传、unmount 后资源释放、与 standalone 行为一致。

**中期优化（P1–P2）**

- 继续按业务域拆分卡片注册表，降低单文件体积
- HTTP 层统一、移除历史 generic-component 依赖
- 海吉星（shengNong）特例：评估合并进本应用或维持独立仓库

**长期收尾（P3）**

- 下线 legacy 默认入口与 `/apps-legacy/ue5`
- 构建拆包，目标 CI 内存降至 4GB 以内
- TypeScript 严格模式、配置脱敏

---

## 八、结论

本次 UE5 迁移改造已完成 **主体工程迁移与代码形态升级**：从 legacy 双轨、多入口、全 Vue 的状态，收敛为 Cube 体系下 **单入口、全 TSX、目录清晰** 的应用工程。业务侧卡片协议与租户配置方式保持不变。

**集成方式计划调整（2026-07）**：在已实现的 **standalone 新窗口** 能力之上，**新增 qiankun 子应用嵌入** 作为正式目标（Phase 5）。当前代码仍仅支持 standalone，**不做 qiankun 改造**，优先完成 standalone 切流与 TSX 迁移遗留运行时修复。

**当前节点**：代码与 standalone 构建已就绪，**差 standalone 最后一公里的 SSO、多渲染类型联调与路径切流**；子应用集成按 Phase 5 文档推进，待 standalone 稳定后再实施。

---

## 九、相关文档索引

| 文档 | 与子应用规划相关的内容 |
| --- | --- |
| [02-target-architecture.md](./02-target-architecture.md) | 双 base、qiankun 启动、鉴权分支 |
| [03-migration-plan.md](./03-migration-plan.md) | Phase 5 任务清单与验收 |
| [PROGRESS.md](../PROGRESS.md) | Phase 5 进度跟踪 |
| [README.md](../README.md) | 关键决策摘要 |

---

_如需技术细节（目录映射、模块清单、分期计划），请参阅同目录下 01–04 号架构与计划文档及 PROGRESS 进度记录。_
