import { message } from "ant-design-vue";
import { ref, type Ref } from "vue";

import { TrafficDetectionAreaVisualVO, TrafficDetectionDeviceStatVO } from "@ghcloud/cube-traffic-detection-service";

import { peopleFlowHeatmapManager } from "../heatmap/people-flow-heatmap-runtime";
import { trafficStore } from "../store/traffic";
import { cubeDeviceCenterService, cubeTrafficStatisticsService } from "@/infrastructure/api/service";
import { eventInstance } from "@/visualization-core/event/event";
import { modelSDK } from "@/visualization-core/model-sdk/sdk";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

export interface UsePeopleFlow {
  showArea: () => Promise<void>;
  showPoint: (value: TrafficDetectionDeviceStatVO) => Promise<void>;
  showPreloadAreaHeatmap: () => Promise<void>;
}

const parseRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  }
  return typeof value === "object" ? (value as Record<string, unknown>) : null;
};

const toFiniteNumber = (value: unknown): number | null => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

export const usePeopleFlow = (): UsePeopleFlow => {
  const { globalState, getAreaById } = useStateStore();
  const store = trafficStore();
  const viewConfig: Ref<TrafficDetectionAreaVisualVO | undefined> = ref();

  const getViewConfig = async (): Promise<boolean> => {
    try {
      viewConfig.value = await cubeTrafficStatisticsService.getTrafficViewConfig(store.currentTraffic?.id);
      return true;
    } catch (error) {
      console.error("[people-flow-heatmap] failed to load selected area view config", {
        areaId: store.currentTraffic?.id,
        error,
      });
      return false;
    }
  };

  const setDevicePosition = async (point: TrafficDetectionDeviceStatVO): Promise<boolean> => {
    try {
      const dataInfo = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: point?.id as unknown as string });
      eventInstance.emitEvent("locateToDevice", {
        deviceCode: dataInfo?.baseArchivesInfo?.code,
        prodCategory: dataInfo?.productInfo?.name,
      });
      return true;
    } catch (error) {
      console.error("[people-flow-heatmap] failed to locate selected point", {
        deviceId: point?.id,
        error,
      });
      return false;
    }
  };

  const switchPanel = (): void => {
    globalState.business.currentAreaLeave = 2;
    eventInstance.emitEvent("switchBusinessPanel", {
      type: "people-flow",
      name: "人流监测",
      visible: true,
    });
  };

  const showBuildingFloor = (): void => {
    const hiddenBuilding = viewConfig.value?.hiddenBuilding;
    if (!hiddenBuilding) {
      return;
    }

    const areaIds = typeof hiddenBuilding === "string" ? hiddenBuilding.split(",") : hiddenBuilding;
    const area = getAreaById(areaIds[areaIds.length - 1]);
    if (area?.visualizationAreaType !== "FLOOR") {
      return;
    }

    const buildingName = getAreaById(area.parentId)?.aliasName;
    modelSDK.showBuildingFloor({
      buildingName,
      floorName: area.aliasName,
    });
    modelSDK.removePoiByType("all");
  };

  const changeCamera = async (): Promise<boolean> => {
    const loaded = await getViewConfig();
    const camera = viewConfig.value?.visualConfig;
    if (!loaded || !camera) {
      message.error("未获取到视角参数");
      return false;
    }

    try {
      const cameraObject = typeof camera === "string" ? JSON.parse(camera) : camera;
      modelSDK.changeCameraView({ ...cameraObject, pawnToCamera: false });
      showBuildingFloor();
      return true;
    } catch (error) {
      console.error("[people-flow-heatmap] invalid selected area camera config", {
        areaId: store.currentTraffic?.id,
        error,
      });
      message.error("视角参数格式错误");
      return false;
    }
  };

  /** 聚焦并确保当前区域已预热，不再重新创建全量定时队列 */
  const showArea = async (): Promise<void> => {
    switchPanel();
    await changeCamera();
    await peopleFlowHeatmapManager.ensureAreaReady({
      areaId: store.currentTraffic?.id,
      modelArea: store.currentTraffic?.modelArea,
    });
  };

  const showPoint = async (point: TrafficDetectionDeviceStatVO): Promise<void> => {
    switchPanel();
    const cameraSuccess = await setDevicePosition(point);
    if (!cameraSuccess) {
      return;
    }

    try {
      const deviceConfig = parseRecord(point?.deviceConfig);
      const centerAddress = parseRecord(deviceConfig?.centerAddress);
      const x = toFiniteNumber(centerAddress?.x);
      const y = toFiniteNumber(centerAddress?.y);
      const modelArea = String(store.currentTraffic?.modelArea ?? "").trim();
      if (!deviceConfig || x === null || y === null || !modelArea) {
        console.warn("[people-flow-heatmap] selected point has no valid heatmap config", {
          deviceId: point?.id,
          modelArea,
        });
        return;
      }

      await peopleFlowHeatmapManager.renderInteractive({
        id: modelArea,
        radiusMax: toFiniteNumber(deviceConfig.radius) ?? 300,
        enlargeScale: 30,
        data: [
          {
            value: toFiniteNumber(point?.totalPersonNumber) ?? 0,
            coord: { x, y },
          },
        ],
      });
    } catch (error) {
      console.error("[people-flow-heatmap] failed to render selected point", {
        deviceId: point?.id,
        error,
      });
    }
  };

  const showPreloadAreaHeatmap = async (): Promise<void> => {
    switchPanel();
    await changeCamera();
    await peopleFlowHeatmapManager.ensureAreaReady({
      areaId: store.currentTraffic?.id,
      modelArea: store.currentTraffic?.modelArea,
    });
  };

  return {
    showArea,
    showPoint,
    showPreloadAreaHeatmap,
  };
};
