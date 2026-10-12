# ADR-0024：思考步骤模式（steps / 方案 B）+ 正文气泡真流式

| 字段 | 值 |
| --- | --- |
| 状态 | 已实现（L2 前端）；依赖上游 alpha.16 契约 |
| 日期 | 2026-07-07 |
| 范围 | `@ghcloud/cube-ai-application-app` 助手聊天思考过程展示 |
| 关联 | ADR-0021（Reasoning 树）、上游 **ADR-0035**（final-answer live streaming + `message-reset-v1`）、迁移指南 `2026-07-07-final-answer-live-streaming-message-reset-v1.md` |
| 决策来源 | Grill-me 多轮对齐（2026-07-07） |

## 背景

助手默认思考展示此前经历过 `descriptive`（单行）→ `prose`（拍平叙述打字机）的迭代。本轮 SDK 升级到 `0.0.1-alpha.16`：正文气泡从**假流式**（`done` 才整段出现）改为**真流式**——正文逐字 live 流出，并新增 `message-reset-v1` 在事后"撤回"非最终答案的中间片段（叙述/失败恢复草稿/工具轮）。

真流式改变了思考展示的前提：气泡本身现在也会流式中间叙述。`prose` / `feed` / `descriptive` 假设的"气泡到 done 才出现"不再成立，多工具轮下会与面板**双重叙述**。需要一种**为真流式设计**的默认展示：叙述归思考区、气泡只承载最终答案。参考"方案 B（分离式）"选型。

## 决策摘要

| 项 | 结论 |
| --- | --- |
| 新增模式 | `steps`（思考步骤 / 方案 B），**成为新默认**（原 `prose` 降为可选） |
| 形态 | **线性步骤时间线**：步骤 N + 模型叙述 + 内联工具卡（图标 + 名称 + 完成/失败）+ 耗时；**不成树、不可逐节点展开**（这是与 `detailed` 思考树的根本区别） |
| 分工 | 叙述留在步骤区；**正文气泡只流最终答案**（呼应 alpha.16 真流式 + reset） |
| 完成态 | done 后 ~1s 自动折叠为「思考过程 · N 步 · M 次工具 · 已思考 Xs」，可点开回看；历史消息直出折叠、不重播 |
| 正文气泡 | reset 清空时旧内容 **0.2s 淡出**再移除（mode-agnostic，所有模式共用），随后重新流入终答 |
| 数据层 | **零改动**：`AssistantStore` 在 alpha.16 已内置 `message-reset-v1 → resetInProgressAssistantContent`，Vue 侧直接投影（迁移指南路径 A） |
| 既有模式 | `prose` / `feed` / `descriptive` / `compact` / `silent` / `detailed` 全部保留为可选逃生档 |

## 为什么是 steps 而非扩 prose

真流式后，`prose` 面板与气泡在多工具轮会双重叙述（面板合成叙述 + 气泡 raw 叙述闪现）。无法在流式中途区分"当前 content 是中间叙述还是终答"（都只是 `content`），要保住终答 live 流式就必然接受中间叙述短暂闪现。`steps` 把叙述收进步骤区、气泡只做终答表面，正是消解这一冲突的形态；`prose` 等保留但标注该小瑕疵（可选档可接受）。

## L2 实现（本仓）

| 模块 | 内容 |
| --- | --- |
| `assistant-thinking-mode.ts` | `AssistantThinkingRenderMode` 增 `steps` 并设为默认；`buildThinkingSteps()` 纯函数：按 `parentStepId` 分组成线性时间线（叙述 + tool-call 工具卡）；`resolveThinkingToolLabel()` 名词标签 |
| `assistant-chat-strings.ts` | `formatThinkingStepsLabel(stepCount, toolCount)` |
| `assistant-chat.tsx` | `StepTimelineView`（复用 prose 折叠外壳 + tick 计时 + ~1s 自动折叠）；`AssistantAnswerBubble`（reset 淡出，常驻挂载以承载淡出动画）；工具 activity → cube-ui 图标映射 |
| `assistant-chat.module.less` | 步骤时间线（左竖线、工具卡、状态徽标）+ 气泡淡出动画 + `prefers-reduced-motion` |
| `vue-app-env.d.ts` / `CONTEXT.md` | 模式联合与术语更新（默认 = steps） |

## 不变量 / 兼容

- 气泡内容经 reset 清洗后**恒等于** `terminalDraft`（刷新走 `listMessages` 与不刷新一致）——由上游保证，本层不破坏。
- `steps` 对未升级到 alpha.16 的环境**优雅降级**：不发 reset 时气泡回退到"done 才出现"，步骤时间线仍正常渲染（reasoning 事件不受影响）。本仓 catalog 已统一 `alpha.16`。

## 验收

- `bun test`（含 `buildThinkingSteps`、默认 = `steps` 的解析单测）、`oxlint`、`bun run build` 全绿。
- 关键用例：多工具轮 → 步骤区逐步长出（叙述 + 工具卡 + 耗时），气泡见中间叙述闪现→淡出→终答逐字，done 后步骤区折叠为计数摘要；无工具轮 → 气泡直接逐字、无闪烁。

## 风险与对策

| 风险 | 对策 |
| --- | --- |
| 多工具轮气泡闪现中间叙述 | 属真流式固有；0.2s 淡出软化，叙述由步骤区承载解释 |
| 环境未升级 alpha.16 | 优雅降级（气泡非 live，步骤区仍渲染）；catalog 已统一版本 |
| 模式矩阵变大（7 档） | 仅 `steps` 为默认，其余为显式 query/localStorage 逃生档 |

## 参考代码

- `app/src/views/assistant/assistant-thinking-mode.ts`（`buildThinkingSteps` / `resolveThinkingToolLabel`）
- `app/src/views/assistant/assistant-chat.tsx`（`StepTimelineView` / `AssistantAnswerBubble`）
- 迁移指南：`cube-ai-project/docs/migration/2026-07-07-final-answer-live-streaming-message-reset-v1.md`
- 上游决策：`cube-ai-project` ADR-0035
