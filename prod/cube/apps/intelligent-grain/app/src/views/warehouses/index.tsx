import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import type { JSX } from "vue/jsx-runtime";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { GrainVarietyOption, GrainWarehousePageQuery, GrainWarehouseRecord } from "@ghcloud/cube-service-interface/intelligent-grain";
import { GrainWarehouseType } from "@ghcloud/cube-service-interface/intelligent-grain";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import {
  deleteIntelligentGrainWarehouse,
  listIntelligentGrainGlobalVarietyOptions,
  pageIntelligentGrainWarehouses,
} from "@ghcloud/cube-services-client/intelligent-grain.client";
import { Button, Page, Space, Tag, message, type ColumnType } from "@ghcloud/cube-ui";

import { formatTime } from "@/views/shared/view-utils";

import "@/views/shared/intelligent-grain.less";

const enabledOptions = [
  { label: "全部状态", value: "" },
  { label: "启用", value: true },
  { label: "停用", value: false },
];

const warehouseTypeOptions = [
  { label: "立筒仓", value: GrainWarehouseType.VERTICAL_SILO },
  { label: "浅圆仓", value: GrainWarehouseType.SHALLOW_ROUND },
  { label: "平房仓", value: GrainWarehouseType.FLAT_WAREHOUSE },
  { label: "其他", value: GrainWarehouseType.OTHER },
];

const warehouseTypeLabel = (value?: string | null): string => {
  if (!value) {
    return "--";
  }
  return warehouseTypeOptions.find((item) => item.value === value.toUpperCase())?.label ?? value;
};

const formatCapacity = (value?: number | null, unit = ""): string => {
  return value === undefined || value === null ? "--" : `${value}${unit}`;
};

export const IntelligentGrainWarehouses = defineComponent({
  name: "IntelligentGrainWarehouses",
  setup: () => {
    const router = useRouter();
    const varietyOptions = ref<GrainVarietyOption[]>([]);
    const total = ref(0);
    const query = reactive<GrainWarehousePageQuery>({
      pageNumber: 1,
      pageSize: 20,
      keyword: "",
      areaName: "",
      grainVarietyId: "",
      enabled: "",
    });
    const grainVarietyOptions = computed(() => [
      { label: "全部品种", value: "" },
      ...varietyOptions.value.map((item) => ({ label: item.varietyName, value: item.varietyId })),
    ]);

    const buildQuery = (): GrainWarehousePageQuery => {
      const payload: GrainWarehousePageQuery = {
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
      };
      const keyword = query.keyword?.trim();
      const areaName = query.areaName?.trim();
      if (keyword) {
        payload.keyword = keyword;
      }
      if (areaName) {
        payload.areaName = areaName;
      }
      if (query.grainVarietyId !== undefined && query.grainVarietyId !== null && query.grainVarietyId !== "") {
        payload.grainVarietyId = query.grainVarietyId;
      }
      if (query.enabled === true || query.enabled === false) {
        payload.enabled = query.enabled;
      }
      return payload;
    };

    const emptyWarehousePage = () => ({
      total: 0,
      pages: 0,
      records: [],
    });

    const resetQuery = (): void => {
      query.pageNumber = 1;
      query.keyword = "";
      query.areaName = "";
      query.grainVarietyId = "";
      query.enabled = "";
      tableApi.query();
    };

    const updateGrainVarietyFieldSchema = (): void => {
      formApi.updateFieldSchema({
        component: "Select",
        label: "粮食品种",
        fieldName: "grainVarietyId",
        defaultValue: "",
        componentProps: {
          options: grainVarietyOptions.value,
        },
      });
    };

    const loadVarietyOptions = async (): Promise<void> => {
      try {
        varietyOptions.value = await useAuthRequest(() => listIntelligentGrainGlobalVarietyOptions());
        updateGrainVarietyFieldSchema();
      } catch (error) {
        message.error((error as Error).message || "加载粮食品种失败");
      }
    };

    const [CubeForm, formApi] = useCubeForm({
      syncStateRef: query,
      layout: "horizontal",
      handleSubmit: (data) => {
        query.pageNumber = 1;
        query.keyword = String(data.keyword ?? "").trim();
        query.areaName = String(data.areaName ?? "").trim();
        query.grainVarietyId = data.grainVarietyId === undefined || data.grainVarietyId === null ? "" : String(data.grainVarietyId);
        query.enabled =
          data.enabled === undefined || data.enabled === null || data.enabled === ""
            ? ""
            : data.enabled === true || data.enabled === "true";
        tableApi.query();
      },
      handleReset: resetQuery,
      schema: [
        {
          component: "Input",
          label: "关键字",
          fieldName: "keyword",
          componentProps: {
            placeholder: "编码/名称",
          },
        },
        {
          component: "Input",
          label: "库区",
          fieldName: "areaName",
          componentProps: {
            placeholder: "库区名称",
          },
        },
        {
          component: "Select",
          label: "品种",
          fieldName: "grainVarietyId",
          defaultValue: "",
          componentProps: {
            options: grainVarietyOptions.value,
          },
        },
        {
          component: "Select",
          label: "状态",
          fieldName: "enabled",
          defaultValue: "",
          componentProps: {
            options: enabledOptions,
          },
        },
      ],
      showCollapseButton: true,
    });

    const columns: ColumnType<GrainWarehouseRecord>[] = [
      { title: "仓房编码", dataIndex: "warehouseCode", width: 140 },
      { title: "仓房名称", dataIndex: "warehouseName", width: 180 },
      { title: "库区", dataIndex: "areaName", width: 140, customRender: ({ text }: { text?: string }) => text || "--" },
      { title: "粮食品种", dataIndex: "grainVarietyName", width: 120, customRender: ({ text }: { text?: string }) => text || "--" },
      { title: "仓型", dataIndex: "warehouseType", width: 120, customRender: ({ text }: { text?: string }) => warehouseTypeLabel(text) },
      {
        title: "设计储量",
        dataIndex: "capacityWeight",
        width: 120,
        customRender: ({ text }: { text?: number | null }) => formatCapacity(text, "t"),
      },
      {
        title: "总仓容",
        dataIndex: "capacityVolume",
        width: 120,
        customRender: ({ text }: { text?: number | null }) => formatCapacity(text, "m³"),
      },
      { title: "入库日期", dataIndex: "inboundDate", width: 130, customRender: ({ text }: { text?: string }) => text || "--" },
      { title: "品质等级", dataIndex: "qualityGrade", width: 110, customRender: ({ text }: { text?: string }) => text || "--" },
      {
        title: "状态",
        dataIndex: "enabled",
        width: 90,
        customRender: ({ text }: { text?: boolean }) => <Tag color={text ? "green" : "default"}>{text ? "启用" : "停用"}</Tag>,
      },
      { title: "更新时间", dataIndex: "updateTime", width: 160, customRender: ({ text }: { text?: string }) => formatTime(text) },
      {
        title: "操作",
        dataIndex: "action",
        width: 190,
        fixed: "right",
        customRender: ({ record }: { record: GrainWarehouseRecord }) => (
          <Space>
            <Button type="link" size="small" onClick={() => openEditModal(record)}>
              编辑
            </Button>
            <Button type="link" size="small" onClick={() => openArchive(record)}>
              档案
            </Button>
            <Button type="link" size="small" danger onClick={() => void deleteWarehouse(record)}>
              删除
            </Button>
          </Space>
        ),
      },
    ];

    const openCreateModal = (): void => {
      void router.push({ name: "intelligent-grain-warehouse-detail", query: { type: "create" } });
    };

    function openEditModal(record: GrainWarehouseRecord): void {
      void router.push({ name: "intelligent-grain-warehouse-detail", query: { type: "edit", warehouseId: record.warehouseId } });
    }

    const deleteWarehouse = async (record: GrainWarehouseRecord): Promise<void> => {
      if (!window.confirm(`确认删除仓房「${record.warehouseName}」？`)) {
        return;
      }
      try {
        await useAuthRequest(() => deleteIntelligentGrainWarehouse(record.warehouseId));
        message.success("仓房已删除");
        tableApi.query();
      } catch (error) {
        message.error((error as Error).message || "删除仓房失败");
      }
    };

    const openArchive = (record: GrainWarehouseRecord): void => {
      void router.push({ name: "intelligent-grain-archive-detail", query: { warehouseId: record.warehouseId } });
    };

    const handlePageChange = (current: number, size: number): void => {
      query.pageNumber = current;
      query.pageSize = size;
      tableApi.query();
    };

    const [CubeTable, tableApi] = useCubeTable({
      autoFetch: false,
      columns,
      rowKey: "warehouseId",
      tableCode: "INTELLIGENT_GRAIN_WAREHOUSES",
      fetchApi: async () => {
        try {
          return await useAuthRequest(() => pageIntelligentGrainWarehouses(buildQuery()));
        } catch (error) {
          message.error((error as Error).message || "加载仓房列表失败");
          return emptyWarehousePage();
        }
      },
      fetchLoaded: (data) => {
        total.value = data.total ?? 0;
      },
    });

    onMounted(() => {
      void loadVarietyOptions();
      tableApi.query();
    });

    const slots = {
      "layout-header": (): JSX.Element => (
        <Space>
          <Button onClick={() => tableApi.query()}>刷新</Button>
          <Button type="primary" onClick={openCreateModal}>
            新增仓房
          </Button>
        </Space>
      ),
      "layout-content": (): JSX.Element => (
        <div class="ig-page ig-warehouse-page">
          <CubeForm />
          <section class="table-wrap">
            <CubeTable />
          </section>
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          current={query.pageNumber}
          pageSize={query.pageSize}
          total={total.value}
          showQuickJumper={false}
          showSizeChanger
          showTotal={(total: number) => `共 ${total} 条数据`}
          pageSizeOptions={["10", "20", "50", "100"]}
          onPageChange={handlePageChange}
          onShowSizeChange={handlePageChange}
        />
      ),
    };

    return (): JSX.Element => <CubeLayout title="仓房管理" v-slots={slots} showTableXScroll />;
  },
});
