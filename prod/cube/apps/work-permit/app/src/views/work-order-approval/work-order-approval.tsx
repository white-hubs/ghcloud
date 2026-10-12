import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, DeptSelect, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { FlowProcessVO } from "@ghcloud/cube-service-interface/process-engine";
import { getFlowBusinessNodeNames, getFlowProcessPage } from "@ghcloud/cube-services-client/process-engine.client";
import { Button, Page, PopOver } from "@ghcloud/cube-ui";

import { SearchSelect } from "@/components/search-select/search-select";
import { getCurrentApplicationCode } from "@/utils/current-application";

const flowStatus = {
  ACTIVE: "处理中",
  REJECT: "驳回",
  UNDO: "撤销",
  FINISHED: "完成",
};

const flowTypes = {
  ALL: "全部",
  WAITING: "待我处理",
  SUBMIT: "我发起的",
  SERVED: "抄送给我",
  PROCESSED: "已处理",
};

const statusText = (status: string): string => {
  const statusMap = new Map([
    ["SUBMIT", "提交"],
    ["UNDO", "撤销"],
    ["REPEAT", "重新提交"],
    ["APPROVAL", "审批"],
    ["BACK", "撤回"],
    ["COPY", "抄送"],
    ["REJECT", "驳回"],
    ["FINISHED", "完成"],
  ]);
  return statusMap.get(status) || "处理中";
};

const toDisplayText = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "--";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const formatDateTime = (value?: string | number | null): string => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  const pad = (num: number): string => String(num).padStart(2, "0");
  return (
    [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join("-") +
    " " +
    [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(":")
  );
};

export const WorkOrderApproval = defineComponent({
  name: "WorkOrderApproval",
  setup: () => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const query = route.query;
    const formState = reactive({
      flowName: (query.flowName as string) ?? "",
      businessType: (query.businessType as string) ?? "",
      type: (query.type as string) ?? "ALL",
      status: (query.status as string) ?? "",
      progress: (query.progress as string) ?? "",
      submitTime: query.submitTime ? String(query.submitTime).split(",") : (undefined as string[] | undefined),
    });
    const progressOptions = ref<{ label: string; value: string }[]>([]);
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: () => {
        tableApi.query();
      },
      handleReset: () => {
        tableApi.query();
      },
      schema: [
        {
          component: "Select",
          label: "发起类型",
          fieldName: "type",
          defaultValue: formState.type,
          componentProps: {
            allowClear: false,
            placeholder: "请选择发起类型",
            options: Object.keys(flowTypes).map((item) => ({
              label: flowTypes[item as keyof typeof flowTypes],
              value: item,
            })),
            onChange: (): void => {
              tableApi.query();
            },
          },
        },
        {
          component: "Select",
          label: "状态",
          fieldName: "status",
          defaultValue: formState.status,
          componentProps: {
            allowClear: true,
            placeholder: "请选择状态",
            options: [
              { label: "全部", value: "" },
              ...Object.keys(flowStatus).map((item) => ({
                label: flowStatus[item as keyof typeof flowStatus],
                value: item,
              })),
            ],
            onChange: (): void => {
              tableApi.query();
            },
          },
        },
        {
          component: SearchSelect,
          label: "处理进度",
          fieldName: "progress",
          defaultValue: formState.progress,
          componentProps: {
            placeholder: "请选择/输入",
            style: "width: 180px",
            options: progressOptions.value,
          },
        },
        {
          component: "RangePicker",
          label: "发起时间",
          fieldName: "submitTime",
          componentProps: {
            valueFormat: "YYYY-MM-DD",
            allowClear: true,
          },
        },
        {
          component: DeptSelect,
          label: "发起部门",
          fieldName: "organizationId",
        },
        {
          component: "Input",
          label: "发起人",
          fieldName: "username",
          componentProps: {
            placeholder: "请输入发起人姓名",
          },
        },
      ],
      showCollapseButton: true,
    });

    const getProgressOptions = async (): Promise<void> => {
      try {
        const result = await getFlowBusinessNodeNames({ businessType: formState.businessType });
        progressOptions.value = result.map((item) => ({
          label: item,
          value: item,
        }));
        formApi.updateFieldSchema({
          component: SearchSelect,
          label: "处理进度",
          fieldName: "progress",
          defaultValue: formState.progress,
          componentProps: {
            placeholder: "请选择/输入",
            style: "width: 180px",
            options: progressOptions.value,
          },
        });
      } catch {}
    };

    onMounted(() => {
      void getProgressOptions();
    });

    const columns = [
      {
        title: "作业编号",
        dataIndex: "formNo",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: unknown }): JSX.Element => <PopOver content={toDisplayText(text)}>{toDisplayText(text)}</PopOver>,
      },
      {
        title: "作业名称",
        dataIndex: "instanceName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text?: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "发起人",
        dataIndex: "startUserName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text?: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "发起部门",
        dataIndex: "organizationName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text?: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "发起时间",
        dataIndex: "submitedTime",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text?: string | number }): JSX.Element => {
          const time = formatDateTime(text);
          return <PopOver content={time}>{time}</PopOver>;
        },
      },
      {
        title: "处理状态",
        dataIndex: "status",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text?: string }): JSX.Element => {
          const textVal = text ? statusText(text) : "--";
          return <PopOver content={textVal}>{textVal}</PopOver>;
        },
      },
      {
        title: "处理进度",
        dataIndex: "activeNodeName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text?: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "action",
        title: "操作",
        fixed: "right",
        width: 120,
        customRender: ({ record }: { record: FlowProcessVO }): JSX.Element => (
          <Button type="link" size="small" onClick={() => goDetail(record)}>
            详情
          </Button>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      tableCode,
      columns,
      fetchApi: async () => {
        return getFlowProcessPage({
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          applicationCode: getCurrentApplicationCode(),
          businessType: formState.businessType,
          type: (formApi.formValues.type as string) ?? "",
          status: (formApi.formValues.status as string) ?? "",
          progress: (formApi.formValues.progress as string) ?? "",
          organizationId: (formApi.formValues.organizationId as string) ?? "",
          username: (formApi.formValues.username as string) ?? "",
          submitTime: (formApi.formValues.submitTime as string) ?? "",
        });
      },
      fetchLoaded: (data) => {
        page.total = data.total;
      },
    });

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber;
      page.pageSize = pageSize;
      tableApi.query();
    };

    const goDetail = (record: FlowProcessVO): void => {
      const params = new URLSearchParams({
        businessType: record.businessType ?? formState.businessType,
        applicationCode: getCurrentApplicationCode(),
        processInstanceId: record.processInstanceId ?? "",
        currentTaskId: record.currentTaskId ?? "",
        status: record.status ?? "",
        type: "detail",
        title: "审批详情",
      });
      history.pushState({ current: location.pathname + location.search }, "", `/portal/stream-engine-render/index?${params.toString()}`);
    };

    const addFlow = (): void => {
      const params = new URLSearchParams({
        businessType: formState.businessType,
        applicationCode: getCurrentApplicationCode(),
        type: "add",
        title: formState.flowName || "新增作业",
      });
      history.pushState({ current: location.pathname + location.search }, "", `/portal/stream-engine-render/index?${params.toString()}`);
    };

    const slots = {
      "layout-header": (): JSX.Element => (
        <Button type="primary" onClick={addFlow}>
          新增
        </Button>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <CubeForm />
          <CubeTable />
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          v-show={page.total > 0}
          current={page.pageNumber}
          pageSize={page.pageSize}
          total={page.total}
          onPageChange={handlePageChange}
        />
      ),
    };

    return (): JSX.Element => <CubeLayout title={formState.flowName || "作业审批"} v-slots={slots} />;
  },
});
