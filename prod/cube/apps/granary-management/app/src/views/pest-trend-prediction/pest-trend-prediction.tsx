import { Select } from "ant-design-vue";
import * as echarts from "echarts";
import { computed, defineComponent, onMounted, onUnmounted, ref, watch, type VNode } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { PEST_TREND_MOCK, type PestRangeKey, type PestSummaryCard, type PestWarehouseStatus } from "./mock";

import "./pest-trend-prediction.less";

type ChartMode = "total" | "species";

const rangeOptions: Array<{ label: string; value: PestRangeKey }> = [
  { label: "近7天", value: "7d" },
  { label: "近30天", value: "30d" },
  { label: "近90天", value: "90d" },
];

const chartModeOptions: Array<{ label: string; value: ChartMode }> = [
  { label: "总捕获数", value: "total" },
  { label: "分种类", value: "species" },
];

const densityClassMap: Record<PestWarehouseStatus["densityLevel"], string> = {
  重度: "is-heavy",
  中度: "is-middle",
  轻度: "is-light",
  未部署: "is-none",
};

const riskClassMap: Record<PestWarehouseStatus["risk"], string> = {
  high: "is-high",
  medium: "is-medium",
  low: "is-low",
  none: "is-none",
};

const renderSummaryValue = (card: PestSummaryCard): VNode => (
  <div class="pest-trend-summary-value">
    {card.trend === "up" ? (
      <>
        <span class="pest-trend-arrow is-up">↑</span>{" "}
      </>
    ) : null}
    {card.trend === "down" ? (
      <>
        <span class="pest-trend-arrow is-down">↓</span>{" "}
      </>
    ) : null}
    {card.value}
  </div>
);

export const PestTrendPrediction = defineComponent({
  name: "PestTrendPrediction",
  setup: () => {
    const { pageTitle } = usePageName();
    const selectedWarehouse = ref(PEST_TREND_MOCK.currentWarehouse);
    const selectedRange = ref<PestRangeKey>("7d");
    const chartMode = ref<ChartMode>("total");
    const trendChartRef = ref<HTMLDivElement | null>(null);
    const speciesChartRef = ref<HTMLDivElement | null>(null);
    const trendChart = ref<echarts.ECharts | null>(null);
    const speciesChart = ref<echarts.ECharts | null>(null);

    const trendPoints = computed(() => PEST_TREND_MOCK.trendPoints[selectedRange.value]);
    const dominantSpecies = computed(() => PEST_TREND_MOCK.speciesShares[0]);

    const renderTrendChart = (): void => {
      if (!trendChart.value) {
        return;
      }
      const points = trendPoints.value;
      const labels = points.map((item) => item.date);
      const option: echarts.EChartsOption = {
        color: ["#5bb7f0", "#ff4d4f", "#f6b11a"],
        grid: { top: 34, left: 36, right: 96, bottom: 34, containLabel: true },
        legend: {
          bottom: 0,
          left: 0,
          itemWidth: 12,
          itemHeight: 8,
          textStyle: { color: "#4e5969", fontSize: 12 },
          data: ["每日捕获数", "7日移动平均", "预警线（20头/日）", "危险线（50头/日）", "超标区间"],
        },
        tooltip: {
          trigger: "axis",
          formatter: (params: unknown): string => {
            if (!Array.isArray(params) || params.length === 0) {
              return "";
            }
            const rows = params as Array<{ marker: string; seriesName: string; value: number | string; axisValueLabel: string }>;
            const title = rows[0]?.axisValueLabel ?? "";
            const content = rows
              .filter((item) => item.seriesName === "每日捕获数" || item.seriesName === "7日移动平均")
              .map((item) => `${item.marker}${item.seriesName}：${item.value}头`)
              .join("<br/>");
            return `${title}<br/>${content}`;
          },
        },
        xAxis: {
          type: "category",
          data: labels,
          axisTick: { show: false },
          axisLine: { lineStyle: { color: "#e5e6eb" } },
          axisLabel: { color: "#86909c", fontWeight: 600 },
        },
        yAxis: {
          type: "value",
          min: 0,
          max: 60,
          interval: 10,
          axisLabel: { color: "#b5b8bf", formatter: "{value}头", fontWeight: 600 },
          splitLine: { lineStyle: { color: "#edf0f3" } },
        },
        series: [
          {
            name: "超标区间",
            type: "line",
            silent: true,
            symbol: "none",
            lineStyle: { opacity: 0 },
            data: points.map(() => 0),
            markArea: {
              silent: true,
              itemStyle: { color: "rgba(255, 77, 79, 0.08)" },
              data: [[{ yAxis: 20 }, { yAxis: 60 }]],
            },
          },
          {
            name: "每日捕获数",
            type: "bar",
            barWidth: 46,
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              color: (params: { dataIndex: number }) => (points[params.dataIndex]?.exceeded === true ? "#ff4d4f" : "#5bb7f0"),
            },
            data: points.map((item) => item.dailyCount),
          },
          {
            name: "7日移动平均",
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 7,
            itemStyle: { color: "#ff4d4f" },
            lineStyle: { color: "#ff4d4f", width: 2 },
            data: points.map((item) => item.movingAverage),
          },
          {
            name: "预警线（20头/日）",
            type: "line",
            symbol: "none",
            lineStyle: { color: "#f6b11a", type: "dashed", width: 1.5 },
            endLabel: { show: true, formatter: "预警线 20头", color: "#f6b11a" },
            data: points.map((item) => item.warningLine),
          },
          {
            name: "危险线（50头/日）",
            type: "line",
            symbol: "none",
            lineStyle: { color: "#ff4d4f", type: "dashed", width: 1.5 },
            endLabel: { show: true, formatter: "危险线 50头", color: "#ff4d4f" },
            data: points.map((item) => item.dangerLine),
          },
        ],
      };
      trendChart.value.setOption(option, true);
    };

    const renderSpeciesChart = (): void => {
      if (!speciesChart.value) {
        return;
      }
      const option: echarts.EChartsOption = {
        color: PEST_TREND_MOCK.speciesShares.map((item) => item.color),
        tooltip: { trigger: "item", formatter: "{b}: {c}%" },
        legend: {
          right: 0,
          top: "middle",
          orient: "vertical",
          itemWidth: 10,
          itemHeight: 10,
          textStyle: { color: "#4e5969" },
          formatter: (name: string): string => {
            const item = PEST_TREND_MOCK.speciesShares.find((share) => share.name === name);
            return item == null ? name : `${name} ${item.value}%`;
          },
        },
        series: [
          {
            type: "pie",
            radius: ["42%", "68%"],
            center: ["38%", "50%"],
            avoidLabelOverlap: true,
            label: { show: false },
            emphasis: { label: { show: false } },
            data: PEST_TREND_MOCK.speciesShares.map((item) => ({ name: item.name, value: item.value })),
          },
        ],
      };
      speciesChart.value.setOption(option, true);
    };

    const resizeCharts = (): void => {
      trendChart.value?.resize();
      speciesChart.value?.resize();
    };

    onMounted(() => {
      if (trendChartRef.value != null) {
        trendChart.value = echarts.init(trendChartRef.value);
        renderTrendChart();
      }
      if (speciesChartRef.value != null) {
        speciesChart.value = echarts.init(speciesChartRef.value);
        renderSpeciesChart();
      }
      window.addEventListener("resize", resizeCharts);
    });

    watch([selectedRange, chartMode], () => {
      renderTrendChart();
      renderSpeciesChart();
    });

    onUnmounted(() => {
      window.removeEventListener("resize", resizeCharts);
      trendChart.value?.dispose();
      speciesChart.value?.dispose();
    });

    return (): VNode => (
      <CubeLayout title={pageTitle ?? "虫害趋势预测"} showFooter={false}>
        {{
          "layout-content": () => (
            <div class="pest-trend-root">
              <div class="pest-trend-toolbar">
                <div class="pest-trend-toolbar-left">
                  <Select
                    class="pest-trend-warehouse-select"
                    value={selectedWarehouse.value}
                    options={PEST_TREND_MOCK.warehouseOptions}
                    onChange={(value: string) => {
                      selectedWarehouse.value = value;
                    }}
                  />
                  <div class="pest-trend-range-buttons">
                    {rangeOptions.map((item) => (
                      <Button
                        key={item.value}
                        type={selectedRange.value === item.value ? "primary" : "default"}
                        onClick={() => {
                          selectedRange.value = item.value;
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <span class="pest-trend-updated">数据更新：{PEST_TREND_MOCK.updatedAt}</span>
              </div>

              <section class="pest-trend-summary">
                {PEST_TREND_MOCK.summaryCards.map((card) => (
                  <div key={card.label} class={["pest-trend-summary-card", `is-${card.tone}`]}>
                    <div class="pest-trend-summary-label">{card.label}</div>
                    {renderSummaryValue(card)}
                    <div class="pest-trend-summary-sub">{card.subText}</div>
                  </div>
                ))}
              </section>

              <section class="pest-trend-panel pest-trend-chart-panel">
                <div class="pest-trend-panel-header">
                  <h3>虫害密度变化趋势</h3>
                  <div class="pest-trend-mode-buttons">
                    {chartModeOptions.map((item) => (
                      <Button
                        key={item.value}
                        type={chartMode.value === item.value ? "primary" : "default"}
                        onClick={() => {
                          chartMode.value = item.value;
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div ref={trendChartRef} class="pest-trend-chart"></div>
              </section>

              <section class="pest-trend-bottom">
                <div class="pest-trend-panel">
                  <div class="pest-trend-panel-header">
                    <h3>仓房虫害状态</h3>
                  </div>
                  <table class="pest-trend-status-table">
                    <thead>
                      <tr>
                        <th>仓房</th>
                        <th>储粮品种</th>
                        <th>诱捕器</th>
                        <th>本周捕获</th>
                        <th>优势种类</th>
                        <th>密度等级</th>
                        <th>风险</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PEST_TREND_MOCK.warehouseStatuses.map((row) => (
                        <tr key={row.warehouse} class={`is-${row.risk}`}>
                          <td>{row.warehouse}</td>
                          <td>{row.grainType}</td>
                          <td>{row.trapCount}个</td>
                          <td>{row.weeklyCount == null ? "—" : `${row.weeklyCount}头`}</td>
                          <td>{row.dominantSpecies}</td>
                          <td>
                            <span class={["pest-trend-density-tag", densityClassMap[row.densityLevel]]}>{row.densityLevel}</span>
                          </td>
                          <td>
                            <span class={["pest-trend-risk-dot", riskClassMap[row.risk]]}></span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div class="pest-trend-panel pest-trend-species-panel">
                  <div class="pest-trend-panel-header">
                    <h3>虫害种类分布</h3>
                  </div>
                  <div ref={speciesChartRef} class="pest-trend-species-chart"></div>
                  <div class="pest-trend-species-note">
                    当前危害优势种类：<strong>{dominantSpecies.value?.name ?? "--"}</strong>
                    <span>（占比{dominantSpecies.value?.value ?? 0}%）</span>
                  </div>
                </div>
              </section>
            </div>
          ),
        }}
      </CubeLayout>
    );
  },
});
