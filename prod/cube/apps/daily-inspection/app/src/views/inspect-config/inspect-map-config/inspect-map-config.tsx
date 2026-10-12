import { defineComponent, nextTick, onBeforeUnmount, onMounted, reactive } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type { GetDictionaryByItem } from "@ghcloud/cube-dictionary-service";
import { CubeMapLeaflet } from "@ghcloud/cube-map-plugins";
import { Button, Input, InputNumber, Slider, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { authStore } from "@/api/auth-store";
import { cubeDictionaryService } from "@/api/server";
import { ensureLeafletForCubeMap } from "@/utils/prepare-leaflet-for-cube-map";

import styles from "./inspect-map-config.module.less";

const MAP_CONTAINER_ID = "daily-inspection-map-config";
const DICT_CODE = "DAILY_INSPECTION_MAP_CONFIG";
const DEFAULT_CENTER = { lng: 116.397428, lat: 39.90923 };
const DEFAULT_ROTATION = 0;
const DEFAULT_ZOOM = 14;
const DEFAULT_RADIUS = 0;
const CONFIG_CODES = ["lnglat", "rotation", "zoom", "radius"] as const;

type MapConfigCode = (typeof CONFIG_CODES)[number];
type MapConfig = Record<MapConfigCode, GetDictionaryByItem>;

const createConfigItem = (code: MapConfigCode, variable: string): GetDictionaryByItem => {
  const nameMap: Record<MapConfigCode, string> = {
    lnglat: "中心坐标",
    rotation: "旋转角度",
    zoom: "放大层级",
    radius: "有效范围",
  };
  return {
    id: "",
    name: nameMap[code],
    code,
    remarks: "",
    version: "0",
    flag: false,
    variable,
    itemCode: DICT_CODE,
  };
};

const createDefaultConfig = (): MapConfig => ({
  lnglat: createConfigItem("lnglat", `${DEFAULT_CENTER.lng},${DEFAULT_CENTER.lat}`),
  rotation: createConfigItem("rotation", String(DEFAULT_ROTATION)),
  zoom: createConfigItem("zoom", String(DEFAULT_ZOOM)),
  radius: createConfigItem("radius", String(DEFAULT_RADIUS)),
});

const parseCenter = (value: string | undefined): { lng: number; lat: number } => {
  const [lng, lat] = String(value || "")
    .split(",")
    .map(Number);
  if (Number.isFinite(lng) && Number.isFinite(lat)) {
    return { lng, lat };
  }
  return DEFAULT_CENTER;
};

const parseFiniteNumber = (value: string | number | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const InspectMapConfig = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const cubeMapLeaflet = new CubeMapLeaflet(authStore);
    let disposed = false;
    const state = reactive<{
      mapConfig: MapConfig;
      addressValue: string;
      subLoading: boolean;
      radius: number;
      rotation: number;
      zoom: number;
    }>({
      mapConfig: createDefaultConfig(),
      addressValue: "",
      subLoading: false,
      radius: DEFAULT_RADIUS,
      rotation: DEFAULT_ROTATION,
      zoom: DEFAULT_ZOOM,
    });

    const getCenter = (): { lng: number; lat: number } => parseCenter(state.mapConfig.lnglat.variable);

    const drawCircle = (): void => {
      cubeMapLeaflet.clearCircles();
      const radius = parseFiniteNumber(state.radius, DEFAULT_RADIUS);
      if (radius <= 0) {
        return;
      }
      cubeMapLeaflet.addCircle({
        center: getCenter(),
        radius,
      });
    };

    const drawMarker = (lng: number, lat: number): void => {
      cubeMapLeaflet.clearMarkers();
      cubeMapLeaflet.addMarker({
        position: {
          lng,
          lat,
        },
      });
      void cubeMapLeaflet.setCenter(lng, lat);
    };

    const syncMapFromState = async (): Promise<void> => {
      const center = getCenter();
      state.radius = parseFiniteNumber(state.mapConfig.radius.variable, DEFAULT_RADIUS);
      state.rotation = parseFiniteNumber(state.mapConfig.rotation.variable, DEFAULT_ROTATION);
      state.zoom = parseFiniteNumber(state.mapConfig.zoom.variable, DEFAULT_ZOOM);
      try {
        const resultAddr = await cubeMapLeaflet.getAddressByLntLat(center.lng, center.lat);
        if (disposed) {
          return;
        }
        state.addressValue = resultAddr.address;
      } catch {
        if (disposed) {
          return;
        }
        state.addressValue = "";
      }
      cubeMapLeaflet.clearMarkers();
      cubeMapLeaflet.addMarker({ position: center });
      await cubeMapLeaflet.setZoom(state.zoom);
      cubeMapLeaflet.setRotation(state.rotation);
      await cubeMapLeaflet.setCenter(center.lng, center.lat);
      drawCircle();
    };

    const initMapConfig = async (): Promise<void> => {
      const res = await cubeDictionaryService.getDictionaryByItem({
        itemCode: DICT_CODE,
      });
      if (disposed) {
        return;
      }
      const defaults = createDefaultConfig();
      state.mapConfig = CONFIG_CODES.reduce((config, code) => {
        const item = res.find((dict) => dict.code === code);
        config[code] = item ?? defaults[code];
        return config;
      }, {} as MapConfig);
      await syncMapFromState();
    };

    const getDictionary = async (): Promise<void> => {
      const inspectDict = await cubeDictionaryService.getDictionaryItemByCode({
        code: DICT_CODE,
      });
      if (disposed) {
        return;
      }
      if (!inspectDict) {
        await cubeDictionaryService.addDataDictionaryItem({
          code: DICT_CODE,
          remarks: "巡检地图配置",
        });
        if (disposed) {
          return;
        }
      }
      await initMapConfig();
    };

    const refreshMapSize = (): void => {
      requestAnimationFrame(() => {
        try {
          cubeMapLeaflet.getMapInstance().invalidateSize(true);
        } catch {}
      });
    };

    const handleSearch = (): void => {
      if (!state.addressValue) {
        message.warning("请输入地址");
        return;
      }
      cubeMapLeaflet
        .getLntLatByAddress(state.addressValue)
        .then((res) => {
          state.mapConfig.lnglat.variable = `${res.lng},${res.lat}`;
          drawMarker(res.lng, res.lat);
          drawCircle();
        })
        .catch(() => {
          message.error("获取地址失败");
        });
    };

    const handleRadiusChange = (): void => {
      state.mapConfig.radius.variable = String(parseFiniteNumber(state.radius, DEFAULT_RADIUS));
      drawCircle();
    };

    const handleRotationChange = (): void => {
      state.mapConfig.rotation.variable = String(parseFiniteNumber(state.rotation, DEFAULT_ROTATION));
      cubeMapLeaflet.setRotation(state.rotation);
    };

    const handleZoomChange = (): void => {
      state.mapConfig.zoom.variable = String(parseFiniteNumber(state.zoom, DEFAULT_ZOOM));
      void cubeMapLeaflet.setZoom(state.zoom);
    };

    const handleSave = async (): Promise<void> => {
      state.subLoading = true;
      try {
        state.mapConfig.radius.variable = String(parseFiniteNumber(state.radius, DEFAULT_RADIUS));
        state.mapConfig.rotation.variable = String(parseFiniteNumber(state.rotation, DEFAULT_ROTATION));
        state.mapConfig.zoom.variable = String(parseFiniteNumber(state.zoom, DEFAULT_ZOOM));
        for (const code of CONFIG_CODES) {
          const config = state.mapConfig[code];
          if (!config.id) {
            await cubeDictionaryService.addDataDictionary(config);
          } else {
            await cubeDictionaryService.updateDataDictionary(config);
          }
        }
        message.success("保存成功");
        state.subLoading = false;
        await initMapConfig();
      } catch {
        message.error("保存失败");
        state.subLoading = false;
      } finally {
        state.subLoading = false;
      }
    };

    onMounted(async () => {
      try {
        disposed = false;
        await nextTick();
        await ensureLeafletForCubeMap();
        if (disposed) {
          return;
        }
        await cubeMapLeaflet.renderMap(MAP_CONTAINER_ID);
        if (disposed) {
          cubeMapLeaflet.destroy();
          return;
        }
        cubeMapLeaflet.registerMapClickEvent();
        cubeMapLeaflet.onMapClick = async (event): Promise<void> => {
          if (disposed) {
            return;
          }
          state.mapConfig.lnglat.variable = `${event.lng},${event.lat}`;
          try {
            const result = await cubeMapLeaflet.getAddressByLntLat(event.lng, event.lat);
            if (disposed) {
              return;
            }
            state.addressValue = result.address;
          } catch {
            if (disposed) {
              return;
            }
            state.addressValue = "";
          }
          drawMarker(event.lng, event.lat);
          drawCircle();
        };
        await getDictionary();
        refreshMapSize();
        setTimeout(refreshMapSize, 200);
      } catch {
        if (!disposed) {
          message.error("地图加载失败");
        }
      }
    });

    onBeforeUnmount(() => {
      disposed = true;
      try {
        cubeMapLeaflet.onMapClick = null;
        cubeMapLeaflet.destroy();
      } catch {}
    });

    const slots = {
      "layout-content": (): JSX.Element => (
        <div class={styles.mapConfig}>
          <div class={styles.toolbar}>
            <div class={styles.control}>
              <span class={styles.label}>地址：</span>
              <Input
                class={styles.input}
                v-model:value={state.addressValue}
                placeholder="请输入位置信息"
                maxlength={999}
                showCount={false}
              />
              <Button type="primary" onClick={handleSearch}>
                搜索定位
              </Button>
            </div>
            <div class={styles.control}>
              <span class={styles.label}>有效范围半径(米)：</span>
              <InputNumber
                class={styles.input}
                v-model:value={state.radius}
                placeholder="有效范围半径"
                min={0}
                onChange={handleRadiusChange}
              />
            </div>
            <div class={styles.control}>
              <span class={styles.label}>旋转角度：</span>
              <Slider class={styles.slider} v-model:value={state.rotation} min={0} max={180} step={0.5} onChange={handleRotationChange} />
            </div>
            <div class={styles.control}>
              <span class={styles.label}>缩放层级：</span>
              <Slider class={styles.slider} v-model:value={state.zoom} min={3} max={18} step={0.5} onChange={handleZoomChange} />
            </div>
          </div>
          <div id={MAP_CONTAINER_ID} class={styles.map} />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <div class={styles.footer}>
          <Button type="primary" onClick={handleSave} loading={state.subLoading}>
            保存
          </Button>
        </div>
      ),
    };

    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={slots} />;
  },
});
