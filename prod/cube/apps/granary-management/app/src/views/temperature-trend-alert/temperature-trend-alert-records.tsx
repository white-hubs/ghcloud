import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type {
  LiangcangBoundWarehouseSimpleItem,
  LiangcangTemperatureAlertRecordVO,
  LiangcangTemperatureAlertStatus,
} from "@ghcloud/cube-granary-management-service";
import { Button, Page, message } from "@ghcloud/cube-ui";

import {
  addDays,
  downloadBlob,
  formatDate,
  formatDateTime,
  formatNumber,
  PAGE_SIZE,
  statusText,
  toDateTimeBegin,
  toDateTimeEnd,
} from "./temperature-trend-alert-shared";
import { cubeGranaryManagementService } from "@/api/service";

import "./temperature-trend-alert.less";

export const TemperatureTrendAlertRecords = defineComponent({
  name: "TemperatureTrendAlertRecords",
  setup: () => {
    const router = useRouter();
    const warehouses = ref<LiangcangBoundWarehouseSimpleItem[]>([]);
    const recordExporting = ref(false);
    const searchParams = reactive<{
      pageNumber: number;
      pageSize: number;
      total: number;
      period: [string, string];
      warehouseId: number;
      status: LiangcangTemperatureAlertStatus | "";
    }>({
      pageNumber: 1,
      pageSize: PAGE_SIZE,
      total: 0,
      period: [formatDate(addDays(new Date(), -6)), formatDate(new Date())],
      warehouseId: 0,
      status: "",
    });

    const warehouseOptions = computed(() =>
      warehouses.value.map((item) => ({
        label: item.name === "" ? `仓房${item.warehouseId}` : item.name,
        value: item.warehouseId,
      })),
    );

    const recordWarehouseOptions = computed(() => [{ label: "全部仓房", value: 0 }, ...warehouseOptions.value]);

    const loadWarehouses = async (): Promise<void> => {
      warehouses.value = await cubeGranaryManagementService.getBoundWarehouseSimpleList();
    };

    const exportRecords = async (): Promise<void> => {
      recordExporting.value = true;
      try {
        const [startDate, endDate] = searchParams.period;
        const blob = await cubeGranaryManagementService.exportTemperatureAlertRecords({
          pageNumber: 1,
          pageSize: PAGE_SIZE,
          startTime: toDateTimeBegin(startDate),
          endTime: toDateTimeEnd(endDate),
          warehouseIds: searchParams.warehouseId === 0 ? [] : [searchParams.warehouseId],
          statuses: searchParams.status === "" ? [] : [searchParams.status],
        });
        downloadBlob(blob, `预警记录-${startDate}-${endDate}.xlsx`);
        message.success("预警记录已导出");
      } finally {
        recordExporting.value = false;
      }
    };

    const columns = [
      {
        title: "仓名称",
        dataIndex: "warehouseName",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string }) => text || "--",
      },
      { title: "粮食品种", dataIndex: "grainType", width: 140, ellipsis: true, customRender: ({ text }: { text: string }) => text || "--" },
      {
        title: "触发时间",
        dataIndex: "triggeredAt",
        width: 180,
        customRender: ({ text }: { text: string | number }) => formatDateTime(text),
      },
      {
        title: "温度值",
        dataIndex: "currentAvgTemperature",
        width: 120,
        customRender: ({ text }: { text: number }) => `${formatNumber(text)}℃`,
      },
      {
        title: "预警阈值",
        dataIndex: "warningThreshold",
        width: 120,
        customRender: ({ text }: { text: number }) => `${formatNumber(text)}℃`,
      },
      {
        title: "距离值",
        dataIndex: "distanceToThreshold",
        width: 120,
        customRender: ({ text }: { text: number }) => `${formatNumber(text)}℃`,
      },
      {
        title: "日均增幅",
        dataIndex: "dailyIncrease",
        width: 120,
        customRender: ({ text }: { text: number }) => `${formatNumber(text)}℃/天`,
      },
      { title: "连续上升天数", dataIndex: "consecutiveDays", width: 140, customRender: ({ text }: { text?: number }) => text ?? "--" },
      {
        title: "状态",
        dataIndex: "status",
        width: 120,
        customRender: ({ text }: { text: LiangcangTemperatureAlertStatus }) => (
          <span class={["temperature-alert-status", text === "ACTIVE" ? "is-active" : "is-cleared"]}>{statusText(text)}</span>
        ),
      },
      {
        title: "消除时间",
        dataIndex: "clearedAt",
        width: 180,
        customRender: ({ text }: { text: string | number }) => formatDateTime(text, "-"),
      },
      {
        title: "详情",
        dataIndex: "detail",
        width: 120,
        customRender: ({ record }: { record: LiangcangTemperatureAlertRecordVO }) => (
          <Button
            size="small"
            onClick={() => {
              void router.push({
                path: "/temperature-trend-alert/trend",
                query: { warehouseId: String(record.warehouseId) },
              });
            }}
          >
            查看走势
          </Button>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      rowKey: "id",
      columns,
      fetchApi: async () => {
        const [startDate, endDate] = searchParams.period;
        return cubeGranaryManagementService.getTemperatureAlertRecordPage({
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          startTime: toDateTimeBegin(startDate),
          endTime: toDateTimeEnd(endDate),
          warehouseIds: searchParams.warehouseId === 0 ? [] : [searchParams.warehouseId],
          statuses: searchParams.status === "" ? [] : [searchParams.status],
        });
      },
      fetchLoaded: (page) => {
        searchParams.total = page.total;
      },
    });

    const buildFormSchema = () => [
      {
        component: "RangePicker",
        fieldName: "period",
        label: "时间范围",
        defaultValue: searchParams.period,
        componentProps: {
          valueFormat: "YYYY-MM-DD",
          allowClear: false,
        },
      },
      {
        component: "Select",
        fieldName: "warehouseId",
        label: "仓房",
        defaultValue: 0,
        componentProps: {
          options: recordWarehouseOptions.value,
          style: { width: "180px" },
        },
      },
      {
        component: "Select",
        fieldName: "status",
        label: "状态",
        defaultValue: "",
        componentProps: {
          options: [
            { label: "全部", value: "" },
            { label: "预警中", value: "ACTIVE" },
            { label: "已消除", value: "CLEARED" },
          ],
          style: { width: "140px" },
        },
      },
    ];

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      schema: buildFormSchema(),
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: (values) => {
        const period = values.period as [string, string] | undefined;
        searchParams.period = period ?? [formatDate(addDays(new Date(), -6)), formatDate(new Date())];
        searchParams.warehouseId = Number(values.warehouseId ?? 0);
        searchParams.status = (values.status ?? "") as LiangcangTemperatureAlertStatus | "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.period = [formatDate(addDays(new Date(), -6)), formatDate(new Date())];
        searchParams.warehouseId = 0;
        searchParams.status = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
    });

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber || 1;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };

    onMounted(async () => {
      await loadWarehouses();
      formApi.updateSchema(buildFormSchema());
    });

    return (): JSX.Element => (
      <CubeLayout
        title="预警记录"
        v-slots={{
          "layout-header": () => (
            <Button type="primary" loading={recordExporting.value} onClick={() => void exportRecords()}>
              导出
            </Button>
          ),
          "layout-content": () => (
            <div class="temperature-alert-page">
              <section class="temperature-alert-panel temperature-alert-record-panel">
                <CubeForm />
                <CubeTable />
              </section>
            </div>
          ),
          "footer-page": () => (
            <Page
              current={searchParams.pageNumber}
              pageSize={searchParams.pageSize}
              total={searchParams.total}
              onPageChange={handlePageChange}
            />
          ),
        }}
      />
    );
  },
});
