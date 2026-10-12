import { computed, defineComponent, reactive, ref } from "vue";

import { createUnitType, deleteUnitType, pageUnitTypes, updateUnitType } from "@ghcloud/cube-services-client/risk-graded-control.client";
import { AntModal, Button, Empty, Form, FormItem, Input, Modal, Space, Table, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { GPagination } from "@/components/common/pagination";
import { PageShell } from "@/components/page-shell/page-shell";
import {
  LIST_ACTION_DELETE_PROPS,
  LIST_ACTION_LINK_PROPS,
  LIST_SEARCH_INPUT_PROPS,
  TABLE_CODE_COLUMN_WIDTH,
  TABLE_PAGE_SIZE,
} from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useListSearchClearReload } from "@/hooks/use-list-search-clear-reload";
import { useServerPagedList } from "@/hooks/use-server-paged-list";
import type { UnitTypeVO } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { mapUnitTypeFromApi, mapUnitTypeToApi } from "@/utils/risk-control-mapper";

export const UnitTypesPage = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const records = ref<UnitTypeVO[]>([]);
    const {
      pageNumber,
      pageSize,
      total,
      resetPage,
      onPageChange: bindPageChange,
      scheduleInitialLoad,
      rewindIfEmpty,
    } = useServerPagedList();
    const keyword = ref("");
    const loading = ref(false);
    const modalVisible = ref(false);
    const modalMode = ref<"create" | "edit">("create");
    const editingId = ref<string | null>(null);

    const form = reactive({
      code: "",
      name: "",
    });

    const loadList = async (): Promise<void> => {
      loading.value = true;
      try {
        const page = await useAuthRequest(() =>
          pageUnitTypes({
            pageNumber: pageNumber.value,
            pageSize: pageSize.value,
            keyword: keyword.value.trim() || undefined,
          }),
        );
        records.value = page.records.map(mapUnitTypeFromApi);
        total.value = page.total ?? 0;
        await rewindIfEmpty(records.value.length, loadList);
      } catch (e) {
        showApiError(e);
        records.value = [];
        total.value = 0;
      } finally {
        loading.value = false;
      }
    };

    scheduleInitialLoad(loadList);

    const onSearch = (): void => {
      pageNumber.value = 1;
      void loadList();
    };

    useListSearchClearReload(keyword, onSearch);

    const resetForm = (): void => {
      form.code = "";
      form.name = "";
      form.defaultCycleDays = 180;
      form.dimensionDesc = "";
    };

    const openCreate = (): void => {
      modalMode.value = "create";
      editingId.value = null;
      resetForm();
      modalVisible.value = true;
    };

    const openEdit = (record: UnitTypeVO): void => {
      modalMode.value = "edit";
      editingId.value = record.id;
      form.code = record.code;
      form.name = record.name;
      modalVisible.value = true;
    };

    const handleSubmit = async (): Promise<void> => {
      if (!form.name.trim()) {
        message.warning("请输入类型名称");
        return;
      }
      try {
        const payload = mapUnitTypeToApi(form);
        if (modalMode.value === "create") {
          await useAuthRequest(() => createUnitType(payload));
          message.success("新增成功");
        } else if (editingId.value) {
          await useAuthRequest(() => updateUnitType(editingId.value, payload));
          message.success("保存成功");
        }
        modalVisible.value = false;
        await loadList();
      } catch (e) {
        showApiError(e);
      }
    };

    const handleDelete = (record: UnitTypeVO): void => {
      AntModal.confirm({
        centered: true,
        title: "删除确认",
        content: `确定删除类型「${record.name}」吗？`,
        okText: "确定",
        cancelText: "取消",
        onOk: async () => {
          try {
            await useAuthRequest(() => deleteUnitType(record.id));
            message.success("删除成功");
            await loadList();
          } catch (e) {
            showApiError(e);
          }
        },
      });
    };

    const modalTitle = computed(() => (modalMode.value === "create" ? "新增单元类型" : "编辑单元类型"));

    const onPageChange = bindPageChange(loadList);

    const columns = [
      { title: "类型编号", dataIndex: "code", width: TABLE_CODE_COLUMN_WIDTH, ellipsis: true },
      { title: "类型名称", dataIndex: "name", width: 160 },
      {
        title: "操作",
        width: 140,
        customRender: ({ record }: { record: UnitTypeVO }) => (
          <Space>
            <Button {...LIST_ACTION_LINK_PROPS} onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Button {...LIST_ACTION_DELETE_PROPS} onClick={() => handleDelete(record)}>
              删除
            </Button>
          </Space>
        ),
      },
    ];

    return (): JSX.Element => (
      <PageShell
        title={pageTitle}
        v-slots={{
          "layout-header": () => (
            <Button type="primary" onClick={openCreate}>
              新增
            </Button>
          ),
          "layout-content": () => (
            <>
              <Form layout="inline" data-layout-toolbar>
                <FormItem>
                  <Input
                    {...LIST_SEARCH_INPUT_PROPS}
                    v-model:value={keyword.value}
                    placeholder="搜索类型名称/编号"
                    allowClear
                    style={{ width: "220px" }}
                    onPressEnter={onSearch}
                  />
                </FormItem>
                <FormItem>
                  <Button type="primary" onClick={onSearch}>
                    查询
                  </Button>
                </FormItem>
              </Form>
              <div class="tableWrap">
                <Table
                  columns={columns}
                  dataSource={records.value}
                  rowKey="id"
                  pagination={false}
                  loading={loading.value}
                  locale={{ emptyText: <Empty description="暂无单元类型数据" /> }}
                />
              </div>
              <Modal
                open={modalVisible.value}
                title={modalTitle.value}
                width={520}
                onCancel={() => {
                  modalVisible.value = false;
                }}
                onOk={() => {
                  void handleSubmit();
                }}
                okText="提交"
                cancelText="取消"
              >
                <Form layout="vertical">
                  {modalMode.value === "edit" && (
                    <FormItem label="类型编号">
                      <Input v-model:value={form.code} disabled />
                    </FormItem>
                  )}
                  <FormItem label="类型名称" required>
                    <Input v-model:value={form.name} maxlength={20} placeholder="请输入类型名称" />
                  </FormItem>
                </Form>
              </Modal>
            </>
          ),
          "footer-page": () => (
            <GPagination total={total.value} current={pageNumber.value} pageSize={pageSize.value} onChange={onPageChange} />
          ),
        }}
      />
    );
  },
});
