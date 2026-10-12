import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import { CubeLayout, useCubeForm } from "@ghcloud/cube-app-design";
import { GrainVarietyCategory } from "@ghcloud/cube-service-interface/intelligent-grain";
import type { GrainVarietyPageQuery, GrainVarietyPayload, GrainVarietyRecord } from "@ghcloud/cube-service-interface/intelligent-grain";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import {
  createIntelligentGrainVariety,
  deleteIntelligentGrainVariety,
  exportIntelligentGrainVarieties,
  pageIntelligentGrainVarieties,
  updateIntelligentGrainVariety,
} from "@ghcloud/cube-services-client/intelligent-grain.client";
import { Button, Input, Modal, Page, Select, Space, Table, Tag, message, type ColumnType } from "@ghcloud/cube-ui";

import { formatTime } from "@/views/shared/view-utils";

import "@/views/shared/intelligent-grain.less";

interface VarietyFormState {
  varietyCode: string;
  varietyName: string;
  category: GrainVarietyCategory | "";
}

const categoryOptions = [
  { label: "稻谷类", value: GrainVarietyCategory.RICE },
  { label: "麦类", value: GrainVarietyCategory.WHEAT },
  { label: "玉米类", value: GrainVarietyCategory.CORN },
  { label: "豆类", value: GrainVarietyCategory.BEAN },
  { label: "其他", value: GrainVarietyCategory.OTHER },
];

const categoryFilterOptions = [{ label: "全部类别", value: "" }, ...categoryOptions];

const createDefaultForm = (): VarietyFormState => ({
  varietyCode: "",
  varietyName: "",
  category: GrainVarietyCategory.RICE,
});

const categoryLabel = (category?: GrainVarietyCategory | string | null): string =>
  categoryOptions.find((item) => item.value === category)?.label ?? "--";

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const IntelligentGrainVarieties = defineComponent({
  name: "IntelligentGrainVarieties",
  setup: () => {
    const loading = ref(false);
    const exporting = ref(false);
    const rows = ref<GrainVarietyRecord[]>([]);
    const total = ref(0);
    const modalVisible = ref(false);
    const modalSaving = ref(false);
    const editingVarietyId = ref<string>();
    const query = reactive<GrainVarietyPageQuery>({
      pageNumber: 1,
      pageSize: 20,
      category: "",
      keyword: "",
    });
    const varietyForm = reactive<VarietyFormState>(createDefaultForm());
    const modalTitle = computed(() => (editingVarietyId.value ? "编辑品种" : "新增品种"));

    const buildQuery = (): GrainVarietyPageQuery => {
      const payload: GrainVarietyPageQuery = {
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
      };
      const keyword = query.keyword?.trim();
      if (keyword) {
        payload.keyword = keyword;
      }
      if (query.category) {
        payload.category = query.category;
      }
      return payload;
    };

    const loadVarieties = async (): Promise<void> => {
      loading.value = true;
      try {
        const result = await useAuthRequest(() => pageIntelligentGrainVarieties(buildQuery()));
        rows.value = result.records ?? [];
        total.value = result.total ?? 0;
      } catch (error) {
        message.error((error as Error).message || "加载粮食品种失败");
        rows.value = [];
        total.value = 0;
      } finally {
        loading.value = false;
      }
    };

    const resetQuery = (): void => {
      query.pageNumber = 1;
      query.category = "";
      query.keyword = "";
      void loadVarieties();
    };

    const [CubeForm] = useCubeForm({
      syncStateRef: query,
      layout: "horizontal",
      handleSubmit: (data) => {
        query.pageNumber = 1;
        query.category = (data.category ?? "") as GrainVarietyCategory | "";
        query.keyword = String(data.keyword ?? "").trim();
        void loadVarieties();
      },
      handleReset: resetQuery,
      schema: [
        {
          component: "Select",
          label: "类别",
          fieldName: "category",
          defaultValue: "",
          componentProps: {
            options: categoryFilterOptions,
          },
        },
        {
          component: "Input",
          label: "品种名称",
          fieldName: "keyword",
          componentProps: {
            placeholder: "搜索品种名称/编号",
          },
        },
      ],
      showCollapseButton: true,
    });

    const resetVarietyForm = (record?: GrainVarietyRecord): void => {
      Object.assign(varietyForm, createDefaultForm(), {
        varietyCode: record?.varietyCode ?? "",
        varietyName: record?.varietyName ?? "",
        category: record?.category ?? GrainVarietyCategory.RICE,
      });
    };

    const openCreateModal = (): void => {
      editingVarietyId.value = undefined;
      resetVarietyForm();
      modalVisible.value = true;
    };

    const openEditModal = (record: GrainVarietyRecord): void => {
      editingVarietyId.value = record.varietyId;
      resetVarietyForm(record);
      modalVisible.value = true;
    };

    const toPayload = (): GrainVarietyPayload => ({
      varietyCode: varietyForm.varietyCode.trim(),
      varietyName: varietyForm.varietyName.trim(),
      category: varietyForm.category as GrainVarietyCategory,
      enabled: true,
    });

    const saveVariety = async (): Promise<void> => {
      if (!varietyForm.varietyCode.trim()) {
        message.warning("请输入品种编号");
        return;
      }
      if (!varietyForm.varietyName.trim()) {
        message.warning("请输入品种名称");
        return;
      }
      if (!varietyForm.category) {
        message.warning("请选择类别");
        return;
      }
      modalSaving.value = true;
      try {
        const payload = toPayload();
        if (editingVarietyId.value) {
          await useAuthRequest(() => updateIntelligentGrainVariety(editingVarietyId.value as string, payload));
          message.success("品种已更新");
        } else {
          await useAuthRequest(() => createIntelligentGrainVariety(payload));
          message.success("品种已新增");
        }
        modalVisible.value = false;
        await loadVarieties();
      } catch (error) {
        message.error((error as Error).message || "保存品种失败");
      } finally {
        modalSaving.value = false;
      }
    };

    const deleteVariety = async (record: GrainVarietyRecord): Promise<void> => {
      if (!window.confirm(`确认删除品种「${record.varietyName}」？`)) {
        return;
      }
      try {
        await useAuthRequest(() => deleteIntelligentGrainVariety(record.varietyId));
        message.success("品种已删除");
        await loadVarieties();
      } catch (error) {
        message.error((error as Error).message || "删除品种失败");
      }
    };

    const exportVarieties = async (): Promise<void> => {
      exporting.value = true;
      try {
        const blob = await useAuthRequest(() => exportIntelligentGrainVarieties(buildQuery()));
        downloadBlob(blob, "粮食品种.xlsx");
      } catch (error) {
        message.error((error as Error).message || "导出粮食品种失败");
      } finally {
        exporting.value = false;
      }
    };

    const handlePageChange = (current: number, size: number): void => {
      query.pageNumber = current;
      query.pageSize = size;
      void loadVarieties();
    };

    const columns: ColumnType<GrainVarietyRecord>[] = [
      { title: "品种编号", dataIndex: "varietyCode", width: 160 },
      { title: "品种名称", dataIndex: "varietyName", width: 220 },
      {
        title: "类别",
        dataIndex: "category",
        width: 140,
        customRender: ({ text }: { text?: GrainVarietyCategory }) => <Tag>{categoryLabel(text)}</Tag>,
      },
      { title: "最近修改", dataIndex: "updateTime", width: 180, customRender: ({ text }: { text?: string }) => formatTime(text) },
      {
        title: "操作",
        dataIndex: "action",
        width: 160,
        fixed: "right",
        customRender: ({ record }: { record: GrainVarietyRecord }) => (
          <Space>
            <Button type="link" size="small" onClick={() => openEditModal(record)}>
              编辑
            </Button>
            <Button type="link" size="small" danger onClick={() => void deleteVariety(record)}>
              删除
            </Button>
          </Space>
        ),
      },
    ];

    const renderVarietyModal = (): JSX.Element => (
      <Modal
        v-model:visible={modalVisible.value}
        title={modalTitle.value}
        width="580px"
        destroyOnClose
        confirmLoading={modalSaving.value}
        onOk={() => void saveVariety()}
        onCancel={() => {
          modalVisible.value = false;
        }}
      >
        <div class="ig-variety-modal">
          <label class="ig-variety-modal-field">
            <span>
              品种编号 <i>*</i>
            </span>
            <Input v-model:value={varietyForm.varietyCode} placeholder="如：GV-001" />
          </label>
          <label class="ig-variety-modal-field">
            <span>
              品种名称 <i>*</i>
            </span>
            <Input v-model:value={varietyForm.varietyName} placeholder="如：早籼稻" />
          </label>
          <label class="ig-variety-modal-field">
            <span>
              类别 <i>*</i>
            </span>
            <Select v-model:value={varietyForm.category} options={categoryOptions} style={{ width: "100%" }} />
          </label>
        </div>
      </Modal>
    );

    onMounted(() => {
      void loadVarieties();
    });

    const slots = {
      "layout-header": (): JSX.Element => (
        <Space>
          <Button loading={exporting.value} onClick={() => void exportVarieties()}>
            导出
          </Button>
          <Button type="primary" onClick={openCreateModal}>
            新增品种
          </Button>
        </Space>
      ),
      "layout-content": (): JSX.Element => (
        <div class="ig-page ig-variety-page">
          <div class="ig-variety-note">
            <strong>说明：</strong>
            <span>粮食品种作为粮库业务的基础标签字典，用于粮情监测中的品种标注与筛选。</span>
          </div>
          <CubeForm />
          <section class="table-wrap">
            <Table rowKey="varietyId" loading={loading.value} dataSource={rows.value} columns={columns} pagination={false} size="small" />
          </section>
          {renderVarietyModal()}
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

    return (): JSX.Element => <CubeLayout title="粮食品种" v-slots={slots} showTableXScroll />;
  },
});
