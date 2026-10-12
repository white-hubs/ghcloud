/** 助手对话 UI 用户可见文案与相关纯函数（copy / labels）。 */
import type { PersistedTokenUsage, ReasoningStep } from "@cube-ai/agent-sdk-client-vue";

/** 无「我的智能体」时阻断会话 */
export const COPY_NO_USER_AGENTS = "请添加智能体";

export const COPY_NO_USER_AGENTS_HINT = "请先在「智能体」中添加或创建智能体，再开始对话。";

/** 外层 reasoning 面板：流式进行中 */
export const COPY_REASONING_PANEL_STREAMING = "正在思考";

/** 外层 reasoning 面板：流式结束后折叠标题 */
export const COPY_REASONING_PANEL_COLLAPSED = "思考过程";

/** 外层 reasoning 面板：完成标记 tooltip */
export const COPY_REASONING_PANEL_DONE = "成功";

/** 思考文本（prose）/思考流（feed）面板：流式进行中标题（UI 统一用「思考」，弃「推理」） */
export const COPY_THINKING_STREAMING = "正在思考";

/** 思考文本（prose）/思考流（feed）面板：结束折叠标题「已思考 Xs」 */
export function formatThinkingDoneLabel(elapsed: string): string {
  return elapsed !== "" ? `已思考 ${elapsed}` : "思考过程";
}

/** 思考步骤（steps）面板标题：「思考过程 · N 步 · M 次工具」（无工具时省略后段）。耗时由视图层另附。 */
export function formatThinkingStepsLabel(stepCount: number, toolCount: number): string {
  const base = `思考过程 · ${stepCount} 步`;
  return toolCount > 0 ? `${base} · ${toolCount} 次工具` : base;
}

/** 无 reasoning 时的正文等待占位 */
export const COPY_REPLY_GENERATING = "正在生成回复";

/** 助手正文为空且 turn 已结束 */
export const COPY_EMPTY_REPLY_HINT = "回复生成异常，请重试或刷新页面";

/** 图表 fence 流式未闭合 */
export const COPY_CHART_RENDERING_ECHARTS = "正在渲染图表";
export const COPY_CHART_RENDERING_MERMAID = "正在渲染流程图";

/** html-output 报告：流式未闭合占位 + 气泡内卡片 + 弹窗工具条 */
export const COPY_HTML_REPORT_RENDERING = "正在生成报告";
export const COPY_HTML_REPORT_CARD_TITLE = "分析报告";
export const COPY_HTML_REPORT_CARD_HINT = "点击查看完整报告";
export const COPY_HTML_REPORT_OPEN = "新标签打开";
export const COPY_HTML_REPORT_PRINT = "打印";
export const COPY_HTML_REPORT_CLOSE = "关闭";

/** reasoning step 进行中 spinner */
export const COPY_REASONING_STEP_IN_PROGRESS_ARIA = "执行中";

/** 联网搜索（未接入） */
export const COPY_WEB_SEARCH_LABEL = "联网搜索";
export const COPY_WEB_SEARCH_TITLE = "即将推出";

/** Token 用量「约」前缀的 tooltip */
export const COPY_TOKEN_USAGE_APPROXIMATE_HINT = "流式统计中，最终以完成值为准";

/** 输入区 placeholder（chat / drawer 共用） */
export const COPY_COMPOSER_PLACEHOLDER = "输入你的问题；/ 引用技能";

export type ReferenceMenuCopyType = "kb" | "skill";

export function referenceMenuSearchPlaceholder(type: ReferenceMenuCopyType): string {
  return type === "kb" ? "搜索知识库" : "搜索技能";
}

export function referenceMenuHeadLabel(type: ReferenceMenuCopyType): string {
  return type === "kb" ? "选择知识库" : "选择技能";
}

export function formatReasoningStepStatus(step: ReasoningStep): string {
  if (step.ok === undefined) {
    return "执行中";
  }
  if (step.ok) {
    return "成功";
  }
  return step.error?.code ? `失败（${step.error.code}）` : "失败";
}

export function formatTokenInline(input: number, output: number): string {
  return `输入 ${input.toLocaleString("zh-CN")} · 输出 ${output.toLocaleString("zh-CN")} tokens`;
}

export function terminalKindBadge(kind: PersistedTokenUsage["terminalKind"] | undefined): string {
  if (kind === "cancelled") {
    return "（已取消）";
  }
  if (kind === "failed") {
    return "（失败）";
  }
  return "";
}

export function chartPendingLabel(chartType: "echarts" | "mermaid"): string {
  return chartType === "echarts" ? COPY_CHART_RENDERING_ECHARTS : COPY_CHART_RENDERING_MERMAID;
}
