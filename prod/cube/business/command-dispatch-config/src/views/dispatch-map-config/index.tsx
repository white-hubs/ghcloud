import { defineComponent, nextTick, onMounted, reactive } from "vue";

import type { GetDictionaryByItem } from "@ghcloud/cube-dictionary-service";
import { CubeMapLeaflet } from "@ghcloud/cube-map-plugins";
import { Input, Button, message, Slider } from "@ghcloud/cube-ui";
import InputNumber from "@ghcloud/cube-ui/src/components/input-number/input-number";
import { usePageName } from "@ghcloud/cube-utils";

import { authStore } from "@/apis/auto-store";
import { cubeDictionaryService } from "@/apis/service";
import { GLayout } from "@/components/common/layout";

import styles from "./index.module.less";

const DEFAULT_ROTATION = 0;
const DEFAULT_ZOOM = 14;

const parseFiniteNumber = (value: string | number | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
// 调度中心配置端
const dictCode = "COMMAND_DISPATCH_MAP_CONFIG";
export const MapConfig = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const state = reactive<{
      mapConfig: Record<string, GetDictionaryByItem>;
      addressValue: string;
      radius: number;
      rotation: number;
      zoom: number;
    }>({
      mapConfig: {
        lnglat: {
          code: "",
          name: "",
          id: "",
          remarks: "",
          version: "",
          flag: false,
          variable: "",
          itemCode: "",
        },
        rotation: {
          code: "",
          name: "",
          id: "",
          remarks: "",
          version: "",
          flag: false,
          variable: "",
          itemCode: "",
        },
        zoom: {
          code: "",
          name: "",
          id: "",
          remarks: "",
          version: "",
          flag: false,
          variable: "",
          itemCode: "",
        },
        radius: {
          code: "",
          name: "",
          id: "",
          remarks: "",
          version: "",
          flag: false,
          variable: "0",
          itemCode: "",
        },
      },
      radius: 0,
      rotation: DEFAULT_ROTATION,
      zoom: DEFAULT_ZOOM,
      addressValue: "",
    });

    const layoutSlots = {
      "content-search": (): JSX.Element => {
        return (
          <div class={styles.header}>
            <div class={styles.itemControl}>
              <div class={styles.label}>地址：</div>
              <Input v-model:value={state.addressValue} placeholder="请输入位置信息" maxlength={999} showCount={false} />
              <Button type="primary" onClick={handleSearch}>
                搜索定位
              </Button>
            </div>
            <div class={styles.itemControl}>
              <div class={styles.label}>有效范围半径(米)：</div>
              <InputNumber v-model:value={state.radius} placeholder="有效范围半径" min={0} onChange={drawCircle} />
            </div>
            <div class={styles.itemControl}>
              <div class={styles.label}>旋转角度：</div>
              <Slider v-model:value={state.rotation} min={0} max={360} step={0.5} onChange={handleRotationChange} />
            </div>
            <div class={styles.itemControl}>
              <div class={styles.label}>缩放层级：</div>
              <Slider v-model:value={state.zoom} min={3} max={18} step={0.5} onChange={handleZoomChange} onAfterChange={handleZoomChange} />
              {/* <Button type='primary' onClick={getMapZoom}>获取</Button> */}
            </div>
          </div>
        );
      },
      "content-table": (): JSX.Element => {
        return <div id="mapContainer" style={{ width: "100%", height: "100%" }} />;
      },
      "footer-page": (): JSX.Element => {
        return (
          <div class={styles.footer}>
            <Button type="primary" onClick={handleSave}>
              保存
            </Button>
          </div>
        );
      },
    };
    const getDictionary = async (): Promise<void> => {
      try {
        const commandDict = await cubeDictionaryService.getDictionaryItemByCode({
          code: dictCode,
        });
        if (!commandDict) {
          await cubeDictionaryService.addDataDictionaryItem({
            code: dictCode,
            remarks: "调度中心地图配置",
          });
        }
        await initMapConfig();
      } catch {}
    };
    const initMapConfig = async (): Promise<void> => {
      const res = await cubeDictionaryService.getDictionaryByItem({
        itemCode: dictCode,
      });
      const filtercode = ["lnglat", "rotation", "zoom", "radius"];
      const resConfig = res.filter((item) => filtercode.includes(item.code));
      const config = !resConfig.length ? initConfig() : resConfig;
      state.mapConfig = Object.keys(state.mapConfig).reduce(
        (pre, item) => {
          return {
            ...pre,
            [item]:
              (config.find((i) => i.code === item) as unknown as GetDictionaryByItem) ??
              initConfig().find((config) => config.code === item),
          };
        },
        {
          ...state.mapConfig,
        },
      );
      const center = {
        lng: +state.mapConfig.lnglat.variable.split(",")[0],
        lat: +state.mapConfig.lnglat.variable.split(",")[1],
      };
      const radius = Number(state.mapConfig.radius.variable ?? 0);
      state.radius = radius;
      state.rotation = parseFiniteNumber(state.mapConfig.rotation.variable, DEFAULT_ROTATION);
      state.zoom = parseFiniteNumber(state.mapConfig.zoom.variable, DEFAULT_ZOOM);
      try {
        const resultAddr = await cubeMapLeaflet.getAddressByLntLat(center.lng, center.lat);
        state.addressValue = resultAddr.address;
      } catch {
        state.addressValue = "";
      }
      drawMarker(center.lng, center.lat);
      try {
        cubeMapLeaflet.getMapInstance().setZoom(state.zoom, { animate: false });
      } catch {}
      await cubeMapLeaflet.setCenter(center.lng, center.lat);
      cubeMapLeaflet.setRotation(state.rotation);
      drawCircle();
    };
    const initConfig = (): GetDictionaryByItem[] => {
      const addressConfig = {
        id: "",
        name: "中心坐标",
        code: "lnglat",
        remarks: "",
        version: "0",
        flag: false,
        variable: "116.397428,39.90923",
        itemCode: dictCode,
      };
      const rotationConfig = {
        id: "",
        name: "旋转角度",
        code: "rotation",
        remarks: "",
        version: "0",
        flag: false,
        variable: "0",
        itemCode: dictCode,
      };
      const zoomConfig = {
        id: "",
        name: "放大层级",
        code: "zoom",
        remarks: "",
        flag: false,
        version: "0",
        variable: "14",
        itemCode: dictCode,
      };
      const radiusConfig = {
        id: "",
        name: "有效范围",
        code: "radius",
        remarks: "",
        version: "0",
        flag: false,
        variable: "0",
        itemCode: dictCode,
      };
      return [addressConfig, rotationConfig, zoomConfig, radiusConfig];
    };
    const handleSave = async (): Promise<void> => {
      try {
        state.mapConfig.radius.variable = state.radius.toString();
        state.mapConfig.rotation.variable = state.rotation.toString();
        state.mapConfig.zoom.variable = state.zoom.toString();
        for (const keys of Object.keys(state.mapConfig)) {
          if (!state.mapConfig[keys].id) {
            await cubeDictionaryService.addDataDictionary({
              ...state.mapConfig[keys],
            });
          } else {
            await cubeDictionaryService.updateDataDictionary({
              ...state.mapConfig[keys],
            });
          }
        }
        initMapConfig();
        message.success("保存成功");
      } catch {
        message.error("保存失败");
      }
    };
    const cubeMapLeaflet = new CubeMapLeaflet(authStore);

    const applyMapZoom = (value: number | [number, number]): void => {
      const zoom = Math.min(18, Math.max(3, parseFiniteNumber(Array.isArray(value) ? value[0] : value, DEFAULT_ZOOM)));
      state.zoom = zoom;
      state.mapConfig.zoom.variable = String(zoom);
      try {
        cubeMapLeaflet.getMapInstance().setZoom(zoom, { animate: false });
      } catch {}
    };

    const handleRotationChange = (): void => {
      state.mapConfig.rotation.variable = String(parseFiniteNumber(state.rotation, DEFAULT_ROTATION));
      cubeMapLeaflet.setRotation(state.rotation);
    };

    const handleZoomChange = (value: number | [number, number]): void => {
      applyMapZoom(value);
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
          const lngLat = {
            lng: res.lng,
            lat: res.lat,
          };
          state.mapConfig.lnglat.variable = `${lngLat.lng},${lngLat.lat}`;
          drawMarker(res.lng, res.lat);
          drawCircle();
        })
        .catch(() => {
          message.error("获取地址失败");
        });
    };

    // 添加绘制圆形的方法
    const drawCircle = (): void => {
      // 先清除之前的圆形
      cubeMapLeaflet.clearCircles();

      // 获取中心点和半径
      const center = {
        lng: +state.mapConfig.lnglat.variable.split(",")[0],
        lat: +state.mapConfig.lnglat.variable.split(",")[1],
      };
      const radius = state.radius;
      if (radius > 0) {
        // 绘制圆形
        cubeMapLeaflet.addCircle({
          center,
          radius,
        });
      }
    };

    // 添加绘制标点
    const drawMarker = (lng: number, lat: number): void => {
      // 先清除之前的标点
      cubeMapLeaflet.clearMarkers();
      cubeMapLeaflet.addMarker({
        position: {
          lng,
          lat,
        },
      });
      cubeMapLeaflet.setCenter(lng, lat);
    };

    // const getMapZoom = (): void => {
    //   const res = cubeMapLeaflet.getMapInfo()
    //   state.mapConfig.rotation.variable = '' + res.rotation
    //   state.mapConfig.zoom.variable = '' + res.zoom
    // }
    onMounted(async () => {
      await nextTick();
      await initMap();
      await getDictionary();
      refreshMapSize();
      setTimeout(refreshMapSize, 200);
    });
    const initMap = async (): Promise<void> => {
      await cubeMapLeaflet.renderMap("mapContainer");
      cubeMapLeaflet.registerMapClickEvent();
      cubeMapLeaflet.onMapClick = async (event): Promise<void> => {
        state.mapConfig.lnglat.variable = `${event.lng},${event.lat}`;
        try {
          const result = await cubeMapLeaflet.getAddressByLntLat(event.lng, event.lat);
          state.addressValue = result.address;
        } catch {
          state.addressValue = "";
        }
        drawMarker(event.lng, event.lat);
        drawCircle();
      };
    };

    return (): JSX.Element => <GLayout title={pageTitle} v-slots={layoutSlots} />;
  },
});
