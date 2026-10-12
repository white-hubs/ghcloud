import dayjs from "dayjs";
import { computed, defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import {
  GrainAlertStatus,
  GrainAlertType,
  type GrainAlertListItem,
  type GrainAlertPageQuery,
  type GrainAlertPageResult,
  type GrainWarehouseOption,
} from "@ghcloud/cube-service-interface/intelligent-grain";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import {
  exportIntelligentGrainAlerts,
  listIntelligentGrainWarehouseOptions,
  pageIntelligentGrainAlerts,
} from "@ghcloud/cube-services-client/intelligent-grain.client";
import { Button, DateRangePicker, Page, Select, Space, TabPane, Tabs, message, type ColumnType } from "@ghcloud/cube-ui";

import { ALERT_STATUS_LABEL, ALERT_TYPE_OPTIONS, PRIMARY_ALERT_STATUSES, alertColumns, downloadBlob } from "@/views/shared/view-utils";

import "@/views/shared/intelligent-grain.less";

export const IntelligentGrainAlerts = defineComponent({
  name: "IntelligentGrainAlerts",
  setup: () => {
    const router = useRouter();
    const exporting = ref(false);
    const alerts = ref<GrainAlertPageResult>();
    const warehouses = ref<GrainWarehouseOption[]>([]);
    const status = ref<GrainAlertStatus | undefined>();
    const pageNumber = ref(1);
    const pageSize = ref(20);

    const warehouseOptions = computed(() => [
      { label: "全部仓房", value: "" },
      ...warehouses.value.map((item) => ({
        label: `${item.warehouseName}${item.areaName ? ` · ${item.areaName}` : ""}`,
        value: item.warehouseId,
      })),
    ]);

    const alertTypeOptions = [{ label: "全部", value: "" }, ...ALERT_TYPE_OPTIONS];

    const levelOptions = [
      { label: "全部", value: "" },
      { label: "一级", value: 1 },
      { label: "二级", value: 2 },
      { label: "三级", value: 3 },
      { label: "四级", value: 4 },
    ];

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: () => {
        pageNumber.value = 1;
        tableApi.query();
      },
      handleReset: () => {
        status.value = undefined;
        pageNumber.value = 1;
        tableApi.query();
      },
      schema: [
        {
          component: Select,
          label: "告警类型",
          fieldName: "alertType",
          defaultValue: "",
          componentProps: {
            options: alertTypeOptions,
            styles: { width: "150px" },
          },
        },
        {
          component: Select,
          label: "等级",
          fieldName: "level",
          defaultValue: "",
          componentProps: {
            options: levelOptions,
            styles: { width: "120px" },
          },
        },
        {
          component: Select,
          label: "仓房",
          fieldName: "warehouseId",
          defaultValue: "",
          componentProps: {
            options: warehouseOptions.value,
            styles: { width: "220px" },
          },
        },
        {
          component: DateRangePicker,
          label: "时间",
          fieldName: "period",
          defaultValue: null,
          componentProps: {
            valueFormat: "YYYY-MM-DD",
            styles: { width: "300px" },
          },
        },
      ],
      showCollapseButton: true,
    });

    const readPeriod = (): [string | undefined, string | undefined] => {
      const period = formApi.formValues.period;
      if (!Array.isArray(period)) {
        return [undefined, undefined];
      }
      return [period[0] ? String(period[0]) : undefined, period[1] ? String(period[1]) : undefined];
    };

    const toAlertBoundary = (value: string, boundary: "begin" | "end"): string => {
      if (value.includes("T")) {
        return value;
      }
      if (value.includes(" ")) {
        return value.replace(" ", "T");
      }
      return boundary === "begin" ? `${value}T00:00:00` : `${value}T23:59:59`;
    };

    const readLevel = (): 1 | 2 | 3 | 4 | undefined => {
      const value = formApi.formValues.level;
      if (value === undefined || value === null || value === "") {
        return undefined;
      }
      const numericValue = Number(value);
      return [1, 2, 3, 4].includes(numericValue) ? (numericValue as 1 | 2 | 3 | 4) : undefined;
    };

    const query = computed<GrainAlertPageQuery>(() => {
      const [begin, end] = readPeriod();
      const warehouseValue = formApi.formValues.warehouseId;
      const alertTypeValue = formApi.formValues.alertType;
      const level = readLevel();
      const params: GrainAlertPageQuery = {
        pageNumber: pageNumber.value,
        pageSize: pageSize.value,
      };
      if (status.value) {
        params.status = status.value;
      } else {
        params.tab = "ALL";
      }
      if (warehouseValue) {
        params.warehouseId = String(warehouseValue);
      }
      if (alertTypeValue) {
        params.alertType = alertTypeValue as GrainAlertType;
      }
      if (level !== undefined) {
        params.level = level;
      }
      if (begin) {
        params.begin = toAlertBoundary(begin, "begin");
      }
      if (end) {
        params.end = toAlertBoundary(end, "end");
      }
      return params;
    });

    const updateWarehouseFieldSchema = (): void => {
      formApi.updateFieldSchema({
        component: Select,
        label: "仓房",
        fieldName: "warehouseId",
        defaultValue: "",
        componentProps: {
          options: warehouseOptions.value,
          styles: { width: "220px" },
        },
      });
    };

    const statusTabs = computed(() => [
      { label: "全部", key: "ALL", count: alerts.value?.tabCounts?.ALL ?? 0 },
      ...PRIMARY_ALERT_STATUSES.map((value) => ({
        label: ALERT_STATUS_LABEL[value],
        key: value,
        count: alerts.value?.tabCounts?.[value] ?? 0,
      })),
    ]);
    const activeStatusKey = computed(() => status.value ?? "ALL");

    const actionText = (record: GrainAlertListItem): string => {
      if (record.status === GrainAlertStatus.PENDING) {
        return "确认";
      }
      if (record.status === GrainAlertStatus.PROCESSING || record.status === GrainAlertStatus.REVIEWING) {
        return "处置";
      }
      if (record.status === GrainAlertStatus.CHECKING) {
        return "验收";
      }
      return "查看";
    };

    const openAlert = (record: GrainAlertListItem): void => {
      if (record.status === GrainAlertStatus.PROCESSING || record.status === GrainAlertStatus.REVIEWING) {
        void router.push({ name: "intelligent-grain-alert-disposal", params: { id: record.id } });
        return;
      }
      if (record.status === GrainAlertStatus.CHECKING) {
        void router.push({ name: "intelligent-grain-alert-acceptance", params: { id: record.id } });
        return;
      }
      void router.push({ name: "intelligent-grain-alert-detail", params: { id: record.id } });
    };

    const columns: ColumnType<GrainAlertListItem>[] = [
      ...alertColumns,
      {
        title: "操作",
        dataIndex: "id",
        width: 120,
        customRender: ({ record }: { record: GrainAlertListItem }) => (
          <Button type="link" size="small" onClick={() => openAlert(record)}>
            {actionText(record)}
          </Button>
        ),
      },
    ];

    const emptyAlertPage = (): GrainAlertPageResult => ({
      total: 0,
      pages: 0,
      records: [],
      tabCounts: alerts.value?.tabCounts ?? {},
    });

    const loadWarehouses = async (): Promise<void> => {
      try {
        const warehouseData = await useAuthRequest(() => listIntelligentGrainWarehouseOptions());
        warehouses.value = warehouseData;
        updateWarehouseFieldSchema();
      } catch (error) {
        message.error((error as Error).message || "加载仓房列表失败");
      }
    };

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: "id",
      tableCode: "INTELLIGENT_GRAIN_ALERTS",
      fetchApi: async () => {
        try {
          return await useAuthRequest(() => pageIntelligentGrainAlerts(query.value));
        } catch (error) {
          message.error((error as Error).message || "加载告警中心失败");
          return emptyAlertPage();
        }
      },
      fetchLoaded: (data) => {
        alerts.value = data as GrainAlertPageResult;
      },
    });

    const handleExportAlerts = async (): Promise<void> => {
      exporting.value = true;
      try {
        const blob = await useAuthRequest(() => exportIntelligentGrainAlerts({ ...query.value, pageSize: 1000 }));
        downloadBlob(blob, `粮情告警-${dayjs().format("YYYYMMDDHHmm")}.xlsx`);
      } catch (error) {
        message.error((error as Error).message || "导出告警失败");
      } finally {
        exporting.value = false;
      }
    };

    const search = (): void => {
      pageNumber.value = 1;
      tableApi.query();
    };

    const handleStatusTabChange = (key: string | number): void => {
      status.value = key === "ALL" ? undefined : (key as GrainAlertStatus);
      search();
    };

    const handlePageChange = (current: number, size: number): void => {
      pageNumber.value = current;
      pageSize.value = size;
      tableApi.query();
    };

    onMounted(() => {
      void loadWarehouses();
    });

    const slots = {
      "layout-header": (): JSX.Element => (
        <Space>
          <Button
            onClick={() => {
              void loadWarehouses();
              tableApi.query();
            }}
          >
            刷新
          </Button>
          <Button type="primary" loading={exporting.value} onClick={handleExportAlerts}>
            导出Excel
          </Button>
        </Space>
      ),
      "layout-content": (): JSX.Element => (
        <div class="ig-page ig-alert-list-page">
          <Tabs class="ig-alert-tabs" activeKey={activeStatusKey.value} hideAdd type="card" onChange={handleStatusTabChange}>
            {statusTabs.value.map((item) => (
              <TabPane key={item.key} tab={`${item.label}(${item.count})`}>
                {activeStatusKey.value === item.key ? (
                  <div class="ig-alert-tab-content">
                    <CubeForm />
                    <section class="ig-alert-table">
                      <CubeTable />
                    </section>
                  </div>
                ) : null}
              </TabPane>
            ))}
          </Tabs>
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          current={pageNumber.value}
          pageSize={pageSize.value}
          total={alerts.value?.total ?? 0}
          showQuickJumper={false}
          showSizeChanger
          showTotal={(total: number) => `共 ${total} 条数据`}
          pageSizeOptions={["10", "20", "50", "100"]}
          onPageChange={handlePageChange}
          onShowSizeChange={handlePageChange}
        />
      ),
    };

    return (): JSX.Element => <CubeLayout title="告警列表" v-slots={slots} showTableXScroll />;
  },
});
