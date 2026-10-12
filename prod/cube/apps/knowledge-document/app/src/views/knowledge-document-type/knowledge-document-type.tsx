import { defineComponent, ref } from "vue";

import { CubeLayout, useCubeForm, useCubeQueryState } from "@ghcloud/cube-app-design";
import type { KnowledgeDocumentTypeModel } from "@ghcloud/cube-knowledge-document-service";
import { Button, PopOver, PopConfirm, Table, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { KnowledgeDocumentTypeModal } from "./knowledge-document-type-modal";
import { cubeKnowledgeDocumentService } from "@/api/service";
import { useTableScroll } from "@/hook/use-table-scroll";

import styles from "./knowledge-document-type.module.less";

export const KnowledgeDocumentType = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const queryState = useCubeQueryState({
      storage: "url",
      initialState: {
        keyword: "",
      },
    });
    const searchFormSchema = [
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "类型名称",
        },
      },
    ];

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      queryState,
      onHydratedQuery: () => {
        getDataSource();
      },
      handleSubmit: () => {
        getDataSource();
      },
      handleReset: () => {
        getDataSource();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    });

    const columns = [
      {
        title: "图标",
        dataIndex: "icon",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: KnowledgeDocumentTypeModel }): JSX.Element => {
          const path = record?.icon?.path;
          if (path) {
            return <img src={path} alt="" style={{ width: 32, height: 32, objectFit: "contain", verticalAlign: "middle" }} />;
          }
          return <span>--</span>;
        },
      },
      {
        title: "文件类型",
        dataIndex: "name",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "备注",
        dataIndex: "description",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "近30天新增",
        dataIndex: "entryCount30d",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: number }): JSX.Element => {
          const value = text ?? 0;
          return <PopOver content={String(value)}>{value}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        slots: {
          customRender: "action",
        },
        width: 250,
        customRender: ({ record }: { record: KnowledgeDocumentTypeModel }): JSX.Element => {
          return (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  handleAddSub(record);
                }}
              >
                新增下级
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  editRow(record);
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
    const dataSource = ref<KnowledgeDocumentTypeModel[]>([]);
    const getDataSource = async (): Promise<void> => {
      const params = {
        name: (formApi.formValues.keyword as string) ?? "",
      };
      const data = await cubeKnowledgeDocumentService.getKnowledgeTypeTreeList(params);
      dataSource.value = data;
      // dataSource.value = filterEmptyChildren(data)
    };
    const spaceModalRef = ref<{ openModal: (record?: KnowledgeDocumentTypeModel, addSub?: boolean) => void }>();
    const handleAdd = (): void => {
      spaceModalRef.value?.openModal();
    };
    const handleAddSub = (record: KnowledgeDocumentTypeModel): void => {
      spaceModalRef.value?.openModal(record, true);
    };
    const editRow = (record: KnowledgeDocumentTypeModel): void => {
      spaceModalRef.value?.openModal(record);
    };
    const deleteRow = async (record: KnowledgeDocumentTypeModel): Promise<void> => {
      try {
        if (record?.children && record?.children?.length > 0) {
          message.warn("当前区域有下属区域，无法删除");
          return;
        }
        await cubeKnowledgeDocumentService.deleteKnowledgeType({ id: record?.id ?? "" });
        message.success("操作成功");
        getDataSource();
      } catch {
        message.error("操作失败");
      }
    };
    const { scrollY } = useTableScroll();
    const slots = {
      "layout-header": (): JSX.Element => {
        return (
          <div class={styles.btns}>
            <Button type="primary" onClick={handleAdd}>
              新增
            </Button>
          </div>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <div>
            <CubeForm />
            <Table
              class={styles.typeTable}
              rowKey="id"
              columns={columns}
              dataSource={dataSource.value}
              pagination={false}
              size="small"
              scrollY={scrollY.value}
            />
          </div>
        );
      },
    };
    return (): JSX.Element => (
      <CubeLayout title={pageTitle ?? "文档类型"} v-slots={slots}>
        <KnowledgeDocumentTypeModal
          ref={spaceModalRef}
          title={pageTitle ?? "文档类型"}
          onEnter={() => {
            getDataSource();
          }}
        />
      </CubeLayout>
    );
  },
});
