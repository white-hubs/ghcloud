import { transformWGS84ToGCJ02 } from "@isvend/coord-transform";

import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment, waitCubeAppReady } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";

import type { RoutePoint } from "./types";

function parseCoordinate(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const num = Number(value.trim());
    return Number.isFinite(num) ? num : null;
  }
  return null;
}

export function isCubeAppContext(): boolean {
  return getEnvironment() === "cubeApp" || Boolean(window.cubeAppBridge);
}

/** 浏览器定位 WGS84 → GCJ-02 */
export function wgs84ToBusinessPoint(lng: number, lat: number): RoutePoint {
  const [gcjLng, gcjLat] = transformWGS84ToGCJ02(lng, lat);
  return { lng: gcjLng, lat: gcjLat };
}

/**
 * App 内定位：通过 cube-app-js-sdk 调用原生 `getLocation` 桥接。
 * 原生端使用 GPS 获取经纬度后回传，与仓库内其他 H5（巡更、隐患上报等）保持一致。
 */
async function readCubeAppPosition(): Promise<RoutePoint> {
  await waitCubeAppReady();
  const location = await cubeAppService.getLocation();
  const lng = parseCoordinate(location?.longitude);
  const lat = parseCoordinate(location?.latitude);
  if (lng == null || lat == null) {
    throw new Error("cubeApp location empty");
  }
  return { lng, lat };
}

/** 仅开发环境浏览器调试使用 */
function readBrowserPosition(): Promise<RoutePoint> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve(wgs84ToBusinessPoint(pos.coords.longitude, pos.coords.latitude));
      },
      (err) => {
        reject(err);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

/**
 * 获取当前用户位置（GCJ-02，与疏散地图业务坐标一致）。
 * - App 内：优先走 SDK `cubeAppService.getLocation()`（原生 GPS）
 * - 浏览器：仅 DEV 环境用于本地调试
 */
export async function readCurrentPosition(): Promise<RoutePoint> {
  if (isCubeAppContext()) {
    return readCubeAppPosition();
  }
  if (!import.meta.env.DEV) {
    throw new Error("location requires cubeApp");
  }
  return readBrowserPosition();
}
