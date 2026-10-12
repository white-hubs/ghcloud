import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  InfoCircleOutlined,
  OrderedListOutlined,
  WarningOutlined,
} from "@ant-design/icons-vue";
import { defineComponent } from "vue";

import { Button, Empty } from "@ghcloud/cube-ui";

import type { DeviceRoutePointData } from "@/api/dashboard-service";
import type { TaskItem, TaskObjectItem } from "@/types/dashboard";

import "./manual-task-detail-panel.less";

const taskStatusClass: Record<TaskItem["status"], string> = {
  待接收: "pending",
  待巡检: "processing",
  已巡检: "done",
  已终止: "stopped",
  已超时: "timeout",
};

export const ManualTaskDetailPanel = defineComponent({
  name: "ManualTaskDetailPanel",
  props: {
    task: { type: Object as () => TaskItem, required: true },
    taskObjects: { type: Array as () => TaskObjectItem[], required: true },
    routePoints: { type: Array as () => DeviceRoutePointData[], required: true },
    objectLoading: { type: Boolean, required: true },
    routeLoading: { type: Boolean, required: true },
    onBack: { type: Function as unknown as () => () => void, required: true },
    onOpenRoutePointDetail: { type: Function as unknown as () => (index: number) => void, required: true },
  },
  setup(props) {
    const shouldShowObjects = (): boolean => props.task.inspectionMode !== "DRONE";
    const shouldShowRoutePoints = (): boolean => props.task.inspectionMode !== "MANUAL";

    const getObjectTypeText = (item: TaskObjectItem): string => {
      return item.targetCategoryName || item.targetTypeName || item.targetCategory || item.targetType || "--";
    };

    const getTotalObjectCount = (): number => {
      return props.taskObjects.length || props.task.objectCount;
    };

    const getNormalObjectCount = (): number => {
      return props.objectLoading ? 0 : props.taskObjects.length;
    };

    const getRouteAbnormalCount = (): number => props.routePoints.filter((point) => point.result === "异常").length;

    const getRouteNormalCount = (): number => props.routePoints.filter((point) => point.result === "正常").length;

    const getRouteDoneCount = (): number =>
      props.routePoints.filter((point) => point.status === "done" || point.status === "abnormal").length;

    const getRoutePointTone = (point: DeviceRoutePointData): DeviceRoutePointData["status"] => {
      if (point.status === "abnormal" || point.result === "异常") {
        return "abnormal";
      }
      if (point.status === "done" || point.result === "正常") {
        return "done";
      }
      return "pending";
    };

    const getRoutePointTitle = (point: DeviceRoutePointData): string => {
      const parts = [
        point.name,
        `${point.lng.toFixed(5)}, ${point.lat.toFixed(5)}`,
        point.heightText && point.heightText !== "-" ? point.heightText : "",
        point.typeName ? `类型: ${point.typeName}` : "",
        point.result !== "--" ? `结果: ${point.result}` : "",
      ].filter(Boolean);
      return parts.join(" · ");
    };

    const renderRoutePointIcon = (tone: DeviceRoutePointData["status"]) => {
      if (tone === "abnormal") {
        return <WarningOutlined />;
      }
      if (tone === "done") {
        return <CheckCircleFilled />;
      }
      return <ClockCircleOutlined />;
    };

    const renderStats = () => {
      if (props.task.inspectionMode === "DRONE") {
        const total = props.routePoints.length || props.task.objectCount;
        return (
          <div class="manual-stat-grid">
            <div>
              <strong>{props.routeLoading ? "--" : total}</strong>
              <span>总航点</span>
            </div>
            <div>
              <strong class="danger">{props.routeLoading ? "--" : getRouteAbnormalCount()}</strong>
              <span>异常</span>
            </div>
            <div>
              <strong class="success">{props.routeLoading ? "--" : getRouteNormalCount()}</strong>
              <span>正常</span>
            </div>
            <div>
              <strong>{props.routeLoading ? "--" : getRouteDoneCount()}</strong>
              <span>已执行</span>
            </div>
          </div>
        );
      }
      return (
        <div class="manual-stat-grid">
          <div>
            <strong>{getTotalObjectCount()}</strong>
            <span>总对象</span>
          </div>
          <div>
            <strong class="danger">0</strong>
            <span>异常</span>
          </div>
          <div>
            <strong class="success">{getNormalObjectCount()}</strong>
            <span>正常</span>
          </div>
          <div>
            <strong>{props.task.objectCount}</strong>
            <span>计划对象</span>
          </div>
        </div>
      );
    };

    const renderObjectSection = () => {
      if (!shouldShowObjects()) {
        return null;
      }
      return (
        <div class="manual-detail-section">
          <div class="manual-section-title">
            <OrderedListOutlined />
            巡检对象
          </div>
          {props.objectLoading ? (
            <div class="manual-object-status">加载巡检对象中...</div>
          ) : props.taskObjects.length === 0 ? (
            <Empty class="screen-empty manual-object-empty" description="暂无巡检对象数据" />
          ) : (
            <div class="manual-object-list">
              {props.taskObjects.map((item) => (
                <div class="manual-object-item" key={item.id || item.targetId}>
                  <span class="manual-object-icon">✅</span>
                  <div class="manual-object-main">
                    <strong>{item.targetName}</strong>
                    <span>类型: {getObjectTypeText(item)}</span>
                  </div>
                  <div class="manual-object-meta">
                    <span>{item.targetAddress}</span>
                    <span>{item.latAndLon || "暂无坐标"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    const renderRoutePointSection = () => {
      if (!shouldShowRoutePoints()) {
        return null;
      }
      return (
        <div class="manual-detail-section manual-route-section">
          {props.routeLoading ? (
            <div class="manual-object-status">加载航点信息中...</div>
          ) : props.routePoints.length === 0 ? (
            <Empty class="screen-empty manual-object-empty" description="暂无航点数据" />
          ) : (
            <>
              <div class="manual-route-progress">
                进度 {getRouteDoneCount()}/{props.routePoints.length || props.task.objectCount} · {props.task.routeName || props.task.name}
              </div>
              <div class="manual-route-chip-list">
                {props.routePoints.map((point, index) => {
                  const tone = getRoutePointTone(point);
                  return (
                    <button
                      class={["manual-route-chip", tone]}
                      key={point.id}
                      title={getRoutePointTitle(point)}
                      type="button"
                      onClick={() => props.onOpenRoutePointDetail(index)}
                    >
                      {renderRoutePointIcon(tone)}
                      <em>{`航点${index + 1}`}</em>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      );
    };

    return () => (
      <div class="right-panel card-panel manual-task-detail-panel">
        <section class="card module-card manual-task-detail-card">
          <div class="manual-detail-head">
            <div class="card-title">
              <InfoCircleOutlined />
              任务详情
            </div>
            <Button size="small" onClick={props.onBack}>
              <ArrowLeftOutlined />
              返回统计
            </Button>
          </div>

          <div class="manual-detail-title-row">
            <strong>{props.task.name}</strong>
            <span class={`task-status task-status-${taskStatusClass[props.task.status]}`}>{props.task.status}</span>
          </div>

          <div class="manual-detail-grid">
            <div>
              <span>任务名称</span>
              <strong title={props.task.name}>{props.task.name}</strong>
            </div>
            <div>
              <span>任务状态</span>
              <strong>
                <span class={`task-status task-status-${taskStatusClass[props.task.status]}`}>{props.task.status}</span>
              </strong>
            </div>
            <div>
              <span>巡检类型</span>
              <strong>{props.task.patrolType}</strong>
            </div>
            <div>
              <span>巡检模式</span>
              <strong>{props.task.inspectionModeName}</strong>
            </div>
            <div>
              <span>任务级别</span>
              <strong>{props.task.patrolLevel}</strong>
            </div>
            <div>
              <span>{props.task.inspectionMode === "DRONE" ? "航点数" : "巡检对象数"}</span>
              <strong>
                {props.task.inspectionMode === "DRONE" ? props.routePoints.length || props.task.objectCount : props.task.objectCount} 个
              </strong>
            </div>
            <div>
              <span>负责人</span>
              <strong>{props.task.owner}</strong>
            </div>
            <div>
              <span>执行设备</span>
              <strong>{props.task.deviceName || "--"}</strong>
            </div>
            <div>
              <span>航线</span>
              <strong>{props.task.routeName || "--"}</strong>
            </div>
            <div>
              <span>计划开始</span>
              <strong>{props.task.beginTime || "--"}</strong>
            </div>
            <div>
              <span>计划截止</span>
              <strong>{props.task.endTime || "--"}</strong>
            </div>
          </div>

          {renderStats()}
          {renderObjectSection()}
          {renderRoutePointSection()}

          <div class="manual-detail-desc">
            <span>任务描述</span>
            <p>{props.task.description || "暂无描述"}</p>
          </div>
        </section>
      </div>
    );
  },
});
