import { InfoCircleOutlined, OrderedListOutlined } from "@ant-design/icons-vue";
import { defineComponent, ref, shallowRef, watch, type PropType } from "vue";

import { Button, Empty, Modal, message } from "@ghcloud/cube-ui";

import type { DeviceInfoItem, DeviceInspectionMode } from "./device-inspection-data";
import { getDeviceRelatedTasks, type DeviceInspectionTaskData } from "@/api/dashboard-service";

interface DeviceDetailItem {
  label: string;
  value: string;
}

const getModeText = (mode: DeviceInspectionMode): string => (mode === "robotDog" ? "机器狗" : "无人机");

const getDeviceExtraDetails = (mode: DeviceInspectionMode): DeviceDetailItem[] => {
  if (mode === "robotDog") {
    return [
      { label: "序列号", value: "B2-2026-0001" },
      { label: "控制链路", value: "专网链路" },
      { label: "固件版本", value: "v2.8.4" },
      { label: "部署区域", value: "厂区地面巡检" },
    ];
  }
  return [
    { label: "序列号", value: "M300-2026-0001" },
    { label: "控制链路", value: "机巢专网" },
    { label: "固件版本", value: "v5.6.2" },
    { label: "部署区域", value: "厂区空域巡检" },
  ];
};

export const DeviceInfoModal = defineComponent({
  name: "DeviceInfoModal",
  props: {
    open: { type: Boolean, required: true },
    mode: { type: String as PropType<DeviceInspectionMode>, required: true },
    device: { type: Object as PropType<DeviceInfoItem>, required: true },
    deviceId: { type: String, required: true },
    onClose: { type: Function as PropType<() => void>, required: true },
    onOpenTask: { type: Function as PropType<(task: DeviceInspectionTaskData) => void>, required: true },
  },
  setup(props) {
    const relatedTasks = ref<DeviceInspectionTaskData[]>([]);
    const loading = shallowRef(false);
    let requestSeq = 0;

    const loadRelatedTasks = async (): Promise<void> => {
      const deviceId = props.deviceId.trim();
      const requestId = ++requestSeq;
      if (!props.open || !deviceId) {
        relatedTasks.value = [];
        return;
      }
      loading.value = true;
      try {
        const data = await getDeviceRelatedTasks({
          deviceId,
          mode: props.mode,
          pageNumber: 1,
          pageSize: 20,
        });
        if (requestId !== requestSeq) {
          return;
        }
        relatedTasks.value = data.records;
      } catch {
        if (requestId === requestSeq) {
          relatedTasks.value = [];
          message.error(`${getModeText(props.mode)}关联任务加载失败`);
        }
      } finally {
        if (requestId === requestSeq) {
          loading.value = false;
        }
      }
    };

    watch(
      () => [props.open, props.deviceId, props.mode] as const,
      () => {
        loadRelatedTasks().catch(() => undefined);
      },
      { immediate: true },
    );

    const renderMetricSummary = () => (
      <div class="device-info-modal-metrics">
        {props.device.metrics.slice(0, 4).map((metric) => (
          <div class={metric.accent ? `device-metric-${metric.accent}` : ""} key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </div>
    );

    const renderDetails = () => {
      const details = [...props.device.details, ...getDeviceExtraDetails(props.mode)];
      return (
        <div class="device-info-modal-detail-grid">
          {details.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      );
    };

    const renderRelatedTasks = () => {
      if (loading.value) {
        return <div class="device-info-modal-empty">关联任务加载中...</div>;
      }
      if (relatedTasks.value.length === 0) {
        return <Empty class="screen-empty device-info-modal-empty" description="暂无关联任务" />;
      }
      return (
        <div class="device-info-modal-task-list">
          {relatedTasks.value.map((task) => (
            <div class="device-info-modal-task" key={task.id}>
              <div class="device-info-modal-task-main">
                <span class="device-status-tag">{task.status}</span>
                <strong title={task.name}>{task.name}</strong>
                <em>{task.beginTime || "--"}</em>
              </div>
              <Button type="primary" size="small" onClick={() => props.onOpenTask(task)}>
                查看
              </Button>
            </div>
          ))}
        </div>
      );
    };

    return () => (
      <Modal
        open={props.open}
        width={560}
        footer={null}
        wrapClassName="screen-modal-wrap draggable-modal-wrap device-info-modal-wrap"
        class="screen-modal device-info-modal"
        onCancel={props.onClose}
        title={
          <span class="device-full-modal-title">
            <InfoCircleOutlined />
            {props.device.name}
          </span>
        }
      >
        <div class="device-info-modal-body">
          <div class="device-info-modal-subtitle">
            <span>{getModeText(props.mode)}</span>
            <em>{props.device.model}</em>
            <i>{props.deviceId || props.device.id}</i>
          </div>
          {renderMetricSummary()}
          {renderDetails()}
          <section class="device-info-modal-section">
            <div class="device-full-section-title">
              <OrderedListOutlined />
              关联任务
            </div>
            {renderRelatedTasks()}
          </section>
        </div>
      </Modal>
    );
  },
});
