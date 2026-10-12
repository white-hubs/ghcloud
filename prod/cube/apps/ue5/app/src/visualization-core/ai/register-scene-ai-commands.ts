import { message } from "ant-design-vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import { extractBuildingHint, extractFloorHint } from "@/features/widgets/area-nav/resolve-floor-perspective";
import { commandMap } from "@/visualization-core/ai/ai-command";
import { eventInstance } from "@/visualization-core/event/event";
import {
  getDeviceInfoByName,
  switchingBuildingPerspectives,
  switchingFloorPerspectives,
  type CurBuild,
} from "@/visualization-core/scene/scene-actions";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

let registered = false;

async function getPerspectiveLocation(value: Record<string, unknown> | undefined, type?: string): Promise<boolean> {
  if (!value) {
    return false;
  }
  const params = { ...value };
  if (type === "light") {
    params.value = "xzALG 05:G1";
    type = "实时数据";
  }
  const deviceName = String(params.value ?? "").trim();
  if (!deviceName) {
    return false;
  }
  const deviceId = await getDeviceInfoByName(deviceName);
  if (!deviceId) {
    return false;
  }
  const data = {
    ...deviceId,
    areaName: deviceId?.area?.pathName,
    onlineState: deviceId.status?.onlineState,
    alarmTargetCode: deviceId.code,
    alarmTargetKey: deviceId.id,
    locateToDevice: type !== "实时数据",
  };
  eventInstance.emitEvent("openDeviceFloor", data);
  if (type === "实时数据") {
    const lightData = {
      id: deviceId.code,
      on: params.state !== "0",
      strength: 1,
      color: 0,
    };
    UeClient.getInstance().send("switchLight", [lightData]);
    message.success("下发指令成功");
  }
  return true;
}

async function changeBuildingPerspectives(value: unknown): Promise<boolean> {
  const { globalState } = useStateStore();
  try {
    const res = (await switchingBuildingPerspectives(value, globalState.business.area)) as CurBuild;
    eventInstance.emitEvent("handelClickBuild", {
      id: res.props.areaId,
      ...res,
    });
    return true;
  } catch (error) {
    console.warn("[changeBuildingPerspectives]", value, error);
    return false;
  }
}

async function changeFloorPerspectives(params: Record<string, unknown> | undefined): Promise<boolean> {
  const { globalState } = useStateStore();
  try {
    const building = extractBuildingHint(params);
    const floor = extractFloorHint(params);
    if (!building || !floor) {
      console.warn("[changeFloorPerspectives] missing building/floor", params);
      return false;
    }
    const build = (await switchingBuildingPerspectives(building, globalState.business.area)) as CurBuild;
    eventInstance.emitEvent("handelClickBuild", {
      id: build.props.areaId,
      ...build,
    });
    await new Promise((r) => setTimeout(r, 500));
    const currentBuild = globalState.business.area.find((item) => item.id === build.props.areaId);
    const floorList = (currentBuild?.children ?? globalState.business.floor).map((v) => ({
      ...v,
      selected: true,
    }));
    const floorResult = await switchingFloorPerspectives(floor, floorList);
    eventInstance.emitEvent("changeFloorPerspective", floorResult);
    return true;
  } catch (error) {
    console.warn("[changeFloorPerspectives]", params, error);
    return false;
  }
}

function extractBuildingParams(params: Record<string, unknown> | undefined | null): string {
  if (!params) {
    return "";
  }
  for (const key of ["value", "buildingName", "building_name", "building", "area", "areaName", "name"]) {
    const v = params[key];
    if (typeof v === "string" && v.trim()) {
      return v.trim();
    }
  }
  return "";
}

/** 场景 / 设备 / 区域相关 AI 指令 */
export function registerSceneAiCommands(): void {
  if (registered) {
    return;
  }
  registered = true;

  commandMap.set("toggleOpenDeviceDetails", (value) => getPerspectiveLocation(value as Record<string, unknown>, "基本信息"));
  commandMap.set("toggleOpenDeviceMonitor", (value) => getPerspectiveLocation(value as Record<string, unknown>, "监控画面"));
  commandMap.set("modifyDeviceStatus", (value) => getPerspectiveLocation(value as Record<string, unknown>, "实时数据"));
  commandMap.set("modifyDeviceStatusForLight", (value) => getPerspectiveLocation(value as Record<string, unknown>, "light"));

  commandMap.set("changePerspectiveBuilding", (params) => {
    const hint = extractBuildingParams(params as Record<string, unknown>);
    if (!hint) {
      console.warn("[cube-ai-command] changePerspectiveBuilding missing name", params);
      return false;
    }
    return changeBuildingPerspectives(hint);
  });

  commandMap.set("changePerspectiveFloor", (value) => changeFloorPerspectives(value as Record<string, unknown>));
}

registerSceneAiCommands();
