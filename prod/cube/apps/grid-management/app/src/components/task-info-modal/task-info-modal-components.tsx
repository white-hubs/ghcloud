import { cubeGridManagementService, cubeWorkCenterService } from "../../api/server";
import useListOperate from "./use-list-operate";
import useTaskStatus from "./use-status";
import { useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, Page, PopOver } from "@ghcloud/cube-ui";
import type { TaskRecord } from "@ghcloud/cube-work-center-service";
import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, toRef } from "vue";

export const TaskRecords = defineComponent({
  props: {
    areaId: {
      type: String,
      required: true,
    },
  },
  emits: ["close"],
  setup: (props, { emit }) => {
    const searchParams = reactive<{
      pageNumber: number;
      pageSize: number;
      total: number;
      status: string;
      keyword: string;
      period: string;
      businessTypes: string[] | undefined;
    }>({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: "",
      status: "",
      businessTypes: undefined,
      period: "",
    });
    const taskStatusOptions = useTaskStatus(toRef(searchParams, "businessTypes"));
    const { operate } = useListOperate();
    const workCenterColumns = [
      {
        dataIndex: "taskTime",
        title: "任务时间",
        slots: {
          customRender: "taskTime",
        },
        align: "center",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={time || ""}>{time || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "taskName",
        title: "任务名称",
        slots: {
          customRender: "taskName",
        },
        align: "center",
        width: 200,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "businessTypeName",
        title: "业务来源",
        width: 100,
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "businessStatusName",
        title: "任务状态",
        width: 100,
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "action",
        title: "操作",
        width: 100,
        align: "center",
        customRender: ({ record }: { record: TaskRecord }): JSX.Element => {
          const type = record?.status === "TODO" ? "waiting" : record?.status === "DONE" ? "done" : "waiting";
          return (
            <Button
              type="link"
              size="small"
              onClick={() => {
                operate(record, type);
                emit("close");
              }}
            >
              详情
            </Button>
          );
        },
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns: workCenterColumns,
      rowKey: "id",
      fetchApi: async () => {
        const params = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          name: searchParams.keyword ?? "",
          period: searchParams.period,
          status: searchParams.status,
          businessTypes: searchParams.businessTypes ? searchParams.businessTypes.join(",") : "",
          gridAreaId: props.areaId,
          dailyType: "GRID_MANAGE",
        };
        return cubeGridManagementService.getMyGridTaskList(params);
      },
      fetchLoaded: (data: any) => {
        searchParams.total = data.total;
      },
    });

    const formSchema = [
      {
        component: "Select",
        label: "业务来源",
        fieldName: "businessTypes",
        componentProps: {},
      },
      {
        component: "Select",
        label: "任务状态",
        fieldName: "status",
        defaultValue: undefined,
        componentProps: {
          allowClear: true,
          options: taskStatusOptions,
          placeholder: "请选择任务状态",
          onChange: (value: string): void => {
            searchParams.pageNumber = 1;
            searchParams.status = value;
            tableApi.query();
          },
        },
      },
      {
        component: "RangePicker",
        label: "任务时间",
        fieldName: "period",
        componentProps: {
          styles: {
            width: "100%",
          },
          valueFormat: "YYYY-MM-DD",
          allowClear: true,
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "任务名称",
        },
      },
    ];

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      schema: formSchema,
      showCollapseButton: true,
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: (data) => {
        searchParams.period = data.period ? (data.period as [string, string]).join(",") : "";
        searchParams.keyword = data.keyword ? (data.keyword as string) : "";
        searchParams.businessTypes = data.businessTypes ? (data.businessTypes as string[]) : undefined;
        searchParams.status = data.status ? (data.status as string) : "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.period = "";
        searchParams.keyword = "";
        searchParams.status = "";
        searchParams.businessTypes = undefined;
        searchParams.pageNumber = 1;
        tableApi.query();
      },
    });

    onMounted(async () => {
      const res = await cubeGridManagementService.getGridTaskSource();
      const schema = {
        component: "Select",
        label: "业务来源",
        fieldName: "businessTypes",
        defaultValue: [],
        componentProps: {
          options: res,
          placeholder: "请选择业务来源",
          allowClear: true,
          mode: "multiple",
          fieldNames: { label: "name", value: "code" },
          onChange: (value: string[]): void => {
            searchParams.businessTypes = value;
            tableApi.query();
          },
        },
      };
      formApi.updateFieldSchema(schema);
      formApi.setFieldValue("businessTypes", undefined);
      formApi.setFieldValue("status", undefined);
    });

    return (): JSX.Element => (
      <div style={{ padding: "20px", paddingTop: "0", boxSizing: "border-box" }}>
        <CubeForm />
        <CubeTable />
        <div style={{ paddingTop: "10px", display: "flex", justifyContent: "flex-end" }}>
          <Page
            v-model:current={searchParams.pageNumber}
            v-model:pageSize={searchParams.pageSize}
            v-model:total={searchParams.total}
            onPageChange={(pageNumber: number, pageSize: number): void => {
              searchParams.pageNumber = pageNumber || 1;
              searchParams.pageSize = pageSize;
              tableApi.query();
            }}
          />
        </div>
      </div>
    );
  },
});
