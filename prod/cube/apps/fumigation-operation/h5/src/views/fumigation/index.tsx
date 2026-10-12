import dayjs from "dayjs";
import {
  Button,
  Cell,
  CellGroup,
  DropdownItem,
  DropdownMenu,
  Empty,
  Field,
  List,
  Loading,
  Popup,
  PullRefresh,
  Search,
  Stepper,
  Tag,
  showToast,
} from "vant";
import { computed, defineComponent, onActivated, onBeforeUnmount, onDeactivated, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeDataTimePicker, CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { PersonItem } from "@ghcloud/cube-ouaa-service";
import {
  completeFumigationWork,
  createFumigationWork,
  generateFumigationArchive,
  getFumigationDeviceMonitor,
  getFumigationDeviceProperties,
  getFumigationRealtimeSituationStats,
  getFumigationRealtimeSituationWorks,
  listFumigationApplicationMethods,
  listFumigationArchives,
  listFumigationLinkedDevices,
  listFumigationPesticideTypes,
  listFumigationRealtimeSituationAlarms,
  listFumigationRealtimeSituationDevices,
  listFumigationRealtimeSituationWarehouses,
  listFumigationWorks,
  runFumigationPrechecks,
  sendFumigationNotification,
  submitFumigationApproval,
  terminateFumigationWork,
} from "@ghcloud/cube-services-client/fumigation-operation.client";

import { loadFumigationPrechecksToCache, loadFumigationWorkToCache, loadFumigationWorksToCache } from "./api";
import { buildApprovalTimeline } from "./approval-timeline-utils";
import { ArchiveDocumentView } from "./archive-document-view";
import { CheckTag, StatusTag } from "./components";
import { loadWarehousesFromIntelligentGrain } from "./data-source";
import { DeviceSelectPopup } from "./device-select-popup";
import { MonitorVideoPlayer } from "./monitor-video-player";
import { readQueryValue } from "./navigation-utils";
import {
  DEVICE_PROPERTY_CODES,
  PRECHECK_STEP_META,
  allPrechecksPassed,
  canApproveFumigationWork,
  canCompleteFumigationWork,
  canEnterMonitorBoard,
  canRunPrecheck,
  formatDateTimeValue,
  fumigationState,
  getApprovalProgress,
  getDueAt,
  getPesticideDisplayName,
  getProperty,
  getWorkerCertificate,
  getWarehouseDisplayName,
  isCertificateExpired,
  isWorkApprovalPending,
  replaceFumigationArchives,
  replaceFumigationWorks,
  upsertFumigationArchive,
  upsertFumigationWork,
  WORK_STATUS_META,
  type ArchiveRecord,
  type CheckFieldValue,
  type CheckPropertyValue,
  type DeviceProperty,
  type DeviceOption,
  type FumigationWork,
  type LinkedDevice,
  type PrecheckResult,
  type PrecheckStepId,
  type TrendPoint,
  type WarehouseOption,
  type WorkerOption,
  type WorkStatus,
} from "./state";
import { WorkerSelectPopup } from "./worker-select-popup";
import { buildWorkerTableRows, resolveWorkWorkers, sameSnowflakeId, translateWorkerRole } from "./worker-utils";

type PageName = "works" | "create" | "approval" | "precheck" | "monitor" | "realtime" | "archive";

const PAGE_NAMES: PageName[] = ["works", "create", "approval", "precheck", "monitor", "realtime", "archive"];

const STEP_IDS: PrecheckStepId[] = ["VENTILATION_DURATION", "PH3_CONCENTRATION", "OXYGEN_CONCENTRATION"];

const MONITOR_POLL_INTERVAL_MS = 10_000;
const PH3_DATA_STALE_AFTER_MS = 60_000;

type Ph3StatusLevel = "available" | "offline";

interface Ph3Status {
  level: Ph3StatusLevel;
  label: string;
}

interface RealtimeStats {
  inProgressCount: number;
  completedTodayCount: number;
  monthCreatedCount: number;
  precheckPassRate: number;
  lastMonthWorkCount: number;
  currentMonthWorkCount: number;
  lastMonthPrecheckPassRate: number;
  currentMonthPrecheckPassRate: number;
}

interface RealtimeWorkItem {
  id: string;
  code: string;
  warehouseId: string;
  warehouseName: string;
  grainVarietyName?: string;
  pesticideSummary?: string;
  workerCount?: number;
  remainingLabel?: string;
  completedTime?: string;
}

interface RealtimeWarehouseItem {
  warehouseId: string;
  warehouseName: string;
  statusLabel: string;
  status: "idle" | "working";
}

interface RealtimeDeviceItem {
  id: string;
  name: string;
  status: "online" | "offline";
}

interface RealtimeAlarmItem {
  id: string;
  alarmEventName: string;
  alarmTime: string | number;
  alarmStatusName: string;
}

const emptyRealtimeStats = (): RealtimeStats => ({
  inProgressCount: 0,
  completedTodayCount: 0,
  monthCreatedCount: 0,
  precheckPassRate: 0,
  lastMonthWorkCount: 0,
  currentMonthWorkCount: 0,
  lastMonthPrecheckPassRate: 0,
  currentMonthPrecheckPassRate: 0,
});

const trendWidth = (value: number, max: number): string => {
  if (max <= 0) {
    return "0%";
  }
  return `${Math.max(8, Math.round((value / max) * 100))}%`;
};

const statusDropdownOptions: Array<{ text: string; value: WorkStatus | "" }> = [
  { text: "全部状态", value: "" },
  ...Object.entries(WORK_STATUS_META)
    .filter(([value]) => value !== "PENDING_START")
    .map(([value, meta]) => ({ text: meta.label, value: value as WorkStatus })),
];

const canRecheck = (status: WorkStatus): boolean => status === "CHECK_FAILED";
const canViewCheck = (status: WorkStatus): boolean => status === "PENDING_CHECK";
const canArchive = (status: WorkStatus): boolean => status === "ARCHIVED";

const formatCheckPropertyValue = (property: CheckPropertyValue): string => {
  const value = property.value == null || property.value === "" ? "--" : `${property.value}`;
  const unit = property.unit == null || property.unit === "" ? "" : ` ${property.unit}`;
  return property.name === "" ? `${value}${unit}` : `${property.name} ${value}${unit}`;
};

const getDisplayCheckValues = (result: PrecheckResult): CheckFieldValue[] => {
  if (result.values.length > 0) {
    return result.values;
  }
  if (result.propertyValues.length === 0) {
    return [];
  }
  return [
    {
      label: [result.title, result.rule].filter(Boolean).join(" "),
      value: result.propertyValues.map(formatCheckPropertyValue).join(" / ") || "--",
    },
  ];
};

const notifySuccess = (message: string): void => {
  showToast({ type: "success", message });
};

const notifyFail = (message: string): void => {
  showToast({ type: "fail", message });
};

const getPageName = (name: unknown): PageName => {
  const matched = PAGE_NAMES.find((item) => item === name);
  return matched ?? "works";
};

const formatDeviceMetric = (device: DeviceOption | undefined, code: keyof typeof DEVICE_PROPERTY_CODES, defaultUnit: string): string => {
  const item = getProperty(device, DEVICE_PROPERTY_CODES[code]);
  const value = Number(item?.value);
  if (!Number.isFinite(value)) {
    return "--";
  }
  const unit = item?.unit?.trim() || defaultUnit;
  return `${Number.isInteger(value) ? value : value.toFixed(1)}${unit}`;
};

const findProperty = (properties: DeviceProperty[], code: string): DeviceProperty | undefined =>
  properties.find((item) => item.code === code);

const formatPropertyMetric = (properties: DeviceProperty[], code: string, defaultUnit = ""): string => {
  const item = findProperty(properties, code);
  const value = Number(item?.value);
  if (!Number.isFinite(value)) {
    return "--";
  }
  const unit = item?.unit?.trim() || defaultUnit;
  return `${Number.isInteger(value) ? value : value.toFixed(1)}${unit}`;
};

const resolvePh3Status = (property: DeviceProperty | undefined): Ph3Status => {
  const value = Number(property?.value);
  if (!Number.isFinite(value)) {
    return { level: "offline", label: "暂无数据" };
  }
  if (property?.updatedAt != null && property.updatedAt.trim() !== "") {
    const updatedAt = dayjs(property.updatedAt);
    if (updatedAt.isValid() && dayjs().diff(updatedAt) > PH3_DATA_STALE_AFTER_MS) {
      return { level: "offline", label: "数据超时" };
    }
  }
  return { level: "available", label: "" };
};

const formatTrendTime = (value: string): string => formatDateTimeValue(value, value, "HH:mm");

const buildPh3TrendChart = (
  source: TrendPoint[],
): {
  labels: Array<{ key: string; label: string }>;
  linePoints: string;
  points: Array<{ key: string; x: number; y: number; value: number }>;
  bars: Array<{ key: string; x: number; y: number; width: number; height: number }>;
  maxValue: number;
} => {
  const points = source.filter((point) => Number.isFinite(point.value));
  const maxValue = Math.max(...points.map((point) => point.value), 0.1);
  const left = 30;
  const right = 326;
  const top = 18;
  const bottom = 116;
  const toX = (index: number): number => (points.length <= 1 ? (left + right) / 2 : left + (index * (right - left)) / (points.length - 1));
  const toY = (value: number): number => bottom - (Math.min(Math.max(value, 0), maxValue) * (bottom - top)) / maxValue;
  const barWidth = Math.min(10, (right - left) / Math.max(points.length * 1.8, 1));
  const chartPoints = points.map((point, index) => ({
    key: `${point.time}-${index}`,
    x: toX(index),
    y: toY(point.value),
    value: point.value,
  }));
  const labelIndexes = Array.from(
    new Set(
      points.length <= 4
        ? points.map((_, index) => index)
        : [0, Math.floor((points.length - 1) / 3), Math.floor(((points.length - 1) * 2) / 3), points.length - 1],
    ),
  );
  const linePoints = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");
  return {
    labels: labelIndexes.map((index) => ({
      key: `${index}-${points[index]?.time ?? ""}`,
      label: formatTrendTime(points[index]?.time ?? ""),
    })),
    linePoints,
    points: chartPoints,
    bars: chartPoints.map((point) => ({
      key: point.key,
      x: point.x - barWidth / 2,
      y: point.y,
      width: barWidth,
      height: bottom - point.y,
    })),
    maxValue,
  };
};

export const FumigationOperationH5Entry = defineComponent({
  name: "FumigationOperationH5Entry",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const activePage = ref<PageName>(getPageName(route.name));
    const refreshing = ref(false);
    const submitting = ref(false);
    const precheckRunning = ref(false);
    const warehouseOptions = ref<WarehouseOption[]>([]);
    const selectedWorkerCache = ref<WorkerOption[]>([]);
    const workerPickerVisible = ref(false);
    const devicePickerVisible = ref(false);
    const ventilationTimePickerVisible = ref(false);
    const monitorDevice = ref<DeviceOption | undefined>();
    const linkedDevices = ref<LinkedDevice[]>([]);
    const linkedDevicesLoadFailed = ref(false);
    const cameraProperties = ref<DeviceProperty[]>([]);
    const cameraPropertiesLoading = ref(false);
    const monitorLoading = ref(false);
    const monitorLastUpdatedAt = ref("");
    const realtimeStats = ref<RealtimeStats>(emptyRealtimeStats());
    const realtimeInProgress = ref<RealtimeWorkItem[]>([]);
    const realtimeCompletedToday = ref<RealtimeWorkItem[]>([]);
    const realtimeWarehouses = ref<RealtimeWarehouseItem[]>([]);
    const realtimeDevices = ref<RealtimeDeviceItem[]>([]);
    const realtimeAlarms = ref<RealtimeAlarmItem[]>([]);
    const pesticideOptions = ref<Array<{ code: string; name: string }>>([]);
    const applicationMethodOptions = ref<Array<{ code: string; name: string }>>([]);
    const activeArchiveId = ref("");
    const archivePageLoading = ref(false);
    const archiveGenerating = ref(false);
    const archiveViewRef = ref<{ exportPdf: () => Promise<void> } | null>(null);
    const archiveLoadedWorkId = ref("");
    let archiveLoadSeq = 0;
    let monitorLoadSeq = 0;
    let cameraLoadSeq = 0;
    let monitorPollTimer: number | undefined;
    let monitorPollInFlight = false;
    let viewActivated = true;
    const approvalOpinion = ref("");
    const completionVisible = ref(false);
    const completionDescription = ref("");
    const terminationVisible = ref(false);
    const terminationReason = ref("");
    const notificationVisible = ref(false);
    const notificationContent = ref("");
    const notificationLoading = ref(false);
    const selectedCameraId = ref("");

    const routeWorkId = computed(() => readQueryValue(route.query.workId));
    const currentWork = computed(() => fumigationState.works.find((work) => sameSnowflakeId(work.id, routeWorkId.value)));

    const pageTitle = computed(() => {
      if (activePage.value === "archive" && activeArchiveId.value !== "") {
        return "合规档案";
      }
      if (activePage.value === "monitor" && currentWork.value != null) {
        const work = currentWork.value;
        return `${work.warehouseName || work.code} · ${work.grainVarietyName || "--"} · ${WORK_STATUS_META[work.status]?.label ?? work.status}`;
      }
      if (routeWorkId.value !== "" && currentWork.value?.code) {
        return currentWork.value.code;
      }
      return String(route.meta.title ?? "熏蒸作业");
    });

    const navBarRightText = computed(() => {
      if (activePage.value === "archive" && activeArchiveId.value !== "" && !archivePageLoading.value) {
        return "导出 PDF";
      }
      if (activePage.value === "works") {
        return "新增";
      }
      return undefined;
    });

    const worksSearch = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });
    const worksList = ref<FumigationWork[]>([]);
    const worksLoading = ref(false);
    const worksFinished = ref(false);
    const worksRefreshing = ref(false);
    const worksKeyword = ref("");
    const worksStatusFilter = ref<WorkStatus | "">("");

    const worksStatusFilterText = computed(
      () => statusDropdownOptions.find((item) => item.value === worksStatusFilter.value)?.text ?? "全部状态",
    );

    const form = reactive({
      warehouseId: "",
      grainVarietyName: "",
      grainQuantity: "",
      pesticideTypeCode: "",
      pesticideDosage: "",
      applicationMethodCode: "",
      sealedDays: "",
      expectedVentilationAt: "",
      expectedDurationHours: 2,
      safetyMeasures: "",
      workerIds: [] as string[],
      actualWorkerCount: 0,
      deviceId: "",
      deviceCode: "",
      deviceName: "",
    });

    const selectedWarehouse = computed(() => warehouseOptions.value.find((item) => item.id === form.warehouseId));
    const grainOptions = computed(() => selectedWarehouse.value?.grainVarieties ?? []);
    const selectedWorkers = computed(() =>
      form.workerIds
        .map((id) => selectedWorkerCache.value.find((item) => item.id === id))
        .filter((item): item is WorkerOption => item != null),
    );
    const selectedMonitorDevice = computed(() => monitorDevice.value);
    const selectedCamera = computed(() => {
      const cameras = selectedMonitorDevice.value?.cameras ?? [];
      return cameras.find((item) => item.id === selectedCameraId.value) ?? cameras[0];
    });

    const loadCameraProperties = async (cameraDeviceId: string, options: { clearBeforeLoad?: boolean } = {}): Promise<void> => {
      const seq = ++cameraLoadSeq;
      const clearBeforeLoad = options.clearBeforeLoad ?? true;
      if (cameraDeviceId.trim() === "") {
        cameraProperties.value = [];
        cameraPropertiesLoading.value = false;
        return;
      }
      cameraPropertiesLoading.value = true;
      if (clearBeforeLoad) {
        cameraProperties.value = [];
      }
      try {
        const properties = (await getFumigationDeviceProperties(cameraDeviceId, [
          DEVICE_PROPERTY_CODES.aiPeople,
          DEVICE_PROPERTY_CODES.aiMask,
          DEVICE_PROPERTY_CODES.aiProtection,
        ])) as DeviceProperty[];
        if (seq !== cameraLoadSeq || activePage.value !== "monitor" || selectedCamera.value?.id !== cameraDeviceId) {
          return;
        }
        cameraProperties.value = properties;
      } catch {
        if (seq === cameraLoadSeq && clearBeforeLoad) {
          cameraProperties.value = [];
        }
      } finally {
        if (seq === cameraLoadSeq) {
          cameraPropertiesLoading.value = false;
        }
      }
    };

    const loadWorksList = async (reset = false): Promise<void> => {
      if (worksLoading.value && !reset) {
        return;
      }
      if (reset) {
        worksSearch.pageNumber = 1;
        worksList.value = [];
        worksFinished.value = false;
      }
      worksLoading.value = true;
      try {
        const resp = await listFumigationWorks({
          pageNumber: worksSearch.pageNumber,
          pageSize: worksSearch.pageSize,
          keyword: worksKeyword.value.trim(),
          status: worksStatusFilter.value,
        });
        const records = resp.records as FumigationWork[];
        worksList.value = reset ? records : [...worksList.value, ...records];
        worksSearch.total = resp.total;
        replaceFumigationWorks(worksList.value);
        worksFinished.value = worksList.value.length >= resp.total || records.length < worksSearch.pageSize;
        if (!worksFinished.value) {
          worksSearch.pageNumber += 1;
        }
      } catch (error) {
        if (reset) {
          worksList.value = [];
        }
        worksSearch.total = 0;
        worksFinished.value = true;
        notifyFail((error as Error).message || "获取熏蒸作业列表失败");
      } finally {
        worksLoading.value = false;
        worksRefreshing.value = false;
      }
    };

    const onWorksRefresh = async (): Promise<void> => {
      worksRefreshing.value = true;
      await loadWorksList(true);
    };

    const loadCreateBasics = async (): Promise<void> => {
      try {
        const [pesticideTypes, applicationMethods] = await Promise.all([
          listFumigationPesticideTypes(),
          listFumigationApplicationMethods(),
        ]);
        pesticideOptions.value = pesticideTypes.map((item) => ({ code: item.code, name: item.name }));
        applicationMethodOptions.value = applicationMethods.map((item) => ({ code: item.code, name: item.name }));
        if (form.pesticideTypeCode === "" && pesticideOptions.value.length > 0) {
          form.pesticideTypeCode = pesticideOptions.value[0]?.code ?? "";
        }
        if (form.applicationMethodCode === "" && applicationMethodOptions.value.length > 0) {
          form.applicationMethodCode = applicationMethodOptions.value[0]?.code ?? "";
        }
      } catch (error) {
        notifyFail((error as Error).message || "获取新增作业基础数据失败");
      }
    };

    const loadMonitorDevice = async (work: FumigationWork | undefined, options: { silent?: boolean } = {}): Promise<void> => {
      const seq = ++monitorLoadSeq;
      const silent = options.silent ?? false;
      if (work == null || work.deviceId.trim() === "") {
        monitorDevice.value = undefined;
        linkedDevices.value = [];
        linkedDevicesLoadFailed.value = false;
        cameraProperties.value = [];
        cameraPropertiesLoading.value = false;
        monitorLastUpdatedAt.value = "";
        return;
      }
      const selectedCameraBeforeLoad = selectedCameraId.value;
      const [deviceResult, linkedResult] = await Promise.allSettled([
        getFumigationDeviceMonitor(work.deviceId) as Promise<DeviceOption>,
        listFumigationLinkedDevices(work.deviceId) as Promise<LinkedDevice[]>,
      ]);
      if (seq !== monitorLoadSeq || activePage.value !== "monitor") {
        return;
      }
      if (deviceResult.status === "rejected") {
        if (!silent || monitorDevice.value == null) {
          monitorDevice.value = undefined;
          cameraProperties.value = [];
        }
        if (!silent) {
          const error = deviceResult.reason as Error;
          notifyFail(error?.message || "获取监护数据失败");
        }
        return;
      }
      const device = deviceResult.value;
      monitorDevice.value = device;
      monitorLastUpdatedAt.value = dayjs().format("HH:mm:ss");
      if (linkedResult.status === "fulfilled") {
        linkedDevices.value = linkedResult.value;
        linkedDevicesLoadFailed.value = false;
      } else {
        linkedDevicesLoadFailed.value = true;
        if (!silent) {
          linkedDevices.value = [];
        }
      }
      const nextCameraId =
        device.cameras?.some((camera) => camera.id === selectedCameraBeforeLoad) === true
          ? selectedCameraBeforeLoad
          : (device.cameras?.[0]?.id ?? "");
      selectedCameraId.value = nextCameraId;
      if (nextCameraId !== "" && nextCameraId === selectedCameraBeforeLoad) {
        await loadCameraProperties(nextCameraId, { clearBeforeLoad: false });
      }
    };

    const loadRealtimeSituation = async (): Promise<void> => {
      try {
        const [stats, works, warehouses, devices, alarms] = await Promise.all([
          getFumigationRealtimeSituationStats() as Promise<RealtimeStats>,
          getFumigationRealtimeSituationWorks() as Promise<{
            inProgressWorks?: RealtimeWorkItem[];
            completedTodayWorks?: RealtimeWorkItem[];
          }>,
          listFumigationRealtimeSituationWarehouses() as Promise<RealtimeWarehouseItem[]>,
          listFumigationRealtimeSituationDevices() as Promise<RealtimeDeviceItem[]>,
          listFumigationRealtimeSituationAlarms(__ENV__.applicationCode) as Promise<RealtimeAlarmItem[]>,
        ]);
        realtimeStats.value = stats;
        realtimeInProgress.value = works.inProgressWorks ?? [];
        realtimeCompletedToday.value = works.completedTodayWorks ?? [];
        realtimeWarehouses.value = warehouses;
        realtimeDevices.value = devices;
        realtimeAlarms.value = alarms;
      } catch (error) {
        realtimeStats.value = emptyRealtimeStats();
        realtimeInProgress.value = [];
        realtimeCompletedToday.value = [];
        realtimeWarehouses.value = [];
        realtimeDevices.value = [];
        realtimeAlarms.value = [];
        notifyFail((error as Error).message || "获取实时态势失败");
      }
    };

    const loadWorkDetail = async (workId: string): Promise<FumigationWork | undefined> => {
      if (workId === "") {
        return undefined;
      }
      const work = await loadFumigationWorkToCache(workId);
      if (work != null && activePage.value === "precheck") {
        await loadFumigationPrechecksToCache(work);
      }
      return work;
    };

    const loadMonitorPage = async (workId: string, options: { silent?: boolean } = {}): Promise<void> => {
      const silent = options.silent ?? false;
      if (!silent) {
        monitorLoading.value = true;
      }
      try {
        const work = await loadWorkDetail(workId);
        if (activePage.value !== "monitor" || routeWorkId.value !== workId) {
          return;
        }
        await loadMonitorDevice(work, { silent });
      } catch (error) {
        if (!silent && activePage.value === "monitor" && routeWorkId.value === workId) {
          notifyFail((error as Error).message || "获取监护数据失败");
        }
      } finally {
        if (!silent && activePage.value === "monitor" && routeWorkId.value === workId) {
          monitorLoading.value = false;
        }
      }
    };

    const setWarehouse = (warehouseId: string): void => {
      form.warehouseId = warehouseId;
      const warehouse = warehouseOptions.value.find((item) => item.id === warehouseId);
      form.grainVarietyName = warehouse?.grainVarieties[0]?.name ?? "";
      form.deviceId = "";
      form.deviceCode = "";
      form.deviceName = "";
    };

    const normalizeSelectedPerson = (person: PersonItem): WorkerOption => ({
      id: person.id,
      name: person.name,
      role: person.positions?.map((item) => item.name).join(" / ") || "作业人员",
      department: person.organizations?.map((item) => item.name).join(" / ") || "",
      phone: person.mobile ?? "",
      certificates: [],
    });

    const handleWorkerSelect = (people: PersonItem[]): void => {
      const workers = people.map(normalizeSelectedPerson);
      selectedWorkerCache.value = workers;
      form.workerIds = workers.map((item) => item.id);
      form.actualWorkerCount = form.workerIds.length;
    };

    const handleDeviceSelect = (device: DeviceOption): void => {
      form.deviceId = device.id;
      form.deviceCode = device.code ?? device.id;
      form.deviceName = device.name ?? device.code ?? device.id;
    };

    const ensureFormDefaults = (): void => {
      const first = warehouseOptions.value[0];
      if (first != null && form.warehouseId === "") {
        setWarehouse(first.id);
      }
    };

    const load = async (): Promise<void> => {
      refreshing.value = true;
      try {
        if (activePage.value === "archive") {
          const workId = routeWorkId.value;
          if (workId !== "") {
            await loadArchivePage(workId);
          }
          return;
        }
        if (activePage.value === "monitor") {
          const workId = routeWorkId.value;
          if (workId !== "") {
            await loadMonitorPage(workId, { silent: currentWork.value != null });
          }
          return;
        }
        if (activePage.value === "works") {
          await loadWorksList(true);
        } else {
          await loadFumigationWorksToCache({ pageSize: 100 });
        }
        warehouseOptions.value = await loadWarehousesFromIntelligentGrain();
        ensureFormDefaults();
        if (activePage.value === "create") {
          await loadCreateBasics();
        }
        if (activePage.value === "realtime") {
          await loadRealtimeSituation();
        }
        const workId = routeWorkId.value;
        if (workId !== "") {
          await loadWorkDetail(workId);
        }
      } catch (error) {
        notifyFail((error as Error).message || "加载数据失败");
      } finally {
        refreshing.value = false;
      }
    };

    const switchPage = (name: PageName): void => {
      void router.push({ name });
    };

    const syncRoute = (): void => {
      activePage.value = getPageName(route.name);
    };

    const stopMonitorPolling = (): void => {
      window.clearInterval(monitorPollTimer);
      monitorPollTimer = undefined;
    };

    const pollMonitorPage = async (): Promise<void> => {
      if (monitorPollInFlight || activePage.value !== "monitor" || routeWorkId.value === "") {
        return;
      }
      monitorPollInFlight = true;
      try {
        await loadMonitorPage(routeWorkId.value, { silent: true });
      } finally {
        monitorPollInFlight = false;
      }
    };

    const startMonitorPolling = (): void => {
      stopMonitorPolling();
      if (
        !viewActivated ||
        activePage.value !== "monitor" ||
        routeWorkId.value === "" ||
        currentWork.value?.status === "ARCHIVED" ||
        document.visibilityState === "hidden"
      ) {
        return;
      }
      monitorPollTimer = window.setInterval(() => {
        void pollMonitorPage();
      }, MONITOR_POLL_INTERVAL_MS);
    };

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === "hidden") {
        stopMonitorPolling();
        return;
      }
      startMonitorPolling();
      void pollMonitorPage();
    };

    watch(
      () => [route.name, route.query.workId],
      () => {
        syncRoute();
        const workId = routeWorkId.value;
        if (workId === "") {
          return;
        }
        if (activePage.value === "archive") {
          void loadArchivePage(workId);
          return;
        }
        if (activePage.value === "monitor") {
          void loadMonitorPage(workId);
          return;
        }
        void loadWorkDetail(workId);
      },
    );

    watch(
      () => selectedCamera.value?.id,
      (cameraDeviceId) => {
        if (activePage.value === "monitor") {
          void loadCameraProperties(cameraDeviceId ?? "");
        }
      },
    );

    watch(
      () => activePage.value,
      (page) => {
        if (page !== "monitor") {
          monitorLoadSeq += 1;
          cameraLoadSeq += 1;
          monitorDevice.value = undefined;
          linkedDevices.value = [];
          linkedDevicesLoadFailed.value = false;
          cameraProperties.value = [];
          cameraPropertiesLoading.value = false;
          monitorLastUpdatedAt.value = "";
          selectedCameraId.value = "";
        }
        if (page === "works") {
          void loadWorksList(true);
        }
        if (page === "create") {
          void loadCreateBasics();
        }
        if (page === "realtime") {
          void loadRealtimeSituation();
        }
      },
    );

    watch(worksStatusFilter, () => {
      void loadWorksList(true);
    });

    watch(
      () => [activePage.value, routeWorkId.value, currentWork.value?.status],
      () => {
        startMonitorPolling();
      },
    );

    const loadArchivePage = async (workId: string): Promise<void> => {
      if (workId === "") {
        activeArchiveId.value = "";
        archiveLoadedWorkId.value = "";
        return;
      }
      const seq = ++archiveLoadSeq;
      const keepCurrentDocument = archiveLoadedWorkId.value === workId && activeArchiveId.value !== "";
      if (!keepCurrentDocument) {
        archivePageLoading.value = true;
      }
      try {
        const work = await loadFumigationWorkToCache(workId);
        if (seq !== archiveLoadSeq) {
          return;
        }
        if (work == null) {
          replaceFumigationArchives([]);
          if (!keepCurrentDocument) {
            activeArchiveId.value = "";
          }
          return;
        }
        const archives = await listFumigationArchives({ pageNumber: 1, pageSize: 20, workId: work.id });
        if (seq !== archiveLoadSeq) {
          return;
        }
        replaceFumigationArchives(archives.records as ArchiveRecord[]);
        const nextArchiveId = archives.records[0]?.id ?? "";
        activeArchiveId.value = nextArchiveId;
        archiveLoadedWorkId.value = workId;
      } catch (error) {
        if (seq !== archiveLoadSeq) {
          return;
        }
        replaceFumigationArchives([]);
        if (!keepCurrentDocument) {
          activeArchiveId.value = "";
        }
        notifyFail((error as Error).message || "获取合规档案失败");
      } finally {
        if (seq === archiveLoadSeq) {
          archivePageLoading.value = false;
        }
      }
    };

    onMounted(() => {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      startMonitorPolling();
      void load();
      const detailPages: PageName[] = ["approval", "precheck", "monitor", "archive"];
      if (detailPages.includes(activePage.value) && routeWorkId.value === "") {
        notifyFail("缺少作业编号，请从列表进入");
      }
    });

    onActivated(() => {
      viewActivated = true;
      startMonitorPolling();
    });

    onDeactivated(() => {
      viewActivated = false;
      stopMonitorPolling();
    });

    onBeforeUnmount(() => {
      stopMonitorPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    });

    const selectWorkAndGo = (work: FumigationWork, page: PageName, mode?: "view" | "approve"): void => {
      void router.push({
        name: page,
        query: {
          workId: work.id,
          ...(page === "approval" && mode != null ? { mode } : {}),
        },
      });
    };

    const validateCreate = (): string => {
      if (form.warehouseId === "") {
        return "请选择仓房";
      }
      if (form.grainVarietyName.trim() === "") {
        return "请选择粮食品种";
      }
      const grainQuantity = Number(form.grainQuantity);
      if (!Number.isFinite(grainQuantity) || grainQuantity <= 0) {
        return "请填写粮食数量";
      }
      if (form.pesticideTypeCode === "") {
        return "请选择药剂种类";
      }
      if (form.pesticideDosage.trim() === "") {
        return "请填写药剂用量";
      }
      if (form.applicationMethodCode === "") {
        return "请选择施药方式";
      }
      const sealedDays = Number(form.sealedDays);
      if (!Number.isFinite(sealedDays) || sealedDays <= 0) {
        return "请填写密闭时间";
      }
      if (form.expectedVentilationAt.trim() === "") {
        return "请选择预计散气时间";
      }
      const expectedDurationHours = Number(form.expectedDurationHours);
      if (!Number.isFinite(expectedDurationHours) || expectedDurationHours <= 0 || expectedDurationHours > 8) {
        return "预计作业时长需大于 0 且不超过 8 小时";
      }
      if (form.safetyMeasures.trim() === "") {
        return "请填写安全措施";
      }
      if (form.workerIds.length < 2 || form.actualWorkerCount < 2) {
        return "作业人员不能少于 2 人";
      }
      if (form.deviceId === "") {
        return "请选择关联设备";
      }
      return "";
    };

    const submitCreate = async (): Promise<void> => {
      const error = validateCreate();
      if (error !== "") {
        notifyFail(error);
        return;
      }
      const warehouse = selectedWarehouse.value;
      const pesticideName = pesticideOptions.value.find((item) => item.code === form.pesticideTypeCode)?.name ?? "";
      submitting.value = true;
      try {
        const work = (await createFumigationWork({
          warehouseId: form.warehouseId,
          warehouseCode: warehouse?.code ?? "",
          warehouseName: warehouse?.name ?? "",
          grainVarietyId: form.grainVarietyName,
          grainVarietyName: form.grainVarietyName,
          deviceId: form.deviceId,
          deviceCode: form.deviceCode,
          deviceName: form.deviceName,
          expectedDurationHours: Number(form.expectedDurationHours),
          plannedStartAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          plannedDosage: pesticideName,
          grainQuantity: Number(form.grainQuantity),
          pesticideTypeCode: form.pesticideTypeCode,
          pesticideDosage: form.pesticideDosage.trim(),
          applicationMethodCode: form.applicationMethodCode,
          sealedDays: Number(form.sealedDays),
          expectedVentilationAt: form.expectedVentilationAt.trim(),
          safetyMeasures: form.safetyMeasures.trim(),
          safetyDisclosure: form.safetyMeasures.trim(),
          emergencyPlan: "",
          siteLeader: selectedWorkers.value[0]?.name ?? "",
          workerIds: form.workerIds,
          actualWorkerCount: form.actualWorkerCount,
        })) as FumigationWork;
        upsertFumigationWork(work);
        notifySuccess("已新增熏蒸作业");
        void router.push({ name: "works" });
      } catch (createError) {
        notifyFail((createError as Error).message || "新增熏蒸作业失败");
      } finally {
        submitting.value = false;
      }
    };

    const runApproval = async (action: "approved" | "rejected"): Promise<void> => {
      const work = currentWork.value;
      if (work == null) {
        notifyFail("暂无作业详情");
        return;
      }
      if (!canApproveFumigationWork(work)) {
        notifyFail("当前作业不在审批节点");
        return;
      }
      submitting.value = true;
      try {
        const updated = (await submitFumigationApproval(work.id, {
          action,
          opinion: approvalOpinion.value,
        })) as FumigationWork;
        upsertFumigationWork(updated);
        approvalOpinion.value = "";
        notifySuccess(action === "approved" ? "审批通过" : "审批已驳回/退回");
      } catch (approvalError) {
        notifyFail((approvalError as Error).message || "审批提交失败");
      } finally {
        submitting.value = false;
      }
    };

    const runAllPrechecks = async (work: FumigationWork): Promise<void> => {
      if (!canRunPrecheck(work)) {
        notifyFail("当前作业不能执行校验");
        return;
      }
      precheckRunning.value = true;
      try {
        const prechecks = (await runFumigationPrechecks(work.id)) as Record<PrecheckStepId, PrecheckResult>;
        const latest = await loadFumigationWorkToCache(work.id);
        if (latest != null) {
          await loadFumigationPrechecksToCache(latest);
        }
        const results = STEP_IDS.map((stepId) => prechecks[stepId]);
        const failed = results.find((item) => item.status !== "passed");
        if (failed == null) {
          notifySuccess("三步校验已通过，已进入监护中");
          return;
        }
        notifyFail(failed.message || `${failed.title}未通过`);
      } catch (precheckError) {
        notifyFail((precheckError as Error).message || "三步校验失败");
      } finally {
        precheckRunning.value = false;
      }
    };

    const openCompletionDialog = (work: FumigationWork): void => {
      if (!canCompleteFumigationWork(work)) {
        notifyFail("当前作业不可正常完工");
        return;
      }
      completionVisible.value = true;
    };

    const closeWork = async (work: FumigationWork): Promise<void> => {
      if (!canCompleteFumigationWork(work)) {
        notifyFail("当前作业不可正常完工");
        return;
      }
      submitting.value = true;
      try {
        const updated = (await completeFumigationWork(work.id, { description: completionDescription.value.trim() })) as FumigationWork;
        upsertFumigationWork(updated);
        completionVisible.value = false;
        completionDescription.value = "";
        notifySuccess("作业已正常完工并归档");
      } catch (completeError) {
        notifyFail((completeError as Error).message || "正常完工失败");
      } finally {
        submitting.value = false;
      }
    };

    const openTerminationDialog = (work: FumigationWork): void => {
      if (work.status === "ARCHIVED") {
        notifyFail("作业已归档，无法终止");
        return;
      }
      terminationReason.value = "";
      terminationVisible.value = true;
    };

    const forceTerminate = async (work: FumigationWork): Promise<void> => {
      const reason = terminationReason.value.trim();
      if (reason === "") {
        notifyFail("请填写终止原因");
        return;
      }
      submitting.value = true;
      try {
        const updated = (await terminateFumigationWork(work.id, { reason })) as FumigationWork;
        upsertFumigationWork(updated);
        terminationVisible.value = false;
        terminationReason.value = "";
        notifySuccess("作业已终止并自动归档");
      } catch (terminateError) {
        notifyFail((terminateError as Error).message || "终止作业失败");
      } finally {
        submitting.value = false;
      }
    };

    const openNotificationDialog = (): void => {
      const work = currentWork.value;
      if (work == null) {
        return;
      }
      if (work.status === "ARCHIVED") {
        notifyFail("作业已完工归档，无法发送通知");
        return;
      }
      if (resolveWorkWorkers(work).length === 0) {
        notifyFail("当前作业暂无人员，无法发送通知");
        return;
      }
      notificationContent.value = "";
      notificationVisible.value = true;
    };

    const handleSendNotification = async (): Promise<void> => {
      const work = currentWork.value;
      const content = notificationContent.value.trim();
      if (work == null) {
        return;
      }
      if (content === "") {
        notifyFail("请填写通知内容");
        return;
      }
      const receiverUserIds = (work.workers ?? []).map((person) => String(person.userId ?? "").trim()).filter((userId) => userId !== "");
      if (receiverUserIds.length === 0) {
        notifyFail("当前作业暂无有效接收人");
        return;
      }
      notificationLoading.value = true;
      try {
        await sendFumigationNotification(work.id, { receiverUserIds, content });
        notificationVisible.value = false;
        notificationContent.value = "";
        notifySuccess("通知已发送");
      } catch (error) {
        notifyFail((error as Error).message || "发送通知失败");
      } finally {
        notificationLoading.value = false;
      }
    };

    const handleGenerateArchive = async (): Promise<void> => {
      const workId = currentWork.value?.id ?? routeWorkId.value;
      if (workId === "") {
        notifyFail("缺少作业编号");
        return;
      }
      let work = currentWork.value;
      if (work == null) {
        work = await loadFumigationWorkToCache(workId);
      }
      if (work == null) {
        notifyFail("缺少作业编号");
        return;
      }
      if (work.status !== "ARCHIVED") {
        notifyFail("只有已归档作业才能生成合规档案");
        return;
      }
      archiveGenerating.value = true;
      try {
        const archive = (await generateFumigationArchive(work.id)) as ArchiveRecord;
        upsertFumigationArchive(archive);
        activeArchiveId.value = archive.id;
        notifySuccess("合规档案已生成");
      } catch (error) {
        notifyFail((error as Error).message || "生成合规档案失败");
      } finally {
        archiveGenerating.value = false;
      }
    };

    const handleNavBarRight = (): void => {
      if (activePage.value === "works") {
        switchPage("create");
        return;
      }
      if (activePage.value === "archive" && activeArchiveId.value !== "") {
        void archiveViewRef.value?.exportPdf();
      }
    };

    const renderWorkDetailPanels = (work: FumigationWork, statusLabel: string): JSX.Element => (
      <>
        <section class="fz-h5-section">
          <div class="fz-h5-section__head">
            <strong>仓房信息</strong>
          </div>
          <div class="fz-h5-info-grid">
            <div>
              <span>仓房</span>
              <strong>{work.warehouseName || work.warehouseCode || "--"}</strong>
            </div>
            <div>
              <span>粮食品种</span>
              <strong>{work.grainVarietyName || "--"}</strong>
            </div>
            <div>
              <span>粮食数量（吨）</span>
              <strong>{work.grainQuantity == null ? "--" : `${work.grainQuantity}`}</strong>
            </div>
            <div>
              <span>申请人</span>
              <strong>{work.applicantName || "--"}</strong>
            </div>
          </div>
        </section>
        <section class="fz-h5-section">
          <div class="fz-h5-section__head">
            <strong>熏蒸方案</strong>
          </div>
          <div class="fz-h5-info-grid">
            <div>
              <span>药剂种类</span>
              <strong>{getPesticideDisplayName(work)}</strong>
            </div>
            <div>
              <span>药剂用量</span>
              <strong>{work.pesticideDosage || "--"}</strong>
            </div>
            <div>
              <span>施药方式</span>
              <strong>{work.applicationMethodName || work.applicationMethod || "--"}</strong>
            </div>
            <div>
              <span>密闭时间（天）</span>
              <strong>{work.sealedDays == null ? "--" : `${work.sealedDays}`}</strong>
            </div>
            <div>
              <span>预计散气时间</span>
              <strong>{formatDateTimeValue(work.expectedVentilationAt, "--", "YYYY-MM-DD HH:mm:ss")}</strong>
            </div>
            <div>
              <span>预计作业时长（小时）</span>
              <strong>{`${work.expectedDurationHours}`}</strong>
            </div>
            <div>
              <span>预计到期</span>
              <strong>{getDueAt(work)}</strong>
            </div>
            <div>
              <span>关联设备</span>
              <strong>{work.deviceName ?? work.deviceCode ?? work.deviceId ?? "--"}</strong>
            </div>
            <div>
              <span>{statusLabel}</span>
              <strong>
                <StatusTag status={work.status} />
              </strong>
            </div>
          </div>
          <div class="fz-h5-card">
            <div class="fz-h5-field-title">安全措施</div>
            <span>{work.safetyMeasures || work.safetyDisclosure || "--"}</span>
          </div>
        </section>
      </>
    );

    const renderAttachments = (work: FumigationWork): JSX.Element => {
      const files = work.attachments ?? [];
      if (files.length === 0) {
        return <Empty image-size={64} description="暂无附件" />;
      }
      return (
        <>
          {files.map((file, index) => (
            <Cell
              key={file.id || `${file.name}-${index}`}
              title={file.fileVO?.name ?? file.name ?? "附件"}
              label={file.suffix ?? file.fileVO?.suffix ?? ""}
            />
          ))}
        </>
      );
    };

    const renderPrecheckAlert = (): JSX.Element => (
      <section class="fz-h5-card fz-h5-precheck-alert">
        <div class="fz-h5-field-title">审批通过后，由保管员在实际作业前手动触发三步校验</div>
        <p>① 第一步：校验通风时长是否达标</p>
        <p>② 第二步：检测磷化氢浓度是否 &lt; 0.3ppm</p>
        <p>③ 第三步：检测氧气浓度是否 ≥ 19.5%</p>
        <p class="fz-h5-field-note">系统会自动读取设备实时数据，任一步校验未通过将锁定流程。</p>
      </section>
    );

    const renderWorkerCards = (work: FumigationWork): JSX.Element => {
      const rows = buildWorkerTableRows(work);
      if (rows.length === 0) {
        return <Empty image-size={72} description="暂无作业人员信息" />;
      }
      return (
        <>
          {rows.map((row) => (
            <section class={["fz-h5-card", row.certStatus === "expired" ? "is-locked" : ""]} key={row.id}>
              <div class="fz-h5-card__head">
                <strong>{row.name}</strong>
                <Tag type={row.certStatus === "expired" ? "danger" : row.certStatus === "valid" ? "success" : "default"}>
                  {row.certStatus === "expired" ? "已过期" : row.certStatus === "valid" ? "一致" : "无"}
                </Tag>
              </div>
              <div class="fz-h5-info-grid">
                <div>
                  <span>证书编号</span>
                  <strong>{row.certNo}</strong>
                </div>
                <div>
                  <span>有效期</span>
                  <strong>{row.certExpireAt}</strong>
                </div>
              </div>
            </section>
          ))}
        </>
      );
    };

    const renderApprovalHistory = (work: FumigationWork): JSX.Element => {
      const timeline = buildApprovalTimeline(work);
      if (timeline.length === 0) {
        return <Empty image-size={72} description="暂无审批历史" />;
      }
      return (
        <>
          {timeline.map((item) => (
            <section class="fz-h5-timeline" key={item.key}>
              <i />
              <div>
                <strong>
                  {item.actor} · {item.actionLabel}
                </strong>
                <span>{item.time}</span>
                <p>{item.description}</p>
              </div>
            </section>
          ))}
        </>
      );
    };

    const renderMissingWorkId = (): JSX.Element => <Empty description="缺少作业编号，请从列表进入" />;

    const renderWorkCard = (work: FumigationWork): JSX.Element => (
      <section class={["fz-h5-card", work.status === "CHECK_FAILED" ? "is-locked" : ""]} key={work.id}>
        <div class="fz-h5-card__head">
          <div>
            <strong>{work.code || work.id}</strong>
            <span>{getWarehouseDisplayName(work)}</span>
          </div>
          <StatusTag status={work.status} />
        </div>
        <div class="fz-h5-info-grid">
          <div>
            <span>品种</span>
            <strong>{work.grainVarietyName || "--"}</strong>
          </div>
          <div>
            <span>药剂</span>
            <strong>{getPesticideDisplayName(work)}</strong>
          </div>
          <div>
            <span>申请人</span>
            <strong>{work.applicantName || "--"}</strong>
          </div>
          <div>
            <span>审批</span>
            <strong>{getApprovalProgress(work)}</strong>
          </div>
        </div>
        <div class="fz-h5-card__foot">
          <div class="fz-h5-table-actions">
            <Button size="mini" plain type="primary" onClick={() => selectWorkAndGo(work, "approval", "view")}>
              查看
            </Button>
            {isWorkApprovalPending(work.status) ? (
              <Button size="mini" plain type="primary" onClick={() => selectWorkAndGo(work, "approval", "approve")}>
                审批
              </Button>
            ) : null}
            {canRecheck(work.status) ? (
              <Button size="mini" plain type="primary" onClick={() => selectWorkAndGo(work, "precheck")}>
                重新校验
              </Button>
            ) : null}
            {canViewCheck(work.status) ? (
              <Button size="mini" plain type="primary" onClick={() => selectWorkAndGo(work, "precheck")}>
                查看校验
              </Button>
            ) : null}
            {canEnterMonitorBoard(work) ? (
              <Button size="mini" plain type="success" onClick={() => selectWorkAndGo(work, "monitor")}>
                监护
              </Button>
            ) : null}
            {canArchive(work.status) ? (
              <Button size="mini" plain onClick={() => selectWorkAndGo(work, "archive")}>
                档案
              </Button>
            ) : null}
          </div>
        </div>
      </section>
    );

    const renderWorks = (): JSX.Element => (
      <>
        <div class="fz-h5-works-search">
          <Search
            v-model={worksKeyword.value}
            placeholder="搜索工单编号、仓房、申请人"
            shape="round"
            class="fz-h5-works-search__input"
            onSearch={() => void loadWorksList(true)}
            onClear={() => void loadWorksList(true)}
          />
        </div>
        <div class="fz-h5-works-filter">
          <DropdownMenu overlay={false} class="fz-h5-works-dropdown">
            <DropdownItem
              v-model={worksStatusFilter.value}
              title={`状态：${worksStatusFilterText.value}`}
              options={statusDropdownOptions}
            />
          </DropdownMenu>
        </div>
        <PullRefresh modelValue={worksRefreshing.value || worksLoading.value} onRefresh={onWorksRefresh}>
          <List
            class="fz-h5-works-list"
            v-model:loading={worksLoading.value}
            finished={worksFinished.value}
            finishedText={worksList.value.length ? "— 没有更多了 —" : "暂无作业"}
            onLoad={() => void loadWorksList()}
          >
            {worksList.value.map((work) => renderWorkCard(work))}
            {!worksLoading.value && !worksList.value.length ? <Empty image-size={72} description="暂无作业" /> : null}
          </List>
        </PullRefresh>
      </>
    );

    const renderChoiceChips = (
      items: Array<{ id: string; name: string; code?: string }>,
      selectedId: string,
      onSelect: (id: string) => void,
    ): JSX.Element => (
      <section class="fz-h5-chip-row">
        {items.map((item) => (
          <Button
            key={item.id}
            size="small"
            type={item.id === selectedId ? "primary" : "default"}
            plain={item.id !== selectedId}
            onClick={() => onSelect(item.id)}
          >
            {item.name}
          </Button>
        ))}
      </section>
    );

    const renderCreate = (): JSX.Element => (
      <>
        <section class="fz-h5-section">
          <div class="fz-h5-section__head">
            <strong>仓房信息</strong>
          </div>
          <div class="fz-h5-card">
            <div class="fz-h5-field-title">仓房</div>
            {renderChoiceChips(warehouseOptions.value, form.warehouseId, setWarehouse)}
          </div>
          <div class="fz-h5-card">
            <div class="fz-h5-field-title">粮食品种</div>
            {grainOptions.value.length > 0 ? (
              renderChoiceChips(
                grainOptions.value.map((item) => ({ id: item.name, name: item.name })),
                form.grainVarietyName,
                (name) => {
                  form.grainVarietyName = name;
                },
              )
            ) : (
              <Empty image-size={64} description="请先选择仓房" />
            )}
          </div>
        </section>

        <CellGroup inset>
          <Field v-model={form.grainQuantity} label="粮食数量（吨）" type="number" placeholder="请输入粮食数量" />
          <Cell title="药剂种类" value={pesticideOptions.value.find((item) => item.code === form.pesticideTypeCode)?.name ?? "请选择"} />
          <section class="fz-h5-chip-row">
            {pesticideOptions.value.map((item) => (
              <Button
                key={item.code}
                size="small"
                type={item.code === form.pesticideTypeCode ? "primary" : "default"}
                plain={item.code !== form.pesticideTypeCode}
                onClick={() => {
                  form.pesticideTypeCode = item.code;
                }}
              >
                {item.name}
              </Button>
            ))}
          </section>
          <Field v-model={form.pesticideDosage} label="药剂用量" placeholder="如：18kg" />
          <Cell
            title="施药方式"
            value={applicationMethodOptions.value.find((item) => item.code === form.applicationMethodCode)?.name ?? "请选择"}
          />
          <section class="fz-h5-chip-row">
            {applicationMethodOptions.value.map((item) => (
              <Button
                key={item.code}
                size="small"
                type={item.code === form.applicationMethodCode ? "primary" : "default"}
                plain={item.code !== form.applicationMethodCode}
                onClick={() => {
                  form.applicationMethodCode = item.code;
                }}
              >
                {item.name}
              </Button>
            ))}
          </section>
          <Field v-model={form.sealedDays} label="密闭时间（天）" type="digit" placeholder="请输入密闭天数" />
        </CellGroup>

        <section class="fz-h5-timing-fields">
          <Field
            label="预计散气时间"
            modelValue={
              form.expectedVentilationAt.trim() === "" ? "" : formatDateTimeValue(form.expectedVentilationAt, "", "YYYY-MM-DD HH:mm:ss")
            }
            placeholder="请选择预计散气时间"
            readonly
            isLink
            onClick={() => {
              ventilationTimePickerVisible.value = true;
            }}
          />
          <div class="fz-h5-stepper-field">
            <div class="fz-h5-stepper-field__head">
              <strong>预计作业时长（小时）</strong>
              <span>常规 1-2 小时，最长 8 小时</span>
            </div>
            <Stepper
              modelValue={form.expectedDurationHours}
              min={1}
              max={8}
              step={0.5}
              decimal-length={1}
              input-width="72px"
              button-size="32px"
              onUpdate:modelValue={(value: string | number) => {
                const next = Number(value);
                form.expectedDurationHours = Number.isFinite(next) ? next : 0;
              }}
            />
          </div>
        </section>

        <CellGroup inset>
          <Field v-model={form.safetyMeasures} label="安全措施" type="textarea" autosize rows={3} placeholder="请输入现场安全措施" />
        </CellGroup>

        <section class="fz-h5-section">
          <div class="fz-h5-section__head">
            <strong>作业人员</strong>
            <span>{form.actualWorkerCount} 人</span>
          </div>
          <Cell
            title="已选人员"
            value={selectedWorkers.value.map((worker) => worker.name).join("、") || "请选择作业人员，至少 2 人"}
            is-link
            onClick={() => {
              workerPickerVisible.value = true;
            }}
          />
          {selectedWorkers.value.length > 0 ? (
            <div class="fz-h5-selected-tags">
              {selectedWorkers.value.map((worker) => (
                <Tag key={worker.id} plain type="primary">
                  {worker.name}
                </Tag>
              ))}
            </div>
          ) : null}
          <Button
            block
            plain
            type="primary"
            size="small"
            onClick={() => {
              workerPickerVisible.value = true;
            }}
          >
            选择人员
          </Button>
        </section>

        <section class="fz-h5-section">
          <div class="fz-h5-section__head">
            <strong>关联设备</strong>
          </div>
          <Cell
            title="设备"
            value={form.deviceName || form.deviceCode || "请选择关联设备"}
            is-link
            onClick={() => {
              devicePickerVisible.value = true;
            }}
          />
          <Button
            block
            plain
            type="primary"
            size="small"
            onClick={() => {
              devicePickerVisible.value = true;
            }}
          >
            选择设备
          </Button>
        </section>

        <Button block type="primary" class="fz-h5-main-action" loading={submitting.value} onClick={() => void submitCreate()}>
          提交
        </Button>
      </>
    );

    const renderApproval = (): JSX.Element => {
      if (routeWorkId.value === "") {
        return renderMissingWorkId();
      }
      const work = currentWork.value;
      if (work == null) {
        return <Empty description="暂无作业详情" />;
      }
      return (
        <>
          {renderWorkDetailPanels(work, "审批状态")}
          <section class="fz-h5-section">
            <div class="fz-h5-section__head">
              <strong>附件</strong>
            </div>
            {renderAttachments(work)}
          </section>
          <section class="fz-h5-section">
            <div class="fz-h5-section__head">
              <strong>作业人员</strong>
              <span>{buildWorkerTableRows(work).length} 人</span>
            </div>
            {renderWorkerCards(work)}
          </section>
          {renderPrecheckAlert()}
          <section class="fz-h5-section">
            <div class="fz-h5-section__head">
              <strong>审批历史</strong>
            </div>
            {renderApprovalHistory(work)}
          </section>
          <Button block plain class="fz-h5-main-action" onClick={() => switchPage("works")}>
            返回列表
          </Button>
          {canApproveFumigationWork(work) ? (
            <>
              <Field
                v-model={approvalOpinion.value}
                label="审批意见"
                type="textarea"
                autosize
                rows={2}
                placeholder="请输入审批意见（选填）"
              />
              <div class="fz-h5-action-row">
                <Button block type="primary" loading={submitting.value} onClick={() => void runApproval("approved")}>
                  同意
                </Button>
                <Button block plain type="danger" loading={submitting.value} onClick={() => void runApproval("rejected")}>
                  驳回
                </Button>
              </div>
            </>
          ) : null}
          {work.status === "PENDING_CHECK" ? (
            <Button block plain class="fz-h5-main-action" onClick={() => selectWorkAndGo(work, "precheck")}>
              去三步校验
            </Button>
          ) : null}
        </>
      );
    };

    const renderPrecheck = (): JSX.Element => {
      if (routeWorkId.value === "") {
        return renderMissingWorkId();
      }
      const work = currentWork.value;
      if (work == null) {
        return <Empty description="暂无校验作业" />;
      }
      return (
        <>
          {renderWorkDetailPanels(work, "作业状态")}
          <section class="fz-h5-section">
            <div class="fz-h5-section__head">
              <strong>作业人员</strong>
              <span>{buildWorkerTableRows(work).length} 人</span>
            </div>
            {renderWorkerCards(work)}
          </section>
          <section class="fz-h5-section">
            <div class="fz-h5-section__head">
              <strong>校验结果</strong>
              {allPrechecksPassed(work) ? <Tag type="success">全部通过</Tag> : null}
            </div>
            {!canRunPrecheck(work) && !allPrechecksPassed(work) && work.status !== "ARCHIVED" ? (
              <div class="fz-h5-field-note">当前作业尚未完成技术审批，不能执行三步校验。</div>
            ) : null}
            {STEP_IDS.map((stepId) => {
              const result = work.prechecks?.[stepId];
              if (result == null) {
                return null;
              }
              const displayValues = getDisplayCheckValues(result);
              return (
                <section class="fz-h5-card" key={stepId}>
                  <div class="fz-h5-card__head">
                    <div>
                      <strong>{PRECHECK_STEP_META[stepId].title}</strong>
                      <span>{PRECHECK_STEP_META[stepId].description}</span>
                    </div>
                    <CheckTag status={result.status} />
                  </div>
                  <div class="fz-h5-result-values">
                    {displayValues.length > 0 ? (
                      displayValues.map((item) => (
                        <div key={item.label}>
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                        </div>
                      ))
                    ) : (
                      <span>{result.message || "暂无校验值"}</span>
                    )}
                  </div>
                  <Cell title="校验时间" value={formatDateTimeValue(result.checkedAt, "--", "YYYY-MM-DD HH:mm:ss")} />
                </section>
              );
            })}
          </section>
          <section class="fz-h5-section">
            <div class="fz-h5-section__head">
              <strong>审批历史</strong>
            </div>
            {renderApprovalHistory(work)}
          </section>
          {canRunPrecheck(work) ? (
            <Button
              block
              type="primary"
              loading={precheckRunning.value}
              class="fz-h5-main-action"
              onClick={() => void runAllPrechecks(work)}
            >
              开始校验
            </Button>
          ) : null}
          {allPrechecksPassed(work) ? (
            <Button block type="success" class="fz-h5-main-action" onClick={() => selectWorkAndGo(work, "monitor")}>
              进入监护看板
            </Button>
          ) : null}
        </>
      );
    };

    const renderMiniTrend = (device: DeviceOption | undefined): JSX.Element => {
      const points = (device?.indoorPh3Trend ?? []).filter((point) => Number.isFinite(point.value));
      if (points.length === 0) {
        return <Empty image-size={56} description="暂无趋势数据" />;
      }
      const chart = buildPh3TrendChart(points);
      const latestPoint = chart.points[chart.points.length - 1];
      return (
        <div class="fz-h5-ph3-trend">
          <svg viewBox="0 0 340 132" role="img" aria-label="近30分钟仓内PH3浓度趋势">
            {chart.bars.map((bar) => (
              <rect key={bar.key} class="fz-h5-ph3-trend__bar" x={bar.x} y={bar.y} width={bar.width} height={bar.height} rx="2" />
            ))}
            <polyline class="fz-h5-ph3-trend__line" points={chart.linePoints} />
            {latestPoint == null ? null : <circle class="fz-h5-ph3-trend__point" cx={latestPoint.x} cy={latestPoint.y} r="4" />}
          </svg>
          <div class="fz-h5-ph3-trend__labels">
            {chart.labels.map((item) => (
              <span key={item.key}>{item.label}</span>
            ))}
          </div>
        </div>
      );
    };

    const renderMonitorGas = (device: DeviceOption | undefined): JSX.Element => {
      const indoorProperty = getProperty(device, DEVICE_PROPERTY_CODES.ph3Indoor);
      const outdoorProperty = getProperty(device, DEVICE_PROPERTY_CODES.ph3Outdoor);
      const entranceProperty = getProperty(device, DEVICE_PROPERTY_CODES.ph3Entrance);
      const indoorStatus = resolvePh3Status(indoorProperty);
      const outdoorStatus = resolvePh3Status(outdoorProperty);
      const entranceStatus = resolvePh3Status(entranceProperty);
      return (
        <section class="fz-h5-monitor-card">
          <div class="fz-h5-monitor-card__head">
            <strong>磷化氢浓度</strong>
            {indoorStatus.level === "offline" ? <span class="fz-h5-monitor-status is-offline">{indoorStatus.label}</span> : null}
          </div>
          <div class="fz-h5-metrics is-monitor-gas">
            <div>
              <span>仓内</span>
              <strong>{formatDeviceMetric(device, "ph3Indoor", "ppm")}</strong>
              {indoorStatus.level === "offline" ? <small>{indoorStatus.label}</small> : null}
            </div>
            <div>
              <span>仓外</span>
              <strong>{formatDeviceMetric(device, "ph3Outdoor", "ppm")}</strong>
              {outdoorStatus.level === "offline" ? <small>{outdoorStatus.label}</small> : null}
            </div>
            <div>
              <span>入口</span>
              <strong>{formatDeviceMetric(device, "ph3Entrance", "ppm")}</strong>
              {entranceStatus.level === "offline" ? <small>{entranceStatus.label}</small> : null}
            </div>
          </div>
          <div class="fz-h5-monitor-note">
            <span>设备上报：{formatDateTimeValue(indoorProperty?.updatedAt, "--", "MM-DD HH:mm:ss")}</span>
            <span>页面刷新：{monitorLastUpdatedAt.value || "--"}</span>
          </div>
        </section>
      );
    };

    const renderMonitorVideo = (device: DeviceOption | undefined): JSX.Element => {
      const camera = selectedCamera.value;
      return (
        <section class="fz-h5-monitor-card">
          <div class="fz-h5-monitor-card__head">
            <strong>AI视频监护</strong>
            <span>{camera?.name ?? "无关联监控"}</span>
          </div>
          <div class="fz-h5-monitor-video">
            {camera?.id != null && camera.id !== "" ? (
              <MonitorVideoPlayer key={camera.id} deviceId={camera.id} />
            ) : (
              <Empty image-size={56} description="暂无关联视频" />
            )}
          </div>
          <div class="fz-h5-ai-grid">
            <div>
              <span>AI 人数</span>
              <strong>
                {cameraPropertiesLoading.value ? "..." : formatPropertyMetric(cameraProperties.value, DEVICE_PROPERTY_CODES.aiPeople, "人")}
              </strong>
            </div>
            <div>
              <span>面具识别</span>
              <strong>
                {cameraPropertiesLoading.value ? "..." : formatPropertyMetric(cameraProperties.value, DEVICE_PROPERTY_CODES.aiMask, "人")}
              </strong>
            </div>
            <div>
              <span>防护识别</span>
              <strong>
                {cameraPropertiesLoading.value
                  ? "..."
                  : formatPropertyMetric(cameraProperties.value, DEVICE_PROPERTY_CODES.aiProtection, "人")}
              </strong>
            </div>
          </div>
          {(device?.cameras ?? []).length > 1 ? (
            <section class="fz-h5-chip-row">
              {(device?.cameras ?? []).map((item) => (
                <Button
                  key={item.id}
                  size="small"
                  type={selectedCamera.value?.id === item.id ? "primary" : "default"}
                  plain={selectedCamera.value?.id !== item.id}
                  onClick={() => {
                    selectedCameraId.value = item.id;
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </section>
          ) : null}
        </section>
      );
    };

    const renderMonitorWorkers = (workers: WorkerOption[]): JSX.Element => {
      return (
        <section class="fz-h5-monitor-card">
          <div class="fz-h5-monitor-card__head">
            <strong>作业人员</strong>
          </div>
          <div class="fz-h5-worker-list is-monitor">
            {workers.length > 0 ? (
              workers.map((worker) => {
                const certificate = getWorkerCertificate(worker);
                const certificateState =
                  certificate == null
                    ? ({ label: "证书未配置", type: "warning" } as const)
                    : certificate.expireAt.trim() === ""
                      ? ({ label: "有效期缺失", type: "warning" } as const)
                      : isCertificateExpired(certificate)
                        ? ({ label: "证书已过期", type: "danger" } as const)
                        : ({ label: "证书有效", type: "success" } as const);
                return (
                  <section class="fz-h5-person" key={worker.id}>
                    <div class="fz-h5-person__head">
                      <strong>{worker.name}</strong>
                      <div class="fz-h5-person__tags">
                        <Tag plain type="primary">
                          {translateWorkerRole(worker.role)}
                        </Tag>
                        <Tag type={certificateState.type}>{certificateState.label}</Tag>
                      </div>
                    </div>
                    <span>部门</span>
                    <small>{worker.department || "--"}</small>
                    <span>电话</span>
                    <small>{worker.phone || "--"}</small>
                  </section>
                );
              })
            ) : (
              <Empty image-size={64} description="暂无作业人员" />
            )}
          </div>
        </section>
      );
    };

    const renderMonitor = (): JSX.Element => {
      if (routeWorkId.value === "") {
        return renderMissingWorkId();
      }
      const work = currentWork.value;
      const device = monitorDevice.value;
      const workers = resolveWorkWorkers(work);
      if (monitorLoading.value) {
        return (
          <div class="fz-h5-archive-loading">
            <Loading size="24px">加载监护数据...</Loading>
          </div>
        );
      }
      if (work == null) {
        return <Empty description="暂无监护作业" />;
      }
      return (
        <div class="fz-h5-monitor-page">
          {renderMonitorGas(device)}
          <section class="fz-h5-monitor-card">
            <div class="fz-h5-monitor-card__head">
              <strong>近 30 分钟仓内 PH3 趋势</strong>
            </div>
            {renderMiniTrend(device)}
          </section>
          {renderMonitorVideo(device)}
          {renderMonitorWorkers(workers)}
          <section class="fz-h5-monitor-card">
            <div class="fz-h5-monitor-card__head">
              <strong>事件时间线</strong>
            </div>
            {(device?.alarmFlow ?? []).length === 0 ? (
              <Empty image-size={64} description="暂无事件" />
            ) : (
              (device?.alarmFlow ?? []).map((event) => (
                <section class="fz-h5-timeline" key={event.id}>
                  <i />
                  <div>
                    <strong>{event.title}</strong>
                    <span>
                      {event.time} · {event.handler}
                    </span>
                    <p>{event.result}</p>
                  </div>
                </section>
              ))
            )}
          </section>
          <section class="fz-h5-monitor-card">
            <div class="fz-h5-monitor-card__head">
              <strong>关联设备</strong>
            </div>
            {linkedDevicesLoadFailed.value ? (
              <Empty image-size={64} description="关联设备加载失败，下拉可重试" />
            ) : linkedDevices.value.length === 0 ? (
              <Empty image-size={64} description="暂无关联设备" />
            ) : (
              linkedDevices.value.map((item) => (
                <Cell key={item.id} title={item.name} label={item.type} value={item.status === "online" ? "在线" : "离线"} />
              ))
            )}
          </section>
          <div class="fz-h5-monitor-actions">
            <Button
              block
              type="primary"
              disabled={!canCompleteFumigationWork(work)}
              loading={submitting.value}
              onClick={() => openCompletionDialog(work)}
            >
              完成
            </Button>
            <Button block plain disabled={work.status === "ARCHIVED" || workers.length === 0} onClick={openNotificationDialog}>
              通知
            </Button>
            <Button
              block
              plain
              type="danger"
              loading={submitting.value}
              disabled={work.status === "ARCHIVED"}
              onClick={() => openTerminationDialog(work)}
            >
              终止
            </Button>
          </div>
        </div>
      );
    };

    const renderRealtime = (): JSX.Element => {
      const stats = realtimeStats.value;
      const monthWorkMax = Math.max(stats.lastMonthWorkCount, stats.currentMonthWorkCount, 1);
      const inProgressWarehouseIds = new Set(realtimeInProgress.value.map((item) => item.warehouseId).filter(Boolean));
      const effectiveWarehouses = realtimeWarehouses.value.map((warehouse) => {
        if (warehouse.status === "working" || !inProgressWarehouseIds.has(warehouse.warehouseId)) {
          return warehouse;
        }
        return {
          ...warehouse,
          status: "working" as const,
          statusLabel: "作业中",
        };
      });
      const workingWarehouseCount = effectiveWarehouses.filter((item) => item.status === "working").length;
      return (
        <>
          <section class="fz-h5-summary">
            <div>
              <span>进行中作业</span>
              <strong>{stats.inProgressCount}</strong>
            </div>
            <div>
              <span>今日完工</span>
              <strong>{stats.completedTodayCount}</strong>
            </div>
            <div>
              <span>本月作业</span>
              <strong>{stats.monthCreatedCount}</strong>
            </div>
          </section>
          <section class="fz-h5-card">
            <div class="fz-h5-field-title">三步校验通过率</div>
            <strong>{stats.precheckPassRate.toFixed(1)}%</strong>
          </section>
          <section class="fz-h5-section">
            <div class="fz-h5-section__head">
              <strong>进行中作业</strong>
            </div>
            {realtimeInProgress.value.length === 0 ? (
              <Empty description="暂无进行中作业" />
            ) : (
              realtimeInProgress.value.map((work) => (
                <section class="fz-h5-card" key={work.id}>
                  <div class="fz-h5-card__head">
                    <div>
                      <strong>
                        {work.warehouseName}·{work.grainVarietyName ?? "--"}
                      </strong>
                      <span>{work.pesticideSummary ?? work.code}</span>
                    </div>
                    <Tag type="success">{work.workerCount ?? 0} 人</Tag>
                  </div>
                  {work.remainingLabel != null ? <span>{work.remainingLabel}</span> : null}
                </section>
              ))
            )}
          </section>
          <section class="fz-h5-section">
            <div class="fz-h5-section__head">
              <strong>今日已完工</strong>
            </div>
            {realtimeCompletedToday.value.length === 0 ? (
              <Empty description="今日暂无完工作业" />
            ) : (
              realtimeCompletedToday.value.map((work) => (
                <Cell key={work.id} title={`${work.warehouseName}·${work.grainVarietyName ?? "--"}`} value={work.completedTime ?? "--"} />
              ))
            )}
          </section>
          <section class="fz-h5-section">
            <div class="fz-h5-section__head">
              <strong>仓房状态</strong>
              <span>
                {effectiveWarehouses.length} 仓房·{workingWarehouseCount} 作业中
              </span>
            </div>
            <div class="fz-h5-info-grid">
              {effectiveWarehouses.map((warehouse) => (
                <div key={warehouse.warehouseId}>
                  <span>{warehouse.warehouseName}</span>
                  <strong>{warehouse.statusLabel}</strong>
                </div>
              ))}
            </div>
          </section>
          <section class="fz-h5-section">
            <div class="fz-h5-section__head">
              <strong>本月趋势</strong>
            </div>
            <Cell title="上月作业量" value={`${stats.lastMonthWorkCount}`} />
            <Cell title="本月作业量" value={`${stats.currentMonthWorkCount}`} />
            <div class="fz-h5-trend">
              <div>
                <i style={{ height: trendWidth(stats.lastMonthWorkCount, monthWorkMax) }} />
                <span>上月</span>
              </div>
              <div>
                <i style={{ height: trendWidth(stats.currentMonthWorkCount, monthWorkMax) }} />
                <span>本月</span>
              </div>
            </div>
            <Cell title="上月校验通过率" value={`${stats.lastMonthPrecheckPassRate.toFixed(1)}%`} />
            <Cell title="本月校验通过率" value={`${stats.currentMonthPrecheckPassRate.toFixed(1)}%`} />
          </section>
          <section class="fz-h5-section">
            <div class="fz-h5-section__head">
              <strong>设备运行状态</strong>
            </div>
            {realtimeDevices.value.length === 0 ? (
              <Empty description="暂无设备" />
            ) : (
              realtimeDevices.value.map((device) => (
                <Cell key={device.id} title={device.name} value={device.status === "online" ? "在线" : "离线"} />
              ))
            )}
          </section>
          <section class="fz-h5-section">
            <div class="fz-h5-section__head">
              <strong>今日告警详情</strong>
            </div>
            {realtimeAlarms.value.length === 0 ? (
              <Empty description="今日暂无告警" />
            ) : (
              realtimeAlarms.value.map((alarm) => (
                <section class="fz-h5-timeline" key={alarm.id}>
                  <i />
                  <div>
                    <strong>{alarm.alarmEventName}</strong>
                    <span>
                      {formatDateTimeValue(alarm.alarmTime, "--", "HH:mm")} · {alarm.alarmStatusName}
                    </span>
                  </div>
                </section>
              ))
            )}
          </section>
        </>
      );
    };

    const renderArchive = (): JSX.Element => {
      if (routeWorkId.value === "") {
        return renderMissingWorkId();
      }

      if (archivePageLoading.value) {
        return (
          <div class="fz-h5-archive-loading">
            <Loading size="24px">加载中...</Loading>
          </div>
        );
      }
      if (activeArchiveId.value !== "") {
        return (
          <ArchiveDocumentView key={activeArchiveId.value} ref={archiveViewRef} archiveId={activeArchiveId.value} showToolbar={false} />
        );
      }
      const work = currentWork.value;
      if (work == null) {
        return <Empty description="暂无作业信息" />;
      }
      return (
        <>
          <Empty description="作业已归档，点击下方按钮生成合规档案" />
          <Button
            block
            type="primary"
            class="fz-h5-main-action"
            loading={archiveGenerating.value}
            disabled={work.status !== "ARCHIVED"}
            onClick={() => void handleGenerateArchive()}
          >
            生成合规档案
          </Button>
          <Button block plain class="fz-h5-main-action" onClick={() => switchPage("works")}>
            返回列表
          </Button>
        </>
      );
    };

    const renderContent = (): JSX.Element => {
      if (activePage.value === "create") {
        return renderCreate();
      }
      if (activePage.value === "approval") {
        return renderApproval();
      }
      if (activePage.value === "precheck") {
        return renderPrecheck();
      }
      if (activePage.value === "monitor") {
        return renderMonitor();
      }
      if (activePage.value === "realtime") {
        return renderRealtime();
      }
      if (activePage.value === "archive") {
        return renderArchive();
      }
      return <Empty description="页面不存在" />;
    };

    return (): JSX.Element => (
      <div class="fz-h5-entry">
        <div class="fz-h5-page">
          <CubeNavBar showBack title={pageTitle.value} rightText={navBarRightText.value} onClickRight={handleNavBarRight} />
          {activePage.value === "works" ? (
            renderWorks()
          ) : activePage.value === "archive" ? (
            <main key={`archive-${routeWorkId.value}-${activeArchiveId.value}`} class="fz-h5-content">
              {renderArchive()}
            </main>
          ) : (
            <PullRefresh v-model={refreshing.value} onRefresh={load}>
              <main key={`${activePage.value}-${routeWorkId.value}`} class="fz-h5-content">
                {renderContent()}
              </main>
            </PullRefresh>
          )}
        </div>
        <Popup
          show={completionVisible.value}
          position="bottom"
          round
          closeOnClickOverlay={!submitting.value}
          onUpdate:show={(value: boolean) => {
            if (value || !submitting.value) {
              completionVisible.value = value;
            }
          }}
        >
          <div class="fz-h5-popup-content">
            <div class="fz-h5-popup-title">
              <strong>正常完工</strong>
            </div>
            <Field v-model={completionDescription.value} type="textarea" rows={3} autosize placeholder="正常完工时填写描述信息（选填）" />
            <div class="fz-h5-action-row">
              <Button
                block
                plain
                disabled={submitting.value}
                onClick={() => {
                  completionVisible.value = false;
                }}
              >
                取消
              </Button>
              <Button
                block
                type="primary"
                loading={submitting.value}
                disabled={currentWork.value == null}
                onClick={() => {
                  const work = currentWork.value;
                  if (work != null) {
                    void closeWork(work);
                  }
                }}
              >
                确认完工
              </Button>
            </div>
          </div>
        </Popup>
        <Popup
          show={terminationVisible.value}
          position="bottom"
          round
          closeOnClickOverlay={!submitting.value}
          onUpdate:show={(value: boolean) => {
            if (value || !submitting.value) {
              terminationVisible.value = value;
            }
          }}
        >
          <div class="fz-h5-popup-content">
            <div class="fz-h5-popup-title">
              <strong>终止作业</strong>
            </div>
            <div class="fz-h5-popup-warning">终止后作业将自动归档，请确认并填写终止原因。</div>
            <Field
              v-model={terminationReason.value}
              required
              type="textarea"
              rows={3}
              autosize
              maxlength={200}
              showWordLimit
              placeholder="请输入终止原因"
            />
            <div class="fz-h5-action-row">
              <Button
                block
                plain
                disabled={submitting.value}
                onClick={() => {
                  terminationVisible.value = false;
                }}
              >
                取消
              </Button>
              <Button
                block
                type="danger"
                loading={submitting.value}
                disabled={currentWork.value == null}
                onClick={() => {
                  const work = currentWork.value;
                  if (work != null) {
                    void forceTerminate(work);
                  }
                }}
              >
                确认终止
              </Button>
            </div>
          </div>
        </Popup>
        <Popup
          show={notificationVisible.value}
          position="bottom"
          round
          closeOnClickOverlay={!notificationLoading.value}
          onUpdate:show={(value: boolean) => {
            if (value || !notificationLoading.value) {
              notificationVisible.value = value;
            }
          }}
        >
          <div class="fz-h5-popup-content">
            <div class="fz-h5-popup-title">
              <strong>发送通知</strong>
            </div>
            <div class="fz-h5-field-note">
              接收人：
              {resolveWorkWorkers(currentWork.value)
                .map((worker) => worker.name)
                .join("、") || "--"}
            </div>
            <Field v-model={notificationContent.value} type="textarea" rows={3} autosize placeholder="请输入通知内容" />
            <div class="fz-h5-action-row">
              <Button
                block
                plain
                disabled={notificationLoading.value}
                onClick={() => {
                  notificationVisible.value = false;
                }}
              >
                取消
              </Button>
              <Button block type="primary" loading={notificationLoading.value} onClick={() => void handleSendNotification()}>
                发送
              </Button>
            </div>
          </div>
        </Popup>
        <WorkerSelectPopup
          show={workerPickerVisible.value}
          selectedIds={form.workerIds}
          onUpdate:show={(value: boolean) => {
            workerPickerVisible.value = value;
          }}
          onConfirm={handleWorkerSelect}
        />
        <DeviceSelectPopup
          show={devicePickerVisible.value}
          selectedId={form.deviceId}
          onUpdate:show={(value: boolean) => {
            devicePickerVisible.value = value;
          }}
          onConfirm={handleDeviceSelect}
        />
        <CubeDataTimePicker
          title="预计散气时间"
          format="YYYY-MM-DD HH:mm:ss"
          v-model:visible={ventilationTimePickerVisible.value}
          v-model:value={form.expectedVentilationAt}
        />
      </div>
    );
  },
});
