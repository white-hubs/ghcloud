import { defineComponent, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { FlightTaskListModel } from "@ghcloud/cube-drone-service";
import { Button, Page, PopOver } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeDroneService } from "@/api/server";

import styles from "./flight-task-list.module.less";

const flightTaskStatusTextMap: Record<number, string> = {
  0: "待执行",
  1: "执行中",
  2: "已完成",
  3: "已暂停",
};
const flightTaskTypeTextMap: Record<number, string> = {
  1: "手动任务",
  3: "定期任务",
  4: "周期任务",
  5: "快速任务",
};
const statusClassNameMap: Record<string, string> = {
  已完成: styles.completed,
  待执行: styles.pending,
  执行中: styles.running,
  已暂停: styles.paused,
};
const getFlightTaskStatusText = (status: number | string): string => {
  if (typeof status === "number") {
    return flightTaskStatusTextMap[status] || "--";
  }
  return status || "--";
};
const getFlightTaskTypeText = (taskType: number | string): string => {
  if (typeof taskType === "number") {
    return flightTaskTypeTextMap[taskType] || "--";
  }
  return taskType || "--";
};

const renderText = (text?: number | string): JSX.Element => {
  const content = text || "--";
  return <PopOver content={content}>{content}</PopOver>;
};

export const FlightTaskList = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const router = useRouter();
    const tableCode = route.path.replaceAll("/", "");
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      keyword: "",
      total: 0,
    });

    const columns = [
      {
        title: "任务名称",
        dataIndex: "taskName",
        align: "center",
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => renderText(text),
      },
      {
        title: "任务类型",
        dataIndex: "taskType",
        width: 140,
        align: "center",
        customRender: ({ text }: { text: number | string }): JSX.Element => renderText(getFlightTaskTypeText(text)),
      },
      {
        title: "状态",
        dataIndex: "status",
        width: 120,
        align: "center",
        customRender: ({ text }: { text: number | string }): JSX.Element => {
          const statusText = getFlightTaskStatusText(text);
          return (
            <PopOver content={statusText}>
              <span class={[styles.status, statusClassNameMap[statusText]]}>{statusText}</span>
            </PopOver>
          );
        },
      },
      {
        title: "航迹名称",
        dataIndex: "trackName",
        align: "center",
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => renderText(text),
      },
      {
        title: "操作",
        dataIndex: "action",
        fixed: "right",
        width: 100,
        align: "center",
        customRender: ({ record }: { record: FlightTaskListModel }): JSX.Element => (
          <Button
            type="link"
            size="small"
            class={styles.detailButton}
            onClick={() => {
              sessionStorage.setItem("flightTaskInfo", JSON.stringify(record));
              router.push({ path: "/flight-task-detail", query: { id: record.id } });
            }}
          >
            详情
          </Button>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: async () =>
        cubeDroneService.getFlightTaskListPage({
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          taskName: searchParams.keyword ?? "",
        }),
      fetchLoaded: (data) => {
        searchParams.total = data.total;
      },
    });

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };

    const formSchema = [
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
      handleSubmit: (data: Record<string, unknown>) => {
        searchParams.keyword = data.keyword ? (data.keyword as string) : "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.keyword = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
    });
    formApi.updateSchema(formSchema);

    const slots = {
      "layout-content": (): JSX.Element => (
        <div class={styles.content}>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          current={searchParams.pageNumber}
          pageSize={searchParams.pageSize}
          total={searchParams.total}
          hideOnSinglePage={false}
          onPageChange={handlePageChange}
        />
      ),
    };

    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={slots} showTableXScroll />;
  },
});
