import { Select } from "ant-design-vue";
import * as echarts from "echarts";
import { computed, defineComponent, onMounted, onUnmounted, ref, watch, type VNode } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { usePageName } from "@ghcloud/cube-utils";

import "./grain-quality-change.less";

type CardTone = "normal" | "warning" | "danger";
type StorageDecision = "宜存" | "轻度不宜存" | "严重不宜存";

interface SummaryCard {
  label: string;
  value: number;
  unit: string;
  tone: CardTone;
  statusText: string;
  referenceText: string;
}

interface TrendPoint {
  month: string;
  value: number;
}

interface DetectionRecord {
  date: string;
  warehouse: string;
  batch: string;
  fattyAcid: number;
  moisture: number;
  germinationRate: number;
  tasteScore: number;
  decision: StorageDecision;
}

interface GrainQualitySnapshot {
  updatedAt: string;
  summaryCards: SummaryCard[];
  fattyAcidTrend: TrendPoint[];
  moistureTrend: TrendPoint[];
  records: DetectionRecord[];
}

const decisionClassMap: Record<StorageDecision, string> = {
  宜存: "is-safe",
  轻度不宜存: "is-warning",
  严重不宜存: "is-danger",
};

const grainOptions = [
  { label: "A12号仓-优质小麦", value: "a12-wheat" },
  { label: "B08号仓-中筋小麦", value: "b08-wheat" },
];

const GRAIN_QUALITY_MOCK: Record<string, GrainQualitySnapshot> = {
  "a12-wheat": {
    updatedAt: "2025-03-15 09:30:00",
    summaryCards: [
      { label: "脂肪酸值（KOH/干基）", value: 28.6, unit: "mg/100g", tone: "normal", statusText: "宜存", referenceText: "（临界值 <37）" },
      { label: "水分含量", value: 13.2, unit: "%", tone: "normal", statusText: "安全", referenceText: "（安全值 ≤13.5%）" },
      { label: "发芽率", value: 82, unit: "%", tone: "warning", statusText: "偏低", referenceText: "（参考值 ≥85%）" },
      { label: "品尝评分", value: 70, unit: "分", tone: "normal", statusText: "宜存", referenceText: "（临界值 >70）" },
    ],
    fattyAcidTrend: [
      { month: "2024-06", value: 22.3 },
      { month: "2024-09", value: 25.1 },
      { month: "2024-12", value: 28.6 },
      { month: "2025-03", value: 28.4 },
    ],
    moistureTrend: [
      { month: "2024-06", value: 12.8 },
      { month: "2024-09", value: 13.0 },
      { month: "2024-12", value: 13.2 },
      { month: "2025-03", value: 13.2 },
    ],
    records: [
      {
        date: "2025-03-15",
        warehouse: "IQ0102",
        batch: "2024年度",
        fattyAcid: 28.6,
        moisture: 13.2,
        germinationRate: 82,
        tasteScore: 70,
        decision: "宜存",
      },
      {
        date: "2024-12-10",
        warehouse: "IQ0102",
        batch: "2024年度",
        fattyAcid: 25.1,
        moisture: 13.0,
        germinationRate: 87,
        tasteScore: 74,
        decision: "宜存",
      },
      {
        date: "2024-09-05",
        warehouse: "IQ0102",
        batch: "2024年度",
        fattyAcid: 22.3,
        moisture: 12.8,
        germinationRate: 91,
        tasteScore: 78,
        decision: "宜存",
      },
      {
        date: "2024-06-01",
        warehouse: "IQ0102",
        batch: "2023年度",
        fattyAcid: 35.8,
        moisture: 13.4,
        germinationRate: 79,
        tasteScore: 71,
        decision: "轻度不宜存",
      },
    ],
  },
  "b08-wheat": {
    updatedAt: "2025-03-20 14:20:00",
    summaryCards: [
      { label: "脂肪酸值（KOH/干基）", value: 31.3, unit: "mg/100g", tone: "warning", statusText: "关注", referenceText: "（临界值 <37）" },
      { label: "水分含量", value: 13.5, unit: "%", tone: "warning", statusText: "临界", referenceText: "（安全值 ≤13.5%）" },
      { label: "发芽率", value: 79, unit: "%", tone: "warning", statusText: "偏低", referenceText: "（参考值 ≥85%）" },
      { label: "品尝评分", value: 68, unit: "分", tone: "warning", statusText: "谨慎", referenceText: "（临界值 >70）" },
    ],
    fattyAcidTrend: [
      { month: "2024-06", value: 24.2 },
      { month: "2024-09", value: 27.3 },
      { month: "2024-12", value: 29.6 },
      { month: "2025-03", value: 31.3 },
    ],
    moistureTrend: [
      { month: "2024-06", value: 12.9 },
      { month: "2024-09", value: 13.1 },
      { month: "2024-12", value: 13.4 },
      { month: "2025-03", value: 13.5 },
    ],
    records: [
      {
        date: "2025-03-20",
        warehouse: "IQ0108",
        batch: "2024年度",
        fattyAcid: 31.3,
        moisture: 13.5,
        germinationRate: 79,
        tasteScore: 68,
        decision: "轻度不宜存",
      },
      {
        date: "2024-12-17",
        warehouse: "IQ0108",
        batch: "2024年度",
        fattyAcid: 29.6,
        moisture: 13.4,
        germinationRate: 82,
        tasteScore: 69,
        decision: "宜存",
      },
      {
        date: "2024-09-07",
        warehouse: "IQ0108",
        batch: "2024年度",
        fattyAcid: 27.3,
        moisture: 13.1,
        germinationRate: 86,
        tasteScore: 73,
        decision: "宜存",
      },
      {
        date: "2024-06-03",
        warehouse: "IQ0108",
        batch: "2023年度",
        fattyAcid: 36.4,
        moisture: 13.8,
        germinationRate: 76,
        tasteScore: 66,
        decision: "严重不宜存",
      },
    ],
  },
};

const toDisplayValue = (value: number): string => {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
};

const createTrendOption = (
  points: TrendPoint[],
  seriesName: string,
  thresholdSeriesName: string,
  thresholdValue: number,
  color: string,
  unit: string,
  yAxisMin: number,
  yAxisMax: number,
): echarts.EChartsOption => ({
  color: [color, "#d46b6b"],
  legend: {
    top: 0,
    left: 0,
    itemWidth: 10,
    itemHeight: 10,
    textStyle: { color: "#4e5969", fontSize: 12 },
    data: [seriesName, thresholdSeriesName],
  },
  tooltip: {
    trigger: "axis",
    formatter: (params: unknown): string => {
      if (!Array.isArray(params) || params.length === 0) {
        return "";
      }
      const rows = params as Array<{ marker: string; seriesName: string; value: number; axisValueLabel: string }>;
      const title = rows[0]?.axisValueLabel ?? "";
      const detail = rows.map((row) => `${row.marker}${row.seriesName}：${row.value}${unit}`).join("<br/>");
      return `${title}<br/>${detail}`;
    },
  },
  grid: {
    top: 42,
    left: 52,
    right: 24,
    bottom: 34,
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: points.map((item) => item.month),
    axisLine: { lineStyle: { color: "#e5e6eb" } },
    axisTick: { show: false },
    axisLabel: { color: "#86909c" },
  },
  yAxis: {
    type: "value",
    min: yAxisMin,
    max: yAxisMax,
    axisLabel: {
      color: "#86909c",
      formatter: `{value}${unit}`,
    },
    splitLine: { lineStyle: { color: "#edf0f3" } },
  },
  series: [
    {
      name: seriesName,
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 8,
      lineStyle: { width: 2, color },
      itemStyle: { color: "#fff", borderColor: color, borderWidth: 2 },
      areaStyle: { color: `${color}1f` },
      data: points.map((item) => item.value),
    },
    {
      name: thresholdSeriesName,
      type: "line",
      symbol: "none",
      lineStyle: { color: "#cc6f6f", type: "dashed", width: 2 },
      data: points.map(() => thresholdValue),
    },
  ],
});

export const GrainQualityChange = defineComponent({
  name: "GrainQualityChange",
  setup: () => {
    const { pageTitle } = usePageName();
    const selectedGrain = ref("a12-wheat");
    const fattyAcidChartRef = ref<HTMLDivElement | null>(null);
    const moistureChartRef = ref<HTMLDivElement | null>(null);
    const fattyAcidChart = ref<echarts.ECharts | null>(null);
    const moistureChart = ref<echarts.ECharts | null>(null);

    const currentSnapshot = computed<GrainQualitySnapshot>(
      () => GRAIN_QUALITY_MOCK[selectedGrain.value] ?? GRAIN_QUALITY_MOCK["a12-wheat"],
    );

    const renderCharts = (): void => {
      const snapshot = currentSnapshot.value;
      fattyAcidChart.value?.setOption(
        createTrendOption(snapshot.fattyAcidTrend, "实测值", "轻度不宜存临界值（37）", 37, "#4b97dc", "mg/100g", 10, 50),
        true,
      );
      moistureChart.value?.setOption(
        createTrendOption(snapshot.moistureTrend, "实测值", "安全水分上限（13.5%）", 13.5, "#40a87b", "%", 10, 16),
        true,
      );
    };

    const resizeCharts = (): void => {
      fattyAcidChart.value?.resize();
      moistureChart.value?.resize();
    };

    onMounted(() => {
      if (fattyAcidChartRef.value != null) {
        fattyAcidChart.value = echarts.init(fattyAcidChartRef.value);
      }
      if (moistureChartRef.value != null) {
        moistureChart.value = echarts.init(moistureChartRef.value);
      }
      renderCharts();
      window.addEventListener("resize", resizeCharts);
    });

    watch(selectedGrain, () => {
      renderCharts();
    });

    onUnmounted(() => {
      window.removeEventListener("resize", resizeCharts);
      fattyAcidChart.value?.dispose();
      moistureChart.value?.dispose();
    });

    return (): VNode => (
      <CubeLayout title={pageTitle ?? "粮食品质变化"} showFooter={false}>
        {{
          "layout-content": () => (
            <div class="grain-quality-change-page">
              <section class="grain-quality-toolbar">
                <div class="grain-quality-toolbar-left">
                  <span>粮食品质变化</span>
                  <Select
                    value={selectedGrain.value}
                    options={grainOptions}
                    class="grain-quality-select"
                    onChange={(value: string) => {
                      selectedGrain.value = value;
                    }}
                  />
                </div>
                <span class="grain-quality-updated">数据更新时间：{currentSnapshot.value.updatedAt}</span>
              </section>

              <section class="grain-quality-summary">
                {currentSnapshot.value.summaryCards.map((item) => (
                  <article key={item.label} class={["grain-quality-card", `is-${item.tone}`]}>
                    <h3>{item.label}</h3>
                    <div class="grain-quality-card-value">
                      <strong>{toDisplayValue(item.value)}</strong>
                      <span>{item.unit}</span>
                    </div>
                    <div class="grain-quality-card-status">
                      <em>{item.statusText}</em>
                      <span>{item.referenceText}</span>
                    </div>
                  </article>
                ))}
              </section>

              <section class="grain-quality-trend-grid">
                <article class="grain-quality-trend-panel">
                  <h3>脂肪酸值变化趋势</h3>
                  <div ref={fattyAcidChartRef} class="grain-quality-chart"></div>
                </article>
                <article class="grain-quality-trend-panel">
                  <h3>水分含量变化趋势</h3>
                  <div ref={moistureChartRef} class="grain-quality-chart"></div>
                </article>
              </section>

              <section class="grain-quality-table-panel">
                <h3>历史检测记录（支持回溯与对比）</h3>
                <table class="grain-quality-table">
                  <thead>
                    <tr>
                      <th>检测日期</th>
                      <th>仓房</th>
                      <th>批次</th>
                      <th>脂肪酸值</th>
                      <th>水分(%)</th>
                      <th>发芽率(%)</th>
                      <th>品尝评分</th>
                      <th>宜存判定</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSnapshot.value.records.map((item) => (
                      <tr key={`${item.warehouse}-${item.date}`}>
                        <td>{item.date}</td>
                        <td>{item.warehouse}</td>
                        <td>{item.batch}</td>
                        <td>{toDisplayValue(item.fattyAcid)}</td>
                        <td>{toDisplayValue(item.moisture)}</td>
                        <td>{toDisplayValue(item.germinationRate)}</td>
                        <td>{toDisplayValue(item.tasteScore)}</td>
                        <td>
                          <span class={["grain-quality-tag", decisionClassMap[item.decision]]}>{item.decision}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          ),
        }}
      </CubeLayout>
    );
  },
});
