import { Button, DatePicker, message, Select, Table, Tabs } from "ant-design-vue";
import dayjs, { type Dayjs } from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import * as echarts from "echarts";
import { computed, defineComponent, onMounted, onUnmounted, reactive, ref, watch } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type { LiangcangWarehouseStatisticsVO } from "@ghcloud/cube-granary-management-service";
import { Page as CubePage } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeGranaryManagementService } from "@/api/service";

import "./inventory-turnover-ratio.less";

dayjs.extend(quarterOfYear);

type TimeType = "day" | "month" | "quarter" | "year";

type StatisticsDimension = "DAY" | "MONTH" | "QUARTER" | "YEAR";

interface FilterState {
  timeType: TimeType;
  dateRange: [Dayjs, Dayjs] | null;
  warehouseId: string;
  /** 与智慧仓库粮仓种类名一致，对应接口 `warehouseCategory` */
  warehouseCategory: string;
}

interface TableRow {
  id: string;
  timeLabel: string;
  warehouseName: string;
  grainTypeName: string;
  /** 接口 `averageEmptyWarehouseVolume` */
  avgEmptyVolume: number | null;
  /** 接口 `averageInventory`（体积） */
  avgVolume: number | null;
  avgStockTon: number | null;
  turnoverRatio: number | null;
}

interface AcquisitionRow {
  id: string;
  acquisitionTime: string;
  warehouseName: string;
  grainTypeName: string;
  emptyWarehouseVolume: number | null;
  goodsVolume: number | null;
  weight: number | null;
  turnoverRatio: number | null;
}

const DIMENSION_BY_TIME_TYPE: Record<TimeType, StatisticsDimension> = {
  day: "DAY",
  month: "MONTH",
  quarter: "QUARTER",
  year: "YEAR",
};

const makeDefaultRange = (timeType: TimeType): [Dayjs, Dayjs] => {
  const now = dayjs();
  if (timeType === "day") {
    return [now.subtract(14, "day").startOf("day"), now.endOf("day")];
  }
  if (timeType === "month") {
    return [now.subtract(5, "month").startOf("month"), now.endOf("month")];
  }
  if (timeType === "quarter") {
    return [now.subtract(3, "quarter").startOf("quarter"), now.endOf("quarter")];
  }
  return [now.startOf("year"), now.endOf("year")];
};

/** 接口 `period`：`begin,end` 逗号分隔，如 `2026-03-01 00:00:00,2026-03-31 00:00:00`（结束时间为区间末日 00:00:00） */
const formatStatisticsPeriodParam = (timeType: TimeType, dateRange: [Dayjs, Dayjs]): string => {
  const [start, end] = dateRange;
  let periodBegin: string;
  let periodEnd: string;
  if (timeType === "day") {
    periodBegin = start.startOf("day").format("YYYY-MM-DD HH:mm:ss");
    periodEnd = end.startOf("day").format("YYYY-MM-DD HH:mm:ss");
  } else if (timeType === "month") {
    periodBegin = start.startOf("month").format("YYYY-MM-DD HH:mm:ss");
    periodEnd = end.endOf("month").startOf("day").format("YYYY-MM-DD HH:mm:ss");
  } else if (timeType === "quarter") {
    periodBegin = start.startOf("quarter").format("YYYY-MM-DD HH:mm:ss");
    periodEnd = end.endOf("quarter").startOf("day").format("YYYY-MM-DD HH:mm:ss");
  } else {
    periodBegin = start.startOf("year").format("YYYY-MM-DD HH:mm:ss");
    periodEnd = end.endOf("year").startOf("day").format("YYYY-MM-DD HH:mm:ss");
  }
  return `${periodBegin},${periodEnd}`;
};

const buildChartSeriesFromStatistics = (vo: LiangcangWarehouseStatisticsVO): { labels: string[]; series: number[] } => {
  if (vo.timeDimensionTurnovers.length > 0) {
    return {
      labels: vo.timeDimensionTurnovers.map((t) => t.timeDimension),
      series: vo.timeDimensionTurnovers.map((t) =>
        t.averageTurnoverRate != null && Number.isFinite(t.averageTurnoverRate) ? t.averageTurnoverRate : 0,
      ),
    };
  }
  const map = new Map<string, number[]>();
  for (const row of vo.items) {
    const key = row.timeDimension;
    if (key === "") continue;
    if (!map.has(key)) map.set(key, []);
    const tr = row.turnoverRate;
    if (tr != null && Number.isFinite(tr)) map.get(key)!.push(tr);
  }
  const labels = [...map.keys()].sort();
  const series = labels.map((label) => {
    const arr = map.get(label) ?? [];
    return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
  });
  return { labels, series };
};

const toPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "--";
  }
  return `${value.toFixed(1)}%`;
};

const formatDelta = (delta: number | null): string => {
  if (delta === null || !Number.isFinite(delta)) {
    return "--";
  }
  return delta >= 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`;
};

export const InventoryTurnoverRatio = defineComponent({
  name: "InventoryTurnoverRatio",
  setup: () => {
    const { pageTitle } = usePageName();
    const filterState = reactive<FilterState>({
      timeType: "month",
      dateRange: makeDefaultRange("month"),
      warehouseId: "",
      warehouseCategory: "",
    });

    const warehouseOptions = ref<{ label: string; value: string }[]>([{ label: "所有粮仓", value: "" }]);
    const categoryOptions = ref<{ label: string; value: string }[]>([{ label: "所有种类", value: "" }]);

    const loading = ref(false);
    const pagination = reactive({ current: 1, pageSize: 10, total: 0 });
    const acquisitionPagination = reactive({ current: 1, pageSize: 10, total: 0 });
    /** 日模式下列表区当前激活 tab */
    const activeListTab = ref<"summary" | "detail">("summary");

    const currentSeries = ref<number[]>([]);
    const xAxisLabels = ref<string[]>([]);

    /** 趋势对比图：本期（来自 timeDimensionTurnovers.averageTurnoverRate） */
    const trendCurrentSeries = ref<number[]>([]);
    /** 趋势对比图：同比去年（来自 timeDimensionTurnoverYearOnYearTrend.changeRate，可含负数） */
    const trendYoySeries = ref<number[]>([]);
    /** 趋势对比图：环比上期（来自 timeDimensionTurnoverChainRatioTrend.changeRate，可含负数） */
    const trendMomSeries = ref<number[]>([]);
    /** 趋势对比图 x 轴（来自 timeDimensionTurnovers.timeDimension） */
    const trendXAxisLabels = ref<string[]>([]);
    const tableRows = ref<TableRow[]>([]);
    const acquisitionRows = ref<AcquisitionRow[]>([]);
    /** 每次采集周转率散点数据（日维度）：value=[xLabel, turnoverRate], name=acquisitionTime 用于 tooltip */
    const acquisitionTurnoverData = ref<{ value: [string, number]; name: string }[]>([]);

    const chartRef = ref<HTMLDivElement | null>(null);
    const chartInstance = ref<echarts.ECharts | null>(null);
    const trendChartRef = ref<HTMLDivElement | null>(null);
    const trendChartInstance = ref<echarts.ECharts | null>(null);

    /** 直接来自接口的摘要数据 */
    const summaryData = reactive({
      avgTurnoverRatio: null as number | null,
      yoyDelta: null as number | null,
      yoyLastPeriod: null as number | null,
      momDelta: null as number | null,
      momLastPeriod: null as number | null,
    });

    const summary = computed(() => summaryData);

    const pagedTableRows = computed<TableRow[]>(() => {
      const start = (pagination.current - 1) * pagination.pageSize;
      return tableRows.value.slice(start, start + pagination.pageSize);
    });

    const pagedAcquisitionRows = computed<AcquisitionRow[]>(() => {
      const start = (acquisitionPagination.current - 1) * acquisitionPagination.pageSize;
      return acquisitionRows.value.slice(start, start + acquisitionPagination.pageSize);
    });

    const renderChart = (): void => {
      if (!chartInstance.value) {
        return;
      }
      const isDay = filterState.timeType === "day";
      const legendData = isDay ? ["日均周转率", "每次测量值"] : ["周转率"];
      chartInstance.value.setOption({
        grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
        legend: isDay ? { data: legendData, top: 0 } : undefined,
        tooltip: {
          trigger: "item",
          formatter: (params: unknown): string => {
            const item = params as {
              name: string;
              marker: string;
              seriesName: string;
              value: number | [string, number];
              data: { value?: [string, number]; name?: string } | number;
            };
            const val = Array.isArray(item.value) ? item.value[1] : item.value;
            const acqTime =
              item.data !== null &&
              typeof item.data === "object" &&
              "name" in item.data &&
              typeof (item.data as { name?: string }).name === "string"
                ? `<br/><span style="color:#86909c;font-size:12px">测量时间：${dayjs((item.data as { name: string }).name).format("YYYY-MM-DD HH:mm:ss")}</span>`
                : "";
            return `${item.marker}${item.seriesName}: ${toPercent(Number(val))}${acqTime}`;
          },
        },
        xAxis: [{ type: "category", data: xAxisLabels.value }],
        yAxis: [{ type: "value", axisLabel: { formatter: "{value}%" } }],
        series: [
          {
            name: isDay ? "日均周转率" : "周转率",
            type: "bar",
            barMaxWidth: 40,
            itemStyle: { color: "#3b82f6", borderRadius: [4, 4, 0, 0] },
            data: currentSeries.value,
          },
          ...(isDay
            ? [
                {
                  name: "每次测量值",
                  type: "scatter" as const,
                  symbolSize: 6,
                  itemStyle: { color: "#f97316" },
                  data: acquisitionTurnoverData.value,
                },
              ]
            : []),
        ],
      } as echarts.EChartsOption);
    };

    const renderTrendChart = (): void => {
      if (!trendChartInstance.value) {
        return;
      }
      trendChartInstance.value.setOption({
        grid: { left: "3%", right: "4%", bottom: "8%", top: "40px", containLabel: true },
        legend: { data: ["本期", "同比去年", "环比上期"], top: 0 },
        tooltip: {
          trigger: "axis",
          formatter: (params: unknown): string => {
            if (!Array.isArray(params) || params.length === 0) {
              return "";
            }
            const p = params as { axisValueLabel: string; marker: string; seriesName: string; value: number | string }[];
            const title = p[0]?.axisValueLabel ?? "";
            const content = p.map((item) => `${item.marker}${item.seriesName}: ${toPercent(Number(item.value))}`).join("<br/>");
            return `${title}<br/>${content}`;
          },
        },
        xAxis: [
          {
            type: "category",
            data: trendXAxisLabels.value,
            boundaryGap: false,
            axisLine: { onZero: true },
          },
        ],
        yAxis: [
          {
            type: "value",
            axisLabel: { formatter: "{value}%" },
            splitLine: { lineStyle: { type: "dashed", color: "#e5e7eb" } },
          },
        ],
        series: [
          {
            name: "本期",
            type: "line",
            data: trendCurrentSeries.value,
            symbol: "circle",
            symbolSize: 6,
            lineStyle: { width: 2, color: "#3b82f6" },
            itemStyle: { color: "#3b82f6" },
            areaStyle: { color: "rgba(59,130,246,0.08)" },
          },
          {
            name: "同比去年",
            type: "line",
            data: trendYoySeries.value,
            symbol: "circle",
            symbolSize: 5,
            lineStyle: { width: 2, type: "dashed", color: "#f53f3f" },
            itemStyle: { color: "#f53f3f" },
          },
          {
            name: "环比上期",
            type: "line",
            data: trendMomSeries.value,
            symbol: "circle",
            symbolSize: 5,
            lineStyle: { width: 2, type: "dashed", color: "#00b42a" },
            itemStyle: { color: "#00b42a" },
          },
        ],
      } as echarts.EChartsOption);
    };

    const initChart = (): void => {
      if (chartRef.value) {
        chartInstance.value = echarts.init(chartRef.value);
        renderChart();
      }
      if (trendChartRef.value) {
        trendChartInstance.value = echarts.init(trendChartRef.value);
        renderTrendChart();
      }
      window.addEventListener("resize", handleResize);
    };

    const handleResize = (): void => {
      chartInstance.value?.dispose();
      trendChartInstance.value?.dispose();
      setTimeout(() => {
        initChart();
      }, 1000);
    };

    const applyStatisticsVo = (vo: LiangcangWarehouseStatisticsVO): void => {
      // 摘要区域（直接使用接口字段）
      summaryData.avgTurnoverRatio = vo.averageTurnoverRate;
      summaryData.yoyDelta = vo.totalYearOnYearChangeRate;
      summaryData.yoyLastPeriod = vo.lastYearSamePeriodAverageTurnoverRate;
      summaryData.momDelta = vo.totalChainRatioChangeRate;
      summaryData.momLastPeriod = vo.previousPeriodAverageTurnoverRate;

      // 本期趋势折线/柱状图
      const { labels, series } = buildChartSeriesFromStatistics(vo);
      xAxisLabels.value = labels;
      currentSeries.value = series;

      // 趋势对比图：本期来自 timeDimensionTurnovers
      const trendLabels = vo.timeDimensionTurnovers.map((t) => t.timeDimension);
      trendXAxisLabels.value = trendLabels;
      trendCurrentSeries.value = vo.timeDimensionTurnovers.map((t) => t.averageTurnoverRate ?? 0);

      // 趋势对比图：同比/环比直接使用 changeRate（可含负数）
      const yoyMap = new Map(vo.timeDimensionTurnoverYearOnYearTrend.map((t) => [t.timeDimension, t.changeRate ?? 0]));
      const momMap = new Map(vo.timeDimensionTurnoverChainRatioTrend.map((t) => [t.timeDimension, t.changeRate ?? 0]));
      trendYoySeries.value = trendLabels.map((label) => yoyMap.get(label) ?? 0);
      trendMomSeries.value = trendLabels.map((label) => momMap.get(label) ?? 0);

      // 每次测量值散点（来自 acquisitionItems，日维度有效）
      // acquisitionTime 可能是 "2026-04-08 18:00:00" 或 "2026-04-08T18:00:00"，先统一提取日期部分
      acquisitionTurnoverData.value = vo.acquisitionItems
        .filter((item) => item.turnoverRate !== null)
        .map((item) => {
          // 兼容空格分隔和 ISO T 分隔
          const datePart = item.acquisitionTime.replace("T", " ").split(" ")[0] ?? item.acquisitionTime;
          // 匹配 x 轴 label：完全相等 或 label 是日期的 MM-DD 后缀（如 "04-08" 对应 "2026-04-08"）
          const xLabel = labels.find((l) => l === datePart || datePart.endsWith(`-${l}`)) ?? null;
          // 找不到匹配的日期则丢弃该点（不使用 fallback 以免出现无效 category）
          if (xLabel === null) {
            return null;
          }
          return { value: [xLabel, item.turnoverRate as number] as [string, number], name: item.acquisitionTime };
        })
        .filter((p): p is { value: [string, number]; name: string } => p !== null);

      // 日汇总表格
      tableRows.value = vo.items.map((row, index) => ({
        id: `${row.warehouseId ?? "x"}-${row.timeDimension}-${index}`,
        timeLabel: row.timeDimension,
        warehouseName: row.warehouseName === "" ? "--" : row.warehouseName,
        grainTypeName: row.type === "" ? "--" : row.type,
        avgEmptyVolume: row.averageEmptyWarehouseVolume,
        avgVolume: row.averageInventory,
        avgStockTon: row.averageInventoryWeight,
        turnoverRatio: row.turnoverRate,
      }));
      pagination.total = tableRows.value.length;
      pagination.current = 1;

      // 测量明细表格
      acquisitionRows.value = vo.acquisitionItems.map((item, index) => ({
        id: `acq-${item.warehouseId ?? "x"}-${item.acquisitionTime}-${index}`,
        acquisitionTime: item.acquisitionTime,
        warehouseName: item.warehouseName === "" ? "--" : item.warehouseName,
        grainTypeName: item.type === "" ? "--" : item.type,
        emptyWarehouseVolume: item.emptyWarehouseVolume,
        goodsVolume: item.goodsVolume,
        weight: item.weight,
        turnoverRatio: item.turnoverRate,
      }));
      acquisitionPagination.total = acquisitionRows.value.length;
      acquisitionPagination.current = 1;
      // 若测量明细无数据，自动退回日汇总 tab
      if (acquisitionRows.value.length === 0) {
        activeListTab.value = "summary";
      }
    };

    const loadFilterOptions = async (): Promise<void> => {
      try {
        const list = await cubeGranaryManagementService.getBoundWarehouseSimpleList();
        warehouseOptions.value = [{ label: "所有粮仓", value: "" }, ...list.map((w) => ({ label: w.name, value: String(w.warehouseId) }))];
        const categories = [...new Set(list.map((w) => w.type).filter((c) => c !== ""))];
        categoryOptions.value = [{ label: "所有种类", value: "" }, ...categories.map((c) => ({ label: c, value: c }))];
      } catch {
        message.error("加载已绑定粮仓列表失败");
      }
    };

    const handleAnalyze = async (): Promise<void> => {
      loading.value = true;
      try {
        if (!filterState.dateRange) {
          filterState.dateRange = makeDefaultRange(filterState.timeType);
        }
        const period = formatStatisticsPeriodParam(filterState.timeType, filterState.dateRange);
        const warehouseIdRaw = filterState.warehouseId !== "" ? Number(filterState.warehouseId) : undefined;
        const warehouseId = warehouseIdRaw != null && Number.isFinite(warehouseIdRaw) ? Math.trunc(warehouseIdRaw) : undefined;
        const warehouseCategory = filterState.warehouseCategory !== "" ? filterState.warehouseCategory : undefined;
        const vo = await cubeGranaryManagementService.getWarehouseStatistics({
          dimension: DIMENSION_BY_TIME_TYPE[filterState.timeType],
          period,
          ...(warehouseId != null ? { warehouseId } : {}),
          ...(warehouseCategory != null ? { warehouseCategory } : {}),
        });
        applyStatisticsVo(vo);
      } catch (error) {
        message.error("分析失败，请稍后重试");
        throw error;
      } finally {
        loading.value = false;
      }
    };

    const handleTimeTypeChange = (value: TimeType): void => {
      filterState.timeType = value;
      filterState.dateRange = makeDefaultRange(value);
      activeListTab.value = "summary";
    };

    const downloadCsv = (content: string, filename: string): void => {
      const blob = new Blob([`\ufeff${content}`], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    };

    const fmtNum = (v: number | null): string | number => (v !== null && Number.isFinite(v) ? v : "—");

    const handleSummaryExport = (): void => {
      if (tableRows.value.length === 0) {
        message.warning("暂无可导出数据");
        return;
      }
      const headers = ["时间维度", "仓库", "品种", "平均空仓体积", "平均体积", "平均库存(吨)", "周转率"];
      const lines = tableRows.value.map((item) =>
        [
          item.timeLabel,
          item.warehouseName,
          item.grainTypeName,
          fmtNum(item.avgEmptyVolume),
          fmtNum(item.avgVolume),
          fmtNum(item.avgStockTon),
          toPercent(item.turnoverRatio),
        ].join(","),
      );
      downloadCsv([headers.join(","), ...lines].join("\n"), "库存周转率-日汇总.csv");
    };

    const handleAcquisitionExport = (): void => {
      if (acquisitionRows.value.length === 0) {
        message.warning("暂无可导出数据");
        return;
      }
      const headers = ["测量时间", "仓库", "品种", "空仓体积", "货物体积", "重量(吨)", "周转率"];
      const lines = acquisitionRows.value.map((item) =>
        [
          dayjs(item.acquisitionTime).format("YYYY-MM-DD HH:mm:ss"),
          item.warehouseName,
          item.grainTypeName,
          fmtNum(item.emptyWarehouseVolume),
          fmtNum(item.goodsVolume),
          fmtNum(item.weight),
          toPercent(item.turnoverRatio),
        ].join(","),
      );
      downloadCsv([headers.join(","), ...lines].join("\n"), "库存周转率-测量明细.csv");
    };

    const handleTablePageChange = (page: number, pageSize: number): void => {
      pagination.current = page;
      pagination.pageSize = pageSize;
    };

    const handleAcquisitionPageChange = (page: number, pageSize: number): void => {
      acquisitionPagination.current = page;
      acquisitionPagination.pageSize = pageSize;
    };

    const numCell = ({ text }: { text: number | null }): string => String(fmtNum(text));

    const columns = [
      { title: "时间维度", dataIndex: "timeLabel", key: "timeLabel", align: "center" },
      { title: "仓库", dataIndex: "warehouseName", key: "warehouseName", align: "center" },
      { title: "品种", dataIndex: "grainTypeName", key: "grainTypeName", align: "center" },
      { title: "平均空仓体积", dataIndex: "avgEmptyVolume", key: "avgEmptyVolume", align: "center", customRender: numCell },
      { title: "平均体积", dataIndex: "avgVolume", key: "avgVolume", align: "center", customRender: numCell },
      { title: "平均库存（吨）", dataIndex: "avgStockTon", key: "avgStockTon", align: "center", customRender: numCell },
      {
        title: "周转率",
        dataIndex: "turnoverRatio",
        key: "turnoverRatio",
        align: "center",
        customRender: ({ text }: { text: number | null }): string => toPercent(text),
      },
    ];

    const acquisitionColumns = [
      { title: "测量时间", dataIndex: "acquisitionTime", key: "acquisitionTime", align: "center" },
      { title: "仓库", dataIndex: "warehouseName", key: "warehouseName", align: "center" },
      { title: "品种", dataIndex: "grainTypeName", key: "grainTypeName", align: "center" },
      { title: "空仓体积", dataIndex: "emptyWarehouseVolume", key: "emptyWarehouseVolume", align: "center", customRender: numCell },
      { title: "货物体积", dataIndex: "goodsVolume", key: "goodsVolume", align: "center", customRender: numCell },
      { title: "重量（吨）", dataIndex: "weight", key: "weight", align: "center", customRender: numCell },
      {
        title: "周转率",
        dataIndex: "turnoverRatio",
        key: "turnoverRatio",
        align: "center",
        customRender: ({ text }: { text: number | null }): string => toPercent(text),
      },
    ];

    onMounted(() => {
      initChart();
      void (async () => {
        await loadFilterOptions();
        await handleAnalyze();
      })();
    });

    onUnmounted(() => {
      window.removeEventListener("resize", handleResize);
      chartInstance.value?.dispose();
      chartInstance.value = null;
      trendChartInstance.value?.dispose();
      trendChartInstance.value = null;
    });

    watch(
      [xAxisLabels, currentSeries, acquisitionTurnoverData],
      () => {
        renderChart();
      },
      { deep: true },
    );
    watch(
      [trendXAxisLabels, trendCurrentSeries, trendYoySeries, trendMomSeries],
      () => {
        renderTrendChart();
      },
      { deep: true },
    );

    const renderDateRange = (): JSX.Element => {
      const picker = filterState.timeType === "day" ? "date" : filterState.timeType;
      const RangePicker = DatePicker.RangePicker;
      return (
        <RangePicker
          value={filterState.dateRange as unknown as [Dayjs, Dayjs]}
          picker={picker as "date" | "month" | "quarter" | "year"}
          onChange={(value: [Dayjs, Dayjs] | null) => {
            filterState.dateRange = value;
          }}
          allowClear
        />
      );
    };

    const renderDeltaClass = (delta: number | null): string => {
      if (delta === null) {
        return "";
      }
      return delta >= 0 ? "itr-stat-delta--up" : "itr-stat-delta--down";
    };

    return (): JSX.Element => (
      <CubeLayout title={pageTitle ?? "库存周转率"} showFooter={false}>
        {{
          "layout-content": () => (
            <div class="inventory-turnover-ratio-page">
              <section class="inventory-turnover-ratio-filter-section">
                <div class="inventory-turnover-ratio-time-type-group">
                  {(
                    [
                      { label: "日", value: "day" as const },
                      { label: "月", value: "month" as const },
                      { label: "季", value: "quarter" as const },
                      { label: "年", value: "year" as const },
                    ] as const
                  ).map((item) => (
                    <Button
                      key={item.value}
                      type={filterState.timeType === item.value ? "primary" : "default"}
                      onClick={() => handleTimeTypeChange(item.value)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
                {renderDateRange()}
                <div class="inventory-turnover-ratio-inline-field">
                  <span>仓房</span>
                  <Select
                    style={{ width: "180px" }}
                    value={filterState.warehouseId}
                    options={warehouseOptions.value}
                    onChange={(value: string) => {
                      filterState.warehouseId = value;
                    }}
                  />
                </div>
                <div class="inventory-turnover-ratio-inline-field">
                  <span>粮仓种类</span>
                  <Select
                    style={{ width: "180px" }}
                    value={filterState.warehouseCategory}
                    options={categoryOptions.value}
                    onChange={(value: string) => {
                      filterState.warehouseCategory = value;
                    }}
                  />
                </div>
                <Button
                  type="primary"
                  onClick={() => {
                    void handleAnalyze();
                  }}
                  loading={loading.value}
                >
                  分析
                </Button>
              </section>

              <section class="inventory-turnover-ratio-chart-section">
                <div class="itr-top-row">
                  <div class="inventory-turnover-ratio-summary-card">
                    <div class="itr-stat-label">期内周转率（均值）</div>
                    <div class="itr-stat-value">{toPercent(summary.value.avgTurnoverRatio)}</div>
                    <div class="itr-compare-block">
                      <div class="itr-stat-label">环比上期</div>
                      <div class={`itr-stat-delta ${renderDeltaClass(summary.value.momDelta)}`}>{formatDelta(summary.value.momDelta)}</div>
                      <div class="itr-stat-ref">上期 {toPercent(summary.value.momLastPeriod)}</div>
                    </div>
                    <div class="itr-compare-block">
                      <div class="itr-stat-label">同比去年同期</div>
                      <div class={`itr-stat-delta ${renderDeltaClass(summary.value.yoyDelta)}`}>{formatDelta(summary.value.yoyDelta)}</div>
                      <div class="itr-stat-ref">去年同期 {toPercent(summary.value.yoyLastPeriod)}</div>
                    </div>
                  </div>
                  <div class="inventory-turnover-ratio-trend-card">
                    <h4>周转率趋势分析</h4>
                    <div ref={chartRef} class="inventory-turnover-ratio-trend-chart" />
                  </div>
                </div>
                <div class="inventory-turnover-ratio-trend-card">
                  <h4>周转趋势对比（同比 / 环比）</h4>
                  <div ref={trendChartRef} class="inventory-turnover-ratio-trend-chart" />
                </div>
              </section>

              <section class="inventory-turnover-ratio-table-section">
                <div class="inventory-turnover-ratio-table-header">
                  <h4>列表区</h4>
                </div>
                <Tabs
                  activeKey={activeListTab.value}
                  onChange={(key: string) => {
                    activeListTab.value = key as "summary" | "detail";
                  }}
                >
                  <Tabs.TabPane key="summary" tab="日汇总">
                    <div class="itr-tab-toolbar">
                      <Button type="primary" onClick={handleSummaryExport}>
                        导出
                      </Button>
                    </div>
                    <Table
                      bordered
                      size="middle"
                      loading={loading.value}
                      columns={columns}
                      dataSource={pagedTableRows.value}
                      rowKey="id"
                      pagination={false}
                    />
                    <div class="itr-table-page">
                      <CubePage
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onPageChange={handleTablePageChange}
                      />
                    </div>
                  </Tabs.TabPane>
                  {acquisitionRows.value.length > 0 && (
                    <Tabs.TabPane key="detail" tab="测量明细">
                      <div class="itr-tab-toolbar">
                        <Button type="primary" onClick={handleAcquisitionExport}>
                          导出
                        </Button>
                      </div>
                      <Table
                        bordered
                        size="middle"
                        loading={loading.value}
                        columns={acquisitionColumns}
                        dataSource={pagedAcquisitionRows.value}
                        rowKey="id"
                        pagination={false}
                      />
                      <div class="itr-table-page">
                        <CubePage
                          current={acquisitionPagination.current}
                          pageSize={acquisitionPagination.pageSize}
                          total={acquisitionPagination.total}
                          onPageChange={handleAcquisitionPageChange}
                        />
                      </div>
                    </Tabs.TabPane>
                  )}
                </Tabs>
              </section>
            </div>
          ),
        }}
      </CubeLayout>
    );
  },
});
