import AMapLoader from "@amap/amap-jsapi-loader";
import { transformGCJ02ToWGS84, transformWGS84ToGCJ02 } from "@isvend/coord-transform";
import type L from "leaflet";

import { CubeDictionaryService, type CubeAuth } from "@ghcloud/cube-dictionary-service";

import type { MapConfig, MapType } from "./type";

/** 地图核心类 主要实现一些强业务的操作 如：字典服务查询 经纬度查询 逆地址解析等 */
export class CubeMapCore {
  public onMapClick: ((event: { mapType: MapType; lng: number; lat: number }) => void) | null = null;

  protected mapType: MapType = "gdMap";
  protected mapInstance: L.Map | null = null;
  protected mapLoaded = false;
  protected mapConfig: MapConfig | null = null;
  private readonly auth: CubeAuth;

  public constructor(auth: CubeAuth) {
    this.auth = auth;
  }

  public async getAddressByLntLat(
    lng: number,
    lat: number,
  ): Promise<{
    address: string;
  }> {
    await this.mapLoader();
    if (this.mapType === "gdMap") {
      return new Promise((resolve, reject) => {
        window.AMap.plugin(["AMap.Geocoder"], () => {
          const geocoder = new window.AMap.Geocoder({ city: "全国" });
          geocoder.getAddress([lng, lat], function (status: string, result: { regeocode: { formattedAddress: any } }) {
            if (status === "complete" && result.regeocode) {
              const address = result.regeocode.formattedAddress;
              resolve({ address });
            } else {
              reject(new Error("高德获取地址失败"));
            }
          });
        });
      });
    } else {
      // 天地图逆地理使用 WGS84；Leaflet/业务侧为 GCJ02，与 getLntLatByAddress 输出一致，须先转为 WGS84
      const [wgsLng, wgsLat] = transformGCJ02ToWGS84(lng, lat);
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://api.tianditu.gov.cn/apiserver/ajaxproxy?proxyReqUrl=" +
          encodeURIComponent(
            `http://api.tianditu.gov.cn/geocoder?postStr={"lon":"${wgsLng}","lat":"${wgsLat}"}&type=geocode&tk=${this.mapConfig?.webKey}`,
          );
        script.onload = (): void => {
          document.body.removeChild(script);
          try {
            resolve({ address: window.tdt_loadResult?.result.formatted_address });
          } catch {
            reject(new Error("获取地址失败"));
          }
        };
        document.body.appendChild(script);
      });
    }
  }

  public async getLntLatByAddress(address: string): Promise<{ lng: number; lat: number }> {
    await this.mapLoader();
    if (this.mapType === "gdMap") {
      return new Promise((resolve, reject) => {
        window.AMap.plugin(["AMap.Geocoder"], () => {
          const geocoder = new window.AMap.Geocoder({ city: "全国" });
          geocoder.getLocation(
            address,
            function (status: string, result: { info: string; geocodes: { location: { lat: number; lng: number } }[] }) {
              if (status === "complete" && result.info === "OK") {
                const lngLat = {
                  lng: result.geocodes[0].location.lng,
                  lat: result.geocodes[0].location.lat,
                };
                resolve(lngLat);
              } else {
                reject(new Error("获取地址失败"));
              }
            },
          );
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://api.tianditu.gov.cn/apiserver/ajaxproxy?proxyReqUrl=" +
          encodeURIComponent(`http://api.tianditu.gov.cn/geocoder?ds={"keyWord":"${address}"}&type=geocode&tk=${this.mapConfig?.webKey}`);
        script.onload = (): void => {
          document.body.removeChild(script);
          try {
            const location = window.tdt_loadResult?.location;
            const locationGCJ = transformWGS84ToGCJ02(Number(location.lon), Number(location.lat));
            resolve({
              lng: locationGCJ[0],
              lat: locationGCJ[1],
            });
          } catch {
            reject(new Error("获取地址失败"));
          }
        };
        document.body.appendChild(script);
      });
    }
  }

  /** 通过浏览器获取经纬度 */
  public async getLntLatFromBrowser(): Promise<{ lng: number; lat: number; accuracy: number }> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          resolve({
            lng: longitude,
            lat: latitude,
            accuracy,
          });
        },
        (error) => {
          switch (error.code) {
            case 0:
              reject(new Error("位置信息获取失败"));
              break;
            case 1:
              reject(new Error("用户拒绝请求地理定位"));
              break;
            case 2:
              reject(new Error("浏览器哦无法获取当前位置"));
              break;
            case 3:
              reject(new Error("请求超时，请重试"));
              break;
          }
        },
        {
          timeout: 30000,
          enableHighAccuracy: true,
          maximumAge: 0,
        },
      );
    });
  }

  /** 获取地图配置 */
  public async getMapConfig(): Promise<MapConfig> {
    if (this.mapConfig) {
      return this.mapConfig;
    }
    const cubeDictionaryService = new CubeDictionaryService(this.auth);
    const tdConfig = await cubeDictionaryService.getDictionaryByItem({ itemCode: "THIRD_SERVICE", code: "TD_MAP" });
    if (tdConfig.length > 0 && tdConfig?.[0]?.variable) {
      this.mapType = "TD_MAP";
      this.mapConfig = JSON.parse(tdConfig[0].variable) as unknown as MapConfig;
    } else {
      this.mapType = "gdMap";
      const gdConfig = await cubeDictionaryService.getDictionaryByItem({ itemCode: "THIRD_SERVICE", code: "gdMap" });
      if (gdConfig.length === 0 || !gdConfig?.[0]?.variable) {
        throw new Error("未获取到地图配置");
      }
      this.mapConfig = JSON.parse(gdConfig[0].variable) as unknown as MapConfig;
    }
    return this.mapConfig;
  }

  public async mapLoader(): Promise<void> {
    if (this.mapLoaded) {
      return;
    }
    const config = await this.getMapConfig();
    if (this.mapType === "gdMap") {
      if (config.securityJsCode) {
        window._AMapSecurityConfig = {
          securityJsCode: config.securityJsCode,
        };
      }
      if (!window.AMap) {
        window.AMap = await AMapLoader.load({
          key: config.webKey, // 申请好的Web端开发者Key，首次调用 load 时必填
          version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
          plugins: [
            "AMap.Geocoder",
            "AMap.MouseTool",
            "AMap.ControlBar",
            "AMap.Walking",
            "AMap.Geolocation",
            "AMap.IndexCluster",
            "AMap.MarkerCluster",
          ],
        });
      } else {
        await new Promise<void>((resolve) => {
          window.AMap.plugin(["AMap.Geocoder"], () => resolve());
        });
      }
    } else if (!window.T) {
      await new Promise<void>((resolve) => {
        const script = document.createElement("script");
        script.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=${config.webKey}`;
        script.onload = (): void => {
          resolve();
        };
        document.body.appendChild(script);
      });
    }
    this.mapLoaded = true;
  }

  public getMapType(): MapType {
    return this.mapType;
  }

  public getMapInfo(): {
    center: { lng: number; lat: number };
    zoom: number;
    rotation: number;
  } {
    this.ensureMapInstance();
    const center = this.mapInstance.getCenter();
    if (this.mapType === "TD_MAP") {
      const location = transformWGS84ToGCJ02(center.lng, center.lat);
      center.lng = location[0];
      center.lat = location[1];
    }
    return {
      center: {
        lng: center.lng,
        lat: center.lat,
      },
      zoom: this.mapInstance.getZoom(),
      rotation: this.mapInstance.getBearing(),
    };
  }

  /** 检查地图实例是否存在，否则抛出异常 */
  protected ensureMapInstance(): asserts this is this & { mapInstance: L.Map } {
    if (!this.mapInstance) {
      throw new Error("地图实例不存在");
    }
  }
}
