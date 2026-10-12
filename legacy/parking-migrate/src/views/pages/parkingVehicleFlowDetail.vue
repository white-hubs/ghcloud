<template>
  <g-layout-no-footer title="停车明细">
    <template v-slot:content-table>
      <div class="vehicle-flow-detail-page">
        <a-form layout="inline" :model="formState" class="filter-form">
          <a-form-item label="日期时间">
            <a-date-picker
              v-model:value="formState.date"
              :allow-clear="false"
              format="YYYY/MM/DD"
              :get-popup-container="getPopupContainer"
              style="width: 138px"
            />
          </a-form-item>
          <a-form-item>
            <a-time-picker
              v-model:value="formState.startTime"
              :allow-clear="false"
              format="HH:mm"
              :get-popup-container="getPopupContainer"
              style="width: 92px"
            />
          </a-form-item>
          <span class="time-split">至</span>
          <a-form-item>
            <a-time-picker
              v-model:value="formState.endTime"
              :allow-clear="false"
              format="HH:mm"
              :get-popup-container="getPopupContainer"
              style="width: 92px"
            />
          </a-form-item>
          <a-form-item label="停车场">
            <a-select
              v-model:value="formState.parkingInfoCode"
              allow-clear
              :get-popup-container="getPopupContainer"
              :loading="parkingLoading"
              placeholder="全部停车场"
              style="width: 180px"
            >
              <a-select-option v-for="item in parkingOptions" :key="item.code" :value="item.code">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" :loading="loading" @click="search">
              <template #icon><SearchOutlined /></template>
              查询
            </a-button>
          </a-form-item>
          <a-form-item>
            <a-button @click="reset">重置</a-button>
          </a-form-item>
        </a-form>

        <section class="chart-card chart-panel">
          <div class="section-title-row">
            <div class="section-title">车辆采集趋势</div>
            <div class="section-extra">每10分钟采集 · {{ trendList.length }}个数据点</div>
          </div>
          <div ref="chartRef" class="trend-chart"></div>
        </section>

        <section class="table-card rank-panel">
          <div class="rank-header">
            <div class="section-title">车辆采集明细</div>
            <div class="rank-actions">
              <a-button type="link" :loading="exportLoading" :disabled="detailList.length === 0" @click="exportDetail">导出</a-button>
            </div>
          </div>
          <a-table
            :columns="columns"
            :data-source="detailList"
            :loading="loading"
            :pagination="{
              hideOnSinglePage: false,
              pageSizeOptions: ['10', '20', '50', '100'],
              showQuickJumper: true,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              current: detailPagination.current,
              pageSize: detailPagination.pageSize,
              total: detailPagination.total,
            }"
            :row-key="(record) => `${record.id || record.parkingName}-${record.reportTime}`"
            :scroll="{ y: 360 }"
            @change="onTableChange"
          />
        </section>
      </div>
    </template>
  </g-layout-no-footer>
</template>

<script lang="jsx">
import { SearchOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import * as echarts from "echarts";
import { computed, defineComponent, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";

import { exportParkingVehicleFlowDetails } from "../../api/park";

function combineDateTime(date, time) {
  return dayjs(date).hour(dayjs(time).hour()).minute(dayjs(time).minute()).second(0).millisecond(0);
}

export default defineComponent({
  name: "ParkingVehicleFlowDetail",
  components: {
    SearchOutlined,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const loading = ref(false);
    const parkingLoading = ref(false);
    const chartRef = ref(null);
    const trendList = ref([]);
    const detailList = ref([]);
    const parkingOptions = ref([]);
    const exportLoading = ref(false);
    const detailPagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    let chart = null;
    let contentTableEl = null;
    let originalContentTableOverflow = "";
    let originalContentTableBackground = "";

    const formState = reactive({
      date: dayjs(),
      startTime: dayjs().startOf("day"),
      endTime: dayjs().endOf("day").second(0),
      parkingInfoCode: undefined,
    });

    const selectedParking = computed(() => {
      return parkingOptions.value.find((item) => item.code === formState.parkingInfoCode) || {};
    });

    const columns = [
      {
        title: "车场名称",
        dataIndex: "parkingName",
        key: "parkingName",
        customRender: ({ text }) => (
          <a-popover placement="topLeft" content={text || "--"}>
            {text || "--"}
          </a-popover>
        ),
      },
      {
        title: "历史车辆数量",
        dataIndex: "vehicleNumber",
        key: "vehicleNumber",
        align: "center",
        customRender: ({ text }) => <span class="vehicle-count">{formatNumber(text)}</span>,
      },
      {
        title: "上报时间",
        dataIndex: "reportTime",
        key: "reportTime",
        customRender: ({ text }) => (
          <a-popover placement="topLeft" content={text || "--"}>
            {text || "--"}
          </a-popover>
        ),
      },
    ];

    function getPopupContainer(triggerNode) {
      return triggerNode?.closest?.(".vehicle-flow-detail-page") || document.body;
    }

    function getQueryRange() {
      const start = combineDateTime(formState.date, formState.startTime);
      const selectedEnd = combineDateTime(formState.date, formState.endTime);
      if (selectedEnd.isBefore(start)) {
        return null;
      }
      return { start, end: selectedEnd.add(1, "minute") };
    }

    function normalizeListResponse(res) {
      return Array.isArray(res?.records)
        ? res.records
        : Array.isArray(res)
          ? res
          : Array.isArray(res?.data?.records)
            ? res.data.records
            : Array.isArray(res?.data)
              ? res.data
              : [];
    }

    function buildQueryParams(withPage = false) {
      const range = getQueryRange();
      if (!range) {
        message.warning("结束时间不能早于开始时间");
        return null;
      }
      const params = {
        type: "TODAY",
        period: `${range.start.format("YYYY-MM-DD HH:mm:ss")},${range.end.format("YYYY-MM-DD HH:mm:ss")}`,
      };
      if (formState.parkingInfoCode) {
        params.parkingInfoCodes = formState.parkingInfoCode;
      }
      if (withPage) {
        params.pageNumber = detailPagination.current;
        params.pageSize = detailPagination.pageSize;
      }
      return params;
    }

    function normalizePageResponse(res) {
      const data = res?.data && typeof res.data === "object" ? res.data : res;
      const records = Array.isArray(data?.records) ? data.records : Array.isArray(data) ? data : [];
      return {
        records,
        total: Number(data?.total ?? data?.totalCount ?? data?.totalElements ?? records.length) || 0,
        current: Number(data?.current ?? data?.pageNumber ?? detailPagination.current) || 1,
        pageSize: Number(data?.size ?? data?.pageSize ?? data?.limit ?? detailPagination.pageSize) || 10,
      };
    }

    function normalizeDetailRows(rows) {
      return rows.map((item, index) => ({
        id: item.id ?? `${item.name || item.parkingName || "parking"}-${item.reportTime || index}`,
        parkingName: item.parkingName ?? item.name ?? "--",
        vehicleNumber: item.vehicleNumber ?? item.totalVehicleNumber ?? 0,
        reportTime: item.reportTime ?? item.period ?? "--",
      }));
    }

    function normalizeTrendRows(rows) {
      return rows.map((item) => ({
        time: item.time ?? (item.period ? dayjs(item.period).format("HH:mm") : "--"),
        vehicleNumber: item.vehicleNumber ?? item.totalVehicleNumber ?? 0,
      }));
    }

    function formatNumber(value) {
      const n = Number(value);
      if (!Number.isFinite(n)) return "0";
      return n.toLocaleString();
    }

    function renderChart() {
      if (!chartRef.value) return;
      if (!chart) {
        chart = echarts.init(chartRef.value);
      }
      const chartData = trendList.value;
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
          data: chartData.map((item) => item.time),
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
            data: chartData.map((item) => item.vehicleNumber || 0),
          },
        ],
      });
      chart.resize();
    }

    async function loadParkingOptions() {
      parkingLoading.value = true;
      try {
        const res = await proxy.$api.getParkingInfors();
        const list = normalizeListResponse(res);
        parkingOptions.value = list
          .map((item) => ({
            code: item.code,
            name: item.name,
          }))
          .filter((item) => item.code);
      } catch (err) {
        parkingOptions.value = [];
        message.error("停车场获取失败");
      } finally {
        parkingLoading.value = false;
      }
    }

    async function query() {
      const params = buildQueryParams();
      if (!params) {
        return;
      }
      loading.value = true;
      try {
        const detailParams = buildQueryParams(true);
        const [detailRes, trendRes] = await Promise.all([
          proxy.$api.getParkingVehicleFlowDetails(detailParams),
          proxy.$api.getParkingVehicleFlowDetailTrend(params),
        ]);
        patchDetailPage(detailRes);
        trendList.value = normalizeTrendRows(normalizeListResponse(trendRes));
        await nextTick();
        renderChart();
      } catch (err) {
        detailList.value = [];
        trendList.value = [];
        detailPagination.total = 0;
        await nextTick();
        renderChart();
        message.error("车辆统计明细获取失败");
      } finally {
        loading.value = false;
      }
    }

    function patchDetailPage(res) {
      const detailPage = normalizePageResponse(res);
      detailList.value = normalizeDetailRows(detailPage.records);
      detailPagination.total = detailPage.total;
      detailPagination.current = detailPage.current;
      detailPagination.pageSize = detailPage.pageSize;
    }

    async function queryDetailPage() {
      const params = buildQueryParams(true);
      if (!params) {
        return;
      }
      loading.value = true;
      try {
        const res = await proxy.$api.getParkingVehicleFlowDetails(params);
        patchDetailPage(res);
      } catch (err) {
        detailList.value = [];
        detailPagination.total = 0;
        message.error("车辆明细获取失败");
      } finally {
        loading.value = false;
      }
    }

    function reset() {
      formState.date = dayjs();
      formState.startTime = dayjs().startOf("day");
      formState.endTime = dayjs().endOf("day").second(0);
      formState.parkingInfoCode = undefined;
      detailPagination.current = 1;
      detailPagination.pageSize = 10;
      detailPagination.total = 0;
      query();
    }

    function onTableChange(pagination) {
      detailPagination.current = pagination.current;
      detailPagination.pageSize = pagination.pageSize;
      queryDetailPage();
    }

    function search() {
      detailPagination.current = 1;
      query();
    }

    async function exportDetail() {
      const params = buildQueryParams();
      if (!params) {
        return;
      }
      exportLoading.value = true;
      try {
        const result = await exportParkingVehicleFlowDetails(params);
        const link = document.createElement("a");
        const fileBlob = new Blob([result?.data || result], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        link.style.display = "none";
        link.href = URL.createObjectURL(fileBlob);
        link.setAttribute("download", `车场车辆明细-${selectedParking.value.name || "全部"}.xlsx`);
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
      } catch (error) {
        message.error("导出失败");
      } finally {
        exportLoading.value = false;
      }
    }

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
      parkingOptions,
      parkingLoading,
      chartRef,
      columns,
      detailList,
      detailPagination,
      exportDetail,
      exportLoading,
      formState,
      getPopupContainer,
      loading,
      onTableChange,
      query,
      reset,
      search,
      trendList,
    };
  },
});
</script>

<style lang="less" scoped>
.vehicle-flow-detail-page {
  background: #fff;
  min-height: 100%;
  padding: 0 0 10px;
}

.filter-form {
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e7edf5;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 54px;
  padding: 8px 14px;
  position: relative;
  z-index: 2;
}

.filter-form :deep(.ant-form-item) {
  margin-bottom: 0;
  margin-right: 0;
}

.time-split {
  color: #8a96a8;
  margin-left: -2px;
  margin-right: -2px;
}

.chart-card,
.table-card {
  background: transparent;
  border-radius: 0;
  margin: 0;
  padding: 10px 14px 12px;
  position: relative;
  z-index: 1;
}

.chart-panel {
  border-top: 1px solid #eef2f7;
  min-height: 352px;
  padding-bottom: 8px;
}

.rank-panel {
  border-top: 8px solid #f5f7fa;
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

.section-extra {
  color: #8a96a8;
  font-size: 12px;
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

.rank-actions :deep(.ant-btn-link) {
  color: #4e5969;
  height: 28px;
  padding: 0 6px;
}

.vehicle-count {
  color: #1d2129;
  font-weight: 500;
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
  min-height: 42px;
  padding: 0 14px;
}

:deep(.content-table) {
  background: #fff;
  overflow: auto !important;
  padding-bottom: 12px;
}

.table-card :deep(.ant-table-thead > tr > th) {
  background: #f5f7fa;
  color: #4e5969;
  font-weight: 600;
}

.table-card :deep(.ant-table-tbody > tr > td) {
  color: #25324a;
  font-weight: 500;
}

.table-card :deep(.ant-pagination) {
  margin: 12px 0 0;
}
</style>
