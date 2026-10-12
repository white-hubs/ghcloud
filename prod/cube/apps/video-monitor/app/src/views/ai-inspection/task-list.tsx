import { defineComponent, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useCubeForm } from "@ghcloud/cube-app-design/src/base-components/cube-form/use-form";
import { CubeLayout } from "@ghcloud/cube-app-design/src/base-components/cube-layout/cube-layout";
import { useCubeTable } from "@ghcloud/cube-app-design/src/base-components/cube-table/use-table";
import type { CameraAiInspectionTask } from "@ghcloud/cube-service-interface/video-monitor";
import { CameraAiInspectionTaskStatus } from "@ghcloud/cube-service-interface/video-monitor";
import { listAiInspectionTasks } from "@ghcloud/cube-services-client/video-monitor.client";
import { Button, Page, message } from "@ghcloud/cube-ui";
import type { ColumnType } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { renderTaskStatusTag } from "./components/status-tags";
import { DEFAULT_PAGE_SIZE, EXECUTION_TYPE_LABEL, TASK_STATUS_LABEL } from "@/constants/ai-inspection";
import { useAuthRequest } from "@/hooks/auth-request";
import { formatDateTime } from "@/utils/ai-inspection";

const TASK_STATUS_OPTIONS = Object.values(CameraAiInspectionTaskStatus).map((value) => ({
  label: TASK_STATUS_LABEL[value],
  value,
}));

type TaskStatusFilter = "" | CameraAiInspectionTaskStatus;

const normalizeStringValue = (value: unknown): string => (typeof value === "string" ? value : "");

const normalizeTaskStatusFilter = (value: unknown): TaskStatusFilter => {
  if (value === "" || Object.values(CameraAiInspectionTaskStatus).includes(value as CameraAiInspectionTaskStatus)) {
    return value as TaskStatusFilter;
  }
  return "";
};

const normalizePeriodValue = (value: unknown): string => {
  if (!Array.isArray(value)) {
    return "";
  }
  const begin = typeof value[0] === "string" ? value[0] : "";
  const end = typeof value[1] === "string" ? value[1] : "";
  return begin && end ? `${begin},${end}` : "";
};

const normalizePeriodSyncValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }
  return normalizePeriodValue(value);
};

const normalizeSearchSyncValues = (values: Record<string, unknown>) => ({
  keyword: normalizeStringValue(values.keyword),
  status: normalizeTaskStatusFilter(values.status),
  period: normalizePeriodSyncValue(values.period),
});

const resolveOptionalStringParam = (value: unknown): string | undefined => {
  const text = normalizeStringValue(value).trim();
  return text || undefined;
};

export default defineComponent({
  name: "AiInspectionTaskList",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { pageTitle } = usePageName();
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      total: 0,
      planId: typeof route.query.planId === "string" ? route.query.planId : "",
      keyword: "",
      status: "" as TaskStatusFilter,
      period: "",
    });

    const resolveStatusParam = (): CameraAiInspectionTaskStatus | undefined => searchParams.status || undefined;

    const formSchema = [
      {
        component: "Input",
        label: "计划名称",
        fieldName: "keyword",
        componentProps: {
          placeholder: "请输入计划名称",
        },
      },
      {
        component: "Select",
        label: "任务状态",
        fieldName: "status",
        defaultValue: "",
        componentProps: {
          allowClear: true,
          placeholder: "全部",
          options: [{ label: "全部", value: "" }, ...TASK_STATUS_OPTIONS],
        },
      },
      {
        component: "RangePicker",
        label: "开始时间",
        fieldName: "period",
        componentProps: {
          allowClear: true,
          showTime: true,
          valueFormat: "YYYY-MM-DD HH:mm:ss",
          format: "YYYY-MM-DD HH:mm:ss",
        },
      },
    ];

    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      syncStateRef: searchParams,
      syncMap: normalizeSearchSyncValues,
      handleSubmit: (values) => {
        Object.assign(searchParams, normalizeSearchSyncValues(values));
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.planId = "";
        searchParams.keyword = "";
        searchParams.status = "";
        searchParams.period = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      schema: formSchema,
      showCollapseButton: true,
    });

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };

    const columns: ColumnType<CameraAiInspectionTask>[] = [
      { title: "任务ID", dataIndex: "id", key: "id", width: 180, align: "center", ellipsis: true },
      { title: "计划名称", dataIndex: "planName", key: "planName", width: 220, align: "center", ellipsis: true },
      {
        title: "执行类型",
        dataIndex: "executionType",
        key: "executionType",
        width: 130,
        align: "center",
        customRender: ({ text }) => (text ? EXECUTION_TYPE_LABEL[text as keyof typeof EXECUTION_TYPE_LABEL] : "--"),
      },
      {
        title: "应执行时间",
        dataIndex: "scheduledTime",
        key: "scheduledTime",
        width: 170,
        align: "center",
        customRender: ({ text }) => formatDateTime(text as string | undefined),
      },
      {
        title: "开始时间",
        dataIndex: "startTime",
        key: "startTime",
        width: 170,
        align: "center",
        customRender: ({ text }) => formatDateTime(text as string | undefined),
      },
      {
        title: "结束时间",
        dataIndex: "endTime",
        key: "endTime",
        width: 170,
        align: "center",
        customRender: ({ text }) => formatDateTime(text as string | undefined),
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: 120,
        align: "center",
        customRender: ({ record }) => renderTaskStatusTag(record.status, record.timeout),
      },
      { title: "摄像头数", dataIndex: "totalNum", key: "totalNum", width: 100, align: "center" },
      { title: "正常", dataIndex: "normalNum", key: "normalNum", width: 90, align: "center" },
      { title: "异常", dataIndex: "abnormalNum", key: "abnormalNum", width: 90, align: "center" },
      { title: "失败", dataIndex: "failNum", key: "failNum", width: 90, align: "center" },
      {
        title: "操作",
        dataIndex: "actions",
        fixed: "right",
        width: 100,
        align: "center",
        customRender: ({ record }) => (
          <Button type="link" size="small" onClick={() => router.push({ name: "AiInspectionTaskDetail", params: { id: record.id } })}>
            详情
          </Button>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: "id",
      fetchApi: async () => {
        try {
          return await useAuthRequest(() =>
            listAiInspectionTasks({
              pageNumber: searchParams.pageNumber,
              pageSize: searchParams.pageSize,
              planId: resolveOptionalStringParam(searchParams.planId),
              keyword: resolveOptionalStringParam(searchParams.keyword),
              status: resolveStatusParam(),
              period: searchParams.period || undefined,
            }),
          );
        } catch {
          message.error("加载巡检任务失败");
          return { total: 0, pages: 0, records: [] };
        }
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total;
      },
    });

    const slots = {
      "layout-content": (): JSX.Element => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          current={searchParams.pageNumber}
          pageSize={searchParams.pageSize}
          total={searchParams.total}
          onPageChange={handlePageChange}
        />
      ),
    };

    return () => <CubeLayout title={pageTitle} v-slots={slots} showTableXScroll />;
  },
});
