import { defineComponent, ref } from "vue";

import { AssistantEchartsChartHost, AssistantMermaidChartHost } from "./assistant-chart-host";
import { logAssistantChartError, logAssistantChartInfo } from "./assistant-chart-log";
import { renderAssistantMarkdownToHtml } from "./assistant-markdown";
import type { ChartType } from "./assistant-message-segments";

export const AssistantChartBlock = defineComponent({
  name: "AssistantChartBlock",
  props: {
    chartType: { type: String as () => ChartType, required: true },
    source: { type: String, required: true },
    fenceMarkdown: { type: String, required: true },
    mediaBaseUrl: { type: String, required: false, default: "" },
  },
  setup(props) {
    const useFence = ref(false);
    const lastError = ref<unknown>(null);

    const onRenderFailed = (error?: unknown): void => {
      lastError.value = error ?? lastError.value;
      logAssistantChartError(
        "AssistantChartBlock",
        "falling back to code fence HTML",
        {
          chartType: props.chartType,
          sourceLen: props.source.length,
          sourcePreview: props.source.slice(0, 300),
          useFenceBefore: useFence.value,
        },
        error,
      );
      useFence.value = true;
    };

    return () => {
      if (useFence.value) {
        logAssistantChartInfo("AssistantChartBlock", "render chart-fence fallback", {
          chartType: props.chartType,
          sourceLen: props.source.length,
          hadError: lastError.value != null,
        });
        return <div v-html={renderAssistantMarkdownToHtml(props.fenceMarkdown, { mediaBaseUrl: props.mediaBaseUrl })} />;
      }
      if (props.chartType === "mermaid") {
        return <AssistantMermaidChartHost source={props.source} onRenderFailed={onRenderFailed} />;
      }
      return <AssistantEchartsChartHost source={props.source} onRenderFailed={onRenderFailed} />;
    };
  },
});
