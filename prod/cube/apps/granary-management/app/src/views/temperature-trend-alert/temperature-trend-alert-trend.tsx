import { Select } from "ant-design-vue";
import * as echarts from "echarts";
import { computed, defineComponent, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type {
  LiangcangBoundWarehouseSimpleItem,
  LiangcangTemperatureAlertSampleDayVO,
  LiangcangTemperatureAlertTrendVO,
} from "@ghcloud/cube-granary-management-service";
import { Button, DatePicker, message } from "@ghcloud/cube-ui";

import { addDays, downloadBlob, formatDate, formatDateTime, formatNumber } from "./temperature-trend-alert-shared";
import { cubeGranaryManagementService } from "@/api/service";

import "./temperature-trend-alert.less";

type TrendRangeKey = 7 | 14 | 30 | "custom";

const getChartTemperatureValue = (value: unknown): number | null => {
  const rawValue = Array.isArray(value) ? value[1] : value;
  if (rawValue != null && typeof rawValue === "object" && "value" in rawValue) {
    const objectValue = Number((rawValue as { value: unknown }).value);
    return Number.isFinite(objectValue) ? objectValue : null;
  }
  const numericValue = Number(rawValue);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const readWarehouseIdQuery = (value: unknown): number | null => {
  const raw = Array.isArray(value) ? value[0] : value;
  const numeric = Number(raw);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};

const normalizeDateText = (value: unknown): string => {
  const formatted = formatDateTime(value, "");
  return formatted.length >= 10 ? formatted.slice(0, 10) : "";
};

export const TemperatureTrendAlertTrend = defineComponent({
  name: "TemperatureTrendAlertTrend",
  setup: () => {
    const route = useRoute();
    const warehouses = ref<LiangcangBoundWarehouseSimpleItem[]>([]);
    const selectedTrendWarehouseId = ref<number | null>(null);
    const activeTrendRange = ref<TrendRangeKey>(7);
    const trendStartDate = ref(formatDate(addDays(new Date(), -6)));
    const trendEndDate = ref(formatDate(new Date()));
    const trendData = ref<LiangcangTemperatureAlertTrendVO | null>(null);
    const samples = ref<LiangcangTemperatureAlertSampleDayVO[]>([]);
    const expandedSampleDates = ref<Set<string>>(new Set());
    const trendLoading = ref(false);
    const sampleExporting = ref(false);
    const chartRef = ref<HTMLDivElement | null>(null);
    const chartInstance = ref<echarts.ECharts | null>(null);

    const warehouseOptions = computed(() =>
      warehouses.value.map((item) => ({
        label: item.name === "" ? `仓房${item.warehouseId}` : item.name,
        value: item.warehouseId,
      })),
    );

    const renderChart = (): void => {
      if (chartInstance.value == null) {
        return;
      }
      const points = trendData.value?.series ?? [];
      const labels = points.map((item) => item.date);
      const warningLine = trendData.value?.warningLine ?? null;
      const warningThreshold = trendData.value?.warningThreshold ?? null;
      let triggeredPointData = points
        .map((item) => (item.triggered && item.temperature != null ? [item.date, item.temperature] : null))
        .filter((item): item is [string, number] => item != null);
      if (triggeredPointData.length === 0 && trendData.value?.alertNotice?.alerting === true) {
        const noticeDate = normalizeDateText(trendData.value.alertNotice.triggeredAt);
        const noticePoint = noticeDate === "" ? null : points.find((item) => item.date === noticeDate && item.temperature != null);
        const fallbackPoint = noticePoint ?? points.findLast((item) => item.temperature != null);
        triggeredPointData =
          fallbackPoint == null || fallbackPoint.temperature == null ? [] : [[fallbackPoint.date, fallbackPoint.temperature]];
      }
      const triggeredDateSet = new Set(triggeredPointData.map(([date]) => date));
      const yAxisValues = [
        ...points.map((item) => item.temperature).filter((item): item is number => item != null),
        warningLine,
        warningThreshold,
      ].filter((item): item is number => item != null);
      const yAxisMin = yAxisValues.length === 0 ? undefined : Math.max(0, Math.floor(Math.min(...yAxisValues) - 2));
      const yAxisMax = yAxisValues.length === 0 ? undefined : Math.ceil(Math.max(...yAxisValues) + 2);
      chartInstance.value.setOption({
        color: ["#1677ff", "#f5222d", "#faad14"],
        grid: { top: 30, right: 70, bottom: 42, left: 58, containLabel: true },
        tooltip: {
          trigger: "axis",
          confine: true,
          axisPointer: { type: "line" },
          formatter: (params: unknown): string => {
            if (!Array.isArray(params) || params.length === 0) {
              return "";
            }
            const rows = params as Array<{ marker: string; seriesName: string; value: unknown; axisValueLabel: string }>;
            const visibleRows = rows
              .filter((item) => item.seriesName === "日平均最高温" || item.seriesName === "预警触发点")
              .map((item) => ({ ...item, temperature: getChartTemperatureValue(item.value) }))
              .filter((item) => item.temperature != null);
            return [
              rows[0]?.axisValueLabel ?? "",
              ...visibleRows.map((item) => `${item.marker}${item.seriesName}：${formatNumber(item.temperature)}℃`),
            ].join("<br/>");
          },
        },
        xAxis: { type: "category", boundaryGap: false, data: labels, axisTick: { show: false } },
        yAxis: {
          type: "value",
          name: "℃",
          min: yAxisMin,
          max: yAxisMax,
          splitLine: { lineStyle: { color: "#edf0f3" } },
        },
        series: [
          {
            name: "日平均最高温",
            type: "line",
            smooth: true,
            symbolSize: 8,
            z: 2,
            data: points.map((item) => {
              if (item.temperature == null) {
                return null;
              }
              if (!triggeredDateSet.has(item.date)) {
                return item.temperature;
              }
              return {
                value: item.temperature,
                symbolSize: 12,
                itemStyle: { color: "#ff4d4f", borderColor: "#fff", borderWidth: 2 },
              };
            }),
            lineStyle: { width: 2 },
            emphasis: {
              focus: "series",
              label: {
                show: true,
                color: "#1677ff",
                formatter: (params: { value: unknown }) => {
                  const temperature = getChartTemperatureValue(params.value);
                  return temperature == null ? "" : `${formatNumber(temperature)}℃`;
                },
                position: "top",
              },
            },
            markLine:
              warningThreshold == null
                ? undefined
                : {
                    symbol: "none",
                    lineStyle: { color: "#ff4d4f", type: "dashed", width: 1.5 },
                    label: {
                      color: "#ff4d4f",
                      formatter: `${formatNumber(warningThreshold)}℃`,
                      position: "end",
                    },
                    data: [{ yAxis: warningThreshold }],
                  },
            markArea:
              warningLine == null || warningThreshold == null
                ? undefined
                : {
                    silent: true,
                    itemStyle: { color: "rgba(250, 173, 20, 0.16)" },
                    data: [[{ yAxis: warningLine }, { yAxis: warningThreshold }]],
                  },
          },
          {
            name: "预警触发点",
            type: "scatter",
            symbolSize: 14,
            z: 20,
            itemStyle: { color: "#ff4d4f", borderColor: "#fff", borderWidth: 2 },
            emphasis: {
              label: {
                show: true,
                color: "#ff4d4f",
                formatter: (params: { value: unknown }) => {
                  const temperature = getChartTemperatureValue(params.value);
                  return temperature == null ? "" : `${formatNumber(temperature)}℃`;
                },
                position: "top",
              },
            },
            data: triggeredPointData,
          },
          ...(warningLine == null
            ? []
            : [
                {
                  name: "逼近线",
                  type: "line",
                  symbol: "none",
                  lineStyle: { width: 0, opacity: 0 },
                  tooltip: { show: false },
                  data: points.map(() => warningLine),
                },
              ]),
        ],
      });
    };

    const loadTrendAndSamples = async (): Promise<void> => {
      if (selectedTrendWarehouseId.value == null) {
        trendData.value = null;
        samples.value = [];
        renderChart();
        return;
      }
      trendLoading.value = true;
      try {
        const [trend, sampleRows] = await Promise.all([
          cubeGranaryManagementService.getTemperatureAlertTrend({
            warehouseId: selectedTrendWarehouseId.value,
            startDate: trendStartDate.value,
            endDate: trendEndDate.value,
          }),
          cubeGranaryManagementService.getTemperatureAlertSamples({
            warehouseId: selectedTrendWarehouseId.value,
            startDate: trendStartDate.value,
            endDate: trendEndDate.value,
          }),
        ]);
        trendData.value = trend;
        samples.value = sampleRows;
        expandedSampleDates.value = sampleRows[0]?.date == null ? new Set() : new Set([sampleRows[0].date]);
        renderChart();
      } finally {
        trendLoading.value = false;
      }
    };

    const loadWarehouses = async (): Promise<void> => {
      const rows = await cubeGranaryManagementService.getBoundWarehouseSimpleList();
      warehouses.value = rows;
      selectedTrendWarehouseId.value = readWarehouseIdQuery(route.query.warehouseId) ?? rows[0]?.warehouseId ?? null;
      await loadTrendAndSamples();
    };

    const toggleSampleDay = (date: string): void => {
      const next = new Set(expandedSampleDates.value);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      expandedSampleDates.value = next;
    };

    const applyTrendRange = (range: TrendRangeKey): void => {
      activeTrendRange.value = range;
      if (range === "custom") {
        return;
      }
      const endDate = new Date();
      trendEndDate.value = formatDate(endDate);
      trendStartDate.value = formatDate(addDays(endDate, -(range - 1)));
      void nextTick(() => {
        void loadTrendAndSamples();
      });
    };

    const exportSamples = async (): Promise<void> => {
      if (selectedTrendWarehouseId.value == null) {
        message.warning("请先选择仓房");
        return;
      }
      sampleExporting.value = true;
      try {
        const blob = await cubeGranaryManagementService.exportTemperatureAlertSamples({
          warehouseId: selectedTrendWarehouseId.value,
          startDate: trendStartDate.value,
          endDate: trendEndDate.value,
        });
        const warehouseName = trendData.value?.warehouseName || "全部仓房";
        downloadBlob(blob, `${warehouseName}-温度采样明细-${trendStartDate.value}-${trendEndDate.value}.xlsx`);
        message.success("采样明细已导出");
      } finally {
        sampleExporting.value = false;
      }
    };

    onMounted(() => {
      void nextTick(() => {
        if (chartRef.value != null) {
          chartInstance.value = echarts.init(chartRef.value);
        }
        void loadWarehouses();
      });
      window.addEventListener("resize", renderChart);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", renderChart);
      chartInstance.value?.dispose();
    });

    watch([trendData], renderChart, { deep: true });
    watch(
      () => route.query.warehouseId,
      (value) => {
        const nextWarehouseId = readWarehouseIdQuery(value);
        if (nextWarehouseId != null && nextWarehouseId !== selectedTrendWarehouseId.value) {
          selectedTrendWarehouseId.value = nextWarehouseId;
          void loadTrendAndSamples();
        }
      },
    );

    return (): JSX.Element => (
      <CubeLayout title="温度走势" showFooter={false}>
        {{
          "layout-content": () => (
            <div class="temperature-alert-page">
              <div class="temperature-alert-trend-page-layout">
                <section class="temperature-alert-panel temperature-alert-trend-panel">
                  <div class="temperature-alert-trend-filter">
                    <div class="temperature-alert-filter-item">
                      <span class="temperature-alert-filter-label">仓房</span>
                      <Select
                        class="temperature-alert-trend-warehouse-select"
                        value={selectedTrendWarehouseId.value ?? undefined}
                        options={warehouseOptions.value}
                        placeholder="请选择仓房"
                        onChange={(value: number) => {
                          selectedTrendWarehouseId.value = value;
                          void loadTrendAndSamples();
                        }}
                      />
                    </div>
                    <div class="temperature-alert-filter-item temperature-alert-trend-range-item">
                      <span class="temperature-alert-filter-label">时间范围</span>
                      {([7, 14, 30] as const).map((range) => (
                        <button
                          key={range}
                          type="button"
                          class={["temperature-alert-range-button", activeTrendRange.value === range ? "is-active" : ""]}
                          onClick={() => applyTrendRange(range)}
                        >
                          {range}天
                        </button>
                      ))}
                      <button
                        type="button"
                        class={["temperature-alert-range-button", activeTrendRange.value === "custom" ? "is-active" : ""]}
                        onClick={() => {
                          activeTrendRange.value = "custom";
                        }}
                      >
                        自定义
                      </button>
                    </div>
                    <div class="temperature-alert-filter-item temperature-alert-filter-item--date">
                      <DatePicker
                        value={trendStartDate.value}
                        valueFormat="YYYY-MM-DD"
                        allowClear={false}
                        onUpdate:value={(value: string) => {
                          trendStartDate.value = value;
                          activeTrendRange.value = "custom";
                        }}
                      />
                      <span class="temperature-alert-date-separator">至</span>
                      <DatePicker
                        value={trendEndDate.value}
                        valueFormat="YYYY-MM-DD"
                        allowClear={false}
                        onUpdate:value={(value: string) => {
                          trendEndDate.value = value;
                          activeTrendRange.value = "custom";
                        }}
                      />
                      <Button type="primary" loading={trendLoading.value} onClick={() => void loadTrendAndSamples()}>
                        确定
                      </Button>
                    </div>
                  </div>
                  <div class="temperature-alert-chart-legend">
                    <span>
                      <i class="legend-line legend-line-blue"></i>日平均最高温
                    </span>
                    <span>
                      <i class="legend-line legend-line-red-dashed"></i>预警阈值线
                    </span>
                    <span>
                      <i class="legend-area"></i>逼近区域
                    </span>
                    <span>
                      <i class="legend-dot"></i>预警触发点
                    </span>
                  </div>
                  <div class="temperature-alert-trend-summary">
                    <strong>{trendData.value?.warehouseName || "--"}</strong>
                    <span>品种：{trendData.value?.grainType || "--"}</span>
                    <span>阈值：{formatNumber(trendData.value?.warningThreshold)}℃</span>
                    <span>逼近线：{formatNumber(trendData.value?.warningLine)}℃</span>
                  </div>
                  {trendData.value?.alertNotice?.alerting === true ? (
                    <div class="temperature-alert-notice">{trendData.value.alertNotice.message}</div>
                  ) : null}
                  <div ref={chartRef} class="temperature-alert-chart"></div>
                </section>
                <section class="temperature-alert-panel temperature-alert-sample-panel">
                  <div class="temperature-alert-sample-header">
                    <div>
                      <span class="temperature-alert-sample-title">温度采样明细（按天展开）</span>
                      <span class="temperature-alert-sample-subtitle">每天48次采样，取最高温平均值</span>
                    </div>
                    <Button type="primary" loading={sampleExporting.value} onClick={() => void exportSamples()}>
                      导出Excel
                    </Button>
                  </div>
                  <div class="temperature-alert-sample-list">
                    {samples.value.length === 0 ? (
                      <div class="temperature-alert-empty">暂无采样数据</div>
                    ) : (
                      samples.value.map((day) => {
                        const expanded = expandedSampleDates.value.has(day.date);
                        return (
                          <div key={day.date} class="temperature-alert-sample-day">
                            <button type="button" class="temperature-alert-sample-day-head" onClick={() => toggleSampleDay(day.date)}>
                              <strong>{day.date}</strong>
                              <span>采样{day.sampleCount}次</span>
                              <span>日平均最高温: {formatNumber(day.avgMaxTemperature)}℃</span>
                              <em>{expanded ? "▴" : "▾"}</em>
                            </button>
                            {expanded ? (
                              <table>
                                <tbody>
                                  {day.items.map((item) => (
                                    <tr key={`${day.date}-${item.sampleTime}`}>
                                      <td>{formatDateTime(item.sampleTime)}</td>
                                      <td>{item.warehouseName || "--"}</td>
                                      <td>{formatNumber(item.maxTemperature)}℃</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : null}
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              </div>
            </div>
          ),
        }}
      </CubeLayout>
    );
  },
});
