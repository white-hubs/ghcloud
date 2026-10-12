import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import type { JSX } from "vue/jsx-runtime";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { Pagination } from "@ghcloud/cube-service-interface/base";
import {
  GrainColorOdorStatus,
  type GrainQualityRecord,
  type GrainQualityRecordPageQuery,
  type GrainQualityRecordPayload,
  type GrainVarietyOption,
  type GrainWarehouseOption,
} from "@ghcloud/cube-service-interface/intelligent-grain";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import {
  createIntelligentGrainQualityRecord,
  deleteIntelligentGrainQualityRecord,
  exportIntelligentGrainQualityRecords,
  listIntelligentGrainGlobalVarietyOptions,
  listIntelligentGrainWarehouseOptions,
  pageIntelligentGrainQualityRecords,
  updateIntelligentGrainQualityRecord,
} from "@ghcloud/cube-services-client/intelligent-grain.client";
import {
  Button,
  DatePicker,
  DateRangePicker,
  Input,
  InputNumber,
  Modal,
  Page,
  Select,
  Space,
  Tag,
  Textarea,
  message,
  type ColumnType,
} from "@ghcloud/cube-ui";

import { downloadBlob, formatTime } from "@/views/shared/view-utils";

import "@/views/shared/intelligent-grain.less";

interface QualityRecordQueryState extends GrainQualityRecordPageQuery {
  period?: string[];
}

interface QualityRecordFormState {
  warehouseId?: string;
  inspectionDate?: string;
  moisture?: number | null;
  fattyAcid?: number | null;
  germinationRate?: number | null;
  impurityRate?: number | null;
  imperfectGrainRate?: number | null;
  yellowRiceRate?: number | null;
  colorOdor: GrainColorOdorStatus;
  inspector: string;
  remark: string;
}

type SelectOption = { label: string; value: string | number };

const colorOdorOptions = [
  { label: "正常", value: GrainColorOdorStatus.NORMAL },
  { label: "轻微异常", value: GrainColorOdorStatus.SLIGHT_ABNORMAL },
  { label: "异常", value: GrainColorOdorStatus.ABNORMAL },
];

const colorOdorColor: Record<GrainColorOdorStatus, string> = {
  [GrainColorOdorStatus.NORMAL]: "green",
  [GrainColorOdorStatus.SLIGHT_ABNORMAL]: "orange",
  [GrainColorOdorStatus.ABNORMAL]: "red",
};

const createDefaultForm = (): QualityRecordFormState => ({
  warehouseId: undefined,
  inspectionDate: undefined,
  moisture: null,
  fattyAcid: null,
  germinationRate: null,
  impurityRate: null,
  imperfectGrainRate: null,
  yellowRiceRate: null,
  colorOdor: GrainColorOdorStatus.NORMAL,
  inspector: "",
  remark: "",
});

const dateOnly = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }
  return value.slice(0, 10);
};

const nullableNumber = (value?: number | null): number | null => {
  return value === undefined || value === null || Number.isNaN(Number(value)) ? null : Number(value);
};

const nullableText = (value?: string | null): string | null => {
  const text = value?.trim();
  return text ? text : null;
};

const numberText = (value?: number | null): string => {
  return value === undefined || value === null ? "--" : String(value);
};

const colorOdorLabel = (value?: GrainColorOdorStatus | null, fallback?: string | null): string => {
  return colorOdorOptions.find((item) => item.value === value)?.label ?? fallback ?? "--";
};

export const IntelligentGrainQualityRecords = defineComponent({
  name: "IntelligentGrainQualityRecords",
  setup: () => {
    const total = ref(0);
    const exporting = ref(false);
    const modalVisible = ref(false);
    const modalSaving = ref(false);
    const editingRecordId = ref<string>();
    const warehouseOptions = ref<GrainWarehouseOption[]>([]);
    const varietyOptions = ref<GrainVarietyOption[]>([]);
    const query = reactive<QualityRecordQueryState>({
      pageNumber: 1,
      pageSize: 20,
      warehouseId: "",
      grainVarietyId: "",
      period: [],
    });
    const form = reactive<QualityRecordFormState>(createDefaultForm());
    const modalTitle = computed(() => (editingRecordId.value ? "编辑品质数据" : "新增品质数据"));
    const warehouseSelectOptions = computed<SelectOption[]>(() => [
      { label: "全部仓房", value: "" },
      ...warehouseOptions.value.map((item) => ({ label: item.warehouseName, value: item.warehouseId })),
    ]);
    const qualityWarehouseOptions = computed<SelectOption[]>(() =>
      warehouseOptions.value.map((item) => ({ label: item.warehouseName, value: item.warehouseId })),
    );
    const grainVarietyOptions = computed<SelectOption[]>(() => [
      { label: "全部品种", value: "" },
      ...varietyOptions.value.map((item) => ({ label: item.varietyName, value: item.varietyId })),
    ]);

    const buildQuery = (): GrainQualityRecordPageQuery => {
      const payload: GrainQualityRecordPageQuery = {
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
      };
      if (query.warehouseId) {
        payload.warehouseId = query.warehouseId;
      }
      if (query.grainVarietyId) {
        payload.grainVarietyId = query.grainVarietyId;
      }
      if (query.period?.[0]) {
        payload.beginDate = query.period[0];
      }
      if (query.period?.[1]) {
        payload.endDate = query.period[1];
      }
      return payload;
    };

    const emptyPage = (): Pagination<GrainQualityRecord> => ({
      total: 0,
      pages: 0,
      records: [],
    });

    const updateSearchSchemas = (): void => {
      formApi.updateFieldSchema({
        component: Select,
        label: "仓房",
        fieldName: "warehouseId",
        defaultValue: "",
        componentProps: {
          showSearch: true,
          filterOption: (input: string, option: { label?: string }) => (option.label ?? "").toLowerCase().includes(input.toLowerCase()),
          options: warehouseSelectOptions.value,
        },
      });
      formApi.updateFieldSchema({
        component: Select,
        label: "品种",
        fieldName: "grainVarietyId",
        defaultValue: "",
        componentProps: {
          options: grainVarietyOptions.value,
        },
      });
    };

    const loadOptions = async (): Promise<void> => {
      try {
        const [warehouses, varieties] = await Promise.all([
          useAuthRequest(() => listIntelligentGrainWarehouseOptions()),
          useAuthRequest(() => listIntelligentGrainGlobalVarietyOptions()),
        ]);
        warehouseOptions.value = warehouses;
        varietyOptions.value = varieties;
        updateSearchSchemas();
      } catch (error) {
        message.error((error as Error).message || "加载筛选项失败");
      }
    };

    const [CubeForm, formApi] = useCubeForm({
      syncStateRef: query,
      layout: "horizontal",
      handleSubmit: (data) => {
        query.pageNumber = 1;
        query.warehouseId = data.warehouseId ? String(data.warehouseId) : "";
        query.grainVarietyId = data.grainVarietyId ? String(data.grainVarietyId) : "";
        query.period = Array.isArray(data.period) ? data.period.map(String) : [];
        tableApi.query();
      },
      handleReset: () => {
        query.pageNumber = 1;
        query.warehouseId = "";
        query.grainVarietyId = "";
        query.period = [];
        tableApi.query();
      },
      schema: [
        {
          component: Select,
          label: "仓房",
          fieldName: "warehouseId",
          defaultValue: "",
          componentProps: {
            options: warehouseSelectOptions.value,
          },
        },
        {
          component: Select,
          label: "品种",
          fieldName: "grainVarietyId",
          defaultValue: "",
          componentProps: {
            options: grainVarietyOptions.value,
          },
        },
        {
          component: DateRangePicker,
          label: "检测日期",
          fieldName: "period",
          defaultValue: [],
          componentProps: {
            valueFormat: "YYYY-MM-DD",
            styles: { width: "260px" },
          },
        },
      ],
      showCollapseButton: true,
    });

    const columns: ColumnType<GrainQualityRecord>[] = [
      { title: "仓房名称", dataIndex: "warehouseName", width: 150, customRender: ({ text }: { text?: string }) => text || "--" },
      { title: "品种", dataIndex: "grainVarietyName", width: 110, customRender: ({ text }: { text?: string }) => text || "--" },
      { title: "入库时间", dataIndex: "inboundDate", width: 120, customRender: ({ text }: { text?: string }) => text || "--" },
      {
        title: "检测日期",
        dataIndex: "inspectionTime",
        width: 130,
        customRender: ({ text }: { text?: string }) => dateOnly(text) ?? "--",
      },
      { title: "水分(%)", dataIndex: "moisture", width: 100, customRender: ({ text }: { text?: number }) => numberText(text) },
      { title: "脂肪酸值", dataIndex: "fattyAcid", width: 110, customRender: ({ text }: { text?: number }) => numberText(text) },
      { title: "发芽率(%)", dataIndex: "germinationRate", width: 110, customRender: ({ text }: { text?: number }) => numberText(text) },
      { title: "杂质率(%)", dataIndex: "impurityRate", width: 110, customRender: ({ text }: { text?: number }) => numberText(text) },
      {
        title: "不完善粒(%)",
        dataIndex: "imperfectGrainRate",
        width: 120,
        customRender: ({ text }: { text?: number }) => numberText(text),
      },
      { title: "黄粒米(%)", dataIndex: "yellowRiceRate", width: 110, customRender: ({ text }: { text?: number }) => numberText(text) },
      {
        title: "色泽气味",
        dataIndex: "colorOdor",
        width: 120,
        customRender: ({ record }: { record: GrainQualityRecord }) => {
          const status = record.colorOdor ?? GrainColorOdorStatus.NORMAL;
          return <Tag color={colorOdorColor[status]}>{colorOdorLabel(record.colorOdor, record.colorOdorName)}</Tag>;
        },
      },
      { title: "检测人", dataIndex: "inspector", width: 110, customRender: ({ text }: { text?: string }) => text || "--" },
      { title: "更新时间", dataIndex: "updateTime", width: 160, customRender: ({ text }: { text?: string }) => formatTime(text) },
      {
        title: "操作",
        dataIndex: "action",
        width: 140,
        fixed: "right",
        customRender: ({ record }: { record: GrainQualityRecord }) => (
          <Space>
            <Button type="link" size="small" onClick={() => openEditModal(record)}>
              编辑
            </Button>
            <Button type="link" size="small" danger onClick={() => void deleteRecord(record)}>
              删除
            </Button>
          </Space>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      autoFetch: false,
      columns,
      rowKey: "recordId",
      tableCode: "INTELLIGENT_GRAIN_QUALITY_RECORDS",
      fetchApi: async () => {
        try {
          return await useAuthRequest(() => pageIntelligentGrainQualityRecords(buildQuery()));
        } catch (error) {
          message.error((error as Error).message || "加载品质数据失败");
          return emptyPage();
        }
      },
      fetchLoaded: (data) => {
        total.value = data.total ?? 0;
      },
    });

    const resetForm = (record?: GrainQualityRecord): void => {
      Object.assign(form, createDefaultForm(), {
        warehouseId: record?.warehouseId ?? undefined,
        inspectionDate: dateOnly(record?.inspectionTime),
        moisture: record?.moisture ?? null,
        fattyAcid: record?.fattyAcid ?? null,
        germinationRate: record?.germinationRate ?? null,
        impurityRate: record?.impurityRate ?? null,
        imperfectGrainRate: record?.imperfectGrainRate ?? null,
        yellowRiceRate: record?.yellowRiceRate ?? null,
        colorOdor: record?.colorOdor ?? GrainColorOdorStatus.NORMAL,
        inspector: record?.inspector ?? "",
        remark: record?.remark ?? "",
      });
    };

    const openCreateModal = (): void => {
      editingRecordId.value = undefined;
      resetForm();
      modalVisible.value = true;
    };

    function openEditModal(record: GrainQualityRecord): void {
      editingRecordId.value = record.recordId;
      resetForm(record);
      modalVisible.value = true;
    }

    const toPayload = (): GrainQualityRecordPayload => ({
      warehouseId: form.warehouseId as string,
      inspectionTime: `${form.inspectionDate}T00:00:00`,
      moisture: nullableNumber(form.moisture),
      fattyAcid: nullableNumber(form.fattyAcid),
      germinationRate: nullableNumber(form.germinationRate),
      impurityRate: nullableNumber(form.impurityRate),
      imperfectGrainRate: nullableNumber(form.imperfectGrainRate),
      yellowRiceRate: nullableNumber(form.yellowRiceRate),
      colorOdor: form.colorOdor,
      inspector: nullableText(form.inspector),
      remark: nullableText(form.remark),
    });

    const saveRecord = async (): Promise<void> => {
      if (!form.warehouseId) {
        message.warning("请选择仓房");
        return;
      }
      if (!form.inspectionDate) {
        message.warning("请选择检测日期");
        return;
      }
      modalSaving.value = true;
      try {
        const payload = toPayload();
        if (editingRecordId.value) {
          await useAuthRequest(() => updateIntelligentGrainQualityRecord(editingRecordId.value as string, payload));
          message.success("品质数据已更新");
        } else {
          await useAuthRequest(() => createIntelligentGrainQualityRecord(payload));
          message.success("品质数据已新增");
        }
        modalVisible.value = false;
        tableApi.query();
      } catch (error) {
        message.error((error as Error).message || "保存品质数据失败");
      } finally {
        modalSaving.value = false;
      }
    };

    const deleteRecord = async (record: GrainQualityRecord): Promise<void> => {
      if (!window.confirm(`确认删除「${record.warehouseName ?? "该仓房"}」的品质数据？`)) {
        return;
      }
      try {
        await useAuthRequest(() => deleteIntelligentGrainQualityRecord(record.recordId));
        message.success("品质数据已删除");
        tableApi.query();
      } catch (error) {
        message.error((error as Error).message || "删除品质数据失败");
      }
    };

    const exportRecords = async (): Promise<void> => {
      exporting.value = true;
      try {
        const blob = await useAuthRequest(() => exportIntelligentGrainQualityRecords(buildQuery()));
        downloadBlob(blob, "品质录入.xlsx");
      } catch (error) {
        message.error((error as Error).message || "导出品质数据失败");
      } finally {
        exporting.value = false;
      }
    };

    const handlePageChange = (current: number, size: number): void => {
      query.pageNumber = current;
      query.pageSize = size;
      tableApi.query();
    };

    const renderModal = (): JSX.Element => (
      <Modal
        v-model:visible={modalVisible.value}
        title={modalTitle.value}
        width="760px"
        destroyOnClose
        confirmLoading={modalSaving.value}
        onOk={() => void saveRecord()}
        onCancel={() => {
          modalVisible.value = false;
        }}
      >
        <div class="ig-quality-modal">
          <label class="ig-quality-modal-field">
            <span>
              仓房 <i>*</i>
            </span>
            <Select
              v-model:value={form.warehouseId}
              options={qualityWarehouseOptions.value}
              placeholder="请选择仓房"
              showSearch
              filterOption={(input: string, option: { label?: string }) => (option.label ?? "").toLowerCase().includes(input.toLowerCase())}
              style={{ width: "100%" }}
            />
          </label>
          <label class="ig-quality-modal-field">
            <span>
              检测日期 <i>*</i>
            </span>
            <DatePicker v-model:value={form.inspectionDate} valueFormat="YYYY-MM-DD" style={{ width: "100%" }} />
          </label>
          <label class="ig-quality-modal-field">
            <span>水分(%)</span>
            <InputNumber v-model:value={form.moisture} min={0} precision={2} placeholder="请输入水分" style={{ width: "100%" }} />
          </label>
          <label class="ig-quality-modal-field">
            <span>脂肪酸值</span>
            <InputNumber v-model:value={form.fattyAcid} min={0} precision={2} placeholder="请输入脂肪酸值" style={{ width: "100%" }} />
          </label>
          <label class="ig-quality-modal-field">
            <span>发芽率(%)</span>
            <InputNumber
              v-model:value={form.germinationRate}
              min={0}
              max={100}
              precision={2}
              placeholder="请输入发芽率"
              style={{ width: "100%" }}
            />
          </label>
          <label class="ig-quality-modal-field">
            <span>杂质率(%)</span>
            <InputNumber
              v-model:value={form.impurityRate}
              min={0}
              max={100}
              precision={2}
              placeholder="请输入杂质率"
              style={{ width: "100%" }}
            />
          </label>
          <label class="ig-quality-modal-field">
            <span>不完善粒(%)</span>
            <InputNumber
              v-model:value={form.imperfectGrainRate}
              min={0}
              max={100}
              precision={2}
              placeholder="请输入不完善粒"
              style={{ width: "100%" }}
            />
          </label>
          <label class="ig-quality-modal-field">
            <span>黄粒米(%)</span>
            <InputNumber
              v-model:value={form.yellowRiceRate}
              min={0}
              max={100}
              precision={2}
              placeholder="请输入黄粒米"
              style={{ width: "100%" }}
            />
          </label>
          <label class="ig-quality-modal-field">
            <span>色泽气味</span>
            <Select v-model:value={form.colorOdor} options={colorOdorOptions} style={{ width: "100%" }} />
          </label>
          <label class="ig-quality-modal-field">
            <span>检测人</span>
            <Input v-model:value={form.inspector} placeholder="请输入检测人" />
          </label>
          <label class="ig-quality-modal-field is-full">
            <span>备注</span>
            <Textarea v-model:value={form.remark} rows={3} placeholder="请输入备注" />
          </label>
        </div>
      </Modal>
    );

    onMounted(() => {
      void loadOptions();
      tableApi.query();
    });

    const slots = {
      "layout-header": (): JSX.Element => (
        <Space>
          <Button loading={exporting.value} onClick={() => void exportRecords()}>
            导出
          </Button>
          <Button type="primary" onClick={openCreateModal}>
            新增品质数据
          </Button>
        </Space>
      ),
      "layout-content": (): JSX.Element => (
        <div class="ig-page ig-quality-page">
          <div class="ig-quality-note">
            <strong>说明：</strong>
            <span>脂肪酸值、水分、发芽率等检测指标由化验室检测后人工录入，用于粮情档案品质预测校准。</span>
          </div>
          <CubeForm />
          <section class="table-wrap">
            <CubeTable />
          </section>
          {renderModal()}
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          current={query.pageNumber}
          pageSize={query.pageSize}
          total={total.value}
          showQuickJumper={false}
          showSizeChanger
          showTotal={(count: number) => `共 ${count} 条数据`}
          pageSizeOptions={["10", "20", "50", "100"]}
          onPageChange={handlePageChange}
          onShowSizeChange={handlePageChange}
        />
      ),
    };

    return (): JSX.Element => <CubeLayout title="品质录入" v-slots={slots} showTableXScroll />;
  },
});
