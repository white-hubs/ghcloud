import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, Page, PopConfirm, PopOver, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { defineComponent, reactive } from "vue";
import { useRoute } from "vue-router";
import { cubeSiteGeneratorService } from "@/api/service";
import type { SiteLayoutVO } from "@ghcloud/cube-static-site-generator-service";
import { deleteMockLayout, getMockLayoutList, type LayoutItem } from "./mock";

/** 页面管理布局列表 */
export const PageManagementLayoutList = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const tableQuery = { run: (): void => {} };

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
          placeholder: "布局名称",
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

    const handleDelete = async (record: SiteLayoutVO): Promise<void> => {
      try {
        await cubeSiteGeneratorService.deleteLayout({ id: record.id });
        message.success("操作成功");
        tableQuery.run();
      } catch (error) {
        message.error("操作失败");
      }
    };

    const columns = [
      {
        title: "布局名称",
        dataIndex: "layoutName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
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
        customRender: ({ record }: { record: SiteLayoutVO }): JSX.Element => (
          <>
            <Button type="link" size="small" onClick={() => history.pushState({}, "", `/portal/site-generator/page-management/layout-design?id=${record.id}&mode=edit`)}>
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
        const list = await cubeSiteGeneratorService.getLayoutList();
        const kw = ((formApi.formValues.keyword as string) ?? "").trim().toLowerCase();
        const filtered = kw
          ? list.filter((item) => (item.layoutName ?? "").toLowerCase().includes(kw))
          : list;
        const start = (page.pageNumber - 1) * page.pageSize;
        const records = filtered.slice(start, start + page.pageSize);
        return { records, total: filtered.length, pages: Math.ceil(filtered.length / page.pageSize) };
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
        <Button type="primary" onClick={() => history.pushState({}, "", "/portal/site-generator/page-management/layout-design?mode=add")}>新增</Button>
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
