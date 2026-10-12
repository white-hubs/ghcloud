import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import {
  Alert,
  Button,
  Empty,
  Input,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReloadOutlined,
  Space,
  Spin,
  Tag,
  Tree,
  message,
} from "@ghcloud/cube-ui";

import { RealtimeMap } from "../realtime-map/realtime-map";
import { positioningApi, type ApiLocation } from "@/api/positioning";
import { USE_MOCK } from "@/constants/env";
import { IOT_PROPERTIES } from "@/constants/iot-properties";
import { ONLINE_STATES, PERSON_SOURCES, POSITIONING_DEVICE_TYPES } from "@/constants/positioning";
import { LOCATION_FILTERS, OUTDOOR_SCENE_ID, OUTDOOR_SCENE_NAME } from "@/constants/realtime";
import { useAreaBackground } from "@/hooks/use-area-background";
import { useSystemAreas } from "@/hooks/use-system-areas";
import type { LocationFilter } from "@/models/realtime";
import { usePositioningStore } from "@/stores/positioning";
import { useRealtimeStore } from "@/stores/realtime";
import { projectFloorCoordinate } from "@/utils/floor-coordinate";
import { formatDateTime, normalizeDateTime } from "@/utils/positioning";
import { currentLocations, isOngoingAlarm, positionCoordinateText } from "@/utils/realtime";
import { filterSystemAreaTree } from "@/utils/system-areas";
import { DevicePropertySocket, type DevicePropertyUpdate } from "@/utils/terminal-property-socket";

import "./realtime-location.less";

const outdoorMap = new URL("../../../assets/outdoor-map-demo.svg", import.meta.url).href;
const terminalStatus = (online: boolean | undefined): string => (online === undefined ? "未知" : online ? "在线" : "离线");
type StatScope = "all" | "people" | "stations";
const PEOPLE_STAT_LABELS = { all: "总数", online: "在线", offline: "离线", alarm: "告警" } as const;
const STATION_STAT_LABELS = { all: "总数", online: "在线", offline: "离线" } as const;

export const RealtimeLocation = defineComponent({
  name: "RealtimeLocation",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const positioning = usePositioningStore();
    const store = useRealtimeStore();
    const areas = useSystemAreas();
    const pageRef = ref<HTMLElement | null>(null);
    const collapsed = ref(false);
    const expandedKeys = ref<string[]>([]);
    const areaSearchInput = ref("");
    const areaKeyword = computed(() => areaSearchInput.value.trim());
    const areaSearch = computed(() => filterSystemAreaTree(areas.tree.value, areaKeyword.value));
    const searchExpandedKeys = ref<string[]>([]);
    const visibleAreaExpandedKeys = computed(() => (areaKeyword.value ? searchExpandedKeys.value : expandedKeys.value));
    watch(areaSearch, (result) => {
      searchExpandedKeys.value = result.expandedKeys;
    });
    const sceneId = computed(() => String(route.query.scene ?? OUTDOOR_SCENE_ID));
    const sceneName = computed(() =>
      sceneId.value === OUTDOOR_SCENE_ID
        ? OUTDOOR_SCENE_NAME
        : (areas.byId.value.get(sceneId.value)?.path ??
          positioning.state.realtimeLocations?.find((item) => item.sceneId === sceneId.value)?.scene ??
          (areas.loading.value ? "正在加载区域" : "未找到所选区域")),
    );
    const keyword = computed(() => String(route.query.keyword ?? ""));
    const status = computed<LocationFilter>(() =>
      Object.hasOwn(LOCATION_FILTERS, String(route.query.status)) ? (route.query.status as LocationFilter) : "all",
    );
    const statScope = computed<StatScope>(() => {
      const scope = String(route.query.scope ?? "all");
      return scope === "people" || scope === "stations" ? scope : "all";
    });
    const searchInput = ref(keyword.value);
    const selectedPersonId = ref("");
    const selectedTerminalId = ref("");
    const terminalTargets = ref<string[]>([]);
    const terminalSnapshots = ref<ApiLocation[]>([]);
    const terminalLoading = ref(false);
    const terminalMode = computed(() => !USE_MOCK && sceneId.value !== OUTDOOR_SCENE_ID);
    let socket: DevicePropertySocket | undefined;
    let snapshotTimer: ReturnType<typeof setTimeout> | undefined;
    let snapshotRefresh: ReturnType<typeof setInterval> | undefined;
    let snapshotVersion = 0;
    const socketCoordinateAt = new Map<string, number>();
    const socketFloorAt = new Map<string, { floorId: string; receivedAt: number }>();
    const imageFailed = ref(false);
    const refreshedAt = ref("");
    const resetVersion = ref(0);
    function updateViewportTop(): void {
      const page = pageRef.value;
      if (page) {
        page.style.setProperty("--pp-realtime-viewport-top", `${Math.max(0, page.getBoundingClientRect().top)}px`);
      }
    }
    onBeforeUnmount(() => {
      window.removeEventListener("resize", updateViewportTop);
      if (snapshotTimer) clearTimeout(snapshotTimer);
      if (snapshotRefresh) clearInterval(snapshotRefresh);
      socket?.stop();
    });

    const locations = computed(() => currentLocations(positioning.state).filter((item) => item.sceneId === sceneId.value));
    const isIndoor = computed(() => sceneId.value !== OUTDOOR_SCENE_ID);
    const alarms = computed(() => store.state.alarms.filter((item) => item.sceneId === sceneId.value && isOngoingAlarm(item)));
    const alarmPersonIds = computed(() => new Set(alarms.value.flatMap((item) => (item.personId ? [item.personId] : []))));
    const peopleSnapshots = computed(() => [
      ...new Map(
        terminalSnapshots.value
          .filter((item) => item.deviceType !== POSITIONING_DEVICE_TYPES.station && item.positioningPersonId)
          .map((item) => [item.positioningPersonId!, item] as const),
      ).values(),
    ]);
    const peopleCounts = computed(() =>
      terminalMode.value
        ? {
            all: peopleSnapshots.value.length,
            online: peopleSnapshots.value.filter((item) => item.online === true).length,
            offline: peopleSnapshots.value.filter((item) => item.online === false).length,
            alarm: peopleSnapshots.value.filter((item) => alarmPersonIds.value.has(item.positioningPersonId!)).length,
          }
        : {
            all: locations.value.length,
            online: locations.value.filter((item) => item.terminal.online === "online").length,
            offline: locations.value.filter((item) => item.terminal.online === "offline").length,
            alarm: locations.value.filter((item) => alarmPersonIds.value.has(item.person.id)).length,
          },
    );
    const stationCounts = computed(() => {
      const stations = terminalSnapshots.value.filter((item) => item.deviceType === POSITIONING_DEVICE_TYPES.station);
      return {
        all: stations.length,
        online: stations.filter((item) => item.online === true).length,
        offline: stations.filter((item) => item.online === false).length,
      };
    });
    const filteredLocations = computed(() =>
      locations.value.filter((item) => {
        const matchesKeyword =
          !keyword.value ||
          [item.person.name, item.person.personNumber || item.person.id, item.terminal.deviceNumber || item.terminal.id].some((value) =>
            value.toLowerCase().includes(keyword.value.toLowerCase()),
          );
        const matchesStatus =
          status.value === "all" ||
          (status.value === "alarm" ? alarmPersonIds.value.has(item.person.id) : item.terminal.online === status.value);
        return matchesKeyword && matchesStatus;
      }),
    );
    const areaBackground = useAreaBackground(sceneId, areas.byId);
    const filteredTerminals = computed(() =>
      terminalSnapshots.value.filter((item) => {
        const matchesScope =
          statScope.value === "all" ||
          (statScope.value === "stations"
            ? item.deviceType === POSITIONING_DEVICE_TYPES.station
            : item.deviceType !== POSITIONING_DEVICE_TYPES.station && Boolean(item.positioningPersonId));
        const matchesKeyword =
          !keyword.value ||
          [item.personName, item.deviceNumber, item.deviceName, item.iotDeviceId].some((value) =>
            value?.toLowerCase().includes(keyword.value.toLowerCase()),
          );
        const matchesStatus =
          status.value === "all" ||
          (status.value === "alarm"
            ? Boolean(item.positioningPersonId && alarmPersonIds.value.has(item.positioningPersonId))
            : item.online === (status.value === "online"));
        return matchesScope && matchesKeyword && matchesStatus;
      }),
    );
    const mapTerminals = computed(() =>
      filteredTerminals.value.map((item) => ({
        id: item.positioningDeviceId,
        deviceType: item.deviceType ?? POSITIONING_DEVICE_TYPES.terminal,
        label: item.personName || item.deviceNumber || item.deviceName || item.iotDeviceId || item.positioningDeviceId,
        online: item.online,
        ...(item.personName ? { personName: item.personName } : {}),
        ...(item.positioningPersonId ? { personId: item.positioningPersonId } : {}),
        coordinate: projectFloorCoordinate({ x: item.coordinateX ?? NaN, y: item.coordinateY ?? NaN }, areaBackground.axis.value),
      })),
    );
    const selectedTerminal = computed(() => terminalSnapshots.value.find((item) => item.positioningDeviceId === selectedTerminalId.value));
    const mapLocations = computed(() =>
      isIndoor.value
        ? filteredLocations.value.map((item) => ({
            ...item,
            coordinate: projectFloorCoordinate(item.point, areaBackground.axis.value),
          }))
        : filteredLocations.value,
    );
    const selectedPerson = computed(() => mapLocations.value.find((item) => item.person.id === selectedPersonId.value));
    const backgroundUrl = computed(() => (sceneId.value === OUTDOOR_SCENE_ID ? outdoorMap : areaBackground.url.value));
    const hasMap = computed(() => Boolean(backgroundUrl.value) && !imageFailed.value);
    const mapEmptyText = computed(() => {
      if (imageFailed.value) {
        return "地图加载失败，请重试";
      }
      if (areaBackground.loading.value) {
        return "正在加载楼层平面图";
      }
      if (areaBackground.error.value) {
        return areaBackground.error.value;
      }
      if (areas.loading.value) {
        return "正在加载区域";
      }
      return areas.error.value || "当前区域尚未配置楼层平面图";
    });
    const hasFilters = computed(() =>
      Boolean(keyword.value || status.value !== "all" || (terminalMode.value && statScope.value !== "all")),
    );

    function clearSelection(): void {
      selectedPersonId.value = "";
      selectedTerminalId.value = "";
    }

    function syncSocketTargets(): void {
      socket?.setTargets(
        terminalTargets.value,
        terminalMode.value ? terminalSnapshots.value.map((item) => item.iotDeviceId).filter((id): id is string => Boolean(id)) : [],
      );
    }

    async function loadTerminalTargets(): Promise<void> {
      if (USE_MOCK) return;
      terminalTargets.value = await positioningApi.deviceTargets();
      syncSocketTargets();
    }

    async function loadTerminalSnapshot(id: string): Promise<void> {
      if (USE_MOCK || id === OUTDOOR_SCENE_ID || areaBackground.loadedId.value !== id || !areaBackground.floorId.value) return;
      const version = ++snapshotVersion;
      const requestedAt = Date.now();
      terminalLoading.value = true;
      try {
        const result = await positioningApi.realtimeDevices(id);
        if (version !== snapshotVersion || sceneId.value !== id) return;
        const currentFloorId = areaBackground.floorId.value;
        const currentByIotId = new Map(terminalSnapshots.value.map((item) => [item.iotDeviceId, item]));
        terminalSnapshots.value = result
          .filter((item) => {
            const change = item.iotDeviceId ? socketFloorAt.get(item.iotDeviceId) : undefined;
            return !change || change.receivedAt <= requestedAt || change.floorId === currentFloorId;
          })
          .map((item) => {
            const current = currentByIotId.get(item.iotDeviceId);
            if (!item.iotDeviceId || !current || (socketCoordinateAt.get(item.iotDeviceId) ?? 0) <= requestedAt) return item;
            const merged = { ...item };
            delete merged.coordinateX;
            delete merged.coordinateY;
            delete merged.coordinateZ;
            delete merged.coordinateType;
            if (current.coordinateX !== undefined) merged.coordinateX = current.coordinateX;
            if (current.coordinateY !== undefined) merged.coordinateY = current.coordinateY;
            if (current.coordinateZ !== undefined) merged.coordinateZ = current.coordinateZ;
            if (current.coordinateType !== undefined) merged.coordinateType = current.coordinateType;
            if (current.locationTime !== undefined) merged.locationTime = current.locationTime;
            else delete merged.locationTime;
            return merged;
          });
        syncSocketTargets();
        refreshedAt.value = new Date().toLocaleTimeString("zh-CN", { hour12: false });
      } finally {
        if (version === snapshotVersion) terminalLoading.value = false;
      }
    }

    function scheduleSnapshot(): void {
      if (snapshotTimer) clearTimeout(snapshotTimer);
      snapshotTimer = setTimeout(() => {
        snapshotTimer = undefined;
        void loadTerminalSnapshot(sceneId.value).catch((error: unknown) => message.error((error as Error).message));
      }, 300);
    }

    function applyPropertyUpdates(updates: DevicePropertyUpdate[]): void {
      const floorChanges = updates.filter((update) => update.code === IOT_PROPERTIES.floorId);
      for (const update of floorChanges) socketFloorAt.set(update.deviceId, { floorId: String(update.value), receivedAt: Date.now() });
      const currentFloorId = areaBackground.floorId.value;
      if (currentFloorId && floorChanges.length) {
        const currentIds = new Set(terminalSnapshots.value.map((item) => item.iotDeviceId));
        const leaving = new Set(
          floorChanges
            .filter((update) => currentIds.has(update.deviceId) && String(update.value) !== currentFloorId)
            .map((update) => update.deviceId),
        );
        const entering = floorChanges.some((update) => !currentIds.has(update.deviceId) && String(update.value) === currentFloorId);
        if (leaving.size)
          terminalSnapshots.value = terminalSnapshots.value.filter((item) => !item.iotDeviceId || !leaving.has(item.iotDeviceId));
        if (leaving.size || entering) {
          syncSocketTargets();
          scheduleSnapshot();
        }
      }
      const byDevice = new Map<string, DevicePropertyUpdate[]>();
      for (const update of updates) {
        if (update.code === IOT_PROPERTIES.floorId) continue;
        socketCoordinateAt.set(update.deviceId, Date.now());
        byDevice.set(update.deviceId, [...(byDevice.get(update.deviceId) ?? []), update]);
      }
      if (!byDevice.size) return;
      terminalSnapshots.value = terminalSnapshots.value.map((item) => {
        const changes = item.iotDeviceId ? byDevice.get(item.iotDeviceId) : undefined;
        if (!changes) return item;
        const next = { ...item };
        let locationTime = Date.parse(normalizeDateTime(next.locationTime)) || 0;
        for (const change of changes) {
          if (change.timestamp && change.timestamp < locationTime) continue;
          if (change.code === IOT_PROPERTIES.validFlag && ["0", "false"].includes(String(change.value).toLowerCase())) {
            delete next.coordinateX;
            delete next.coordinateY;
            delete next.coordinateType;
          } else if (change.code === IOT_PROPERTIES.x || change.code === IOT_PROPERTIES.y || change.code === IOT_PROPERTIES.z) {
            const value = Number(change.value);
            if (!Number.isFinite(value)) continue;
            if (change.code === IOT_PROPERTIES.x) next.coordinateX = value;
            if (change.code === IOT_PROPERTIES.y) next.coordinateY = value;
            if (change.code === IOT_PROPERTIES.z) next.coordinateZ = value;
            if (change.timestamp && change.code !== IOT_PROPERTIES.z) locationTime = Math.max(locationTime, change.timestamp);
          }
        }
        if (locationTime) next.locationTime = new Date(locationTime).toISOString();
        if (next.coordinateX !== undefined && next.coordinateY !== undefined) next.coordinateType = "INDOOR";
        return next;
      });
      refreshedAt.value = new Date().toLocaleTimeString("zh-CN", { hour12: false });
    }
    function updateQuery(values: Record<string, string | undefined>): void {
      void router.replace({ path: "/realtime", query: { ...route.query, type: undefined, ...values } });
    }
    function selectableArea(id: string): string | undefined {
      return areas.byId.value.get(id)?.key;
    }
    let areaTreeInitialized = false;
    async function loadAreas(): Promise<void> {
      if (!(await areas.load())) {
        return;
      }
      expandedKeys.value = areaTreeInitialized
        ? expandedKeys.value.filter((id) => areas.byId.value.has(id))
        : areas.tree.value.filter((node) => node.children.length > 0).map((node) => node.key);
      areaTreeInitialized = true;
      const selectedArea = areas.byId.value.get(sceneId.value);
      if (selectedArea) {
        expandedKeys.value = [...new Set([...expandedKeys.value, ...selectedArea.ancestorIds])];
      } else if (sceneId.value !== OUTDOOR_SCENE_ID) {
        updateQuery({ scene: undefined });
      }
      refreshedAt.value = new Date().toLocaleTimeString("zh-CN", { hour12: false });
    }
    async function refreshData(): Promise<void> {
      await Promise.all([
        positioning.refreshPersons(),
        positioning.refreshDevices("terminal"),
        positioning.refreshRealtime(),
        loadTerminalTargets(),
        loadAreas(),
      ]);
    }
    onMounted(() => {
      updateViewportTop();
      window.addEventListener("resize", updateViewportTop);
      if (!USE_MOCK) {
        socket = new DevicePropertySocket(applyPropertyUpdates, () => {
          void loadTerminalTargets()
            .then(() => loadTerminalSnapshot(sceneId.value))
            .catch((error: unknown) => message.error((error as Error).message));
        });
        snapshotRefresh = setInterval(() => {
          if (!terminalMode.value || document.visibilityState === "hidden") return;
          void loadTerminalTargets()
            .then(() => loadTerminalSnapshot(sceneId.value))
            .catch((error: unknown) => message.error((error as Error).message));
        }, 60_000);
      }
      void refreshData().catch((error: unknown) => message.error((error as Error).message));
    });
    function query(): void {
      clearSelection();
      updateQuery({ keyword: searchInput.value.trim() || undefined });
    }
    function resetFilters(): void {
      searchInput.value = "";
      clearSelection();
      updateQuery({ keyword: undefined, status: undefined, scope: undefined });
    }
    function selectPerson(id: string): void {
      selectedPersonId.value = id;
    }
    function renderStat(scope: StatScope, key: LocationFilter, label: string, count: number, unit: string) {
      return (
        <button
          key={`${scope}-${key}`}
          type="button"
          class={["pp-realtime__stat", `pp-realtime__stat--${key}`, { "is-active": statScope.value === scope && status.value === key }]}
          aria-pressed={statScope.value === scope && status.value === key}
          onClick={() => {
            clearSelection();
            updateQuery({ scope: scope === "all" ? undefined : scope, status: key === "all" ? undefined : key });
          }}
        >
          <span>{label}</span>
          <strong>
            {count}
            <small>{unit}</small>
          </strong>
        </button>
      );
    }

    watch(sceneId, () => {
      clearSelection();
      resetVersion.value++;
      imageFailed.value = false;
      snapshotVersion++;
      terminalSnapshots.value = [];
      syncSocketTargets();
      const ancestors = areas.byId.value.get(sceneId.value)?.ancestorIds ?? [];
      expandedKeys.value = [...new Set([...expandedKeys.value, ...ancestors])];
    });
    watch(areaBackground.loadedId, (id) => {
      if (terminalMode.value && id === sceneId.value && areaBackground.floorId.value) {
        void loadTerminalSnapshot(id).catch((error: unknown) => message.error((error as Error).message));
      }
    });
    watch(backgroundUrl, () => {
      imageFailed.value = false;
    });
    watch(keyword, () => {
      searchInput.value = keyword.value;
    });
    watch(filteredLocations, () => {
      if (selectedPersonId.value && !selectedPerson.value) {
        clearSelection();
      }
    });
    watch(terminalSnapshots, () => {
      if (selectedTerminalId.value && !selectedTerminal.value) selectedTerminalId.value = "";
    });

    return () => (
      <CubeLayout
        title="实时定位"
        showFooter={false}
        v-slots={{
          "layout-header": () => (
            <Space>
              <span class="pp-muted">实时位置{refreshedAt.value ? ` · 已刷新 ${refreshedAt.value}` : ""}</span>
              <Button
                loading={areas.loading.value}
                onClick={() => {
                  imageFailed.value = false;
                  void refreshData().catch((error: unknown) => message.error((error as Error).message));
                }}
              >
                <ReloadOutlined />
                刷新
              </Button>
            </Space>
          ),
          "layout-content": () => (
            <div ref={pageRef} class="pp-realtime">
              <div class={["pp-realtime__body", { "is-collapsed": collapsed.value }]}>
                <aside class="pp-realtime__scenes" aria-label="定位区域">
                  <div class="pp-realtime__scene-header">
                    {!collapsed.value && <strong>定位区域</strong>}
                    <Button
                      type="text"
                      aria-label={collapsed.value ? "展开区域树" : "收起区域树"}
                      onClick={() => {
                        collapsed.value = !collapsed.value;
                      }}
                    >
                      {collapsed.value ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </Button>
                  </div>
                  {!collapsed.value && (
                    <>
                      <div class="pp-realtime__area-search">
                        <Input
                          aria-label="区域名称搜索"
                          placeholder="搜索区域名称"
                          allowClear
                          maxlength={100}
                          showCount={false}
                          v-model:value={areaSearchInput.value}
                        />
                        {areaKeyword.value && !areas.loading.value && !areas.error.value && (
                          <span class="pp-muted" role="status">
                            匹配 {areaSearch.value.matchCount} 个区域
                          </span>
                        )}
                      </div>
                      <div class="pp-realtime__tree">
                        <Button
                          block
                          class="pp-realtime__outdoor"
                          type={sceneId.value === OUTDOOR_SCENE_ID ? "primary" : "default"}
                          onClick={() => updateQuery({ scene: undefined })}
                        >
                          {OUTDOOR_SCENE_NAME}
                        </Button>
                        {areas.error.value && (
                          <div class="pp-realtime__area-status">
                            <Alert type="error" showIcon message={areas.error.value} />
                            <Button size="small" onClick={() => void loadAreas()}>
                              重新加载
                            </Button>
                          </div>
                        )}
                        {areas.loading.value && (
                          <div class="pp-realtime__area-status">
                            <Spin tip="正在加载区域" />
                          </div>
                        )}
                        {!areas.loading.value && areaSearch.value.tree.length > 0 && (
                          <Tree
                            blockNode
                            treeData={areaSearch.value.tree}
                            selectedKeys={areas.byId.value.has(sceneId.value) ? [sceneId.value] : []}
                            expandedKeys={visibleAreaExpandedKeys.value}
                            autoExpandParent={false}
                            {...{
                              "onUpdate:expandedKeys": (keys: (string | number)[]) => {
                                if (areaKeyword.value) {
                                  searchExpandedKeys.value = keys.map(String);
                                } else {
                                  expandedKeys.value = keys.map(String);
                                }
                              },
                            }}
                            onSelect={(keys: (string | number)[]) => {
                              const id = String(keys[0] ?? "");
                              const area = selectableArea(id);
                              if (area && area !== sceneId.value) {
                                updateQuery({ scene: area });
                              }
                            }}
                          />
                        )}
                        {!areas.loading.value && !areas.error.value && areaSearch.value.tree.length === 0 && (
                          <div class="pp-realtime__area-status">
                            <Empty description={areaKeyword.value ? "未找到匹配区域" : "暂无定位区域，请先同步厂家楼层"} />
                            {areaKeyword.value && (
                              <Button
                                size="small"
                                onClick={() => {
                                  areaSearchInput.value = "";
                                }}
                              >
                                清空搜索
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </aside>
                <section class="pp-realtime__center">
                  <div class="pp-realtime__search-row">
                    <strong class="pp-realtime__scene-name" title={sceneName.value}>
                      {sceneName.value}
                    </strong>
                    <form
                      class="pp-realtime__query"
                      onSubmit={(event) => {
                        event.preventDefault();
                        query();
                      }}
                    >
                      <Input
                        aria-label={terminalMode.value ? "设备搜索" : "人员搜索"}
                        maxlength={100}
                        showCount={false}
                        placeholder={terminalMode.value ? "人员姓名 / 设备编号" : "姓名 / 人员编号 / 终端编号"}
                        allowClear
                        v-model:value={searchInput.value}
                      />
                      <Button type="primary" onClick={query}>
                        查询
                      </Button>
                      <Button onClick={resetFilters}>重置</Button>
                    </form>
                  </div>
                  <div class="pp-realtime__stats" role="group" aria-label={terminalMode.value ? "人员与基站统计" : "人员统计"}>
                    {terminalMode.value ? (
                      <>
                        <button
                          type="button"
                          class={["pp-realtime__stats-all", { "is-active": statScope.value === "all" && status.value === "all" }]}
                          aria-pressed={statScope.value === "all" && status.value === "all"}
                          onClick={() => {
                            clearSelection();
                            updateQuery({ scope: undefined, status: undefined });
                          }}
                        >
                          全部设备
                        </button>
                        <div class="pp-realtime__stat-group" role="group" aria-label="人员统计">
                          <span class="pp-realtime__stat-group-title">人员</span>
                          {(Object.keys(PEOPLE_STAT_LABELS) as LocationFilter[]).map((key) =>
                            renderStat("people", key, PEOPLE_STAT_LABELS[key], peopleCounts.value[key], "人"),
                          )}
                        </div>
                        <div class="pp-realtime__stat-group" role="group" aria-label="基站统计">
                          <span class="pp-realtime__stat-group-title">基站</span>
                          {(Object.keys(STATION_STAT_LABELS) as (keyof typeof STATION_STAT_LABELS)[]).map((key) =>
                            renderStat("stations", key, STATION_STAT_LABELS[key], stationCounts.value[key], "台"),
                          )}
                        </div>
                      </>
                    ) : (
                      (Object.keys(LOCATION_FILTERS) as LocationFilter[]).map((key) =>
                        renderStat("all", key, LOCATION_FILTERS[key].label, peopleCounts.value[key], "人"),
                      )
                    )}
                  </div>
                  {terminalMode.value && areaBackground.loadedId.value === sceneId.value && !areaBackground.floorId.value && (
                    <Alert type="warning" showIcon message="所选定位区域未关联楼层 ID，无法查询设备位置" />
                  )}
                  {hasMap.value && terminalMode.value && !areaBackground.axis.value && filteredTerminals.value.length > 0 ? (
                    <Alert type="warning" showIcon message="楼层平面图未配置有效二维坐标系，无法绘制设备位置" />
                  ) : hasMap.value &&
                    (terminalMode.value
                      ? mapTerminals.value.some((item) => !item.coordinate)
                      : mapLocations.value.some((item) => !item.coordinate)) ? (
                    <Alert type="warning" showIcon message="部分位置无有效坐标或超出地图范围，暂时无法显示" />
                  ) : null}
                  <div class="pp-realtime__map-workspace">
                    {hasMap.value ? (
                      <>
                        <RealtimeMap
                          sceneName={sceneName.value}
                          backgroundUrl={backgroundUrl.value}
                          preserveImageRatio={terminalMode.value}
                          locations={terminalMode.value ? [] : mapLocations.value}
                          devices={terminalMode.value ? mapTerminals.value : []}
                          alarms={alarms.value}
                          selectedPersonId={selectedPersonId.value}
                          selectedDeviceId={selectedTerminalId.value}
                          resetVersion={resetVersion.value}
                          onSelectPerson={selectPerson}
                          onSelectDevice={(id: string) => {
                            selectedTerminalId.value = id;
                          }}
                          onClear={clearSelection}
                          onImageError={() => {
                            imageFailed.value = true;
                          }}
                        />
                        {!(terminalMode.value ? filteredTerminals.value.length : filteredLocations.value.length) && (
                          <div class="pp-realtime__map-empty">
                            {terminalMode.value
                              ? hasFilters.value
                                ? "没有符合筛选条件的设备"
                                : "当前楼层暂无设备位置"
                              : hasFilters.value
                                ? "没有符合筛选条件的人员"
                                : "当前场景暂无人员位置"}
                            {hasFilters.value && (
                              <Button size="small" type="link" onClick={resetFilters}>
                                清除筛选
                              </Button>
                            )}
                          </div>
                        )}
                      </>
                    ) : areaBackground.loading.value || terminalLoading.value ? (
                      <div class="pp-realtime__empty">
                        <Spin tip="正在加载楼层平面图" />
                      </div>
                    ) : terminalMode.value && filteredTerminals.value.length ? (
                      <div class="pp-realtime__indoor-list">
                        <div class="pp-realtime__indoor-tip">{mapEmptyText.value}，以下展示楼层设备。</div>
                        {filteredTerminals.value.map((item) => (
                          <button
                            type="button"
                            class={["pp-realtime__indoor-item", { "is-selected": selectedTerminalId.value === item.positioningDeviceId }]}
                            onClick={() => {
                              selectedTerminalId.value = item.positioningDeviceId;
                            }}
                          >
                            <div class="pp-realtime__person-heading">
                              <strong>{item.personName || item.deviceName || item.deviceNumber || item.iotDeviceId}</strong>
                              <Tag color={item.online ? "blue" : "default"}>{terminalStatus(item.online)}</Tag>
                            </div>
                            <span>
                              {item.deviceType === POSITIONING_DEVICE_TYPES.station ? "基站" : "终端"}编号：{item.deviceNumber || "—"}
                            </span>
                            <span>楼层：{item.floorName || "—"}</span>
                            <span>
                              坐标：{item.coordinateX ?? "—"}，{item.coordinateY ?? "—"}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : !terminalMode.value && isIndoor.value && filteredLocations.value.length ? (
                      <div class="pp-realtime__indoor-list">
                        <div class="pp-realtime__indoor-tip">{mapEmptyText.value}，以下展示人员位置。</div>
                        {filteredLocations.value.map((item) => (
                          <button
                            type="button"
                            class={["pp-realtime__indoor-item", { "is-selected": selectedPersonId.value === item.person.id }]}
                            onClick={() => selectPerson(item.person.id)}
                          >
                            <div class="pp-realtime__person-heading">
                              <strong>{item.person.name}</strong>
                              <Tag color={ONLINE_STATES[item.terminal.online].color}>{ONLINE_STATES[item.terminal.online].label}</Tag>
                            </div>
                            <span>{item.person.personNumber || item.person.id}</span>
                            <span>
                              {item.point.buildingName || "未识别楼栋"} · {item.point.floorName || "未识别楼层"}
                            </span>
                            <span>{positionCoordinateText(item.point)}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div class="pp-realtime__empty">
                        <Empty description={mapEmptyText.value} />
                      </div>
                    )}
                  </div>
                </section>
                <aside class="pp-realtime__sidebar" aria-label="定位信息">
                  <div class="pp-realtime__sidebar-title">
                    <strong>{terminalMode.value ? "设备详情" : "人员详情"}</strong>
                    {(terminalMode.value ? selectedTerminal.value : selectedPerson.value) && (
                      <Button type="link" size="small" onClick={clearSelection}>
                        清空选择
                      </Button>
                    )}
                  </div>
                  <div class="pp-realtime__sidebar-content">
                    {terminalMode.value && selectedTerminal.value ? (
                      <div class="pp-realtime__person-detail">
                        <div class="pp-realtime__person-heading">
                          <strong>
                            {selectedTerminal.value.personName ||
                              selectedTerminal.value.deviceName ||
                              selectedTerminal.value.deviceNumber ||
                              (selectedTerminal.value.deviceType === POSITIONING_DEVICE_TYPES.station ? "定位基站" : "定位终端")}
                          </strong>
                          <Tag color={selectedTerminal.value.online ? "blue" : "default"}>
                            {terminalStatus(selectedTerminal.value.online)}
                          </Tag>
                        </div>
                        <dl>
                          <dt>设备类型</dt>
                          <dd>{selectedTerminal.value.deviceType === POSITIONING_DEVICE_TYPES.station ? "定位基站" : "定位终端"}</dd>
                          <dt>设备编号</dt>
                          <dd>{selectedTerminal.value.deviceNumber || "—"}</dd>
                          {selectedTerminal.value.deviceType !== POSITIONING_DEVICE_TYPES.station && (
                            <>
                              <dt>绑定人员</dt>
                              <dd>{selectedTerminal.value.personName || "未绑定"}</dd>
                            </>
                          )}
                          <dt>楼栋 / 楼层</dt>
                          <dd>
                            {selectedTerminal.value.buildingName || "—"} / {selectedTerminal.value.floorName || "—"}
                          </dd>
                          <dt>位置坐标</dt>
                          <dd>
                            X {selectedTerminal.value.coordinateX ?? "—"}，Y {selectedTerminal.value.coordinateY ?? "—"}
                          </dd>
                          <dt>最后更新</dt>
                          <dd>{formatDateTime(selectedTerminal.value.locationTime)}</dd>
                        </dl>
                        {selectedTerminal.value.deviceType !== POSITIONING_DEVICE_TYPES.station &&
                          selectedTerminal.value.positioningPersonId && (
                            <Button
                              block
                              type="primary"
                              onClick={() =>
                                router.push({
                                  name: "trajectory",
                                  params: { id: selectedTerminal.value!.positioningPersonId },
                                  query: { from: "realtime", returnTo: route.fullPath },
                                })
                              }
                            >
                              历史轨迹
                            </Button>
                          )}
                      </div>
                    ) : selectedPerson.value && !terminalMode.value ? (
                      <div class="pp-realtime__person-detail">
                        <div class="pp-realtime__person-heading">
                          <span class="pp-person-avatar">{selectedPerson.value.person.name.slice(-1)}</span>
                          <strong>{selectedPerson.value.person.name}</strong>
                          <Tag color={ONLINE_STATES[selectedPerson.value.terminal.online].color}>
                            {ONLINE_STATES[selectedPerson.value.terminal.online].label}
                          </Tag>
                        </div>
                        <dl>
                          <dt>人员编号</dt>
                          <dd>{selectedPerson.value.person.personNumber || selectedPerson.value.person.id}</dd>
                          <dt>人员类型</dt>
                          <dd>{PERSON_SOURCES[selectedPerson.value.person.source].personType}</dd>
                          <dt>人员来源</dt>
                          <dd>{PERSON_SOURCES[selectedPerson.value.person.source].label}</dd>
                          <dt>所属组织</dt>
                          <dd>{selectedPerson.value.person.organization}</dd>
                          <dt>绑定终端</dt>
                          <dd>{selectedPerson.value.terminal.deviceNumber || selectedPerson.value.terminal.id}</dd>
                          <dt>楼栋 / 楼层</dt>
                          <dd>
                            {selectedPerson.value.point.buildingName || "—"} / {selectedPerson.value.point.floorName || "—"}
                          </dd>
                          <dt>位置坐标</dt>
                          <dd>{positionCoordinateText(selectedPerson.value.point)}</dd>
                          <dt>最后更新</dt>
                          <dd>{formatDateTime(selectedPerson.value.point.at)}</dd>
                        </dl>
                        <Button
                          block
                          type="primary"
                          onClick={() =>
                            router.push({
                              name: "trajectory",
                              params: { id: selectedPersonId.value },
                              query: { from: "realtime", returnTo: route.fullPath },
                            })
                          }
                        >
                          历史轨迹
                        </Button>
                      </div>
                    ) : (
                      <Empty description={terminalMode.value ? "选择设备查看详情" : "选择人员查看详情"} />
                    )}
                  </div>
                </aside>
              </div>
            </div>
          ),
        }}
      />
    );
  },
});
