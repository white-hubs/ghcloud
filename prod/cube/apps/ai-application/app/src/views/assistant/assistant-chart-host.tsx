import type { EChartsType } from "echarts";
import { computed, defineComponent, nextTick, onMounted, onUnmounted, ref, markRaw, shallowRef, watch } from "vue";

import { logAssistantChartError, logAssistantChartInfo } from "./assistant-chart-log";
import {
  enqueueAssistantChartRender,
  initAssistantEcharts,
  loadAssistantEcharts,
  readChartContainerSize,
  waitForChartContainerSize,
} from "./assistant-echarts-loader";
import { listRenderableEchartsOptionCandidates, toPlainEchartsOption } from "./assistant-echarts-merge";
import { parseEchartsOption } from "./assistant-echarts-option";

import styles from "./assistant-chat.module.less";

const MermaidChartHost = defineComponent({
  name: "MermaidChartHost",
  props: {
    source: { type: String, required: true },
    onRenderFailed: { type: Function as () => (error?: unknown) => void, required: true },
  },
  setup(props) {
    const rootRef = ref<HTMLDivElement | null>(null);
    let renderId = 0;

    const renderMermaid = async (): Promise<void> => {
      const el = rootRef.value;
      if (el == null || props.source.trim() === "") {
        return;
      }
      const currentId = renderId + 1;
      renderId = currentId;
      el.replaceChildren();
      try {
        const mermaidModule = await import("mermaid");
        const mermaid = mermaidModule.default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
        });
        const { svg } = await mermaid.render(`assistant-mermaid-${currentId}`, props.source.trim());
        if (renderId !== currentId) {
          return;
        }
        el.innerHTML = svg;
      } catch (error) {
        if (renderId !== currentId) {
          return;
        }
        logAssistantChartError(
          "MermaidChartHost",
          "mermaid.render failed",
          { sourceLen: props.source.length, sourcePreview: props.source.slice(0, 200) },
          error,
        );
        props.onRenderFailed(error);
      }
    };

    onMounted(() => {
      void renderMermaid();
    });

    watch(
      () => props.source,
      () => {
        void renderMermaid();
      },
    );

    return () => <div ref={rootRef} class={styles.mermaidChart} />;
  },
});

const EchartsChartHost = defineComponent({
  name: "EchartsChartHost",
  props: {
    source: { type: String, required: true },
    onRenderFailed: { type: Function as () => (error?: unknown) => void, required: true },
  },
  setup(props) {
    const rootRef = ref<HTMLDivElement | null>(null);
    const chartRef = shallowRef<EChartsType | null>(null);
    const parseResult = computed(() => parseEchartsOption(props.source));
    let renderGeneration = 0;
    let sizeWaitCleanup: (() => void) | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const disposeChart = (): void => {
      chartRef.value?.dispose();
      chartRef.value = null;
    };

    const failRender = (reason: string, error?: unknown, extra?: Record<string, unknown>): void => {
      logAssistantChartError(
        "EchartsChartHost",
        reason,
        {
          sourceLen: props.source.length,
          sourcePreview: props.source.slice(0, 300),
          parseOk: parseResult.value.ok,
          parseMessage: parseResult.value.ok ? undefined : parseResult.value.message,
          ...extra,
        },
        error,
      );
      disposeChart();
      props.onRenderFailed(error);
    };

    const applyOption = (el: HTMLDivElement, generation: number, echartsApi: typeof import("echarts")): void => {
      if (generation !== renderGeneration) {
        return;
      }
      const rawOption = parseResult.value.ok ? parseResult.value.option : {};
      const optionCandidates = listRenderableEchartsOptionCandidates(rawOption);
      if (optionCandidates.length === 0) {
        failRender("setOption-no-candidates", undefined, { sourceLen: props.source.length });
        return;
      }

      const size = readChartContainerSize(el);
      let lastError: unknown;

      for (const candidate of optionCandidates) {
        logAssistantChartInfo("EchartsChartHost", "setOption", {
          generation,
          candidate: candidate.label,
          sourceLen: props.source.length,
          clientWidth: el.clientWidth,
          clientHeight: el.clientHeight,
          initWidth: size.width,
          initHeight: size.height,
          seriesIsArray: Array.isArray(candidate.option.series),
          xAxisIsArray: Array.isArray(candidate.option.xAxis),
          option: candidate.option,
        });
        try {
          disposeChart();
          chartRef.value = markRaw(initAssistantEcharts(el, echartsApi));
          const plainOption = toPlainEchartsOption(candidate.option);
          chartRef.value.setOption(plainOption as Parameters<EChartsType["setOption"]>[0], {
            notMerge: true,
            lazyUpdate: false,
          });
          const seriesProbe: Array<{ subType: string; coordType?: string }> = [];
          chartRef.value.getModel().eachSeries((seriesModel) => {
            seriesProbe.push({
              subType: seriesModel.subType,
              coordType: seriesModel.coordinateSystem?.type,
            });
          });
          logAssistantChartInfo("EchartsChartHost", "setOption success", {
            generation,
            candidate: candidate.label,
            sourceLen: props.source.length,
            seriesProbe,
          });
          return;
        } catch (error) {
          lastError = error;
          const cartesian2dDims = echartsApi.getCoordinateSystemDimensions("cartesian2d");
          logAssistantChartError(
            "EchartsChartHost",
            "setOption threw",
            {
              generation,
              candidate: candidate.label,
              sourceLen: props.source.length,
              clientWidth: el.clientWidth,
              clientHeight: el.clientHeight,
              cartesian2dDims,
              cartesian2dRegistered: cartesian2dDims != null && cartesian2dDims.length > 0,
              option: candidate.option,
            },
            error,
          );
        }
      }

      failRender("setOption-catch", lastError, {
        clientWidth: el.clientWidth,
        clientHeight: el.clientHeight,
      });
    };

    const renderChart = async (): Promise<void> => {
      const generation = renderGeneration + 1;
      renderGeneration = generation;

      await enqueueAssistantChartRender(async () => {
        sizeWaitCleanup?.();
        sizeWaitCleanup = null;

        if (!parseResult.value.ok) {
          failRender("parse-not-ok", undefined, { parseMessage: parseResult.value.message });
          return;
        }
        const el = rootRef.value;
        if (el == null) {
          logAssistantChartError("EchartsChartHost", "renderChart aborted: rootRef is null", {
            sourceLen: props.source.length,
            generation,
          });
          return;
        }

        try {
          const echartsModule = await loadAssistantEcharts();
          if (generation !== renderGeneration) {
            return;
          }
          const runApply = (): void => {
            if (generation !== renderGeneration) {
              return;
            }
            applyOption(el, generation, echartsModule);
          };

          if (el.clientWidth > 0 && el.clientHeight > 0) {
            requestAnimationFrame(() => {
              requestAnimationFrame(runApply);
            });
            return;
          }

          logAssistantChartInfo("EchartsChartHost", "waiting for container size", {
            generation,
            clientWidth: el.clientWidth,
            clientHeight: el.clientHeight,
          });
          sizeWaitCleanup = waitForChartContainerSize(el, () => {
            runApply();
          });
        } catch (error) {
          failRender("render-init-catch", error, { generation });
        }
      });
    };

    watch(
      parseResult,
      (result) => {
        if (!result.ok) {
          failRender("watch-parse-not-ok", undefined, { parseMessage: result.message });
        }
      },
      { immediate: true },
    );

    onMounted(() => {
      void nextTick(() => {
        void renderChart();
        const el = rootRef.value;
        if (el != null && resizeObserver == null) {
          resizeObserver = new ResizeObserver(() => {
            chartRef.value?.resize();
          });
          resizeObserver.observe(el);
        }
      });
    });

    onUnmounted(() => {
      renderGeneration += 1;
      sizeWaitCleanup?.();
      sizeWaitCleanup = null;
      resizeObserver?.disconnect();
      resizeObserver = null;
      disposeChart();
    });

    watch(
      () => props.source,
      () => {
        void nextTick(() => renderChart());
      },
    );

    return () => {
      if (!parseResult.value.ok) {
        return null;
      }
      return <div ref={rootRef} class={styles.echartsChart} />;
    };
  },
});

export const AssistantMermaidChartHost = MermaidChartHost;
export const AssistantEchartsChartHost = EchartsChartHost;
