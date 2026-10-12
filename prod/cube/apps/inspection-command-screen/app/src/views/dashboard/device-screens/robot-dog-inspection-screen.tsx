import {
  AppstoreOutlined,
  InfoCircleOutlined,
  OrderedListOutlined,
  ProfileOutlined,
  RobotOutlined,
  SearchOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, shallowRef } from "vue";

import { Button, Input, message } from "@ghcloud/cube-ui";

import { TimeFilterBar } from "../components/time-filter-bar";
import { DeviceInfoModal } from "./device-info-modal";
import { robotDogDevices, type DeviceInfoItem, type DeviceTaskDayStat } from "./device-inspection-data";
import { DeviceLiveModal } from "./device-live-modal";
import { resolveRobotDogTaskVideoUrl, shouldShowDeviceLiveModal } from "./device-live-videos";
import { DeviceRoutePointDetailModal, DeviceTaskFullDetailModal } from "./device-task-detail-modal";
import { DroneMapScene } from "./drone-map-scene";
import {
  getRobotDogTaskDetail,
  getRobotDogTaskList,
  getRobotDogTaskOverview,
  getRobotDogTaskRoutePoints,
  type DeviceInspectionTaskData,
} from "@/api/dashboard-service";
import type { TimeFilter } from "@/types/dashboard";

import "./device-inspection-screen.less";

type RobotControlTab = "move" | "pose" | "status" | "safety";

const renderMetricClass = (accent?: DeviceInfoItem["metrics"][number]["accent"]): string => {
  return accent ? `device-metric-${accent}` : "";
};

const renderDayStat = (item: DeviceTaskDayStat) => {
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

const defaultTaskFilter = (): TimeFilter => ({ type: "30d" });

const isFallbackRobotDogDeviceId = (task: DeviceInspectionTaskData): boolean => {
  return !task.deviceId || task.deviceId === "robot-dog" || task.deviceId === `${task.id}-robot-dog`;
};

const buildDayStats = (tasks: DeviceInspectionTaskData[]): DeviceTaskDayStat[] => {
  const stats = new Map<string, DeviceTaskDayStat>();
  tasks.forEach((task) => {
    const parsed = dayjs(task.beginTime || task.endTime);
    const date = parsed.isValid() ? parsed.format("MM-DD") : "未计划";
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

export const RobotDogInspectionScreen = defineComponent({
  name: "RobotDogInspectionScreen",
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
    const activeControlTab = shallowRef<RobotControlTab>("move");
    const speed = shallowRef(0.8);
    const lastCommand = shallowRef("--");
    const videoPaused = shallowRef(true);
    const taskPageSize = 20;
    let taskRequestSeq = 0;
    let overviewRequestSeq = 0;
    let selectedTaskRequestSeq = 0;
    let detailTaskRequestSeq = 0;

    onBeforeUnmount(() => {
      taskRequestSeq += 1;
      overviewRequestSeq += 1;
      selectedTaskRequestSeq += 1;
      detailTaskRequestSeq += 1;
    });

    const dayStats = computed(() => buildDayStats(tasks.value));
    const selectedLiveVideoUrl = computed(() => resolveRobotDogTaskVideoUrl(selectedTask.value));
    const liveModalVisible = computed(() => shouldShowDeviceLiveModal(selectedTask.value));

    const currentDevice = computed(() => {
      const task = selectedTask.value;
      return robotDogDevices.find((device) => device.id === task?.deviceId) || robotDogDevices[0];
    });

    const currentDeviceInfo = computed<DeviceInfoItem | null>(() => {
      const task = selectedTask.value;
      if (!task) {
        return null;
      }
      return {
        ...currentDevice.value,
        id: task.deviceId,
        name: task.deviceName || task.deviceId || "机器狗设备",
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
          deviceId: isFallbackRobotDogDeviceId(detailTask) && task.deviceId ? task.deviceId : detailTask.deviceId,
          deviceName: detailTask.deviceName === "机器狗" && task.deviceName ? task.deviceName : detailTask.deviceName,
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
        const routePoints = await getRobotDogTaskRoutePoints({ taskId: task.id });
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
      videoPaused.value = true;
      let nextTask = task;
      try {
        const detailTask = await getRobotDogTaskDetail({ taskId: task.id });
        if (requestSeq !== selectedTaskRequestSeq) {
          return;
        }
        const deviceId = isFallbackRobotDogDeviceId(detailTask) && task.deviceId ? task.deviceId : detailTask.deviceId;
        mergeTaskDetail({
          ...detailTask,
          deviceId,
        });
        nextTask = selectedTask.value || detailTask;
      } catch {
        if (requestSeq === selectedTaskRequestSeq) {
          message.error("机器狗任务详情加载失败");
        }
      }
      if (requestSeq === selectedTaskRequestSeq) {
        ensureTaskRoutePoints(nextTask).catch(() => undefined);
      }
    };

    const loadRobotDogOverview = async (): Promise<void> => {
      const requestSeq = ++overviewRequestSeq;
      overviewLoading.value = true;
      try {
        const data = await getRobotDogTaskOverview({ filter: overviewFilter.value });
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

    const loadRobotDogTasks = async (): Promise<void> => {
      const requestSeq = ++taskRequestSeq;
      taskLoading.value = true;
      try {
        const data = await getRobotDogTaskList({
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
          message.error("机器狗任务加载失败");
        }
      } finally {
        if (requestSeq === taskRequestSeq) {
          taskLoading.value = false;
        }
      }
    };

    const onUpdateTaskKeyword = (value: string): void => {
      taskKeyword.value = value;
    };

    const searchTaskList = (): void => {
      const keyword = taskKeyword.value.trim();
      taskKeyword.value = keyword;
      taskSearchKeyword.value = keyword;
      selectedTask.value = null;
      activePointIndex.value = 0;
      pointDetailModalOpen.value = false;
      deviceInfoModalOpen.value = false;
      loadRobotDogTasks().catch(() => undefined);
    };

    const onOverviewFilter = (value: TimeFilter): void => {
      overviewFilter.value = value;
      loadRobotDogOverview().catch(() => undefined);
    };

    const onTaskFilter = (value: TimeFilter): void => {
      taskFilter.value = value;
      selectedTask.value = null;
      activePointIndex.value = 0;
      pointDetailModalOpen.value = false;
      deviceInfoModalOpen.value = false;
      loadRobotDogTasks().catch(() => undefined);
    };

    const selectRoutePoint = (index: number, openDetail = false): void => {
      const points = selectedTask.value?.routePoints || [];
      if (points.length === 0) {
        return;
      }
      activePointIndex.value = Math.max(0, Math.min(index, points.length - 1));
      videoPaused.value = false;
      if (openDetail) {
        pointDetailTask.value = selectedTask.value;
        pointDetailIndex.value = activePointIndex.value;
        pointDetailModalOpen.value = true;
      }
    };

    const openFullDetail = (): void => {
      if (!selectedTask.value) {
        message.info("请先选择机器狗任务");
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
      getRobotDogTaskDetail({ taskId: task.id })
        .then(async (detail) => {
          if (requestSeq !== detailTaskRequestSeq) {
            return;
          }
          const deviceId = isFallbackRobotDogDeviceId(detail) && task.deviceId ? task.deviceId : detail.deviceId;
          const routePoints =
            detail.routePoints.length > 0
              ? detail.routePoints
              : await getRobotDogTaskRoutePoints({ taskId: task.id }).catch(() => task.routePoints);
          if (requestSeq !== detailTaskRequestSeq) {
            return;
          }
          detailTask.value = {
            ...task,
            ...detail,
            deviceId,
            deviceName: detail.deviceName === "机器狗" && task.deviceName ? task.deviceName : detail.deviceName,
            routePoints: routePoints.length > 0 ? routePoints : task.routePoints,
            totalPointCount: detail.totalPointCount || task.totalPointCount,
            donePointCount: detail.donePointCount || task.donePointCount,
          };
        })
        .catch(() => {
          if (requestSeq === detailTaskRequestSeq) {
            message.error("机器狗任务详情加载失败");
          }
        });
    };

    const runCommand = (command: string): void => {
      lastCommand.value = command;
    };

    const updateSpeed = (event: Event): void => {
      const target = event.target as HTMLInputElement;
      speed.value = Number(target.value);
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
              <RobotOutlined />
              {task.inspectionMode === "HYBRID_ROBOT_DOG" ? "联动巡检" : "机器狗"}
            </span>
          </div>
          <span class="device-status-tag">{task.status}</span>
        </div>
        <div class="device-task-meta">
          <span>级别: {task.level}</span>
          <span>路线点数: {task.totalPointCount || task.objectCount}</span>
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
        return <div class="device-detail-empty">机器狗任务加载中...</div>;
      }
      if (tasks.value.length === 0) {
        return <div class="device-detail-empty">暂无机器狗任务</div>;
      }
      return tasks.value.map(renderTaskItem);
    };

    const renderDeviceInfo = () => (
      <section class="device-card">
        {currentDeviceInfo.value ? (
          <>
            <div class="device-info-top">
              <span class="device-icon">
                <RobotOutlined />
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
              <span class="device-online-badge">未连接</span>
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
          <div class="device-detail-empty device-info-empty">{taskLoading.value ? "设备信息加载中..." : "请选择机器狗任务"}</div>
        )}
      </section>
    );

    const renderRoutePoints = (task: DeviceInspectionTaskData) => {
      if (task.routePoints.length === 0) {
        return <div class="device-detail-empty">{routeLoadingTaskId.value === task.id ? "路线点加载中..." : "暂无路线点数据"}</div>;
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
                <em>路线点{index + 1}</em>
              </button>
            ))}
          </div>
        </div>
      );
    };

    const renderDetail = () => {
      const task = selectedTask.value;
      if (!task) {
        return <div class="device-detail-empty">请选择左侧机器狗任务</div>;
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
              <span>路线</span>
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

    const renderMoveControl = () => (
      <>
        <div class="device-control-grid">
          {["左前", "前进", "右前", "左移", "停止", "右移", "左后", "后退", "右后"].map((command) => (
            <button class={command === "停止" ? "danger" : ""} type="button" key={command} onClick={() => runCommand(command)}>
              {command}
            </button>
          ))}
          <button type="button" onClick={() => runCommand("左转")}>
            左转
          </button>
          <button type="button" onClick={() => runCommand("右转")}>
            右转
          </button>
          <button class="danger" type="button" onClick={() => runCommand("紧急停止")}>
            急停
          </button>
        </div>
        <div class="device-speed-row">
          <div class="device-speed-label">
            <span>速度系数</span>
            <strong>{speed.value.toFixed(1)}x</strong>
          </div>
          <input type="range" min="0.2" max="1.2" step="0.1" value={speed.value} onInput={updateSpeed} />
          <div class="device-speed-presets">
            {[
              ["慢速", 0.4],
              ["中速", 0.8],
              ["全速", 1.2],
            ].map(([label, value]) => (
              <button
                class={speed.value === value ? "active" : ""}
                type="button"
                key={label as string}
                onClick={() => {
                  speed.value = value as number;
                }}
              >
                {label as string}
              </button>
            ))}
          </div>
        </div>
      </>
    );

    const renderPoseControl = () => (
      <div class="device-control-grid">
        {["站立", "卧倒", "坐下", "起立", "平衡", "恢复站立", "泄力"].map((command) => (
          <button class={command === "泄力" ? "danger" : ""} type="button" key={command} onClick={() => runCommand(command)}>
            {command}
          </button>
        ))}
      </div>
    );

    const renderStatusControl = () => (
      <div class="device-control-status">
        {[
          { label: "连接状态", value: "未连接" },
          { label: "任务来源", value: "任务接口" },
          { label: "控制方式", value: "本地预览" },
        ].map((metric) => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
        <div>
          <span>最后指令</span>
          <strong>{lastCommand.value}</strong>
        </div>
        <div>
          <span>视频流</span>
          <strong>{videoPaused.value ? "已暂停" : "实时"}</strong>
        </div>
      </div>
    );

    const renderSafetyControl = () => (
      <div class="device-control-grid">
        {["开启避障", "关闭避障", "接管速度控制", "释放速度控制", "开启自动恢复", "关闭自动恢复", "紧急停止", "解除急停"].map((command) => (
          <button class={command === "紧急停止" ? "danger" : ""} type="button" key={command} onClick={() => runCommand(command)}>
            {command}
          </button>
        ))}
      </div>
    );

    const renderControlBody = () => {
      if (activeControlTab.value === "pose") {
        return renderPoseControl();
      }
      if (activeControlTab.value === "status") {
        return renderStatusControl();
      }
      if (activeControlTab.value === "safety") {
        return renderSafetyControl();
      }
      return renderMoveControl();
    };

    onMounted(() => {
      loadRobotDogOverview().catch(() => undefined);
      loadRobotDogTasks().catch(() => undefined);
    });

    return () => (
      <div class="device-inspection-screen robot-dog-inspection-screen">
        <DroneMapScene
          points={selectedTask.value?.routePoints || []}
          activePointIndex={activePointIndex.value}
          onSelectPoint={(index) => selectRoutePoint(index, true)}
        />
        <div class="device-panel device-panel-left">
          <section class="device-card">
            <div class="device-card-title">
              <AppstoreOutlined />
              机器狗任务总览
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
              机器狗任务列表（{taskTotal.value}条）
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
                onPressEnter={searchTaskList}
              />
              <Button class="device-task-search-button" type="primary" onClick={searchTaskList}>
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
          <section class="device-card device-control-card">
            <div class="device-card-title">
              <VideoCameraOutlined />
              机器狗控制台
            </div>
            <div class="device-control-tabs">
              {[
                ["move", "移动"],
                ["pose", "姿态"],
                ["status", "状态"],
                ["safety", "安全"],
              ].map(([key, label]) => (
                <button
                  class={activeControlTab.value === key ? "active" : ""}
                  key={key}
                  type="button"
                  onClick={() => {
                    activeControlTab.value = key as RobotControlTab;
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div class="device-control-body">{renderControlBody()}</div>
          </section>
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
            mode="robotDog"
            task={selectedTask.value}
            streamDeviceId={selectedTask.value?.deviceId || ""}
            localVideoUrl={selectedLiveVideoUrl.value}
            preferLocalVideo
            activePointIndex={activePointIndex.value}
            paused={videoPaused.value}
            onSnapshot={() => {
              lastCommand.value = "拍照";
            }}
            onTogglePaused={() => {
              videoPaused.value = !videoPaused.value;
            }}
            onSelectPoint={(index) => selectRoutePoint(index)}
          />
        ) : null}
        <DeviceInfoModal
          open={deviceInfoModalOpen.value && !!currentDeviceInfo.value}
          mode="robotDog"
          device={currentDeviceInfo.value || currentDevice.value}
          deviceId={selectedTask.value?.deviceId || ""}
          onClose={() => {
            deviceInfoModalOpen.value = false;
          }}
          onOpenTask={openRelatedTaskDetail}
        />
        <DeviceTaskFullDetailModal
          open={detailModalOpen.value}
          mode="robotDog"
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
          mode="robotDog"
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
