import { h } from "vue";

import type { UserInfo } from "@ghcloud/cube-ouaa-service";

import {
  addGisMarker,
  clearMap,
  drawGisPolygon,
  drawLayerByGeoJson,
  recordMapStatus,
  setCenter,
  setZoom,
  initMarkerCluster,
  addClusteredGisMarker,
} from "@/visualization-core/event/register/gis";
const ZD_ASSETS = "/resource/v1/ue5-migrate/components/businessPanel/zhongda-heshun/assets";
const gisMarkerUser = `${ZD_ASSETS}/icon/gis-marker-user.webp`;
const gisMarkerKeyPlace = `${ZD_ASSETS}/svg/key-place.svg`;
const gisMarkerProject = `${ZD_ASSETS}/svg/project.svg`;
import { message } from "ant-design-vue";
import Decimal from "decimal.js";
import type { Marker } from "leaflet";

import type { KeyPlacePageVO, ProjectPageVO } from "@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto";

import { projectStore } from "../store/project";
import { findBestMatchingIcon } from "./icon-helper";
import { KeyPlacePopup } from "@/features/cards/zhongda-heshun/components/popup/key-place-popup/key-place-popup";
import { ProjectPopup } from "@/features/cards/zhongda-heshun/components/popup/project-popup/project-popup";
import { UserPopup } from "@/features/cards/zhongda-heshun/components/popup/user-popup/user-popup";
import { cubeCommunicateService } from "@/infrastructure/api/service";
const store = projectStore();
const iconMap = new Map<string, string>([]);

async function domToBase64(dom: HTMLDivElement, width = 48, height = 48): Promise<string> {
  const svgStr = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        ${new XMLSerializer().serializeToString(dom)}
      </foreignObject>
    </svg>
  `;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
}

async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (): void => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

async function createIconBase64(iconPath: string, backgroundColor: string, imgType?: string): Promise<string> {
  // 检查缓存
  const cacheKey = iconPath + backgroundColor;
  const cached = iconMap.get(cacheKey);
  if (cached) return cached;

  // 创建DOM容器
  const dom = document.createElement("div");
  dom.style.cssText = `
    width: 42px;
    height: 42px;
    background: ${backgroundColor};
    border: 1px solid #e6ecff;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    z-index:999999
  `;

  const imgBase64 = await urlToBase64(iconPath);
  dom.innerHTML = `<img src="${imgBase64}" style="${imgType === "custom" ? "width: 40px; height: 40px; border-radius: 50%;" : "width: 30px; height: 30px;"}">`;
  const base64 = await domToBase64(dom);
  // 缓存结果
  iconMap.set(cacheKey, base64);
  return base64;
}

/**
 * 在当前地图上创建一个用户标记
 * @param userInfo 用户信息
 * @param position 位置信息
 * @param focus 是否聚焦
 */
export const createUserMarker = async (
  userInfo: UserInfo,
  position?: { lng: number; lat: number },
  focus = false,
  create = true,
): Promise<Marker | void> => {
  if (!position) {
    try {
      const userId = userInfo?.id || (userInfo as unknown as { userId: string })?.userId;
      const res = await cubeCommunicateService.getHistoryTrack({ userId: userId, pageSize: 1, pageNumber: 1 });
      if (!res.records.length) {
        if (focus) {
          message.destroy();
          message.error(userInfo.name + "暂未无位置信息");
        }
        return;
      }
      position = {
        lng: res.records[0].lng,
        lat: res.records[0].lat,
      };
    } catch {
      if (focus) message.error("人员经纬度获取失败");
      return;
    }
  }
  const icon = await createIconBase64(gisMarkerUser, "#16B8D7");
  // 使用聚合标记点替代普通标记点
  let marker = null;
  if (create) {
    marker = await addClusteredGisMarker({
      position: position,
      icon: icon,
      iconSize: [42, 42],
      popVNode: h(UserPopup, { userInfo, position }),
    });
  }
  if (focus) {
    await setCenter(position);
    await setZoom(15);
  }
  return marker;
};

/**
 * 在当前地图上创建一个重点场所标记
 * @param keyPlace 重点场所信息
 * @param position 位置信息
 */

export const createKeyPlaceMarker = async (
  keyPlace: KeyPlacePageVO,
  position?: { lng: number; lat: number },
  focus = false,
  showTotal = false,
  showRange = true,
): Promise<void> => {
  // const keyPlaceName = keyPlace.placeTypeName ??  keyPlace.placeName
  // const placeIcon = findBestMatchingIcon(keyPlaceName)
  const placeIcon = keyPlace.placeTypeIcon?.path;
  const icon = await createIconBase64(placeIcon, "#4382F0", "custom");
  const keyPlaceData = {
    ...keyPlace,
    name: keyPlace.placeName,
    address: keyPlace.placeDetail,
    type: keyPlace.placeTypeName,
    // pic: keyPlace.files?.length ? keyPlace.files[0].path : keyPlace.placeTypeIcon ? keyPlace.placeTypeIcon?.path : '',
    pic: keyPlace.files?.length ? keyPlace.files[0].path : "",
  };
  if (showRange) {
    drawProjectRange({ hideZoom: true });
  }

  // 使用聚合标记点替代普通标记点
  addClusteredGisMarker({
    position: position,
    icon: icon,
    iconSize: [42, 42],
    popVNode: h(KeyPlacePopup, { keyPlace: keyPlaceData, showTotal }),
  });
  if (focus) {
    await setCenter(position);
    let { zoom } = recordMapStatus();
    await setZoom(zoom);
  }
};

/**
 * 在当前地图上创建一个项目标记
 * @param keyPlace 项目信息
 * @param position 位置信息
 */

export const createProjectMarker = async (
  project: ProjectPageVO,
  position?: { lng: number; lat: number },
  focus = false,
): Promise<void> => {
  const icon = await createIconBase64(gisMarkerProject, "#4382F0");
  const projectData = {
    ...project,
  };
  //
  // 使用聚合标记点替代普通标记点
  addClusteredGisMarker({
    position: position,
    icon: icon,
    iconSize: [42, 42],
    popVNode: h(ProjectPopup, { project: projectData }),
  });
  if (focus) {
    await setCenter(position);
    await setZoom(15);
  }
};

let overviewData = {
  geoJson: null,
  center: null,
  zoom: null,
};

/** 恢复地图初始状态 */
export const restoreTheInitialStateOfTheMap = async (): Promise<void> => {
  if (store.currentProject) {
    drawProjectRange();
    return;
  }
  if (overviewData.geoJson) {
    clearMap();
    // clearClusteredMarkers() // 清除聚合标记点
    await drawLayerByGeoJson(overviewData.geoJson, true);
    // 记录地图状态
    let { zoom } = recordMapStatus();
    await setZoom(zoom);
  }
};

/** 绘制GeoJson */
export const drawGeoJsonLayer = async (): Promise<void> => {
  if (overviewData.geoJson) {
    restoreTheInitialStateOfTheMap();
    return;
  }
  await fetch("./map/440300.json")
    .then(async (res) => res.json())
    .then((data) => {
      // 检查CRS属性，确保坐标系正确
      if (!data.crs) {
        // 如果没有指定CRS，添加WGS84作为默认值
        data.crs = {
          type: "name",
          properties: {
            name: "urn:ogc:def:crs:OGC:1.3:CRS84",
          },
        };
      }
      overviewData.geoJson = data;
    });
  restoreTheInitialStateOfTheMap();
};

/** 绘制项目范围 */
export const drawProjectRange = async (props?: { hideZoom?: boolean }): Promise<void> => {
  if (store.currentProject) {
    const project = store.currentProject;
    // 使用正则匹配所有经纬度对
    const regex = /(\d+\.\d+),(\d+\.\d+)/g;
    const matches = [...project.disinfectionScope.matchAll(regex)];

    // 转换为 {lng, lat} 对象数组
    const coordinates = matches.map((match) => ({
      lng: new Decimal(match[1]).toNumber(),
      lat: new Decimal(match[2]).toNumber(),
    }));
    clearMap();
    await drawGisPolygon(coordinates, !props?.hideZoom);

    // // 修改这里：如果不隐藏缩放，则自动缩放到可视区域
    // if (!props?.hideZoom) {
    //   // autoZoom(coordinates)

    // }
  }
  drawAllProjectRange();
};
export const drawAllProjectRange = async (): Promise<void> => {
  if (store.projects?.length) {
    const otherProjects = store.projects.filter((project) => project.id !== store.currentProject?.id);
    await Promise.all(
      otherProjects.map(async (project) => {
        // 使用正则匹配所有经纬度对
        const regex = /(\d+\.\d+),(\d+\.\d+)/g;
        const matches = [...project.disinfectionScope.matchAll(regex)];

        // 转换为 {lng, lat} 对象数组
        const coordinates = matches.map((match) => ({
          lng: new Decimal(match[1]).toNumber(),
          lat: new Decimal(match[2]).toNumber(),
        }));
        await drawGisPolygon(coordinates, false);
      }),
    );

    // const project = store.currentProject
    // // 使用正则匹配所有经纬度对
    // const regex = /(\d+\.\d+),(\d+\.\d+)/g;
    // const matches = [...project.disinfectionScope.matchAll(regex)];

    // // 转换为 {lng, lat} 对象数组
    // const coordinates = matches.map(match => ({
    //   lng: new Decimal(match[1]).toNumber(),
    //   lat: new Decimal(match[2]).toNumber()
    // }));
  }
};
// 添加一个初始化函数，用于在地图加载时调用
/**
 * 初始化地图点聚合功能
 * @param options 聚合配置选项
 */
export const initMapCluster = (options?: {
  maxClusterRadius?: number; // 聚合半径，默认80
  disableClusteringAtZoom?: number; // 禁用聚合的缩放级别，小于该级别时聚合，大于该级别时不聚合
  spiderfyOnMaxZoom?: boolean; // 当点击聚合点时是否展开显示所有点
}): void => {
  initMarkerCluster(
    options || {
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
    },
  );
};
