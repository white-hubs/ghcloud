import { cubeDailyTaskService } from "@/api/server";
import { getTaskTypeLabel } from "@/utils/daily-task-edit-common";
import { CubeLayout, DailyTaskTypeSelect, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { DailyTaskTargetCategoryOptions, getCurrentDailyType, initDailyTypeFromRoute } from "@ghcloud/cube-daily-task-service";
import { Button, PopOver, Page, PopConfirm, message, Switch, AntModal } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { defineComponent, reactive } from "vue";
import { useRoute } from "vue-router";

/** 任务标准 */
export const TaskStandard = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    initDailyTypeFromRoute(route);
    const routeName = "task-standard";
    const tableCode = route.path.replaceAll("/", "");
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      keyword: "",
      targetType: "",
      categoryId: "",
      total: 0,
    });

    const searchFormSchema = [
      {
        component: DailyTaskTypeSelect,
        label: getTaskTypeLabel(getCurrentDailyType()),
        fieldName: "categoryId",
        defaultValue: null,
        componentProps: {
          placeholder: `请选择${getTaskTypeLabel(getCurrentDailyType())}`,
        },
      },
      {
        component: "Select",
        label: "关联对象类型",
        fieldName: "targetType",
        defaultValue: null,
        componentProps: {
          placeholder: "关联对象类型",
          options: DailyTaskTargetCategoryOptions,
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "标准名称",
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
        searchParams.categoryId = (data.categoryId as string) ?? "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.keyword = "";
        searchParams.targetType = "";
        searchParams.categoryId = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    });

    const columns = [
      {
        title: "标准名称",
        dataIndex: "name",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "适用类型",
        dataIndex: "categoryNames",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "关联对象",
        dataIndex: "targetTypeRelationStr",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "enable",
        title: "停用/启用",
        align: "center",
        slots: {
          customRender: "enable",
        },
        fixed: "right",
        customRender: ({ record }: { record: { enable: boolean; name: string; id: string } }): JSX.Element => (
          <Switch
            v-model:checked={record.enable}
            checkedValue
            unCheckedValue={false}
            onChange={() => {
              AntModal.confirm({
                title: `是否确认${record.enable ? "启用" : "禁用"}标准${record.name}`,
                onOk: async () => {
                  try {
                    await cubeDailyTaskService.updateStandardEnable({
                      id: record.id,
                      enable: record.enable,
                    });
                    message.success(`${record.enable ? "启用" : "禁用"}成功`);
                    tableApi.query();
                  } catch (error) {
                    const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
                    message.error(errorMessage || "请求失败");
                  }
                },
                onCancel: () => {
                  record.enable = !record.enable;
                },
              });
            }}
            checked-children="启用"
            un-checked-children="禁用"
          />
        ),
      },
      {
        dataIndex: "action",
        title: "操作",
        slots: {
          customRender: "action",
        },
        fixed: "right",
        width: 180,
        customRender: ({ record }: { record: { id: string } }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                detailRow(record.id);
              }}
            >
              详情
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                editRow(record.id);
              }}
            >
              编辑
            </Button>
            <PopConfirm
              title="确认删除该项？"
              onConfirm={() => {
                deleteRow(record.id);
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
          name: searchParams.keyword ?? "",
          targetType: searchParams.targetType ?? "",
          categoryId: searchParams.categoryId ?? "",
        };
        return cubeDailyTaskService.getDailyStandardPage(params);
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
      history.pushState({}, "", `/portal/daily-task/task-standard-form?type=add`);
    };
    const editRow = (id: string): void => {
      history.pushState({}, "", `/portal/daily-task/task-standard-form?type=edit&id=${id}`);
    };
    const detailRow = (id: string): void => {
      history.pushState({}, "", `/portal/daily-task/task-standard-form?type=detail&id=${id}`);
    };
    const deleteRow = async (id: string): Promise<void> => {
      try {
        await cubeDailyTaskService.deleteStandard(id);
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
