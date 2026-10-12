# 个人工作台 2.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保留现有用户级卡片配置、排序和尺寸能力的基础上，实现个人工作台 2.1 的欢迎区、AI 入口、快捷入口、默认业务卡片和新版统一视觉。

**Architecture:** `views/index` 继续作为路由级编排层；固定区域与默认卡片拆成独立 TSX 组件，接口状态收敛到 feature composables。现有 `CubeWorkbenchService` 继续维护可配置卡片；新增备忘录、快捷入口统计和任务处理统计采用 `cube-services/interfaces → gateway → client` 契约，工作台前端只消费 SDK。

**Tech Stack:** Vue 3、Composition API、Vue TSX、Less Modules、`@ghcloud/cube-ui`、Vue Router、qiankun、Bun test、Cube Services 三层契约。

---

## 需求结论

### 页面固定区域

- 用户欢迎条：头像、姓名、上次登录时间、当前日期。
- AI 安全管理助手：推荐问题、文本输入、语音入口、发送入口；提交后跳转个人 AI 问答页并携带问题。
- 快捷入口：按用户进入应用菜单的次数倒序，最多 6 个，点击进入对应菜单页。
- “个人业务看板”标题与说明。

### 默认卡片

- 待办总览、备忘录、通知公告默认展示，不需要用户主动添加。
- 实施假设：默认卡片不可移除；是否允许它们互相排序需产品确认。若未确认，保持设计稿中的固定顺序。
- 待办总览支持“查看全部”和按类型下钻。
- 备忘录首页最多 5 条，新增使用弹窗，更多进入列表弹窗，删除必须二次确认。
- 通知公告首页最多 5 条，按时间倒序，标题单行省略，支持详情跳转。

### 可配置卡片

- 继续支持现有应用卡片的添加、移除、排序和尺寸配置。
- 新增任务处理统计卡片：今日/本周/本月，默认今日，点击分类下钻至已办列表并带类型与时间过滤。
- 应用中心沿用现有历史应用卡片的数据与跳转能力，但改用新版视觉。
- “配置卡片 +”只管理可配置区，不应移除三个默认卡片。

### 原型与现有代码的对应关系

| 原型能力 | 现有实现 | 结论 |
|---|---|---|
| 用户信息 | 主应用已将 `GH-UserInfo` 写入 sessionStorage；OUAA 也有 `/ouaa/context/user` | 复用，增加安全解析工具 |
| 待办总览 | `CubeTodoTaskStatService.getTodoTaskCount/getTodoTaskTags` | 复用并改 UI/下钻参数 |
| 通知公告 | `CubeAnnouncementService.listAnnouncement/announcementDetail` | 复用并限制 5 条 |
| 应用中心 | `CubeAppService.getHistoryApplications` | 复用；现组件误用全部应用接口，应修正 |
| 快捷入口 | 只有历史应用接口，没有“菜单访问次数倒序”的明确契约 | 新增接口或后端确认历史接口语义 |
| 备忘录 | 仓库未发现现成能力 | 新增完整 CRUD 契约 |
| 任务处理统计 | 已办分页存在，但没有按周期和类型聚合统计接口 | 新增聚合接口 |
| AI 跳转 | AI 应用已有 `SET_DRAFT`/`SUBMIT` 宿主事件 | 优先复用事件协议，不在工作台实现完整聊天页 |

## 交付边界

本计划分为两个可独立验收的子项目：

1. **前端壳与可复用接口接入**：用户信息、欢迎区、AI 跳转、待办、公告、历史应用、新版卡片视觉、旧卡片配置兼容。
2. **新增工作台服务能力**：备忘录、快捷入口访问统计、任务处理统计。上游服务若已提供同等接口，只实现 interfaces/client 映射；若没有，则由 gateway 对接对应业务服务。

## 组件边界

| 文件/组件 | 单一职责 | 输入/输出 |
|---|---|---|
| `views/index/index.tsx` | 页面数据编排和区域组合 | 无 props；组合固定区、默认区、配置区 |
| `components/personal-workbench/user-welcome.tsx` | 用户与日期展示 | `profile` prop |
| `components/personal-workbench/ai-assistant-entry.tsx` | 推荐问题与输入提交 | `suggestions` prop；`submit(question)` emit |
| `components/personal-workbench/quick-entry-card.tsx` | 最多 6 个快捷入口 | `entries` prop；`open(entry)` emit |
| `components/personal-workbench/section-heading.tsx` | 业务看板分区标题 | `title/description` props |
| `components/business-card/tasks-todo/tasks-todo.tsx` | 待办摘要和下钻 | 自有加载状态；发布主应用跳转事件 |
| `components/business-card/memo/memo.tsx` | 备忘录摘要与弹窗编排 | 自有 CRUD 状态 |
| `components/business-card/notice/notice.tsx` | 公告摘要与详情跳转 | 自有加载状态 |
| `components/business-card/task-statistics/task-statistics.tsx` | 已办统计周期切换和下钻 | 自有周期状态 |
| `composables/use-personal-workbench.ts` | 首页固定区域的异步状态和动作 | readonly state + `refresh/openApplication/submitAIQuestion` |
| `components/card/card.tsx` | 新版卡片公共边框、标题和操作槽 | `title/icon/variant/removable` props；`close` emit |

---

### Task 1: 固化需求契约与测试入口

**Files:**
- Modify: `prod/cube/apps/workbench/app/package.json`
- Create: `prod/cube/apps/workbench/app/src/types/personal-workbench.ts`
- Create: `prod/cube/apps/workbench/app/src/types/personal-workbench.test.ts`

- [ ] **Step 1: 定义页面模型**

在 `personal-workbench.ts` 中定义 `WorkbenchProfile`、`QuickEntry`、`MemoRecord`、`TaskStatistic`、`WorkbenchPeriod = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH'`。所有列表项必须包含稳定 `id/code`，跳转项必须包含 `applicationCode` 和 `path`。

- [ ] **Step 2: 添加模型守卫测试**

用 `bun:test` 覆盖快捷入口最多取 6 条、备忘录最多取 5 条、公告时间倒序和无效周期回退到 `TODAY`。将排序/截断实现为纯函数，避免在 TSX render 中计算。

- [ ] **Step 3: 增加测试脚本**

在工作台 `package.json` 增加：

```json
"test": "bun test src"
```

- [ ] **Step 4: 验证红绿循环**

Run: `bun -F @ghcloud/cube-workbench-app test`

Expected: 新增纯函数前 FAIL；实现后全部 PASS。

### Task 2: 用户信息与首页固定数据 composable

**Files:**
- Create: `prod/cube/apps/workbench/app/src/utils/current-user.ts`
- Create: `prod/cube/apps/workbench/app/src/utils/current-user.test.ts`
- Create: `prod/cube/apps/workbench/app/src/composables/use-personal-workbench.ts`

- [ ] **Step 1: 测试用户信息解析**

覆盖合法 `GH-UserInfo`、损坏 JSON、无头像、缺姓名和 `lastLoginTime` 缺失。期望输出始终是完整 `WorkbenchProfile`，缺失值显示 `--`。

- [ ] **Step 2: 实现只读用户信息解析**

只读取主应用已写入的 `sessionStorage['GH-UserInfo']`，不重复请求登录接口；字段使用 `name`、`fileVO.path`、`lastLoginTime`。

- [ ] **Step 3: 实现首页 composable**

使用 `shallowRef` 管理 profile、快捷入口和 loading/error；返回 `readonly` 状态和显式动作。固定区域任一接口失败不得阻断可配置卡片渲染。

- [ ] **Step 4: 验证**

Run: `bun -F @ghcloud/cube-workbench-app test`

Expected: PASS。

### Task 3: 新版工作台页面骨架与公共视觉

**Files:**
- Modify: `prod/cube/apps/workbench/app/src/views/index/index.tsx`
- Modify: `prod/cube/apps/workbench/app/src/views/index/index.module.less`
- Modify: `prod/cube/apps/workbench/app/src/components/card/card.tsx`
- Modify: `prod/cube/apps/workbench/app/src/components/card/card.less`
- Create: `prod/cube/apps/workbench/app/src/components/personal-workbench/section-heading.tsx`
- Create: `prod/cube/apps/workbench/app/src/components/personal-workbench/personal-workbench.module.less`

- [ ] **Step 1: 先建立布局纯函数测试**

测试卡片宽度 `flex1/flex2/flex3` 到 CSS class 的稳定映射；未知值回退 `flex1`。

- [ ] **Step 2: 重构首页为组合层**

页面结构固定为：欢迎条 → AI/快捷入口双栏 → 个人业务看板标题 → 默认卡片三列 → 可配置卡片网格。保留 `getCards/getNoUseCards` 和设置页入口。

- [ ] **Step 3: 改造公共 Card**

增加 `variant: 'default' | 'soft'`、`removable` 和 `actions` slot；只有 `/workbench` 配置页且 `removable=true` 时显示关闭按钮。Vue TSX 统一使用 `class`、`for` 和 `onClick`。

- [ ] **Step 4: 实现响应式规则**

桌面三列；小于 1440px 两列；小于 1024px 单列。保持原 `flex1/flex2/flex3` 宽度语义，不修改后端 `cardSize` 字段。

- [ ] **Step 5: 验证构建**

Run: `bun -F @ghcloud/cube-workbench-app build`

Expected: Vite build 成功，无 TSX/Less 错误。

### Task 4: 用户欢迎区与 AI 助手入口

**Files:**
- Create: `prod/cube/apps/workbench/app/src/components/personal-workbench/user-welcome.tsx`
- Create: `prod/cube/apps/workbench/app/src/components/personal-workbench/ai-assistant-entry.tsx`
- Create: `prod/cube/apps/workbench/app/src/components/personal-workbench/ai-assistant-entry.test.ts`
- Modify: `prod/cube/apps/workbench/app/src/views/index/index.tsx`

- [ ] **Step 1: 测试问题提交规则**

覆盖空白文本不提交、推荐问题直接提交、输入文本 trim、重复点击只触发一次。

- [ ] **Step 2: 实现欢迎区**

展示头像、姓名、问候语、上次登录时间和本地日期；时间格式统一使用现有 dayjs 依赖。

- [ ] **Step 3: 实现 AI 入口**

推荐问题由常量配置；点击发送时立即禁用重复操作并展示 loading，然后发布主应用跳转事件进入 AI 应用，再发送 `CUBE_AI_CHAT_SET_DRAFT` 或 `CUBE_AI_CHAT_SUBMIT`。如果 AI 应用尚未 READY，目标页从路由 payload/session bridge 读取一次性问题。

- [ ] **Step 4: 明确语音边界**

首期语音图标仅在已接入 `@ghcloud/cube-speech-assistant` 时启用；否则隐藏，不展示不可用按钮。

- [ ] **Step 5: 验证**

Run: `bun -F @ghcloud/cube-workbench-app test && bun -F @ghcloud/cube-workbench-app build`

Expected: PASS。

### Task 5: 快捷入口

**Files:**
- Create: `prod/cube/apps/workbench/app/src/components/personal-workbench/quick-entry-card.tsx`
- Create: `prod/cube/apps/workbench/app/src/components/personal-workbench/quick-entry-card.test.ts`
- Modify: `prod/cube/apps/workbench/app/src/composables/use-personal-workbench.ts`

- [ ] **Step 1: 验证现有历史应用接口语义**

联调 `CubeAppService.getHistoryApplications()`：若返回顺序确为用户访问次数倒序且包含可跳转菜单路径，直接适配；若只返回应用级历史，执行 Task 10 的快捷入口契约。

- [ ] **Step 2: 测试快捷入口适配器**

输入超过 6 条、缺图标、缺 path、无权限项；输出最多 6 条并保持服务端顺序，无权限项不展示。

- [ ] **Step 3: 实现交互**

点击后发布 `MF_ROOT_TO_APPLICATION`，payload 为 `{ code: applicationCode, path }`。点击后立即显示局部 loading 并阻止重复点击，导航失败恢复可操作状态。

- [ ] **Step 4: 验证**

Run: `bun -F @ghcloud/cube-workbench-app test && bun -F @ghcloud/cube-workbench-app build`

Expected: PASS。

### Task 6: 默认卡片——待办与公告

**Files:**
- Modify: `prod/cube/apps/workbench/app/src/components/business-card/tasks-todo/tasks-todo.tsx`
- Modify: `prod/cube/apps/workbench/app/src/components/business-card/tasks-todo/tasks-todo.less`
- Modify: `prod/cube/apps/workbench/app/src/components/business-card/notice/notice.tsx`
- Modify: `prod/cube/apps/workbench/app/src/components/business-card/notice/notice.less`
- Modify: `prod/cube/apps/workbench/app/src/views/index/index.tsx`

- [ ] **Step 1: 改造待办总览**

并行调用待办总数与标签统计；展示原型规定的类型摘要。查看全部跳转待办中心；点击类型附加 `businessType` 过滤参数。保留 30 秒刷新，但页面隐藏或卸载时停止。

- [ ] **Step 2: 改造公告**

请求 `pageNumber=1,pageSize=5`，按时间倒序显示；标题单行省略。查看更多跳转公告列表；点击公告跳转详情并携带 `id`。

- [ ] **Step 3: 固定默认卡片**

默认卡片不从 `getCards()` 获取，直接由首页渲染；配置页不得出现它们的删除入口。

- [ ] **Step 4: 验证**

Run: `bun -F @ghcloud/cube-workbench-app build`

Expected: PASS；断网时各卡片独立展示错误/空状态，页面其他区域可用。

### Task 7: 默认卡片——备忘录

**Files:**
- Create: `prod/cube/apps/workbench/app/src/components/business-card/memo/memo.tsx`
- Create: `prod/cube/apps/workbench/app/src/components/business-card/memo/memo-form-modal.tsx`
- Create: `prod/cube/apps/workbench/app/src/components/business-card/memo/memo-list-modal.tsx`
- Create: `prod/cube/apps/workbench/app/src/components/business-card/memo/memo.module.less`
- Create: `prod/cube/apps/workbench/app/src/components/business-card/memo/memo.test.ts`
- Modify: `prod/cube/apps/workbench/app/src/components/workbench-cards.ts`

- [ ] **Step 1: 测试 CRUD 状态机**

覆盖新增成功刷新、编辑失败保留弹窗、删除前确认、取消删除无请求、首页只显示 5 条、超长文本省略。

- [ ] **Step 2: 实现首页摘要**

按更新时间倒序显示 5 条；“新增”打开表单；“更多”打开完整列表。加载、空、错误状态分别展示。

- [ ] **Step 3: 实现表单与列表弹窗**

表单至少包含内容（必填，1～200 字）和可选提醒时间；列表支持编辑和移除。保存期间禁用提交，关闭或切换记录时忽略过期响应。

- [ ] **Step 4: 验证**

Run: `bun -F @ghcloud/cube-workbench-app test && bun -F @ghcloud/cube-workbench-app build`

Expected: PASS。

### Task 8: 可配置卡片——任务处理统计与应用中心

**Files:**
- Create: `prod/cube/apps/workbench/app/src/components/business-card/task-statistics/task-statistics.tsx`
- Create: `prod/cube/apps/workbench/app/src/components/business-card/task-statistics/task-statistics.module.less`
- Create: `prod/cube/apps/workbench/app/src/components/business-card/task-statistics/task-statistics.test.ts`
- Modify: `prod/cube/apps/workbench/app/src/components/business-card/history-app/history-app.tsx`
- Modify: `prod/cube/apps/workbench/app/src/components/business-card/history-app/history-app.less`
- Modify: `prod/cube/apps/workbench/app/src/components/workbench-cards.ts`

- [ ] **Step 1: 实现周期模型测试**

默认 `TODAY`；切换周/月仅触发最新请求；点击统计项生成 `{ businessType, period }` 下钻参数。

- [ ] **Step 2: 实现任务处理统计卡片**

消费 Task 10 的统计接口；展示总处理量和业务类型分布。点击分类跳转已办列表并带周期过滤。

- [ ] **Step 3: 修正应用中心数据源**

将当前 `getApplicationGroups()` 改为 `getHistoryApplications()`；最多展示 UI 可容纳的条目，点击逻辑继续复用 `MF_ROOT_TO_APPLICATION`。

- [ ] **Step 4: 注册卡片**

在 `workbench-cards.ts` 导出 `TaskStatistics`；后端卡片元数据 code 必须与组件名完全一致。

- [ ] **Step 5: 验证**

Run: `bun -F @ghcloud/cube-workbench-app test && bun -F @ghcloud/cube-workbench-app build`

Expected: PASS。

### Task 9: 配置页兼容与迁移

**Files:**
- Modify: `prod/cube/apps/workbench/app/src/views/work-bench/work-bench.tsx`
- Modify: `prod/cube/apps/workbench/app/src/views/work-bench/work-bench.module.less`
- Modify: `prod/cube/apps/workbench/service/src/workbench.service.ts`
- Create: `prod/cube/apps/workbench/app/src/views/work-bench/workbench-config.test.ts`

- [ ] **Step 1: 测试配置过滤规则**

默认卡片 code 即使被旧接口返回，也必须从可删除列表中过滤；保存时不得向删除接口提交默认卡片。

- [ ] **Step 2: 保留旧配置数据兼容**

继续识别 `flex1/flex2/flex3`；未知 card code 显示“卡片暂不可用”而不是导致整个页面渲染失败。

- [ ] **Step 3: 更新配置页视觉**

延续新版卡片样式；添加、拖拽、尺寸切换、移除、返回行为保持不变。保存期间锁定拖拽和重复提交。

- [ ] **Step 4: 验证**

Run: `bun -F @ghcloud/cube-workbench-app test && bun -F @ghcloud/cube-workbench-app build`

Expected: PASS；已有用户卡片顺序与尺寸不丢失。

### Task 10: 新增工作台服务契约

**Files:**
- Create: `prod/cube-services/interfaces/src/workbench/gateway.ts`
- Create: `prod/cube-services/interfaces/src/workbench/request.ts`
- Create: `prod/cube-services/interfaces/src/workbench/response.ts`
- Create: `prod/cube-services/interfaces/src/workbench/main.ts`
- Modify: `prod/cube-services/interfaces/package.json`
- Create: `prod/cube-services/client/src/workbench.client.ts`
- Modify: `prod/cube-services/client/src/index.ts`
- Modify: `prod/cube-services/client/package.json`
- Create: `prod/cube-services/gateway/src/controllers/workbench.controller.ts`
- Create: `prod/cube-services/gateway/src/services/business/workbench/workbench.service.ts`
- Create: `prod/cube-services/gateway/src/services/business/workbench/workbench.service.test.ts`
- Modify: `prod/cube-services/gateway/src/app.module.ts`
- Modify: `prod/cube/apps/workbench/app/package.json`

- [ ] **Step 1: 定义契约**

契约必须包含以下方法：

```ts
interface WorkbenchGateway {
  listMemos(params: { pageNumber: number; pageSize: number }): Promise<Pagination<MemoRecord>>
  createMemo(params: { content: string; remindAt?: string }): Promise<MemoRecord>
  updateMemo(id: string, params: { content: string; remindAt?: string }): Promise<MemoRecord>
  deleteMemo(id: string): Promise<void>
  listQuickEntries(params: { limit: number }): Promise<QuickEntry[]>
  getDoneTaskStatistics(params: { period: WorkbenchPeriod }): Promise<TaskStatistic[]>
}
```

- [ ] **Step 2: 为 gateway service 写失败测试**

验证认证头透传、query/body/path 映射、分页响应透传和上游错误不被吞掉。

- [ ] **Step 3: 实现 gateway 与 controller**

执行本步骤前读取并应用 `bun-server-best-practices`。BFF 路径统一使用 `/gw-bff/workbench/*`；controller 只做参数校验和返回，业务映射放 service。

- [ ] **Step 4: 实现 client SDK**

每个导出使用 `WorkbenchGateway['method']` 约束签名；工作台 app 通过 `useAuthRequest` 调用，不在 `src/api/service.ts` 复制新类型。

- [ ] **Step 5: 加入工作台依赖并替换 mock**

增加 `@ghcloud/cube-services-client: workspace:^`，备忘录、快捷入口和已办统计全部切到 SDK。

- [ ] **Step 6: 验证三层构建**

Run:

```bash
bun x tsc -p prod/cube-services/interfaces/tsconfig.json --noEmit
bun test prod/cube-services/gateway/src/services/business/workbench/workbench.service.test.ts
bun -F @ghcloud/cube-gateway-server build
bun -F @ghcloud/cube-services-client build
bun -F @ghcloud/cube-workbench-app build
```

Expected: 全部成功。

### Task 11: 联调、视觉验收与回归

**Files:**
- Modify: `prod/cube/apps/workbench/app/CHANGELOG.md`
- Create: `prod/cube/apps/workbench/app/src/mocks/personal-workbench.ts`（仅本地开发模式加载）

- [ ] **Step 1: 建立可重复联调数据**

覆盖正常、空数据、超长文本、接口失败、6+ 快捷入口、5+ 备忘录、5+ 公告和未知卡片 code。

- [ ] **Step 2: 执行交互回归**

逐项验证：待办两种下钻、公告两种跳转、备忘录新增/编辑/删除、统计周期切换与下钻、快捷入口跳转、AI 推荐问题与输入问题跳转、配置卡片添加/排序/尺寸/移除。

- [ ] **Step 3: 执行视觉回归**

在 1920×1080、1440×900、1024×768 三个视口检查卡片栅格、单行省略、滚动、空状态和弹窗；与 UI 图逐项核对间距、字号、颜色、圆角和图标。

- [ ] **Step 4: 执行最终命令**

Run:

```bash
bun -F @ghcloud/cube-workbench-app test
bun -F @ghcloud/cube-workbench-app build
bun -F @ghcloud/cube-workbench-service build
```

Expected: 全部退出码为 0。

- [ ] **Step 5: 更新变更记录**

记录个人工作台 2.1、新增默认卡片、AI/快捷入口和旧卡片配置兼容，不提前修改版本号或发布配置。

## 产品确认点

开发启动前只需确认以下会改变实现边界的事项：

1. 默认三卡是否允许排序；本计划默认固定顺序且不可移除。
2. 快捷入口统计粒度是“应用”还是“具体菜单”；原型文字要求具体菜单。
3. 任务处理统计的业务分类来源；本计划按 todo `businessType` 聚合。
4. 备忘录是否需要提醒推送；本计划只保存提醒时间，不新增通知调度。
5. AI 提交是打开独立 AI 应用还是主应用抽屉；原型显示独立“个人 AI 问答首页”，本计划按应用跳转实现。
6. 顶部导航属于主应用还是工作台子应用；本计划不在 workbench 重复实现主应用导航。

## 完成标准

- 原型所有注释行为均有对应实现或明确的服务依赖。
- 默认卡片无需配置即可展示，且不可被旧配置误删。
- 原有用户卡片的顺序和尺寸兼容。
- 每个异步交互具有 loading、重复操作保护、空状态和失败恢复。
- 工作台首页不因单个卡片接口失败而整体不可用。
- 工作台测试、构建和三层服务契约验证通过。
