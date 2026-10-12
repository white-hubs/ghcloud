import dayjs from "dayjs";
import ExcelJS from "exceljs";
import { defineComponent, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { FirePointEventStatisticsRecord } from "@ghcloud/cube-service-interface/fire-management";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { listFirePointEventStatistics } from "@ghcloud/cube-services-client/fire-management.client";
import { Button, DownloadOutlined, Page, message, type ColumnType } from "@ghcloud/cube-ui";

import { DEFAULT_POINT_STATISTICS_FILTERS, type PointStatisticsRecord } from "./point-statistics.model";

import styles from "./point-statistics.module.less";

interface PointStatisticsSearch {
  pageNumber: number;
  pageSize: number;
  total: number;
  period: string[];
  area: string;
}

const formatQueryDate = (value: unknown): string => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = dayjs(value as Parameters<typeof dayjs>[0]);
  return date.isValid() ? date.format("YYYY-MM-DD") : "";
};

const normalizePeriod = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(formatQueryDate).filter(Boolean).slice(0, 2);
  }
  if (typeof value === "string") {
    return value.split(",").map(formatQueryDate).filter(Boolean).slice(0, 2);
  }
  return [];
};

const readPositiveInteger = (value: unknown, fallback: number): number => {
  const parsed = Number.parseInt(typeof value === "string" ? value : "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeSearchValues = (values: Record<string, unknown>, current: PointStatisticsSearch): Partial<PointStatisticsSearch> => ({
  period: normalizePeriod(values.period),
  area: (values.area as string | undefined) ?? "",
  pageNumber: readPositiveInteger(values.pageNumber, current.pageNumber),
  pageSize: readPositiveInteger(values.pageSize, current.pageSize),
});

const mapRecord = (record: FirePointEventStatisticsRecord): PointStatisticsRecord => ({
  id: String(record.id),
  pointName: record.pointName || "--",
  location: record.location || "--",
  alarmCount: Number(record.alarmCount || 0),
  faultCount: Number(record.faultCount || 0),
  totalCount: Number(record.totalCount || 0),
  lastTriggerTime: record.lastTriggerTime == null || record.lastTriggerTime === "" ? "--" : String(record.lastTriggerTime),
});

const formatLastTriggered = (value: unknown): string => {
  if (value == null || value === "") return "--";
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp)) return "--";
  // 接口时间戳兼容秒级与毫秒级，展示精确到时分秒。
  const date = dayjs(timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp);
  return date.isValid() ? date.format("YYYY-MM-DD HH:mm:ss") : "--";
};

export const PointStatistics = defineComponent({
  name: "PointStatistics",
  setup: () => {
    const route = useRoute();
    const searchParams = reactive<PointStatisticsSearch>({
      pageNumber: readPositiveInteger(route.query.pageNumber, 1),
      pageSize: readPositiveInteger(route.query.pageSize, 10),
      total: 0,
      period: [DEFAULT_POINT_STATISTICS_FILTERS.startDate, DEFAULT_POINT_STATISTICS_FILTERS.endDate],
      area: "",
    });
    const currentRecords = ref<PointStatisticsRecord[]>([]);

    const columns: ColumnType<PointStatisticsRecord>[] = [
      {
        title: "排名",
        key: "rank",
        align: "center",
        width: 72,
        customRender: ({ index }: { index: number }): number => (searchParams.pageNumber - 1) * searchParams.pageSize + index + 1,
      },
      { title: "点位名称", dataIndex: "pointName", key: "pointName", align: "center", width: 210, ellipsis: true },
      { title: "所属位置", dataIndex: "location", key: "location", width: 260, ellipsis: true },
      {
        title: "报警次数",
        dataIndex: "alarmCount",
        key: "alarmCount",
        align: "center",
        width: 120,
        customRender: ({ text }: { text: number }): JSX.Element => (
          <strong class={text >= 10 ? styles.dangerCount : text >= 6 ? styles.warningCount : undefined}>{text}</strong>
        ),
      },
      {
        title: "故障次数",
        dataIndex: "faultCount",
        key: "faultCount",
        align: "center",
        width: 120,
        customRender: ({ text }: { text: number }): JSX.Element => <span class={text >= 4 ? styles.warningCount : undefined}>{text}</span>,
      },
      {
        title: "合计",
        key: "totalCount",
        align: "center",
        width: 100,
        customRender: ({ record }: { record: PointStatisticsRecord }): JSX.Element => <strong>{record.totalCount}</strong>,
      },
      {
        title: "最近触发",
        dataIndex: "lastTriggerTime",
        key: "lastTriggerTime",
        align: "center",
        width: 170,
        customRender: ({ text }: { text: unknown }): string => formatLastTriggered(text),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: "FIRE_POINT_STATISTICS",
      rowKey: "id",
      fetchApi: async () => {
        const [startDate, endDate] = searchParams.period;
        const page = await useAuthRequest(() =>
          listFirePointEventStatistics({
            pageNumber: searchParams.pageNumber,
            pageSize: searchParams.pageSize,
            startDate: formatQueryDate(startDate) || undefined,
            endDate: formatQueryDate(endDate) || undefined,
            location: searchParams.area || undefined,
          }),
        );
        const records = (page.records || []).map(mapRecord);
        currentRecords.value = records;
        return {
          total: Number(page.total || 0),
          pages: Number(page.pages || 0),
          records,
        };
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total;
      },
    });

    const formSchema = [
      {
        component: "Input",
        label: "所属位置",
        fieldName: "area",
        componentProps: { allowClear: true, placeholder: "搜索所属位置" },
      },
      {
        component: "RangePicker",
        label: "报警时间",
        fieldName: "period",
        defaultValue: [DEFAULT_POINT_STATISTICS_FILTERS.startDate, DEFAULT_POINT_STATISTICS_FILTERS.endDate],
        componentProps: {
          valueFormat: "YYYY-MM-DD",
          allowClear: false,
        },
      },
    ];

    const [CubeForm] = useCubeForm({
      cache: false,
      layout: "horizontal",
      showCollapseButton: true,
      schema: formSchema,
      syncStateRef: searchParams,
      syncMap: (values) => normalizeSearchValues(values, searchParams),
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: (values) => {
        const nextValues = normalizeSearchValues(values, searchParams);
        const [startDate, endDate] = nextValues.period ?? [];
        if (startDate && endDate && startDate > endDate) {
          message.warning("开始日期不能晚于结束日期");
          return;
        }
        Object.assign(searchParams, nextValues, { pageNumber: 1 });
        tableApi.query();
      },
      handleReset: () => {
        Object.assign(searchParams, {
          pageNumber: 1,
          period: [DEFAULT_POINT_STATISTICS_FILTERS.startDate, DEFAULT_POINT_STATISTICS_FILTERS.endDate],
          area: "",
        });
        tableApi.query();
      },
    });

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };

    const exportExcel = async (): Promise<void> => {
      try {
        const records = currentRecords.value;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("点位统计");
        worksheet.columns = [
          { header: "排名", key: "rank", width: 10 },
          { header: "点位名称", key: "pointName", width: 24 },
          { header: "所属位置", key: "location", width: 30 },
          { header: "报警次数", key: "alarmCount", width: 12 },
          { header: "故障次数", key: "faultCount", width: 12 },
          { header: "合计", key: "totalCount", width: 10 },
          { header: "最近触发时间", key: "lastTriggerTime", width: 20 },
        ];
        records.forEach((record, index) => {
          worksheet.addRow({
            rank: index + 1,
            pointName: record.pointName,
            location: record.location,
            alarmCount: record.alarmCount,
            faultCount: record.faultCount,
            totalCount: record.totalCount,
            lastTriggerTime: record.lastTriggerTime,
          });
        });
        worksheet.getRow(1).font = { bold: true };

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        const [startDate = "", endDate = ""] = searchParams.period;
        anchor.href = url;
        anchor.download = `点位统计-${startDate}-${endDate}.xlsx`;
        anchor.click();
        URL.revokeObjectURL(url);
        message.success(`已导出 ${records.length} 条点位统计`);
      } catch {
        message.error("导出失败，请稍后重试");
      }
    };

    const slots = {
      "layout-header": (): JSX.Element => (
        <Button onClick={() => void exportExcel()}>
          <DownloadOutlined />
          导出Excel
        </Button>
      ),
      "layout-content": (): JSX.Element => (
        <div class={styles.page}>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <div class={styles.footer}>
          <Page
            current={searchParams.pageNumber}
            pageSize={searchParams.pageSize}
            total={searchParams.total}
            showTotal={(total: number): string => `共 ${total} 条（仅显示有告警/故障点位）`}
            onPageChange={handlePageChange}
          />
        </div>
      ),
    };

    return (): JSX.Element => <CubeLayout title="点位统计" v-slots={slots} showTableXScroll />;
  },
});

export default PointStatistics;
