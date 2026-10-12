// oxlint-disable no-use-before-define
import { defineComponent, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout, useCubeForm } from "@ghcloud/cube-app-design";
import type { BuildRecordVO } from "@ghcloud/cube-static-site-generator-service";
import { Button, Page, Table, Tag, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeSiteGeneratorService } from "@/api/service";

type TaskStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "UNKNOWN";

const statusColorMap: Record<TaskStatus, string> = {
  PENDING: "default",
  RUNNING: "blue",
  SUCCESS: "green",
  FAILED: "red",
  UNKNOWN: "orange",
};

const statusTextMap: Record<TaskStatus, string> = {
  PENDING: "等待中",
  RUNNING: "执行中",
  SUCCESS: "成功",
  FAILED: "失败",
  UNKNOWN: "--",
};

function mapBuildStatus(status: string | undefined): TaskStatus {
  const upper = (status ?? "").toUpperCase();
  const validStatuses: TaskStatus[] = ["PENDING", "RUNNING", "SUCCESS", "FAILED"];
  if (validStatuses.includes(upper as TaskStatus)) {
    return upper as TaskStatus;
  }
  return "PENDING";
}

function mapDeployStatus(status: string | undefined): TaskStatus {
  if (!status) {
    return "UNKNOWN";
  }
  const upper = status.toUpperCase();
  const validStatuses: TaskStatus[] = ["PENDING", "RUNNING", "SUCCESS", "FAILED"];
  if (validStatuses.includes(upper as TaskStatus)) {
    return upper as TaskStatus;
  }
  if (upper.includes("SUCCESS") || upper.includes("成功")) {
    return "SUCCESS";
  }
  if (upper.includes("FAIL") || upper.includes("失败")) {
    return "FAILED";
  }
  if (upper.includes("RUNNING") || upper.includes("ING") || upper.includes("中")) {
    return "RUNNING";
  }
  return "PENDING";
}

interface Artifact {
  id: string;
  artifactName: string;
  taskStatus: TaskStatus;
  deployStatus: TaskStatus;
  lastDeployTime?: string | undefined;
}

const POLL_OPTIONS = [
  { label: "30秒", value: 30 },
  { label: "1分钟", value: 60 },
  { label: "5分钟", value: 300 },
  { label: "不自动刷新", value: 0 },
];

/** 构建部署 */
export const DeployRun = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const router = useRouter();
    const artifactList = ref<Artifact[]>([]);
    const loading = ref(false);
    const publishing = ref(false);
    const redeployingId = ref<string>("");
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    const searchFormSchema = [
      {
        component: "Input",
        label: "",
        fieldName: "artifactName",
        componentProps: {
          placeholder: "产物文件名",
          allowClear: true,
        },
      },
      {
        component: "Select",
        label: "构建状态",
        fieldName: "status",
        componentProps: {
          placeholder: "请选择",
          allowClear: true,
          options: [
            { label: "待处理", value: "PENDING" },
            { label: "执行中", value: "RUNNING" },
            { label: "成功", value: "SUCCESS" },
            { label: "失败", value: "FAILED" },
          ],
        },
      },
      {
        component: "Select",
        label: "发布状态",
        fieldName: "releaseStatus",
        componentProps: {
          placeholder: "请选择",
          allowClear: true,
          options: [
            { label: "待处理", value: "PENDING" },
            { label: "执行中", value: "RUNNING" },
            { label: "成功", value: "SUCCESS" },
            { label: "失败", value: "FAILED" },
          ],
        },
      },
      {
        component: "Select",
        label: "自动刷新",
        fieldName: "pollInterval",
        defaultValue: 0,
        componentProps: {
          placeholder: "请选择",
          allowClear: false,
          options: POLL_OPTIONS,
          onChange: () => {
            stopPolling();
            scheduleNextPoll();
          },
        },
      },
    ];

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: () => {
        page.pageNumber = 1;
        stopPolling();
        loadList();
      },
      handleReset: () => {
        page.pageNumber = 1;
        stopPolling();
        loadList();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    });

    const normalizeRecord = (record: BuildRecordVO): Artifact => {
      const isReleaseSuccess = record.deployStatus && record.deployStatus.toUpperCase().includes("SUCCESS");
      return {
        id: String(record.id),
        artifactName: record.artifactName,
        taskStatus: mapBuildStatus(record.status),
        deployStatus: mapDeployStatus(record.deployStatus),
        lastDeployTime: isReleaseSuccess ? record.createTime : undefined,
      };
    };

    const loadList = async (): Promise<void> => {
      loading.value = true;
      try {
        const result = await cubeSiteGeneratorService.getBuildRecordPage({
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          artifactName: (formApi.formValues.artifactName as string) || undefined,
          status: (formApi.formValues.status as string) || undefined,
          releaseStatus: (formApi.formValues.releaseStatus as string) || undefined,
        });
        artifactList.value = result.records.map(normalizeRecord);
        page.total = result.total;
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "加载失败");
      } finally {
        loading.value = false;
        scheduleNextPoll();
      }
    };

    const scheduleNextPoll = (): void => {
      stopPolling();
      const interval = (formApi.formValues.pollInterval as number) ?? 0;
      if (interval > 0 && !loading.value) {
        pollTimer = setTimeout(loadList, interval * 1000);
      }
    };

    onMounted(() => {
      loadList();
    });

    const stopPolling = (): void => {
      if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = null;
      }
    };

    onUnmounted(() => {
      stopPolling();
    });

    const handlePreview = (): void => {
      window.open(import.meta.env.BASE_URL + "/site-preview", "_blank");
    };

    const handleRunDeploy = async (): Promise<void> => {
      publishing.value = true;
      try {
        const publishConfig = await cubeSiteGeneratorService.getPublishConfig();
        await cubeSiteGeneratorService.runBuild({
          downloadStatic: publishConfig.downloadStatic ?? false,
          excludeHosts: publishConfig.excludeHosts?.trim() || undefined,
        });
        message.success("构建任务已触发");
        stopPolling();
        await loadList();
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "发布失败");
      } finally {
        publishing.value = false;
      }
    };

    const handleRedeploy = async (record: Artifact): Promise<void> => {
      redeployingId.value = record.id;
      try {
        await cubeSiteGeneratorService.publishArtifact({ id: record.id });
        message.success("发布已触发");
        stopPolling();
        await loadList();
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
      } finally {
        redeployingId.value = "";
      }
    };

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber;
      page.pageSize = pageSize;
      stopPolling();
      loadList();
    };

    const columns = [
      {
        title: "制品名",
        dataIndex: "artifactName",
        ellipsis: true,
        align: "center" as const,
      },
      {
        title: "构建状态",
        dataIndex: "taskStatus",
        align: "center" as const,
        customRender: ({ text }: { text: TaskStatus }): JSX.Element => <Tag color={statusColorMap[text]}>{statusTextMap[text]}</Tag>,
      },
      {
        title: "发布状态",
        dataIndex: "deployStatus",
        align: "center" as const,
        customRender: ({ text }: { text: TaskStatus }): JSX.Element => <Tag color={statusColorMap[text]}>{statusTextMap[text]}</Tag>,
      },
      {
        title: "最近发布成功时间",
        dataIndex: "lastDeployTime",
        ellipsis: true,
        align: "center" as const,
        customRender: ({ text }: { text: string | undefined }): JSX.Element => <span>{text ?? "--"}</span>,
      },
      {
        title: "操作",
        dataIndex: "action",
        align: "center" as const,
        fixed: "right" as const,
        width: 120,
        customRender: ({ record }: { record: Artifact }): JSX.Element => (
          <Button
            type="link"
            size="small"
            loading={redeployingId.value === record.id}
            disabled={record.taskStatus !== "SUCCESS"}
            onClick={() => {
              handleRedeploy(record);
            }}
          >
            发布
          </Button>
        ),
      },
    ];

    const slots = {
      "layout-header": (): JSX.Element => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            type="primary"
            loading={publishing.value}
            onClick={() => {
              handleRunDeploy();
            }}
          >
            新建制品
          </Button>
          <Button onClick={handlePreview}>预览当前配置</Button>
        </div>
      ),
      "layout-content": (): JSX.Element => (
        <div style={{ padding: "20px" }}>
          <CubeForm />
          {/* @ts-expect-error */}
          <Table columns={columns} dataSource={artifactList.value} rowKey="id" loading={loading.value} pagination={false} />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          showQuickJumper={false}
          showSizeChanger={true}
          showTotal={(total) => `共 ${total} 条`}
          pageSizeOptions={["10", "20", "50", "100"]}
          current={page.pageNumber}
          pageSize={page.pageSize}
          total={page.total}
          onPageChange={handlePageChange}
          onShowSizeChange={handlePageChange}
        />
      ),
    };
    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={slots}></CubeLayout>;
  },
});
