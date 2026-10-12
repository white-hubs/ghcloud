import dayjs from "dayjs";
import { defineComponent, ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable, useCubeQueryState, ProductSelect, DeptCascaderSelect } from "@ghcloud/cube-app-design";
import type { KnowledgeDocumentModel, KnowledgeDocumentTypeModel } from "@ghcloud/cube-knowledge-document-service";
import { Button, PopOver, PopConfirm, Page, AntModal, message, Tree, InputSearch } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { showImagePreview, kkFilePreview } from "@ghcloud/cube-utils";

import { KnowledgeDocumentModal } from "./knowledge-document-modal";
import { cubeKnowledgeDocumentService } from "@/api/service";
import { KnowledgeDocumentUploadModal } from "@/components/knowledge-document-upload-modal/knowledge-document-upload-modal";
import { fileDownLoad } from "@/hook/file-download";
import { typeList } from "@/utils";

import styles from "./knowledge-document.module.less";

export const KnowledgeDocument = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const total = ref(0);
    const queryState = useCubeQueryState({
      storage: "url",
      initialState: {
        keyword: "",
        productId: "",
        deptId: "",
        typeId: "",
        pageNumber: 1,
        pageSize: 10,
      },
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") {
          return Number(raw);
        }
        if (raw === "true") return true;
        if (raw === "false") return false;
        if (raw.includes(",")) return raw.split(",");
        return raw;
      },
    });
    const selectedRowKeysData = ref<string[]>([]);
    const searchValue = ref<string>("");

    const typeOptions = ref<KnowledgeDocumentTypeModel[]>([]);
    const expandedKeys = ref<string[]>([]);

    const searchFormSchema = [
      {
        component: ProductSelect,
        label: "关联产品",
        fieldName: "productId",
        componentProps: {
          placeholder: "关联产品",
        },
      },
      {
        component: DeptCascaderSelect,
        label: "所属部门",
        fieldName: "deptId",
        componentProps: {
          placeholder: "所属部门",
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "文档名称",
        },
      },
    ];
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      queryState,
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: () => {
        tableApi.query();
      },
      handleReset: () => {
        tableApi.query();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    });
    const columns = [
      {
        title: "文档名称",
        dataIndex: "name",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "文档类型",
        dataIndex: "typeName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "文档格式",
        dataIndex: "format",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "文档大小",
        dataIndex: "size",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: number }): JSX.Element => {
          const size = text ? `${(text / 1024 / 1024).toFixed(2)} MB` : "--";
          return <PopOver content={size}>{size}</PopOver>;
        },
      },
      {
        title: "条目数",
        dataIndex: "entryCount",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: number }): JSX.Element => {
          const value = text ?? 0;
          return <PopOver content={String(value)}>{value}</PopOver>;
        },
      },
      {
        title: "关联产品",
        dataIndex: "productName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "所属部门",
        dataIndex: "deptName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "上传人",
        dataIndex: "createBy",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "更新时间",
        dataIndex: "updateTime",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = dayjs(text).format("YYYY-MM-DD HH:mm:ss");
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        slots: {
          customRender: "action",
        },
        width: 250,
        align: "center",
        customRender: ({ record }: { record: KnowledgeDocumentModel }): JSX.Element => {
          return (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  handleDowload(record);
                }}
              >
                下载
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  handleShow(record);
                }}
              >
                查看
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  handleEdit(record);
                }}
              >
                编辑
              </Button>
              <PopConfirm
                title="确认删除该项？"
                onConfirm={() => {
                  deleteRow(record);
                }}
              >
                <Button type="link" size="small" danger>
                  删除
                </Button>
              </PopConfirm>
            </>
          );
        },
      },
    ];
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      rowSelection: "checkbox",
      queryState,
      fetchApi: async () => {
        const params = {
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          name: (formApi.formValues.keyword as string) ?? "",
          typeId: queryState.state.typeId,
          deptId: (formApi.formValues.deptId as string) ?? "",
          productId: (formApi.formValues.productId as string) ?? "",
        };
        return cubeKnowledgeDocumentService.getKnowledgeDocumentList(params);
      },
      rowSelectionChange: (keys) => {
        selectedRowKeysData.value = keys as string[];
      },
      fetchLoaded: (data) => {
        total.value = data.total;
      },
    });
    const handleChange = (pageNumber: number, pageSize: number): void => {
      queryState.setPage(pageNumber, pageSize);
      tableApi.query();
    };
    const featureModalRef = ref<{ openModal: (record?: KnowledgeDocumentModel, readonly?: boolean) => void }>();
    const featureUploadModalRef = ref<{ openModal: () => void }>();
    const handleAddList = (): void => {
      featureUploadModalRef.value?.openModal();
    };
    const handleAdd = (): void => {
      featureModalRef.value?.openModal();
    };
    const handleEdit = (record: KnowledgeDocumentModel): void => {
      featureModalRef.value?.openModal(record);
    };
    const handleDowload = (record: KnowledgeDocumentModel): void => {
      const fileName = record.fileList[0].name;
      const filePath = record.fileList[0].path;
      fileDownLoad(fileName, filePath);
    };
    const handleShow = (record: KnowledgeDocumentModel): void => {
      if (record.fileList.length === 0) {
        message.error("该文档无文件");
        return;
      }
      const item = record.fileList[0];
      if (typeList.includes(item.type ?? "")) {
        kkFilePreview(item);
      } else {
        showImagePreview([item.path], 0);
      }
    };
    const deleteRow = async (record: KnowledgeDocumentModel): Promise<void> => {
      try {
        await cubeKnowledgeDocumentService.deleteKnowledgeDocument({ idList: [record.id ?? ""] });
        message.success("操作成功");
        tableApi.query();
      } catch {
        message.error("操作失败");
      }
    };

    const handleBatchDelete = (): void => {
      if (!selectedRowKeysData.value.length) {
        message.error("请选择要删除的文件");
        return;
      }
      AntModal.confirm({
        title: "删除",
        content: "确定要删除选中的文件吗？",
        onOk: async () => {
          try {
            await cubeKnowledgeDocumentService.deleteKnowledgeDocument({ idList: selectedRowKeysData.value });
            message.success("操作成功");
            tableApi.query();
          } catch {
            message.error("操作失败");
          } finally {
            selectedRowKeysData.value = [];
          }
        },
      });
    };

    const handleTypeSearch = (): void => {
      cubeKnowledgeDocumentService.getKnowledgeTypeTreeList({ name: searchValue.value }).then((res) => {
        typeOptions.value = res;
      });
    };

    const leftWidth = ref(250);
    const isDragging = ref(false);
    const startX = ref(0);
    const startWidth = ref(0);

    // 处理鼠标按下事件
    const handleMouseDown = (e: MouseEvent): void => {
      e.preventDefault();
      isDragging.value = true;
      startX.value = e.clientX;
      startWidth.value = leftWidth.value;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none"; // 防止拖动时选中文本
    };

    // 处理鼠标移动事件
    const handleMouseMove = (e: MouseEvent): void => {
      if (!isDragging.value) return;

      const diff = e.clientX - startX.value;
      const newLeftWidth = startWidth.value + diff;

      // 限制最小和最大宽度
      const minWidth = 200;
      const maxWidth = 600;
      leftWidth.value = Math.min(maxWidth, Math.max(minWidth, newLeftWidth));
    };

    // 处理鼠标释放事件
    const handleMouseUp = (): void => {
      isDragging.value = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    onMounted(() => {
      handleTypeSearch();
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    });

    onUnmounted(() => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    });

    const slots = {
      "layout-header": (): JSX.Element => {
        return (
          <div class={styles.btns}>
            <Button type="primary" onClick={handleAddList}>
              批量上传
            </Button>
            <Button type="primary" onClick={handleAdd}>
              新增
            </Button>
          </div>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <div class={styles["page-flex"]}>
            <div class={styles["page-left"]} style={{ width: `${leftWidth.value}px` }}>
              <InputSearch
                v-model:value={searchValue.value}
                style="margin-bottom: 8px; margin-top: 10px;"
                placeholder="文档类型名称"
                onSearch={handleTypeSearch}
              />
              <div class={styles["page-left-tree"]}>
                <Tree
                  fieldNames={{ title: "name", key: "id", children: "children" }}
                  treeData={typeOptions.value}
                  expandedKeys={expandedKeys.value}
                  selectedKeys={queryState.state.typeId ? [queryState.state.typeId] : []}
                  autoExpandParent={true}
                  onSelect={(e: string[]) => {
                    queryState.update({ typeId: e[0] ?? "" });
                    queryState.writeCache();
                    tableApi.query();
                  }}
                  onExpand={(e: string[]) => {
                    expandedKeys.value = e;
                  }}
                />
              </div>
            </div>
            <div class={styles.divider} onMousedown={handleMouseDown} />
            <div class={styles["page-right"]}>
              <CubeForm />
              <CubeTable />
            </div>
          </div>
        );
      },
      "footer-btn": (): JSX.Element => {
        return (
          <>
            <span style={{ marginRight: "10px" }}>已选{selectedRowKeysData.value.length}项</span>
            <Button type="primary" danger onClick={handleBatchDelete}>
              删除
            </Button>
          </>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <Page
            current={queryState.state.pageNumber}
            pageSize={queryState.state.pageSize}
            total={total.value}
            onPageChange={handleChange}
          />
        );
      },
    };
    return (): JSX.Element => (
      <CubeLayout title={pageTitle ?? "知识文档"} v-slots={slots}>
        <KnowledgeDocumentModal
          ref={featureModalRef}
          title={pageTitle ?? "知识文档"}
          onEnter={() => {
            tableApi.query();
          }}
        />
        <KnowledgeDocumentUploadModal
          ref={featureUploadModalRef}
          onEnter={() => {
            tableApi.query();
          }}
        />
      </CubeLayout>
    );
  },
});
