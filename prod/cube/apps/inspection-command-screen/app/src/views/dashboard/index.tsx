import {
  AlertOutlined,
  EnvironmentOutlined,
  DownOutlined,
  FireOutlined,
  RobotOutlined,
  RollbackOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, shallowRef } from "vue";

import { CallManager } from "@ghcloud/cube-rtc";
import { apiProxy as rtcApiProxy } from "@ghcloud/cube-rtc/src/api/server";
import { Button, message } from "@ghcloud/cube-ui";

import { LeftPanel } from "./components/left-panel";
import { ManualTaskDetailPanel } from "./components/manual-task-detail-panel";
import { MapScene } from "./components/map-scene";
import { PersonnelCallModal } from "./components/personnel-call-modal";
import { PersonnelModals } from "./components/personnel-modals";
import { RightPanel } from "./components/right-panel";
import { TaskModals } from "./components/task-modals";
import { useDraggableModals } from "./components/use-draggable-modals";
import { DeviceRoutePointDetailModal } from "./device-screens/device-task-detail-modal";
import { DroneInspectionScreen } from "./device-screens/drone-inspection-screen";
import { RobotDogInspectionScreen } from "./device-screens/robot-dog-inspection-screen";
import {
  filterPersonnelTrackInRadius,
  getAbnormalOverview,
  getAllPersonnelHistoryTrack,
  getCurrentUserId,
  getDashboardOverview,
  getDepartmentMembers,
  getDepartmentStats,
  getInspectionMapConfig,
  getInspectionPointCategories,
  getInspectionPointsByCategory,
  getLatestAbnormalInspectionPoints,
  getPersonnelById,
  getPersonnelDepartments,
  getPersonnelHistoryTrack,
  getPersonnelList,
  getRobotDogTaskRoutePoints,
  getDroneTaskRoutePoints,
  getTransferUsers,
  getPatrolTypeDistribution,
  getTaskDetail,
  getTaskList,
  getTaskObjects,
  terminateTask,
  transferTask,
  type DeviceRoutePointData,
} from "@/api/dashboard-service";
import { closeCommunicationMessageSocket, initCommunicationMessageSocket } from "@/api/message-socket";
import type {
  DepartmentMember,
  DepartmentStat,
  InspectionPointItem,
  InspectionTargetCategory,
  LayerType,
  PersonnelDepartment,
  PersonnelItem,
  PersonnelTrackPoint,
  TaskItem,
  TaskObjectItem,
  TimeFilter,
  TransferUser,
} from "@/types/dashboard";

import "./dashboard.less";
import "./components/screen-overlays.less";

type InspectionScreenMode = "manual" | "drone" | "robotDog";

export const DashboardView = defineComponent({
  name: "DashboardView",
  setup() {
    useDraggableModals();

    const activeMode = shallowRef<InspectionScreenMode>("manual");
    const defaultTimeFilter = (): TimeFilter => ({ type: "30d" });
    const getTimeFilterCacheKey = (filter: TimeFilter): string => {
      return filter.type === "custom" ? `${filter.type}:${filter.period?.join(",") || ""}` : filter.type;
    };
    /** 任务对象视图入口只关心坐标是否可用，详细 marker 解析仍由 MapScene 负责。 */
    const hasValidTaskObjectPoint = (item: TaskObjectItem): boolean => {
      const [lngText, latText] = item.latAndLon.split(",").map((text) => text.trim());
      const lng = Number(lngText);
      const lat = Number(latText);
      return Number.isFinite(lng) && Number.isFinite(lat) && Math.abs(lng) <= 180 && Math.abs(lat) <= 90;
    };

    const overviewFilter = ref<TimeFilter>(defaultTimeFilter());
    const taskFilter = ref<TimeFilter>(defaultTimeFilter());
    const abnormalFilter = ref<TimeFilter>(defaultTimeFilter());
    const typeFilter = ref<TimeFilter>(defaultTimeFilter());
    const deptFilter = ref<TimeFilter>(defaultTimeFilter());

    const overview = reactive({ total: 0, done: 0, undone: 0, timeout: 0, completionRate: 0 });
    const abnormal = reactive({ abnormalTask: 0, abnormalTaskTrend: 0, abnormalPoint: 0, abnormalPointTrend: 0 });
    const tasks = ref<TaskItem[]>([]);
    const taskPageNumber = ref(1);
    const taskPageSize = 10;
    const taskTotal = ref(0);
    const taskLoading = ref(false);
    const taskFinished = ref(false);
    const taskKeyword = shallowRef("");
    const taskSearchKeyword = shallowRef("");
    const taskType = ref<Array<{ name: string; value: number }>>([]);
    const depts = ref<DepartmentStat[]>([]);
    const expandedDept = ref<string[]>([]);

    const mapLayerMenuOpen = ref(false);
    const pointCategoryOptions = getInspectionPointCategories();
    const pointCategoryActive = ref<InspectionTargetCategory[]>([]);
    const pointCategoryCache = ref<Partial<Record<InspectionTargetCategory, InspectionPointItem[]>>>({});
    const abnormalPointCache = ref<InspectionPointItem[]>([]);
    const abnormalPointLoaded = ref(false);
    const layers = ref<LayerType[]>(["HEATMAP"]);
    const globalViewSignal = ref(0);
    const mapConfig = ref<Awaited<ReturnType<typeof getInspectionMapConfig>> | null>(null);

    const selectedTask = ref<TaskItem | null>(null);
    const selectedTaskObjects = ref<TaskObjectItem[]>([]);
    const selectedTaskRoutePoints = ref<DeviceRoutePointData[]>([]);
    const selectedRoutePointIndex = shallowRef(0);
    const selectedRoutePointDetailOpen = shallowRef(false);
    const selectedTaskObjectLoading = ref(false);
    const selectedTaskRouteLoading = ref(false);
    const taskObjectPoints = ref<TaskObjectItem[]>([]);
    const transferTaskData = ref<TaskItem | null>(null);
    const transferVisible = ref(false);
    const transferKeyword = ref("");
    const transferSelected = ref("");
    const transferUserList = ref<TransferUser[]>([]);
    const transferUserPageNumber = ref(1);
    const transferUserPageSize = 20;
    const transferUserTotal = ref(0);
    const transferUserLoading = ref(false);
    const transferUserFinished = ref(false);
    const terminateTaskData = ref<TaskItem | null>(null);
    const terminateVisible = ref(false);
    const deptMemberCache = ref<Record<string, DepartmentMember[]>>({});
    const personnelVisible = ref(false);
    const personnelKeyword = ref("");
    const personnelDepartmentId = ref("");
    const personnelDepartments = ref<PersonnelDepartment[]>([]);
    const personnelList = ref<PersonnelItem[]>([]);
    const personnelLoading = ref(false);
    const selectedPersonnel = ref<PersonnelItem | null>(null);
    const personnelFocusSignal = ref(0);
    const historyVisible = ref(false);
    const historyPerson = ref<PersonnelItem | null>(null);
    const historyStartDate = ref("");
    const historyEndDate = ref("");
    const historyRecords = ref<PersonnelTrackPoint[]>([]);
    const historyTotal = ref(0);
    const historyPageNumber = ref(1);
    const historyPageSize = 6;
    const historyLoading = ref(false);
    const historyMapChecked = ref(false);
    const personnelTrackPoints = ref<PersonnelTrackPoint[]>([]);
    const callModalVisible = ref(false);
    const callModalPerson = ref<PersonnelItem | null>(null);
    const callModalType = ref<"audio" | "video">("audio");
    const rtcCallState = ref<any>({ selfUser: { callStatus: "none" }, remoteUserList: [], mediaType: "" });
    const inviteVisible = ref(false);
    const inviteKeyword = ref("");
    const inviteOnlyOnline = ref(true);
    const invitePeople = ref<PersonnelItem[]>([]);
    const inviteSelectedIds = ref<string[]>([]);
    const inviteLoading = ref(false);
    const invitedCallUserIds = ref<string[]>([]);
    let taskRequestSeq = 0;
    let objectRequestSeq = 0;
    let selectedObjectRequestSeq = 0;
    let transferUserRequestSeq = 0;
    let personnelRequestSeq = 0;
    let historyRequestSeq = 0;
    let inviteRequestSeq = 0;
    let transferKeywordTimer: ReturnType<typeof setTimeout> | null = null;
    let rtcReadyPromise: Promise<void> | null = null;
    let hangupPromise: Promise<void> | null = null;
    let acceptPromise: Promise<void> | null = null;
    let rtcEnterRoomPromise: Promise<void> | null = null;
    let rtcCleanupPromise: Promise<void> | null = null;
    let rtcResetPromise: Promise<void> | null = null;
    let rtcCallbacksRegistered = false;
    let rtcRuntimePatched = false;
    let patchedRtcInstance: unknown = null;
    let localCallEnding = false;
    let lastSelfCallStatus = "none";

    const selectedInspectionPoints = computed(() => {
      return pointCategoryActive.value.flatMap((category) => pointCategoryCache.value[category] || []);
    });

    const loadTransferUsers = async (reset = true): Promise<void> => {
      if (transferUserLoading.value && !reset) {
        return;
      }
      const requestSeq = ++transferUserRequestSeq;
      const keyword = transferKeyword.value.trim();
      const excludeUserId = transferTaskData.value?.ownerId;
      const pageNumber = reset ? 1 : transferUserPageNumber.value + 1;
      if (reset) {
        transferUserPageNumber.value = 1;
        transferUserTotal.value = 0;
        transferUserFinished.value = false;
        transferUserList.value = [];
      }
      transferUserLoading.value = true;
      try {
        const data = await getTransferUsers({
          ...(keyword ? { keyword } : {}),
          ...(excludeUserId ? { excludeUserId } : {}),
          pageNumber,
          pageSize: transferUserPageSize,
        });
        if (requestSeq !== transferUserRequestSeq) {
          return;
        }
        const nextUsers = reset ? data.records : [...transferUserList.value, ...data.records];
        transferUserList.value = nextUsers;
        transferUserPageNumber.value = pageNumber;
        transferUserTotal.value = data.total;
        transferUserFinished.value = pageNumber * transferUserPageSize >= data.total || data.pageRecordCount < transferUserPageSize;
      } finally {
        if (requestSeq === transferUserRequestSeq) {
          transferUserLoading.value = false;
        }
      }
    };

    const loadMoreTransferUsers = async (): Promise<void> => {
      if (transferUserLoading.value || transferUserFinished.value) {
        return;
      }
      await loadTransferUsers(false);
    };

    const clearTransferKeywordTimer = (): void => {
      if (transferKeywordTimer) {
        clearTimeout(transferKeywordTimer);
        transferKeywordTimer = null;
      }
    };

    const onUpdateTransferKeyword = (value: string): void => {
      transferKeyword.value = value;
      transferSelected.value = "";
      clearTransferKeywordTimer();
      transferKeywordTimer = setTimeout(() => {
        transferKeywordTimer = null;
        loadTransferUsers(true).catch(() => undefined);
      }, 300);
    };

    const loadOverview = async (): Promise<void> => {
      Object.assign(overview, await getDashboardOverview({ filter: overviewFilter.value }));
    };

    const loadTaskList = async (reset = true): Promise<void> => {
      if (taskLoading.value && !reset) {
        return;
      }
      const requestSeq = ++taskRequestSeq;
      const pageNumber = reset ? 1 : taskPageNumber.value + 1;
      if (reset) {
        taskPageNumber.value = 1;
        taskTotal.value = 0;
        taskFinished.value = false;
        tasks.value = [];
      }
      taskLoading.value = true;
      try {
        const data = await getTaskList({
          filter: taskFilter.value,
          keyword: taskSearchKeyword.value,
          oderByStatus: true,
          pageNumber,
          pageSize: taskPageSize,
        });
        if (requestSeq !== taskRequestSeq) {
          return;
        }
        const nextTasks = reset ? data.records : [...tasks.value, ...data.records];
        tasks.value = nextTasks;
        taskPageNumber.value = pageNumber;
        taskTotal.value = data.total;
        taskFinished.value = nextTasks.length >= data.total || data.records.length < taskPageSize;
      } finally {
        if (requestSeq === taskRequestSeq) {
          taskLoading.value = false;
        }
      }
    };

    const loadMoreTaskList = async (): Promise<void> => {
      if (taskLoading.value || taskFinished.value) {
        return;
      }
      await loadTaskList(false);
    };

    const clearSelectedTask = (): void => {
      selectedObjectRequestSeq += 1;
      objectRequestSeq += 1;
      selectedTask.value = null;
      selectedTaskObjects.value = [];
      selectedTaskRoutePoints.value = [];
      selectedRoutePointIndex.value = 0;
      selectedRoutePointDetailOpen.value = false;
      taskObjectPoints.value = [];
      selectedTaskObjectLoading.value = false;
      selectedTaskRouteLoading.value = false;
    };

    const searchTaskList = (): void => {
      const keyword = taskKeyword.value.trim();
      taskKeyword.value = keyword;
      taskSearchKeyword.value = keyword;
      clearSelectedTask();
      loadTaskList(true).catch(() => undefined);
    };

    const onUpdateTaskKeyword = (value: string): void => {
      taskKeyword.value = value;
    };

    const loadSelectedTaskObjects = async (task: TaskItem, requestSeq: number): Promise<void> => {
      if (task.inspectionMode === "DRONE") {
        selectedTaskObjects.value = [];
        selectedTaskObjectLoading.value = false;
        return;
      }
      selectedTaskObjectLoading.value = true;
      try {
        const data = await getTaskObjects({ taskId: task.id });
        if (requestSeq !== selectedObjectRequestSeq) {
          return;
        }
        selectedTaskObjects.value = data;
      } catch {
        if (requestSeq === selectedObjectRequestSeq) {
          selectedTaskObjects.value = [];
        }
      } finally {
        if (requestSeq === selectedObjectRequestSeq) {
          selectedTaskObjectLoading.value = false;
        }
      }
    };

    const loadSelectedTaskWaypoints = async (task: TaskItem, requestSeq: number): Promise<void> => {
      if (task.inspectionMode === "MANUAL") {
        selectedTaskRoutePoints.value = [];
        selectedRoutePointIndex.value = 0;
        selectedRoutePointDetailOpen.value = false;
        selectedTaskRouteLoading.value = false;
        return;
      }
      selectedTaskRouteLoading.value = true;
      try {
        const isRobotDogTask = task.inspectionMode === "ROBOT_DOG" || task.inspectionMode === "HYBRID_ROBOT_DOG";
        const data = isRobotDogTask
          ? await getRobotDogTaskRoutePoints({ taskId: task.id })
          : await getDroneTaskRoutePoints({ taskId: task.id });
        if (requestSeq !== selectedObjectRequestSeq) {
          return;
        }
        selectedTaskRoutePoints.value = data;
      } catch {
        if (requestSeq === selectedObjectRequestSeq) {
          selectedTaskRoutePoints.value = [];
          selectedRoutePointIndex.value = 0;
          selectedRoutePointDetailOpen.value = false;
        }
      } finally {
        if (requestSeq === selectedObjectRequestSeq) {
          selectedTaskRouteLoading.value = false;
        }
      }
    };

    const selectTask = async (task: TaskItem): Promise<void> => {
      const requestSeq = ++selectedObjectRequestSeq;
      objectRequestSeq += 1;
      selectedTask.value = task;
      selectedTaskObjects.value = [];
      selectedTaskRoutePoints.value = [];
      selectedRoutePointIndex.value = 0;
      selectedRoutePointDetailOpen.value = false;
      taskObjectPoints.value = [];
      selectedTaskObjectLoading.value = false;
      selectedTaskRouteLoading.value = false;

      let detailTaskData = task;
      try {
        detailTaskData = await getTaskDetail({ taskId: task.id, fallbackInspectionMode: task.inspectionMode });
      } catch {
        message.error("任务详情加载失败");
      }
      if (requestSeq !== selectedObjectRequestSeq) {
        return;
      }
      selectedTask.value = detailTaskData;
      await Promise.all([loadSelectedTaskObjects(detailTaskData, requestSeq), loadSelectedTaskWaypoints(detailTaskData, requestSeq)]);
    };

    const openTaskObjects = async (task: TaskItem): Promise<void> => {
      if (task.inspectionMode === "DRONE") {
        message.info("纯无人机任务不展示巡检对象");
        return;
      }
      const requestSeq = ++objectRequestSeq;
      pointCategoryActive.value = [];
      mapLayerMenuOpen.value = false;
      layers.value = [];
      taskObjectPoints.value = [];
      try {
        const data = await getTaskObjects({ taskId: task.id });
        if (requestSeq !== objectRequestSeq) {
          return;
        }
        if (data.length === 0) {
          message.info("暂无巡检对象点位");
          return;
        }
        if (!data.some(hasValidTaskObjectPoint)) {
          message.info("巡检对象暂无有效点位");
          return;
        }
        taskObjectPoints.value = data;
      } catch (error) {}
    };

    const returnGlobalView = (): void => {
      objectRequestSeq += 1;
      selectedObjectRequestSeq += 1;
      taskObjectPoints.value = [];
      selectedTaskRoutePoints.value = [];
      selectedRoutePointIndex.value = 0;
      selectedRoutePointDetailOpen.value = false;
      selectedTaskRouteLoading.value = false;
      pointCategoryActive.value = [];
      mapLayerMenuOpen.value = false;
      layers.value = ["HEATMAP"];
      globalViewSignal.value += 1;
      if (!abnormalPointLoaded.value) {
        loadAbnormalPoints().catch(() => undefined);
      }
    };

    const loadAbnormal = async (): Promise<void> => {
      Object.assign(abnormal, await getAbnormalOverview({ filter: abnormalFilter.value }));
    };

    const loadTaskType = async (): Promise<void> => {
      taskType.value = await getPatrolTypeDistribution({ filter: typeFilter.value });
    };

    const loadDept = async (): Promise<void> => {
      deptMemberCache.value = {};
      expandedDept.value = [];
      depts.value = await getDepartmentStats({ filter: deptFilter.value });
    };

    const loadDeptMembers = async (deptId: string): Promise<void> => {
      const cacheKey = `${getTimeFilterCacheKey(deptFilter.value)}:${deptId}`;
      if (deptMemberCache.value[cacheKey]) {
        depts.value = depts.value.map((dept) => (dept.id === deptId ? { ...dept, members: deptMemberCache.value[cacheKey] || [] } : dept));
        return;
      }
      const members = await getDepartmentMembers({ deptId, filter: deptFilter.value });
      deptMemberCache.value = { ...deptMemberCache.value, [cacheKey]: members };
      depts.value = depts.value.map((dept) => (dept.id === deptId ? { ...dept, members } : dept));
    };

    const loadInspectionPoints = async (category: InspectionTargetCategory): Promise<InspectionPointItem[]> => {
      if (pointCategoryCache.value[category]) {
        return pointCategoryCache.value[category] || [];
      }
      const points = await getInspectionPointsByCategory({ category });
      pointCategoryCache.value = { ...pointCategoryCache.value, [category]: points };
      return points;
    };

    const loadAbnormalPoints = async (): Promise<void> => {
      if (abnormalPointLoaded.value) {
        return;
      }
      abnormalPointCache.value = await getLatestAbnormalInspectionPoints();
      abnormalPointLoaded.value = true;
    };

    const loadMapConfig = async (): Promise<void> => {
      if (mapConfig.value) {
        return;
      }
      mapConfig.value = await getInspectionMapConfig();
    };

    const loadPersonnelDepartments = async (): Promise<void> => {
      if (personnelDepartments.value.length > 0) {
        return;
      }
      personnelDepartments.value = await getPersonnelDepartments();
    };

    /** 现场人员列表查询：沿用旧系统关键字 + 部门筛选，并按在线状态排序。 */
    const loadPersonnelList = async (): Promise<void> => {
      const requestSeq = ++personnelRequestSeq;
      personnelLoading.value = true;
      try {
        await loadMapConfig();
        const records = await getPersonnelList({
          keyword: personnelKeyword.value.trim(),
          organizationId: personnelDepartmentId.value,
          mapConfig: mapConfig.value,
          currentUserId: await getCurrentUserId(),
        });
        if (requestSeq !== personnelRequestSeq) {
          return;
        }
        personnelList.value = records;
      } finally {
        if (requestSeq === personnelRequestSeq) {
          personnelLoading.value = false;
        }
      }
    };

    const loadManualPanelData = async (): Promise<void> => {
      loadOverview();
      loadTaskList();
      loadAbnormal();
      loadTaskType();
      loadDept();
      if (layers.value.includes("HEATMAP")) {
        loadAbnormalPoints().catch(() => undefined);
      }
    };

    const loadAll = async (): Promise<void> => {
      loadManualPanelData();
      loadMapConfig().catch(() => undefined);
    };

    const toggleLayer = (layer: LayerType): void => {
      if (layers.value.includes(layer)) {
        layers.value = layers.value.filter((item) => item !== layer);
      } else {
        layers.value = [...layers.value, layer];
        if (layer === "HEATMAP") {
          loadAbnormalPoints().catch(() => undefined);
        }
      }
    };

    const openPersonnelModal = (): void => {
      personnelVisible.value = true;
      loadPersonnelDepartments().catch(() => undefined);
      loadPersonnelList().catch(() => undefined);
    };

    const resetPersonnelSearch = (): void => {
      personnelKeyword.value = "";
      personnelDepartmentId.value = "";
      loadPersonnelList().catch(() => undefined);
    };

    const ensurePersonnelOnline = (person: PersonnelItem): boolean => {
      if (!person.isOnline) {
        message.warning("人员不在线");
        return false;
      }
      return true;
    };

    /** 当前应用兼容旧调度台通话行为：补齐 TRTC 参数、防重复进房，并吞掉 SDK 清理阶段的异步异常。 */
    const patchRtcRuntime = (callManager: ReturnType<typeof CallManager.getInstance>): void => {
      const runtimeManager = callManager as unknown as {
        closeRoom?: () => Promise<void>;
        rtcInstance?: {
          trtc?: {
            exitRoom?: () => Promise<void>;
            startLocalAudio?: () => Promise<void>;
            stopLocalAudio?: () => Promise<void>;
            stopLocalVideo?: () => Promise<void>;
            stopRemoteVideo?: (params: { userId: string; streamType?: "main" | "sub" }) => Promise<void>;
          };
          enterRoom?: (params: unknown) => Promise<void>;
          startCall?: (params: unknown) => Promise<void>;
          accept?: (params: unknown) => Promise<void>;
          endCall?: () => Promise<void>;
          hangUp?: () => Promise<void>;
          reject?: () => Promise<void>;
          destroy?: () => void;
          stopRemoteVideo?: (params: { userId: string; streamType?: "main" | "sub" }) => Promise<void>;
        };
      };
      const rawCloseRoom = runtimeManager.closeRoom;
      if (!rtcRuntimePatched && rawCloseRoom) {
        runtimeManager.closeRoom = async () => {
          try {
            await rawCloseRoom.call(callManager);
          } catch {}
        };
        rtcRuntimePatched = true;
      }
      const rtcInstance = runtimeManager.rtcInstance;
      if (!rtcInstance || patchedRtcInstance === rtcInstance) {
        return;
      }
      patchedRtcInstance = rtcInstance;
      if (rtcInstance?.enterRoom) {
        const enterRoom = rtcInstance.enterRoom;
        const enterRoomOnce = async (params: unknown): Promise<void> => {
          if (rtcCleanupPromise) {
            await rtcCleanupPromise;
          }
          if (!rtcEnterRoomPromise) {
            rtcEnterRoomPromise = enterRoom.call(rtcInstance, params).finally(() => {
              rtcEnterRoomPromise = null;
            });
          }
          await rtcEnterRoomPromise;
        };
        rtcInstance.startCall = async (params: unknown) => {
          await enterRoomOnce(params).catch(() => undefined);
        };
        rtcInstance.accept = enterRoomOnce;
      }
      if (rtcInstance) {
        (["endCall", "hangUp", "reject"] as const).forEach((method) => {
          const rawMethod = rtcInstance[method];
          if (!rawMethod) {
            return;
          }
          rtcInstance[method] = async () => {
            rtcCleanupPromise = (async () => {
              if (rtcEnterRoomPromise) {
                await rtcEnterRoomPromise.catch(() => undefined);
              }
              try {
                await rawMethod.call(rtcInstance);
              } catch {}
              const trtc = rtcInstance.trtc;
              await Promise.resolve(trtc?.stopRemoteVideo?.({ userId: "*" })).catch(() => undefined);
              await Promise.resolve(trtc?.stopLocalVideo?.()).catch(() => undefined);
              await Promise.resolve(trtc?.stopLocalAudio?.()).catch(() => undefined);
              rtcInstance.destroy?.();
            })().finally(() => {
              rtcCleanupPromise = null;
            });
            await rtcCleanupPromise;
          };
        });
        (["openMicrophone", "closeMicrophone", "openLocalCamera", "closeLocalCamera", "startRemoteVideo"] as const).forEach((method) => {
          const rawMethod = (rtcInstance as unknown as Record<string, ((params?: unknown) => Promise<void>) | undefined>)[method];
          if (!rawMethod) {
            return;
          }
          (rtcInstance as unknown as Record<string, (params?: unknown) => Promise<void>>)[method] = async (params?: unknown) => {
            try {
              await rawMethod.call(rtcInstance, params);
            } catch {}
          };
        });
        rtcInstance.stopRemoteVideo = async (params) => {
          try {
            const trtc = rtcInstance.trtc;
            if (params.userId === "*") {
              await trtc?.stopRemoteVideo?.({ userId: params.userId });
              return;
            }
            await trtc?.stopRemoteVideo?.({ userId: params.userId, streamType: params.streamType ?? "main" });
          } catch {}
        };
      }
    };

    const resetRtcRuntime = async (callManager: ReturnType<typeof CallManager.getInstance>): Promise<void> => {
      if (rtcResetPromise) {
        await rtcResetPromise;
        return;
      }
      const runtimeManager = callManager as unknown as {
        createRTC?: () => void;
        rtcInstance?: {
          trtc?: {
            exitRoom?: () => Promise<void>;
            stopLocalAudio?: () => Promise<void>;
            stopLocalVideo?: () => Promise<void>;
            stopRemoteVideo?: (params: { userId: string; streamType?: "main" | "sub" }) => Promise<void>;
          };
          destroy?: () => void;
        };
      };
      rtcResetPromise = (async () => {
        if (rtcEnterRoomPromise) {
          await rtcEnterRoomPromise.catch(() => undefined);
        }
        if (rtcCleanupPromise) {
          await rtcCleanupPromise.catch(() => undefined);
        }
        const rtcInstance = runtimeManager.rtcInstance;
        const trtc = rtcInstance?.trtc;
        await Promise.resolve(trtc?.stopRemoteVideo?.({ userId: "*" })).catch(() => undefined);
        await Promise.resolve(trtc?.stopLocalVideo?.()).catch(() => undefined);
        await Promise.resolve(trtc?.stopLocalAudio?.()).catch(() => undefined);
        await Promise.resolve(trtc?.exitRoom?.()).catch(() => undefined);
        rtcInstance?.destroy?.();
        patchedRtcInstance = null;
        rtcEnterRoomPromise = null;
        runtimeManager.createRTC?.();
        patchRtcRuntime(callManager);
      })().finally(() => {
        rtcResetPromise = null;
      });
      await rtcResetPromise;
    };

    /** 通讯能力初始化后保持在线，确保 APP 主动呼叫大屏时可以收到来电。 */
    const ensureRtcReady = async (): Promise<void> => {
      if (!rtcReadyPromise) {
        rtcReadyPromise = (async () => {
          const callManager = CallManager.getInstance();
          const userId = await getCurrentUserId();
          if (!userId) {
            throw new Error("未获取到当前用户信息");
          }
          callManager.setSelfUser({ id: userId });
          initCommunicationMessageSocket();
          await callManager.setOptions({ userRoomEventSource: "socket" });
          patchRtcRuntime(callManager);
          if (!rtcCallbacksRegistered) {
            callManager.onCallStateChange((callState) => {
              const nextStatus = callState.selfUser?.callStatus || "none";
              if (lastSelfCallStatus !== "accept" && nextStatus === "accept") {
                message.success("通话已接通");
              }
              lastSelfCallStatus = nextStatus;
              rtcCallState.value = { ...callState };
            });
            callManager.onCallReceived(() => {
              message.info("收到来电");
              handleIncomingCall().catch(() => undefined);
            });
            callManager.onCallEnd(() => {
              releaseCallMedia();
              resetRtcRuntime(callManager).catch(() => undefined);
              if (!localCallEnding) {
                message.info(lastSelfCallStatus === "waiting" ? "对方已取消呼叫" : "对方已挂断");
              }
              localCallEnding = false;
              lastSelfCallStatus = "none";
              resetCallUiState();
            });
            rtcCallbacksRegistered = true;
          }
          await callManager.login();
        })().catch((error) => {
          rtcReadyPromise = null;
          throw error;
        });
      }
      await rtcReadyPromise;
    };

    /** 通话和视频统一从这里发起，避免列表和地图窗体各自处理通话状态。 */
    const callPersonnel = async (person: PersonnelItem, type: "audio" | "video"): Promise<void> => {
      if (!ensurePersonnelOnline(person)) {
        return;
      }
      const callManager = CallManager.getInstance();
      try {
        message.loading("正在呼叫");
        await ensureRtcReady();
        if (hangupPromise) {
          await hangupPromise;
        }
        const currentCallState = callManager.getCallState();
        if (currentCallState.selfUser.callStatus !== "none") {
          message.destroy();
          message.warning("当前正在通话中");
          return;
        }
        if (type === "audio") {
          await callManager.singleCallAudio(person.id);
        } else {
          await callManager.singleCallVideo(person.id);
        }
        const nextCallState = callManager.getCallState();
        rtcCallState.value = {
          mediaType: nextCallState.mediaType,
          selfUser: nextCallState.selfUser,
          remoteUserList: nextCallState.remoteUserList,
        };
        message.destroy();
        if (nextCallState.selfUser.callStatus === "none") {
          message.warning("呼叫未接通");
          return;
        }
        message.success("呼叫已发起");
        callModalPerson.value = person;
        callModalType.value = type;
        invitedCallUserIds.value = [person.id];
        callModalVisible.value = true;
      } catch (error) {
        message.destroy();
        const errorMessage = error instanceof Error ? error.message : "呼叫失败";
        message.error(errorMessage || "呼叫失败");
      }
    };

    const resetCallUiState = (): void => {
      callModalVisible.value = false;
      inviteVisible.value = false;
      inviteSelectedIds.value = [];
      invitedCallUserIds.value = [];
      rtcCallState.value = { selfUser: { callStatus: "none" }, remoteUserList: [], mediaType: "" };
    };

    const getFallbackCallPerson = (userId: string): PersonnelItem => ({
      id: userId,
      name: "未知人员",
      mobile: "--",
      account: "",
      file: null,
      gps: null,
      organizationName: "--",
      positionName: "--",
      isOnline: true,
    });

    const handleIncomingCall = async (): Promise<void> => {
      const callState = CallManager.getInstance().getCallState();
      rtcCallState.value = {
        mediaType: callState.mediaType,
        selfUser: callState.selfUser,
        remoteUserList: callState.remoteUserList,
      };
      const callerId = callState.caller?.id || callState.remoteUserList.find((user: { id?: string }) => user.id)?.id || "";
      callModalType.value = callState.mediaType === "VIDEO" ? "video" : "audio";
      callModalPerson.value = callerId
        ? await getPersonnelById(callerId).catch(() => getFallbackCallPerson(callerId))
        : getFallbackCallPerson("");
      inviteVisible.value = false;
      callModalVisible.value = true;
    };

    /** 关闭通话时显式释放本地媒体，避免浏览器继续显示麦克风/摄像头占用。 */
    const releaseCallMedia = (): void => {
      const callManager = CallManager.getInstance();
      Promise.resolve(callManager.closeMicrophone()).catch(() => undefined);
      Promise.resolve(callManager.closeLocalCamera({} as unknown as void)).catch(() => undefined);
      Promise.resolve(callManager.stopRemoteVideo({ userId: "*", streamType: "main" })).catch(() => undefined);
    };

    const notifyCallerCancelIfWaiting = async (): Promise<void> => {
      const callState = CallManager.getInstance().getCallState();
      const roomId = callState.roomId;
      if (callState.selfUser?.callRole !== "caller" || callState.selfUser?.callStatus !== "waiting" || !roomId) {
        return;
      }
      await rtcApiProxy.cubeCommunicateServiceProxy.closeConferenceRoom({ roomNumber: roomId }).catch(() => undefined);
    };

    const hangupPersonnelCall = (): void => {
      if (hangupPromise) {
        return;
      }
      localCallEnding = true;
      releaseCallMedia();
      hangupPromise = (async () => {
        if (acceptPromise) {
          await acceptPromise.catch(() => undefined);
        }
        await notifyCallerCancelIfWaiting();
        await CallManager.getInstance().hangUp();
      })()
        .catch(() => undefined)
        .finally(() => {
          releaseCallMedia();
          hangupPromise = null;
        });
      resetCallUiState();
      message.success("已挂断");
    };

    const acceptIncomingCall = (): void => {
      if (acceptPromise || hangupPromise || rtcCallState.value.selfUser?.callStatus !== "waiting") {
        return;
      }
      acceptPromise = (async () => {
        const callManager = CallManager.getInstance();
        await ensureRtcReady();
        await resetRtcRuntime(callManager);
        await callManager.accept();
      })()
        .catch((error) => {
          const errorMessage = error instanceof Error ? error.message : "接听失败";
          message.error(errorMessage || "接听失败");
        })
        .finally(() => {
          acceptPromise = null;
        });
    };

    const rejectIncomingCall = (): void => {
      if (hangupPromise) {
        return;
      }
      localCallEnding = true;
      releaseCallMedia();
      hangupPromise = CallManager.getInstance()
        .reject()
        .catch(() => undefined)
        .finally(() => {
          releaseCallMedia();
          hangupPromise = null;
          resetCallUiState();
        });
      message.info("已拒绝");
    };

    const toggleCallMicrophone = (open: boolean): void => {
      const callManager = CallManager.getInstance();
      if (open) {
        callManager.openMicrophone();
      } else {
        callManager.closeMicrophone();
      }
    };

    const toggleCallCamera = (open: boolean, viewId: string): void => {
      const callManager = CallManager.getInstance();
      if (open) {
        callManager.openLocalCamera({ view: viewId });
      } else {
        callManager.closeLocalCamera({} as unknown as void);
      }
    };

    const openRemoteCallCamera = (userId: string, viewId: string): void => {
      if (!userId) {
        return;
      }
      try {
        CallManager.getInstance().startRemoteVideo({ userId, view: viewId, streamType: "main" });
      } catch {}
    };

    const closeRemoteCallCamera = (userId: string): void => {
      try {
        CallManager.getInstance().stopRemoteVideo({ userId: userId || "*", streamType: "main" });
      } catch {}
    };

    const getCallingUserIds = (): string[] => {
      const remoteIds = (rtcCallState.value.remoteUserList || [])
        .map((user: { id?: string }) => user.id)
        .filter((id: string | undefined): id is string => Boolean(id));
      return Array.from(new Set([...remoteIds, ...invitedCallUserIds.value]));
    };

    const loadInvitePeople = async (): Promise<void> => {
      const requestSeq = ++inviteRequestSeq;
      inviteLoading.value = true;
      try {
        await loadMapConfig();
        const callingUserIds = getCallingUserIds();
        const records = await getPersonnelList({
          keyword: inviteKeyword.value.trim(),
          mapConfig: mapConfig.value,
          currentUserId: await getCurrentUserId(),
        });
        if (requestSeq !== inviteRequestSeq) {
          return;
        }
        invitePeople.value = records
          .filter((person) => !callingUserIds.includes(person.id))
          .filter((person) => !inviteOnlyOnline.value || person.isOnline);
      } finally {
        if (requestSeq === inviteRequestSeq) {
          inviteLoading.value = false;
        }
      }
    };

    const openInviteModal = (): void => {
      if (rtcCallState.value.selfUser?.callStatus === "none") {
        message.warning("当前未在通话中");
        return;
      }
      inviteVisible.value = true;
      inviteSelectedIds.value = [];
      loadInvitePeople().catch(() => undefined);
    };

    const closeInviteModal = (): void => {
      inviteVisible.value = false;
      inviteSelectedIds.value = [];
    };

    const toggleInvitePerson = (person: PersonnelItem): void => {
      if (!person.isOnline) {
        message.warning("人员不在线");
        return;
      }
      inviteSelectedIds.value = inviteSelectedIds.value.includes(person.id)
        ? inviteSelectedIds.value.filter((id) => id !== person.id)
        : [...inviteSelectedIds.value, person.id];
    };

    const confirmInvitePeople = async (): Promise<void> => {
      if (inviteSelectedIds.value.length === 0) {
        message.warning("请选择人员");
        return;
      }
      try {
        message.loading("正在邀请");
        await ensureRtcReady();
        const nextUserIds = inviteSelectedIds.value.filter((id) => !getCallingUserIds().includes(id));
        if (nextUserIds.length === 0) {
          message.destroy();
          message.warning("所选人员已在当前通话中");
          return;
        }
        await CallManager.getInstance().inviteUser(nextUserIds);
        invitedCallUserIds.value = Array.from(new Set([...invitedCallUserIds.value, ...nextUserIds]));
        message.destroy();
        message.success("已发起邀请");
        closeInviteModal();
      } catch (error) {
        message.destroy();
        const errorMessage = error instanceof Error ? error.message : "邀请失败";
        message.error(errorMessage || "邀请失败");
      }
    };

    /** 人员定位只保留一个当前人员点，坐标校验和旧系统提示保持一致。 */
    const locatePersonnel = (person: PersonnelItem): void => {
      if (!ensurePersonnelOnline(person)) {
        return;
      }
      if (!person.gps) {
        message.error("未获取到坐标信息");
        return;
      }
      if (!person.gps.lng || !person.gps.lat) {
        message.error("坐标无效");
        return;
      }
      selectedPersonnel.value = person;
      personnelFocusSignal.value += 1;
      personnelTrackPoints.value = [];
      historyMapChecked.value = false;
      personnelVisible.value = false;
    };

    const getHistoryPeriod = (): string => {
      const startTime = historyStartDate.value;
      const endTime = historyEndDate.value;
      if (startTime && endTime) {
        return `${startTime},${endTime}`;
      }
      return startTime || endTime || "2020-01-01,2023-10-10";
    };

    const openPersonnelHistory = (person: PersonnelItem): void => {
      historyPerson.value = person;
      historyStartDate.value = dayjs().subtract(29, "day").format("YYYY-MM-DD");
      historyEndDate.value = dayjs().format("YYYY-MM-DD");
      historyPageNumber.value = 1;
      historyMapChecked.value = false;
      personnelTrackPoints.value = [];
      historyVisible.value = true;
      loadHistoryList(1).catch(() => undefined);
    };

    /** 历史轨迹列表分页查询，展示时间和地址。 */
    const loadHistoryList = async (pageNumber = historyPageNumber.value): Promise<void> => {
      if (!historyPerson.value) {
        return;
      }
      if (!historyStartDate.value && !historyEndDate.value) {
        message.warning("请选择时间");
        return;
      }
      const requestSeq = ++historyRequestSeq;
      historyLoading.value = true;
      try {
        const data = await getPersonnelHistoryTrack({
          userId: historyPerson.value.id,
          period: getHistoryPeriod(),
          pageNumber,
          pageSize: historyPageSize,
        });
        if (requestSeq !== historyRequestSeq) {
          return;
        }
        historyPageNumber.value = pageNumber;
        historyRecords.value = data.records;
        historyTotal.value = data.total;
      } finally {
        if (requestSeq === historyRequestSeq) {
          historyLoading.value = false;
        }
      }
    };

    /** 勾选“在地图上显示”时拉取全部分页轨迹并过滤园区半径外点位。 */
    const toggleHistoryMap = async (checked: boolean): Promise<void> => {
      historyMapChecked.value = checked;
      personnelTrackPoints.value = [];
      if (!checked || !historyPerson.value) {
        return;
      }
      try {
        message.loading("正在获取历史轨迹，请稍后...");
        await loadMapConfig();
        const allPoints = await getAllPersonnelHistoryTrack({
          userId: historyPerson.value.id,
          period: getHistoryPeriod(),
        });
        const filtered = filterPersonnelTrackInRadius(allPoints, mapConfig.value);
        personnelTrackPoints.value = filtered;
        message.destroy();
        if (filtered.length === 0) {
          message.info("暂无可显示轨迹点");
        }
      } finally {
        message.destroy();
      }
    };

    const resetHistorySearch = (): void => {
      historyStartDate.value = "";
      historyEndDate.value = "";
      historyMapChecked.value = false;
      personnelTrackPoints.value = [];
      loadHistoryList(1).catch(() => undefined);
    };

    const closeHistory = (): void => {
      historyVisible.value = false;
    };

    const onConfirmTransfer = async (): Promise<void> => {
      if (!transferTaskData.value || !transferSelected.value) {
        return;
      }
      await transferTask({ id: transferTaskData.value.id, userId: transferSelected.value });
      await loadTaskList(true);
      transferVisible.value = false;
      transferSelected.value = "";
      transferKeyword.value = "";
      transferUserList.value = [];
      transferUserTotal.value = 0;
      transferUserFinished.value = false;
      message.success("任务移交成功");
    };

    const onConfirmTerminate = async (): Promise<void> => {
      if (!terminateTaskData.value) {
        return;
      }
      await terminateTask({ id: terminateTaskData.value.id });
      await loadTaskList(true);
      await loadOverview();
      terminateVisible.value = false;
      terminateTaskData.value = null;
      message.success("任务已终止");
    };

    const onClickPointCategory = async (category: InspectionTargetCategory): Promise<void> => {
      const categoryLabel = pointCategoryOptions.find((item) => item.value === category)?.label || category;
      const isActive = pointCategoryActive.value.includes(category);
      const nextActive = pointCategoryActive.value.includes(category)
        ? pointCategoryActive.value.filter((item) => item !== category)
        : [...pointCategoryActive.value, category];
      pointCategoryActive.value = nextActive;
      if (!layers.value.includes("INSPECTION_POINTS")) {
        layers.value = [...layers.value, "INSPECTION_POINTS"];
      }
      if (!isActive) {
        const points = await loadInspectionPoints(category);
        message.info(points.length > 0 ? `共有${points.length}个${categoryLabel}分类点位` : `${categoryLabel}暂无点位`);
        return;
      }
    };

    onMounted(() => {
      loadAll();
      ensureRtcReady().catch(() => undefined);
    });

    onBeforeUnmount(() => {
      clearTransferKeywordTimer();
      personnelRequestSeq += 1;
      historyRequestSeq += 1;
      inviteRequestSeq += 1;
      if (rtcReadyPromise) {
        releaseCallMedia();
        hangupPromise = CallManager.getInstance()
          .hangUp()
          .catch(() => undefined)
          .finally(() => {
            releaseCallMedia();
            hangupPromise = null;
          });
        CallManager.getInstance()
          .logout()
          .catch(() => undefined);
      }
      closeCommunicationMessageSocket();
    });

    const closeManualOverlays = (): void => {
      clearSelectedTask();
      transferVisible.value = false;
      terminateVisible.value = false;
      personnelVisible.value = false;
      historyVisible.value = false;
      inviteVisible.value = false;
      mapLayerMenuOpen.value = false;
    };

    const switchInspectionMode = (mode: InspectionScreenMode): void => {
      if (activeMode.value === mode) {
        if (mode === "manual") {
          clearSelectedTask();
        }
        return;
      }
      if (mode !== "manual") {
        closeManualOverlays();
      }
      activeMode.value = mode;
      if (mode === "manual") {
        loadManualPanelData().catch(() => undefined);
      }
    };

    return () => (
      <div class="inspection-screen">
        <div class="header-title">智慧巡检指挥</div>
        {activeMode.value === "manual" ? (
          <div class="map-bg">
            <MapScene
              layers={layers.value}
              pointCategory={pointCategoryActive.value}
              pointTargets={selectedInspectionPoints.value}
              abnormalTargets={abnormalPointCache.value}
              taskObjects={taskObjectPoints.value}
              taskRoutePoints={selectedTaskRoutePoints.value}
              personnelTarget={selectedPersonnel.value}
              personnelTrackPoints={personnelTrackPoints.value}
              personnelTrackVisible={historyMapChecked.value}
              personnelFocusSignal={personnelFocusSignal.value}
              globalViewSignal={globalViewSignal.value}
              onPersonnelCall={(person) => {
                callPersonnel(person, "audio").catch(() => undefined);
              }}
              onPersonnelVideo={(person) => {
                callPersonnel(person, "video").catch(() => undefined);
              }}
              onOpenPersonnelHistory={openPersonnelHistory}
              onClosePersonnelMarker={() => undefined}
            />

            <div class="layer-panel">
              <Button
                size="small"
                type={mapLayerMenuOpen.value ? "primary" : "default"}
                onClick={() => {
                  mapLayerMenuOpen.value = !mapLayerMenuOpen.value;
                }}
              >
                <EnvironmentOutlined />
                查看巡检点
                <DownOutlined />
              </Button>
              {mapLayerMenuOpen.value && (
                <div class="submenu">
                  {pointCategoryOptions.map((category) => (
                    <Button
                      size="small"
                      type={pointCategoryActive.value.includes(category.value) ? "primary" : "default"}
                      onClick={() => {
                        onClickPointCategory(category.value).catch(() => undefined);
                      }}
                    >
                      <EnvironmentOutlined />
                      <span class="layer-btn-text">{category.label}</span>
                    </Button>
                  ))}
                </div>
              )}
              <Button size="small" type={layers.value.includes("COVERAGE") ? "primary" : "default"} onClick={() => toggleLayer("COVERAGE")}>
                <ToolOutlined />
                巡检覆盖度
              </Button>
              <Button size="small" type={layers.value.includes("HEATMAP") ? "primary" : "default"} onClick={() => toggleLayer("HEATMAP")}>
                <AlertOutlined />
                异常热力图
              </Button>
              <Button
                size="small"
                type={personnelVisible.value || selectedPersonnel.value ? "primary" : "default"}
                onClick={openPersonnelModal}
              >
                <UserOutlined />
                人员位置
              </Button>
              {/* <Button size='small' type='default' onClick={() => message.info('车辆位置当前版本暂不接入')}><CarOutlined />车辆位置</Button> */}
              <Button size="small" class="return-global-btn" onClick={returnGlobalView}>
                <RollbackOutlined />
                全局视角
              </Button>
            </div>

            <LeftPanel
              overviewFilter={overviewFilter.value}
              taskFilter={taskFilter.value}
              overview={overview}
              tasks={tasks.value}
              taskTotal={taskTotal.value}
              taskLoading={taskLoading.value}
              taskFinished={taskFinished.value}
              taskKeyword={taskKeyword.value}
              selectedTaskId={selectedTask.value?.id || ""}
              onOverviewFilter={(v) => {
                overviewFilter.value = v;
                loadOverview().catch(() => undefined);
              }}
              onTaskFilter={(v) => {
                clearSelectedTask();
                taskFilter.value = v;
                loadTaskList(true).catch(() => undefined);
              }}
              onUpdateTaskKeyword={onUpdateTaskKeyword}
              onSearchTaskKeyword={searchTaskList}
              onLoadMoreTask={() => {
                loadMoreTaskList().catch(() => undefined);
              }}
              onSelectTask={(task) => {
                selectTask(task).catch(() => undefined);
              }}
              onTransfer={(task) => {
                transferTaskData.value = task;
                transferVisible.value = true;
                transferSelected.value = "";
                transferKeyword.value = "";
                loadTransferUsers(true).catch(() => undefined);
              }}
              onTerminate={(task) => {
                terminateTaskData.value = task;
                terminateVisible.value = true;
              }}
              onViewObject={(task) => {
                openTaskObjects(task).catch(() => undefined);
              }}
            />

            {selectedTask.value ? (
              <ManualTaskDetailPanel
                task={selectedTask.value}
                taskObjects={selectedTaskObjects.value}
                routePoints={selectedTaskRoutePoints.value}
                objectLoading={selectedTaskObjectLoading.value}
                routeLoading={selectedTaskRouteLoading.value}
                onBack={clearSelectedTask}
                onOpenRoutePointDetail={(index) => {
                  if (selectedTaskRoutePoints.value.length === 0) {
                    return;
                  }
                  selectedRoutePointIndex.value = Math.max(0, Math.min(index, selectedTaskRoutePoints.value.length - 1));
                  selectedRoutePointDetailOpen.value = true;
                }}
              />
            ) : (
              <RightPanel
                abnormalFilter={abnormalFilter.value}
                typeFilter={typeFilter.value}
                deptFilter={deptFilter.value}
                abnormal={abnormal}
                taskType={taskType.value}
                depts={depts.value}
                expandedDept={expandedDept.value}
                onAbnormalFilter={(v) => {
                  abnormalFilter.value = v;
                  loadAbnormal().catch(() => undefined);
                }}
                onTypeFilter={(v) => {
                  typeFilter.value = v;
                  loadTaskType().catch(() => undefined);
                }}
                onDeptFilter={(v) => {
                  deptFilter.value = v;
                  loadDept().catch(() => undefined);
                }}
                onToggleDept={(id) => {
                  const isOpen = expandedDept.value.includes(id);
                  expandedDept.value = isOpen ? expandedDept.value.filter((it) => it !== id) : [...expandedDept.value, id];
                  if (!isOpen) {
                    loadDeptMembers(id).catch(() => undefined);
                  }
                }}
              />
            )}
          </div>
        ) : activeMode.value === "drone" ? (
          <DroneInspectionScreen />
        ) : (
          <RobotDogInspectionScreen />
        )}

        <div class="mode-switch-bar">
          <button
            class={["mode-btn", activeMode.value === "manual" ? "active" : ""]}
            type="button"
            onClick={() => switchInspectionMode("manual")}
          >
            <UserOutlined />
            人工巡检
          </button>
          <button
            class={["mode-btn", activeMode.value === "drone" ? "active" : ""]}
            type="button"
            onClick={() => switchInspectionMode("drone")}
          >
            <FireOutlined />
            无人机巡检
          </button>
          <button
            class={["mode-btn", activeMode.value === "robotDog" ? "active" : ""]}
            type="button"
            onClick={() => switchInspectionMode("robotDog")}
          >
            <RobotOutlined />
            机器狗巡检
          </button>
        </div>

        {activeMode.value === "manual" ? (
          <>
            <TaskModals
              transferTask={transferTaskData.value}
              transferVisible={transferVisible.value}
              transferKeyword={transferKeyword.value}
              transferSelected={transferSelected.value}
              transferUsers={transferUserList.value}
              transferUserTotal={transferUserTotal.value}
              transferUserLoading={transferUserLoading.value}
              transferUserFinished={transferUserFinished.value}
              terminateTask={terminateTaskData.value}
              terminateVisible={terminateVisible.value}
              onCloseTransfer={() => {
                transferVisible.value = false;
              }}
              onCloseTerminate={() => {
                terminateVisible.value = false;
              }}
              onConfirmTransfer={onConfirmTransfer}
              onConfirmTerminate={onConfirmTerminate}
              onLoadMoreTransferUsers={() => {
                loadMoreTransferUsers().catch(() => undefined);
              }}
              onUpdateTransferKeyword={onUpdateTransferKeyword}
              onUpdateTransferSelected={(v) => {
                transferSelected.value = v;
              }}
            />
            <PersonnelModals
              personnelVisible={personnelVisible.value}
              personnelKeyword={personnelKeyword.value}
              personnelDepartmentId={personnelDepartmentId.value}
              personnelDepartments={personnelDepartments.value}
              personnelList={personnelList.value}
              personnelLoading={personnelLoading.value}
              historyVisible={historyVisible.value}
              historyPerson={historyPerson.value}
              historyStartDate={historyStartDate.value}
              historyEndDate={historyEndDate.value}
              historyRecords={historyRecords.value}
              historyTotal={historyTotal.value}
              historyPageNumber={historyPageNumber.value}
              historyPageSize={historyPageSize}
              historyLoading={historyLoading.value}
              historyMapChecked={historyMapChecked.value}
              onClosePersonnel={() => {
                personnelVisible.value = false;
              }}
              onSearchPersonnel={() => {
                loadPersonnelList().catch(() => undefined);
              }}
              onResetPersonnel={resetPersonnelSearch}
              onUpdatePersonnelKeyword={(value) => {
                personnelKeyword.value = value;
              }}
              onUpdatePersonnelDepartmentId={(value) => {
                personnelDepartmentId.value = value;
              }}
              onLocatePersonnel={locatePersonnel}
              onCallPersonnel={(person) => {
                callPersonnel(person, "audio").catch(() => undefined);
              }}
              onVideoPersonnel={(person) => {
                callPersonnel(person, "video").catch(() => undefined);
              }}
              onCloseHistory={closeHistory}
              onSearchHistory={() => {
                historyMapChecked.value = false;
                personnelTrackPoints.value = [];
                loadHistoryList(1).catch(() => undefined);
              }}
              onResetHistory={resetHistorySearch}
              onUpdateHistoryStartDate={(value) => {
                historyStartDate.value = value;
              }}
              onUpdateHistoryEndDate={(value) => {
                historyEndDate.value = value;
              }}
              onHistoryPageChange={(pageNumber) => {
                loadHistoryList(pageNumber).catch(() => undefined);
              }}
              onToggleHistoryMap={(checked) => {
                toggleHistoryMap(checked).catch(() => undefined);
              }}
            />
            <PersonnelCallModal
              visible={callModalVisible.value}
              person={callModalPerson.value}
              type={callModalType.value}
              callStatus={rtcCallState.value.selfUser?.callStatus || "none"}
              callRole={rtcCallState.value.selfUser?.callRole || "none"}
              remoteUsers={rtcCallState.value.remoteUserList || []}
              inviteVisible={inviteVisible.value}
              inviteKeyword={inviteKeyword.value}
              inviteOnlyOnline={inviteOnlyOnline.value}
              invitePeople={invitePeople.value}
              inviteSelectedIds={inviteSelectedIds.value}
              inviteLoading={inviteLoading.value}
              onHangup={hangupPersonnelCall}
              onAccept={acceptIncomingCall}
              onReject={rejectIncomingCall}
              onOpenInvite={openInviteModal}
              onCloseInvite={closeInviteModal}
              onSearchInvite={() => {
                loadInvitePeople().catch(() => undefined);
              }}
              onConfirmInvite={() => {
                confirmInvitePeople().catch(() => undefined);
              }}
              onUpdateInviteKeyword={(value) => {
                inviteKeyword.value = value;
              }}
              onUpdateInviteOnlyOnline={(checked) => {
                inviteOnlyOnline.value = checked;
                inviteSelectedIds.value = [];
                loadInvitePeople().catch(() => undefined);
              }}
              onToggleInvitePerson={toggleInvitePerson}
              onToggleMicrophone={toggleCallMicrophone}
              onToggleCamera={toggleCallCamera}
              onOpenRemoteCamera={openRemoteCallCamera}
              onCloseRemoteCamera={closeRemoteCallCamera}
            />
            <DeviceRoutePointDetailModal
              open={selectedRoutePointDetailOpen.value}
              mode="drone"
              task={null}
              routePoints={selectedTaskRoutePoints.value}
              pointIndex={selectedRoutePointIndex.value}
              onClose={() => {
                selectedRoutePointDetailOpen.value = false;
              }}
            />
          </>
        ) : null}
      </div>
    );
  },
});
