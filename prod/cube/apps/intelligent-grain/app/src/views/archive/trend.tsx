import dayjs from "dayjs";
import * as echarts from "echarts";
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { GrainDimension, type GrainArchiveTrend } from "@ghcloud/cube-service-interface/intelligent-grain";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getIntelligentGrainArchiveTrend } from "@ghcloud/cube-services-client/intelligent-grain.client";
import { Button, Empty, Space, Spin, message } from "@ghcloud/cube-ui";

import { useArchiveWarehouse } from "@/views/archive/use-archive-warehouse";
import { IntelligentGrainWarehouseSelector } from "@/views/archive/warehouse-selector";
import { formatTime } from "@/views/shared/view-utils";

import "@/views/shared/intelligent-grain.less";

type MetricKey = "temperature" | "storage" | "humidity" | "gas";

interface MetricTab {
  key: MetricKey;
  label: string;
  dimension: GrainDimension;
  metric: string;
  seriesName: string;
  title: string;
  rateLabel: string;
}

const METRIC_TABS: MetricTab[] = [
  {
    key: "temperature",
    label: "温度",
    dimension: GrainDimension.TEMPERATURE,
    metric: "TEMP_MAX",
    seriesName: "最高粮温",
    title: "最高粮温趋势",
    rateLabel: "升温速率",
  },
  {
    key: "storage",
    label: "储量",
    dimension: GrainDimension.STORAGE,
    metric: "WEIGHT",
    seriesName: "实时储量",
    title: "储量趋势",
    rateLabel: "储量变化",
  },
  {
    key: "humidity",
    label: "湿度",
    dimension: GrainDimension.HUMIDITY,
    metric: "HUMIDITY",
    seriesName: "仓内湿度",
    title: "湿度趋势",
    rateLabel: "湿度变化",
  },
  {
    key: "gas",
    label: "气体",
    dimension: GrainDimension.GAS,
    metric: "CO2",
    seriesName: "CO2浓度",
    title: "气体趋势",
    rateLabel: "浓度变化",
  },
];

const RANGE_OPTIONS = [
  { label: "7天", value: 7 },
  { label: "30天", value: 30 },
  { label: "90天", value: 90 },
  { label: "12个月", value: 365 },
];

function formatAxisTime(value?: string, range = 7): string {
  if (!value) {
    return "--";
  }
  const time = dayjs(value);
  if (!time.isValid()) {
    return value;
  }
  return range <= 7 ? time.format("MM-DD HH:mm") : time.format("MM-DD");
}

function formatNumber(value?: number, unit = ""): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "--";
  }
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded}${unit}`;
}

export const IntelligentGrainArchiveTrend = defineComponent({
  name: "IntelligentGrainArchiveTrend",
  setup: () => {
    const router = useRouter();
    const loading = ref(false);
    const range = ref(7);
    const activeMetric = ref<MetricKey>("temperature");
    const chartRef = ref<HTMLDivElement>();
    const trend = ref<GrainArchiveTrend>();
    let chart: echarts.ECharts | undefined;

    const { warehouseLoading, warehouseOptions, selectedWarehouse, selectedWarehouseId, loadWarehouses, changeWarehouse } =
      useArchiveWarehouse();

    const activeMetricTab = computed(() => METRIC_TABS.find((item) => item.key === activeMetric.value) ?? METRIC_TABS[0]);
    const firstSeries = computed(() => trend.value?.series?.[0]);
    const points = computed(() => firstSeries.value?.points ?? []);
    const unit = computed(() => firstSeries.value?.unit ?? trend.value?.unit ?? "");
    const thresholds = computed(() => trend.value?.thresholds ?? []);
    const thresholdText = computed(() =>
      thresholds.value.map((item) => `${item.name}：${item.value}${item.unit ?? unit.value}`).join(" / "),
    );
    const pageTitle = computed(() => {
      const warehouse = selectedWarehouse.value;
      if (!warehouse) {
        return "趋势曲线";
      }
      return `${warehouse.warehouseName} · 趋势曲线`;
    });
    const pageMeta = computed(() => {
      const warehouse = selectedWarehouse.value;
      if (!warehouse) {
        return "--";
      }
      return `${warehouse.areaName || "--"} · ${warehouse.grainType || "--"}`;
    });
    const values = computed(() =>
      points.value
        .map((point) => point.value)
        .filter((value): value is number => value !== undefined && value !== null && !Number.isNaN(value)),
    );
    const trendSummary = computed(() => {
      const currentValues = values.value;
      if (currentValues.length === 0) {
        return [
          { label: "最高值", value: "--", sub: "--" },
          { label: "最低值", value: "--", sub: "--" },
          { label: "平均值", value: "--", sub: "--" },
          { label: activeMetricTab.value.rateLabel, value: "--", sub: "--" },
        ];
      }

      const maxValue = Math.max(...currentValues);
      const minValue = Math.min(...currentValues);
      const avgValue = currentValues.reduce((sum, value) => sum + value, 0) / currentValues.length;
      const firstPoint = points.value.find((point) => point.value !== undefined && point.value !== null);
      const lastPoint = points.value.toReversed().find((point) => point.value !== undefined && point.value !== null);
      const maxPoint = points.value.find((point) => point.value === maxValue);
      const minPoint = points.value.find((point) => point.value === minValue);
      const delta = (lastPoint?.value ?? 0) - (firstPoint?.value ?? 0);
      const deltaText = `${delta > 0 ? "+" : ""}${formatNumber(delta, unit.value)}`;

      return [
        { label: "最高值", value: formatNumber(maxValue, unit.value), sub: formatTime(maxPoint?.time) },
        { label: "最低值", value: formatNumber(minValue, unit.value), sub: formatTime(minPoint?.time) },
        { label: "平均值", value: formatNumber(avgValue, unit.value), sub: `${currentValues.length} 个点位` },
        {
          label: activeMetricTab.value.rateLabel,
          value: deltaText,
          sub: `${formatTime(firstPoint?.time)} - ${formatTime(lastPoint?.time)}`,
        },
      ];
    });

    const buildChartOption = (): echarts.EChartsOption => {
      const chartPoints = points.value;
      const chartUnit = unit.value;
      const chartThresholds = thresholds.value;
      const chartName = firstSeries.value?.name || activeMetricTab.value.seriesName;
      const data = chartPoints.map((point) => (point.value === undefined || point.value === null ? null : point.value));
      const thresholdValues = chartThresholds.map((item) => Number(item.value)).filter((value) => Number.isFinite(value));
      const yAxisValues = [
        ...data.filter((value): value is number => typeof value === "number" && Number.isFinite(value)),
        ...thresholdValues,
      ];
      const yAxisMin = yAxisValues.length > 0 ? Math.min(...yAxisValues) : undefined;
      const yAxisMax = yAxisValues.length > 0 ? Math.max(...yAxisValues) : undefined;
      const yAxisPadding = yAxisMin !== undefined && yAxisMax !== undefined ? Math.max((yAxisMax - yAxisMin) * 0.08, 1) : undefined;

      return {
        animationDuration: 450,
        color: ["#315bff"],
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "line",
            lineStyle: {
              color: "#9db2ff",
            },
          },
          valueFormatter: (value) => `${value ?? "--"}${chartUnit}`,
        },
        grid: {
          top: 58,
          right: 62,
          bottom: 54,
          left: 54,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: chartPoints.map((point) => formatAxisTime(point.time, range.value)),
          axisTick: { show: false },
          axisLine: { lineStyle: { color: "#d8e0ea" } },
          axisLabel: {
            color: "#667085",
            margin: 14,
          },
        },
        yAxis: {
          type: "value",
          name: chartUnit,
          min: yAxisMin === undefined || yAxisPadding === undefined ? undefined : Math.max(0, yAxisMin - yAxisPadding),
          max: yAxisMax === undefined || yAxisPadding === undefined ? undefined : yAxisMax + yAxisPadding,
          nameTextStyle: {
            color: "#8a94a6",
          },
          axisLabel: {
            color: "#667085",
            formatter: `{value}${chartUnit}`,
          },
          splitLine: {
            lineStyle: {
              color: "#edf1f5",
              type: "dashed",
            },
          },
        },
        series: [
          {
            name: chartName,
            type: "line",
            data,
            smooth: true,
            symbol: "circle",
            symbolSize: 8,
            connectNulls: true,
            lineStyle: {
              width: 3,
              color: "#315bff",
            },
            itemStyle: {
              color: "#315bff",
              borderColor: "#fff",
              borderWidth: 2,
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(49, 91, 255, 0.18)" },
                { offset: 1, color: "rgba(49, 91, 255, 0.02)" },
              ]),
            },
            markLine:
              chartThresholds.length > 0
                ? {
                    symbol: "none",
                    silent: true,
                    label: {
                      color: "#f5003d",
                      formatter: ({ name }: { name?: string }) => name ?? "",
                      position: "insideEndTop",
                    },
                    lineStyle: {
                      color: "#f5003d",
                      type: "dashed",
                      width: 2,
                    },
                    data: chartThresholds.map((item) => ({
                      name: `${item.name} ${item.value}${item.unit ?? chartUnit}`,
                      yAxis: item.value,
                    })),
                  }
                : undefined,
          },
        ],
      };
    };

    const renderChart = async (): Promise<void> => {
      await nextTick();
      if (!chartRef.value) {
        return;
      }
      if (!chart || chart.isDisposed()) {
        chart = echarts.init(chartRef.value);
      }
      if (points.value.length === 0) {
        chart.clear();
        return;
      }
      chart.setOption(buildChartOption(), true);
      chart.resize();
    };

    const resizeChart = (): void => {
      chart?.resize();
    };

    const load = async (warehouseId = selectedWarehouseId.value): Promise<void> => {
      if (!warehouseId) {
        trend.value = undefined;
        await renderChart();
        return;
      }
      loading.value = true;
      try {
        trend.value = await useAuthRequest(() =>
          getIntelligentGrainArchiveTrend(warehouseId, {
            range: range.value,
            dimension: activeMetricTab.value.dimension,
            metric: activeMetricTab.value.metric,
          }),
        );
        await renderChart();
      } catch (error) {
        message.error((error as Error).message || "加载趋势曲线失败");
      } finally {
        loading.value = false;
      }
    };

    const changeMetric = (metric: MetricKey): void => {
      if (activeMetric.value === metric) {
        return;
      }
      activeMetric.value = metric;
      void load();
    };

    const changeRange = (value: number): void => {
      if (range.value === value) {
        return;
      }
      range.value = value;
      void load();
    };

    onMounted(() => {
      window.addEventListener("resize", resizeChart);
      void loadWarehouses()
        .then((warehouseId) => load(warehouseId))
        .catch((error: unknown) => {
          message.error((error as Error).message || "加载仓房列表失败");
        });
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", resizeChart);
      chart?.dispose();
    });

    const slots = {
      "layout-header": (): JSX.Element => (
        <Space>
          <IntelligentGrainWarehouseSelector
            value={selectedWarehouseId.value}
            options={warehouseOptions.value}
            loading={warehouseLoading.value}
            onChange={(value: string) => {
              void changeWarehouse(value).then(() => load(value));
            }}
          />
        </Space>
      ),
      "layout-content": (): JSX.Element => (
        <Spin spinning={loading.value}>
          <div class="ig-page ig-trend-page">
            <section class="ig-trend-hero">
              <div>
                <h2>{pageTitle.value}</h2>
                <p>{pageMeta.value}</p>
              </div>
              {thresholdText.value ? <span class="ig-trend-threshold">{thresholdText.value}</span> : null}
            </section>

            <section class="ig-trend-tabs">
              {METRIC_TABS.map((item) => (
                <button
                  class={["ig-trend-tab", activeMetric.value === item.key ? "is-active" : ""]}
                  key={item.key}
                  onClick={() => changeMetric(item.key)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </section>

            <section class="ig-trend-card">
              <div class="ig-trend-card__head">
                <div>
                  <h3>{activeMetricTab.value.title}</h3>
                  <p>
                    {firstSeries.value?.name || activeMetricTab.value.seriesName} · {points.value.length} 个采样点
                  </p>
                </div>
                <div class="ig-trend-range">
                  {RANGE_OPTIONS.map((item) => (
                    <button
                      class={range.value === item.value ? "is-active" : ""}
                      key={item.value}
                      onClick={() => changeRange(item.value)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                  <Button type="primary" onClick={() => void load()}>
                    查询
                  </Button>
                </div>
              </div>

              <div class="ig-trend-chart-wrap">
                <div ref={chartRef} class="ig-trend-chart" />
                {points.value.length === 0 ? <Empty class="ig-trend-empty" description="暂无趋势数据" /> : null}
              </div>

              <div class="ig-trend-summary-row">
                {trendSummary.value.map((item) => (
                  <div class="ig-trend-summary-card" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    <em>{item.sub}</em>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </Spin>
      ),
      "footer-page": (): JSX.Element => (
        <Space>
          <Button onClick={() => history.back()}>返回</Button>
          <Button onClick={() => void load()}>刷新</Button>
          <Button
            onClick={() => router.push({ name: "intelligent-grain-archive-detail", query: { warehouseId: selectedWarehouseId.value } })}
          >
            档案详情
          </Button>
          <Button
            onClick={() => router.push({ name: "intelligent-grain-archive-records", query: { warehouseId: selectedWarehouseId.value } })}
          >
            数据明细
          </Button>
        </Space>
      ),
    };

    return (): JSX.Element => <CubeLayout title="趋势曲线" v-slots={slots} />;
  },
});
