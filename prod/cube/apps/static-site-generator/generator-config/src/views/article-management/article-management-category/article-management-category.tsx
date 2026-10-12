import { defineComponent, reactive, ref, type PropType } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm, useCubeModal, useCubeTable } from "@ghcloud/cube-app-design";
import type { ArticleCategoryTree } from "@ghcloud/cube-static-site-generator-service";
import { Button, Form, FormItem, Input, InputNumber, Page, PopConfirm, PopOver, Switch, message, type FormExpose } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeSiteGeneratorService } from "@/api/service";

const ROOT_PARENT_ID = "0";

/** 文章分类弹窗 */
const ArticleCategoryModal = defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    record: {
      type: Object as PropType<ArticleCategoryTree>,
      required: false,
    },
  },
  emits: ["enter", "cancel"],
  setup(props, { emit }) {
    const formRenderRef = ref<FormExpose>();
    const formState = reactive<{
      id: string | undefined;
      categoryName: string;
      pathId: string;
      sort: number;
      status: boolean;
    }>({
      id: undefined,
      categoryName: "",
      pathId: ROOT_PARENT_ID,
      sort: 0,
      status: true,
    });
    const modalRules = {
      categoryName: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
    };

    const [CubeModal, modalApi] = useCubeModal({
      title: props.record ? `编辑${props.title}` : `新增${props.title}`,
      onConfirm: async () => {
        try {
          modalApi.setState({ confirmLoading: true });
          await formRenderRef.value?.validate();
          const sort = formState.sort ?? 0;
          const status = formState.status ? 1 : 0;
          if (formState.id) {
            await cubeSiteGeneratorService.updateArticleCategory({
              id: formState.id,
              categoryName: formState.categoryName.trim(),
              pathId: formState.pathId || ROOT_PARENT_ID,
              sort,
              status,
            });
          } else {
            await cubeSiteGeneratorService.addArticleCategory({
              categoryName: formState.categoryName.trim(),
              pathId: ROOT_PARENT_ID,
              sort,
              status,
            });
          }
          message.success("操作成功");
          modalApi.close();
          emit("enter");
        } catch (error) {
          const errorFields = (error as { errorFields: unknown })?.errorFields;
          !errorFields && message.error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
        } finally {
          modalApi.setState({ confirmLoading: false });
        }
      },
      onCancel: () => {
        formRenderRef.value?.resetFields();
        modalApi.close();
        emit("cancel");
      },
    });

    const openModal = async (record?: ArticleCategoryTree): Promise<void> => {
      formState.id = undefined;
      formState.categoryName = "";
      formState.pathId = ROOT_PARENT_ID;
      formState.sort = 0;
      formState.status = true;
      if (record) {
        modalApi.setState({ title: `编辑${props.title}` });
        formState.id = record.id;
        formState.categoryName = record.categoryName;
        formState.pathId = record.pathId && record.pathId !== "" ? record.pathId : ROOT_PARENT_ID;
        formState.sort = record.sort;
        formState.status = Number(record.status) === 1;
      } else {
        modalApi.setState({ title: `新增${props.title}` });
      }
      modalApi.open();
    };

    const modalSlots = {
      default: (): JSX.Element => (
        <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: "100px" } }}>
          <FormItem label="分类名称" name="categoryName">
            <Input v-model:value={formState.categoryName} placeholder="请输入分类名称" maxlength={64} />
          </FormItem>
          <FormItem label="排序" name="sort">
            <InputNumber status="" v-model:value={formState.sort} min={0} max={999} step={1} style={{ width: "100%" }} />
          </FormItem>
          <FormItem label="显示状态" name="status">
            <Switch v-model:checked={formState.status} checkedChildren="显示" unCheckedChildren="隐藏" />
          </FormItem>
        </Form>
      ),
    };

    return { CubeModal, modalSlots, openModal };
  },
  render() {
    return <this.CubeModal v-slots={this.modalSlots} />;
  },
});

/** 文章管理分类 */
export const ArticleManagementCategory = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const tableQuery = { run: (): void => {} };
    const modalRef = ref<{ openModal: (record?: ArticleCategoryTree) => Promise<void> }>();

    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const searchFormSchema = [
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "分类名称",
        },
      },
    ];
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: () => {
        page.pageNumber = 1;
        tableQuery.run();
      },
      handleReset: () => {
        page.pageNumber = 1;
        tableQuery.run();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    });

    const handleDelete = async (record: ArticleCategoryTree): Promise<void> => {
      try {
        await cubeSiteGeneratorService.deleteArticleCategory({ id: record.id });
        message.success("操作成功");
        tableQuery.run();
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
      }
    };

    const columns = [
      {
        title: "分类名称",
        dataIndex: "categoryName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "排序",
        dataIndex: "sort",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: number }): JSX.Element => <PopOver content={String(text ?? 0)}>{text ?? 0}</PopOver>,
      },
      {
        title: "显示状态",
        dataIndex: "status",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: ArticleCategoryTree }): JSX.Element => (
          <Switch
            {...{
              checked: Number(record.status) === 1,
              checkedChildren: "显示",
              unCheckedChildren: "隐藏",
              onChange: async (): Promise<void> => {
                try {
                  await cubeSiteGeneratorService.updateArticleCategoryStatus({ id: record.id });
                  message.success("操作成功");
                  tableQuery.run();
                } catch (error) {
                  message.error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
                }
              },
            }}
          />
        ),
      },
      {
        title: "创建时间",
        dataIndex: "createdTime",
        ellipsis: true,
        align: "center",
        customRender: (): JSX.Element => <span>--</span>,
      },
      {
        title: "更新时间",
        dataIndex: "updatedTime",
        ellipsis: true,
        align: "center",
        customRender: (): JSX.Element => <span>--</span>,
      },
      {
        dataIndex: "action",
        title: "操作",
        slots: { customRender: "action" },
        fixed: "right",
        width: 180,
        customRender: ({ record }: { record: ArticleCategoryTree }): JSX.Element => (
          <>
            <Button type="link" size="small" onClick={() => modalRef.value?.openModal(record)}>
              编辑
            </Button>
            <PopConfirm
              title="确认删除该项？"
              onConfirm={() => {
                handleDelete(record);
              }}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: async () => {
        const tree = await cubeSiteGeneratorService.getArticleCategoryTree();
        const kw = ((formApi.formValues.keyword as string) ?? "").trim().toLowerCase();
        // 只取一级节点，过滤子节点
        let list = tree.map((item) => ({ ...item, children: undefined }));
        if (kw) {
          list = list.filter((item) => (item.categoryName ?? "").toLowerCase().includes(kw));
        }
        const start = (page.pageNumber - 1) * page.pageSize;
        const records = list.slice(start, start + page.pageSize);
        return { records, total: list.length, pages: Math.ceil(list.length / page.pageSize) };
      },
      fetchLoaded: (data) => {
        page.total = data.total;
      },
    });

    tableQuery.run = (): void => {
      tableApi.query();
    };

    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber;
      page.pageSize = pageSize;
      tableQuery.run();
    };

    const slots = {
      "layout-header": (): JSX.Element => (
        <Button type="primary" onClick={() => modalRef.value?.openModal()}>
          新增
        </Button>
      ),
      "layout-content": (): JSX.Element => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          showSizeChanger={true}
          showQuickJumper={true}
          showTotal={(total) => `共 ${total} 条`}
          pageSizeOptions={["10", "20", "30", "40"]}
          current={page.pageNumber}
          pageSize={page.pageSize}
          total={page.total}
          onPageChange={handleChange}
          onShowSizeChange={handleChange}
        />
      ),
    };

    return (): JSX.Element => (
      <CubeLayout title={pageTitle} v-slots={slots}>
        <ArticleCategoryModal
          ref={modalRef}
          title="文章分类"
          onEnter={() => {
            tableQuery.run();
          }}
        />
      </CubeLayout>
    );
  },
});
