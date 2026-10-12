import * as echarts from "echarts";
import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import type { AnalysisInfo, AnalysisMetricChart } from "./type";

import style from "./analysis.module.less";

const RANK_BAR_MAX_PERCENT = 100;
const RANK_BAR_MIN_PERCENT = 6;
const CHART_BACKGROUND = "transparent";
const CHART_PANEL_BACKGROUND = "#f8fbff";
const CHART_COLORS = ["#1677ff", "#42b8ff", "#52c41a", "#faad14", "#ff7a45", "#8b7cf6"];
const PIE_CHART_COLORS = ["#2563eb", "#0ea5e9", "#38bdf8", "#14b8a6", "#6366f1", "#7dd3fc"];
const PERCENT_PATTERN = /(\d+(?:\.\d+)?%)/g;
const NUMBER_PATTERN = /^\d+(?:\.\d+)?$/;

// 分析中及待分析
const BeAnalyzedComponents = defineComponent({
  props: ["data", "childrenItem", "grandson"],
  setup(props: { data: AnalysisInfo; childrenItem: AnalysisInfo; grandson: AnalysisInfo }) {
    return (): JSX.Element => (
      <div>
        <span> {props.grandson.name}</span>
      </div>
    );
  },
});

const isRankBarChart = (chartType: string): boolean => chartType === "horizontalBar";

const getRankBarColor = (value: number, index: number): string => {
  if (value >= 70) {
    return "#ff4d4f";
  }
  if (value >= 50) {
    return "#ff9f0a";
  }
  return index < 3 ? "#1677ff" : "#6aa7ff";
};

const getRankBarWidth = (value: number, maxValue: number): string => {
  if (maxValue <= 0) {
    return `${RANK_BAR_MIN_PERCENT}%`;
  }
  return `${Math.max((value / maxValue) * RANK_BAR_MAX_PERCENT, RANK_BAR_MIN_PERCENT)}%`;
};

const getMetricValueClass = (value: string): string => {
  const numberValue = Number(value.replace("%", ""));
  if (!Number.isFinite(numberValue)) {
    return "";
  }
  if (numberValue < 60) {
    return style["analysis-metric-text-value-danger"];
  }
  return "";
};

const renderSummaryLine = (line: string, lineIndex: number): JSX.Element => {
  const parts = line.split(PERCENT_PATTERN);
  return (
    <div key={`${line}-${lineIndex}`} class={style["analysis-rule-summary-line"]}>
      {parts.map((part, partIndex) => {
        if (!part) {
          return null;
        }
        const isPercent = PERCENT_PATTERN.test(part);
        PERCENT_PATTERN.lastIndex = 0;
        const isNumber = NUMBER_PATTERN.test(part);
        return isPercent || isNumber ? (
          <span key={`${part}-${partIndex}`} class={style["analysis-rule-summary-highlight"]}>
            {part}
          </span>
        ) : (
          <span key={`${part}-${partIndex}`}>{part}</span>
        );
      })}
    </div>
  );
};

const RankBarChartComponent = defineComponent({
  props: ["chart"],
  setup(props: { chart: AnalysisMetricChart }) {
    return (): JSX.Element => {
      const maxValue = Math.max(...props.chart.values, 0);
      return (
        <div class={style["analysis-rank-chart"]}>
          <div class={style["analysis-rank-chart-title"]}>{props.chart.title}</div>
          <div class={style["analysis-rank-chart-list"]}>
            {props.chart.categories.map((name, index) => {
              const value = props.chart.values[index] ?? 0;
              const color = getRankBarColor(value, index);
              return (
                <div key={`${name}-${index}`} class={style["analysis-rank-chart-item"]}>
                  <div class={style["analysis-rank-chart-index"]}>{index + 1}</div>
                  <div class={style["analysis-rank-chart-content"]}>
                    <div class={style["analysis-rank-chart-row"]}>
                      <span class={style["analysis-rank-chart-name"]}>{name}</span>
                      <span class={style["analysis-rank-chart-value"]}>
                        {value}
                        {props.chart.valueName.includes("%") ? "%" : ""}
                      </span>
                    </div>
                    <div class={style["analysis-rank-chart-track"]}>
                      <div
                        class={style["analysis-rank-chart-bar"]}
                        style={{
                          width: getRankBarWidth(value, maxValue),
                          background: color,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };
  },
});

const PieMetricChartComponent = defineComponent({
  props: ["chart"],
  setup(props: { chart: AnalysisMetricChart }) {
    return (): JSX.Element => {
      const total = props.chart.values.reduce((sum, value) => sum + value, 0);
      const radius = 74;
      const circumference = 2 * Math.PI * radius;
      let offset = 0;

      return (
        <div class={style["analysis-metric-chart"]}>
          <div class={style["analysis-metric-chart-title"]}>{props.chart.title}</div>
          <div class={style["analysis-pie-chart-body"]}>
            <div class={style["analysis-pie-chart-figure"]}>
              <svg viewBox="0 0 200 200" class={style["analysis-pie-chart-svg"]}>
                <circle cx="100" cy="100" r={radius} fill="none" stroke="#e8f0fb" stroke-width="28" />
                {props.chart.categories.map((name, index) => {
                  const value = props.chart.values[index] ?? 0;
                  const dash = total > 0 ? (value / total) * circumference : 0;
                  const segment = (
                    <circle
                      key={`${name}-${index}`}
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="none"
                      stroke={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]}
                      stroke-width="28"
                      stroke-dasharray={`${dash} ${circumference - dash}`}
                      stroke-dashoffset={-offset}
                      stroke-linecap="butt"
                      transform="rotate(-90 100 100)"
                    />
                  );
                  offset += dash;
                  return segment;
                })}
              </svg>
              <div class={style["analysis-pie-chart-center"]}>
                <strong>{total}</strong>
                <span>{props.chart.valueName || "总数"}</span>
              </div>
            </div>
            <div class={style["analysis-pie-chart-legend"]}>
              {props.chart.categories.map((name, index) => {
                const value = props.chart.values[index] ?? 0;
                const percent = total > 0 ? ((value / total) * 100).toFixed(2) : "0.00";
                return (
                  <div key={`${name}-${index}`} class={style["analysis-pie-chart-legend-item"]}>
                    <i style={{ background: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] }}></i>
                    <span>
                      {name}（{value}）
                    </span>
                    <em>{percent}%</em>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    };
  },
});

const AnalysisMetricChartComponent = defineComponent({
  props: ["chart"],
  setup(props: { chart: AnalysisMetricChart }) {
    const chartRef = ref<HTMLDivElement>();
    let chartInstance: echarts.ECharts | undefined;

    const buildOption = (): echarts.EChartsOption => {
      const { chart } = props;
      const seriesName = chart.valueName || chart.title;
      if (chart.chartType === "pie") {
        const total = chart.values.reduce((sum, value) => sum + value, 0);
        return {
          backgroundColor: CHART_BACKGROUND,
          color: PIE_CHART_COLORS,
          tooltip: {
            trigger: "item",
            backgroundColor: "rgba(255, 255, 255, 0.96)",
            borderColor: "#cfe0f7",
            textStyle: { color: "#1f2d3d" },
            formatter: "{b}<br/>{c} ({d}%)",
          },
          graphic: [
            {
              type: "text",
              left: "23%",
              top: "45%",
              style: {
                text: String(total),
                textAlign: "center",
                fill: "#101828",
                fontSize: 26,
                fontWeight: 800,
              },
            },
            {
              type: "text",
              left: "23%",
              top: "55%",
              style: {
                text: seriesName || "总数",
                textAlign: "center",
                fill: "#9aa5b5",
                fontSize: 12,
                fontWeight: 600,
              },
            },
          ],
          legend: {
            right: "9%",
            top: "middle",
            orient: "vertical",
            icon: "roundRect",
            itemWidth: 10,
            itemHeight: 10,
            itemGap: 12,
            textStyle: {
              color: "#4b5568",
              fontSize: 13,
              fontWeight: 600,
              rich: {
                name: {
                  width: 160,
                  color: "#4b5568",
                  fontSize: 13,
                  fontWeight: 600,
                },
                percent: {
                  width: 68,
                  align: "right",
                  color: "#374151",
                  fontSize: 14,
                  fontWeight: 700,
                },
              },
            },
            formatter: (name: string): string => {
              const index = chart.categories.indexOf(name);
              const value = chart.values[index] ?? 0;
              const percent = total > 0 ? ((value / total) * 100).toFixed(2) : "0.00";
              return `{name|${name}（${value}）}{percent|${percent}%}`;
            },
          },
          series: [
            {
              name: seriesName,
              type: "pie",
              radius: ["42%", "66%"],
              center: ["24%", "55%"],
              avoidLabelOverlap: true,
              itemStyle: {
                borderColor: CHART_PANEL_BACKGROUND,
                borderWidth: 4,
              },
              label: { show: false },
              labelLine: { show: false },
              data: chart.categories.map((name, index) => ({
                name,
                value: chart.values[index] ?? 0,
              })),
            },
          ],
        };
      }

      const isHorizontal = chart.chartType === "horizontalBar";
      const seriesType = chart.chartType === "line" ? "line" : "bar";
      return {
        backgroundColor: CHART_BACKGROUND,
        color: CHART_COLORS,
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          borderColor: "#cfe0f7",
          textStyle: { color: "#1f2d3d" },
          axisPointer: {
            type: seriesType === "bar" ? "shadow" : "line",
            shadowStyle: { color: "rgba(22, 119, 255, 0.08)" },
            lineStyle: { color: "#1677ff" },
          },
        },
        grid: {
          top: 34,
          right: 26,
          bottom: 34,
          left: isHorizontal ? 82 : 42,
          containLabel: true,
        },
        xAxis: isHorizontal
          ? {
              type: "value",
              axisLine: { show: false },
              axisTick: { show: false },
              splitLine: { lineStyle: { color: "#dbe8f8", type: "dashed" } },
              axisLabel: { color: "#7c8da3" },
            }
          : {
              type: "category",
              data: chart.categories,
              axisLine: { lineStyle: { color: "#c9d8eb" } },
              axisTick: { show: false },
              axisLabel: { color: "#6b7783" },
            },
        yAxis: isHorizontal
          ? {
              type: "category",
              data: chart.categories,
              axisLine: { show: false },
              axisTick: { show: false },
              axisLabel: { color: "#6b7783" },
            }
          : {
              type: "value",
              axisLine: { show: false },
              axisTick: { show: false },
              splitLine: { lineStyle: { color: "#dbe8f8", type: "dashed" } },
              axisLabel: { color: "#7c8da3" },
            },
        series: [
          {
            name: seriesName,
            type: seriesType,
            data: chart.values,
            smooth: chart.chartType === "line",
            symbol: chart.chartType === "line" ? "circle" : undefined,
            symbolSize: chart.chartType === "line" ? 7 : undefined,
            lineStyle: chart.chartType === "line" ? { width: 3, color: "#1677ff" } : undefined,
            areaStyle:
              chart.chartType === "line"
                ? {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: "rgba(22, 119, 255, 0.26)" },
                      { offset: 1, color: "rgba(22, 119, 255, 0)" },
                    ]),
                  }
                : undefined,
            barMaxWidth: seriesType === "bar" ? 28 : undefined,
            itemStyle:
              seriesType === "bar"
                ? {
                    borderRadius: isHorizontal ? [0, 6, 6, 0] : [6, 6, 0, 0],
                    color: new echarts.graphic.LinearGradient(isHorizontal ? 0 : 0, isHorizontal ? 0 : 1, isHorizontal ? 1 : 0, 0, [
                      { offset: 0, color: "#66b7ff" },
                      { offset: 1, color: "#1677ff" },
                    ]),
                  }
                : undefined,
          },
        ],
      };
    };

    const renderChart = (): void => {
      if (!chartRef.value) {
        return;
      }
      chartInstance ??= echarts.init(chartRef.value);
      chartInstance.setOption(buildOption(), true);
      chartInstance.resize();
    };

    onMounted(() => {
      nextTick(renderChart);
    });
    watch(
      () => props.chart,
      () => {
        nextTick(renderChart);
      },
    );
    onBeforeUnmount(() => {
      chartInstance?.dispose();
      chartInstance = undefined;
    });

    return (): JSX.Element =>
      isRankBarChart(props.chart.chartType) ? (
        <RankBarChartComponent chart={props.chart} />
      ) : props.chart.chartType === "pie" ? (
        <PieMetricChartComponent chart={props.chart} />
      ) : (
        <div class={style["analysis-metric-chart"]}>
          <div class={style["analysis-metric-chart-title"]}>{props.chart.title}</div>
          <div ref={chartRef} class={style["analysis-metric-chart-body"]}></div>
        </div>
      );
  },
});

const AnalysisMetricTextComponent = defineComponent({
  props: ["texts"],
  setup(props: { texts: { label: string; value: string }[] }) {
    return (): JSX.Element =>
      (props.texts ?? []).length > 0 ? (
        <div class={style["analysis-metric-text-list"]}>
          {(props.texts ?? []).map((item, index) => (
            <div key={`${item.label}-${index}`} class={style["analysis-metric-text-item"]}>
              <span class={style["analysis-metric-text-label"]}>{item.label}</span>
              <span class={[style["analysis-metric-text-value"], getMetricValueClass(item.value)]}>{item.value}</span>
            </div>
          ))}
        </div>
      ) : null;
  },
});

// 新版数据展示
const ShowComponents = defineComponent({
  props: ["data", "childrenItem", "grandson"],
  setup(props: { data: AnalysisInfo; childrenItem: AnalysisInfo; grandson: AnalysisInfo }) {
    return (): JSX.Element => {
      const summaryLines = props.grandson.data?.split("\n").filter((item) => item.trim() !== "") ?? [];
      const charts = props.grandson.displayCharts ?? [];
      const texts = props.grandson.displayTexts ?? [];
      return (
        <div class={style["analysis-rule-card"]} data-pdf-block>
          <div class={style["analysis-rule-section-title"]}>
            <span class={style["analysis-rule-section-icon"]}></span>
            {props.grandson.name}
          </div>
          {summaryLines.length > 0 && (
            <div class={style["analysis-rule-summary"]}>{summaryLines.map((item, key) => renderSummaryLine(item, key))}</div>
          )}
          {texts.length > 0 && <AnalysisMetricTextComponent texts={texts} />}
          {charts.map((chart, index) => (
            <AnalysisMetricChartComponent key={`${chart.title}-${index}`} chart={chart} />
          ))}
        </div>
      );
    };
  },
});
export const AnalysisTextComponents = defineComponent({
  props: ["data", "childrenItem", "grandson"],

  setup(props: { data: AnalysisInfo; childrenItem: AnalysisInfo; grandson: AnalysisInfo }) {
    return (): JSX.Element => {
      const newRenderComponent = (): JSX.Element => (
        <ShowComponents data={props.data} childrenItem={props.childrenItem} grandson={props.grandson} />
      );

      const analysisComponent = (): JSX.Element => (
        <BeAnalyzedComponents data={props.data} childrenItem={props.childrenItem} grandson={props.grandson} />
      );

      return (
        <div class={style["analysis-container"]}>
          {props.grandson.analysisStatus === "Analyzed" || props.grandson.analysisStatus === "AIAnalyzing"
            ? newRenderComponent()
            : analysisComponent()}
        </div>
      );
    };
  },
});
