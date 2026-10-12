import { Button, Input, Modal, Table, message } from "ant-design-vue";
import type { Key } from "ant-design-vue/es/_util/type";
import { defineComponent, reactive, ref, watch } from "vue";

import type { VideoMonitorDeviceOption } from "@ghcloud/cube-service-interface/video-monitor";
import { listAiInspectionCameraOptions } from "@ghcloud/cube-services-client/video-monitor.client";

import { useAuthRequest } from "@/hooks/auth-request";
import type { AiInspectionSelectedCamera } from "@/types/ai-inspection";

interface Props {
  visible: boolean;
  selectedIds: string[];
  onClose: () => void;
  onConfirm: (cameras: AiInspectionSelectedCamera[]) => void;
}

export const CameraPicker = defineComponent<Props>({
  name: "CameraPicker",
  props: {
    visible: { type: Boolean, required: true },
    selectedIds: { type: Array as () => string[], required: true },
    onClose: { type: Function, required: true },
    onConfirm: { type: Function, required: true },
  },
  setup(props) {
    const keyword = ref("");
    const loading = ref(false);
    const records = ref<VideoMonitorDeviceOption[]>([]);
    const selectedRowKeys = ref<Key[]>([]);
    const selectedRows = ref<VideoMonitorDeviceOption[]>([]);
    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
    });

    const loadData = async (): Promise<void> => {
      loading.value = true;
      try {
        const result = await useAuthRequest(() =>
          listAiInspectionCameraOptions({
            pageNumber: pagination.current,
            pageSize: pagination.pageSize,
            keyword: keyword.value.trim() || undefined,
          }),
        );
        records.value = result.records;
        pagination.total = result.total;
      } catch {
        message.error("加载摄像头失败");
      } finally {
        loading.value = false;
      }
    };

    const handleConfirm = (): void => {
      props.onConfirm(
        selectedRows.value.map((item) => ({
          ...item,
        })),
      );
      props.onClose();
    };

    watch(
      () => props.visible,
      (visible) => {
        if (visible) {
          selectedRowKeys.value = [];
          selectedRows.value = [];
          pagination.current = 1;
          loadData();
        }
      },
    );

    return () => (
      <Modal
        open={props.visible}
        title="选择摄像头"
        width={880}
        onCancel={props.onClose}
        footer={[
          <Button key="cancel" onClick={props.onClose}>
            取消
          </Button>,
          <Button key="ok" type="primary" onClick={handleConfirm}>
            确定
          </Button>,
        ]}
      >
        <div class="ai-inspection-toolbar">
          <Input.Search
            allowClear
            placeholder="搜索摄像头名称或编码"
            value={keyword.value}
            onUpdate:value={(value: string) => {
              keyword.value = value;
            }}
            onSearch={() => {
              pagination.current = 1;
              loadData();
            }}
            style="width: 300px"
          />
        </div>
        <Table
          rowKey="id"
          dataSource={records.value}
          loading={loading.value}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            onChange: (page: number, pageSize: number) => {
              pagination.current = page;
              pagination.pageSize = pageSize;
              loadData();
            },
          }}
          rowSelection={{
            selectedRowKeys: selectedRowKeys.value,
            getCheckboxProps: (record: VideoMonitorDeviceOption) => ({
              disabled: props.selectedIds.includes(record.id),
            }),
            onChange: (keys: Key[], rows: VideoMonitorDeviceOption[]) => {
              selectedRowKeys.value = keys;
              selectedRows.value = rows;
            },
          }}
          columns={[
            { title: "摄像头名称", dataIndex: "name", key: "name" },
            { title: "摄像头编码", dataIndex: "code", key: "code" },
            { title: "区域", dataIndex: "areaName", key: "areaName" },
            { title: "在线状态", dataIndex: "onlineStatus", key: "onlineStatus" },
          ]}
        />
      </Modal>
    );
  },
});
