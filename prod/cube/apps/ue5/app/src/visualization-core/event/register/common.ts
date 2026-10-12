import { message } from "ant-design-vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import { eventInstance } from "../event";
import { EventCore } from "../event-core";
import { createSwitchBusinessPanelRunner } from "./switch-business-panel";
import { ConfigLoader } from "@/application/config/config-loader";
import { getDeviceListBuyScene } from "@/infrastructure/api/device";
import { getAreaScenePanelConfig } from "@/infrastructure/api/mdata";
import { cubeDeviceCenterService } from "@/infrastructure/api/service";
import { getPerspective } from "@/infrastructure/utils/common";
import { DeviceAlarmType, getDeviceTypeIcon } from "@/infrastructure/utils/enumeratie";
import { modelSDK } from "@/visualization-core/model-sdk/sdk";
import { ueSdk } from "@/visualization-core/model-sdk/ue-sdk";
import { setSpecialCamera } from "@/visualization-core/scene/scene-actions";
import { storeHead } from "@/visualization-core/stores/use-state-head";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

const piniaStoreHead = storeHead();
const { globalState, getAreaById, getAreaNameWithLevelById, getAreaLevelById } = useStateStore();
const { renderType } = useStateStore();

/** 通过区域ID 变跟模型状态 */
export async function changeModelByAreaId(): Promise<void> {
  const area = getAreaById(globalState.business.currentAreaId);
  // 删除所有的标签
  modelSDK.removePoiByType("all");
  // 设置视角
  modelSDK.positioningPerspective({ ...area, areaName: getAreaNameWithLevelById(area.id).join("-") });
  // 判断是否显示楼栋外壳（TODO）
  // 判断是否隐藏其他楼层 (TODO)

  // ===========打标签 start===============
  const currentMenu = globalState.business.currentMenu;
  const requestDeviceList = async (
    pageNumber: number,
    pageSize: number,
  ): Promise<{
    pages: number;
    records: Record<string, unknown>[];
    total: number;
  }> => {
    let query = {
      sceneType: currentMenu,
      areaId: globalState.business.currentAreaId,
      pageNumber: pageNumber,
      pageSize: pageSize,
    };
    return getDeviceListBuyScene(query);
  };
  const flowRequest = async (): Promise<Record<string, unknown>[]> => {
    return new Promise(async (resolve) => {
      const params = {
        pageSize: 500,
        pageNumber: 1,
      };
      let deviceList = [];
      const res = await requestDeviceList(1, 500);
      deviceList.push(...res.records);
      if (res.total > params.pageSize) {
        const total = Math.ceil(res.total / params.pageSize);
        for (let i = 2; i <= total; i++) {
          const res = await requestDeviceList(i, 500);
          deviceList.push(...res.records);
          if (i === total) {
            resolve(deviceList);
          }
        }
      } else {
        resolve(deviceList);
      }
    });
  };

  // 楼层操作 打设备标签（农批哪些档位、资产标签就先不做了）
  if (area?.visualizationAreaType === "FLOOR" && currentMenu) {
    const deviceList = await flowRequest();
    modelSDK.addDeviceIcon(
      deviceList.map((item) => {
        return {
          deviceId: item.id as string,
          deviceCode: item.code as string,
          // @ts-ignore
          prodCategoryName: item.prodCategory?.name,
          // @ts-ignore
          onlineState: item.status.onlineState,
        };
      }),
    );
  }
  // ===========打标签 end===============

  // ===========楼栋楼层操作 start===============
  if (area?.visualizationAreaType === "FLOOR") {
    const buildingName = getAreaById(area.parentId)?.aliasName;
    const params = {
      buildingName,
      floorName: area.aliasName,
    };
    modelSDK.showBuildingFloor(params);
  }

  if (area?.visualizationAreaType === "BUILDING") {
    modelSDK.showBuilding(area.aliasName);
  }
  // ===========楼栋楼层操作 end===============
}

// 修改模型时间
EventCore.registerEvent("changeModelTime", (item) => {
  piniaStoreHead.timeSelected = item;
  modelSDK.setTimeOfDay(item.value);
});
// 修改模型天气
EventCore.registerEvent("changeModelWeather", (item) => {
  piniaStoreHead.weatherSelected = item;
  modelSDK.changeModelWeather(item.value);
});

// 修改模型总览视角
EventCore.registerEvent("changeModelGlobalCameraView", (item: { value: string }) => {
  if (!item?.value) {
    return;
  }
  const value = JSON.parse(item.value) as Record<string, unknown>;
  if (renderType === "UE5") {
    value.pawnToCamera = false;
  }
  modelSDK.changeCameraView(value);
  modelSDK.stopSequenceAll();
  piniaStoreHead.perspectiveSelected = item;
  // TODO 还有一堆业务操作没有实现 要实现index.vue中的changeCameraView
});

// 切换到全局视角
EventCore.registerEvent("setFirstPerspective", (index = 0) => {
  const options = ConfigLoader.config.modelPerspective;
  const perspective = options?.[index];
  if (perspective?.value) {
    eventInstance.emitEvent("changeModelGlobalCameraView", perspective);
  }
  // 重置模型
  eventInstance.emitEvent("resetModel");
  // 重新打区域标签
  eventInstance.emitEvent("createBuildIcon");
  globalState.business.floor = [];
  globalState.business.currentAreaLeave = 1;
  globalState.business.currentAreaId = "";
  eventInstance.emitEvent("switchBusinessPanel");
});

// 切换到鸟瞰视角
EventCore.registerEvent("setBirdViewPerspective", () => {
  const options = ConfigLoader.config.modelPerspective;
  const viewParams = options?.find((e) => e.label?.includes("俯瞰") || e.label?.includes("鸟瞰"));
  if (viewParams?.value) {
    eventInstance.emitEvent("changeModelGlobalCameraView", viewParams);
  }
});

// 修改模型画质
EventCore.registerEvent("changeModelQuality", (item) => {
  piniaStoreHead.qualitySelected = item;
  ueSdk.changeModelQuality(item.value);
});

// 开启模型环游：无参 = 翻转；传入 boolean = 设为目标状态
EventCore.registerEvent("changeModelTourAroundStatus", (desired?: boolean) => {
  const next = typeof desired === "boolean" ? desired : !globalState.tourAround;
  if (globalState.tourAround === next) {
    return;
  }
  globalState.tourAround = next;
  if (!globalState.tourAround) {
    eventInstance.emitEvent("setFirstPerspective");
  }
  modelSDK.changRoam(globalState.tourAround);
});

// 开始 / 结束路线漫游
EventCore.registerEvent("startRoaming", (value: unknown) => {
  if (value) {
    globalState.panel.leftPanelName = "";
    globalState.panel.rightPanelName = "RoamingDevices";
    globalState.panel.visible = true;
    piniaStoreHead.roamShow = false;
    piniaStoreHead.roamingPointData = value as typeof piniaStoreHead.roamingPointData;
    return;
  }
  piniaStoreHead.requestCloseRoaming();
});

EventCore.registerEvent("resetRoamingRoute", () => {
  // RoamingRoute 组件监听并重置选中项
});

// AI 切换楼层视角
EventCore.registerEvent(
  "changeFloorPerspective",
  (data: {
    showFloors?: Array<{ areaId?: string; actorId?: string; id?: string }>;
    hidFloors?: Array<{ areaId?: string; actorId?: string; id?: string }>;
    selectedFloor?: { id?: string; areaId?: string };
  }) => {
    const ueClient = UeClient.getInstance();
    data.showFloors?.forEach((item) => {
      const id = item.areaId ?? item.actorId ?? item.id;
      if (id) {
        ueClient.send("showActor", { id });
      }
    });
    data.hidFloors?.forEach((item) => {
      const id = item.areaId ?? item.actorId ?? item.id;
      if (id) {
        ueClient.send("hideActor", { id });
      }
    });
    if (data.selectedFloor?.id ?? data.selectedFloor?.areaId) {
      globalState.business.currentAreaId = String(data.selectedFloor.id ?? data.selectedFloor.areaId);
      globalState.business.currentAreaLeave = 3;
      eventInstance.emitEvent("switchBusinessPanel");
    }
  },
);

// 切换模型驾驶模式
EventCore.registerEvent("changeTouchInterface", (status: boolean) => {
  modelSDK.changeTouchInterface(status);
});

EventCore.registerEvent("openDeviceFloor", (deviceInfo) => {
  // TODO webGL 待实现
  const ueClient = UeClient.getInstance();
  // 设备特效
  const addSpecialEffects = async (deviceInfo): Promise<void> => {
    const deviceDetail = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: deviceInfo.alarmTargetKey });
    const onlineState = deviceDetail?.baseArchivesInfo?.status?.onlineState;
    ueClient.send("addIconPoi", {
      icon: getDeviceTypeIcon(deviceInfo.alarmTargetTypeName),
      color: onlineState !== undefined ? (onlineState ? 0 : 2) : 1,
      targetActorId: deviceInfo.alarmTargetCode,
      scale: window.config.otherConfig.iconScale ? window.config.otherConfig.iconScale : 1,
      props: {
        iconType: "singleAlarm",
        actorId: deviceInfo.alarmTargetCode,
        id: deviceInfo.alarmTargetKey,
        code: deviceInfo.alarmTargetCode,
        genreId: deviceInfo.genreId,
      },
    });
    let effectCode = "";
    for (const key in DeviceAlarmType) {
      if (deviceInfo.alarmEventName && deviceInfo.alarmEventName.indexOf(key) !== -1) {
        effectCode = DeviceAlarmType[key];
        if (effectCode === "SmokeA") {
          ueClient.send("addEffect", {
            code: "SmokeA",
            scale: { x: 0.5, y: 0.5, z: 0.5 },
            targetActorId: deviceInfo.alarmTargetCode,
          });
          ueClient.send("addEffect", {
            code: "SmokeB",
            scale: { x: 0.5, y: 0.5, z: 0.5 },
            targetActorId: deviceInfo.alarmTargetCode,
          });
          ueClient.send("addEffect", {
            code: "SmokeC",
            scale: { x: 0.5, y: 0.5, z: 0.5 },
            targetActorId: deviceInfo.alarmTargetCode,
          });
          ueClient.send("addEffect", {
            code: "SmokeD",
            scale: { x: 0.5, y: 0.5, z: 0.5 },
            targetActorId: deviceInfo.alarmTargetCode,
          });
          ueClient.send("addEffect", {
            code: "SmokeF",
            scale: { x: 0.5, y: 0.5, z: 0.5 },
            targetActorId: deviceInfo.alarmTargetCode,
          });
        } else if (effectCode === "FireBig") {
          ueClient.send("addEffect", {
            code: effectCode,
            scale: { x: 0.5, y: 0.5, z: 0.5 },
            targetActorId: deviceInfo.alarmTargetCode,
          });
        } else {
          ueClient.send("addEffect", {
            code: effectCode,
            scale: { x: 0.5, y: 0.5, z: 0.5 },
            targetActorId: deviceInfo.alarmTargetCode,
          });
        }
      }
    }
  };

  // 计算当前在几楼，并且隐藏几楼，显示几楼
  const showAndHideFloor = (floorData, item): void => {
    const index = floorData.findIndex((v) => v.areaId === item.floorId);
    const hidFloors = floorData.filter((item, i) => {
      if (i < index) {
        return item;
      }
    });
    const showFloors = floorData.filter((item, i) => {
      if (i >= index) {
        return item;
      }
    });
    floorData = floorData.map((item, i) => {
      if (i < index) {
        item.selected = false;
      } else {
        item.selected = true;
      }
      return item;
    });
    const hideActors = ["成都六院-净水管道系统", "成都六院-净化空调", "成都六院-空调水系统主管道"];
    hideActors.forEach((item) => {
      ueClient.send("getActorByName", { name: item }, (res) => {
        ueClient.send("hideActor", { id: res.actorId || res.id });
      });
    });
    let data = { showFloors: showFloors, hidFloors: hidFloors, selectedFloor: item };
    data.showFloors.forEach((item) => {
      ueClient.send("showActor", { id: item.areaId });
    });
    data.hidFloors.forEach((item) => {
      ueClient.send("hideActor", { id: item.areaId });
    });
    // 视角设置
    const cameraName = data.selectedFloor.levelName
      ? data.selectedFloor.buildingName + "-" + data.selectedFloor.levelName
      : data.selectedFloor.buildingName;
    let perspective = getPerspective(cameraName);
    if (perspective) {
      ueClient.send("changeCameraView", perspective.camera);
      perspective.hideActors.forEach((item) => {
        ueClient.send("getActorByName", { name: item }, (res) => {
          ueClient.send("hideActor", { id: res.actorId || res.id });
        });
      });
    }
    if (deviceInfo.locateToDevice) {
      eventInstance.emitEvent("locateToDevice", deviceInfo);
    }
  };

  ueClient.send("removePoiByProps", { props: { iconType: "singleAlarm" } });
  ueClient.send("removeEffectAll");
  ueClient.send("getBimLocation", { id: deviceInfo.alarmTargetCode.trim() }, function (bimLocation) {
    let buildData = globalState.business.area.filter((item) => {
      return item.aliasName === bimLocation.buildingName || item.name === bimLocation.buildingName;
    });

    if (buildData.length) {
      bimLocation.levelName = deviceInfo.areaName.split("-")[1];
      ueClient.send("getActorByName", { name: buildData[0].aliasName }, (res) => {
        ueClient.send("getBimtree", { id: res.actorId || res.id }, function (children) {
          children.forEach((res) => {
            buildData[0].children.forEach((floorData) => {
              if (floorData.aliasName === res.name) {
                // @ts-ignore
                floorData.areaId = res.id;
              }
            });
          });
          bimLocation.buildingName = buildData[0].name;
          showAndHideFloor(buildData[0].children, bimLocation);
          addSpecialEffects(deviceInfo);
        });
      });
    } else {
      eventInstance.emitEvent("locateToDevice", deviceInfo);
      addSpecialEffects(deviceInfo);
    }
  });
});

/**
 * 设备定位
 */
EventCore.registerEvent("locateToDevice", (info: { alarmTargetCode?: string; prodCategory?: string; deviceCode?: string }) => {
  if (renderType === "WEBGL") {
    modelSDK.removePoiByType("all");
    modelSDK.focusActor(info.alarmTargetCode || info.deviceCode);
    return;
  }
  const ueClient = UeClient.getInstance();
  ueClient.send("getActorById", { id: info?.alarmTargetCode || info?.deviceCode }, async function (res) {
    if (res.id) {
      setSpecialCamera(info.prodCategory, res.id);
      ueClient.send("startFlash", { id: res.id, level: 1 });
      ueClient.send("showShell", { id: res.id });
    } else {
      message.error("模型中未找到对应设备");
    }
  });
});

// -------------------------------下面是新写的--------------------------------------------
// Serial latest-wins: rapid menu clicks must not leave panel.visible=false or remount panels concurrently.
const switchBusinessPanelRunner = createSwitchBusinessPanelRunner({
  getMenu: () => String(globalState.business.currentMenu ?? ""),
  getAreaLeave: () => Number(globalState.business.currentAreaLeave) || 0,
  getPanel: () => globalState.panel,
  fetchPanels: (params) => getAreaScenePanelConfig(params),
});

EventCore.registerEvent("switchBusinessPanel", () => {
  switchBusinessPanelRunner.trigger();
});

// 点击楼栋标签或者模型上的楼栋标签
EventCore.registerEvent("handelClickBuild", async (item) => {
  globalState.business.currentAreaId = item.id;
  globalState.business.currentAreaLeave = getAreaLevelById(item.id);
  changeModelByAreaId();
  eventInstance.emitEvent("switchBusinessPanel");
});

/** 模型重置 */
EventCore.registerEvent("resetModel", () => {
  modelSDK.resetModel();
});

/** 打楼栋区域标签 */
EventCore.registerEvent("createBuildIcon", async () => {
  const checkAreaData = async (): Promise<void> => {
    return new Promise((resolve) => {
      if (globalState.business.area.length) {
        resolve();
      }
      setTimeout(async () => {
        await checkAreaData();
        resolve();
      }, 100);
    });
  };
  await checkAreaData();
  modelSDK.addAreaBuildTextIcon(globalState.business.area);
});

/** 返回上一级 */
EventCore.registerEvent("backPreAreaLevel", () => {
  globalState.business.currentAreaLeave--;
  if (globalState.business.currentAreaLeave === 1) {
    eventInstance.emitEvent("setFirstPerspective");
  } else {
    globalState.business.currentAreaId = getAreaById(globalState.business.currentAreaId)?.parentId;
    changeModelByAreaId();
  }
  eventInstance.emitEvent("switchBusinessPanel");
});

/** 校验模型状态 */
EventCore.registerEvent("verifyModelStatus", async () => {
  changeModelByAreaId();
});

/** 移除所有粒子特效 */
EventCore.registerEvent("removeAllEffect", () => {
  modelSDK.removeAllEffect();
});
