import { defineComponent } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { SitePageVO } from "@ghcloud/cube-static-site-generator-service";
import { Button, PopConfirm, PopOver, Switch, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeSiteGeneratorService } from "@/api/service";

const BUILTIN_ROUTES = new Set(["/information.html", "/information/detail-{id}.html", "/consultation.html"]);

/** 页面管理列表 */
export const PageManagementList = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const tableQuery = { run: (): void => {} };

    const searchFormSchema = [
      {
        component: "Input",
        label: "",
        fieldName: "metaTitle",
        componentProps: {
          placeholder: "页面标题",
        },
      },
      {
        component: "Select",
        label: "",
        fieldName: "status",
        componentProps: {
          placeholder: "状态",
          options: [
            { label: "全部", value: undefined },
            { label: "启用", value: 1 },
            { label: "禁用", value: 0 },
          ],
          allowClear: true,
        },
      },
    ];
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: () => {
        tableQuery.run();
      },
      handleReset: () => {
        tableQuery.run();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    });

    const handleDelete = async (record: SitePageVO): Promise<void> => {
      try {
        await cubeSiteGeneratorService.deletePage({ id: record.id });
        message.success("操作成功");
        tableQuery.run();
      } catch {
        message.error("操作失败");
      }
    };

    const handleToggleStatus = async (record: SitePageVO, checked: boolean): Promise<void> => {
      try {
        const detail = await cubeSiteGeneratorService.getPageDetail({ id: record.id });
        await cubeSiteGeneratorService.updatePage({
          id: record.id,
          pageName: detail.pageName,
          pageRoute: detail.pageRoute,
          layoutId: detail.layoutId,
          metaNavStyle: detail.metaNavStyle,
          metaTitle: detail.metaTitle,
          metaDescription: detail.metaDescription,
          metaKeywords: detail.metaKeywords,
          components: detail.components as string,
          status: checked ? 1 : 0,
        });
        message.success("操作成功");
        tableQuery.run();
      } catch {
        message.error("操作失败");
      }
    };

    const columns = [
      {
        title: "页面名称",
        dataIndex: "pageName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "页面路由",
        dataIndex: "pageRoute",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "页面标题",
        dataIndex: "metaTitle",
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
        title: "状态",
        dataIndex: "status",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: SitePageVO }): JSX.Element => {
          const isBuiltin = BUILTIN_ROUTES.has(record.pageRoute) || record.pageRoute === "/";
          return (
            <Switch
              checked={Number(record.status) === 1}
              checkedChildren="启用"
              unCheckedChildren="禁用"
              disabled={isBuiltin}
              onChange={(checked: boolean): void => {
                handleToggleStatus(record, checked);
              }}
            />
          );
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        slots: { customRender: "action" },
        fixed: "right",
        width: 180,
        customRender: ({ record }: { record: SitePageVO }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => history.pushState({}, "", `/portal/site-generator/page-management/design?id=${record.id}&mode=edit`)}
            >
              编辑
            </Button>
            {BUILTIN_ROUTES.has(record.pageRoute) || record.pageRoute === "/" ? (
              <Button type="link" size="small" disabled>
                删除
              </Button>
            ) : (
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
            )}
          </>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: async () => {
        const kw = ((formApi.formValues.metaTitle as string) ?? "").trim().toLowerCase();
        const status = formApi.formValues.status as number | undefined;
        const params: any = {};
        if (kw) {
          params.metaTitle = kw;
        }
        if (status !== undefined && status !== null) {
          params.status = status;
        }
        const list = await cubeSiteGeneratorService.getPageList(Object.keys(params).length > 0 ? params : undefined);
        let filtered = list;
        if (kw) {
          filtered = filtered.filter(
            (item) => (item.metaTitle ?? "").toLowerCase().includes(kw) || (item.pageRoute ?? "").toLowerCase().includes(kw),
          );
        }
        if (status !== undefined && status !== null) {
          filtered = filtered.filter((item) => item.status === status);
        }
        return { records: filtered, total: filtered.length, pages: 1 };
      },
    });

    tableQuery.run = (): void => {
      tableApi.query();
    };

    const slots = {
      "layout-header": (): JSX.Element => (
        <Button type="primary" onClick={() => history.pushState({}, "", "/portal/site-generator/page-management/design?mode=add")}>
          新增
        </Button>
      ),
      "layout-content": (): JSX.Element => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
    };

    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={slots} showFooter={false}></CubeLayout>;
  },
});
