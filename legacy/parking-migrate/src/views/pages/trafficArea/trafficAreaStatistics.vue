<template>
  <g-layout-no-footer title="区域客流统计">
    <template v-slot:content-table>
      <div class="traffic-area-statistics-page">
        <a-form layout="inline" :model="formState" class="filter-form">
          <div class="filter-left">
            <a-form-item label="时间范围">
              <a-radio-group v-model:value="formState.timeType" button-style="solid" @change="onTimeTypeChange">
                <a-radio-button value="TODAY">今日</a-radio-button>
                <a-radio-button value="THIS_MONTH">本月</a-radio-button>
                <a-radio-button value="THIS_YEAR">今年</a-radio-button>
                <a-radio-button value="CUSTOM">自定义</a-radio-button>
              </a-radio-group>
            </a-form-item>
            <a-form-item v-if="formState.timeType === 'CUSTOM'" label="起止时间">
              <a-range-picker
                v-model:value="customDateRange"
                format="YYYY-MM-DD"
                :allow-clear="false"
                style="width: 280px"
                @change="onCustomRangeChange"
              />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="query">查询</a-button>
            </a-form-item>
            <a-form-item>
              <a-button @click="reset">重置</a-button>
            </a-form-item>
          </div>
          <div class="filter-right">
            <a-button :loading="exportLoading" :disabled="dataCount === 0" @click="exportTable">导出</a-button>
          </div>
        </a-form>
        <div class="table-scroll">
          <a-table
            :columns="columns"
            :data-source="pagedDataSource"
            :loading="loading"
            :row-key="rowKey"
            bordered
            :pagination="{
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              current: formState.pageNumber,
              pageSize: formState.pageSize,
              total: formState.total,
            }"
            @change="pageChange"
          />
        </div>
      </div>
    </template>
  </g-layout-no-footer>
</template>

<script lang="jsx">
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { defineComponent, reactive, ref, computed, getCurrentInstance, onMounted } from "vue";

import { exportTrafficAreaStatisticsTrend } from "../../../api/park";

function buildPeriodByTimeType(timeType) {
  switch (timeType) {
    case "TODAY":
      return `${dayjs().format("YYYY-MM-DD 00:00:00")},${dayjs().format("YYYY-MM-DD 23:59:59")}`;
    case "THIS_MONTH":
      return `${dayjs().startOf("month").format("YYYY-MM-DD 00:00:00")},${dayjs().endOf("month").format("YYYY-MM-DD 23:59:59")}`;
    case "THIS_YEAR":
      return `${dayjs().startOf("year").format("YYYY-MM-DD 00:00:00")},${dayjs().format("YYYY-MM-DD 23:59:59")}`;
    default:
      return `${dayjs().format("YYYY-MM-DD 00:00:00")},${dayjs().format("YYYY-MM-DD 23:59:59")}`;
  }
}

function formatCustomPeriod(range) {
  if (!range || range.length !== 2 || !range[0] || !range[1]) {
    return null;
  }
  const start = dayjs(range[0]);
  const end = dayjs(range[1]);
  if (!start.isValid() || !end.isValid()) {
    return null;
  }
  return `${start.format("YYYY-MM-DD 00:00:00")},${end.format("YYYY-MM-DD 23:59:59")}`;
}

export default defineComponent({
  name: "TrafficAreaStatistics",
  setup() {
    const { proxy } = getCurrentInstance();
    const loading = ref(false);
    const exportLoading = ref(false);
    const dataSource = ref([]);
    const formState = reactive({
      timeType: "TODAY",
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });
    const customDateRange = ref([dayjs(), dayjs()]);
    const dataCount = computed(() => formState.total || 0);

    function getCurrentPeriod() {
      if (formState.timeType === "CUSTOM") {
        return formatCustomPeriod(customDateRange.value);
      }
      return buildPeriodByTimeType(formState.timeType);
    }

    const pagedDataSource = computed(() => {
      const start = (formState.pageNumber - 1) * formState.pageSize;
      return dataSource.value.slice(start, start + formState.pageSize);
    });

    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
        customRender: ({ text }) => (
          <a-popover placement="topLeft" content={text || "--"}>
            {text || "--"}
          </a-popover>
        ),
      },
      {
        title: "备注",
        dataIndex: "remarks",
        key: "remarks",
        customRender: ({ text, record }) => {
          const v = text ?? record?.remark ?? "--";
          return (
            <a-popover placement="topLeft" content={v}>
              {v}
            </a-popover>
          );
        },
      },
      {
        title: "时间点",
        dataIndex: "period",
        key: "period",
        customRender: ({ text }) => (
          <a-popover placement="topLeft" content={text || "--"}>
            {text || "--"}
          </a-popover>
        ),
      },
      {
        title: "客流量",
        dataIndex: "totalPersonNumber",
        key: "totalPersonNumber",
        customRender: ({ text }) => <span>{text ?? "--"}</span>,
      },
    ];

    function rowKey(record, index) {
      const id = record.id != null ? record.id : "row";
      const p = record.period != null ? record.period : index;
      return `${id}-${p}`;
    }

    function normalizeListResponse(res) {
      const list = Array.isArray(res?.records)
        ? res.records
        : Array.isArray(res)
          ? res
          : Array.isArray(res?.data?.records)
            ? res.data.records
            : Array.isArray(res?.data)
              ? res.data
              : [];
      const total = res?.total ?? res?.data?.total;
      if (total != null && Number.isFinite(Number(total))) {
        return { list, total: Number(total) };
      }
      return { list, total: list.length };
    }

    async function query() {
      const period = getCurrentPeriod();
      if (!period) {
        message.warning("请选择自定义时间范围");
        return;
      }
      try {
        loading.value = true;
        const params = {
          type: formState.timeType,
          period,
        };
        const res = await proxy.$api.getTrafficAreaStatisticsTrend(params);
        const { list, total } = normalizeListResponse(res);
        dataSource.value = list;
        formState.total = total;
        formState.pageNumber = 1;
      } catch (err) {
        message.error("统计数据获取失败");
      } finally {
        loading.value = false;
      }
    }

    function onTimeTypeChange() {
      if (formState.timeType === "CUSTOM") {
        customDateRange.value = [dayjs(), dayjs()];
      }
      formState.pageNumber = 1;
      query();
    }

    function onCustomRangeChange() {
      formState.pageNumber = 1;
      query();
    }

    function reset() {
      formState.timeType = "TODAY";
      customDateRange.value = [dayjs(), dayjs()];
      formState.pageNumber = 1;
      formState.pageSize = 10;
      query();
    }

    function pageChange(page) {
      formState.pageNumber = page.current;
      formState.pageSize = page.pageSize;
    }

    async function exportTable() {
      const period = getCurrentPeriod();
      if (!period) {
        message.warning("请选择自定义时间范围");
        return;
      }
      exportLoading.value = true;
      try {
        const result = await exportTrafficAreaStatisticsTrend({
          type: formState.timeType,
          period,
        });
        const link = document.createElement("a");
        const fileBlob = new Blob([result?.data || result], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        link.style.display = "none";
        link.href = URL.createObjectURL(fileBlob);
        link.setAttribute("download", "区域客流统计.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        proxy?.$message?.error ? proxy.$message.error("导出失败") : message.error("导出失败");
      } finally {
        exportLoading.value = false;
      }
    }

    onMounted(() => {
      query();
    });

    return {
      columns,
      dataSource,
      pagedDataSource,
      formState,
      customDateRange,
      loading,
      exportLoading,
      dataCount,
      query,
      reset,
      pageChange,
      exportTable,
      rowKey,
      onTimeTypeChange,
      onCustomRangeChange,
    };
  },
});
</script>

<style lang="less" scoped>
.traffic-area-statistics-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.filter-form {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: space-between;
  margin-bottom: 12px;
  width: 100%;
}

.filter-left {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-right {
  display: flex;
  gap: 8px;
}

.table-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-bottom: 12px;
}

.table-scroll :deep(.ant-table-wrapper),
.table-scroll :deep(.ant-spin-nested-loading),
.table-scroll :deep(.ant-spin-container) {
  min-height: 100%;
}
</style>
