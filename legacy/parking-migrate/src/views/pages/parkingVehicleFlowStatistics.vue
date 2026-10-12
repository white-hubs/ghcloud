<template>
  <g-layout-no-footer title="停车统计">
    <template #header-btn>
      <div class="header-toolbar">
        <a-radio-group v-model:value="formState.view" button-style="solid" @change="onViewChange">
          <a-radio-button value="DAY">今日</a-radio-button>
          <a-radio-button value="MONTH">本月</a-radio-button>
          <a-radio-button value="YEAR">今年</a-radio-button>
          <a-radio-button value="CUSTOM">自定义</a-radio-button>
        </a-radio-group>
        <a-date-picker v-if="formState.view === 'DAY'" v-model:value="dayValue" :allow-clear="false" format="YYYY/MM/DD" />
        <a-date-picker
          v-if="formState.view === 'MONTH'"
          v-model:value="monthValue"
          :allow-clear="false"
          picker="month"
          format="YYYY年 M月"
        />
        <a-date-picker v-if="formState.view === 'YEAR'" v-model:value="yearValue" :allow-clear="false" picker="year" format="YYYY年" />
        <template v-if="formState.view === 'CUSTOM'">
          <a-range-picker v-model:value="customDateRange" :allow-clear="false" format="YYYY/MM/DD" />
          <span class="toolbar-label">展示粒度：</span>
          <a-radio-group v-model:value="formState.granularity" button-style="solid">
            <a-radio-button value="DAY">按日</a-radio-button>
            <a-radio-button value="MONTH">按月</a-radio-button>
            <a-radio-button value="YEAR">按年</a-radio-button>
          </a-radio-group>
        </template>
        <a-select
          v-model:value="formState.parkingInfoCode"
          allow-clear
          :loading="parkingLoading"
          placeholder="全部停车场"
          style="width: 180px"
        >
          <a-select-option v-for="item in parkingOptions" :key="item.code" :value="item.code">
            {{ item.name }}
          </a-select-option>
        </a-select>
        <a-button class="query-button" type="primary" :loading="loading" @click="query">查询</a-button>
        <a-button @click="reset">重置</a-button>
      </div>
    </template>
    <template v-slot:content-table>
      <div class="traffic-stat-page">
        <div class="page-meta">{{ currentHint }}</div>

        <div class="overview-row">
          <div class="overview-item">
            <div class="summary-icon total"><UserOutlined /></div>
            <div class="summary-content">
              <div class="summary-title">累计车辆（周期内合计和）</div>
              <div class="summary-value">{{ formatNumber(summary.totalVehicleNumber) }}<span>辆</span></div>
              <div class="summary-rate">
                环比{{ rateText(summary.totalMomRate) }} <span class="split">同比去年</span>{{ rateText(summary.totalYoyRate) }}
              </div>
            </div>
          </div>
          <div class="overview-item">
            <div class="summary-icon avg"><CalendarOutlined /></div>
            <div class="summary-content">
              <div class="summary-title">{{ averageTitle }}</div>
              <div class="summary-value">
                {{ formatNumber(summary.avgVehicleNumber) }}<span>{{ averageUnit }}</span>
              </div>
            </div>
          </div>
          <div class="overview-item">
            <div class="summary-icon peak"><UserOutlined /></div>
            <div class="summary-content">
              <div class="summary-title">{{ peakTitle }}</div>
              <div class="summary-value">{{ formatNumber(summary.peakVehicleNumber) }}<span>辆</span></div>
              <div class="summary-rate muted">出现在 {{ summary.peakPeriod || "--" }}</div>
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <section class="panel chart-panel">
            <div class="section-title-row">
              <div>
                <div class="section-title">累计车辆统计</div>
                <div class="section-subtitle">车辆数（{{ chartUnitText }}）</div>
              </div>
            </div>
            <div ref="chartRef" class="trend-chart"></div>
          </section>

          <section class="panel rank-panel">
            <div class="rank-header">
              <div class="section-title">停车场车辆排行榜</div>
              <div class="rank-actions">
                <a-button type="link" :loading="exportLoading" :disabled="rankList.length === 0" @click="exportRank">导出</a-button>
                <a-button type="link" :class="{ active: formState.sortField === 'TOTAL' }" @click="changeSort('TOTAL')"
                  >按累计车辆</a-button
                >
                <a-button type="link" :class="{ active: formState.sortField === 'AVG' }" @click="changeSort('AVG')"
                  >按{{ averageTitle }}</a-button
                >
              </div>
            </div>
            <a-table
              :columns="rankColumns"
              :data-source="rankList"
              :loading="loading"
              :pagination="{
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条`,
                current: rankPagination.current,
                pageSize: rankPagination.pageSize,
                total: rankPagination.total,
              }"
              :row-key="(record) => record.id"
              @change="onRankTableChange"
            />
          </section>
        </div>
      </div>
    </template>
  </g-layout-no-footer>
</template>

<script lang="jsx">
import { CalendarOutlined, UserOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import * as echarts from "echarts";
import { computed, defineComponent, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import { exportParkingVehicleFlowAreaRank } from "../../api/park";

function unwrapData(res, fallback) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (res?.data && typeof res.data === "object") return res.data;
  if (res && typeof res === "object") return res;
  return fallback;
}

function buildPeriod(begin, end) {
  return `${begin.format("YYYY-MM-DD HH:mm:ss")},${end.format("YYYY-MM-DD HH:mm:ss")}`;
}

function normalizeRate(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

export default defineComponent({
  name: "ParkingVehicleFlowStatistics",
  components: {
    CalendarOutlined,
    UserOutlined,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const loading = ref(false);
    const parkingLoading = ref(false);
    const exportLoading = ref(false);
    const chartRef = ref(null);
    let chart = null;
    let contentTableEl = null;
    let originalContentTableOverflow = "";
    let originalContentTableBackground = "";
    let applyingViewChange = false;
    let syncingCustomDateRange = false;

    const formState = reactive({
      view: "DAY",
      granularity: "DAY",
      sortField: "TOTAL",
      parkingInfoCode: undefined,
    });
    const dayValue = ref(dayjs());
    const monthValue = ref(dayjs());
    const yearValue = ref(dayjs());
    const customDateRange = ref([dayjs(), dayjs()]);
    const summary = reactive({
      totalVehicleNumber: 0,
      totalMomRate: 0,
      totalYoyRate: 0,
      avgVehicleNumber: 0,
      peakVehicleNumber: 0,
      peakPeriod: "",
    });
    const trendList = ref([]);
    const rankList = ref([]);
    const parkingOptions = ref([]);
    const rankPagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
    });

    const activeGranularity = computed(() => {
      if (formState.view === "DAY") return "HOUR";
      if (formState.view === "MONTH") return "DAY";
      if (formState.view === "YEAR") return "MONTH";
      return formState.granularity;
    });

    const averageTitle = computed(() => {
      if (activeGranularity.value === "HOUR") return "时均车辆";
      if (activeGranularity.value === "DAY") return "日均车辆";
      if (activeGranularity.value === "MONTH") return "月均车辆";
      return "年均车辆";
    });

    const averageUnit = computed(() => {
      if (activeGranularity.value === "HOUR") return "辆/时";
      if (activeGranularity.value === "DAY") return "辆/日";
      if (activeGranularity.value === "MONTH") return "辆/月";
      return "辆/年";
    });

    const peakTitle = computed(() => {
      if (activeGranularity.value === "HOUR") return "小时峰值车辆";
      if (activeGranularity.value === "DAY") return "单日峰值车辆";
      if (activeGranularity.value === "MONTH") return "单月峰值车辆";
      return "单年峰值车辆";
    });

    const chartUnitText = computed(() => {
      if (activeGranularity.value === "HOUR") return "每小时聚合";
      if (activeGranularity.value === "DAY") return "每日聚合";
      if (activeGranularity.value === "MONTH") return "每月聚合";
      return "每年聚合";
    });

    const currentHint = computed(() => {
      if (formState.view === "DAY") return `当前显示 ${dayValue.value.format("YYYY年M月D日")} 的24小时车辆数据`;
      if (formState.view === "MONTH") return `当前显示 ${monthValue.value.format("YYYY年M月")} 的每日车辆数据`;
      if (formState.view === "YEAR") return `当前显示 ${yearValue.value.format("YYYY年")} 的每月车辆数据`;
      return `当前显示 ${customDateRange.value[0].format("YYYY年M月D日")} 至 ${customDateRange.value[1].format("YYYY年M月D日")} 的车辆数据`;
    });

    const rankColumns = computed(() => [
      {
        title: "停车场名称",
        dataIndex: "name",
        key: "name",
        customRender: ({ text, index }) => (
          <span class="area-name">
            <i style={{ backgroundColor: rankColors[index % rankColors.length] }}></i>
            {text || "--"}
          </span>
        ),
      },
      {
        title: "累计车辆",
        dataIndex: "totalVehicleNumber",
        key: "totalVehicleNumber",
        align: "center",
        customRender: ({ text }) => formatNumber(text),
      },
      {
        title: averageTitle.value,
        dataIndex: "avgVehicleNumber",
        key: "avgVehicleNumber",
        align: "center",
        customRender: ({ text }) => formatNumber(text),
      },
      {
        title: "峰值车辆",
        dataIndex: "peakVehicleNumber",
        key: "peakVehicleNumber",
        align: "right",
        customRender: ({ text }) => formatNumber(text),
      },
    ]);

    const rankColors = ["#2f7bff", "#35c56f", "#ff9f18", "#7c61ff", "#ec5ca8", "#13c2c2"];

    function getDefaultCustomDateRange(granularity) {
      const today = dayjs();
      if (granularity === "MONTH") {
        return [today.startOf("month"), today];
      }
      if (granularity === "YEAR") {
        return [today.startOf("year"), today];
      }
      return [today, today];
    }

    async function syncDefaultCustomDateRange() {
      syncingCustomDateRange = true;
      customDateRange.value = getDefaultCustomDateRange(formState.granularity);
      await nextTick();
      syncingCustomDateRange = false;
    }

    function getQueryParams() {
      let type = "TODAY";
      let period;
      if (formState.view === "DAY") {
        const begin = dayValue.value.startOf("day");
        period = buildPeriod(begin, begin.add(1, "day"));
        type = "TODAY";
      } else if (formState.view === "MONTH") {
        const begin = monthValue.value.startOf("month");
        period = buildPeriod(begin, begin.add(1, "month"));
        type = "MONTH";
      } else if (formState.view === "YEAR") {
        const begin = yearValue.value.startOf("year");
        period = buildPeriod(begin, begin.add(1, "year"));
        type = "YEAR";
      } else {
        const begin = customDateRange.value[0].startOf("day");
        period = buildPeriod(begin, customDateRange.value[1].startOf("day").add(1, "day"));
        type = "CUSTOM";
      }
      const params = {
        type,
        period,
        granularity: activeGranularity.value,
        sortField: formState.sortField,
      };
      if (formState.parkingInfoCode) {
        params.parkingInfoCodes = formState.parkingInfoCode;
      }
      return params;
    }

    function getRankQueryParams() {
      return {
        ...getQueryParams(),
        pageNumber: rankPagination.current,
        pageSize: rankPagination.pageSize,
      };
    }

    function unwrapPageData(res) {
      const data = res?.data && typeof res.data === "object" ? res.data : res;
      const records = Array.isArray(data?.records) ? data.records : Array.isArray(data) ? data : [];
      return {
        records,
        total: Number(data?.total ?? records.length) || 0,
        current: Number(data?.current ?? data?.pageNumber ?? rankPagination.current) || 1,
        pageSize: Number(data?.size ?? data?.pageSize ?? rankPagination.pageSize) || 10,
      };
    }

    function formatNumber(value) {
      const n = Number(value);
      if (!Number.isFinite(n)) return "0";
      return n.toLocaleString();
    }

    function rateText(value) {
      const n = normalizeRate(value);
      return `${n >= 0 ? "上升" : "下降"} ${Math.abs(n).toFixed(1)}%`;
    }

    function patchSummary(data) {
      Object.assign(summary, {
        totalVehicleNumber: data?.totalVehicleNumber || 0,
        totalMomRate: data?.totalMomRate || 0,
        totalYoyRate: data?.totalYoyRate || 0,
        avgVehicleNumber: data?.avgVehicleNumber || 0,
        peakVehicleNumber: data?.peakVehicleNumber || 0,
        peakPeriod: data?.peakPeriod || "",
      });
    }

    function patchRankPage(res) {
      const page = unwrapPageData(res);
      rankList.value = page.records;
      rankPagination.total = page.total;
      rankPagination.current = page.current;
      rankPagination.pageSize = page.pageSize;
    }

    async function queryRank() {
      const rankRes = await proxy.$api.getParkingVehicleFlowAreaRank(getRankQueryParams());
      patchRankPage(rankRes);
    }

    async function loadParkingOptions() {
      parkingLoading.value = true;
      try {
        const res = await proxy.$api.getParkingInfors();
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        parkingOptions.value = list.filter((item) => item?.code);
      } catch (error) {
        parkingOptions.value = [];
        message.error("停车场数据获取失败");
      } finally {
        parkingLoading.value = false;
      }
    }

    async function query() {
      try {
        loading.value = true;
        const params = getQueryParams();
        const [summaryRes, trendRes, rankRes] = await Promise.all([
          proxy.$api.getParkingVehicleFlowSummary(params),
          proxy.$api.getParkingVehicleFlowTrend(params),
          proxy.$api.getParkingVehicleFlowAreaRank(getRankQueryParams()),
        ]);
        patchSummary(unwrapData(summaryRes, {}));
        trendList.value = unwrapData(trendRes, []);
        patchRankPage(rankRes);
        await nextTick();
        renderChart();
      } catch (error) {
        trendList.value = [];
        rankList.value = [];
        rankPagination.total = 0;
        await nextTick();
        renderChart();
        message.error("车流统计数据获取失败");
      } finally {
        loading.value = false;
      }
    }

    function buildFallbackTrend() {
      if (activeGranularity.value === "HOUR") {
        return Array.from({ length: 24 }, (_, index) => ({ period: `${pad2(index)}:00`, totalVehicleNumber: 0 }));
      }
      if (activeGranularity.value === "DAY") {
        const days =
          formState.view === "MONTH"
            ? monthValue.value.daysInMonth()
            : Math.max(customDateRange.value[1].diff(customDateRange.value[0], "day") + 1, 1);
        return Array.from({ length: days }, (_, index) => ({ period: `${index + 1}`, totalVehicleNumber: 0 }));
      }
      if (activeGranularity.value === "MONTH") {
        return Array.from({ length: 12 }, (_, index) => ({ period: `${index + 1}月`, totalVehicleNumber: 0 }));
      }
      return [{ period: yearValue.value.format("YYYY"), totalVehicleNumber: 0 }];
    }

    function renderChart() {
      if (!chartRef.value) return;
      if (!chart) {
        chart = echarts.init(chartRef.value);
      }
      const chartData = trendList.value.length ? trendList.value : buildFallbackTrend();
      chart.setOption({
        color: ["#ff9f18"],
        tooltip: {
          trigger: "axis",
          formatter: (params) => {
            const item = params?.[0];
            return item ? `${item.name}<br/>车辆数: ${formatNumber(item.value)}` : "";
          },
        },
        grid: {
          left: 48,
          right: 24,
          top: 20,
          bottom: 34,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          axisTick: { show: false },
          axisLine: { lineStyle: { color: "#e7edf5" } },
          axisLabel: { color: "#8a96a8" },
          data: chartData.map((item) => item.period),
        },
        yAxis: {
          type: "value",
          minInterval: 1,
          splitLine: { lineStyle: { color: "#eef2f7" } },
          axisLabel: { color: "#8a96a8" },
        },
        series: [
          {
            name: "车辆",
            type: "line",
            smooth: true,
            showSymbol: false,
            lineStyle: { width: 3 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(255, 159, 24, 0.22)" },
                { offset: 1, color: "rgba(255, 159, 24, 0.04)" },
              ]),
            },
            data: chartData.map((item) => item.totalVehicleNumber || 0),
          },
        ],
      });
      chart.resize();
    }

    async function onViewChange() {
      applyingViewChange = true;
      if (formState.view === "CUSTOM" && !["DAY", "MONTH", "YEAR"].includes(formState.granularity)) {
        formState.granularity = "DAY";
      } else if (formState.view !== "CUSTOM") {
        formState.granularity = activeGranularity.value;
      }
      rankPagination.current = 1;
      if (formState.view === "CUSTOM") {
        await syncDefaultCustomDateRange();
      }
      await nextTick();
      applyingViewChange = false;
      query();
    }

    function changeSort(sortField) {
      formState.sortField = sortField;
      rankPagination.current = 1;
      query();
    }

    async function onRankTableChange(pagination) {
      rankPagination.current = pagination.current;
      rankPagination.pageSize = pagination.pageSize;
      try {
        loading.value = true;
        await queryRank();
      } catch (error) {
        rankList.value = [];
        rankPagination.total = 0;
        message.error("停车场车辆排行获取失败");
      } finally {
        loading.value = false;
      }
    }

    async function exportRank() {
      exportLoading.value = true;
      try {
        const result = await exportParkingVehicleFlowAreaRank(getQueryParams());
        const link = document.createElement("a");
        const fileBlob = new Blob([result?.data || result], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        link.style.display = "none";
        link.href = URL.createObjectURL(fileBlob);
        link.setAttribute("download", "停车场车辆排行.xlsx");
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
      } catch (error) {
        proxy?.$message?.error ? proxy.$message.error("导出失败") : message.error("导出失败");
      } finally {
        exportLoading.value = false;
      }
    }

    function reset() {
      formState.view = "DAY";
      formState.granularity = "DAY";
      formState.sortField = "TOTAL";
      formState.parkingInfoCode = undefined;
      rankPagination.current = 1;
      rankPagination.pageSize = 10;
      rankPagination.total = 0;
      dayValue.value = dayjs();
      monthValue.value = dayjs();
      yearValue.value = dayjs();
      customDateRange.value = getDefaultCustomDateRange(formState.granularity);
      query();
    }

    watch(
      [dayValue, monthValue, yearValue, customDateRange],
      () => {
        if (syncingCustomDateRange) return;
        rankPagination.current = 1;
        query();
      },
      { deep: true },
    );

    watch(
      () => formState.granularity,
      async () => {
        if (applyingViewChange) return;
        if (formState.view === "CUSTOM") {
          rankPagination.current = 1;
          await syncDefaultCustomDateRange();
          query();
        }
      },
    );

    onMounted(async () => {
      contentTableEl = chartRef.value?.closest(".content-table");
      if (contentTableEl) {
        originalContentTableOverflow = contentTableEl.style.overflow;
        originalContentTableBackground = contentTableEl.style.background;
        contentTableEl.style.overflow = "auto";
        contentTableEl.style.background = "#fff";
      }
      await loadParkingOptions();
      query();
      window.addEventListener("resize", renderChart);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", renderChart);
      if (contentTableEl) {
        contentTableEl.style.overflow = originalContentTableOverflow;
        contentTableEl.style.background = originalContentTableBackground;
      }
      if (chart) {
        chart.dispose();
        chart = null;
      }
    });

    return {
      activeGranularity,
      averageTitle,
      averageUnit,
      chartRef,
      chartUnitText,
      changeSort,
      currentHint,
      customDateRange,
      dayValue,
      exportLoading,
      exportRank,
      formState,
      formatNumber,
      loading,
      monthValue,
      parkingLoading,
      parkingOptions,
      onRankTableChange,
      onViewChange,
      peakTitle,
      query,
      rankColumns,
      rankList,
      rankPagination,
      rateText,
      reset,
      summary,
      yearValue,
    };
  },
});
</script>

<style lang="less" scoped>
.traffic-stat-page {
  background: #fff;
  min-height: 100%;
  padding: 0 0 10px;
}

.header-toolbar {
  align-items: center;
  background: #fff;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
  min-height: 42px;
}

.header-toolbar :deep(.ant-radio-button-wrapper) {
  height: 32px;
  line-height: 30px;
  min-width: 64px;
  text-align: center;
}

.header-toolbar :deep(.ant-radio-button-wrapper:not(:first-child)::before) {
  display: none;
}

.header-toolbar :deep(.ant-picker) {
  height: 32px;
}

.header-toolbar :deep(.ant-btn) {
  height: 32px;
  min-width: 64px;
}

.header-toolbar :deep(.ant-btn + .ant-btn) {
  margin-left: 0;
}

.query-button {
  padding: 0 !important;
  width: 64px;
}

.query-button:deep(.anticon) {
  margin-right: 4px;
}

.query-button:deep(.ant-btn-loading-icon) {
  margin-left: 0;
}

.toolbar-label {
  color: #4e5969;
  font-size: 14px;
  margin-left: 8px;
}

:deep(.layout-container) {
  background: #fff;
  padding: 0;
}

:deep(.layout-header),
:deep(.layout-content) {
  background: #fff;
}

:deep(.layout-header) {
  border-bottom: 1px solid #e7edf5;
  padding: 0 16px;
}

:deep(.content-table) {
  background: #fff;
  overflow: auto !important;
}

.page-meta {
  color: #8a96a8;
  font-size: 12px;
  line-height: 20px;
  padding: 8px 14px 0;
}

.overview-row {
  align-items: center;
  background: #fff;
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 8px 14px 10px;
}

.overview-item {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #edf1f7;
  border-radius: 6px;
  display: flex;
  min-height: 82px;
  padding: 10px 14px;
}

.summary-icon {
  align-items: center;
  border-radius: 8px;
  display: flex;
  flex: 0 0 48px;
  font-size: 22px;
  height: 48px;
  justify-content: center;
  margin-right: 12px;
  width: 48px;
}

.summary-icon.total {
  background: #fff1e1;
  color: #fba33f;
}

.summary-icon.avg {
  background: #e8f3ff;
  color: #4080ff;
}

.summary-icon.peak {
  background: #ffedf7;
  color: #d86aa5;
}

.summary-title {
  color: #8b96a6;
  font-size: 13px;
  margin-bottom: 2px;
}

.summary-value {
  color: #1d2129;
  font-size: 24px;
  font-weight: 700;
  line-height: 30px;
}

.summary-value span {
  color: #4e5969;
  font-size: 14px;
  font-weight: 400;
  margin-left: 3px;
}

.summary-rate {
  color: #f53f3f;
  font-size: 12px;
  margin-top: 2px;
}

.summary-rate .split {
  margin-left: 10px;
}

.summary-rate.muted {
  color: #8b96a6;
}

.dashboard-grid {
  background: #fff;
  display: grid;
  gap: 0;
}

.panel {
  background: #fff;
  border-radius: 0;
  padding: 10px 14px 12px;
}

.chart-panel {
  border-top: 1px solid #eef2f7;
  min-height: 352px;
  padding-bottom: 8px;
}

.section-title-row {
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: 28px;
}

.section-title {
  color: #1d2129;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  padding-left: 10px;
  position: relative;
}

.section-title::before {
  background: #2f7bff;
  border-radius: 1px;
  content: "";
  height: 14px;
  left: 0;
  position: absolute;
  top: 3px;
  width: 3px;
}

.section-subtitle {
  color: #8a96a8;
  font-size: 12px;
  margin-top: 2px;
  padding-left: 10px;
}

.trend-chart {
  height: 292px;
  width: 100%;
}

.rank-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  min-height: 28px;
}

.rank-panel {
  border-top: 8px solid #f5f7fa;
}

.rank-actions :deep(.ant-btn-link) {
  color: #4e5969;
  height: 28px;
  padding: 0 6px;
}

.rank-actions :deep(.ant-btn-link.active) {
  color: #2f7bff;
  font-weight: 600;
}

.area-name {
  align-items: center;
  display: inline-flex;
}

.area-name i {
  border-radius: 50%;
  display: inline-block;
  height: 7px;
  margin-right: 9px;
  width: 7px;
}

.rank-panel :deep(.ant-table-thead > tr > th) {
  background: #f5f7fa;
  color: #4e5969;
  font-weight: 600;
}

.rank-panel :deep(.ant-table-tbody > tr > td) {
  color: #25324a;
  font-weight: 500;
}

@media (max-width: 960px) {
  .overview-row {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .header-toolbar {
    justify-content: flex-start;
  }
}
</style>
