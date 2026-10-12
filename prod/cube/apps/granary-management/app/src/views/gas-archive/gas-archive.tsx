import { Button, DatePicker, Select, Table, message } from "ant-design-vue";
import dayjs, { type Dayjs } from "dayjs";
import * as echarts from "echarts";
import { computed, defineComponent, nextTick, onMounted, onUnmounted, reactive, ref, shallowRef } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type {
  GasArchiveBasicInfoVO,
  GasArchiveRecordVO,
  GasArchiveTrendVO,
  LiangcangBoundWarehouseSimpleItem,
} from "@ghcloud/cube-granary-management-service";
import { Page } from "@ghcloud/cube-ui";

import { cubeGranaryManagementService } from "@/api/service";
import { downloadBlob, formatDateTime } from "@/views/temperature-trend-alert/temperature-trend-alert-shared";

import "./gas-archive.less";

const { RangePicker } = DatePicker;
const PAGE_SIZE = 10;
const TREND_TIME_LABELS = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, "0");
  return `${hour}:${index % 2 === 0 ? "00" : "30"}`;
});

const readWarehouseIdQuery = (value: unknown): number | null => {
  const raw = Array.isArray(value) ? value[0] : value;
  const number = Number(raw);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const numberValue = (value: unknown): number | null => {
  if (value == null || value === "") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const formatTrendTime = (value: unknown): string => formatDateTime(value, "").slice(11, 16);

const formatNumber = (value: number | null | undefined, digits = 4): string => {
  const number = numberValue(value);
  return number == null ? "--" : number.toFixed(digits);
};

const formatDateParam = (date: Dayjs, end = false): string => (end ? date.endOf("day") : date.startOf("day")).format("YYYY-MM-DD HH:mm:ss");

const hasAlarm = (record: GasArchiveRecordVO): boolean => record.co2Alarm || record.o2Alarm || record.ph3Alarm;

export const GasArchive = defineComponent({
  name: "GasArchive",
  setup: () => {
    const route = useRoute();
    const warehouses = ref<LiangcangBoundWarehouseSimpleItem[]>([]);
    const selectedWarehouseId = ref<number | null>(null);
    const basicInfo = ref<GasArchiveBasicInfoVO | null>(null);
    const trendData = ref<GasArchiveTrendVO | null>(null);
    const records = ref<GasArchiveRecordVO[]>([]);
    const loading = ref(false);
    const trendLoading = ref(false);
    const tableLoading = ref(false);
    const exporting = ref(false);
    const trendDate = ref<Dayjs>(dayjs());
    const chartRef = ref<HTMLDivElement | null>(null);
    const chartInstance = shallowRef<echarts.ECharts | null>(null);
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: PAGE_SIZE,
      total: 0,
      dateRange: [dayjs().subtract(1, "day"), dayjs()] as [Dayjs, Dayjs],
    });

    const warehouseOptions = computed(() =>
      warehouses.value.map((item) => ({
        label: item.name || `仓房${item.warehouseId}`,
        value: item.warehouseId,
      })),
    );

    const renderChart = (): void => {
      if (chartInstance.value == null) {
        return;
      }
      const items = trendData.value?.items ?? [];
      const itemByTime = new Map(items.map((item) => [formatTrendTime(item.sampleTime), item]));
      const values = (key: "co2" | "o2" | "ph3") => TREND_TIME_LABELS.map((label) => numberValue(itemByTime.get(label)?.[key]));
      chartInstance.value.setOption(
        {
          color: ["#3f93ff", "#52c41a", "#f59a23"],
          grid: [
            { left: 58, right: 38, top: 48, height: 105, containLabel: true },
            { left: 58, right: 38, top: 194, height: 105, containLabel: true },
            { left: 58, right: 38, top: 340, height: 105, containLabel: true },
          ],
          legend: { top: 12, left: 0, data: ["CO₂ (%VOL)", "O₂ (%VOL)", "PH₃ (%VOL)"] },
          tooltip: { trigger: "axis", confine: true },
          xAxis: [0, 1, 2].map((index) => ({
            type: "category",
            gridIndex: index,
            data: TREND_TIME_LABELS,
            boundaryGap: false,
            axisTick: { show: false },
            axisLabel: { color: "#8c96a8", interval: 5, showMaxLabel: true },
            axisLine: { lineStyle: { color: "#e5e8ef" } },
          })),
          yAxis: [
            { type: "value", gridIndex: 0, splitLine: { lineStyle: { color: "#eef1f5" } }, axisLabel: { color: "#8c96a8" } },
            { type: "value", gridIndex: 1, splitLine: { lineStyle: { color: "#eef1f5" } }, axisLabel: { color: "#8c96a8" } },
            { type: "value", gridIndex: 2, splitLine: { lineStyle: { color: "#eef1f5" } }, axisLabel: { color: "#8c96a8" } },
          ],
          series: [
            { name: "CO₂ (%VOL)", type: "line", xAxisIndex: 0, yAxisIndex: 0, symbol: "none", connectNulls: false, data: values("co2") },
            { name: "O₂ (%VOL)", type: "line", xAxisIndex: 1, yAxisIndex: 1, symbol: "none", connectNulls: false, data: values("o2") },
            { name: "PH₃ (%VOL)", type: "line", xAxisIndex: 2, yAxisIndex: 2, symbol: "none", connectNulls: false, data: values("ph3") },
          ],
        },
        { notMerge: true },
      );
      chartInstance.value.resize();
    };

    const resizeChart = (): void => {
      chartInstance.value?.resize();
    };

    const loadBasicInfo = async (): Promise<void> => {
      basicInfo.value =
        selectedWarehouseId.value == null ? null : await cubeGranaryManagementService.getGasArchiveBasicInfo(selectedWarehouseId.value);
    };

    const loadTrend = async (): Promise<void> => {
      if (selectedWarehouseId.value == null) {
        trendData.value = null;
        renderChart();
        return;
      }
      trendLoading.value = true;
      try {
        trendData.value = await cubeGranaryManagementService.getGasArchiveTrend({
          warehouseId: selectedWarehouseId.value,
          date: trendDate.value.format("YYYY-MM-DD"),
        });
        renderChart();
      } finally {
        trendLoading.value = false;
      }
    };

    const loadRecords = async (): Promise<void> => {
      if (selectedWarehouseId.value == null) {
        records.value = [];
        searchParams.total = 0;
        return;
      }
      tableLoading.value = true;
      try {
        const [start, end] = searchParams.dateRange;
        const page = await cubeGranaryManagementService.getGasArchiveRecordPage({
          warehouseId: selectedWarehouseId.value,
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          startTime: formatDateParam(start),
          endTime: formatDateParam(end, true),
        });
        records.value = page.records;
        searchParams.total = page.total;
      } finally {
        tableLoading.value = false;
      }
    };

    const loadAll = async (): Promise<void> => {
      loading.value = true;
      try {
        const results = await Promise.allSettled([loadBasicInfo(), loadTrend(), loadRecords()]);
        if (results.some((result) => result.status === "rejected")) {
          message.warning("部分数据加载失败，其他数据已继续展示");
        }
      } finally {
        loading.value = false;
      }
    };

    const loadWarehouses = async (): Promise<void> => {
      warehouses.value = await cubeGranaryManagementService.getBoundWarehouseSimpleList();
      selectedWarehouseId.value = readWarehouseIdQuery(route.query.warehouseId) ?? warehouses.value[0]?.warehouseId ?? null;
      await loadAll();
    };

    const columns = [
      { title: "采集时间", dataIndex: "acquisitionTime", width: 180, customRender: ({ text }: { text: string }) => formatDateTime(text) },
      {
        title: "二氧化碳含量（%VOL）",
        dataIndex: "co2",
        customRender: ({ text, record }: { text: number | null; record: GasArchiveRecordVO }) => (
          <span class={record.co2Alarm ? "gas-archive-value is-alarm" : "gas-archive-value"}>{formatNumber(text, 4)}</span>
        ),
      },
      {
        title: "氧气含量（%VOL）",
        dataIndex: "o2",
        customRender: ({ text, record }: { text: number | null; record: GasArchiveRecordVO }) => (
          <span class={record.o2Alarm ? "gas-archive-value is-alarm" : "gas-archive-value"}>{formatNumber(text, 1)}</span>
        ),
      },
      {
        title: "磷化氢含量（%VOL）",
        dataIndex: "ph3",
        customRender: ({ text, record }: { text: number | null; record: GasArchiveRecordVO }) => (
          <span class={record.ph3Alarm ? "gas-archive-value is-alarm" : "gas-archive-value"}>{formatNumber(text, 4)}</span>
        ),
      },
    ];

    const exportRecords = async (): Promise<void> => {
      if (selectedWarehouseId.value == null) {
        message.warning("请先选择仓房");
        return;
      }
      exporting.value = true;
      try {
        const [start, end] = searchParams.dateRange;
        const blob = await cubeGranaryManagementService.exportGasArchiveRecords({
          warehouseId: selectedWarehouseId.value,
          startTime: formatDateParam(start),
          endTime: formatDateParam(end, true),
        });
        downloadBlob(blob, `气体采集记录-${start.format("YYYYMMDD")}-${end.format("YYYYMMDD")}.xlsx`);
        message.success("采集记录已导出");
      } finally {
        exporting.value = false;
      }
    };

    onMounted(() => {
      void nextTick(() => {
        if (chartRef.value != null) {
          chartInstance.value = echarts.init(chartRef.value);
        }
        void loadWarehouses();
      });
      window.addEventListener("resize", resizeChart);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", resizeChart);
      chartInstance.value?.dispose();
    });

    return () => (
      <CubeLayout title="气体档案" showFooter={false}>
        {{
          "layout-content": () => (
            <div class="gas-archive-root">
              <section class="gas-archive-panel">
                <div class="gas-archive-panel-head">
                  <h2>仓房信息</h2>
                  <Select
                    class="gas-archive-warehouse-select"
                    value={selectedWarehouseId.value ?? undefined}
                    options={warehouseOptions.value}
                    loading={loading.value}
                    placeholder="请选择仓房"
                    onChange={(value) => {
                      selectedWarehouseId.value = Number(value);
                      searchParams.pageNumber = 1;
                      void loadAll();
                    }}
                  />
                </div>
                <div class="gas-archive-basic-grid">
                  <div class="gas-archive-info-card">
                    <span>CO₂ 当前浓度</span>
                    <strong class={basicInfo.value?.co2Alarm ? "is-alarm" : ""}>{formatNumber(basicInfo.value?.co2)} </strong>
                    <em>%VOL</em>
                  </div>
                  <div class="gas-archive-info-card">
                    <span>O₂ 当前浓度</span>
                    <strong class={basicInfo.value?.o2Alarm ? "is-alarm" : ""}>{formatNumber(basicInfo.value?.o2, 1)} </strong>
                    <em>%VOL</em>
                  </div>
                  <div class="gas-archive-info-card">
                    <span>PH₃ 当前浓度</span>
                    <strong class={basicInfo.value?.ph3Alarm ? "is-alarm" : ""}>{formatNumber(basicInfo.value?.ph3)} </strong>
                    <em>%VOL</em>
                  </div>
                </div>
              </section>

              <section class="gas-archive-panel">
                <div class="gas-archive-panel-head">
                  <h2>气体浓度趋势</h2>
                  <DatePicker
                    class="gas-archive-date-picker"
                    value={trendDate.value}
                    allowClear={false}
                    format="YYYY/MM/DD"
                    loading={trendLoading.value}
                    onChange={(value) => {
                      if (value != null) {
                        trendDate.value = dayjs(value);
                        void loadTrend();
                      }
                    }}
                  />
                </div>
                <div ref={chartRef} class="gas-archive-chart"></div>
              </section>

              <section class="gas-archive-panel gas-archive-record-panel">
                <div class="gas-archive-record-head">
                  <div class="gas-archive-record-title">气体采集记录</div>
                  <Button class="gas-archive-export-button" type="primary" loading={exporting.value} onClick={() => void exportRecords()}>
                    导出采集记录
                  </Button>
                </div>
                <div class="gas-archive-filter">
                  <div class="gas-archive-filter-item">
                    <span>日期范围:</span>
                    <RangePicker
                      class="gas-archive-range-picker"
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
                  <Button
                    class="gas-archive-query-button"
                    type="primary"
                    onClick={() => {
                      searchParams.pageNumber = 1;
                      void loadRecords();
                    }}
                  >
                    查询
                  </Button>
                </div>
                <Table
                  rowKey={(record: GasArchiveRecordVO) => String(record.id)}
                  columns={columns}
                  dataSource={records.value}
                  loading={tableLoading.value}
                  pagination={false}
                  size="middle"
                  rowClassName={(record: GasArchiveRecordVO) => (hasAlarm(record) ? "gas-archive-alarm-row" : "")}
                />
                {records.value.length === 0 && !tableLoading.value ? <div class="gas-archive-empty">暂无采集记录</div> : null}
                <div class="gas-archive-pagination">
                  <Page
                    current={searchParams.pageNumber}
                    pageSize={searchParams.pageSize}
                    total={searchParams.total}
                    showSizeChanger={false}
                    showTotal={(total: number) => `共${total}条`}
                    onPageChange={(page: number) => {
                      searchParams.pageNumber = page;
                      void loadRecords();
                    }}
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
