import { defineComponent, onMounted, reactive, ref, shallowRef } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design/src/base-components/cube-layout/cube-layout";
import { useCubeTable } from "@ghcloud/cube-app-design/src/base-components/cube-table/use-table";
import type {
  CameraAiInspectionEvent,
  CameraAiInspectionTask,
  CameraAiInspectionTaskCamera,
} from "@ghcloud/cube-service-interface/video-monitor";
import { CameraAiInspectionActionStatus } from "@ghcloud/cube-service-interface/video-monitor";
import { getAiInspectionTask, ignoreAiInspectionEvent, listAiInspectionEvents } from "@ghcloud/cube-services-client/video-monitor.client";
import { AntModal, Button, Descriptions, DescriptionsItem, Image, Page, Space, Table, Tag, Textarea, message } from "@ghcloud/cube-ui";
import type { ColumnType } from "@ghcloud/cube-ui";

import { ManualActionModal } from "./components/manual-action-modal";
import { renderActionStatusTag, renderTaskCameraStatusTag, renderTaskStatusTag } from "./components/status-tags";
import { ACTION_TYPE_LABEL, AI_INSPECTION_PERMISSION_CODES, DEFAULT_PAGE_SIZE } from "@/constants/ai-inspection";
import { useAuthRequest } from "@/hooks/auth-request";
import { formatDateTime, formatPercent, openActionTarget } from "@/utils/ai-inspection";
import { hasAiInspectionPermission } from "@/utils/ai-inspection-permission";

import "./ai-inspection.less";

interface Props {
  id: string;
}

const SNAPSHOT_PREVIEW_TIMEOUT_MS = 8000;

export default defineComponent<Props>({
  name: "AiInspectionTaskDetail",
  props: {
    id: { type: String, required: true },
  },
  setup(props) {
    const router = useRouter();
    const loading = ref(false);
    const task = ref<CameraAiInspectionTask>();
    const actionModalVisible = ref(false);
    const currentEventId = ref<string>();
    const previewImageUrl = shallowRef("");
    const previewVisible = shallowRef(false);
    const previewLoadingUrl = shallowRef("");
    let previewRequestId = 0;
    const pagination = reactive({
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      total: 0,
    });

    const loadTask = async (): Promise<void> => {
      loading.value = true;
      try {
        task.value = await useAuthRequest(() => getAiInspectionTask(props.id));
      } catch {
        message.error("加载任务详情失败");
      } finally {
        loading.value = false;
      }
    };

    const handleIgnore = (event: CameraAiInspectionEvent): void => {
      const reason = ref("");
      AntModal.confirm({
        title: "忽略异常事件",
        content: () => (
          <Textarea
            placeholder="请输入忽略原因"
            value={reason.value}
            onUpdate:value={(value: string) => {
              reason.value = value;
            }}
          />
        ),
        onOk: async () => {
          try {
            await useAuthRequest(() => ignoreAiInspectionEvent(event.id, { reason: reason.value }));
            message.success("已忽略");
            eventTableApi.query();
          } catch {
            message.error("忽略失败");
          }
        },
      });
    };

    const getSnapshotPreviewUrl = (url?: string): string => url?.trim() ?? "";

    const preloadSnapshotImage = (url: string): Promise<void> =>
      new Promise((resolve, reject) => {
        const image = new window.Image();
        const timer = window.setTimeout(() => {
          image.onload = null;
          image.onerror = null;
          reject(new Error("snapshot preview timeout"));
        }, SNAPSHOT_PREVIEW_TIMEOUT_MS);

        image.onload = () => {
          window.clearTimeout(timer);
          resolve();
        };
        image.onerror = () => {
          window.clearTimeout(timer);
          reject(new Error("snapshot preview failed"));
        };
        image.src = url;
      });

    const openSnapshotPreview = async (url?: string): Promise<void> => {
      const previewUrl = getSnapshotPreviewUrl(url);
      if (!previewUrl) {
        message.warning("暂无抓拍图");
        return;
      }

      const requestId = ++previewRequestId;
      previewLoadingUrl.value = previewUrl;

      try {
        await preloadSnapshotImage(previewUrl);
        if (requestId !== previewRequestId) {
          return;
        }
        previewImageUrl.value = previewUrl;
        previewVisible.value = true;
      } catch {
        if (requestId === previewRequestId) {
          message.warning("抓拍图无法访问");
        }
      } finally {
        if (requestId === previewRequestId) {
          previewLoadingUrl.value = "";
        }
      }
    };

    const handlePreviewVisibleChange = (visible: boolean): void => {
      previewVisible.value = visible;
      if (!visible) {
        previewImageUrl.value = "";
      }
    };

    const cameraColumns: ColumnType<CameraAiInspectionTaskCamera>[] = [
      { title: "摄像头", dataIndex: "deviceNameSnapshot", key: "deviceNameSnapshot", width: 180, align: "center", ellipsis: true },
      { title: "编码", dataIndex: "deviceCodeSnapshot", key: "deviceCodeSnapshot", width: 160, align: "center", ellipsis: true },
      { title: "区域", dataIndex: "areaNameSnapshot", key: "areaNameSnapshot", width: 160, align: "center", ellipsis: true },
      { title: "算法", dataIndex: "algorithmNameSnapshot", key: "algorithmNameSnapshot", width: 160, align: "center", ellipsis: true },
      {
        title: "置信度",
        dataIndex: "confidence",
        key: "confidence",
        width: 110,
        align: "center",
        customRender: ({ text }) => formatPercent(text as number | undefined),
      },
      { title: "AI摘要", dataIndex: "aiSummary", key: "aiSummary", ellipsis: true, align: "center" },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: 110,
        align: "center",
        customRender: ({ record }) => renderTaskCameraStatusTag(record.status),
      },
      { title: "失败原因", dataIndex: "errorMessage", key: "errorMessage", ellipsis: true, align: "center" },
      {
        title: "抓拍图",
        dataIndex: "previewUrl",
        key: "previewUrl",
        width: 100,
        align: "center",
        customRender: ({ record }) => {
          const previewUrl = getSnapshotPreviewUrl(record.previewUrl);
          return previewUrl ? (
            <Button
              type="link"
              size="small"
              loading={previewLoadingUrl.value === previewUrl}
              onClick={() => openSnapshotPreview(previewUrl)}
            >
              查看
            </Button>
          ) : (
            "--"
          );
        },
      },
    ];

    const eventColumns: ColumnType<CameraAiInspectionEvent>[] = [
      {
        title: "发生时间",
        dataIndex: "createTime",
        key: "createTime",
        width: 170,
        align: "center",
        customRender: ({ text }) => formatDateTime(text as string | undefined),
      },
      { title: "摄像头", dataIndex: "deviceNameSnapshot", key: "deviceNameSnapshot", width: 180, align: "center", ellipsis: true },
      { title: "区域", dataIndex: "areaNameSnapshot", key: "areaNameSnapshot", width: 160, align: "center", ellipsis: true },
      { title: "算法", dataIndex: "algorithmNameSnapshot", key: "algorithmNameSnapshot", width: 160, align: "center", ellipsis: true },
      {
        title: "置信度",
        dataIndex: "confidence",
        key: "confidence",
        width: 110,
        align: "center",
        customRender: ({ text }) => formatPercent(text as number | undefined),
      },
      { title: "摘要", dataIndex: "aiSummary", key: "aiSummary", ellipsis: true, align: "center" },
      {
        title: "动作",
        dataIndex: "actionType",
        key: "actionType",
        width: 120,
        align: "center",
        customRender: ({ record }) => (record.actionType ? ACTION_TYPE_LABEL[record.actionType] : "--"),
      },
      {
        title: "处置状态",
        dataIndex: "actionStatus",
        key: "actionStatus",
        width: 120,
        align: "center",
        customRender: ({ record }) => renderActionStatusTag(record.actionStatus),
      },
      {
        title: "忽略",
        dataIndex: "ignored",
        key: "ignored",
        width: 90,
        align: "center",
        customRender: ({ record }) => (record.ignored ? <Tag color="orange">已忽略</Tag> : <Tag>否</Tag>),
      },
      {
        title: "操作",
        dataIndex: "actions",
        fixed: "right",
        width: 260,
        align: "center",
        customRender: ({ record }) => (
          <Space size={4} wrap>
            {hasAiInspectionPermission(AI_INSPECTION_PERMISSION_CODES.eventAction) &&
              record.actionStatus !== CameraAiInspectionActionStatus.SUCCESS && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    currentEventId.value = record.id;
                    actionModalVisible.value = true;
                  }}
                >
                  生成处置
                </Button>
              )}
            {hasAiInspectionPermission(AI_INSPECTION_PERMISSION_CODES.eventIgnore) && !record.ignored && (
              <Button type="link" size="small" onClick={() => handleIgnore(record)}>
                忽略
              </Button>
            )}
            {record.actionStatus === CameraAiInspectionActionStatus.SUCCESS && record.actionTargetId && (
              <Button type="link" size="small" onClick={() => openActionTarget(record)}>
                查看处置目标
              </Button>
            )}
          </Space>
        ),
      },
    ];

    const [EventTable, eventTableApi] = useCubeTable({
      columns: eventColumns,
      rowKey: "id",
      fetchApi: async () => {
        try {
          return await useAuthRequest(() =>
            listAiInspectionEvents({
              pageNumber: pagination.pageNumber,
              pageSize: pagination.pageSize,
              taskId: props.id,
            }),
          );
        } catch {
          message.error("加载异常事件失败");
          return { total: 0, pages: 0, records: [] };
        }
      },
      fetchLoaded: (data) => {
        pagination.total = data.total;
      },
    });

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      pagination.pageNumber = pageNumber;
      pagination.pageSize = pageSize;
      eventTableApi.query();
    };

    onMounted(() => {
      loadTask();
    });

    const slots = {
      "layout-header": (): JSX.Element => (
        <Space>
          <Button
            onClick={() => {
              loadTask();
              eventTableApi.query();
            }}
          >
            刷新
          </Button>
          <Button onClick={() => router.push({ name: "AiInspectionTaskList" })}>返回</Button>
        </Space>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <div class="ai-inspection-table-card">
            <Descriptions bordered column={3} size="small">
              <DescriptionsItem label="任务ID">{task.value?.id ?? "--"}</DescriptionsItem>
              <DescriptionsItem label="计划名称">{task.value?.planName ?? "--"}</DescriptionsItem>
              <DescriptionsItem label="状态">{renderTaskStatusTag(task.value?.status, task.value?.timeout)}</DescriptionsItem>
              <DescriptionsItem label="应执行时间">{formatDateTime(task.value?.scheduledTime)}</DescriptionsItem>
              <DescriptionsItem label="开始时间">{formatDateTime(task.value?.startTime)}</DescriptionsItem>
              <DescriptionsItem label="结束时间">{formatDateTime(task.value?.endTime)}</DescriptionsItem>
            </Descriptions>
          </div>

          <div class="ai-inspection-stat-grid">
            <div class="ai-inspection-stat">
              <div class="ai-inspection-stat__label">总数</div>
              <div class="ai-inspection-stat__value">{task.value?.totalNum ?? 0}</div>
            </div>
            <div class="ai-inspection-stat">
              <div class="ai-inspection-stat__label">正常</div>
              <div class="ai-inspection-stat__value">{task.value?.normalNum ?? 0}</div>
            </div>
            <div class="ai-inspection-stat">
              <div class="ai-inspection-stat__label">异常</div>
              <div class="ai-inspection-stat__value">{task.value?.abnormalNum ?? 0}</div>
            </div>
            <div class="ai-inspection-stat">
              <div class="ai-inspection-stat__label">失败</div>
              <div class="ai-inspection-stat__value">{task.value?.failNum ?? 0}</div>
            </div>
          </div>

          <div class="ai-inspection-table-card ai-inspection-section">
            <div class="ai-inspection-section__title">摄像头执行结果</div>
            <Table
              rowKey="id"
              dataSource={task.value?.cameras ?? []}
              columns={cameraColumns}
              loading={loading.value}
              pagination={false}
              scrollX={1300}
            />
          </div>

          <div class="ai-inspection-table-card">
            <div class="ai-inspection-section__title">异常事件</div>
            <EventTable />
          </div>

          <ManualActionModal
            visible={actionModalVisible.value}
            eventId={currentEventId.value}
            onClose={() => {
              actionModalVisible.value = false;
            }}
            onSuccess={eventTableApi.query}
          />
          {previewImageUrl.value && (
            <Image
              style="display:none"
              src={previewImageUrl.value}
              preview={{
                visible: previewVisible.value,
                onVisibleChange: handlePreviewVisibleChange,
              }}
            />
          )}
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page current={pagination.pageNumber} pageSize={pagination.pageSize} total={pagination.total} onPageChange={handlePageChange} />
      ),
    };

    return () => <CubeLayout title="巡检任务详情" v-slots={slots} />;
  },
});
