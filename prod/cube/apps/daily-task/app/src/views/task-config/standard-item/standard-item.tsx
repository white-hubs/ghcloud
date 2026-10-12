import { cubeDailyTaskService } from "@/api/server";
import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { DailyTaskTargetCategoryOptions, getCurrentDailyType } from "@ghcloud/cube-daily-task-service";
import type { StandardItemModel } from "@ghcloud/cube-daily-task-service";
import { initDailyTypeFromRoute } from "@ghcloud/cube-daily-task-service";
import { Button, PopOver, Page, PopConfirm, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { defineComponent, reactive } from "vue";
import { useRoute } from "vue-router";

/** 标准项列表 */
export const StandardItem = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    initDailyTypeFromRoute(route);
    const routeName = "standard-item";
    const tableCode = route.path.replaceAll("/", "");
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      keyword: "",
      targetType: "",
      total: 0,
    });

    const searchFormSchema = [
      {
        component: "Select",
        label: "适用对象类型",
        fieldName: "targetType",
        defaultValue: null,
        componentProps: {
          placeholder: "适用对象类型",
          options: DailyTaskTargetCategoryOptions,
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "标准项名称",
        },
      },
    ];
    const [CubeForm] = useCubeForm({
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      layout: "horizontal",
      handleSubmit: (data) => {
        searchParams.keyword = (data.keyword as string) ?? "";
        searchParams.targetType = (data.targetType as string) ?? "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.keyword = "";
        searchParams.targetType = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    });

    const columns = [
      {
        title: "标准项名称",
        dataIndex: "itemName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "标准项内容",
        dataIndex: "itemContent",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "结果项",
        dataIndex: "resultId",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: StandardItemModel }): JSX.Element => {
          const text = record.resultLabelList.map((item) => item.label).join(" ");
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "适用对象",
        dataIndex: "targetTypes",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: StandardItemModel }): JSX.Element => {
          const text = record.targetTypes
            .map((item) => DailyTaskTargetCategoryOptions.find((option) => option.value === item)?.label || "--")
            .join("、");
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        slots: {
          customRender: "action",
        },
        fixed: "right",
        width: 180,
        customRender: ({ record }: { record: StandardItemModel }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                detailRow(record.itemId);
              }}
            >
              详情
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                editRow(record.itemId);
              }}
            >
              编辑
            </Button>
            <PopConfirm
              title="确认删除该项？"
              onConfirm={() => {
                deleteRow(record.itemId);
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
    const page = reactive({
      pageNumber: searchParams.pageNumber,
      pageSize: searchParams.pageSize,
      total: searchParams.total,
    });
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: async () => {
        const params = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          dailyType: getCurrentDailyType(),
          itemName: searchParams.keyword ?? "",
          targetType: searchParams.targetType ?? "",
        };
        return cubeDailyTaskService.getStandardItemPage(params);
      },
      fetchLoaded: (data) => {
        page.total = data.total;
        searchParams.total = data.total;
        page.pageNumber = searchParams.pageNumber;
        page.pageSize = searchParams.pageSize;
      },
    });
    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber;
      page.pageSize = pageSize;
      searchParams.pageNumber = pageNumber;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };
    const handleAdd = (): void => {
      history.pushState({}, "", `/portal/daily-task/standard-item-form?type=add`);
    };
    const editRow = (id: string): void => {
      history.pushState({}, "", `/portal/daily-task/standard-item-form?type=edit&id=${id}`);
    };
    const detailRow = (id: string): void => {
      history.pushState({}, "", `/portal/daily-task/standard-item-form?type=detail&id=${id}`);
    };
    const deleteRow = async (id: string): Promise<void> => {
      try {
        await cubeDailyTaskService.deleteStandardItem(id);
        message.success("操作成功");
        tableApi.query();
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
      }
    };
    const slots = {
      "layout-header": (): JSX.Element => (
        <Button type="primary" onClick={handleAdd}>
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
        <Page current={page.pageNumber} pageSize={page.pageSize} total={page.total} onPageChange={handleChange} />
      ),
    };
    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={slots} />;
  },
});
