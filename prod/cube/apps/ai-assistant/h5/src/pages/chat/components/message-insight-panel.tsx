import { formatReasoningElapsedMs, type ReasoningStep, type ReasoningTree, type TokenUsageSnapshot } from "@cube-ai/agent-sdk-client-vue";
import { computed, defineComponent, nextTick, onUnmounted, ref, watch, type PropType, type VNode } from "vue";

import {
  buildThinkingSteps,
  computeThinkingElapsedMs,
  formatThinkingDoneLabel,
  formatTokenInline,
  formatToolEventPhase,
  formatToolEventTime,
  formatToolPayload,
  formatToolPreview,
  isKnowledgeRetrievalStep,
  isSkillReferenceStep,
  readInsightReasoningSteps,
  readInsightToolEvents,
  readKnowledgeHits,
  readSkillRefs,
  readStringArray,
  readTokenUsageItems,
  terminalKindBadge,
  type StepActivity,
  type ThinkingTimelineStep,
  type ThinkingTimelineTool,
} from "../assistant-insights";
import { resolveToolDisplayLabel } from "../assistant-tool-labels";
import type { ChatMessageInsight } from "../types";

import styles from "../chat.module.less";

const COPY_REASONING_PANEL_STREAMING = "正在思考";
const COPY_REASONING_PANEL_COLLAPSED = "思考过程";
const COPY_REASONING_PANEL_DONE = "成功";
const COPY_REASONING_STEP_IN_PROGRESS_ARIA = "执行中";

function createReasoningFallback(steps: ReasoningStep[]): ReasoningTree | null {
  return steps.length > 0 ? { steps } : null;
}

function toolStatusText(ok: boolean | undefined): string {
  if (ok === undefined) {
    return "执行中";
  }
  return ok ? "完成" : "失败";
}

function toolStatusClass(ok: boolean | undefined): string {
  if (ok === undefined) {
    return styles.insightToolStatusRun;
  }
  return ok ? styles.insightToolStatusOk : styles.insightToolStatusErr;
}

function activityClass(activity: StepActivity): string {
  switch (activity) {
    case "web-search":
      return styles.insightActivityWeb;
    case "knowledge-retrieval":
      return styles.insightActivityKnowledge;
    case "skill-load":
      return styles.insightActivitySkill;
    default:
      return styles.insightActivityTool;
  }
}

export const MessageInsightPanel = defineComponent({
  name: "MessageInsightPanel",
  props: {
    insight: {
      type: Object as PropType<ChatMessageInsight>,
      required: true,
    },
    mediaBaseUrl: {
      type: String,
      required: true,
    },
    sending: {
      type: Boolean,
      default: false,
    },
  },
  setup: (props): (() => VNode) => {
    const bodyRef = ref<HTMLDivElement | null>(null);
    const tickNow = ref(Date.now());
    let tickTimer: ReturnType<typeof setInterval> | undefined;

    const reasoningTree = computed(() => props.insight.reasoning ?? createReasoningFallback(readInsightReasoningSteps(props.insight)));
    const reasoningSteps = computed(() => reasoningTree.value?.steps ?? []);
    const timelineSteps = computed(() => buildThinkingSteps(reasoningSteps.value));
    const toolEvents = computed(() => readInsightToolEvents(props.insight));
    const tokenItems = computed<TokenUsageSnapshot[]>(() => readTokenUsageItems(props.insight.tokenUsage));
    const hasAnyInProgressStep = computed(() => reasoningSteps.value.some((step) => step.ok === undefined));
    const timelineToolCount = computed(() => timelineSteps.value.reduce((sum, step) => sum + step.tools.length, 0));
    const elapsedMs = computed(() => computeThinkingElapsedMs(reasoningSteps.value, tickNow.value, props.sending));
    const tokenLabel = computed(() => {
      const usage = props.insight.tokenUsage;
      const cumulative = usage?.cumulative;
      if (usage == null || cumulative == null) {
        return "";
      }
      return formatTokenInline(cumulative.input, cumulative.output);
    });
    const panelTitle = computed(() => {
      if (props.sending && reasoningSteps.value.length > 0) {
        return COPY_REASONING_PANEL_STREAMING;
      }
      if (reasoningSteps.value.length > 0) {
        return COPY_REASONING_PANEL_COLLAPSED;
      }
      if (toolEvents.value.length > 0) {
        return "工具调用";
      }
      return "用量统计";
    });
    const autoScrollKey = computed(() => {
      const reasoningKey = reasoningSteps.value
        .map((step) => {
          const outputKey = step.output === undefined ? "" : formatToolPreview(step.output).length;
          const errorKey = step.error == null ? "" : `${step.error.code}:${step.error.message.length}`;
          return `${step.stepId}:${step.text.length}:${step.ok ?? "running"}:${step.endTime ?? ""}:${outputKey}:${errorKey}`;
        })
        .join("|");
      const timelineKey = timelineSteps.value
        .map((step) => `${step.key}:${step.narration.length}:${step.inProgress ? "running" : "done"}:${step.tools.length}`)
        .join("|");
      const toolKey = toolEvents.value
        .map((event) => `${event.id}:${event.phase}:${event.completedAt ?? ""}:${formatToolPreview(event.resultPreview).length}`)
        .join("|");
      const usage = props.insight.tokenUsage;
      const usageCumulative = usage?.cumulative;
      const tokenKey =
        usage == null || usageCumulative == null
          ? ""
          : `${usageCumulative.input}:${usageCumulative.output}:${tokenItems.value.at(-1)?.updatedAt ?? ""}:${usage.terminalKind ?? ""}`;
      return `${props.sending ? "running" : "idle"}::${reasoningKey}::${timelineKey}::${toolKey}::${tokenKey}`;
    });

    watch(
      hasAnyInProgressStep,
      (active) => {
        if (tickTimer !== undefined) {
          clearInterval(tickTimer);
          tickTimer = undefined;
        }
        if (active) {
          tickTimer = setInterval(() => {
            tickNow.value = Date.now();
          }, 150);
        }
      },
      { immediate: true },
    );

    onUnmounted(() => {
      if (tickTimer !== undefined) {
        clearInterval(tickTimer);
      }
    });

    const scrollInsightBodyToBottom = (): void => {
      if (!props.sending) {
        return;
      }
      void nextTick(() => {
        requestAnimationFrame(() => {
          const el = bodyRef.value;
          if (el == null) {
            return;
          }
          el.scrollTop = el.scrollHeight;
        });
      });
    };

    watch(autoScrollKey, scrollInsightBodyToBottom, { immediate: true, flush: "post" });

    const stepElapsedText = (step: Pick<ThinkingTimelineStep, "startTime" | "endTime" | "inProgress">): string => {
      if (step.startTime === undefined) {
        return "";
      }
      const end = step.inProgress ? tickNow.value : (step.endTime ?? tickNow.value);
      return formatReasoningElapsedMs(Math.max(0, end - step.startTime));
    };

    const renderSkillRefsBody = (step: ReasoningStep): VNode | null => {
      const refs = readSkillRefs(step.output, step.args);
      if (refs.length === 0 && step.output === undefined && step.args == null) {
        return null;
      }
      return (
        <div class={styles.insightTimelineToolBody}>
          <div class={styles.insightToolSummary}>
            <span class={styles.insightToolChip}>本轮技能</span>
            {refs.length === 0 ? <span class={styles.insightToolMuted}>未解析到技能引用</span> : null}
            {refs.map((ref) => (
              <span key={ref.skillId} class={[styles.insightToolChip, styles.insightToolChipSkill]}>
                {ref.displayName && ref.displayName !== ref.skillId ? `${ref.displayName} · ${ref.skillId}` : ref.skillId}
              </span>
            ))}
          </div>
        </div>
      );
    };

    const renderKnowledgeBody = (step: ReasoningStep): VNode | null => {
      const args = step.args ?? {};
      const query = typeof args.query === "string" ? args.query : "";
      const kbIds = readStringArray(args.kbIds);
      const hits = readKnowledgeHits(step.output);
      if (!query && kbIds.length === 0 && hits.length === 0 && step.output === undefined && step.error == null) {
        return null;
      }
      return (
        <div class={styles.insightTimelineToolBody}>
          <div class={styles.insightToolSummary}>
            <span class={styles.insightToolChip}>知识库检索</span>
            {query ? <span class={styles.insightToolQuery}>{query}</span> : null}
            {kbIds.map((kbId) => (
              <span key={kbId} class={styles.insightToolChip}>
                {kbId}
              </span>
            ))}
          </div>
          {hits.length > 0 ? (
            <div class={styles.insightKnowledgeHitList}>
              {hits.map((hit, index) => (
                <div key={`${hit.title}-${index}`} class={styles.insightKnowledgeHit}>
                  <div class={styles.insightKnowledgeHitTitle}>
                    <span>{hit.title}</span>
                    {hit.kbId ? <span class={styles.insightKnowledgeHitMeta}>{hit.kbId}</span> : null}
                    {typeof hit.score === "number" ? (
                      <span class={styles.insightKnowledgeHitMeta}>{Math.round(hit.score * 100)}%</span>
                    ) : null}
                  </div>
                  <div class={styles.insightKnowledgeHitSnippet}>{hit.snippet}</div>
                </div>
              ))}
            </div>
          ) : step.output !== undefined ? (
            <div class={styles.insightToolMuted}>未从已选知识库返回匹配片段</div>
          ) : null}
          {step.error ? (
            <div class={styles.insightToolSection}>
              <div class={styles.insightToolSectionLabel}>错误</div>
              <pre class={styles.insightToolPre}>{formatToolPayload(step.error)}</pre>
            </div>
          ) : null}
        </div>
      );
    };

    const renderGenericToolBody = (step: ReasoningStep): VNode | null => {
      if (step.error == null) {
        return null;
      }
      return (
        <div class={styles.insightTimelineToolBody}>
          <div class={styles.insightToolSection}>
            <div class={styles.insightToolSectionLabel}>错误</div>
            <pre class={styles.insightToolPre}>{formatToolPayload(step.error)}</pre>
          </div>
        </div>
      );
    };

    const renderToolBody = (tool: ThinkingTimelineTool): VNode | null => {
      const step = tool.step;
      if (isSkillReferenceStep(step)) {
        return renderSkillRefsBody(step);
      }
      if (isKnowledgeRetrievalStep(step)) {
        return renderKnowledgeBody(step);
      }
      return renderGenericToolBody(step);
    };

    const renderTimelineTool = (tool: ThinkingTimelineTool): VNode => {
      const body = renderToolBody(tool);
      return (
        <div key={tool.key} class={styles.insightTimelineToolCard}>
          <div class={styles.insightTimelineToolHead}>
            <span class={[styles.insightActivityDot, activityClass(tool.activity)]} aria-hidden="true" />
            <span class={styles.insightTimelineToolName}>{tool.label}</span>
            <span class={[styles.insightToolStatus, toolStatusClass(tool.ok)]}>
              {tool.ok === undefined ? (
                <span class={styles.insightSpin} role="status" aria-label={COPY_REASONING_STEP_IN_PROGRESS_ARIA} />
              ) : null}
              {toolStatusText(tool.ok)}
            </span>
          </div>
          {body}
        </div>
      );
    };

    const renderTimeline = (): VNode | null => {
      if (timelineSteps.value.length === 0) {
        return props.sending ? <div class={styles.insightTimelineEmpty}>正在思考...</div> : null;
      }
      return (
        <div class={styles.insightTimeline}>
          {timelineSteps.value.map((step, index) => {
            const elapsed = stepElapsedText(step);
            return (
              <div key={step.key} class={styles.insightTimelineItem}>
                <div class={styles.insightTimelineHeading}>
                  <span class={styles.insightTimelineStepNo}>步骤 {index + 1}</span>
                  {elapsed !== "" ? <span class={styles.insightDuration}> · {elapsed}</span> : null}
                  {step.inProgress ? <span class={styles.insightSpin} role="status" aria-label={COPY_REASONING_PANEL_STREAMING} /> : null}
                </div>
                {step.narration !== "" ? <div class={styles.insightTimelineText}>{step.narration}</div> : null}
                {step.tools.length > 0 ? <div class={styles.insightTimelineTools}>{step.tools.map(renderTimelineTool)}</div> : null}
              </div>
            );
          })}
        </div>
      );
    };

    const renderFallbackToolEvents = (): VNode | null => {
      if (reasoningSteps.value.length > 0 || toolEvents.value.length === 0) {
        return null;
      }
      return (
        <div class={styles.insightToolList}>
          {toolEvents.value.map((event) => {
            const preview = formatToolPreview(event.resultPreview);
            return (
              <div key={event.id} class={styles.insightToolItem}>
                <div class={styles.insightToolTitle}>
                  <span>{formatToolEventPhase(event)}</span>
                  <span>{resolveToolDisplayLabel(event.toolName)}</span>
                  <span class={styles.insightToolTime}>{formatToolEventTime(event)}</span>
                </div>
                {preview ? <div class={styles.insightToolPreview}>{preview}</div> : null}
              </div>
            );
          })}
        </div>
      );
    };

    return (): VNode => {
      const { tokenUsage } = props.insight;
      const terminalBadge = terminalKindBadge(tokenUsage?.terminalKind);
      const isReasoningStreaming = props.sending && reasoningSteps.value.length > 0;
      const stepCount = timelineSteps.value.length;
      const toolCount = timelineToolCount.value;
      const summaryStepLabel =
        stepCount > 0
          ? toolCount > 0
            ? `${stepCount} 步 · ${toolCount} 次工具`
            : `${stepCount} 步`
          : reasoningSteps.value.length > 0
            ? `${reasoningSteps.value.length} 步`
            : "";
      const doneElapsed = formatThinkingDoneLabel(formatReasoningElapsedMs(elapsedMs.value));
      return (
        <details class={styles.insightPanel} open={props.sending}>
          <summary class={styles.insightSummary}>
            <span class={styles.insightSummaryLeading}>
              <span class={styles.insightTitle}>{panelTitle.value}</span>
              {summaryStepLabel !== "" ? <span class={styles.insightBadge}>{summaryStepLabel}</span> : null}
              {!props.sending && reasoningSteps.value.length > 0 ? <span class={styles.insightBadge}>{doneElapsed}</span> : null}
              {reasoningSteps.value.length === 0 && toolEvents.value.length > 0 ? (
                <span class={styles.insightBadge}>{toolEvents.value.length} 次工具</span>
              ) : null}
              {tokenLabel.value ? <span class={styles.insightTokenBadge}>{tokenLabel.value}</span> : null}
            </span>
            {isReasoningStreaming ? (
              <span class={styles.insightSummaryTail}>
                <span class={styles.insightSpin} role="status" aria-label={COPY_REASONING_PANEL_STREAMING} />
              </span>
            ) : reasoningSteps.value.length > 0 ? (
              <span class={styles.insightSummaryTail} aria-hidden="true">
                <span class={styles.insightPanelDoneMark} title={COPY_REASONING_PANEL_DONE}>
                  <svg class={styles.insightPanelDoneSvg} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path
                      d="M20 6L9 17l-5-5"
                      fill="none"
                      stroke="#16a34a"
                      stroke-width="2.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </span>
            ) : null}
          </summary>
          <div ref={bodyRef} class={styles.insightBody}>
            {tokenUsage != null ? (
              <div class={styles.insightTokenRow}>
                <span>{tokenLabel.value}</span>
                {tokenUsage.approximate ? <span class={styles.insightTokenHint}>统计中</span> : null}
                {terminalBadge ? <span class={styles.insightTokenHint}>{terminalBadge}</span> : null}
              </div>
            ) : null}
            {renderTimeline()}
            {renderFallbackToolEvents()}
          </div>
        </details>
      );
    };
  },
});
