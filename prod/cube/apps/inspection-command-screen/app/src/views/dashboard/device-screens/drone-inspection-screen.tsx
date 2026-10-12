import {
  AppstoreOutlined,
  FireOutlined,
  InfoCircleOutlined,
  OrderedListOutlined,
  ProfileOutlined,
  RocketOutlined,
  SearchOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, shallowRef } from "vue";

import { Button, Input, message } from "@ghcloud/cube-ui";

import { TimeFilterBar } from "../components/time-filter-bar";
import { DeviceInfoModal } from "./device-info-modal";
import { droneDevices, type DeviceInfoItem } from "./device-inspection-data";
import { DeviceLiveModal } from "./device-live-modal";
import { resolveDroneTaskVideoUrl, shouldShowDeviceLiveModal } from "./device-live-videos";
import { DeviceRoutePointDetailModal, DeviceTaskFullDetailModal } from "./device-task-detail-modal";
import { DroneMapScene } from "./drone-map-scene";
import {
  getDroneTaskDetail,
  getDroneTaskList,
  getDroneTaskOverview,
  getDroneTaskRoutePoints,
  type DeviceInspectionTaskData,
} from "@/api/dashboard-service";
import type { TimeFilter } from "@/types/dashboard";

import "./device-inspection-screen.less";

interface DroneTaskDayStat {
  date: string;
  done: number;
  running: number;
  pending: number;
}

const renderMetricClass = (accent?: DeviceInfoItem["metrics"][number]["accent"]): string => {
  return accent ? `device-metric-${accent}` : "";
};

const renderDayStat = (item: DroneTaskDayStat) => {
  const total = Math.max(item.done + item.running + item.pending, 1);
  return (
    <div class="device-day-row" key={item.date}>
      <span>{item.date}</span>
      <div class="device-day-bar">
        <i class="done" style={{ width: `${(item.done / total) * 100}%` }} />
        <i class="running" style={{ width: `${(item.running / total) * 100}%` }} />
        <i class="pending" style={{ width: `${(item.pending / total) * 100}%` }} />
      </div>
      <em>
        {item.done}/{item.running}/{item.pending}
      </em>
    </div>
  );
};

const getTaskDayLabel = (task: DeviceInspectionTaskData): string => {
  const time = task.beginTime || task.endTime;
  const parsed = dayjs(time);
  return parsed.isValid() ? parsed.format("MM-DD") : "未计划";
};

const buildDayStats = (tasks: DeviceInspectionTaskData[]): DroneTaskDayStat[] => {
  const stats = new Map<string, DroneTaskDayStat>();
  tasks.forEach((task) => {
    const date = getTaskDayLabel(task);
    const item = stats.get(date) || { date, done: 0, running: 0, pending: 0 };
    if (task.status === "已巡检") {
      item.done += 1;
    } else if (task.status === "巡检中") {
      item.running += 1;
    } else {
      item.pending += 1;
    }
    stats.set(date, item);
  });
  return [...stats.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(-5);
};

const defaultTaskFilter = (): TimeFilter => ({ type: "30d" });

const isFallbackDroneDeviceId = (task: DeviceInspectionTaskData): boolean => {
  return !task.deviceId || task.deviceId === "drone" || task.deviceId === `${task.id}-drone`;
};

export const DroneInspectionScreen = defineComponent({
  name: "DroneInspectionScreen",
  setup() {
    const overviewFilter = ref<TimeFilter>(defaultTaskFilter());
    const taskFilter = ref<TimeFilter>(defaultTaskFilter());
    const overview = reactive({ total: 0, running: 0, done: 0 });
    const tasks = ref<DeviceInspectionTaskData[]>([]);
    const selectedTask = shallowRef<DeviceInspectionTaskData | null>(null);
    const detailTask = shallowRef<DeviceInspectionTaskData | null>(null);
    const pointDetailTask = shallowRef<DeviceInspectionTaskData | null>(null);
    const taskTotal = shallowRef(0);
    const taskLoading = shallowRef(false);
    const overviewLoading = shallowRef(false);
    const taskKeyword = shallowRef("");
    const taskSearchKeyword = shallowRef("");
    const routeLoadingTaskId = shallowRef("");
    const activePointIndex = shallowRef(0);
    const detailActivePointIndex = shallowRef(0);
    const pointDetailIndex = shallowRef(0);
    const deviceInfoModalOpen = shallowRef(false);
    const detailModalOpen = shallowRef(false);
    const pointDetailModalOpen = shallowRef(false);
    const livePaused = shallowRef(true);
    const activeControlTab = shallowRef<"flight" | "gimbal" | "camera" | "hangar">("flight");
    const taskPageSize = 20;
    let taskRequestSeq = 0;
    let overviewRequestSeq = 0;
    let selectedTaskRequestSeq = 0;
    let detailTaskRequestSeq = 0;

    const dayStats = computed(() => buildDayStats(tasks.value));
    const selectedLiveVideoUrl = computed(() => resolveDroneTaskVideoUrl(selectedTask.value, tasks.value));
    const liveModalVisible = computed(() => shouldShowDeviceLiveModal(selectedTask.value));

    const currentDevice = computed(() => {
      const task = selectedTask.value;
      return droneDevices.find((device) => device.id === task?.deviceId) || droneDevices[0];
    });

    const currentDeviceInfo = computed<DeviceInfoItem | null>(() => {
      const task = selectedTask.value;
      if (!task) {
        return null;
      }
      return {
        ...currentDevice.value,
        id: task.deviceId,
        name: task.deviceName || task.deviceId || "无人机设备",
      };
    });

    const mergeTaskRoutePoints = (taskId: string, routePoints: DeviceInspectionTaskData["routePoints"]): void => {
      let nextSelectedTask: DeviceInspectionTaskData | null = null;
      tasks.value = tasks.value.map((task) => {
        if (task.id !== taskId) {
          return task;
        }
        const totalPointCount = routePoints.length || task.totalPointCount;
        const donePointCount = routePoints.length
          ? routePoints.filter((point) => point.status === "done" || point.status === "abnormal").length
          : task.donePointCount;
        nextSelectedTask = {
          ...task,
          routePoints,
          totalPointCount,
          donePointCount: Math.min(donePointCount, totalPointCount),
        };
        return nextSelectedTask;
      });
      if (selectedTask.value?.id === taskId && nextSelectedTask) {
        selectedTask.value = nextSelectedTask;
      }
    };

    const mergeTaskDetail = (detailTask: DeviceInspectionTaskData): void => {
      let nextSelectedTask: DeviceInspectionTaskData | null = null;
      tasks.value = tasks.value.map((task) => {
        if (task.id !== detailTask.id) {
          return task;
        }
        const hazardDefaultLocation = detailTask.hazardDefaultLocation || task.hazardDefaultLocation;
        const mergedTask: DeviceInspectionTaskData = {
          ...task,
          ...detailTask,
          deviceId: isFallbackDroneDeviceId(detailTask) && task.deviceId ? task.deviceId : detailTask.deviceId,
          deviceName: detailTask.deviceName === "无人机" && task.deviceName ? task.deviceName : detailTask.deviceName,
          routePoints: detailTask.routePoints.length > 0 ? detailTask.routePoints : task.routePoints,
          totalPointCount: detailTask.totalPointCount || task.totalPointCount,
          donePointCount: detailTask.donePointCount || task.donePointCount,
          ...(hazardDefaultLocation ? { hazardDefaultLocation } : {}),
        };
        nextSelectedTask = mergedTask;
        return mergedTask;
      });
      if (selectedTask.value?.id === detailTask.id) {
        selectedTask.value = nextSelectedTask || detailTask;
      }
    };

    const ensureTaskRoutePoints = async (task: DeviceInspectionTaskData): Promise<void> => {
      if (task.routePoints.length > 0 || routeLoadingTaskId.value === task.id) {
        return;
      }
      routeLoadingTaskId.value = task.id;
      try {
        const routePoints = await getDroneTaskRoutePoints({ taskId: task.id });
        if (routePoints.length > 0) {
          mergeTaskRoutePoints(task.id, routePoints);
        }
      } finally {
        if (routeLoadingTaskId.value === task.id) {
          routeLoadingTaskId.value = "";
        }
      }
    };

    const selectTask = async (task: DeviceInspectionTaskData): Promise<void> => {
      const requestSeq = ++selectedTaskRequestSeq;
      selectedTask.value = task;
      activePointIndex.value = 0;
      pointDetailModalOpen.value = false;
      livePaused.value = true;
      let nextTask = task;
      try {
        const detailTask = await getDroneTaskDetail({ taskId: task.id });
        if (requestSeq !== selectedTaskRequestSeq) {
          return;
        }
        const deviceId = isFallbackDroneDeviceId(detailTask) && task.deviceId ? task.deviceId : detailTask.deviceId;
        mergeTaskDetail({
          ...detailTask,
          deviceId,
        });
        nextTask = selectedTask.value || detailTask;
      } catch {
        if (requestSeq === selectedTaskRequestSeq) {
          message.error("无人机任务详情加载失败");
        }
      }
      if (requestSeq === selectedTaskRequestSeq) {
        ensureTaskRoutePoints(nextTask).catch(() => undefined);
      }
    };

    const selectRoutePoint = (index: number, openDetail = false): void => {
      const points = selectedTask.value?.routePoints || [];
      if (points.length === 0) {
        return;
      }
      activePointIndex.value = Math.max(0, Math.min(index, points.length - 1));
      livePaused.value = false;
      if (openDetail) {
        pointDetailTask.value = selectedTask.value;
        pointDetailIndex.value = activePointIndex.value;
        pointDetailModalOpen.value = true;
      }
    };

    const openFullDetail = (): void => {
      if (!selectedTask.value) {
        message.info("请先选择无人机任务");
        return;
      }
      detailTask.value = selectedTask.value;
      detailActivePointIndex.value = activePointIndex.value;
      detailModalOpen.value = true;
    };

    const openRelatedTaskDetail = (task: DeviceInspectionTaskData): void => {
      const requestSeq = ++detailTaskRequestSeq;
      detailTask.value = task;
      detailActivePointIndex.value = 0;
      detailModalOpen.value = true;
      getDroneTaskDetail({ taskId: task.id })
        .then(async (detail) => {
          if (requestSeq !== detailTaskRequestSeq) {
            return;
          }
          const deviceId = isFallbackDroneDeviceId(detail) && task.deviceId ? task.deviceId : detail.deviceId;
          const routePoints =
            detail.routePoints.length > 0
              ? detail.routePoints
              : await getDroneTaskRoutePoints({ taskId: task.id }).catch(() => task.routePoints);
          if (requestSeq !== detailTaskRequestSeq) {
            return;
          }
          detailTask.value = {
            ...task,
            ...detail,
            deviceId,
            deviceName: detail.deviceName === "无人机" && task.deviceName ? task.deviceName : detail.deviceName,
            routePoints: routePoints.length > 0 ? routePoints : task.routePoints,
            totalPointCount: detail.totalPointCount || task.totalPointCount,
            donePointCount: detail.donePointCount || task.donePointCount,
          };
        })
        .catch(() => {
          if (requestSeq === detailTaskRequestSeq) {
            message.error("无人机任务详情加载失败");
          }
        });
    };

    const loadDroneOverview = async (): Promise<void> => {
      const requestSeq = ++overviewRequestSeq;
      overviewLoading.value = true;
      try {
        const data = await getDroneTaskOverview({ filter: overviewFilter.value });
        if (requestSeq !== overviewRequestSeq) {
          return;
        }
        Object.assign(overview, data);
      } catch {
        if (requestSeq === overviewRequestSeq) {
          Object.assign(overview, { total: 0, running: 0, done: 0 });
        }
      } finally {
        if (requestSeq === overviewRequestSeq) {
          overviewLoading.value = false;
        }
      }
    };

    const loadDroneTasks = async (): Promise<void> => {
      const requestSeq = ++taskRequestSeq;
      taskLoading.value = true;
      try {
        const data = await getDroneTaskList({
          filter: taskFilter.value,
          keyword: taskSearchKeyword.value,
          pageNumber: 1,
          pageSize: taskPageSize,
        });
        if (requestSeq !== taskRequestSeq) {
          return;
        }
        tasks.value = data.records;
        taskTotal.value = data.total;
        selectedTask.value = data.records[0] || null;
        activePointIndex.value = 0;
        pointDetailModalOpen.value = false;
        if (selectedTask.value) {
          selectTask(selectedTask.value).catch(() => undefined);
        }
      } catch {
        if (requestSeq === taskRequestSeq) {
          tasks.value = [];
          taskTotal.value = 0;
          selectedTask.value = null;
          message.error("无人机任务加载失败");
        }
      } finally {
        if (requestSeq === taskRequestSeq) {
          taskLoading.value = false;
        }
      }
    };

    const searchDroneTasks = (): void => {
      const keyword = taskKeyword.value.trim();
      taskKeyword.value = keyword;
      taskSearchKeyword.value = keyword;
      selectedTask.value = null;
      activePointIndex.value = 0;
      pointDetailModalOpen.value = false;
      deviceInfoModalOpen.value = false;
      loadDroneTasks().catch(() => undefined);
    };

    const onOverviewFilter = (value: TimeFilter): void => {
      overviewFilter.value = value;
      loadDroneOverview().catch(() => undefined);
    };

    const onTaskFilter = (value: TimeFilter): void => {
      taskFilter.value = value;
      selectedTask.value = null;
      activePointIndex.value = 0;
      pointDetailModalOpen.value = false;
      deviceInfoModalOpen.value = false;
      loadDroneTasks().catch(() => undefined);
    };

    const onUpdateTaskKeyword = (value: string): void => {
      taskKeyword.value = value;
    };

    const runDroneAction = (_action: string): void => {
      // message.info(`无人机${action}指令已记录`);
    };

    const renderTaskItem = (task: DeviceInspectionTaskData) => (
      <div
        class={["device-task-item", selectedTask.value?.id === task.id ? "active" : ""]}
        key={task.id}
        onClick={() => {
          selectTask(task).catch(() => undefined);
        }}
      >
        <div class="device-task-head">
          <div class="device-task-head-main">
            <strong>{task.name}</strong>
            <span class="device-drone-badge">
              <RocketOutlined />
              {task.inspectionMode === "HYBRID" ? "含无人机" : "无人机"}
            </span>
          </div>
          <span class="device-status-tag">{task.status}</span>
        </div>
        <div class="device-task-meta">
          <span>级别: {task.level}</span>
          <span>航点数: {task.totalPointCount || task.objectCount}</span>
          <span>设备: {task.deviceName}</span>
        </div>
        <div class="device-task-progress">
          <span>
            进度 {task.donePointCount}/{task.totalPointCount}
          </span>
          <span>{task.routeName}</span>
        </div>
      </div>
    );

    const renderTaskList = () => {
      if (taskLoading.value) {
        return <div class="device-detail-empty">无人机任务加载中...</div>;
      }
      if (tasks.value.length === 0) {
        return <div class="device-detail-empty">暂无无人机任务</div>;
      }
      return tasks.value.map(renderTaskItem);
    };

    const renderDeviceInfo = () => (
      <section class="device-card">
        {currentDeviceInfo.value ? (
          <>
            <div class="device-info-top">
              <span class="device-icon">
                <FireOutlined />
              </span>
              <button
                class="device-info-main device-info-title-button"
                type="button"
                onClick={() => {
                  deviceInfoModalOpen.value = true;
                }}
              >
                <strong>{currentDeviceInfo.value.name}</strong>
                <span>型号：{currentDeviceInfo.value.model}</span>
              </button>
              <span class="device-online-badge">{currentDeviceInfo.value.badge}</span>
            </div>
            <div class="device-info-grid">
              {currentDeviceInfo.value.metrics.map((metric) => (
                <div class={renderMetricClass(metric.accent)} key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div class="device-detail-empty device-info-empty">{taskLoading.value ? "设备信息加载中..." : "请选择无人机任务"}</div>
        )}
      </section>
    );

    const renderRoutePoints = (task: DeviceInspectionTaskData) => {
      if (task.routePoints.length === 0) {
        return <div class="device-detail-empty">{routeLoadingTaskId.value === task.id ? "航点加载中..." : "暂无航点数据"}</div>;
      }
      const doneCount = task.routePoints.filter((point) => point.status === "done" || point.status === "abnormal").length;
      return (
        <div class="device-full-route-compact device-card-route-compact">
          <div class="device-full-route-progress">
            进度 {doneCount}/{task.routePoints.length || task.totalPointCount} · {task.routeName || task.name}
          </div>
          <div class="device-full-route-chip-list">
            {task.routePoints.map((point, index) => (
              <button
                class={["device-full-route-chip", point.status, activePointIndex.value === index ? "active" : ""]}
                type="button"
                key={point.id}
                title={`${point.name} · ${point.lng.toFixed(5)}, ${point.lat.toFixed(5)}`}
                onClick={() => selectRoutePoint(index, true)}
              >
                <span class="device-full-route-icon">{index + 1}</span>
                <em>航点{index + 1}</em>
              </button>
            ))}
          </div>
        </div>
      );
    };

    const renderDetail = () => {
      const task = selectedTask.value;
      if (!task) {
        return <div class="device-detail-empty">请选择左侧无人机任务</div>;
      }
      return (
        <div class="device-detail-scroll">
          <div class="device-detail-title">
            <span>{task.name}</span>
            <span class="device-status-tag">{task.status}</span>
          </div>
          <div class="device-detail-grid">
            <div>
              <span>巡检设备</span>
              <strong>{task.deviceName}</strong>
            </div>
            <div>
              <span>航线</span>
              <strong>{task.routeName}</strong>
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
          <div class="device-route-points">{renderRoutePoints(task)}</div>
        </div>
      );
    };

    const renderControl = () => (
      <section class="device-card device-control-card">
        <div class="device-card-title">
          <VideoCameraOutlined />
          无人机快捷控制
        </div>
        <div class="device-control-tabs">
          {[
            ["flight", "飞行"],
            ["gimbal", "云台"],
            ["camera", "相机"],
            ["hangar", "机库"],
          ].map(([key, label]) => (
            <button
              class={activeControlTab.value === key ? "active" : ""}
              key={key}
              type="button"
              onClick={() => {
                activeControlTab.value = key as typeof activeControlTab.value;
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div class="device-control-body">
          <div class="device-control-grid">
            {activeControlTab.value === "flight"
              ? ["上升", "前进", "下降", "左移", "悬停", "右移", "起飞", "返航", "迫降"].map((item) => (
                  <button class={item === "迫降" ? "danger" : ""} type="button" key={item} onClick={() => runDroneAction(item)}>
                    {item}
                  </button>
                ))
              : ["左转", "回中", "右转", "下视", "拍照", "录像"].map((item) => (
                  <button type="button" key={item} onClick={() => runDroneAction(item)}>
                    {item}
                  </button>
                ))}
          </div>
        </div>
      </section>
    );

    onMounted(() => {
      loadDroneOverview().catch(() => undefined);
      loadDroneTasks().catch(() => undefined);
    });

    onBeforeUnmount(() => {
      taskRequestSeq += 1;
      overviewRequestSeq += 1;
      selectedTaskRequestSeq += 1;
      detailTaskRequestSeq += 1;
    });

    return () => (
      <div class="device-inspection-screen drone-inspection-screen">
        <DroneMapScene
          points={selectedTask.value?.routePoints || []}
          activePointIndex={activePointIndex.value}
          onSelectPoint={(index) => selectRoutePoint(index, true)}
        />
        <div class="device-panel device-panel-left">
          <section class="device-card">
            <div class="device-card-title">
              <AppstoreOutlined />
              无人机任务总览
            </div>
            <TimeFilterBar value={overviewFilter.value} onChange={onOverviewFilter} />
            <div class="device-task-summary">
              <div>
                <strong>{overviewLoading.value ? "--" : overview.total}</strong>
                <span>总任务</span>
              </div>
              <div>
                <strong>{overviewLoading.value ? "--" : overview.running}</strong>
                <span>执行中</span>
              </div>
              <div>
                <strong>{overviewLoading.value ? "--" : overview.done}</strong>
                <span>已完成</span>
              </div>
            </div>
          </section>
          <section class="device-card device-task-list-card">
            <div class="device-card-title">
              <OrderedListOutlined />
              无人机任务列表（{taskTotal.value}条）
            </div>
            <TimeFilterBar value={taskFilter.value} onChange={onTaskFilter} />
            <div class="device-task-search-row">
              <Input
                class="device-task-search"
                placeholder="搜索任务名称"
                value={taskKeyword.value}
                maxlength={50}
                showCount={false}
                allowClear
                onUpdate:value={onUpdateTaskKeyword}
                onPressEnter={searchDroneTasks}
              />
              <Button class="device-task-search-button" type="primary" onClick={searchDroneTasks}>
                <SearchOutlined />
                搜索
              </Button>
            </div>
            <div class="device-task-list">{renderTaskList()}</div>
          </section>
          <section class="device-card device-stat-card">
            <div class="device-card-title">
              <AppstoreOutlined />
              设备任务统计
            </div>
            {dayStats.value.length > 0 ? dayStats.value.map(renderDayStat) : <div class="device-detail-empty">暂无统计数据</div>}
          </section>
        </div>
        <div class="device-panel device-panel-right">
          {renderDeviceInfo()}
          {renderControl()}
          {selectedTask.value ? (
            <section class="device-card device-detail-card">
              <div class="device-detail-card-head">
                <div class="device-card-title">
                  <InfoCircleOutlined />
                  任务详情
                </div>
                <Button class="device-detail-full-btn" size="small" onClick={openFullDetail}>
                  <ProfileOutlined />
                  完整详情
                </Button>
              </div>
              {renderDetail()}
            </section>
          ) : null}
        </div>
        {liveModalVisible.value ? (
          <DeviceLiveModal
            open
            mode="drone"
            task={selectedTask.value}
            streamDeviceId={selectedTask.value?.deviceId || ""}
            localVideoUrl={selectedLiveVideoUrl.value}
            preferLocalVideo
            activePointIndex={activePointIndex.value}
            paused={livePaused.value}
            onSnapshot={() => runDroneAction("拍照")}
            onTogglePaused={() => {
              livePaused.value = !livePaused.value;
            }}
            onSelectPoint={(index) => selectRoutePoint(index)}
          />
        ) : null}
        <DeviceInfoModal
          open={deviceInfoModalOpen.value && !!currentDeviceInfo.value}
          mode="drone"
          device={currentDeviceInfo.value || currentDevice.value}
          deviceId={selectedTask.value?.deviceId || ""}
          onClose={() => {
            deviceInfoModalOpen.value = false;
          }}
          onOpenTask={openRelatedTaskDetail}
        />
        <DeviceTaskFullDetailModal
          open={detailModalOpen.value}
          mode="drone"
          task={detailTask.value}
          activePointIndex={detailActivePointIndex.value}
          onClose={() => {
            detailModalOpen.value = false;
          }}
          onSelectPoint={(index) => {
            detailActivePointIndex.value = index;
          }}
          onOpenPointDetail={(index) => {
            detailActivePointIndex.value = index;
            pointDetailTask.value = detailTask.value;
            pointDetailIndex.value = index;
            pointDetailModalOpen.value = true;
          }}
        />
        <DeviceRoutePointDetailModal
          open={pointDetailModalOpen.value}
          mode="drone"
          task={pointDetailTask.value || selectedTask.value}
          pointIndex={pointDetailIndex.value}
          onClose={() => {
            pointDetailModalOpen.value = false;
          }}
        />
      </div>
    );
  },
});
