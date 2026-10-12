import {
  CheckCircleFilled,
  ClockCircleOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  OrderedListOutlined,
  WarningOutlined,
} from "@ant-design/icons-vue";
import { computed, defineComponent, type PropType } from "vue";

import { Button, Empty, Modal } from "@ghcloud/cube-ui";

import type { DeviceInspectionMode, DeviceInspectionTask, RoutePointItem } from "./device-inspection-data";
import type { DeviceInspectionTaskData, DeviceRouteInspectItemData, DeviceRoutePointData } from "@/api/dashboard-service";

type DeviceDetailTask = DeviceInspectionTask | DeviceInspectionTaskData;
type DeviceDetailPoint = RoutePointItem | DeviceRoutePointData;

interface PointInspectItem {
  name: string;
  standard: string;
  result: "正常" | "异常" | "--";
  photo: string;
}

const getPointLabel = (mode: DeviceInspectionMode): string => (mode === "robotDog" ? "路线点" : "航点");

const isDeviceRoutePoint = (point: DeviceDetailPoint): point is DeviceRoutePointData => "inspectionStatus" in point;

const getPointTone = (point: DeviceDetailPoint): DeviceDetailPoint["status"] => {
  if (isDeviceRoutePoint(point)) {
    return point.status;
  }
  if (point.status === "abnormal" || point.result === "异常") {
    return "abnormal";
  }
  if (point.status === "done" || point.result === "正常") {
    return "done";
  }
  return "pending";
};

const renderPointIcon = (point: DeviceDetailPoint) => {
  const tone = getPointTone(point);
  if (tone === "abnormal") {
    return <WarningOutlined />;
  }
  if (tone === "done") {
    return <CheckCircleFilled />;
  }
  return <ClockCircleOutlined />;
};

const buildPointInspectItems = (point: DeviceDetailPoint | null): PointInspectItem[] => {
  if (!point) {
    return [];
  }
  if (isDeviceRoutePoint(point) && point.inspectItems.length > 0) {
    return point.inspectItems.map((item: DeviceRouteInspectItemData) => ({
      name: item.name,
      standard: item.standard,
      result: item.result,
      photo: item.photo,
    }));
  }
  if (getPointTone(point) === "pending") {
    return [];
  }
  if (point.result === "异常") {
    return [
      { name: "影像识别", standard: "画面中无明显异常目标", result: "异常", photo: "已抓拍" },
      { name: "点位复核", standard: "点位坐标与计划一致", result: "正常", photo: "已抓拍" },
    ];
  }
  return [
    { name: "影像识别", standard: "画面中无明显异常目标", result: "正常", photo: "已抓拍" },
    { name: "点位复核", standard: "点位坐标与计划一致", result: "正常", photo: "已抓拍" },
  ];
};

export const DeviceTaskFullDetailModal = defineComponent({
  name: "DeviceTaskFullDetailModal",
  props: {
    open: { type: Boolean, required: true },
    mode: { type: String as PropType<DeviceInspectionMode>, required: true },
    task: { type: Object as PropType<DeviceDetailTask | null>, required: false, default: null },
    activePointIndex: { type: Number, required: false, default: 0 },
    onClose: { type: Function as PropType<() => void>, required: true },
    onSelectPoint: { type: Function as PropType<(index: number) => void>, required: true },
    onOpenPointDetail: { type: Function as PropType<(index: number) => void>, required: true },
  },
  setup(props) {
    const pointLabel = computed(() => getPointLabel(props.mode));

    const donePointCount = computed(() => {
      const points = props.task?.routePoints || [];
      return points.filter((point) => {
        const tone = getPointTone(point);
        return tone === "done" || tone === "abnormal";
      }).length;
    });

    const abnormalPointCount = computed(() => {
      const points = props.task?.routePoints || [];
      return points.filter((point) => point.result === "异常" || point.status === "abnormal").length;
    });

    const normalPointCount = computed(() => {
      const points = props.task?.routePoints || [];
      return points.filter((point) => point.result === "正常" || point.status === "done").length;
    });

    const progressPercent = computed(() => {
      const task = props.task;
      if (!task || task.totalPointCount <= 0) {
        return 0;
      }
      return Math.round((donePointCount.value / task.totalPointCount) * 100);
    });

    const renderBasic = (task: DeviceDetailTask) => (
      <div class="device-full-detail-grid">
        <div>
          <span>任务名称</span>
          <strong title={task.name}>{task.name}</strong>
        </div>
        <div>
          <span>任务状态</span>
          <strong>
            <span class="device-status-tag">{task.status}</span>
          </strong>
        </div>
        <div>
          <span>巡检设备</span>
          <strong title={task.deviceName}>{task.deviceName}</strong>
        </div>
        <div>
          <span>{props.mode === "robotDog" ? "路线" : "航线"}</span>
          <strong title={task.routeName}>{task.routeName || "--"}</strong>
        </div>
        <div>
          <span>任务级别</span>
          <strong>{task.level}</strong>
        </div>
        <div>
          <span>计划对象</span>
          <strong>{task.objectCount} 个</strong>
        </div>
        <div>
          <span>计划开始</span>
          <strong>{task.beginTime || "--"}</strong>
        </div>
        <div>
          <span>计划截止</span>
          <strong>{task.endTime || "--"}</strong>
        </div>
      </div>
    );

    const renderStats = (task: DeviceDetailTask) => (
      <div class="device-full-stat-grid">
        <div>
          <strong>{task.routePoints.length || task.totalPointCount}</strong>
          <span>总{pointLabel.value}</span>
        </div>
        <div>
          <strong>{donePointCount.value}</strong>
          <span>已执行</span>
        </div>
        <div>
          <strong class="success">{normalPointCount.value}</strong>
          <span>正常</span>
        </div>
        <div>
          <strong class="danger">{abnormalPointCount.value}</strong>
          <span>异常</span>
        </div>
        <div>
          <strong class="primary">{progressPercent.value}%</strong>
          <span>{pointLabel.value}进度</span>
        </div>
      </div>
    );

    const renderRoutePoints = (task: DeviceDetailTask) => {
      if (task.routePoints.length === 0) {
        return <Empty class="screen-empty device-full-empty" description={`暂无${pointLabel.value}数据`} />;
      }
      return (
        <div class="device-full-route-compact">
          <div class="device-full-route-progress">
            进度 {donePointCount.value}/{task.routePoints.length || task.totalPointCount} · {task.routeName || task.name}
          </div>
          <div class="device-full-route-chip-list">
            {task.routePoints.map((point, index) => (
              <button
                class={["device-full-route-chip", getPointTone(point), props.activePointIndex === index ? "active" : ""]}
                type="button"
                key={point.id}
                title={`${pointLabel.value}${index + 1} ${point.name}`}
                onClick={() => {
                  props.onSelectPoint(index);
                  props.onOpenPointDetail(index);
                }}
              >
                <span class="device-full-route-icon">{renderPointIcon(point)}</span>
                <em>
                  {pointLabel.value}
                  {index + 1}
                </em>
              </button>
            ))}
          </div>
        </div>
      );
    };

    return () => {
      const task = props.task;
      return (
        <Modal
          open={props.open}
          title={
            <span class="device-full-modal-title">
              <InfoCircleOutlined />
              {props.mode === "robotDog" ? "机器狗任务完整详情" : "无人机任务完整详情"}
            </span>
          }
          width={720}
          footer={null}
          wrapClassName="screen-modal-wrap draggable-modal-wrap device-task-full-wrap"
          class="screen-modal device-task-full-modal"
          onCancel={props.onClose}
        >
          {task ? (
            <div class="device-full-detail">
              <section>
                <div class="device-full-section-title">
                  <InfoCircleOutlined />
                  基本信息
                </div>
                {renderBasic(task)}
              </section>
              <section>
                <div class="device-full-section-title">
                  <OrderedListOutlined />
                  任务统计
                </div>
                {renderStats(task)}
              </section>
              <section>
                <div class="device-full-section-title">
                  <EnvironmentOutlined />
                  {pointLabel.value}执行明细
                </div>
                {renderRoutePoints(task)}
              </section>
              <section>
                <div class="device-full-section-title">任务描述</div>
                <p class="device-full-desc">{task.description || "暂无描述"}</p>
              </section>
            </div>
          ) : (
            <Empty class="screen-empty device-full-empty" description="请先选择任务" />
          )}
        </Modal>
      );
    };
  },
});

export const DeviceRoutePointDetailModal = defineComponent({
  name: "DeviceRoutePointDetailModal",
  props: {
    open: { type: Boolean, required: true },
    mode: { type: String as PropType<DeviceInspectionMode>, required: true },
    task: { type: Object as PropType<DeviceDetailTask | null>, required: false, default: null },
    routePoints: { type: Array as PropType<DeviceDetailPoint[]>, required: false, default: undefined },
    pointIndex: { type: Number, required: false, default: 0 },
    onClose: { type: Function as PropType<() => void>, required: true },
  },
  setup(props) {
    const pointLabel = computed(() => getPointLabel(props.mode));
    const point = computed<DeviceDetailPoint | null>(() => (props.routePoints || props.task?.routePoints || [])[props.pointIndex] || null);
    const inspectItems = computed(() => buildPointInspectItems(point.value));

    return () => {
      const currentPoint = point.value;
      return (
        <Modal
          open={props.open}
          title={
            <span class="device-full-modal-title">
              <OrderedListOutlined />
              {pointLabel.value}执行明细
            </span>
          }
          width={620}
          footer={null}
          wrapClassName="screen-modal-wrap draggable-modal-wrap device-point-detail-wrap"
          class="screen-modal device-point-detail-modal"
          onCancel={props.onClose}
        >
          {currentPoint ? (
            <div class="device-point-detail">
              <div class="device-point-basic">
                <div>
                  <span>{pointLabel.value}名称</span>
                  <strong>{currentPoint.name}</strong>
                </div>
                <div>
                  <span>执行设备</span>
                  <strong>{props.task?.deviceName || "--"}</strong>
                </div>
                <div>
                  <span>坐标</span>
                  <strong>
                    {currentPoint.lng.toFixed(5)}, {currentPoint.lat.toFixed(5)}
                  </strong>
                </div>
                <div>
                  <span>{props.mode === "robotDog" ? "点位名称" : "相对高度"}</span>
                  <strong>{currentPoint.heightText || "--"}</strong>
                </div>
                <div>
                  <span>执行时间</span>
                  <strong>{currentPoint.timeText || "--"}</strong>
                </div>
                <div>
                  <span>巡检状态</span>
                  <strong class={getPointTone(currentPoint)}>
                    {isDeviceRoutePoint(currentPoint) ? currentPoint.inspectionStatusName : currentPoint.result}
                  </strong>
                </div>
              </div>
              <div class="device-full-section-title">
                <OrderedListOutlined />
                巡检项明细（{inspectItems.value.length}项）
              </div>
              {inspectItems.value.length > 0 ? (
                <div class="device-point-item-list">
                  {inspectItems.value.map((item) => (
                    <div class={["device-point-item", item.result === "异常" ? "abnormal" : "done"]} key={item.name}>
                      <span>{item.name}</span>
                      <em>{item.standard}</em>
                      <strong>{item.result}</strong>
                      <i>{item.photo}</i>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty class="screen-empty device-full-empty" description={`该${pointLabel.value}暂未配置巡检项`} />
              )}
              <div class="device-point-actions">
                <Button onClick={props.onClose}>关闭</Button>
              </div>
            </div>
          ) : (
            <Empty class="screen-empty device-full-empty" description={`暂无${pointLabel.value}数据`} />
          )}
        </Modal>
      );
    };
  },
});
