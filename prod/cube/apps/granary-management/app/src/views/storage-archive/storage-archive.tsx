import { Button, DatePicker, Radio, Select, Table, message } from "ant-design-vue";
import dayjs, { type Dayjs } from "dayjs";
import * as echarts from "echarts";
import { computed, defineComponent, nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type {
  LiangcangBoundWarehouseSimpleItem,
  WarehouseStorageArchiveBasicInfoVO,
  WarehouseStorageArchiveScanRecordVO,
  WarehouseStorageArchiveStatus,
  WarehouseStorageArchiveTrendGranularity,
  WarehouseStorageArchiveTrendTimeType,
  WarehouseStorageArchiveTrendVO,
} from "@ghcloud/cube-granary-management-service";
import { Page } from "@ghcloud/cube-ui";

import { cubeGranaryManagementService } from "@/api/service";
import { downloadBlob, formatDateTime } from "@/views/temperature-trend-alert/temperature-trend-alert-shared";

import "./storage-archive.less";

const { RangePicker } = DatePicker;

const PAGE_SIZE = 10;
const MAX_TREND_CUSTOM_DAYS = 30;

const toFiniteNumber = (value: unknown): number | null => {
  if (value == null || value === "") {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const formatNumber = (value: number | null | undefined, digits = 0): string => {
  if (value == null || !Number.isFinite(value)) {
    return "--";
  }
  return value.toFixed(digits);
};

const formatTrendAxisLabel = (time: string, granularity: WarehouseStorageArchiveTrendGranularity): string => {
  const date = dayjs(time);
  if (!date.isValid()) {
    return time;
  }
  if (granularity === "HALF_HOUR") {
    return date.minute() === 0 ? date.format("HH:mm") : "";
  }
  return granularity === "DAY" ? date.format("MM/DD") : date.format("MM月");
};

const formatTrendTooltipTime = (time: string, granularity: WarehouseStorageArchiveTrendGranularity): string => {
  const date = dayjs(time);
  if (!date.isValid()) {
    return time;
  }
  if (granularity === "HALF_HOUR") {
    return date.format("YYYY-MM-DD HH:mm");
  }
  return granularity === "DAY" ? date.format("YYYY-MM-DD") : date.format("YYYY年MM月");
};

const formatDateParam = (date: Dayjs, end = false): string => {
  return (end ? date.endOf("day") : date.startOf("day")).format("YYYY-MM-DD HH:mm:ss");
};

const statusText = (status: WarehouseStorageArchiveStatus | string): string => {
  if (status === "NORMAL") {
    return "正常";
  }
  if (status === "ALARM") {
    return "告警";
  }
  return status || "--";
};

const readWarehouseIdQuery = (value: unknown): number | null => {
  const raw = Array.isArray(value) ? value[0] : value;
  const numeric = Number(raw);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};

export const StorageArchive = defineComponent({
  name: "StorageArchive",
  setup: () => {
    const route = useRoute();
    const warehouses = ref<LiangcangBoundWarehouseSimpleItem[]>([]);
    const selectedWarehouseId = ref<number | null>(null);
    const basicInfo = ref<WarehouseStorageArchiveBasicInfoVO | null>(null);
    const trendData = ref<WarehouseStorageArchiveTrendVO | null>(null);
    const scanRecords = ref<WarehouseStorageArchiveScanRecordVO[]>([]);
    const loading = ref(false);
    const tableLoading = ref(false);
    const exporting = ref(false);
    const chartRef = ref<HTMLDivElement | null>(null);
    const chartInstance = ref<echarts.ECharts | null>(null);
    const trendTimeType = ref<WarehouseStorageArchiveTrendTimeType>("TODAY");
    const trendDateRange = ref<[Dayjs, Dayjs]>([dayjs(), dayjs()]);
    const trendRangeSelectionStart = ref<Dayjs | null>(null);

    const searchParams = reactive<{
      pageNumber: number;
      pageSize: number;
      total: number;
      dateRange: [Dayjs, Dayjs];
      status: WarehouseStorageArchiveStatus | "";
    }>({
      pageNumber: 1,
      pageSize: PAGE_SIZE,
      total: 0,
      dateRange: [dayjs().startOf("year"), dayjs()],
      status: "",
    });

    const warehouseOptions = computed(() =>
      warehouses.value.map((item) => ({
        label: item.name === "" ? `仓房${item.warehouseId}` : item.name,
        value: item.warehouseId,
      })),
    );

    const statusOptions = [
      { label: "全部", value: "" },
      { label: "正常", value: "NORMAL" },
      { label: "告警", value: "ALARM" },
    ];

    const selectedUnit = "m³";

    const isTrendDateDisabled = (current: Dayjs): boolean => {
      const start = trendRangeSelectionStart.value;
      return (
        start != null &&
        (current.isBefore(start.subtract(MAX_TREND_CUSTOM_DAYS - 1, "day"), "day") ||
          current.isAfter(start.add(MAX_TREND_CUSTOM_DAYS - 1, "day"), "day"))
      );
    };

    const renderChart = (): void => {
      if (chartInstance.value == null) {
        return;
      }
      const items = trendData.value?.items ?? [];
      const granularity = trendData.value?.granularity ?? "HALF_HOUR";
      const times = items.map((item) => item.time);
      const values = items.map((item) => toFiniteNumber(item.storageValue));
      const warningValue = toFiniteNumber(trendData.value?.warningValue);
      const formatPointValue = (dataIndex: number): string => {
        const item = dataIndex >= 0 && dataIndex < items.length ? items[dataIndex] : null;
        const value = toFiniteNumber(item?.storageValue);
        if (value == null) {
          return "";
        }
        return `${formatNumber(value, 2)} ${selectedUnit}`;
      };
      const alarmData = items
        .map((item) => {
          const value = toFiniteNumber(item.storageValue);
          return item.alarm === true && value != null ? [item.time, value] : null;
        })
        .filter((item): item is [string, number] => item != null);
      chartInstance.value.setOption({
        color: ["#2f7cff", "#f26363", "#f59a23"],
        grid: { top: 76, right: 70, bottom: 48, left: 58, containLabel: true },
        tooltip: {
          show: true,
          trigger: "axis",
          triggerOn: "mousemove|click",
          confine: true,
          appendToBody: true,
          axisPointer: { type: "line", lineStyle: { color: "#aab7cc", type: "dashed" } },
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          borderColor: "#d9e2ef",
          borderWidth: 1,
          textStyle: { color: "#1f2937", fontSize: 12 },
          extraCssText: "box-shadow:0 6px 18px rgba(15,35,66,.12);border-radius:4px;z-index:9999;",
          formatter: (params: unknown): string => {
            if (!Array.isArray(params) || params.length === 0) {
              return "";
            }
            const row = params[0] as { dataIndex?: number; axisValueLabel?: string; name?: string; value?: unknown };
            const rawIndex = typeof row.dataIndex === "number" ? row.dataIndex : -1;
            const labelText = row.axisValueLabel ?? row.name ?? "";
            const index = rawIndex >= 0 && rawIndex < items.length ? rawIndex : times.findIndex((item) => item === labelText);
            const item = index >= 0 ? items[index] : null;
            const label = item == null ? labelText : formatTrendTooltipTime(item.time, granularity);
            const value = toFiniteNumber(item?.storageValue);
            const warning = toFiniteNumber(item?.warningValue ?? trendData.value?.warningValue);
            return [
              label,
              `储量值: ${value == null ? "--" : `${formatNumber(value, 2)} ${selectedUnit}`}`,
              `预警线: ${warning == null ? "--" : `${formatNumber(warning, 2)} ${selectedUnit}`}`,
              `状态: ${value == null ? "--" : item?.alarm === true ? "告警" : "正常"}`,
            ].join("<br/>");
          },
        },
        legend: {
          left: 34,
          top: 22,
          itemGap: 16,
          data: ["储量值", "告警记录", "预警线"],
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: times,
          axisTick: { show: false },
          axisLine: { lineStyle: { color: "#e5e8ef" } },
          axisLabel: {
            color: "#8c96a8",
            interval: granularity === "HALF_HOUR" ? 0 : "auto",
            formatter: (value: string) => formatTrendAxisLabel(value, granularity),
          },
        },
        yAxis: {
          type: "value",
          name: selectedUnit,
          splitLine: { lineStyle: { color: "#eef1f5" } },
          axisLabel: { color: "#8c96a8" },
        },
        series: [
          {
            name: "储量值",
            type: "line",
            smooth: true,
            symbolSize: 7,
            connectNulls: false,
            data: values,
            lineStyle: { width: 2 },
            emphasis: {
              focus: "series",
              label: {
                show: true,
                position: "top",
                color: "#1677ff",
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: "rgba(255,255,255,.96)",
                borderColor: "#d9e2ef",
                borderWidth: 1,
                borderRadius: 4,
                padding: [4, 6],
                formatter: (params: { dataIndex: number }) => formatPointValue(params.dataIndex),
              },
            },
          },
          {
            name: "告警记录",
            type: "scatter",
            symbolSize: 10,
            data: alarmData,
            z: 10,
            emphasis: {
              label: {
                show: true,
                position: "top",
                color: "#f26363",
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: "rgba(255,255,255,.96)",
                borderColor: "#ffd6d6",
                borderWidth: 1,
                borderRadius: 4,
                padding: [4, 6],
                formatter: (params: { value: unknown }) => {
                  const rawValue = Array.isArray(params.value) ? params.value[1] : params.value;
                  const value = toFiniteNumber(rawValue);
                  return value == null ? "" : `${formatNumber(value, 2)} ${selectedUnit}`;
                },
              },
            },
          },
          {
            name: "预警线",
            type: "line",
            symbol: "none",
            data: times.map(() => warningValue),
            lineStyle: { type: "dashed", width: 1.5, color: "#f59a23" },
          },
        ],
      });
    };

    const loadBasicInfo = async (): Promise<void> => {
      if (selectedWarehouseId.value == null) {
        basicInfo.value = null;
        return;
      }
      basicInfo.value = await cubeGranaryManagementService.getStorageArchiveBasicInfo(selectedWarehouseId.value);
    };

    const loadTrend = async (): Promise<void> => {
      if (selectedWarehouseId.value == null) {
        trendData.value = null;
        renderChart();
        return;
      }
      const payload = {
        warehouseId: selectedWarehouseId.value,
        timeType: trendTimeType.value,
        ...(trendTimeType.value === "CUSTOM"
          ? {
              startTime: formatDateParam(trendDateRange.value[0]),
              endTime: formatDateParam(trendDateRange.value[1], true),
            }
          : {}),
      };
      trendData.value = await cubeGranaryManagementService.getStorageArchiveTrend(payload);
      renderChart();
    };

    const loadScanRecords = async (): Promise<void> => {
      if (selectedWarehouseId.value == null) {
        scanRecords.value = [];
        searchParams.total = 0;
        return;
      }
      tableLoading.value = true;
      try {
        const [start, end] = searchParams.dateRange;
        const page = await cubeGranaryManagementService.getStorageArchiveScanRecordPage({
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          warehouseId: selectedWarehouseId.value,
          startTime: formatDateParam(start),
          endTime: formatDateParam(end, true),
          status: searchParams.status,
        });
        scanRecords.value = page.records;
        searchParams.total = page.total;
      } finally {
        tableLoading.value = false;
      }
    };

    const loadAll = async (): Promise<void> => {
      loading.value = true;
      try {
        await Promise.all([loadBasicInfo(), loadTrend(), loadScanRecords()]);
      } finally {
        loading.value = false;
      }
    };

    const loadWarehouses = async (): Promise<void> => {
      warehouses.value = await cubeGranaryManagementService.getBoundWarehouseSimpleList();
      selectedWarehouseId.value = readWarehouseIdQuery(route.query.warehouseId) ?? warehouses.value[0]?.warehouseId ?? null;
      await loadAll();
    };

    const handleWarehouseChange = (value: number): void => {
      selectedWarehouseId.value = value;
      searchParams.pageNumber = 1;
      void loadAll();
    };

    const handleTrendTimeTypeChange = (value: WarehouseStorageArchiveTrendTimeType): void => {
      trendTimeType.value = value;
      void loadTrend();
    };

    const handleSearch = (): void => {
      searchParams.pageNumber = 1;
      void loadScanRecords();
    };

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber || 1;
      searchParams.pageSize = pageSize;
      void loadScanRecords();
    };

    const exportScanRecords = async (): Promise<void> => {
      if (selectedWarehouseId.value == null) {
        message.warning("请先选择仓房");
        return;
      }
      exporting.value = true;
      try {
        const [start, end] = searchParams.dateRange;
        const blob = await cubeGranaryManagementService.exportStorageArchiveScanRecords({
          pageNumber: 1,
          pageSize: PAGE_SIZE,
          warehouseId: selectedWarehouseId.value,
          startTime: formatDateParam(start),
          endTime: formatDateParam(end, true),
          status: searchParams.status,
        });
        downloadBlob(blob, `储量档案扫描记录-${start.format("YYYYMMDD")}-${end.format("YYYYMMDD")}.xlsx`);
        message.success("扫描记录已导出");
      } finally {
        exporting.value = false;
      }
    };

    const columns = [
      {
        title: "扫描时间",
        dataIndex: "scanTime",
        width: 170,
        customRender: ({ text }: { text: string }) => formatDateTime(text),
      },
      {
        title: "本次体积(m³)",
        dataIndex: "currentVolume",
        width: 130,
        customRender: ({ text }: { text: number | null }) => formatNumber(text, 0),
      },
      {
        title: "体积变化",
        dataIndex: "volumeChange",
        width: 120,
        customRender: ({ text }: { text: number | null }) => (
          <span class={toFiniteNumber(text) != null && Number(text) < 0 ? "storage-archive-delta is-negative" : "storage-archive-delta"}>
            {toFiniteNumber(text) == null ? "--" : `${Number(text) >= 0 ? "+" : ""}${formatNumber(text, 0)}`}
          </span>
        ),
      },
      {
        title: "体积预警值(m³)",
        dataIndex: "volumeWarningValue",
        width: 150,
        customRender: ({ text }: { text: number | null }) => <span class="storage-archive-warning-value">{formatNumber(text, 0)}</span>,
      },
      {
        title: "体积差",
        dataIndex: "volumeDifference",
        width: 120,
        customRender: ({ text }: { text: number | null }) => (
          <span class={toFiniteNumber(text) != null && Number(text) < 0 ? "storage-archive-delta is-negative" : "storage-archive-delta"}>
            {toFiniteNumber(text) == null ? "--" : `${Number(text) >= 0 ? "+" : ""}${formatNumber(text, 2)}`}
          </span>
        ),
      },
      {
        title: "体积差预警值(m³)",
        dataIndex: "volumeDifferenceWarningValue",
        width: 140,
        customRender: ({ text }: { text: number | null }) => <span class="storage-archive-warning-value">{formatNumber(text, 2)}</span>,
      },
      {
        title: "状态",
        dataIndex: "status",
        width: 110,
        customRender: ({ text, record }: { text: WarehouseStorageArchiveStatus; record: WarehouseStorageArchiveScanRecordVO }) => (
          <span class={["storage-archive-status", text === "ALARM" ? "is-alarm" : "is-normal"]}>
            {record.statusName || statusText(text)}
          </span>
        ),
      },
    ];

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

    watch(trendData, renderChart, { deep: true });

    return () => (
      <CubeLayout title="储量档案" showFooter={false}>
        {{
          "layout-content": () => (
            <div class="storage-archive-root">
              <section class="storage-archive-panel storage-archive-basic-panel">
                <div class="storage-archive-panel-head">
                  <h2>仓房信息</h2>
                  <Select
                    class="storage-archive-warehouse-select"
                    value={selectedWarehouseId.value ?? undefined}
                    options={warehouseOptions.value}
                    loading={loading.value}
                    placeholder="请选择仓房"
                    onChange={(value) => handleWarehouseChange(Number(value))}
                  />
                </div>
                <div class="storage-archive-basic-grid">
                  <div class="storage-archive-info-card">
                    <span>仓房名称</span>
                    <strong>{basicInfo.value?.warehouseName || "--"}</strong>
                    <em>{basicInfo.value?.grainType || ""}</em>
                  </div>
                  <div class="storage-archive-info-card">
                    <span>本次体积</span>
                    <strong>{formatNumber(basicInfo.value?.currentVolume, 0)}</strong>
                    <em>m³</em>
                  </div>
                  <div class="storage-archive-info-card">
                    <span>体积预警值</span>
                    <strong class="is-warning">{formatNumber(basicInfo.value?.volumeWarningValue, 0)}</strong>
                    <em>m³</em>
                  </div>
                  <div class="storage-archive-info-card">
                    <span>体积差预警值</span>
                    <strong class="is-warning">{formatNumber(basicInfo.value?.volumeDifferenceWarningValue, 2)}</strong>
                    <em>m³</em>
                  </div>
                  <div class="storage-archive-info-card">
                    <span>最近扫描</span>
                    <strong class="storage-archive-time">{formatDateTime(basicInfo.value?.latestScanTime)}</strong>
                  </div>
                </div>
              </section>

              <section class="storage-archive-panel storage-archive-chart-panel">
                <div class="storage-archive-panel-head storage-archive-chart-head">
                  <h2>储量变化曲线</h2>
                  <div class="storage-archive-trend-actions">
                    <Radio.Group
                      value={trendTimeType.value}
                      buttonStyle="solid"
                      onChange={(event: { target: { value: WarehouseStorageArchiveTrendTimeType } }) => {
                        handleTrendTimeTypeChange(event.target.value);
                      }}
                    >
                      <Radio.Button value="TODAY">今日</Radio.Button>
                      <Radio.Button value="THIS_MONTH">本月</Radio.Button>
                      <Radio.Button value="THIS_YEAR">本年</Radio.Button>
                      <Radio.Button value="CUSTOM">日期筛选</Radio.Button>
                    </Radio.Group>
                    {trendTimeType.value === "CUSTOM" ? (
                      <RangePicker
                        class="storage-archive-trend-date-picker"
                        value={trendDateRange.value}
                        allowClear={false}
                        format="YYYY/MM/DD"
                        disabledDate={isTrendDateDisabled}
                        onCalendarChange={(dates) => {
                          if (!Array.isArray(dates)) {
                            return;
                          }
                          const [start, end] = dates;
                          trendRangeSelectionStart.value = start != null && end == null ? dayjs(start) : null;
                        }}
                        onOpenChange={(open) => {
                          if (!open) {
                            trendRangeSelectionStart.value = null;
                          }
                        }}
                        onChange={(dates) => {
                          if (Array.isArray(dates) && dates[0] != null && dates[1] != null) {
                            const start = dayjs(dates[0]);
                            const end = dayjs(dates[1]);
                            if (end.startOf("day").diff(start.startOf("day"), "day") + 1 > MAX_TREND_CUSTOM_DAYS) {
                              message.warning("日期筛选最多支持30天");
                              return;
                            }
                            trendDateRange.value = [start, end];
                            void loadTrend();
                          }
                        }}
                      />
                    ) : null}
                  </div>
                </div>
                <div ref={chartRef} class="storage-archive-chart"></div>
              </section>

              <section class="storage-archive-panel storage-archive-record-panel">
                <div class="storage-archive-record-head">
                  <div class="storage-archive-record-title">扫描记录</div>
                  <Button
                    class="storage-archive-export-button"
                    type="primary"
                    loading={exporting.value}
                    onClick={() => void exportScanRecords()}
                  >
                    导出
                  </Button>
                </div>
                <div class="storage-archive-filter">
                  <div class="storage-archive-filter-item">
                    <span>日期范围:</span>
                    <RangePicker
                      class="storage-archive-date-picker"
                      value={searchParams.dateRange}
                      allowClear={false}
                      format="YYYY/MM/DD"
                      onChange={(dates) => {
                        if (Array.isArray(dates) && dates[0] != null && dates[1] != null) {
                          searchParams.dateRange = [dayjs(dates[0]), dayjs(dates[1])];
                        }
                      }}
                    />
                  </div>
                  <div class="storage-archive-filter-item">
                    <span>状态:</span>
                    <Select
                      class="storage-archive-status-select"
                      value={searchParams.status}
                      options={statusOptions}
                      onChange={(value) => {
                        searchParams.status = String(value) as WarehouseStorageArchiveStatus | "";
                      }}
                    />
                  </div>
                  <Button class="storage-archive-query-button" type="primary" onClick={handleSearch}>
                    查询
                  </Button>
                  <Button
                    class="storage-archive-reset-button"
                    onClick={() => {
                      searchParams.dateRange = [dayjs().startOf("year"), dayjs()];
                      searchParams.status = "";
                      handleSearch();
                    }}
                  >
                    重置
                  </Button>
                </div>
                <Table
                  rowKey={(record: WarehouseStorageArchiveScanRecordVO) => String(record.id)}
                  columns={columns}
                  dataSource={scanRecords.value}
                  loading={tableLoading.value}
                  pagination={false}
                  size="middle"
                />
                <div class="storage-archive-pagination">
                  <Page
                    current={searchParams.pageNumber}
                    pageSize={searchParams.pageSize}
                    total={searchParams.total}
                    showQuickJumper={false}
                    showSizeChanger={false}
                    showTotal={(total: number) => `共${total}条`}
                    pageSizeOptions={["10", "20", "50"]}
                    onPageChange={handlePageChange}
                  />
                </div>
              </section>
            </div>
          ),
        }}
      </CubeLayout>
    );
  },
});
