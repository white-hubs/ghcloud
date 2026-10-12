import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { JSX } from "vue/jsx-runtime";

import { CubeLayout, apiProxy } from "@ghcloud/cube-app-design";
import {
  GrainDimension,
  GrainWarehouseType,
  type GrainVarietyOption,
  type GrainWarehouseDeviceBinding,
  type GrainWarehouseDeviceBindingPayload,
  type GrainWarehousePayload,
} from "@ghcloud/cube-service-interface/intelligent-grain";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import {
  createIntelligentGrainWarehouse,
  getIntelligentGrainWarehouse,
  listIntelligentGrainGlobalVarietyOptions,
  updateIntelligentGrainWarehouse,
} from "@ghcloud/cube-services-client/intelligent-grain.client";
import {
  Button,
  DatePicker,
  Input,
  InputNumber,
  Modal,
  Page,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
  type ColumnType,
} from "@ghcloud/cube-ui";

import "@/views/shared/intelligent-grain.less";

interface WarehouseFormState {
  warehouseCode: string;
  warehouseName: string;
  areaName: string;
  grainVarietyId?: string | null;
  warehouseType: GrainWarehouseType | "";
  capacityVolume?: number | null;
  capacityWeight?: number | null;
  inboundDate?: string | null;
  qualityGrade: string;
  enabled: boolean;
}

interface BindingRow {
  rowKey: string;
  bindingId?: string | undefined;
  deviceId: string;
  deviceNameSnapshot: string;
  metricDimension: GrainDimension;
  metricCode: string;
  metricName: string;
  propCode: string;
  unit: string;
  enabled: boolean;
  propOptions: PropOption[];
  propLoading?: boolean | undefined;
}

interface DeviceRow {
  id?: string;
  name?: string;
  code?: string;
  thirdPartyId?: string;
  productInfo?: {
    id?: string;
    name?: string;
    productCategory?: {
      name?: string;
    };
  };
  area?: {
    name?: string;
    pathName?: string;
  };
}

interface PropOption {
  label: string;
  value: string;
  unit?: string;
}

type SelectOption = { label: string; value: string | number | boolean };

const metricOptions = [
  { label: "最高粮温", value: "TEMP_MAX", dimension: GrainDimension.TEMPERATURE, dimensionLabel: "温度", unit: "°C" },
  { label: "储量", value: "WEIGHT", dimension: GrainDimension.STORAGE, dimensionLabel: "储量", unit: "t" },
  { label: "体积", value: "VOLUME", dimension: GrainDimension.STORAGE, dimensionLabel: "储量", unit: "m3" },
  { label: "湿度", value: "HUMIDITY", dimension: GrainDimension.HUMIDITY, dimensionLabel: "湿度", unit: "%" },
  { label: "CO2", value: "CO2", dimension: GrainDimension.GAS, dimensionLabel: "气体", unit: "ppm" },
  { label: "O2", value: "O2", dimension: GrainDimension.GAS, dimensionLabel: "气体", unit: "ppm" },
  { label: "H2S", value: "H2S", dimension: GrainDimension.GAS, dimensionLabel: "气体", unit: "ppm" },
];

const metricSelectOptions = metricOptions.map((item) => ({ label: item.label, value: item.value }));

const warehouseTypeOptions = [
  { label: "立筒仓", value: GrainWarehouseType.VERTICAL_SILO },
  { label: "浅圆仓", value: GrainWarehouseType.SHALLOW_ROUND },
  { label: "平房仓", value: GrainWarehouseType.FLAT_WAREHOUSE },
  { label: "其他", value: GrainWarehouseType.OTHER },
];

const createDefaultForm = (): WarehouseFormState => ({
  warehouseCode: "",
  warehouseName: "",
  areaName: "",
  grainVarietyId: null,
  warehouseType: "",
  capacityVolume: null,
  capacityWeight: null,
  inboundDate: null,
  qualityGrade: "",
  enabled: true,
});

const nullableText = (value?: string | null): string | null => {
  const text = value?.trim();
  return text ? text : null;
};

const nullableNumber = (value?: number | null): number | null => {
  return value === undefined || value === null || Number.isNaN(Number(value)) ? null : Number(value);
};

const nullableId = (value?: string | null): string | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const id = String(value).trim();
  return id ? id : null;
};

const toText = (value: unknown): string => {
  return value === undefined || value === null ? "" : String(value);
};

const createRowKey = (): string => `binding-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const metricSpec = (metricCode?: string): (typeof metricOptions)[number] => {
  return metricOptions.find((item) => item.value === metricCode) ?? metricOptions[0];
};

const dimensionLabel = (dimension?: GrainDimension): string => {
  return metricOptions.find((item) => item.dimension === dimension)?.dimensionLabel ?? "--";
};

const warehouseTypeCode = (value?: string | null): GrainWarehouseType | "" => {
  if (!value) {
    return "";
  }
  const text = value.trim();
  const byCode = warehouseTypeOptions.find((item) => item.value === text.toUpperCase());
  if (byCode) {
    return byCode.value;
  }
  return warehouseTypeOptions.find((item) => item.label === text)?.value ?? "";
};

const propOptionsFromRaw = (items: unknown[]): PropOption[] => {
  return items
    .map((item) => {
      const raw = item as Record<string, unknown>;
      const propCode = toText(raw.propCode);
      if (!propCode) {
        return null;
      }
      const propName = toText(raw.propName || raw.name) || propCode;
      const unit = toText(raw.unitName || raw.unit);
      return {
        label: unit ? `${propName}(${propCode}) / ${unit}` : `${propName}(${propCode})`,
        value: propCode,
        unit,
      };
    })
    .filter(Boolean) as PropOption[];
};

export const IntelligentGrainWarehouseDetail = defineComponent({
  name: "IntelligentGrainWarehouseDetail",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy as unknown as {
      getDeviceInstancePageAll: (params: Record<string, unknown>) => Promise<{ records?: DeviceRow[]; total?: number; pages?: number }>;
      getDeviceInstanceDetail: (params: { deviceId: string }) => Promise<{ productInfo?: { id?: string } }>;
      getProductPropList: (params: { prodId: string | number }) => Promise<unknown[]>;
    };

    const warehouseId = computed(() => {
      const raw = route.query.warehouseId;
      return Array.isArray(raw) ? raw[0] : raw;
    });
    const editing = computed(() => Boolean(warehouseId.value));
    const pageTitle = computed(() => (editing.value ? "编辑仓房" : "新增仓房"));
    const loading = ref(false);
    const saving = ref(false);
    const varietyOptions = ref<GrainVarietyOption[]>([]);
    const form = reactive<WarehouseFormState>(createDefaultForm());
    const bindingRows = ref<BindingRow[]>([]);

    const deviceModalVisible = ref(false);
    const deviceLoading = ref(false);
    const deviceRows = ref<DeviceRow[]>([]);
    const deviceTotal = ref(0);
    const deviceKeyword = ref("");
    const deviceSelectedKeys = ref<string[]>([]);
    const deviceSelectedRows = ref<DeviceRow[]>([]);
    const devicePage = reactive({
      pageNumber: 1,
      pageSize: 10,
    });

    const grainVarietySelectOptions = computed<SelectOption[]>(() =>
      varietyOptions.value.map((item) => ({ label: item.varietyName, value: item.varietyId })),
    );

    const resetForm = (): void => {
      Object.assign(form, createDefaultForm());
      bindingRows.value = [];
    };

    const loadVarieties = async (): Promise<void> => {
      varietyOptions.value = await useAuthRequest(() => listIntelligentGrainGlobalVarietyOptions());
    };

    const mapBindingRow = (binding: GrainWarehouseDeviceBinding): BindingRow => {
      const spec = metricSpec(binding.metricCode);
      const propCode = binding.propCode ?? "";
      return {
        rowKey: binding.bindingId || createRowKey(),
        bindingId: binding.bindingId,
        deviceId: binding.deviceId ?? "",
        deviceNameSnapshot: binding.deviceNameSnapshot ?? "",
        metricDimension: binding.metricDimension ?? spec.dimension,
        metricCode: binding.metricCode ?? spec.value,
        metricName: binding.metricName ?? spec.label,
        propCode,
        unit: binding.unit ?? spec.unit,
        enabled: binding.enabled ?? true,
        propOptions: propCode ? [{ label: propCode, value: propCode, unit: binding.unit ?? spec.unit }] : [],
      };
    };

    const loadWarehouse = async (): Promise<void> => {
      if (!warehouseId.value) {
        resetForm();
        return;
      }
      loading.value = true;
      try {
        const detail = await useAuthRequest(() => getIntelligentGrainWarehouse(warehouseId.value as string));
        Object.assign(form, createDefaultForm(), {
          warehouseCode: detail.warehouseCode ?? "",
          warehouseName: detail.warehouseName ?? "",
          areaName: detail.areaName ?? "",
          grainVarietyId: detail.grainVarietyId ?? null,
          warehouseType: warehouseTypeCode(detail.warehouseType),
          capacityVolume: detail.capacityVolume ?? null,
          capacityWeight: detail.capacityWeight ?? null,
          inboundDate: detail.inboundDate ?? null,
          qualityGrade: detail.qualityGrade ?? "",
          enabled: detail.enabled ?? true,
        });
        bindingRows.value = (detail.deviceBindings ?? []).map(mapBindingRow);
      } catch (error) {
        message.error((error as Error).message || "加载仓房详情失败");
      } finally {
        loading.value = false;
      }
    };

    const loadPropsByProduct = async (productId?: string | number): Promise<PropOption[]> => {
      if (productId === undefined || productId === null || productId === "") {
        return [];
      }
      try {
        return propOptionsFromRaw(await cubeDeviceCenterService.getProductPropList({ prodId: productId }));
      } catch {
        return [];
      }
    };

    const loadPropsForBinding = async (row: BindingRow): Promise<void> => {
      if (!row.deviceId || row.propLoading) {
        return;
      }
      row.propLoading = true;
      try {
        const detail = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: row.deviceId });
        const options = await loadPropsByProduct(detail.productInfo?.id);
        row.propOptions = options.length > 0 ? options : row.propOptions;
      } finally {
        row.propLoading = false;
      }
    };

    const loadDevices = async (): Promise<void> => {
      deviceLoading.value = true;
      try {
        const result = await cubeDeviceCenterService.getDeviceInstancePageAll({
          pageNumber: devicePage.pageNumber,
          pageSize: devicePage.pageSize,
          keyword: deviceKeyword.value.trim(),
        });
        deviceRows.value = result.records ?? [];
        deviceTotal.value = result.total ?? 0;
      } catch (error) {
        message.error((error as Error).message || "加载设备列表失败");
        deviceRows.value = [];
        deviceTotal.value = 0;
      } finally {
        deviceLoading.value = false;
      }
    };

    const openDeviceModal = (): void => {
      deviceModalVisible.value = true;
      deviceSelectedKeys.value = [];
      deviceSelectedRows.value = [];
      void loadDevices();
    };

    const addSelectedDevices = async (): Promise<void> => {
      if (deviceSelectedRows.value.length === 0) {
        message.warning("请选择设备");
        return;
      }
      const rows = await Promise.all(
        deviceSelectedRows.value.map(async (device) => {
          const spec = metricSpec("TEMP_MAX");
          const propOptions = await loadPropsByProduct(device.productInfo?.id);
          return {
            rowKey: createRowKey(),
            deviceId: toText(device.id),
            deviceNameSnapshot: toText(device.name) || toText(device.code) || "未命名设备",
            metricDimension: spec.dimension,
            metricCode: spec.value,
            metricName: spec.label,
            propCode: "",
            unit: propOptions[0]?.unit || spec.unit,
            enabled: true,
            propOptions,
          };
        }),
      );
      bindingRows.value = [...bindingRows.value, ...rows.filter((row) => row.deviceId)];
      deviceModalVisible.value = false;
    };

    const removeBinding = (row: BindingRow): void => {
      bindingRows.value = bindingRows.value.filter((item) => item.rowKey !== row.rowKey);
    };

    const changeMetric = (row: BindingRow, value: string): void => {
      const spec = metricSpec(value);
      row.metricCode = spec.value;
      row.metricName = spec.label;
      row.metricDimension = spec.dimension;
      row.unit = spec.unit;
    };

    const changeProp = (row: BindingRow, value: string): void => {
      row.propCode = value;
      const option = row.propOptions.find((item) => item.value === value);
      if (option?.unit) {
        row.unit = option.unit;
      }
    };

    const toPayload = (): GrainWarehousePayload => ({
      warehouseCode: form.warehouseCode.trim(),
      warehouseName: form.warehouseName.trim(),
      areaName: nullableText(form.areaName),
      grainVarietyId: nullableId(form.grainVarietyId),
      warehouseType: form.warehouseType || null,
      capacityVolume: nullableNumber(form.capacityVolume),
      capacityWeight: nullableNumber(form.capacityWeight),
      inboundDate: form.inboundDate || null,
      qualityGrade: nullableText(form.qualityGrade),
      enabled: form.enabled,
      deviceBindings: bindingRows.value.map(
        (row): GrainWarehouseDeviceBindingPayload => ({
          deviceId: row.deviceId,
          deviceNameSnapshot: nullableText(row.deviceNameSnapshot),
          metricDimension: row.metricDimension,
          metricCode: row.metricCode,
          propCode: row.propCode,
          unit: nullableText(row.unit),
          enabled: row.enabled,
        }),
      ),
    });

    const validate = (): boolean => {
      if (!form.warehouseCode.trim()) {
        message.warning("请输入仓房编码");
        return false;
      }
      if (!form.warehouseName.trim()) {
        message.warning("请输入仓房名称");
        return false;
      }
      const invalid = bindingRows.value.find((row) => !row.deviceId || !row.metricCode || !row.metricDimension || !row.propCode);
      if (invalid) {
        message.warning("请补全关联设备的指标和IoT属性");
        return false;
      }
      const metricCodes = new Set<string>();
      const duplicatedMetric = bindingRows.value.find((row) => {
        if (metricCodes.has(row.metricCode)) {
          return true;
        }
        metricCodes.add(row.metricCode);
        return false;
      });
      if (duplicatedMetric) {
        message.warning(`同一仓房下指标「${duplicatedMetric.metricName || duplicatedMetric.metricCode}」只能绑定一个设备属性`);
        return false;
      }
      return true;
    };

    const save = async (): Promise<void> => {
      if (!validate()) {
        return;
      }
      saving.value = true;
      try {
        const payload = toPayload();
        if (warehouseId.value) {
          await useAuthRequest(() => updateIntelligentGrainWarehouse(warehouseId.value as string, payload));
          message.success("仓房已更新");
        } else {
          await useAuthRequest(() => createIntelligentGrainWarehouse(payload));
          message.success("仓房已新增");
        }
        void router.push({ name: "intelligent-grain-warehouses" });
      } catch (error) {
        message.error((error as Error).message || "保存仓房失败");
      } finally {
        saving.value = false;
      }
    };

    const bindingColumns: ColumnType<BindingRow>[] = [
      {
        title: "设备",
        dataIndex: "deviceNameSnapshot",
        width: 180,
        customRender: ({ record }: { record: BindingRow }) => (
          <div class="ig-binding-device-cell">
            <strong>{record.deviceNameSnapshot || "--"}</strong>
            <span>{record.deviceId || "--"}</span>
          </div>
        ),
      },
      {
        title: "指标编码",
        dataIndex: "metricCode",
        width: 160,
        customRender: ({ record }: { record: BindingRow }) => (
          <Select
            value={record.metricCode}
            options={metricSelectOptions}
            style={{ width: "140px" }}
            onChange={(value: string) => changeMetric(record, value)}
          />
        ),
      },
      {
        title: "指标维度",
        dataIndex: "metricDimension",
        width: 110,
        customRender: ({ record }: { record: BindingRow }) => <Tag color="blue">{dimensionLabel(record.metricDimension)}</Tag>,
      },
      {
        title: "IoT属性",
        dataIndex: "propCode",
        width: 240,
        customRender: ({ record }: { record: BindingRow }) => (
          <Select
            value={record.propCode || undefined}
            allowClear
            showSearch
            loading={record.propLoading}
            options={record.propOptions}
            placeholder="请选择IoT属性"
            style={{ width: "220px" }}
            onDropdownVisibleChange={(open: boolean) => {
              if (open && record.propOptions.length <= 1) {
                void loadPropsForBinding(record);
              }
            }}
            onChange={(value: string) => changeProp(record, value)}
          />
        ),
      },
      {
        title: "单位",
        dataIndex: "unit",
        width: 110,
        customRender: ({ record }: { record: BindingRow }) => (
          <Input value={record.unit} onChange={(event: Event) => (record.unit = (event.target as HTMLInputElement).value)} />
        ),
      },
      {
        title: "启用",
        dataIndex: "enabled",
        width: 90,
        customRender: ({ record }: { record: BindingRow }) => (
          <Switch
            checked={record.enabled}
            checkedChildren="启用"
            unCheckedChildren="停用"
            onChange={(checked: boolean) => (record.enabled = checked)}
          />
        ),
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 90,
        fixed: "right",
        customRender: ({ record }: { record: BindingRow }) => (
          <Button type="link" size="small" danger onClick={() => removeBinding(record)}>
            删除
          </Button>
        ),
      },
    ];

    const deviceColumns: ColumnType<DeviceRow>[] = [
      { title: "设备名称", dataIndex: "name", customRender: ({ text }: { text?: string }) => text || "--" },
      { title: "设备编码", dataIndex: "code", customRender: ({ text }: { text?: string }) => text || "--" },
      {
        title: "所属产品",
        dataIndex: "productInfo",
        customRender: ({ record }: { record: DeviceRow }) => record.productInfo?.name || "--",
      },
      {
        title: "所在区域",
        dataIndex: "area",
        customRender: ({ record }: { record: DeviceRow }) => record.area?.pathName || record.area?.name || "--",
      },
    ];

    const renderBaseInfo = (): JSX.Element => (
      <section class="ig-detail-section">
        <div class="ig-detail-title">基础信息</div>
        <div class="ig-warehouse-detail-form">
          <label>
            <span>仓房编码 *</span>
            <Input v-model:value={form.warehouseCode} placeholder="请输入仓房编码" />
          </label>
          <label>
            <span>仓房名称 *</span>
            <Input v-model:value={form.warehouseName} placeholder="请输入仓房名称" />
          </label>
          <label>
            <span>库区名称</span>
            <Input v-model:value={form.areaName} placeholder="请输入库区名称" />
          </label>
          <label>
            <span>粮食品种</span>
            <Select
              v-model:value={form.grainVarietyId}
              allowClear
              options={grainVarietySelectOptions.value}
              placeholder="请选择粮食品种"
              style={{ width: "100%" }}
            />
          </label>
          <label>
            <span>仓型</span>
            <Select
              v-model:value={form.warehouseType}
              allowClear
              options={warehouseTypeOptions}
              placeholder="请选择仓型"
              style={{ width: "100%" }}
            />
          </label>
          <label>
            <span>设计储量(t)</span>
            <InputNumber v-model:value={form.capacityWeight} min={0} precision={3} placeholder="请输入设计储量" style={{ width: "100%" }} />
          </label>
          <label>
            <span>总仓容(m3)</span>
            <InputNumber v-model:value={form.capacityVolume} min={0} precision={3} placeholder="请输入总仓容" style={{ width: "100%" }} />
          </label>
          <label>
            <span>入库日期</span>
            <DatePicker v-model:value={form.inboundDate} valueFormat="YYYY-MM-DD" style={{ width: "100%" }} />
          </label>
          <label>
            <span>品质等级</span>
            <Input v-model:value={form.qualityGrade} placeholder="请输入品质等级" />
          </label>
          <label class="is-inline">
            <span>启用状态</span>
            <Switch v-model:checked={form.enabled} checkedChildren="启用" unCheckedChildren="停用" />
          </label>
        </div>
      </section>
    );

    const renderDeviceBindings = (): JSX.Element => (
      <section class="ig-detail-section">
        <div class="ig-detail-title-row">
          <div class="ig-detail-title">关联设备</div>
          <Button type="primary" onClick={openDeviceModal}>
            添加设备
          </Button>
        </div>
        <Table
          rowKey="rowKey"
          loading={false}
          dataSource={bindingRows.value}
          columns={bindingColumns as never}
          pagination={false}
          size="small"
          scrollX={980}
          scrollY={undefined as never}
          defaultExpandedRowKeys={[]}
          rowSelection={undefined as never}
          childrenColumnName="children"
          customRow={undefined}
          sticky={false}
        />
      </section>
    );

    const renderDeviceModal = (): JSX.Element => (
      <Modal
        v-model:visible={deviceModalVisible.value}
        title="选择设备"
        width="920px"
        destroyOnClose
        onOk={() => void addSelectedDevices()}
        onCancel={() => {
          deviceModalVisible.value = false;
        }}
      >
        <div class="ig-device-modal-filter">
          <Input
            value={deviceKeyword.value}
            placeholder="搜索设备名称/编码"
            onChange={(event: Event) => (deviceKeyword.value = (event.target as HTMLInputElement).value)}
            onPressEnter={() => {
              devicePage.pageNumber = 1;
              void loadDevices();
            }}
          />
          <Button
            type="primary"
            onClick={() => {
              devicePage.pageNumber = 1;
              void loadDevices();
            }}
          >
            查询
          </Button>
        </div>
        <Table
          rowKey="id"
          loading={deviceLoading.value}
          dataSource={deviceRows.value}
          columns={deviceColumns as never}
          pagination={false}
          size="small"
          scrollX={undefined as never}
          scrollY={undefined as never}
          defaultExpandedRowKeys={[]}
          rowSelection={
            {
              selectedRowKeys: deviceSelectedKeys.value,
              onChange: (keys: Array<string | number>, rows: unknown[]) => {
                deviceSelectedKeys.value = keys.map(String);
                deviceSelectedRows.value = rows as DeviceRow[];
              },
            } as never
          }
          childrenColumnName="children"
          customRow={undefined}
          sticky={false}
        />
        <Page
          current={devicePage.pageNumber}
          pageSize={devicePage.pageSize}
          total={deviceTotal.value}
          showSizeChanger
          showQuickJumper={false}
          pageSizeOptions={["10", "20", "50", "100"]}
          showTotal={(total: number) => `共 ${total} 条设备`}
          onPageChange={(pageNumber: number, pageSize: number) => {
            devicePage.pageNumber = pageNumber;
            devicePage.pageSize = pageSize;
            void loadDevices();
          }}
          onShowSizeChange={(pageNumber: number, pageSize: number) => {
            devicePage.pageNumber = pageNumber;
            devicePage.pageSize = pageSize;
            void loadDevices();
          }}
        />
      </Modal>
    );

    onMounted(() => {
      void Promise.all([loadVarieties(), loadWarehouse()]);
    });

    const slots = {
      "layout-content": (): JSX.Element => (
        <div class="ig-page ig-warehouse-detail-page">
          {renderBaseInfo()}
          {renderDeviceBindings()}
          {renderDeviceModal()}
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Space>
          <Button onClick={() => router.back()}>返回</Button>
          <Button type="primary" loading={saving.value || loading.value} onClick={() => void save()}>
            保存
          </Button>
        </Space>
      ),
    };

    return (): JSX.Element => <CubeLayout title={pageTitle.value} v-slots={slots} showTableXScroll />;
  },
});
