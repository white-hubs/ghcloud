import { computed, defineComponent, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { JSX } from "vue/jsx-runtime";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type {
  SecurityDeviceRecord,
  DroneRouteCommand,
  DroneRouteModel,
  DroneRouteStatus,
  DroneWaypointCommand,
  DroneWaypointModel,
  TrackDetailModel,
} from "@ghcloud/cube-drone-service";
import {
  Button,
  DeleteOutlined,
  Form,
  FormItem,
  HolderOutlined,
  Input,
  InputNumber,
  PlusOutlined,
  PopConfirm,
  Select,
  Switch,
  TabPane,
  Tabs,
  Textarea,
  message,
  type FormExpose,
} from "@ghcloud/cube-ui";
import { DeviceModalTable } from "@ghcloud/generic-component";

import { DroneGisMap } from "../components/drone-gis-map";
import { cubeDroneService } from "@/api/server";

import styles from "./routes.module.less";

type EditableRouteStatus = Exclude<DroneRouteStatus, "DISABLED">;
type RouteEditorPageType = "create" | "edit" | "preview";
type MapPoint = { lng: number; lat: number };
type MapPointSelection = { type: "create" } | { type: "update"; index: number };
type RouteFormState = {
  id: number | undefined;
  routeName: string;
  routeCode: string;
  status: DroneRouteStatus;
  flightHeightM: number | undefined;
  flightSpeedMps: number | undefined;
  returnBatteryThreshold: number | undefined;
  safeTakeoffHeightM: number | undefined;
  rthAltitudeM: number | undefined;
  deviceId: number | undefined;
  deviceName: string;
  controlChannelType: string;
  gatewaySn: string;
  droneSn: string;
  payloadIndex: string;
  remark: string;
  waypoints: WaypointFormState[];
};

type WaypointFormState = {
  rowKey: string;
  id: number | undefined;
  seqNo: number;
  waypointName: string;
  mapLng: number | undefined;
  mapLat: number | undefined;
  actualLng: number | undefined;
  actualLat: number | undefined;
  actualHeight: number | undefined;
  gimbalResetMode: number | undefined;
  cameraType: string;
  zoomFactor: number | undefined;
  photoEnabled: boolean;
  recordEnabled: boolean;
  recordDurationSeconds: number | undefined;
  status: string;
  remark: string;
};

let waypointKey = 0;

const routeStatusMeta: Record<DroneRouteStatus, { text: string; className: string }> = {
  DRAFT: { text: "草稿", className: styles.statusDraft },
  ENABLED: { text: "启用", className: styles.statusEnabled },
  DISABLED: { text: "禁用", className: styles.statusDisabled },
};

const gimbalResetOptions = [
  { label: "不重置", value: undefined },
  { label: "回中", value: 0 },
  { label: "向下", value: 1 },
  { label: "偏航回中", value: 2 },
  { label: "俯仰向下", value: 3 },
];

const cameraTypeOptions = [
  { label: "不指定", value: "" },
  { label: "红外", value: "ir" },
  { label: "广角", value: "wide" },
  { label: "变焦", value: "zoom" },
];

const toFiniteNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
    return undefined;
  }
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
};

const DRONE_APPLICATION_CODE = __ENV__.applicationCode;
const DRONE_APPLICATION_TAG = `builtin.app::${DRONE_APPLICATION_CODE}`;

const getSecurityDeviceId = (device: SecurityDeviceRecord): number | undefined => {
  return toFiniteNumber(device.deviceId ?? device.id);
};

const getSecurityDeviceName = (device: SecurityDeviceRecord): string => {
  return device.deviceName || device.name || String(device.deviceId || device.id || "");
};

const assignOptional = <T, K extends keyof T>(target: T, key: K, value: T[K] | undefined | null | ""): void => {
  if (value !== undefined && value !== null && value !== "") {
    target[key] = value as T[K];
  }
};

const createWaypoint = (seqNo: number, flightHeightM?: number, point?: MapPoint): WaypointFormState => {
  const lng = point ? Number(point.lng.toFixed(8)) : undefined;
  const lat = point ? Number(point.lat.toFixed(8)) : undefined;
  return {
    rowKey: `waypoint-${Date.now()}-${++waypointKey}`,
    id: undefined,
    seqNo,
    waypointName: `航点${seqNo}`,
    mapLng: lng,
    mapLat: lat,
    actualLng: lng,
    actualLat: lat,
    actualHeight: flightHeightM,
    gimbalResetMode: undefined,
    cameraType: "wide",
    zoomFactor: undefined,
    photoEnabled: true,
    recordEnabled: false,
    recordDurationSeconds: undefined,
    status: "DRAFT",
    remark: "",
  };
};

const createRouteForm = (): RouteFormState => ({
  id: undefined,
  routeName: "",
  routeCode: "",
  status: "ENABLED",
  flightHeightM: 80,
  flightSpeedMps: 5,
  returnBatteryThreshold: 30,
  safeTakeoffHeightM: 30,
  rthAltitudeM: 100,
  deviceId: undefined,
  deviceName: "",
  controlChannelType: "DRC",
  gatewaySn: "",
  droneSn: "",
  payloadIndex: "",
  remark: "",
  waypoints: [],
});

const normalizeRouteStatusForEdit = (status?: DroneRouteStatus): EditableRouteStatus => (status === "DRAFT" ? "DRAFT" : "ENABLED");

const normalizeWaypoint = (item: DroneWaypointModel, index: number, flightHeightM?: number): WaypointFormState => ({
  rowKey: `waypoint-${item.id ?? `${Date.now()}-${++waypointKey}`}`,
  id: item.id,
  seqNo: item.seqNo ?? index + 1,
  waypointName: item.waypointName ?? `航点${index + 1}`,
  mapLng: toFiniteNumber(item.mapLng),
  mapLat: toFiniteNumber(item.mapLat),
  actualLng: toFiniteNumber(item.actualLng),
  actualLat: toFiniteNumber(item.actualLat),
  actualHeight: toFiniteNumber(item.actualHeight) ?? flightHeightM,
  gimbalResetMode: toFiniteNumber(item.gimbalResetMode),
  cameraType: item.cameraType ?? "wide",
  zoomFactor: toFiniteNumber(item.zoomFactor),
  photoEnabled: item.photoEnabled !== false,
  recordEnabled: Boolean(item.recordEnabled),
  recordDurationSeconds: toFiniteNumber(item.recordDurationSeconds),
  status: item.status ?? "DRAFT",
  remark: item.remark ?? "",
});

const buildWaypointCommand = (item: WaypointFormState, index: number): DroneWaypointCommand => {
  const command: DroneWaypointCommand = {
    seqNo: index + 1,
    waypointName: item.waypointName.trim(),
    photoEnabled: item.photoEnabled,
    recordEnabled: item.recordEnabled,
  };
  assignOptional(command, "id", item.id);
  assignOptional(command, "mapLng", toFiniteNumber(item.mapLng));
  assignOptional(command, "mapLat", toFiniteNumber(item.mapLat));
  assignOptional(command, "actualLng", toFiniteNumber(item.actualLng));
  assignOptional(command, "actualLat", toFiniteNumber(item.actualLat));
  assignOptional(command, "actualHeight", toFiniteNumber(item.actualHeight));
  assignOptional(command, "gimbalResetMode", toFiniteNumber(item.gimbalResetMode));
  assignOptional(command, "cameraType", item.cameraType);
  assignOptional(command, "zoomFactor", toFiniteNumber(item.zoomFactor));
  assignOptional(command, "recordDurationSeconds", toFiniteNumber(item.recordDurationSeconds));
  assignOptional(command, "remark", item.remark.trim());
  return command;
};

const hasExecutablePoint = (item: WaypointFormState): boolean =>
  toFiniteNumber(item.actualLng) !== undefined &&
  toFiniteNumber(item.actualLat) !== undefined &&
  toFiniteNumber(item.actualHeight) !== undefined;

const routeListPath = "/inspection-routes";
const routeEditPath = "/inspection-route-edit";

const getQueryString = (value: unknown): string => {
  if (Array.isArray(value)) {
    return String(value[0] ?? "");
  }
  return String(value ?? "");
};

type RouteEditorPageOptions = {
  name: string;
  title: string;
  pageType: RouteEditorPageType;
  readonly: boolean;
};

const createRouteEditorPage = (options: RouteEditorPageOptions) =>
  defineComponent({
    name: options.name,
    setup: () => {
      const route = useRoute();
      const router = useRouter();
      const formRef = ref<FormExpose>();
      const droneDeviceModalRef = ref<{ openModal: () => void }>();
      const activeTab = ref("basic");
      const selectedWaypointIndex = ref(0);
      const draggingWaypointIndex = ref<number>();
      const draggingWaypointKey = ref("");
      const pendingMapPointSelection = ref<MapPointSelection | null>(null);
      const submitLoading = ref(false);
      const detailLoading = ref(false);
      const routeForm = reactive<RouteFormState>(createRouteForm());
      let loadSerial = 0;

      const isReadonly = computed(() => options.readonly);
      const isSelectingMapPoint = computed(() => !isReadonly.value && pendingMapPointSelection.value !== null);
      const currentWaypoint = computed(() => routeForm.waypoints[selectedWaypointIndex.value]);
      const routeTrack = computed<TrackDetailModel | null>(() => {
        const points = routeForm.waypoints
          .map((item) => ({
            id: item.rowKey,
            longitude: toFiniteNumber(item.actualLng) ?? toFiniteNumber(item.mapLng) ?? 0,
            latitude: toFiniteNumber(item.actualLat) ?? toFiniteNumber(item.mapLat) ?? 0,
            altitude: toFiniteNumber(item.actualHeight),
            waypointType: item.photoEnabled ? ("inspect" as const) : ("waypoint" as const),
          }))
          .filter((item) => item.longitude && item.latitude);
        if (points.length === 0) {
          return null;
        }
        return {
          taskLogId: String(routeForm.id ?? "draft-route"),
          trackName: routeForm.routeName || "未命名航线",
          currentWaypoint: Math.min(selectedWaypointIndex.value + 1, points.length),
          totalWaypoints: points.length,
          points,
        };
      });
      const focusPoint = computed(() => {
        const waypoint = currentWaypoint.value;
        if (!waypoint) {
          return null;
        }
        const lng = toFiniteNumber(waypoint.actualLng) ?? toFiniteNumber(waypoint.mapLng);
        const lat = toFiniteNumber(waypoint.actualLat) ?? toFiniteNumber(waypoint.mapLat);
        return lng && lat ? { lng, lat } : null;
      });

      const backToList = (): void => {
        void router.push({ path: routeListPath });
      };

      const resetRouteForm = (): void => {
        Object.assign(routeForm, createRouteForm());
        selectedWaypointIndex.value = 0;
        pendingMapPointSelection.value = null;
        activeTab.value = "basic";
        formRef.value?.clearValidate();
      };

      const fillRouteForm = (detail: DroneRouteModel): void => {
        Object.assign(routeForm, {
          id: detail.id,
          routeName: detail.routeName ?? "",
          routeCode: detail.routeCode ?? "",
          status: detail.status ?? "ENABLED",
          flightHeightM: toFiniteNumber(detail.flightHeightM),
          flightSpeedMps: toFiniteNumber(detail.flightSpeedMps),
          returnBatteryThreshold: toFiniteNumber(detail.returnBatteryThreshold),
          safeTakeoffHeightM: toFiniteNumber(detail.safeTakeoffHeightM),
          rthAltitudeM: toFiniteNumber(detail.rthAltitudeM),
          deviceId: toFiniteNumber(detail.deviceId),
          deviceName: detail.deviceName ?? "",
          controlChannelType: detail.controlChannelType ?? "",
          gatewaySn: detail.gatewaySn ?? "",
          droneSn: detail.droneSn ?? "",
          payloadIndex: detail.payloadIndex ?? "",
          remark: detail.remark ?? "",
        });
        routeForm.waypoints = (detail.waypoints ?? []).map((item, index) => normalizeWaypoint(item, index, routeForm.flightHeightM));
        selectedWaypointIndex.value = 0;
      };

      const refreshWaypointSeq = (): void => {
        routeForm.waypoints.forEach((item, index) => {
          item.seqNo = index + 1;
          if (!item.waypointName.trim()) {
            item.waypointName = `航点${index + 1}`;
          }
        });
      };

      const handleRouteDeviceSelected = (values: SecurityDeviceRecord[]): void => {
        const selectedDevice = values[0];
        routeForm.deviceId = selectedDevice ? getSecurityDeviceId(selectedDevice) : undefined;
        routeForm.deviceName = selectedDevice ? getSecurityDeviceName(selectedDevice) : "";
      };

      const applyPointToWaypoint = (waypoint: WaypointFormState, point: MapPoint): void => {
        const lng = Number(point.lng.toFixed(8));
        const lat = Number(point.lat.toFixed(8));
        waypoint.mapLng = lng;
        waypoint.mapLat = lat;
        waypoint.actualLng = lng;
        waypoint.actualLat = lat;
        waypoint.actualHeight = waypoint.actualHeight ?? routeForm.flightHeightM;
      };

      const startCreateWaypoint = (): void => {
        pendingMapPointSelection.value = { type: "create" };
        activeTab.value = "waypoints";
        message.info("请在地图上点击标记航点位置");
      };

      const startUpdateWaypointPoint = (): void => {
        if (!currentWaypoint.value) {
          message.warning("请先选择航点");
          return;
        }
        pendingMapPointSelection.value = { type: "update", index: selectedWaypointIndex.value };
        activeTab.value = "waypoints";
        message.info("请在地图上点击选择新的航点位置");
      };

      const cancelMapPointSelection = (): void => {
        pendingMapPointSelection.value = null;
      };

      const handleMapPointSelect = (point: MapPoint): void => {
        const selection = pendingMapPointSelection.value;
        if (!selection || isReadonly.value) {
          return;
        }
        if (selection.type === "create") {
          const waypoint = createWaypoint(routeForm.waypoints.length + 1, routeForm.flightHeightM, point);
          routeForm.waypoints.push(waypoint);
          selectedWaypointIndex.value = routeForm.waypoints.length - 1;
          message.success("航点已添加");
        } else {
          const waypoint = routeForm.waypoints[selection.index];
          if (!waypoint) {
            pendingMapPointSelection.value = null;
            return;
          }
          applyPointToWaypoint(waypoint, point);
          selectedWaypointIndex.value = selection.index;
          message.success("航点位置已更新");
        }
        pendingMapPointSelection.value = null;
      };

      const removeWaypoint = (index: number): void => {
        const removedKey = routeForm.waypoints[index]?.rowKey;
        const selectedKey = currentWaypoint.value?.rowKey;
        pendingMapPointSelection.value = null;
        routeForm.waypoints.splice(index, 1);
        refreshWaypointSeq();
        if (selectedKey && selectedKey !== removedKey) {
          const nextIndex = routeForm.waypoints.findIndex((item) => item.rowKey === selectedKey);
          selectedWaypointIndex.value = nextIndex >= 0 ? nextIndex : Math.max(0, Math.min(index, routeForm.waypoints.length - 1));
        } else {
          selectedWaypointIndex.value = Math.max(0, Math.min(index, routeForm.waypoints.length - 1));
        }
      };

      const clearWaypointDrag = (): void => {
        draggingWaypointIndex.value = undefined;
        draggingWaypointKey.value = "";
      };

      const reorderWaypoint = (fromIndex: number, targetIndex: number): void => {
        if (
          fromIndex === targetIndex ||
          fromIndex < 0 ||
          targetIndex < 0 ||
          fromIndex >= routeForm.waypoints.length ||
          targetIndex >= routeForm.waypoints.length
        ) {
          return;
        }

        const selectedKey = currentWaypoint.value?.rowKey;
        const [item] = routeForm.waypoints.splice(fromIndex, 1);
        routeForm.waypoints.splice(targetIndex, 0, item);
        refreshWaypointSeq();
        pendingMapPointSelection.value = null;
        if (selectedKey) {
          const nextSelectedIndex = routeForm.waypoints.findIndex((waypoint) => waypoint.rowKey === selectedKey);
          selectedWaypointIndex.value = nextSelectedIndex >= 0 ? nextSelectedIndex : targetIndex;
        } else {
          selectedWaypointIndex.value = targetIndex;
        }
      };

      const handleWaypointDragStart = (index: number, event: DragEvent): void => {
        if (isReadonly.value) {
          return;
        }
        draggingWaypointIndex.value = index;
        draggingWaypointKey.value = routeForm.waypoints[index]?.rowKey ?? "";
        event.dataTransfer?.setData("text/plain", String(index));
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = "move";
        }
      };

      const handleWaypointDragOver = (event: DragEvent): void => {
        if (isReadonly.value || draggingWaypointIndex.value === undefined) {
          return;
        }
        event.preventDefault();
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = "move";
        }
      };

      const handleWaypointDrop = (targetIndex: number, event: DragEvent): void => {
        event.preventDefault();
        if (isReadonly.value) {
          clearWaypointDrag();
          return;
        }
        const transferIndex = event.dataTransfer?.getData("text/plain");
        const fromIndex = draggingWaypointIndex.value ?? (transferIndex ? Number(transferIndex) : undefined);
        if (fromIndex !== undefined && Number.isFinite(fromIndex)) {
          reorderWaypoint(fromIndex, targetIndex);
        }
        clearWaypointDrag();
      };

      const syncActualWithMap = (): void => {
        const waypoint = currentWaypoint.value;
        if (!waypoint) {
          return;
        }
        waypoint.actualLng = waypoint.mapLng;
        waypoint.actualLat = waypoint.mapLat;
        waypoint.actualHeight = waypoint.actualHeight ?? routeForm.flightHeightM;
        message.success("已同步地图坐标到执行坐标");
      };

      const validateBeforeSubmit = async (status: EditableRouteStatus): Promise<boolean> => {
        try {
          await formRef.value?.validate();
        } catch {
          activeTab.value = "basic";
          return false;
        }
        if (!routeForm.routeName.trim()) {
          activeTab.value = "basic";
          message.warning("请输入航线名称");
          return false;
        }
        if (routeForm.waypoints.length === 0) {
          activeTab.value = "waypoints";
          message.warning("请至少配置一个航点");
          return false;
        }
        const invalidNameIndex = routeForm.waypoints.findIndex((item) => !item.waypointName.trim());
        if (invalidNameIndex >= 0) {
          activeTab.value = "waypoints";
          selectedWaypointIndex.value = invalidNameIndex;
          message.warning(`请输入航点${invalidNameIndex + 1}名称`);
          return false;
        }
        if (status === "ENABLED") {
          const invalidPointIndex = routeForm.waypoints.findIndex((item) => !hasExecutablePoint(item));
          if (invalidPointIndex >= 0) {
            activeTab.value = "waypoints";
            selectedWaypointIndex.value = invalidPointIndex;
            message.warning(`航点${invalidPointIndex + 1}缺少实际执行经纬度或高度`);
            return false;
          }
        }
        return true;
      };

      const buildPayload = (status: EditableRouteStatus): DroneRouteCommand => {
        const payload: DroneRouteCommand = {
          routeName: routeForm.routeName.trim(),
          status,
          waypoints: routeForm.waypoints.map(buildWaypointCommand),
        };
        assignOptional(payload, "flightHeightM", toFiniteNumber(routeForm.flightHeightM));
        assignOptional(payload, "flightSpeedMps", toFiniteNumber(routeForm.flightSpeedMps));
        assignOptional(payload, "returnBatteryThreshold", toFiniteNumber(routeForm.returnBatteryThreshold));
        assignOptional(payload, "safeTakeoffHeightM", toFiniteNumber(routeForm.safeTakeoffHeightM));
        assignOptional(payload, "rthAltitudeM", toFiniteNumber(routeForm.rthAltitudeM));
        assignOptional(payload, "deviceId", toFiniteNumber(routeForm.deviceId));
        assignOptional(payload, "deviceName", routeForm.deviceName.trim());
        assignOptional(payload, "remark", routeForm.remark.trim());
        return payload;
      };

      const submitRoute = async (status: EditableRouteStatus): Promise<void> => {
        if (!(await validateBeforeSubmit(status))) {
          return;
        }
        submitLoading.value = true;
        try {
          const payload = buildPayload(status);
          if (routeForm.id) {
            await cubeDroneService.updateDroneRoute(routeForm.id, payload);
          } else {
            await cubeDroneService.createDroneRoute(payload);
          }
          message.success("保存成功");
          backToList();
        } finally {
          submitLoading.value = false;
        }
      };

      const editCurrentRoute = (): void => {
        if (!routeForm.id) {
          message.warning("缺少航线标识");
          return;
        }
        void router.push({ path: routeEditPath, query: { id: routeForm.id } });
      };

      const loadRouteFromQuery = async (): Promise<void> => {
        const currentSerial = ++loadSerial;
        resetRouteForm();
        if (options.pageType === "create") {
          return;
        }
        const routeId = getQueryString(route.query.id);
        if (!routeId) {
          message.warning("缺少航线标识");
          void router.replace({ path: routeListPath });
          return;
        }
        detailLoading.value = true;
        try {
          const detail = await cubeDroneService.getDroneRoute(routeId);
          if (currentSerial !== loadSerial) {
            return;
          }
          fillRouteForm(detail);
          if (options.pageType === "edit") {
            routeForm.status = normalizeRouteStatusForEdit(routeForm.status);
          }
        } finally {
          if (currentSerial === loadSerial) {
            detailLoading.value = false;
          }
        }
      };

      watch(
        () => route.query.id,
        () => {
          void loadRouteFromQuery();
        },
        { immediate: true },
      );

      const renderBasicForm = (): JSX.Element => (
        <Form
          ref={formRef}
          model={routeForm}
          disabled={isReadonly.value}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          class={styles.routeForm}
          rules={{
            routeName: [{ required: true, message: "请输入航线名称", trigger: "blur" }],
          }}
        >
          <div class={styles.formSection}>
            <div class={styles.sectionTitle}>基础信息</div>
            <div class={styles.formGrid}>
              <FormItem label="航线名称" name="routeName">
                <Input v-model:value={routeForm.routeName} placeholder="请输入航线名称" maxlength={80} />
              </FormItem>
              <FormItem label="航线code" name="routeCode">
                <Input value={routeForm.routeCode || "保存后由后端生成"} disabled />
              </FormItem>
              <FormItem label="无人机设备" name="deviceId">
                <div style={{ display: "flex", gap: "8px" }}>
                  <Select
                    style={{ flex: 1 }}
                    value={routeForm.deviceId}
                    options={
                      routeForm.deviceId ? [{ label: routeForm.deviceName || String(routeForm.deviceId), value: routeForm.deviceId }] : []
                    }
                    open={false}
                    showArrow={false}
                    allowClear={false}
                    placeholder="请选择无人机设备"
                  />
                  {!isReadonly.value && (
                    <Button type="primary" onClick={() => droneDeviceModalRef.value?.openModal()}>
                      选择设备
                    </Button>
                  )}
                </div>
              </FormItem>
            </div>
          </div>
          <div class={styles.formSection}>
            <div class={styles.sectionTitle}>飞行参数</div>
            <div class={styles.formGrid}>
              <FormItem label="飞行高度(m)" name="flightHeightM">
                <InputNumber v-model:value={routeForm.flightHeightM} min={0} precision={2} class={styles.fullControl} />
              </FormItem>
              <FormItem label="飞行速度(m/s)" name="flightSpeedMps">
                <InputNumber v-model:value={routeForm.flightSpeedMps} min={0} precision={2} class={styles.fullControl} />
              </FormItem>
              <FormItem label="电量返航阈值(%)" name="returnBatteryThreshold">
                <InputNumber v-model:value={routeForm.returnBatteryThreshold} min={0} max={100} precision={0} class={styles.fullControl} />
              </FormItem>
              <FormItem label="安全起飞高度(m)" name="safeTakeoffHeightM">
                <InputNumber v-model:value={routeForm.safeTakeoffHeightM} min={0} precision={2} class={styles.fullControl} />
              </FormItem>
              <FormItem label="返航高度(m)" name="rthAltitudeM">
                <InputNumber v-model:value={routeForm.rthAltitudeM} min={0} precision={0} class={styles.fullControl} />
              </FormItem>
            </div>
          </div>
          <div class={styles.formSection}>
            <div class={styles.sectionTitle}>备注</div>
            <FormItem label="备注" name="remark">
              <Textarea v-model:value={routeForm.remark} rows={3} maxlength={300} showCount placeholder="请输入备注" />
            </FormItem>
          </div>
        </Form>
      );

      const renderWaypointEditor = (): JSX.Element => {
        const waypoint = currentWaypoint.value;
        return (
          <div class={styles.waypointEditor}>
            <div class={styles.mapPanel}>
              <DroneGisMap
                track={routeTrack.value}
                showTrack
                showObjects={false}
                compact
                focusPoint={focusPoint.value}
                selectingPoint={isSelectingMapPoint.value}
                autoFitOnUpdate={false}
                onPointSelect={handleMapPointSelect}
              />
            </div>
            <div class={styles.waypointList}>
              <div class={styles.waypointListHeader}>
                <span>航点列表</span>
                {!isReadonly.value && (
                  <Button type="primary" size="small" v-slots={{ icon: () => <PlusOutlined /> }} onClick={startCreateWaypoint}>
                    新增点位
                  </Button>
                )}
              </div>
              {isSelectingMapPoint.value && (
                <div class={styles.selectionHint}>
                  <span>{pendingMapPointSelection.value?.type === "create" ? "请在地图上标记新航点" : "请在地图上重选航点位置"}</span>
                  <Button type="link" size="small" onClick={cancelMapPointSelection}>
                    取消
                  </Button>
                </div>
              )}
              <div class={styles.waypointItems}>
                {routeForm.waypoints.map((item, index) => (
                  <div
                    key={item.rowKey}
                    class={[
                      styles.waypointItem,
                      index === selectedWaypointIndex.value ? styles.activeWaypoint : "",
                      isReadonly.value ? styles.readonlyWaypointItem : "",
                      draggingWaypointKey.value === item.rowKey ? styles.draggingWaypoint : "",
                    ]}
                    draggable={!isReadonly.value}
                    onDragstart={(event: DragEvent) => handleWaypointDragStart(index, event)}
                    onDragover={handleWaypointDragOver}
                    onDrop={(event: DragEvent) => handleWaypointDrop(index, event)}
                    onDragend={clearWaypointDrag}
                  >
                    {!isReadonly.value && (
                      <span class={styles.waypointDragHandle} title="拖动排序">
                        <HolderOutlined />
                      </span>
                    )}
                    <button
                      type="button"
                      class={styles.waypointItemMain}
                      onClick={() => {
                        selectedWaypointIndex.value = index;
                      }}
                    >
                      <span class={styles.waypointIndex}>{index + 1}</span>
                      <span class={styles.waypointInfo}>
                        <strong>{item.waypointName || `航点${index + 1}`}</strong>
                        <em>
                          {hasExecutablePoint(item) ? "可执行" : "待补坐标"}
                          {item.photoEnabled ? " / 拍照" : ""}
                          {item.recordEnabled ? " / 录像" : ""}
                        </em>
                      </span>
                    </button>
                    {!isReadonly.value && (
                      <PopConfirm title="确认移除该航点？" onConfirm={() => removeWaypoint(index)}>
                        <Button class={styles.waypointDeleteButton} type="link" size="small" danger title="删除航点">
                          <DeleteOutlined />
                        </Button>
                      </PopConfirm>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div class={styles.waypointDetail}>
              {waypoint ? (
                <>
                  <div class={styles.waypointDetailHeader}>
                    <div>
                      <strong>{waypoint.waypointName || `航点${selectedWaypointIndex.value + 1}`}</strong>
                      <span>第 {selectedWaypointIndex.value + 1} 个航点</span>
                    </div>
                  </div>
                  <div class={styles.pointFormGrid}>
                    <FormItem label="航点名称">
                      <Input v-model:value={waypoint.waypointName} disabled={isReadonly.value} placeholder="请输入航点名称" />
                    </FormItem>
                    <FormItem label="执行顺序">
                      <InputNumber v-model:value={waypoint.seqNo} disabled class={styles.fullControl} />
                    </FormItem>
                    <FormItem label="地图经度">
                      <InputNumber v-model:value={waypoint.mapLng} disabled={isReadonly.value} precision={8} class={styles.fullControl} />
                    </FormItem>
                    <FormItem label="地图纬度">
                      <InputNumber v-model:value={waypoint.mapLat} disabled={isReadonly.value} precision={8} class={styles.fullControl} />
                    </FormItem>
                    <FormItem label="执行经度">
                      <InputNumber
                        v-model:value={waypoint.actualLng}
                        disabled={isReadonly.value}
                        precision={8}
                        class={styles.fullControl}
                      />
                    </FormItem>
                    <FormItem label="执行纬度">
                      <InputNumber
                        v-model:value={waypoint.actualLat}
                        disabled={isReadonly.value}
                        precision={8}
                        class={styles.fullControl}
                      />
                    </FormItem>
                    <FormItem label="执行高度(m)">
                      <InputNumber
                        v-model:value={waypoint.actualHeight}
                        disabled={isReadonly.value}
                        min={0}
                        precision={2}
                        class={styles.fullControl}
                      />
                    </FormItem>
                    <FormItem label="相机类型">
                      <Select v-model:value={waypoint.cameraType} disabled={isReadonly.value} options={cameraTypeOptions} />
                    </FormItem>
                  </div>
                  {!isReadonly.value && (
                    <div class={styles.inlineActions}>
                      <Button onClick={startUpdateWaypointPoint}>在地图上选点</Button>
                      <Button onClick={syncActualWithMap}>同步地图坐标到执行坐标</Button>
                    </div>
                  )}
                  <div class={styles.actionGrid}>
                    <div class={styles.actionItem}>
                      <span>拍照</span>
                      <Switch
                        v-model:checked={waypoint.photoEnabled}
                        disabled={isReadonly.value}
                        checkedChildren="开"
                        unCheckedChildren="关"
                      />
                    </div>
                    <div class={styles.actionItem}>
                      <span>录像</span>
                      <Switch
                        v-model:checked={waypoint.recordEnabled}
                        disabled={isReadonly.value}
                        checkedChildren="开"
                        unCheckedChildren="关"
                      />
                    </div>
                  </div>
                  <div class={styles.pointFormGrid}>
                    <FormItem label="云台重置">
                      <Select
                        v-model:value={waypoint.gimbalResetMode}
                        disabled={isReadonly.value}
                        options={gimbalResetOptions}
                        allowClear
                      />
                    </FormItem>
                    <FormItem label="变焦倍数">
                      <InputNumber
                        v-model:value={waypoint.zoomFactor}
                        disabled={isReadonly.value}
                        min={0}
                        precision={2}
                        class={styles.fullControl}
                      />
                    </FormItem>
                    <FormItem label="录像时长(s)">
                      <InputNumber
                        v-model:value={waypoint.recordDurationSeconds}
                        disabled={isReadonly.value || !waypoint.recordEnabled}
                        min={1}
                        precision={0}
                        class={styles.fullControl}
                      />
                    </FormItem>
                  </div>
                  <FormItem label="航点备注">
                    <Textarea
                      v-model:value={waypoint.remark}
                      disabled={isReadonly.value}
                      rows={3}
                      maxlength={200}
                      showCount
                      placeholder="请输入航点备注"
                    />
                  </FormItem>
                </>
              ) : (
                <div class={styles.emptyWaypoint}>{isReadonly.value ? "暂无航点" : "暂无航点，请新增点位后在地图上标记位置"}</div>
              )}
            </div>
          </div>
        );
      };

      const renderPageFooter = (): JSX.Element => (
        <div class={styles.pageFooter}>
          <Button onClick={backToList}>返回</Button>
          {isReadonly.value ? (
            <Button type="primary" onClick={editCurrentRoute}>
              编辑
            </Button>
          ) : (
            <>
              <Button
                loading={submitLoading.value}
                onClick={() => {
                  routeForm.status = "DRAFT";
                  void submitRoute("DRAFT");
                }}
              >
                保存草稿
              </Button>
              <Button
                type="primary"
                loading={submitLoading.value}
                onClick={() => {
                  routeForm.status = "ENABLED";
                  void submitRoute("ENABLED");
                }}
              >
                保存并启用
              </Button>
            </>
          )}
        </div>
      );

      return (): JSX.Element => (
        <>
          <CubeLayout
            title={options.title}
            v-slots={{
              "layout-content": () => (
                <div class={styles.editorContent}>
                  {detailLoading.value ? (
                    <div class={styles.loadingText}>加载中...</div>
                  ) : (
                    <>
                      <div class={styles.summaryBar}>
                        <div>
                          <span>航线code</span>
                          <strong>{routeForm.routeCode || "--"}</strong>
                        </div>
                        <div>
                          <span>航点数量</span>
                          <strong>{routeForm.waypoints.length}</strong>
                        </div>
                        <div>
                          <span>当前状态</span>
                          <strong>{routeStatusMeta[routeForm.status]?.text ?? "--"}</strong>
                        </div>
                      </div>
                      <Tabs
                        activeKey={activeTab.value}
                        onChange={(key) => {
                          activeTab.value = String(key);
                        }}
                      >
                        <TabPane key="basic" tab="基础信息">
                          {renderBasicForm()}
                        </TabPane>
                        <TabPane key="waypoints" tab={`航点编辑(${routeForm.waypoints.length})`}>
                          {renderWaypointEditor()}
                        </TabPane>
                      </Tabs>
                    </>
                  )}
                </div>
              ),
              "footer-page": () => renderPageFooter(),
            }}
            showTableXScroll
          />
          {!isReadonly.value && (
            <DeviceModalTable
              ref={droneDeviceModalRef}
              title="选择无人机设备"
              value={
                routeForm.deviceId ? [{ id: String(routeForm.deviceId), name: routeForm.deviceName || String(routeForm.deviceId) }] : []
              }
              searchParams={{}}
              applicationCode={DRONE_APPLICATION_CODE}
              filterTagCodes={[DRONE_APPLICATION_TAG]}
              securityDevice
              multiple={false}
              onOk={handleRouteDeviceSelected}
            />
          )}
        </>
      );
    },
  });

export const DroneInspectionRouteCreate = createRouteEditorPage({
  name: "DroneInspectionRouteCreate",
  title: "新增航线",
  pageType: "create",
  readonly: false,
});

export const DroneInspectionRouteEdit = createRouteEditorPage({
  name: "DroneInspectionRouteEdit",
  title: "编辑航线",
  pageType: "edit",
  readonly: false,
});

export const DroneInspectionRoutePreview = createRouteEditorPage({
  name: "DroneInspectionRoutePreview",
  title: "航线预览",
  pageType: "preview",
  readonly: true,
});
