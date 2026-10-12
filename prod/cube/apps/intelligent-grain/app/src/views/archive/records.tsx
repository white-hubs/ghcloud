import dayjs from "dayjs";
import { computed, defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { Pagination } from "@ghcloud/cube-service-interface/base";
import { GrainDimension, type GrainArchiveRecord } from "@ghcloud/cube-service-interface/intelligent-grain";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import {
  exportIntelligentGrainArchiveRecords,
  pageIntelligentGrainArchiveRecords,
} from "@ghcloud/cube-services-client/intelligent-grain.client";
import { Button, DateRangePicker, Page, Select, Space, message, type ColumnType } from "@ghcloud/cube-ui";

import { useArchiveWarehouse } from "@/views/archive/use-archive-warehouse";
import { downloadBlob } from "@/views/shared/view-utils";

import "@/views/shared/intelligent-grain.less";

interface RecordDimensionOption {
  label: string;
  value: GrainDimension;
  metric: string;
}

const RECORD_DIMENSIONS: RecordDimensionOption[] = [
  { label: "温度", value: GrainDimension.TEMPERATURE, metric: "TEMP_MAX" },
  { label: "储量", value: GrainDimension.STORAGE, metric: "WEIGHT" },
  { label: "湿度", value: GrainDimension.HUMIDITY, metric: "HUMIDITY" },
  { label: "气体", value: GrainDimension.GAS, metric: "CO2" },
];

const WAREHOUSE_SELECT_STYLE = { width: "220px", maxWidth: "100%" };

function formatRecordTime(value?: string): string {
  if (!value) {
    return "--";
  }
  const time = dayjs(value);
  return time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : value;
}

function formatRecordValue(record: GrainArchiveRecord): string {
  if (record.value === undefined || record.value === null) {
    return "--";
  }
  return String(record.value);
}

function readDateOnly(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return String(value).slice(0, 10);
}

export const IntelligentGrainArchiveRecords = defineComponent({
  name: "IntelligentGrainArchiveRecords",
  setup: () => {
    const router = useRouter();
    const exporting = ref(false);
    const records = ref<Pagination<GrainArchiveRecord>>();
    const defaultBeginDate = dayjs().subtract(30, "day").format("YYYY-MM-DD");
    const defaultEndDate = dayjs().format("YYYY-MM-DD");
    const dimension = ref<GrainDimension>(GrainDimension.TEMPERATURE);
    const beginDate = ref(defaultBeginDate);
    const endDate = ref(defaultEndDate);
    const pageNumber = ref(1);
    const pageSize = ref(20);
    const { warehouseOptions, selectedWarehouse, selectedWarehouseId, loadWarehouses, changeWarehouse } = useArchiveWarehouse();

    const warehouseFormOptions = computed(() =>
      warehouseOptions.value.map((item) => ({
        label: `${item.warehouseName}${item.areaName ? ` · ${item.areaName}` : ""}${item.grainType ? ` · ${item.grainType}` : ""}`,
        value: item.warehouseId,
      })),
    );
    const dimensionOptions = computed(() => RECORD_DIMENSIONS.map((item) => ({ label: item.label, value: item.value })));
    const activeDimension = computed(() => RECORD_DIMENSIONS.find((item) => item.value === dimension.value) ?? RECORD_DIMENSIONS[0]);
    const pageTitle = computed(() => `${selectedWarehouse.value?.warehouseName || "仓房"} · 数据明细`);

    const columns: ColumnType<GrainArchiveRecord>[] = [
      { title: "采集时间", dataIndex: "collectTime", customRender: ({ text }: { text?: string }) => formatRecordTime(text) },
      {
        title: "数值",
        dataIndex: "value",
        customRender: ({ record }: { record: GrainArchiveRecord }) => formatRecordValue(record),
      },
      {
        title: "采集设备",
        dataIndex: "deviceName",
        customRender: ({ record }: { record: GrainArchiveRecord }) => record.deviceName || record.deviceId || "--",
      },
      { title: "单位", dataIndex: "unit", customRender: ({ text }: { text?: string }) => text || "--" },
    ];

    const applySearchValues = (values: Record<string, unknown>): void => {
      dimension.value = (values.dimension as GrainDimension | undefined) ?? GrainDimension.TEMPERATURE;
      const period = Array.isArray(values.period) ? values.period : [];
      beginDate.value = readDateOnly(period[0]) ?? defaultBeginDate;
      endDate.value = readDateOnly(period[1]) ?? defaultEndDate;
    };

    const queryRecords = (warehouseId = selectedWarehouseId.value): void => {
      if (warehouseId && warehouseId !== selectedWarehouseId.value) {
        void changeWarehouse(warehouseId).then(() => tableApi.query());
        return;
      }
      tableApi.query();
    };

    let recordsFormApi: ReturnType<typeof useCubeForm>[1] | undefined;

    const updateWarehouseFieldSchema = (): void => {
      recordsFormApi?.updateFieldSchema({
        component: Select,
        label: "仓房",
        fieldName: "warehouseId",
        defaultValue: "",
        componentProps: {
          showSearch: true,
          filterOption: (input: string, option: { label?: string }) => (option.label ?? "").toLowerCase().includes(input.toLowerCase()),
          options: warehouseFormOptions.value,
          styles: WAREHOUSE_SELECT_STYLE,
        },
      });
    };

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: (values) => {
        applySearchValues(values);
        pageNumber.value = 1;
        queryRecords(values.warehouseId ? String(values.warehouseId) : selectedWarehouseId.value);
      },
      handleReset: () => {
        dimension.value = GrainDimension.TEMPERATURE;
        beginDate.value = defaultBeginDate;
        endDate.value = defaultEndDate;
        pageNumber.value = 1;
        const warehouseId = warehouseOptions.value[0]?.warehouseId;
        recordsFormApi?.setFieldValue("warehouseId", warehouseId ?? "");
        queryRecords(warehouseId);
      },
      schema: [
        {
          component: Select,
          label: "仓房",
          fieldName: "warehouseId",
          defaultValue: "",
          componentProps: {
            showSearch: true,
            filterOption: (input: string, option: { label?: string }) => (option.label ?? "").toLowerCase().includes(input.toLowerCase()),
            options: warehouseFormOptions.value,
            styles: WAREHOUSE_SELECT_STYLE,
          },
        },
        {
          component: Select,
          label: "维度",
          fieldName: "dimension",
          defaultValue: GrainDimension.TEMPERATURE,
          componentProps: {
            options: dimensionOptions.value,
          },
        },
        {
          component: DateRangePicker,
          label: "日期",
          fieldName: "period",
          defaultValue: [defaultBeginDate, defaultEndDate],
          componentProps: {
            allowClear: false,
            valueFormat: "YYYY-MM-DD",
            styles: { width: "300px" },
          },
        },
      ],
      showCollapseButton: true,
    });
    recordsFormApi = formApi;

    const emptyRecords = (): Pagination<GrainArchiveRecord> => ({
      total: 0,
      pages: 0,
      records: [],
    });

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: "collectTime",
      tableCode: "INTELLIGENT_GRAIN_ARCHIVE_RECORDS",
      autoFetch: false,
      fetchApi: async () => {
        const warehouseId = selectedWarehouseId.value;
        if (!warehouseId) {
          records.value = undefined;
          return emptyRecords();
        }
        try {
          return await useAuthRequest(() =>
            pageIntelligentGrainArchiveRecords(warehouseId, {
              pageNumber: pageNumber.value,
              pageSize: pageSize.value,
              dimension: dimension.value,
              metric: activeDimension.value.metric,
              begin: `${beginDate.value}T00:00:00`,
              end: `${endDate.value}T23:59:59`,
            }),
          );
        } catch (error) {
          message.error((error as Error).message || "加载数据明细失败");
          return emptyRecords();
        }
      },
      fetchLoaded: (data) => {
        records.value = data as Pagination<GrainArchiveRecord>;
      },
    });

    const handlePageChange = (current: number, size: number): void => {
      pageNumber.value = current;
      pageSize.value = size;
      tableApi.query();
    };

    const handleExport = async (): Promise<void> => {
      if (!selectedWarehouseId.value) {
        message.warning("请选择仓房");
        return;
      }
      const warehouseId = selectedWarehouseId.value;
      exporting.value = true;
      try {
        const blob = await useAuthRequest(() =>
          exportIntelligentGrainArchiveRecords(warehouseId, {
            pageNumber: 1,
            pageSize: 1000,
            dimension: dimension.value,
            metric: activeDimension.value.metric,
            begin: `${beginDate.value}T00:00:00`,
            end: `${endDate.value}T23:59:59`,
          }),
        );
        downloadBlob(
          blob,
          `${selectedWarehouse.value?.warehouseName || "粮情"}-${activeDimension.value.label}明细-${dayjs().format("YYYYMMDDHHmm")}.xlsx`,
        );
      } catch (error) {
        message.error((error as Error).message || "导出数据明细失败");
      } finally {
        exporting.value = false;
      }
    };

    onMounted(() => {
      void loadWarehouses()
        .then((warehouseId) => {
          updateWarehouseFieldSchema();
          recordsFormApi?.setFieldValue("warehouseId", warehouseId ?? "");
          tableApi.query();
        })
        .catch((error: unknown) => {
          message.error((error as Error).message || "加载仓房列表失败");
        });
    });

    const slots = {
      "layout-header": (): JSX.Element => (
        <Space>
          <Button onClick={() => tableApi.query()}>刷新</Button>
          <Button
            onClick={() => router.push({ name: "intelligent-grain-archive-detail", query: { warehouseId: selectedWarehouseId.value } })}
          >
            档案详情
          </Button>
          <Button
            onClick={() => router.push({ name: "intelligent-grain-archive-trend", query: { warehouseId: selectedWarehouseId.value } })}
          >
            趋势曲线
          </Button>
        </Space>
      ),
      "layout-content": (): JSX.Element => (
        <div class="ig-page ig-record-page">
          <section class="ig-record-panel">
            <div class="ig-record-toolbar">
              <div class="ig-record-title">
                <strong>{pageTitle.value}</strong>
                <span>{activeDimension.value.label}</span>
              </div>
              <Button loading={exporting.value} onClick={handleExport}>
                导出Excel
              </Button>
            </div>
            <CubeForm />
            <div class="ig-record-table">
              <CubeTable />
            </div>
          </section>
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          current={pageNumber.value}
          pageSize={pageSize.value}
          total={records.value?.total ?? 0}
          showQuickJumper={false}
          showSizeChanger
          showTotal={(total: number) => `共 ${total} 条数据`}
          pageSizeOptions={["10", "20", "50", "100"]}
          onPageChange={handlePageChange}
          onShowSizeChange={handlePageChange}
        />
      ),
    };

    return (): JSX.Element => <CubeLayout title="数据明细" v-slots={slots} showTableXScroll />;
  },
});
