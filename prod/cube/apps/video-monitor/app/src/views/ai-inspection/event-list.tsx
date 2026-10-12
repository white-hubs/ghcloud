import { Button, Form, Input, Modal, Pagination, Space, Table, Tag, message } from "ant-design-vue";
import type { TableProps } from "ant-design-vue";
import { defineComponent, onMounted, reactive, ref } from "vue";

import type { CameraAiInspectionEvent } from "@ghcloud/cube-service-interface/video-monitor";
import { CameraAiInspectionActionStatus } from "@ghcloud/cube-service-interface/video-monitor";
import { ignoreAiInspectionEvent, listAiInspectionEvents } from "@ghcloud/cube-services-client/video-monitor.client";

import { ManualActionModal } from "./components/manual-action-modal";
import { renderActionStatusTag } from "./components/status-tags";
import { ACTION_TYPE_LABEL, AI_INSPECTION_PERMISSION_CODES, DEFAULT_PAGE_SIZE } from "@/constants/ai-inspection";
import { useAuthRequest } from "@/hooks/auth-request";
import { formatDateTime, formatPercent, openActionTarget } from "@/utils/ai-inspection";
import { hasAiInspectionPermission } from "@/utils/ai-inspection-permission";

import "./ai-inspection.less";

export default defineComponent({
  name: "AiInspectionEventList",
  setup() {
    const records = ref<CameraAiInspectionEvent[]>([]);
    const loading = ref(false);
    const actionModalVisible = ref(false);
    const currentEventId = ref<string>();
    const searchForm = reactive({
      planId: "",
      taskId: "",
      deviceId: "",
    });
    const pagination = reactive({
      current: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      total: 0,
    });

    const loadData = async (): Promise<void> => {
      loading.value = true;
      try {
        const result = await useAuthRequest(() =>
          listAiInspectionEvents({
            pageNumber: pagination.current,
            pageSize: pagination.pageSize,
            planId: searchForm.planId.trim() || undefined,
            taskId: searchForm.taskId.trim() || undefined,
            deviceId: searchForm.deviceId.trim() || undefined,
          }),
        );
        records.value = result.records;
        pagination.total = result.total;
      } catch {
        message.error("加载异常事件失败");
      } finally {
        loading.value = false;
      }
    };

    const handleIgnore = (event: CameraAiInspectionEvent): void => {
      const reason = ref("");
      Modal.confirm({
        title: "忽略异常事件",
        content: () => (
          <Input.TextArea
            value={reason.value}
            onUpdate:value={(value: string) => {
              reason.value = value;
            }}
          />
        ),
        onOk: async () => {
          await useAuthRequest(() => ignoreAiInspectionEvent(event.id, { reason: reason.value }));
          message.success("已忽略");
          await loadData();
        },
      });
    };

    const columns: TableProps<CameraAiInspectionEvent>["columns"] = [
      {
        title: "发生时间",
        dataIndex: "createTime",
        key: "createTime",
        width: 170,
        customRender: ({ text }) => formatDateTime(text as string | undefined),
      },
      { title: "摄像头", dataIndex: "deviceNameSnapshot", key: "deviceNameSnapshot", width: 180 },
      { title: "区域", dataIndex: "areaNameSnapshot", key: "areaNameSnapshot", width: 160 },
      { title: "算法", dataIndex: "algorithmNameSnapshot", key: "algorithmNameSnapshot", width: 160 },
      {
        title: "置信度",
        dataIndex: "confidence",
        key: "confidence",
        width: 110,
        customRender: ({ text }) => formatPercent(text as number | undefined),
      },
      { title: "摘要", dataIndex: "aiSummary", key: "aiSummary", ellipsis: true },
      {
        title: "动作",
        key: "actionType",
        width: 120,
        customRender: ({ record }) => (record.actionType ? ACTION_TYPE_LABEL[record.actionType] : "--"),
      },
      { title: "处置状态", key: "actionStatus", width: 120, customRender: ({ record }) => renderActionStatusTag(record.actionStatus) },
      {
        title: "忽略",
        key: "ignored",
        width: 90,
        customRender: ({ record }) => (record.ignored ? <Tag color="orange">已忽略</Tag> : <Tag>否</Tag>),
      },
      {
        title: "操作",
        key: "actions",
        fixed: "right",
        width: 260,
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

    const handleSearch = (): void => {
      pagination.current = 1;
      loadData();
    };

    onMounted(loadData);

    return () => (
      <div class="ai-inspection-page">
        <div class="ai-inspection-page__header">
          <h1 class="ai-inspection-page__title">异常事件</h1>
        </div>
        <div class="ai-inspection-table-card">
          <div class="ai-inspection-toolbar">
            <Form layout="inline">
              <Form.Item label="计划ID">
                <Input
                  value={searchForm.planId}
                  onUpdate:value={(value: string) => {
                    searchForm.planId = value;
                  }}
                />
              </Form.Item>
              <Form.Item label="任务ID">
                <Input
                  value={searchForm.taskId}
                  onUpdate:value={(value: string) => {
                    searchForm.taskId = value;
                  }}
                />
              </Form.Item>
              <Form.Item label="摄像头ID">
                <Input
                  value={searchForm.deviceId}
                  onUpdate:value={(value: string) => {
                    searchForm.deviceId = value;
                  }}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={handleSearch}>
                  查询
                </Button>
              </Form.Item>
            </Form>
          </div>
          <Table
            rowKey="id"
            dataSource={records.value}
            columns={columns}
            loading={loading.value}
            pagination={false}
            scroll={{ x: 1500 }}
            bordered
          />
          <div class="ai-inspection-footer">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              showSizeChanger
              showTotal={(total: number) => `共 ${total} 条`}
              onChange={(page: number, pageSize: number) => {
                pagination.current = page;
                pagination.pageSize = pageSize;
                loadData();
              }}
            />
          </div>
        </div>
        <ManualActionModal
          visible={actionModalVisible.value}
          eventId={currentEventId.value}
          onClose={() => {
            actionModalVisible.value = false;
          }}
          onSuccess={loadData}
        />
      </div>
    );
  },
});
