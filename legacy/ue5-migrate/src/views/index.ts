import { UeClient } from "@ghcloud/cube-visual-sdk";

import { deviceInstancePage } from "@/api/device";
import { getDeviceInfoByCode } from "@/api/equipment";
import { stallSceneStall } from "@/api/mdata";
import { propertySceneStall, riskSceneStall } from "@/api/property";
import { useStateStore } from "@/pages/state/use-state-store";
import { resolveAreaPerspective } from "@/pages/widget/area-nav/resolve-area-perspective";
import { resolveFloorPerspective } from "@/pages/widget/area-nav/resolve-floor-perspective";
import { storeMenu } from "@/piniaStore/menu";
import { storeMarket } from "@/piniaStore/other";
import { getPerspective } from "@/utils/common";
import { DeviceStatusCode, getDeviceTypeIcon } from "@/utils/enumeratie";
import gearData from "@/utils/gear.json";
import { requestDeviceList } from "@/utils/requestData/basicData";

const { globalState } = useStateStore();
const piniaStoreMarket = storeMarket();
const piniaStoreMenu = storeMenu();
/** 当前楼栋信息 这个信息传给 UE5 再回传的 */
export interface CurBuild {
  actorId: string;
  props: {
    iconType: "area";
    name: string;
    areaId: string;
    actorId: string;
    modalNames: string;
    buildTagLocation: unknown;
    visualizationAreaType: string;
  };
}
/** 批量打设备图标 */
export async function batchAddDeviceIcon() {
  dataTypeList.forEach((item) => {
    UeClient.getInstance().send("removePoiByProps", {
      props: {
        iconType: item.key,
      },
    });
  });
  let stallS = [];
  let property = [];
  let risk = [];
  try {
    stallS = await getStallSceneStall();
    property = await getPropertySceneStall();
    risk = await getRiskSceneStall();
  } catch {}
  const device = await getDeviceList();
  const deviceListPio = [...device, ...stallS, ...property, ...risk];
  if (deviceListPio.length > 0) {
    addDeviceIconPio(deviceListPio);
  }
}
/** 批量打档位图标 */
export function batchAddGearIconPio(modalNames: string) {
  UeClient.getInstance().send("removePoiByProps", {
    props: {
      iconType: "gear",
    },
  });
  const list = gearData.gearArray.map((item) => item.area === modalNames);
  const groupList = setBatchgroup(list);
  if (groupList.length > 0) {
    const gearListPio = groupList[0].map((item: { name: string; code: string; area: string }) => ({
      text: item.name,
      color: 4,
      targetActorId: item.code,
      scale: 1,
      props: {
        iconType: "gear",
        actorId: item.code,
        code: item.code,
        area: item.area,
        name: item.name,
        deviceData: item,
      },
    }));
    UeClient.getInstance().send("addTextPoiBatch", { pois: gearListPio });
  }
}

/**
 * 设置批量分组
 */
function setBatchgroup(array: string | any[]) {
  const subGroupLength = 10_000;
  let index = 0;
  const newArray = [];
  while (index < array.length) {
    newArray.push(array.slice(index, (index += subGroupLength)));
  }
  return newArray;
}
/**
 * 获取档位列表数据
 */
const getStallSceneStall = async () => {
  const params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    pageSize: 500,
    pageNumber: 1,
  };
  const res = await stallSceneStall(params);
  let deviceListPio = [];
  //@ts-expect-error
  const deviceList = res.records;
  const list = [...new Set(deviceList)];
  const groupList = setBatchgroup(list);
  if (groupList.length > 0) {
    deviceListPio = groupList[0].map(
      (item: {
        area: string;
        visualizationCode: any;
        code: any;
        genreName: string | number;
        status: any;
        id: any;
        genreId: any;
        product: { modelName: string };
      }) => {
        if (globalState.business.currentAreaId === item?.area.split(",")[item.area.split(",").length - 1]) {
          return {
            targetActorId: item.visualizationCode,
            icon: "64",
            color: 0,
            scale: window.config.otherConfig.iconScale ? window.config.otherConfig.iconScale : 1,
            props: {
              iconType: "stall",
              actorId: item.visualizationCode.trim(),
              id: item.id,
              code: item.visualizationCode.trim(),
              genreId: item.genreId,
            },
          };
        }
      },
    );
  }
  return deviceListPio.filter((item) => item);
};
/**
 * 获取资产列表数据
 */
const getPropertySceneStall = async () => {
  const params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    pageSize: 500,
    pageNumber: 1,
  };
  const res = await propertySceneStall(params);
  let deviceListPio = [];
  const deviceList = res.records;
  const list = [...new Set(deviceList)];
  const groupList = setBatchgroup(list);
  if (groupList.length > 0) {
    deviceListPio = groupList[0].map(
      (item: {
        areaId: string;
        deviceNumber: any;
        code: any;
        genreName: string | number;
        status: any;
        propertyId: any;
        genreId: any;
        product: { modelName: string };
      }) => {
        item.deviceNumber = item.deviceNumber.trim();
        if (globalState.business.currentAreaId === item?.areaId.split(",")[item.areaId.split(",").length - 1]) {
          return {
            targetActorId: item.deviceNumber,
            icon: "72",
            color: 0,
            scale: window.config.otherConfig.iconScale ? window.config.otherConfig.iconScale : 1,
            props: {
              type: "",
              iconType: "property",
              actorId: item.deviceNumber,
              id: item.propertyId,
              code: item.deviceNumber,
              genreId: item.genreId,
            },
          };
        }
      },
    );
  }
  return deviceListPio.filter((item) => item);
};
/**
 * 获取风险源列表数据
 */
const getRiskSceneStall = async () => {
  const params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    pageSize: 500,
    pageNumber: 1,
  };
  const res = await riskSceneStall(params);
  let deviceListPio = [];
  const deviceList = res.records;
  const list = [...new Set(deviceList)];
  const groupList = setBatchgroup(list);
  if (groupList.length > 0) {
    deviceListPio = groupList[0].map(
      (item: {
        typeName: any;
        areaId: string;
        bimCode: any;
        code: any;
        genreName: string | number;
        status: any;
        riskSourceId: any;
        genreId: any;
        product: { modelName: string };
      }) => {
        item.bimCode = item.bimCode.trim();
        if (globalState.business.currentAreaId === item?.areaId.split(",")[item.areaId.split(",").length - 1]) {
          return {
            targetActorId: item.bimCode,
            icon: getDeviceTypeIcon(item.typeName),
            color: 0,
            scale: window.config.otherConfig.iconScale ? window.config.otherConfig.iconScale : 1,
            props: {
              iconType: "risk_source",
              actorId: item.bimCode,
              id: item.riskSourceId,
              code: item.bimCode,
              genreId: item.bimCode,
            },
          };
        }
      },
    );
  }
  return deviceListPio.filter((item) => item);
};
/**
 * 流式请求设备列表接口
 */
const flowRequest = async (): Promise<any> =>
  new Promise(async (resolve, reject) => {
    const param = {
      pageSize: 500,
      pageNumber: 1,
    };
    const deviceList = [];
    const res = await requestDeviceList(param);
    deviceList.push(...res.records);
    if (res.total > param.pageSize) {
      const total = Math.ceil(res.total / param.pageSize);
      for (let i = 2; i <= total; i++) {
        const res = await requestDeviceList({
          pageSize: 500,
          pageNumber: i,
        });
        deviceList.push(...res.records);
        if (i === total) {
          resolve(deviceList);
        }
      }
    } else {
      resolve(deviceList);
    }
  });
const getDeviceList = async () => {
  let deviceListPio = [];
  const deviceList = await flowRequest();

  const list = [...new Set(deviceList)];
  const groupList = setBatchgroup(list);
  const deviceAreaNameList = [];
  if (groupList.length > 0) {
    deviceListPio = groupList[0].map(
      (item: {
        area: { id: string; pathId: string; pathName: string };
        code: any;
        genreName: string | number;
        status: any;
        id: any;
        genreId: any;
        product: { modelName: string };
      }) => {
        item.code = item.code.trim();
        item.area && deviceAreaNameList.push(item.area.pathName);

        if (
          globalState.business.currentAreaId === item?.area?.id ||
          (globalState.business.currentAreaLeave === 3 && item?.area?.pathId?.includes(globalState.business.currentAreaId))
        ) {
          return {
            targetActorId: item.code,
            //@ts-expect-error
            icon: getDeviceTypeIcon(item.product?.name, item.typeName, item.genreName, item.prodCategory?.name),
            color: DeviceStatusCode[item.status.onlineState ? "NORMAL" : "OFFLINE"],
            scale: window.config.otherConfig.iconScale ? window.config.otherConfig.iconScale : 1,
            props: {
              iconType: "device",
              actorId: item.code,
              id: item.id,
              code: item.code,
              genreId: item.genreId,
              //@ts-expect-error
              prodCategory: item.prodCategory.name,
              onlineState: item.status.onlineState,
              deviceData: item,
            },
          };
        }
      },
    );
    if (globalState.business.currentAreaLeave > 2) {
      piniaStoreMarket.deviceAreaNameList = [];
    } else {
      piniaStoreMarket.deviceAreaNameList = [...new Set(deviceAreaNameList)];
    }
  }
  return deviceListPio.filter((item) => item);
};
/**
 * 管网视角枚举
 */

export const EnumParkView = {
  空气源: "成都六院-空调水系统主管道",
  冷热源: "成都六院-空调水系统主管道",
  锅炉系统: "成都六院-空调水系统主管道",
  净化系统: "成都六院-净化空调",
  净水系统: "成都六院-净水管道系统",
};
export const dataTypeList = [
  { key: "device", name: "设备", applicationCode: "DEVICECENTER" },
  { key: "stall", name: "档位", applicationCode: "DWGL" },
  { key: "property", name: "资产", applicationCode: "PROPERTY_MANAGEMENT" },
  { key: "risk_source", name: "风险源", applicationCode: "RISK_SOURCE" },
];
// 光明电梯定制需求
export const setElevatorView = () => {
  UeClient.getInstance().send("getActorByName", { name: "办公楼" }, (res) => {
    UeClient.getInstance().send("getBimtree", { id: res.id }, (children) => {
      const floor = ["标高_上标头_6F", "标高_上标头_5F"];
      children.forEach((item) => {
        floor.forEach((e) => {
          if (item.name === e) {
            UeClient.getInstance().send("changePerspectivity", {
              id: item.id,
              translucent: true, // True代表半透明，false代表不透明
              color: "#9fd5ed", // 颜色
              opacity: 0.1, // 不透明度
            });
          }
        });
      });
      const hideList = ["BGL-5F-DT-001", "BGL-5F-DT-002", "BGL-5F-DT-003"];
      hideList.forEach((e) => {
        // Level 取值1、2、3、4，代表红、橙、黄、蓝
        UeClient.getInstance().send("startFlash", { id: e, level: 3 });
      });

      UeClient.getInstance().send("changePerspectivityBatch", {
        ids: hideList,
        translucent: false, // True代表半透明，false代表不透明
      });

      ["diantijing03", "diantijing04", "diantijing05"].forEach((e) => {
        UeClient.getInstance().send("changePerspectivity", {
          id: e,
          color: { r: 255, g: 255, b: 255 },
          opacity: 0.5,
          translucent: true, // True代表半透明，false代表不透明
        });
      });
    });
  });
  UeClient.getInstance().send("getActorByName", { name: "宿舍楼" }, (res) => {
    UeClient.getInstance().send("hideActor", { id: res.id, translucent: true });
  });

  const diantiCamera = {
    location: { x: 12_561.345_740_912_899, y: 8030.558_020_203_78, z: 4807.424_392_900_029 },
    rotation: { pitch: 334.034_942_626_953_1, yaw: 92.444_424_018_263_82, roll: 0 },
    springArmLength: 6290,
  };
  UeClient.getInstance().send("changeCameraView", { ...diantiCamera, pawnToCamera: false });
};
// 管廊特殊需求
export const hidePipeGallery = () => {
  ["标高_上标头_TF", "标高_上标头_RF"].forEach((e) => {
    UeClient.getInstance().send("getActorByName", { name: e }, (actor) => {
      UeClient.getInstance().send("hideActor", { id: actor.id });
    });
  });
};
// 平湖特殊需求
export const showEmergencyAccess = (_flag, _time = 3000) => {
  return;
  // if (!flag) {
  //   setTimeout(() => {
  //     for (let index = 1; index < 22; index++) {
  //       UeClient.getInstance().send("hideActor", { id: `taoshengluxian${index}` });
  //     }
  //   }, time);
  // } else {
  //   for (let index = 1; index < 22; index++) {
  //     UeClient.getInstance().send("showActor", { id: `taoshengluxian${index}` });
  //   }
  // }
};
// 模型打文本标签
export const addLabelText = () => {
  if (window.config.ueLabelList) {
    const textPoiData = window.config.ueLabelList.map((e) => {
      if (e.type === "textLabel") {
        if (e.location === "default" && e?.area?.aliasName) {
          UeClient.getInstance().send("getActorByName", { name: e.area.aliasName }, (data) => ({
            text: e.contentParam,
            color: e.labelColor,
            targetActorId: data.id,
            props: {
              iconType: "textLabel",
            },
          }));
        } else {
          const locationParam = JSON.parse(e.locationParam);
          return {
            text: e.contentParam,
            color: 4,
            location: locationParam,
            props: {
              iconType: "textLabel",
              locationParam,
            },
          };
        }
      }
    });
    UeClient.getInstance().send("addIconTextPoiBatch", {
      pois: textPoiData,
    });
  }
};
// 六医院管线隐藏
export const hiddenPipeline = () => {
  const hideActors = ["成都六院-净水管道系统", "成都六院-净化空调", "成都六院-空调水系统主管道"];
  hideActors.forEach((item) => {
    UeClient.getInstance().send("getActorByName", { name: item }, (res) => {
      UeClient.getInstance().send("hideActor", { id: res.actorId || res.id });
    });
  });
};
// 小微产业园隐藏
export const hiddenXwPanel = () => {
  const hideActors = [
    "CYY",
    "YFXX",
    "SQC",
    "PCS",
    "FRX",
    "XQZ",
    "CYY_WK",
    "YFXX_WK",
    "SQC_WK",
    "PCS_WK",
    "XQZ_WK",
    "CYY_2",
    "XQZ_2",
    "YFXX_2",
    "SQC_2",
    "PCS_2",
    "FRX_2",
    "QZ_2",
    "SLL",
    "YWJ",
    "XYL",
    "YFXX_1",
    "SQC_1",
    "PCS_1",
    "FRX_1",
    "XQZ_1",
  ];
  hideActors.forEach((e) => {
    UeClient.getInstance().send("hideActor", { id: e });
  });
};
// 设备定位视角定义
export const setSpecialCamera = async (cameraName: string, code: string) => {
  await UeClient.getInstance().saveNowViewPoint();
  let specialCamera = { minDistance: 50, angle: 0 };
  if (cameraName === "灭火器") {
    specialCamera = { minDistance: 10, angle: -20 };
  } else if (cameraName === "照明") {
    specialCamera = { minDistance: 500, angle: -40 };
  } else if (cameraName === "摄像机") {
    specialCamera = { minDistance: 500, angle: -0 };
  } else if (cameraName === "配电柜/箱") {
    specialCamera = { minDistance: 10, angle: -20 };
  } else if (cameraName === "电力监测点") {
    specialCamera = { minDistance: 50, angle: 0 };
  } else if (cameraName === "门禁") {
    //@ts-expect-error
    specialCamera = { minDistance: 50, angle: 0, startDistance: 200 };
  }
  UeClient.getInstance().send("focusActor", { id: code, ...specialCamera });
  UeClient.getInstance().send("showShell", { id: code });
};
// 判断当前区域是否存在设备
export const determineExistenceArea = (item): boolean => {
  const { sort } = piniaStoreMenu;
  const { deviceAreaNameList } = piniaStoreMarket;
  if (sort === 1 || window.config?.otherConfig?.isFilterArea === "display") {
    return false;
  }
  if (deviceAreaNameList.length === 0 || deviceAreaNameList.some((area) => area.includes(item.name))) {
    return false;
  }
  return true;
};
// 模型鼠标悬停事件
export const ueMouseHoverEvent = async (actor) => {
  const item = await getDeviceInfoByCode(actor.id);
  const deviceIcon = {
    targetActorId: item.baseArchivesInfo.code,
    icon: getDeviceTypeIcon(item.productInfo?.name, item.productInfo?.productCategory?.name),
    color: DeviceStatusCode[item.baseArchivesInfo.status.onlineState ? "NORMAL" : "OFFLINE"],
    scale: window.config.otherConfig.iconScale ? window.config.otherConfig.iconScale : 1,
    props: {
      iconType: "device",
      actorId: item.code,
      id: item.baseArchivesInfo.id,
      code: item.baseArchivesInfo.code,
      prodCategory: item.productInfo.productCategory.name,
    },
  };
  UeClient.getInstance().send("addIconPoi", deviceIcon);
};
// 通过设备名称查询设备信息并且打开设备弹窗
export const getDeviceInfoByName = async (name: string) => {
  const { records } = await deviceInstancePage({
    keyword: name,
    pageNum: 1,
    pageSize: 1,
  });
  if (records.length > 0) {
    return records[0];
  }
  return null;
};
function lookupActorByNames(names: string[]): Promise<{ id?: string; usedName: string }> {
  const candidates = [...new Set(names.map((n) => String(n ?? "").trim()).filter(Boolean))];
  const ue = UeClient.getInstance();
  const tryNext = (index: number): Promise<{ id?: string; usedName: string }> => {
    if (index >= candidates.length) {
      return Promise.resolve({ usedName: candidates[0] ?? "" });
    }
    const name = candidates[index]!;
    return new Promise((resolve) => {
      let settled = false;
      const finish = (res?: { id?: string }) => {
        if (settled) {
          return;
        }
        settled = true;
        if (res?.id) {
          resolve({ id: res.id, usedName: name });
          return;
        }
        void tryNext(index + 1).then(resolve);
      };
      // UE 偶发不回调：超时后试下一个名字，避免 AI 指令一直挂起
      const timer = setTimeout(() => finish(undefined), 2500);
      ue.send("getActorByName", { name }, (res) => {
        clearTimeout(timer);
        finish(res as { id?: string } | undefined);
      });
    });
  };
  return tryNext(0);
}

// 切换楼栋视角方法（区域树动态配置：模糊匹配 name/aliasName）
// 与 BuildTag 手动点击对齐：Actor 查不到也不阻断，仍交给 handelClickBuild（可用配置相机）
export const switchingBuildingPerspectives = (value, areaList) => {
  return new Promise<CurBuild>((resolve, reject) => {
    const item = resolveAreaPerspective(areaList, value);
    if (!item?.aliasName && !item?.name) {
      reject(new Error(`未找到区域视角：${String(value ?? "")}`));
      return;
    }
    const modalNames = String(item.aliasName || item.name);
    UeClient.getInstance().send("resetModel", {
      tour: true,
      flash: true,
      select: true,
      poi: true,
      effect: true,
    });
    const perspective = getPerspective(modalNames, item.name);
    void lookupActorByNames([item.aliasName, item.name].filter(Boolean) as string[]).then((actor) => {
      const actorId = actor.id ?? "";
      if (!actorId) {
        console.warn("[switchingBuildingPerspectives] Actor 未命中，仍切换视角", {
          query: value,
          aliasName: item.aliasName,
          name: item.name,
        });
      }
      resolve({
        actorId,
        props: {
          iconType: "area",
          name: item.name,
          areaId: item.id,
          actorId,
          modalNames,
          buildTagLocation: perspective?.buildTagLocation ?? null,
          visualizationAreaType: item.visualizationAreaType,
        },
      });
    });
  });
};
// 切换楼层视角方法（支持「顶层/3楼」等口语；找不到则 reject）
export const switchingFloorPerspectives = (value, floorList) =>
  new Promise((resolve, reject) => {
    const list = Array.isArray(floorList) ? floorList : [];
    const item = resolveFloorPerspective(list, value);
    if (!item) {
      reject(new Error(`未找到楼层：${String(value ?? "")}`));
      return;
    }
    const index = list.findIndex((v) => v === item || (item.actorId && v.actorId === item.actorId) || v.name === item.name);
    if (index < 0) {
      reject(new Error(`未找到楼层：${String(value ?? "")}`));
      return;
    }
    const hidFloors = list.filter((entry, i) => i < index && entry.selected);
    const showFloors = list.filter((entry, i) => i >= index && !entry.selected);
    for (let i = 0; i < list.length; i += 1) {
      list[i].selected = i >= index;
    }
    resolve({ showFloors, hidFloors, selectedFloor: item });
  });

/** 删除所有标签 */
export const removeAllPoi = () => {
  sessionStorage.removeItem("deviceList");
  piniaStoreMarket.deviceIconPioList = [];
  UeClient.getInstance().send("removePoiByType", { type: "all" });
};

/** 批量添加设备标签 */
export const addDeviceIconPio = (deviceListPio) => {
  sessionStorage.setItem("deviceList", JSON.stringify(deviceListPio));
  if (piniaStoreMarket.showLabel === "开") {
    piniaStoreMarket.deviceIconPioList = deviceListPio;
    UeClient.getInstance().send("addIconPoiBatch", { pois: deviceListPio });
  }
};
