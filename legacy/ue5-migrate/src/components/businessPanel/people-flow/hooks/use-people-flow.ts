import { message } from "ant-design-vue";
import { ref, type Ref } from "vue";

import { DevicePageInfoVO, TrafficDetectionAreaVisualVO, TrafficDetectionDeviceStatVO } from "@ghcloud/cube-traffic-detection-service";

import { trafficStore } from "../store/traffic";
import { cubeDeviceCenterService, cubeTrafficStatisticsService } from "@/api/service";
import { eventInstance } from "@/pages/event/event";
import { modelSDK } from "@/pages/model-sdk/sdk";
import { useStateStore } from "@/pages/state/use-state-store";

/** 最后一块 coordPointsHeatMap 下发后再延迟隐藏固定热力图 Layer，给 UE 留出创建时间 */
const HEATMAP_HIDE_AFTER_RENDER_BUFFER_MS = 800;
/** UE 热力图 Layer 显隐防抖时间（模型响应偏慢，使用较长防抖） */
const UE_HEATMAP_LAYER_VISIBILITY_DEBOUNCE_MS = 2500;

/** UE 场景中人流量热力图 Actor 的 id（hideActor/showActor 使用去掉「ID:」后的真实 id） */
export const UE_PEOPLE_FLOW_HEATMAP_ACTOR_IDS: readonly string[] = [
  "heatmap_3_1F_1",
  "heatmap_3_1F_2",
  "heatmap_3_1F_3",
  "heatmap_3_1F_4",
  "heatmap_2_1F_1",
  "heatmap_2_1F_2",
  "heatmap_2_1F_3",
  "heatmap_2_1F_4",
  "heatmap_1_2F",
  "heatmap_1_1F_1",
  "heatmap_1_1F_2",
  "heatmap_1_1F_3",
  "heatmap_1_1F_4_1",
  "heatmap_1_1F_4_2",
  "heatmap_1_1F_5_1",
  "heatmap_1_1F_5_2",
];

const isUe5Render = (): boolean => useStateStore().renderType === "UE5";

let ueHeatmapLayerVisibilityTimer: ReturnType<typeof setTimeout> | null = null;
let expectedUeHeatmapLayerVisible = false;
let appliedUeHeatmapLayerVisible: boolean | null = null;

const applyUePeopleFlowHeatmapLayerVisibility = (visible: boolean): void => {
  if (!isUe5Render()) {
    return;
  }
  if (appliedUeHeatmapLayerVisible === visible) {
    return;
  }
  UE_PEOPLE_FLOW_HEATMAP_ACTOR_IDS.forEach((id) => {
    if (visible) {
      modelSDK.showActor({ id });
    } else {
      modelSDK.hideActor({ id });
    }
  });
  appliedUeHeatmapLayerVisible = visible;
};

export const requestUePeopleFlowHeatmapLayersVisibility = (visible: boolean): void => {
  expectedUeHeatmapLayerVisible = visible;
  if (ueHeatmapLayerVisibilityTimer !== null) {
    clearTimeout(ueHeatmapLayerVisibilityTimer);
  }
  ueHeatmapLayerVisibilityTimer = setTimeout(() => {
    ueHeatmapLayerVisibilityTimer = null;
    applyUePeopleFlowHeatmapLayerVisibility(expectedUeHeatmapLayerVisible);
  }, UE_HEATMAP_LAYER_VISIBILITY_DEBOUNCE_MS);
};

/** 隐藏 UE 固定人流量热力图 Actor（与 coordPointsHeatMap 渲染完成后配套使用） */
export const hideUePeopleFlowHeatmapLayers = (): void => {
  requestUePeopleFlowHeatmapLayersVisibility(false);
};

/** 显示 UE 固定人流量热力图 Actor（人流量分析面板） */
export const showUePeopleFlowHeatmapLayers = (): void => {
  requestUePeopleFlowHeatmapLayersVisibility(true);
};

export interface UsePeopleFlow {
  showArea: () => void;
  showPoint: (value) => void;
  clearHeatmap: (options?: { preserveCache?: boolean }) => void;
  ensureHeatmapRendered: () => Promise<void>;
  preloadAllAreaHeatmap: () => Promise<void>;
  showPreloadAreaHeatmap: () => Promise<void>;
}

const lastHeatmapParamsMap = new Map<string, Record<string, unknown>>();
const heatmapTimerIds: ReturnType<typeof setTimeout>[] = [];

const clearPendingHeatmapTimers = (): void => {
  heatmapTimerIds.forEach((id) => clearTimeout(id));
  heatmapTimerIds.length = 0;
};

export const restoreHeatmap = (): boolean => {
  if (lastHeatmapParamsMap.size === 0) {
    return false;
  }
  lastHeatmapParamsMap.forEach((params) => {
    modelSDK.coordPointsHeatMap(params);
  });
  return true;
};

export const usePeopleFlow = (): UsePeopleFlow => {
  const { globalState, getAreaById } = useStateStore();
  const store = trafficStore();
  const viewConfig: Ref<TrafficDetectionAreaVisualVO> = ref();
  const deviceList = ref<DevicePageInfoVO[]>();

  const getViewConfig = async (): Promise<void> => {
    try {
      const res = await cubeTrafficStatisticsService.getTrafficViewConfig(store.currentTraffic?.id);
      viewConfig.value = res;
    } catch {}
  };
  // 点位设备定位
  const setDevicePosition = async (point: TrafficDetectionDeviceStatVO): Promise<boolean> => {
    try {
      const dataInfo = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: point?.id as unknown as string });
      eventInstance.emitEvent("locateToDevice", {
        deviceCode: dataInfo?.baseArchivesInfo?.code,
        prodCategory: dataInfo?.productInfo?.name,
      });
      return true;
    } catch {
      return false;
    }
  };
  const getAreaDevice = async (): Promise<void> => {
    const { id } = store.currentTraffic;
    if (id) {
      const params = {
        pageNumber: 1,
        pageSize: 999,
        deviceState: true,
      };
      const res = await cubeTrafficStatisticsService.getTrafficDevicesById(id, params);
      deviceList.value = res.records;
    }
  };
  // 切换面板
  const switchPanel = (): void => {
    globalState.business.currentAreaLeave = 2;
    eventInstance.emitEvent("switchBusinessPanel", {
      type: "people-flow",
      name: "人流监测",
      visible: true,
    });
  };

  // 显示楼层
  const showBuildingFloor = (): void => {
    const hiddenBuilding = viewConfig.value?.hiddenBuilding;
    if (hiddenBuilding) {
      const areaIds = viewConfig.value?.hiddenBuilding
        ? typeof viewConfig.value?.hiddenBuilding === "string"
          ? viewConfig.value?.hiddenBuilding?.split(",")
          : viewConfig.value?.hiddenBuilding
        : [];
      const area = getAreaById(areaIds[areaIds.length - 1]);
      if (area?.visualizationAreaType === "FLOOR") {
        const buildingName = getAreaById(area.parentId)?.aliasName;
        const params = {
          buildingName,
          floorName: area.aliasName,
        };
        modelSDK.showBuildingFloor(params);
        modelSDK.removePoiByType("all");
      }
    } else {
    }
  };

  // 切换视角
  const changeCamera = async (): Promise<boolean> => {
    await getViewConfig();
    const camera = viewConfig.value?.visualConfig;
    if (camera) {
      const cameraObj = typeof camera === "string" && camera ? JSON.parse(camera) : camera;
      modelSDK.changeCameraView({ ...cameraObj, pawnToCamera: false });
      showBuildingFloor();
      return true;
    }
    message.error("未获取到视角参数");
    return false;
  };

  // 显示热力图
  const showHeatmap = (config: { data: unknown[]; modelArea: string; radiusMax?: number }): void => {
    const { data, radiusMax, modelArea } = config;
    if (!data || data.length === 0) {
      return;
    }
    const params = {
      id: modelArea || "crowdHeatMap01",
      radiusMax: radiusMax || 300,
      enlargeScale: 30,
      data,
    };
    lastHeatmapParamsMap.set(params.id, params);
    modelSDK.coordPointsHeatMap(params);
  };
  // 清空热力图
  const clearHeatmap = (options?: { preserveCache?: boolean }): void => {
    clearPendingHeatmapTimers();
    if (!options?.preserveCache) {
      lastHeatmapParamsMap.clear();
    }
    modelSDK.clearAllCoordPointsHeatMap();
  };
  // 优化前，显示区域热力图（1. 切换面板、视角、揭楼层； 2. 获取区域下设备信息，组装热力图渲染参数）
  const showArea = async (): Promise<void> => {
    switchPanel();
    const [, cameraSuccess] = await Promise.all([getAreaDevice(), changeCamera()]);

    if (cameraSuccess) {
      const { totalPersonNumber } = store.currentTraffic;
      const groups: Record<string, { data: unknown[]; radiusMax: number }> = {};

      deviceList.value?.forEach((item) => {
        const deviceConfig = item?.trafficDetectionAreaConfig?.deviceConfig;
        const deviceConfigObj = typeof deviceConfig === "string" && deviceConfig ? JSON.parse(deviceConfig) : {};
        const { radius, centerAddress, parentModelArea } = deviceConfigObj;
        const centerAddressObj = typeof centerAddress === "string" && centerAddress ? JSON.parse(centerAddress) : {};

        const key = parentModelArea || store.currentTraffic?.modelArea || "";
        if (!groups[key]) {
          groups[key] = { data: [], radiusMax: 0 };
        }

        if (!groups[key].radiusMax && radius) {
          groups[key].radiusMax = radius;
        }

        groups[key].data.push({
          value: totalPersonNumber || 0,
          coord: {
            x: centerAddressObj?.x ?? "",
            y: centerAddressObj?.y ?? "",
          },
        });
      });
      Object.entries(groups).forEach(([modelArea, { data, radiusMax }], index) => {
        const timerId = setTimeout(() => {
          showHeatmap({ data, modelArea, radiusMax });
        }, index * 15000);
        heatmapTimerIds.push(timerId);
      });
    }
  };

  // 显示某个点位（设备）热力图
  const showPoint = async (point: TrafficDetectionDeviceStatVO): Promise<void> => {
    switchPanel();
    const cameraSuccess = await setDevicePosition(point);

    if (cameraSuccess) {
      const deviceConfig = point?.deviceConfig;
      const deviceConfigObj = typeof deviceConfig === "string" && deviceConfig ? JSON.parse(deviceConfig) : {};
      const { radius, centerAddress } = deviceConfigObj;
      const centerAddressObj = typeof centerAddress === "string" && centerAddress ? JSON.parse(centerAddress) : {};
      const heatmapData = [
        {
          value: point?.totalPersonNumber || 0,
          coord: {
            x: centerAddressObj?.x ?? "",
            y: centerAddressObj?.y ?? "",
          },
        },
      ];
      const modelArea = store.currentTraffic?.modelArea || "";
      showHeatmap({ data: heatmapData, modelArea, radiusMax: radius });
    }
  };
  // 优化后，全局调度热力图请求。预先发送热力图请求，当点击某个区域时，不再发送热力图请求，只需切换面板、视角、揭楼层。
  const preloadAllAreaHeatmap = async (): Promise<void> => {
    try {
      clearPendingHeatmapTimers();
      const areaStats = await cubeTrafficStatisticsService.getTrafficAreaListStat();
      const areaList =
        (areaStats ?? []).map((item: any) => ({
          ...item,
          label: item?.name,
          value: item?.totalPersonNumber ?? 0,
        })) ?? [];
      interface HeatmapTask {
        modelArea: string;
        radiusMax?: number;
        data: unknown[];
      }
      const tasks: HeatmapTask[] = [];

      for (const area of areaList) {
        const deviceQuery = {
          pageNumber: 1,
          pageSize: 999,
          deviceState: true,
        };
        try {
          const res = await cubeTrafficStatisticsService.getTrafficDevicesById(area?.id, deviceQuery);
          const records: any[] = res?.records ?? [];

          const groups: Record<string, { data: unknown[]; radiusMax?: number }> = {};
          records.forEach((dev) => {
            const deviceConfig = dev?.trafficDetectionAreaConfig?.deviceConfig;
            const deviceConfigObj = typeof deviceConfig === "string" && deviceConfig ? JSON.parse(deviceConfig) : (deviceConfig ?? {});
            const { radius, centerAddress, parentModelArea } = deviceConfigObj || {};
            const centerAddressObj = typeof centerAddress === "string" && centerAddress ? JSON.parse(centerAddress) : (centerAddress ?? {});

            const key = parentModelArea || area?.modelArea || "";
            if (!key) {
              return;
            }
            if (!groups[key]) {
              groups[key] = { data: [], radiusMax: undefined };
            }
            if (!groups[key].radiusMax && radius) {
              groups[key].radiusMax = radius;
            }
            groups[key].data.push({
              value: area?.value ?? 0,
              coord: {
                x: centerAddressObj?.x ?? "",
                y: centerAddressObj?.y ?? "",
              },
            });
          });

          Object.entries(groups).forEach(([modelArea, { data, radiusMax }]) => {
            if (data.length) {
              tasks.push({ modelArea, data, radiusMax });
            }
          });
        } catch {}
      }

      const baseDelay = 15 * 1000;
      let delay = 0;
      tasks.forEach((t) => {
        const timerId = setTimeout(() => {
          showHeatmap({ data: t.data, modelArea: t.modelArea, radiusMax: t.radiusMax });
        }, delay);
        heatmapTimerIds.push(timerId);
        delay += baseDelay;
      });
      const afterLastRenderMs = tasks.length === 0 ? 0 : (tasks.length - 1) * baseDelay;
      const hideLayersDelayMs = afterLastRenderMs + HEATMAP_HIDE_AFTER_RENDER_BUFFER_MS;
      const hideLayersTimerId = setTimeout(() => {
        hideUePeopleFlowHeatmapLayers();
      }, hideLayersDelayMs);
      heatmapTimerIds.push(hideLayersTimerId);
    } catch {}
  };

  const ensureHeatmapRendered = async (): Promise<void> => {
    restoreHeatmap();
    await preloadAllAreaHeatmap();
  };

  // 优化后，显示某个区域热力图
  const showPreloadAreaHeatmap = async (): Promise<void> => {
    switchPanel();
    await changeCamera();
    await ensureHeatmapRendered();
  };

  return {
    showArea,
    showPoint,
    clearHeatmap,
    ensureHeatmapRendered,
    preloadAllAreaHeatmap,
    showPreloadAreaHeatmap,
  };
};
