import type { ArticleItem } from "./mock";
import { cubeSiteGeneratorService } from "@/api/service";
import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { ArticleCategoryTree } from "@ghcloud/cube-static-site-generator-service";
import { Button, Page, PopConfirm, PopOver, Switch, TreeSelect, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { defineComponent, reactive } from "vue";
import { useRoute } from "vue-router";

const CATEGORY_TREE_FIELD_NAMES = { label: "categoryName", value: "id", children: "children" } as const;

function articleCategoryTreeWithAllRoot(tree: ArticleCategoryTree[]): ArticleCategoryTree[] {
  return [
    {
      id: "",
      categoryName: "全部分类",
      pathId: "",
      sort: 0,
      status: "1",
      articleCount: 0,
      children: tree,
    },
  ];
}

/** 文章管理列表 */
export const ArticleManagementList = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const tableQuery = { run: (): void => {} };
    let categoryOptionsLoaded = false;

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
          placeholder: "文章标题",
        },
      },
      {
        component: TreeSelect,
        label: "",
        fieldName: "categoryId",
        defaultValue: "",
        componentProps: {
          placeholder: "文章分类",
          allowClear: true,
          treeData: [] as ArticleCategoryTree[],
          fieldNames: CATEGORY_TREE_FIELD_NAMES,
          treeDefaultExpandAll: true,
          showSearch: true,
          treeNodeFilterProp: "categoryName",
          style: { minWidth: "200px" },
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

    const handleDelete = async (record: ArticleItem): Promise<void> => {
      try {
        await cubeSiteGeneratorService.deleteArticle({ id: record.id });
        message.success("操作成功");
        tableQuery.run();
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
      }
    };

    const columns = [
      {
        title: "标题",
        dataIndex: "title",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "分类",
        dataIndex: "categoryName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "作者",
        dataIndex: "author",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "显示状态",
        dataIndex: "status",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: ArticleItem }): JSX.Element => (
          <Switch
            {...{
              checked: record.status === 1,
              checkedChildren: "显示",
              unCheckedChildren: "隐藏",
              onChange: async (): Promise<void> => {
                try {
                  await cubeSiteGeneratorService.updateArticleStatus({ id: record.id });
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
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "更新时间",
        dataIndex: "updatedTime",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "action",
        title: "操作",
        slots: { customRender: "action" },
        fixed: "right",
        width: 180,
        customRender: ({ record }: { record: ArticleItem }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => history.pushState({}, "", `/portal/site-generator/article-management/content?id=${record.id}&mode=edit`)}
            >
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
        if (!categoryOptionsLoaded) {
          const tree = await cubeSiteGeneratorService.getArticleCategoryTree();
          formApi.updateFieldSchema({
            component: TreeSelect,
            label: "",
            fieldName: "categoryId",
            defaultValue: "",
            componentProps: {
              placeholder: "文章分类",
              allowClear: true,
              treeData: articleCategoryTreeWithAllRoot(tree),
              fieldNames: CATEGORY_TREE_FIELD_NAMES,
              treeDefaultExpandAll: true,
              showSearch: true,
              treeNodeFilterProp: "categoryName",
              style: { minWidth: "200px" },
            },
          });
          categoryOptionsLoaded = true;
        }
        const categoryId = (formApi.formValues.categoryId as string) ?? "";
        const title = ((formApi.formValues.keyword as string) ?? "").trim();
        return cubeSiteGeneratorService.getArticleList({
          categoryId: categoryId || undefined,
          title: title || undefined,
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
        });
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
        <Button type="primary" onClick={() => history.pushState({}, "", "/portal/site-generator/article-management/content?mode=add")}>
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
          current={page.pageNumber}
          pageSize={page.pageSize}
          total={page.total}
          onPageChange={handleChange}
          onShowSizeChange={handleChange}
        />
      ),
    };

    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={slots}></CubeLayout>;
  },
});
