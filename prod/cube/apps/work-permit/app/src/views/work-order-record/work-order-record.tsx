import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, DeptSelect, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { FlowProcessVO } from "@ghcloud/cube-service-interface/process-engine";
import { exportWorkOrderList, getFlowBusinessNodeNames, getWorkOrderList } from "@ghcloud/cube-services-client/process-engine.client";
import { Button, DateRangePicker, Input, Page, PopOver, Select, Space, message } from "@ghcloud/cube-ui";

import { BusinessTypeSelect } from "@/components/business-type-select/business-type-select";
import { SearchSelect } from "@/components/search-select/search-select";
import { getCurrentApplicationCode } from "@/utils/current-application";

const flowStatus = {
  ACTIVE: "处理中",
  REJECT: "驳回",
  UNDO: "撤销",
  FINISHED: "完成",
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

export const WorkOrderRecord = defineComponent({
  name: "WorkOrderRecord",
  setup: () => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const progressOptions = ref<{ label: string; value: string }[]>([]);
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: () => {
        page.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        page.pageNumber = 1;
        tableApi.query();
      },
      schema: [
        {
          component: DateRangePicker,
          label: "发起时间",
          fieldName: "submitTime",
          defaultValue: null,
        },
        {
          component: DeptSelect,
          label: "发起部门",
          fieldName: "organizationId",
          componentProps: {
            placeholder: "请选择发起部门",
          },
        },
        {
          component: Select,
          label: "处理状态",
          fieldName: "status",
          componentProps: {
            placeholder: "请选择处理状态",
            options: [
              { label: "全部", value: "" },
              ...Object.keys(flowStatus).map((item) => ({
                label: flowStatus[item as keyof typeof flowStatus],
                value: item,
              })),
            ],
          },
        },
        {
          component: SearchSelect,
          label: "处理进度",
          fieldName: "progress",
          defaultValue: undefined,
          componentProps: {
            placeholder: "请选择/输入",
            style: "width: 180px",
            options: progressOptions.value,
          },
        },
        {
          component: BusinessTypeSelect,
          label: "作业类型",
          fieldName: "type",
          defaultValue: null,
        },
        {
          component: Input,
          label: "发起人",
          fieldName: "username",
          defaultValue: null,
          componentProps: {
            placeholder: "请输入发起人姓名",
          },
        },
      ],
      showCollapseButton: true,
    });

    const getProgressOptions = async (): Promise<void> => {
      try {
        const result = await getFlowBusinessNodeNames({ businessType: getCurrentApplicationCode() });
        progressOptions.value = result.map((item) => ({
          label: item,
          value: item,
        }));
        formApi.updateFieldSchema({
          component: SearchSelect,
          label: "处理进度",
          fieldName: "progress",
          defaultValue: undefined,
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
        title: "编号",
        dataIndex: "formNo",
        ellipsis: true,
        width: 200,
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
        title: "操作",
        dataIndex: "action",
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
      columns,
      rowKey: "processInstanceId",
      tableCode,
      fetchApi: async () => {
        return getWorkOrderList({
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          applicationCode: getCurrentApplicationCode(),
          organizationId: (formApi.formValues.organizationId as string) ?? "",
          progress: (formApi.formValues.progress as string) ?? "",
          status: (formApi.formValues.status as string) ?? "",
          submitTime: (formApi.formValues.submitTime as string) ?? "",
          type: (formApi.formValues.type as string) ?? "",
          username: (formApi.formValues.username as string) ?? "",
        });
      },
      fetchLoaded: (data) => {
        page.total = data.total;
      },
    });

    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber;
      page.pageSize = pageSize;
      tableApi.query();
    };

    const goDetail = (record: FlowProcessVO): void => {
      const params = new URLSearchParams({
        businessType: record.businessType ?? "",
        applicationCode: getCurrentApplicationCode(),
        processInstanceId: record.processInstanceId ?? "",
        currentTaskId: record.currentTaskId ?? "",
        status: record.status ?? "",
        type: "detail",
        title: "审批详情",
      });
      history.pushState({ current: location.pathname + location.search }, "", `/portal/stream-engine-render/index?${params.toString()}`);
    };

    const exportLoading = ref(false);
    const handleExport = async (): Promise<void> => {
      try {
        exportLoading.value = true;
        const res = await exportWorkOrderList({
          applicationCode: getCurrentApplicationCode(),
          organizationId: (formApi.formValues.organizationId as string) ?? "",
          progress: (formApi.formValues.progress as string) ?? "",
          status: (formApi.formValues.status as string) ?? "",
          submitTime: (formApi.formValues.submitTime as string) ?? "",
          type: (formApi.formValues.type as string) ?? "",
          username: (formApi.formValues.username as string) ?? "",
        });
        if (res) {
          const link = document.createElement("a");
          const blob = new Blob([res], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "作业记录.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch {
        message.error("操作失败");
      } finally {
        exportLoading.value = false;
      }
    };

    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <Space>
          <Button disabled={page.total === 0} type="primary" onClick={handleExport} loading={exportLoading.value}>
            导出
          </Button>
        </Space>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <CubeForm />
          <CubeTable />
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page v-show={page.total > 0} current={page.pageNumber} pageSize={page.pageSize} total={page.total} onPageChange={handleChange} />
      ),
    };

    return (): JSX.Element => <CubeLayout title="作业记录" v-slots={layoutSlots} />;
  },
});
