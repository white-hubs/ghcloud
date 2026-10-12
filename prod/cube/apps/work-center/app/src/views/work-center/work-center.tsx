import dayjs from "dayjs";
import { defineComponent, onMounted, ref, toRef } from "vue";

import { CubeLayout, useCubeForm, useCubeTable, useCubeQueryState } from "@ghcloud/cube-app-design";
import { Button, Page, PopOver } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import type { TaskRecord } from "@ghcloud/cube-work-center-service";

import { cubeWorkCenterService } from "@/api/service";
import useListOperate from "@/hook/use-list-operate";
import useTaskStatus from "@/hook/use-status";

export const taskStatus = {
  TODO: "待处理",
  DONE: "已处理",
  CREATE: "我发布的",
};
export const taskStatusColor = new Map([
  ["TODO", "#1d66ff"],
  ["DONE", "#6ab539"],
  ["CREATE", "#7232dd"],
]);

export const businessTypes = [
  {
    code: "ALARM_TASK",
    name: "报警任务",
  },
  {
    code: "APPROVE_TASK",
    name: "审批任务",
  },
  {
    code: "INSPECT_TASK",
    name: "巡检任务",
  },
  {
    code: "MAINTENACE_TASK",
    name: "维保作业",
  },
  {
    code: "CULTIVATE_TASK",
    name: "培训任务",
  },
  {
    code: "ELECTRONIC_PATROL",
    name: "电子巡更",
  },
  {
    code: "PROPERTY_MANAGEMENT",
    name: "资产管理",
  },
  {
    code: "DAILY_TASK",
    name: "日常任务",
  },
];
export const WorkCenter = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const { buttonText, operate } = useListOperate();

    const queryDefaults = {
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: "",
      status: "",
      businessType: undefined as string[] | undefined,
      period: "",
    };
    type QueryState = typeof queryDefaults;

    const queryState = useCubeQueryState<QueryState>({
      storage: "url",
      initialState: queryDefaults,
      cacheFields: ["keyword", "status", "businessType", "period", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "businessType") {
          return raw ? String(raw).split(",").filter(Boolean) : undefined;
        }
        if (field === "pageNumber" || field === "pageSize") {
          return Number(raw);
        }
        return raw;
      },
    });

    const taskStatusOptions = useTaskStatus(toRef(queryState.state, "businessType"));

    onMounted(async () => {
      const res = await cubeWorkCenterService.getTodoTaskType();
      const schema = {
        component: "Select",
        label: "业务来源",
        fieldName: "businessType",
        componentProps: {
          options: res?.length > 0 ? res : businessTypes,
          placeholder: "请选择业务来源",
          allowClear: true,
          mode: "multiple",
          fieldNames: { label: "name", value: "code" },
          onChange: (value: string[]): void => {
            queryState.state.businessType = value;
            queryState.resetPage();
            queryState.writeCache();
            tableApi.query();
          },
        },
      };
      formApi.updateFieldSchema(schema);
    });
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
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "businessTypeName",
        title: "业务来源",
        width: 100,
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "businessStatusName",
        title: "任务状态",
        width: 100,
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      // {
      //   dataIndex: 'status',
      //   title: '任务状态',
      //   width: 100,
      //   slots: {
      //     customRender: 'status',
      //   },
      //   align: 'center',
      //   ellipsis: true,
      //   customRender: ({ text }: { text: string; }): JSX.Element => {
      //     const textVal = taskStatus[text as keyof typeof taskStatus]
      //     return (
      //       <PopOver
      //         content={textVal || ''}
      //       >
      //         <span style={{ color: taskStatusColor.get(text || '')}}>{textVal || '--'}</span>
      //       </PopOver>
      //     )
      //   },
      // },
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
              }}
            >
              {buttonText(record)}
            </Button>
          );
        },
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns: workCenterColumns,
      rowKey: "id",
      autoFetch: false,
      queryState,
      fetchApi: async () => {
        const params = {
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          name: queryState.state.keyword ?? "",
          period: queryState.state.period,
          status: queryState.state.status,
          businessType: queryState.state.businessType ? queryState.state.businessType.join(",") : "",
          workTagCodes: queryState.state.businessType ? queryState.state.businessType.join(",") : "",
        };
        const res = await cubeWorkCenterService.getWorkTaskPage(params);
        queryState.update({ total: res.total });
        return res;
      },
    });

    const handleChange = (pageNumber: number, pageSize: number) => {
      queryState.setPage(pageNumber, pageSize);
      tableApi.query();
    };

    const formSchema = [
      {
        component: "Select",
        label: "业务来源",
        fieldName: "businessType",
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
      queryState,
      mapFormValuesToQueryState: (values) => ({
        keyword: values.keyword ? String(values.keyword) : "",
        status: values.status ? String(values.status) : "",
        businessType: Array.isArray(values.businessType) ? (values.businessType as string[]) : undefined,
        period:
          values.period && Array.isArray(values.period)
            ? (values.period as string[]).map((d) => dayjs(d).format("YYYY-MM-DD")).join(",")
            : "",
      }),
      mapQueryStateToFormValues: (state) => ({
        keyword: state.keyword,
        status: state.status,
        businessType: state.businessType,
        period: state.period ? String(state.period).split(",") : undefined,
      }),
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: () => {
        tableApi.query();
      },
      handleReset: () => {
        tableApi.query();
      },
    });

    const slots = {
      "layout-content": () => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": () => (
        <Page
          current={queryState.state.pageNumber}
          pageSize={queryState.state.pageSize}
          total={queryState.state.total}
          onPageChange={handleChange}
        />
      ),
    };

    return () => <CubeLayout title={pageTitle} v-slots={slots} />;
  },
});
