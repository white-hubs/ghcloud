import { Radio, Select } from "ant-design-vue";
import * as echarts from "echarts";
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type {
  LiangcangBoundWarehouseSimpleItem,
  LiangcangTemperatureTrendScope,
  LiangcangTemperatureTrendStatus,
  LiangcangWarehouseTemperatureTrendPoint,
  LiangcangWarehouseTemperatureTrendStatisticsVO,
} from "@ghcloud/cube-granary-management-service";
import { Button } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeGranaryManagementService } from "@/api/service";

import "./gain-temperature.less";

interface GranaryOption {
  label: string;
  value: number;
}

type ForecastDays = 7 | 15;
type LayerKey = "all" | "upper" | "middle" | "lower";
type TemperatureStatus = "normal" | "warning" | "danger";
const ACTUAL_SERIES_NAME = "温度（实测）";
const FORECAST_SERIES_NAME = "温度（预测）";
const WARNING_SERIES_NAME = "预警线";

interface TemperaturePoint {
  displayDate: string;
  fullDate: string;
  actual?: number;
  prediction?: number;
}

interface LayerTemperature {
  label: string;
  value: number;
  status: TemperatureStatus;
  statusText: string;
  threshold: number;
  trend?: string;
  points: TemperaturePoint[];
}

interface GranaryDetail {
  updatedAt: string;
  layers: Record<LayerKey, LayerTemperature>;
}

const LAYER_OPTIONS: Array<{ label: string; value: LayerKey }> = [
  { label: "全仓", value: "all" },
  { label: "上层", value: "upper" },
  { label: "中层", value: "middle" },
  { label: "下层", value: "lower" },
];

const layerScopeMap: Record<LayerKey, LiangcangTemperatureTrendScope> = {
  all: "ALL",
  upper: "UPPER",
  middle: "MIDDLE",
  lower: "LOWER",
};

const scopeLayerMap: Record<LiangcangTemperatureTrendScope, LayerKey> = {
  ALL: "all",
  UPPER: "upper",
  MIDDLE: "middle",
  LOWER: "lower",
};

const createDefaultLayers = (): Record<LayerKey, LayerTemperature> => ({
  all: { label: "全仓温度", value: 0, status: "normal", statusText: "正常", threshold: 0, points: [] },
  upper: { label: "上层温度", value: 0, status: "normal", statusText: "正常", threshold: 0, points: [] },
  middle: { label: "中层温度", value: 0, status: "normal", statusText: "正常", threshold: 0, points: [] },
  lower: { label: "下层温度", value: 0, status: "normal", statusText: "正常", threshold: 0, points: [] },
});

const createEmptyDetail = (): GranaryDetail => ({
  updatedAt: "",
  layers: createDefaultLayers(),
});

const toCardStatus = (status: LiangcangTemperatureTrendStatus): TemperatureStatus => {
  if (status === "HIGH") {
    return "danger";
  }
  if (status === "LOW") {
    return "warning";
  }
  return "normal";
};

const toCardStatusText = (status: LiangcangTemperatureTrendStatus): string => {
  if (status === "HIGH") {
    return "过高";
  }
  if (status === "LOW") {
    return "偏低";
  }
  return "正常";
};

const toDateLabel = (point: LiangcangWarehouseTemperatureTrendPoint): string => {
  const dateRaw = String(point.date ?? "").trim();
  const timeRaw = String(point.time ?? "").trim();
  if (/^\d{10,}$/.test(timeRaw)) {
    const numeric = Number(timeRaw);
    if (!Number.isFinite(numeric)) {
      return "--";
    }
    const timestamp = timeRaw.length <= 10 ? numeric * 1000 : numeric;
    const date = new Date(timestamp);
    if (!Number.isNaN(date.getTime())) {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${month}-${day} ${hours}:${minutes}`;
    }
  }
  if (/^\d{10,}$/.test(dateRaw)) {
    const numeric = Number(dateRaw);
    if (!Number.isFinite(numeric)) {
      return "--";
    }
    const timestamp = dateRaw.length <= 10 ? numeric * 1000 : numeric;
    const date = new Date(timestamp);
    if (!Number.isNaN(date.getTime())) {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${month}-${day}`;
    }
  }
  if (dateRaw === "") {
    return "--";
  }
  return dateRaw.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$2-$3").replace(/^(\d{4})\/(\d{2})\/(\d{2})$/, "$2-$3");
};

const toPointDateKey = (point: LiangcangWarehouseTemperatureTrendPoint, fallbackKey: string): string => {
  const dateRaw = String(point.date ?? "").trim();
  if (/^\d{10,}$/.test(dateRaw)) {
    const numeric = Number(dateRaw);
    if (!Number.isFinite(numeric)) {
      return fallbackKey;
    }
    const timestamp = dateRaw.length <= 10 ? numeric * 1000 : numeric;
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return fallbackKey;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(dateRaw)) {
    return dateRaw.replace(/\//g, "-");
  }
  return dateRaw === "" ? fallbackKey : dateRaw;
};

const isSortableDateKey = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

const padDateTimePart = (value: number): string => String(value).padStart(2, "0");

const formatDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = padDateTimePart(date.getMonth() + 1);
  const day = padDateTimePart(date.getDate());
  const hours = padDateTimePart(date.getHours());
  const minutes = padDateTimePart(date.getMinutes());
  const seconds = padDateTimePart(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const normalizeUpdateTime = (updateTime: string): string => {
  const raw = updateTime.trim();
  if (raw === "" || !/^\d+$/.test(raw)) {
    return raw;
  }
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) {
    return raw;
  }
  const timestamp = raw.length <= 10 ? numeric * 1000 : numeric;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }
  return formatDateTime(date);
};

const mergeSeriesPoints = (
  actualSeries: LiangcangWarehouseTemperatureTrendPoint[],
  forecastSeries: LiangcangWarehouseTemperatureTrendPoint[],
): TemperaturePoint[] => {
  const pointMap = new Map<string, TemperaturePoint>();
  const pointOrder = new Set<string>();
  const ensurePoint = (point: LiangcangWarehouseTemperatureTrendPoint, fallbackKey: string): TemperaturePoint => {
    const key = toPointDateKey(point, fallbackKey);
    const existed = pointMap.get(key);
    if (existed != null) {
      return existed;
    }
    const next: TemperaturePoint = {
      displayDate: toDateLabel(point),
      fullDate: key,
    };
    pointMap.set(key, next);
    pointOrder.add(key);
    return next;
  };
  actualSeries.forEach((point, index) => {
    const target = ensurePoint(point, `actual-${index}`);
    target.actual = point.temperature;
  });
  forecastSeries.forEach((point, index) => {
    const target = ensurePoint(point, `forecast-${index}`);
    target.prediction = point.temperature;
  });
  const sortedKeys = [...pointOrder].sort((left, right) => {
    const leftSortable = isSortableDateKey(left);
    const rightSortable = isSortableDateKey(right);
    if (leftSortable && rightSortable) {
      return left.localeCompare(right);
    }
    if (leftSortable) {
      return -1;
    }
    if (rightSortable) {
      return 1;
    }
    return left.localeCompare(right);
  });
  return sortedKeys.map((key) => pointMap.get(key)).filter((item): item is TemperaturePoint => item != null);
};

const mapTrendDetail = (payload: LiangcangWarehouseTemperatureTrendStatisticsVO): GranaryDetail => {
  const layers = createDefaultLayers();
  payload.cards.forEach((card) => {
    const layerKey = scopeLayerMap[card.scope];
    layers[layerKey] = {
      ...layers[layerKey],
      label: card.name === "" ? layers[layerKey].label : card.name,
      value: card.temperature,
      status: toCardStatus(card.status),
      statusText: toCardStatusText(card.status),
      threshold: card.highAlarmThreshold,
    };
  });
  if (payload.chart != null) {
    const layerKey = scopeLayerMap[payload.chart.scope];
    layers[layerKey] = {
      ...layers[layerKey],
      threshold: payload.chart.warningLine,
      points: mergeSeriesPoints(payload.chart.actualSeries, payload.chart.forecastSeries),
    };
  }
  return {
    updatedAt: normalizeUpdateTime(payload.updateTime),
    layers,
  };
};

const toTempParts = (value: number): { integer: string; decimal: string } => {
  const [integer, decimal = "0"] = value.toFixed(1).split(".");
  return { integer, decimal };
};

export const GainTemperature = defineComponent({
  name: "GainTemperature",
  setup: () => {
    const { pageTitle } = usePageName();
    const warehouseOptions = ref<LiangcangBoundWarehouseSimpleItem[]>([]);
    const selectedGranary = ref<number | null>(null);
    const selectedLayer = ref<LayerKey>("all");
    const forecastDays = ref<ForecastDays>(7);
    const chartRef = ref<HTMLDivElement | null>(null);
    const chartInstance = ref<echarts.ECharts | null>(null);
    const currentDetail = ref<GranaryDetail>(createEmptyDetail());
    const refreshing = ref(false);
    const requestId = ref(0);

    const granaryOptions = computed<GranaryOption[]>(() =>
      warehouseOptions.value.map((item) => ({
        label: item.name === "" ? `仓房${item.warehouseId}` : item.name,
        value: item.warehouseId,
      })),
    );

    const currentLayer = computed<LayerTemperature>(() => {
      return currentDetail.value.layers[selectedLayer.value];
    });

    const chartPoints = computed<TemperaturePoint[]>(() => {
      return currentLayer.value.points;
    });

    const temperatureCards = computed(() => {
      return LAYER_OPTIONS.map((item) => ({
        key: item.value,
        ...currentDetail.value.layers[item.value],
      }));
    });

    const renderChart = (): void => {
      if (!chartInstance.value) {
        return;
      }
      const points = chartPoints.value;
      const labels = points.map((item) => String(item.displayDate));
      const actualSeries = points
        .filter((item) => item.actual != null)
        .map((item) => [String(item.displayDate), Number(item.actual)] as [string, number]);
      const predictionSeries = points
        .filter((item) => item.prediction != null)
        .map((item) => [String(item.displayDate), Number(item.prediction)] as [string, number]);

      const option: echarts.EChartsOption = {
        color: ["#1684ff", "#1684ff", "#f6b11a", "#ffd5d8"],
        grid: {
          top: 54,
          left: 38,
          right: 38,
          bottom: 68,
          containLabel: true,
        },
        legend: {
          bottom: 10,
          left: 12,
          icon: "roundRect",
          itemWidth: 16,
          itemHeight: 3,
          textStyle: {
            color: "#4e5969",
            fontSize: 12,
          },
          formatter: (name: string): string => (name === WARNING_SERIES_NAME ? `预警线（${currentLayer.value.threshold}℃）` : name),
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "line",
          },
          formatter: (params: unknown): string => {
            if (!Array.isArray(params) || params.length === 0) {
              return "";
            }
            const chartParams = params as Array<{
              axisValueLabel: string;
              marker: string;
              seriesName: string;
              value: number | string | [string, number];
            }>;
            const title = chartParams[0]?.axisValueLabel ?? "";
            const content = chartParams
              .filter((item) => item.seriesName === ACTUAL_SERIES_NAME || item.seriesName === FORECAST_SERIES_NAME)
              .map((item) => {
                const value = Array.isArray(item.value) ? item.value[1] : Number(item.value);
                if (!Number.isFinite(value)) {
                  return "";
                }
                return `${item.marker}${item.seriesName}：${value.toFixed(1)}℃`;
              })
              .filter((item) => item !== "")
              .join("<br/>");
            return `${title}<br/>${content}`;
          },
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: labels,
          axisTick: { show: false },
          axisLine: { lineStyle: { color: "#e5e6eb" } },
          axisLabel: {
            color: "#86909c",
            fontSize: 11,
            interval: 0,
            hideOverlap: false,
            showMinLabel: true,
            showMaxLabel: true,
          },
        },
        yAxis: {
          name: "温度(℃)",
          nameLocation: "end",
          nameTextStyle: {
            color: "#86909c",
            align: "left",
            padding: [0, 0, 8, -20],
          },
          type: "value",
          min: 0,
          max: 30,
          interval: 5,
          axisLabel: {
            color: "#86909c",
          },
          splitLine: {
            lineStyle: {
              color: "#edf0f3",
            },
          },
        },
        series: [
          {
            id: "actual-series",
            name: ACTUAL_SERIES_NAME,
            type: "line",
            coordinateSystem: "cartesian2d",
            smooth: true,
            symbol: "none",
            lineStyle: { color: "#1684ff", width: 3 },
            data: actualSeries,
          },
          {
            id: "forecast-series",
            name: FORECAST_SERIES_NAME,
            type: "line",
            coordinateSystem: "cartesian2d",
            smooth: true,
            symbol: "none",
            lineStyle: { color: "#1684ff", width: 3, type: "dashed" },
            data: predictionSeries,
          },
          {
            id: "warning-series",
            name: WARNING_SERIES_NAME,
            type: "line",
            coordinateSystem: "cartesian2d",
            symbol: "none",
            silent: true,
            lineStyle: { color: "#f6b11a", width: 1.5, type: "dashed" },
            data: points.map(() => currentLayer.value.threshold),
          },
        ],
      };
      chartInstance.value.setOption(option);
    };

    const handleResize = (): void => {
      chartInstance.value?.resize();
    };

    const loadTrendData = async (): Promise<void> => {
      if (selectedGranary.value == null) {
        currentDetail.value = createEmptyDetail();
        return;
      }
      const currentRequestId = requestId.value + 1;
      requestId.value = currentRequestId;
      refreshing.value = true;
      try {
        const data = await cubeGranaryManagementService.getWarehouseTemperatureTrendStatistics({
          warehouseId: selectedGranary.value,
          scope: layerScopeMap[selectedLayer.value],
          forecastDays: forecastDays.value,
        });
        if (requestId.value !== currentRequestId) {
          return;
        }
        currentDetail.value = mapTrendDetail(data);
      } catch (_ignore) {
        if (requestId.value !== currentRequestId) {
          return;
        }
      } finally {
        if (requestId.value === currentRequestId) {
          refreshing.value = false;
        }
      }
    };

    const loadWarehouses = async (): Promise<void> => {
      const warehouses = await cubeGranaryManagementService.getBoundWarehouseSimpleList();
      warehouseOptions.value = warehouses;
      const defaultWarehouseId = warehouses[0]?.warehouseId ?? null;
      selectedGranary.value = defaultWarehouseId;
      if (defaultWarehouseId == null) {
        currentDetail.value = createEmptyDetail();
      }
    };

    const refreshData = (): void => {
      void loadTrendData();
    };

    onMounted(() => {
      if (!chartRef.value) {
        return;
      }
      chartInstance.value = echarts.init(chartRef.value);
      renderChart();
      window.addEventListener("resize", handleResize);
      void loadWarehouses();
    });

    watch([selectedGranary, selectedLayer, forecastDays], () => {
      void loadTrendData();
    });

    watch(
      [chartPoints, () => currentLayer.value.threshold],
      () => {
        renderChart();
      },
      { deep: true },
    );

    onUnmounted(() => {
      window.removeEventListener("resize", handleResize);
      chartInstance.value?.dispose();
      chartInstance.value = null;
    });

    return (): JSX.Element => (
      <CubeLayout title={pageTitle ?? "粮温趋势预测"} showFooter={false}>
        {{
          "layout-content": () => (
            <div class="gain-temperature-page">
              <section class="gain-temperature-toolbar">
                <Select
                  value={selectedGranary.value ?? undefined}
                  options={granaryOptions.value}
                  class="gain-temperature-granary-select"
                  onChange={(value: number) => {
                    selectedGranary.value = value;
                  }}
                />
                <div class="gain-temperature-toolbar-right">
                  <span>数据更新：{currentDetail.value.updatedAt === "" ? "--" : currentDetail.value.updatedAt}</span>
                  <Button loading={refreshing.value} disabled={selectedGranary.value == null} onClick={refreshData}>
                    刷新
                  </Button>
                </div>
              </section>

              <section class="gain-temperature-summary-row">
                {temperatureCards.value.map((card) => {
                  const temp = toTempParts(card.value);
                  return (
                    <button
                      key={card.key}
                      type="button"
                      class={["gain-temperature-card", `is-${card.status}`, selectedLayer.value === card.key ? "is-active" : ""]}
                      onClick={() => {
                        selectedLayer.value = card.key;
                      }}
                    >
                      <div class="gain-temperature-card-label-row">
                        <span>{card.label}</span>
                        {card.trend != null ? <em>{card.trend}</em> : null}
                      </div>
                      <div class="gain-temperature-card-value">
                        <strong>{temp.integer}</strong>
                        <span>.{temp.decimal}</span>
                        <small>℃</small>
                      </div>
                      <div class="gain-temperature-card-status">
                        <i></i>
                        <span>{card.statusText}</span>
                      </div>
                      <div class="gain-temperature-card-threshold">预警线：{card.threshold}℃</div>
                    </button>
                  );
                })}
              </section>

              <section class="gain-temperature-chart-section">
                <div class="gain-temperature-chart-header">
                  <h3>粮温趋势预测曲线</h3>
                  <div class="gain-temperature-chart-actions">
                    <Radio.Group
                      value={selectedLayer.value}
                      buttonStyle="solid"
                      onChange={(e: { target: { value: LayerKey } }) => {
                        selectedLayer.value = e.target.value;
                      }}
                    >
                      {LAYER_OPTIONS.map((item) => (
                        <Radio.Button key={item.value} value={item.value}>
                          {item.label}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                    <Radio.Group
                      value={forecastDays.value}
                      buttonStyle="solid"
                      onChange={(e: { target: { value: ForecastDays } }) => {
                        forecastDays.value = e.target.value;
                      }}
                    >
                      <Radio.Button value={7}>未来7天</Radio.Button>
                      <Radio.Button value={15}>未来15天</Radio.Button>
                    </Radio.Group>
                  </div>
                </div>
                <div ref={chartRef} class="gain-temperature-chart"></div>
              </section>
            </div>
          ),
        }}
      </CubeLayout>
    );
  },
});
