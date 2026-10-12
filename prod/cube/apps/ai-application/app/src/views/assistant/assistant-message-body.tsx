import { computed, defineComponent } from "vue";

import { AssistantChartBlock } from "./assistant-chart-block";
import { chartPendingLabel, COPY_HTML_REPORT_RENDERING } from "./assistant-chat-strings";
import { AssistantHtmlReportBlock } from "./assistant-html-report-block";
import { renderAssistantMarkdownToHtml } from "./assistant-markdown";
import {
  formatChartFenceMarkdown,
  parseMessageSegments,
  type ChartType,
  type MessageSegment,
  type UnclosedChartFenceMode,
} from "./assistant-message-segments";

import styles from "./assistant-chat.module.less";

function resolveUnclosedChartFenceMode(): UnclosedChartFenceMode {
  const raw = import.meta.env.VITE_ASSISTANT_UNCLOSED_CHART_FENCE_MODE;
  return raw === "code" ? "code" : "placeholder";
}

function segmentKey(segment: MessageSegment, index: number): string {
  if (segment.kind === "markdown") {
    return `md-${index}`;
  }
  if (segment.kind === "chart-pending") {
    return `pending-${segment.chartType}-${index}`;
  }
  if (segment.kind === "chart-fence") {
    return `fence-${segment.chartType}-${index}`;
  }
  if (segment.kind === "html-report-pending") {
    return `report-pending-${index}`;
  }
  if (segment.kind === "html-report") {
    return `report-${index}`;
  }
  return `chart-${segment.chartType}-${index}`;
}

export const AssistantMessageBody = defineComponent({
  name: "AssistantMessageBody",
  props: {
    content: { type: String, required: true },
    mediaBaseUrl: { type: String, required: false, default: "" },
  },
  setup(props) {
    const unclosedChartFenceMode = resolveUnclosedChartFenceMode();
    const segments = computed(() => parseMessageSegments(props.content, { unclosedChartFenceMode }));

    return () => (
      <div class={styles.markdownBody}>
        {segments.value.map((segment, index) => {
          const key = segmentKey(segment, index);
          if (segment.kind === "markdown") {
            return <div key={key} v-html={renderAssistantMarkdownToHtml(segment.source, { mediaBaseUrl: props.mediaBaseUrl })} />;
          }
          if (segment.kind === "chart-fence") {
            return <div key={key} v-html={renderAssistantMarkdownToHtml(segment.fenceMarkdown, { mediaBaseUrl: props.mediaBaseUrl })} />;
          }
          if (segment.kind === "chart-pending") {
            const pendingLabel = chartPendingLabel(segment.chartType);
            return (
              <div key={key} class={styles.chartPending}>
                <span class={styles.thinkingSpin} role="status" aria-label={pendingLabel} />
                <span>{pendingLabel}</span>
              </div>
            );
          }
          if (segment.kind === "html-report-pending") {
            return (
              <div key={key} class={styles.chartPending}>
                <span class={styles.thinkingSpin} role="status" aria-label={COPY_HTML_REPORT_RENDERING} />
                <span>{COPY_HTML_REPORT_RENDERING}</span>
              </div>
            );
          }
          if (segment.kind === "html-report") {
            return <AssistantHtmlReportBlock key={key} source={segment.source} />;
          }
          const chartType = segment.chartType as ChartType;
          const fenceMarkdown = formatChartFenceMarkdown(chartType, segment.source, true);
          return (
            <AssistantChartBlock
              key={key}
              chartType={chartType}
              source={segment.source}
              fenceMarkdown={fenceMarkdown}
              mediaBaseUrl={props.mediaBaseUrl}
            />
          );
        })}
      </div>
    );
  },
});
