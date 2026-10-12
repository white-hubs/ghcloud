import { defineComponent, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { TaskAchievementListModel } from "@ghcloud/cube-drone-service";
import { Button, message, Page, PopOver } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeDroneService } from "@/api/server";

import styles from "./task-achievement-list.module.less";

const renderText = (text?: string): JSX.Element => {
  const content = text || "--";
  return <PopOver content={content}>{content}</PopOver>;
};

const downloadBlob = (blob: Blob, fileName?: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "任务成果文件";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const TaskAchievementList = defineComponent({
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

    const getFileKey = (record: TaskAchievementListModel): string => record.fileKey?.trim() ?? "";

    const handleDownload = async (record: TaskAchievementListModel): Promise<void> => {
      const fileKey = getFileKey(record);
      if (!fileKey) {
        return;
      }
      try {
        const blob = await cubeDroneService.downloadTaskAchievement(fileKey);
        downloadBlob(blob, record.fileName);
      } catch {
        message.error("下载失败");
      }
    };

    const columns = [
      {
        title: "航迹名称",
        dataIndex: "trackName",
        align: "center",
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => renderText(text),
      },
      {
        title: "任务名称",
        dataIndex: "taskName",
        align: "center",
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => renderText(text),
      },
      {
        title: "文件名称",
        dataIndex: "fileName",
        align: "center",
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => renderText(text),
      },
      {
        title: "飞机编码",
        dataIndex: "droneSn",
        width: 180,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => renderText(text),
      },
      {
        title: "操作",
        dataIndex: "action",
        fixed: "right",
        width: 140,
        align: "center",
        customRender: ({ record }: { record: TaskAchievementListModel }): JSX.Element => (
          <div class={styles.actionButtons}>
            <Button
              type="link"
              size="small"
              class={styles.detailButton}
              onClick={() => {
                sessionStorage.setItem("taskAchievementInfo", JSON.stringify(record));
                router.push({ path: "/task-achievement-detail", query: { id: record.id } });
              }}
            >
              详情
            </Button>
            {getFileKey(record) ? (
              <Button type="link" size="small" class={styles.detailButton} onClick={() => void handleDownload(record)}>
                下载
              </Button>
            ) : null}
          </div>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: async () =>
        cubeDroneService.getTaskAchievementListPage({
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
