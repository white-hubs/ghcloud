import { computed, defineComponent, reactive, ref } from "vue";

import {
  createWarningSign,
  deleteWarningSign,
  getWarningSign,
  pageWarningSigns,
  updateWarningSignEnabled,
  updateWarningSign,
} from "@ghcloud/cube-services-client/risk-graded-control.client";
import {
  AntModal,
  Button,
  Empty,
  Form,
  FormItem,
  Input,
  Modal,
  Select,
  SelectOption,
  Space,
  Switch,
  Table,
  Tag,
  Textarea,
  Upload,
  message,
  type UploadChangeParam,
  type UploadFile,
  type UploadRequestOption,
} from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { uploadRiskControlFile } from "@/api/upload-risk-file";
import { GPagination } from "@/components/common/pagination";
import { FileImageThumb } from "@/components/file-image-thumb/file-image-thumb";
import { PageShell } from "@/components/page-shell/page-shell";
import {
  FILE_SCENE_CODE,
  LIST_ACTION_DELETE_PROPS,
  LIST_ACTION_LINK_PROPS,
  LIST_SEARCH_INPUT_PROPS,
  TABLE_CODE_COLUMN_WIDTH,
  TABLE_PAGE_SIZE,
  WARNING_SIGN_TYPES,
} from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { useListSearchClearReload } from "@/hooks/use-list-search-clear-reload";
import { useServerPagedList } from "@/hooks/use-server-paged-list";
import type { WarningSignVO } from "@/types/risk";
import { showApiError } from "@/utils/api-error";
import { mapWarningSignFromApi, mapWarningSignToApi } from "@/utils/risk-control-mapper";

const SIGN_TYPE_COLOR: Record<string, string> = {
  警告: "gold",
  禁止: "red",
  指令: "blue",
  提示: "green",
};

const signTypeLabel = (type: string): string => `${type}标志`;

export const WarningSignsPage = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const records = ref<WarningSignVO[]>([]);
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
    const typeFilter = ref("");
    const enabledFilter = ref<"" | "ENABLED" | "DISABLED">("");
    const loading = ref(false);
    const togglingIds = ref<Set<string>>(new Set());
    const selectedRowKeys = ref<string[]>([]);
    const modalVisible = ref(false);
    const modalMode = ref<"create" | "edit" | "view">("create");
    const editingId = ref<string | null>(null);
    const iconFileList = ref<UploadFile[]>([]);
    const iconFileId = ref<string | undefined>();

    const form = reactive({
      code: "",
      name: "",
      type: "警告",
      applicableScenario: "",
      status: "ENABLED" as WarningSignVO["status"],
    });

    const loadList = async (): Promise<void> => {
      loading.value = true;
      try {
        const page = await useAuthRequest(() =>
          pageWarningSigns({
            pageNumber: pageNumber.value,
            pageSize: pageSize.value,
            keyword: keyword.value.trim() || undefined,
            signType: typeFilter.value || undefined,
            enabled: enabledFilter.value ? enabledFilter.value === "ENABLED" : undefined,
          }),
        );
        records.value = page.records.map(mapWarningSignFromApi);
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

    const resetForm = (): void => {
      form.code = "";
      form.name = "";
      form.type = "警告";
      form.applicableScenario = "";
      form.status = "ENABLED";
      iconFileList.value = [];
      iconFileId.value = undefined;
    };

    const fillFormFromRecord = (record: WarningSignVO): void => {
      form.code = record.code;
      form.name = record.name;
      form.type = record.type;
      form.applicableScenario = record.applicableScenario ?? "";
      form.status = record.status;
      iconFileId.value = record.iconFileId;
      iconFileList.value = record.iconUrl
        ? [{ uid: record.iconFileId ?? "-1", name: "icon.png", status: "done", url: record.iconUrl }]
        : [];
    };

    const openCreate = (): void => {
      modalMode.value = "create";
      editingId.value = null;
      resetForm();
      modalVisible.value = true;
    };

    const openEdit = async (record: WarningSignVO): Promise<void> => {
      modalMode.value = "edit";
      editingId.value = record.id;
      try {
        const vo = await useAuthRequest(() => getWarningSign(record.id));
        fillFormFromRecord(mapWarningSignFromApi(vo));
        modalVisible.value = true;
      } catch (e) {
        showApiError(e);
      }
    };

    const openView = async (record: WarningSignVO): Promise<void> => {
      modalMode.value = "view";
      editingId.value = record.id;
      try {
        const vo = await useAuthRequest(() => getWarningSign(record.id));
        fillFormFromRecord(mapWarningSignFromApi(vo));
        modalVisible.value = true;
      } catch (e) {
        showApiError(e);
      }
    };

    const handleSubmit = async (): Promise<void> => {
      if (!form.name.trim()) {
        message.warning("请输入标志名称");
        return;
      }
      try {
        const payload = mapWarningSignToApi({
          ...form,
          iconFileId: iconFileId.value,
        });
        if (modalMode.value === "create") {
          await useAuthRequest(() => createWarningSign(payload));
          message.success("新增成功");
        } else if (editingId.value) {
          await useAuthRequest(() => updateWarningSign(editingId.value, payload));
          message.success("保存成功");
        }
        modalVisible.value = false;
        await loadList();
      } catch (e) {
        showApiError(e);
      }
    };

    const handleDelete = (record: WarningSignVO): void => {
      AntModal.confirm({
        centered: true,
        title: "删除确认",
        content: `确定删除标志「${record.name}」吗？`,
        okText: "确定",
        cancelText: "取消",
        onOk: async () => {
          try {
            await useAuthRequest(() => deleteWarningSign(record.id));
            message.success("删除成功");
            selectedRowKeys.value = selectedRowKeys.value.filter((k) => k !== record.id);
            await loadList();
          } catch (e) {
            showApiError(e);
          }
        },
      });
    };

    const handleStatusToggle = async (record: WarningSignVO, checked: boolean): Promise<void> => {
      const nextStatus = checked ? "ENABLED" : "DISABLED";
      const previousStatus = record.status;
      const nextSet = new Set(togglingIds.value);
      nextSet.add(record.id);
      togglingIds.value = nextSet;
      record.status = nextStatus;
      try {
        await useAuthRequest(() => updateWarningSignEnabled(record.id, { enabled: checked }));
        message.success(checked ? "已启用" : "已停用");
      } catch (e) {
        record.status = previousStatus;
        showApiError(e);
      } finally {
        const doneSet = new Set(togglingIds.value);
        doneSet.delete(record.id);
        togglingIds.value = doneSet;
      }
    };

    const handleBatchDelete = (): void => {
      if (selectedRowKeys.value.length === 0) {
        message.warning("请先选择要删除的数据");
        return;
      }
      AntModal.confirm({
        centered: true,
        title: "批量删除",
        content: `确定删除选中的 ${selectedRowKeys.value.length} 条标志？`,
        okText: "确定",
        cancelText: "取消",
        onOk: async () => {
          try {
            await Promise.all(selectedRowKeys.value.map((id) => useAuthRequest(() => deleteWarningSign(id))));
            message.success("删除成功");
            selectedRowKeys.value = [];
            await loadList();
          } catch (e) {
            showApiError(e);
          }
        },
      });
    };

    const onSearch = (): void => {
      pageNumber.value = 1;
      selectedRowKeys.value = [];
      void loadList();
    };

    useListSearchClearReload(keyword, onSearch);

    const onPageChange = bindPageChange(loadList);

    const customUpload = async (options: UploadRequestOption): Promise<void> => {
      const { file, onSuccess, onError } = options;
      const blob = file as File;
      try {
        const result = await useAuthRequest(() => uploadRiskControlFile(blob, FILE_SCENE_CODE.WARNING_SIGN_ICON));
        iconFileId.value = result.id || undefined;
        onSuccess?.({ url: result.path, fileId: iconFileId.value });
        message.success("图标上传成功");
      } catch (e) {
        showApiError(e);
        onError?.(e as Error);
      }
    };

    const onIconChange = (info: UploadChangeParam): void => {
      iconFileList.value = info.fileList.slice(-1);
    };

    const columns = [
      { title: "标志编号", dataIndex: "code", width: TABLE_CODE_COLUMN_WIDTH, ellipsis: true },
      { title: "标志名称", dataIndex: "name", width: 160, ellipsis: true },
      {
        title: "适用场景",
        dataIndex: "applicableScenario",
        width: 160,
        ellipsis: true,
        customRender: ({ text }: { text: string }) => text || "—",
      },
      {
        title: "标志类型",
        dataIndex: "type",
        width: 120,
        customRender: ({ text }: { text: string }) => <Tag color={SIGN_TYPE_COLOR[text]}>{signTypeLabel(text)}</Tag>,
      },
      {
        title: "图标",
        dataIndex: "iconUrl",
        width: 72,
        align: "center" as const,
        customRender: ({ text, record }: { text: string; record: WarningSignVO }) => (
          <FileImageThumb src={text} alt={record.name} size={32} />
        ),
      },
      {
        title: "状态",
        dataIndex: "status",
        width: 120,
        customRender: ({ record }: { record: WarningSignVO }) => (
          <Switch
            checked={record.status === "ENABLED"}
            checkedChildren="启用"
            unCheckedChildren="禁用"
            loading={togglingIds.value.has(record.id)}
            onChange={(checked: boolean) => {
              void handleStatusToggle(record, checked);
            }}
          />
        ),
      },
      {
        title: "操作",
        width: 180,
        customRender: ({ record }: { record: WarningSignVO }) => (
          <Space>
            <Button
              {...LIST_ACTION_LINK_PROPS}
              onClick={() => {
                void openView(record);
              }}
            >
              查看
            </Button>
            <Button
              {...LIST_ACTION_LINK_PROPS}
              onClick={() => {
                void openEdit(record);
              }}
            >
              编辑
            </Button>
            <Button {...LIST_ACTION_DELETE_PROPS} onClick={() => handleDelete(record)}>
              删除
            </Button>
          </Space>
        ),
      },
    ];

    const modalTitle = computed(() => {
      if (modalMode.value === "view") return "查看安全警示标志";
      if (modalMode.value === "edit") return "编辑安全警示标志";
      return "新增安全警示标志";
    });

    return (): JSX.Element => (
      <PageShell
        title={pageTitle}
        v-slots={{
          "layout-header": () => (
            <Space>
              <Button danger type="primary" disabled={selectedRowKeys.value.length === 0} onClick={handleBatchDelete}>
                批量删除
              </Button>
              <Button type="primary" onClick={openCreate}>
                新增
              </Button>
            </Space>
          ),
          "layout-content": () => (
            <>
              <div class="listPageBody">
                <Form layout="inline" data-layout-toolbar>
                  <FormItem label="标志类型">
                    <Select
                      v-model:value={typeFilter.value}
                      allowClear
                      placeholder="全部类型"
                      style={{ width: "140px" }}
                      onChange={() => {
                        pageNumber.value = 1;
                        void loadList();
                      }}
                    >
                      <SelectOption value="">全部类型</SelectOption>
                      {WARNING_SIGN_TYPES.map((t) => (
                        <SelectOption key={t} value={t}>
                          {signTypeLabel(t)}
                        </SelectOption>
                      ))}
                    </Select>
                  </FormItem>
                  <FormItem label="启用状态">
                    <Select
                      v-model:value={enabledFilter.value}
                      allowClear
                      placeholder="全部状态"
                      style={{ width: "140px" }}
                      onChange={() => {
                        pageNumber.value = 1;
                        void loadList();
                      }}
                    >
                      <SelectOption value="">全部状态</SelectOption>
                      <SelectOption value="ENABLED">启用</SelectOption>
                      <SelectOption value="DISABLED">禁用</SelectOption>
                    </Select>
                  </FormItem>
                  <FormItem>
                    <Input
                      {...LIST_SEARCH_INPUT_PROPS}
                      v-model:value={keyword.value}
                      placeholder="搜索标志名称"
                      allowClear
                      style={{ width: "200px" }}
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
                    scroll={{ x: 1130 }}
                    tableLayout="fixed"
                    rowSelection={{
                      selectedRowKeys: selectedRowKeys.value,
                      onChange: (keys) => {
                        selectedRowKeys.value = keys.map(String);
                      },
                    }}
                    locale={{ emptyText: <Empty description="暂无警示标志数据" /> }}
                  />
                </div>
              </div>
              <Modal
                open={modalVisible.value}
                title={modalTitle.value}
                width={560}
                footer={
                  modalMode.value === "view" ? (
                    <Button
                      onClick={() => {
                        modalVisible.value = false;
                      }}
                    >
                      关闭
                    </Button>
                  ) : (
                    <Space>
                      <Button
                        onClick={() => {
                          modalVisible.value = false;
                        }}
                      >
                        取消
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => {
                          void handleSubmit();
                        }}
                      >
                        提交
                      </Button>
                    </Space>
                  )
                }
                onCancel={() => {
                  modalVisible.value = false;
                }}
              >
                <Form layout="vertical">
                  {modalMode.value !== "create" && (
                    <FormItem label="标志编号">
                      <Input v-model:value={form.code} disabled />
                    </FormItem>
                  )}
                  <FormItem label="标志名称" required>
                    <Input v-model:value={form.name} disabled={modalMode.value === "view"} maxlength={50} />
                  </FormItem>
                  <FormItem label="标志类型" required>
                    <Select v-model:value={form.type} disabled={modalMode.value === "view"}>
                      {WARNING_SIGN_TYPES.map((t) => (
                        <SelectOption key={t} value={t}>
                          {signTypeLabel(t)}
                        </SelectOption>
                      ))}
                    </Select>
                  </FormItem>
                  <FormItem label="图标上传">
                    {modalMode.value === "view" ? (
                      <FileImageThumb src={iconFileList.value[0]?.url ?? ""} alt={form.name} size={64} />
                    ) : (
                      <Upload
                        customRequest={customUpload}
                        fileList={iconFileList.value}
                        onChange={onIconChange}
                        maxCount={1}
                        accept=".png,.svg,.jpg"
                      >
                        <Button>+ 上传图标</Button>
                      </Upload>
                    )}
                  </FormItem>
                  <FormItem label="状态">
                    <Switch
                      checked={form.status === "ENABLED"}
                      checkedChildren="启用"
                      unCheckedChildren="禁用"
                      disabled={modalMode.value === "view"}
                      onChange={(checked: boolean) => {
                        form.status = checked ? "ENABLED" : "DISABLED";
                      }}
                    />
                  </FormItem>
                  <FormItem label="适用场景">
                    <Textarea
                      v-model:value={form.applicableScenario}
                      disabled={modalMode.value === "view"}
                      rows={3}
                      maxlength={500}
                      showCount
                      placeholder="请输入适用场景"
                    />
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
