import { Button, Field, Popup, showNotify, showToast } from "vant";
import { computed, defineComponent, nextTick, onBeforeUnmount, reactive, ref, watch, type PropType } from "vue";

import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import { CubeMapLeaflet } from "@ghcloud/cube-map-plugins";

import { authStore } from "@/api/auth-store";
import { ensureLeafletForCubeMap } from "@/utils/prepare-leaflet-for-cube-map";
import { formatCoordinateValue } from "@/views/supplies-list/supplies-shared";

import styles from "./map-pick-field.module.less";

export type MapPickValue = {
  longitude: number | "";
  latitude: number | "";
  locationDesc: string;
};

let mapSeq = 0;

const isValidCoordinate = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

const normalizeNumber = (value: number | ""): number | undefined => {
  if (value === "" || value === null || value === undefined) return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

export const MapPickField = defineComponent({
  name: "MapPickField",
  props: {
    longitude: { type: [Number, String] as PropType<number | "">, default: "" },
    latitude: { type: [Number, String] as PropType<number | "">, default: "" },
    locationDesc: { type: String, default: "" },
  },
  emits: ["change"],
  setup: (props, { emit }) => {
    const visible = ref(false);
    const mapLoading = ref(true);
    const locating = ref(false);
    const geocoding = ref(false);
    const mapId = `supplies-map-pick-${++mapSeq}`;
    const draft = reactive({
      address: "",
      lng: 0,
      lat: 0,
    });

    let cubeMap: CubeMapLeaflet | null = null;

    const coordinateText = computed(() => formatCoordinateValue(props.longitude, props.latitude));

    const syncDraftFromProps = (): void => {
      draft.address = props.locationDesc ?? "";
      draft.lng = normalizeNumber(props.longitude) ?? 0;
      draft.lat = normalizeNumber(props.latitude) ?? 0;
    };

    const setMapPosition = (lng: number, lat: number): void => {
      if (!cubeMap || !lng || !lat) return;
      cubeMap.setCenter(lng, lat);
      cubeMap.clearMap();
      cubeMap.addMarker({
        iconSize: [19, 31.5],
        position: { lng, lat },
      });
    };

    const applyPoint = async (lng: number, lat: number, address?: string): Promise<void> => {
      draft.lng = lng;
      draft.lat = lat;
      setMapPosition(lng, lat);
      if (address !== undefined) {
        draft.address = address;
        return;
      }
      try {
        const res = await cubeMap?.getAddressByLntLat(lng, lat);
        draft.address = res?.address ?? draft.address;
      } catch {
        // ignore reverse geocode failure
      }
    };

    const initMap = async (): Promise<void> => {
      mapLoading.value = true;
      await ensureLeafletForCubeMap();
      if (!cubeMap) {
        cubeMap = new CubeMapLeaflet(authStore);
        cubeMap.onMapClick = async (event) => {
          await applyPoint(event.lng, event.lat);
        };
        await nextTick();
        await cubeMap.renderMap(mapId, {
          center: draft.lng && draft.lat ? { lng: draft.lng, lat: draft.lat } : undefined,
        });
      } else if (draft.lng && draft.lat) {
        await cubeMap.setCenter(draft.lng, draft.lat);
      }
      if (draft.lng && draft.lat) {
        setMapPosition(draft.lng, draft.lat);
      }
      mapLoading.value = false;
    };

    const open = async (): Promise<void> => {
      syncDraftFromProps();
      visible.value = true;
      await nextTick();
      await initMap();
    };

    const close = (): void => {
      visible.value = false;
    };

    const confirm = (): void => {
      if (!draft.lng || !draft.lat) {
        showNotify({ type: "warning", message: "请在地图上选择位置" });
        return;
      }
      emit("change", {
        longitude: draft.lng,
        latitude: draft.lat,
        locationDesc: draft.address,
      });
      close();
    };

    const geocodeLocate = async (): Promise<void> => {
      if (!draft.address.trim()) {
        showNotify({ type: "warning", message: "请输入位置信息" });
        return;
      }
      if (!cubeMap) return;
      geocoding.value = true;
      try {
        const res = await cubeMap.getLntLatByAddress(draft.address.trim());
        await applyPoint(res.lng, res.lat, draft.address.trim());
      } catch {
        showNotify({ type: "danger", message: "定位失败" });
      } finally {
        geocoding.value = false;
      }
    };

    const gpsLocate = async (): Promise<void> => {
      if (getEnvironment() !== "cubeApp") {
        showToast("请在移动端 App 内使用 GPS 定位");
        return;
      }
      locating.value = true;
      try {
        const location = await cubeAppService.getLocation();
        if (!location || !isValidCoordinate(location.longitude) || !isValidCoordinate(location.latitude)) {
          showNotify({ type: "warning", message: "手机 GPS 定位未开启" });
          return;
        }
        const address =
          location.address?.trim() ||
          [location.province, location.city, location.district, location.street]
            .map((item) => item?.trim())
            .filter(Boolean)
            .join("");
        await applyPoint(location.longitude, location.latitude, address || draft.address);
        showToast("定位成功");
      } catch {
        showNotify({ type: "warning", message: "手机 GPS 定位未开启" });
      } finally {
        locating.value = false;
      }
    };

    watch(
      () => visible.value,
      (show) => {
        if (!show) mapLoading.value = true;
      },
    );

    onBeforeUnmount(() => {
      cubeMap = null;
    });

    return () => (
      <>
        <Field
          label="经纬度坐标"
          label-width={96}
          modelValue={coordinateText.value}
          readonly
          isLink
          placeholder="点击选点"
          onClick={() => {
            void open();
          }}
        />
        <Field
          label="位置描述"
          label-width={96}
          modelValue={props.locationDesc}
          readonly
          isLink
          placeholder="如：A区-3号货架-2层"
          onClick={() => {
            void open();
          }}
        />

        <Popup v-model:show={visible.value} position="bottom" round={false} safeAreaInsetBottom style={{ height: "92vh" }}>
          <div class={styles.panel}>
            <div class={styles.header}>
              <button type="button" class={styles.cancel} onClick={close}>
                取消
              </button>
              <span>选择物资位置</span>
              <button type="button" class={styles.confirm} onClick={confirm}>
                确认
              </button>
            </div>

            <div class={styles.toolbar}>
              <input class={styles.addressInput} v-model={draft.address} placeholder="请输入位置信息" maxlength={160} />
              <Button
                size="small"
                type="primary"
                loading={geocoding.value}
                onClick={() => {
                  void geocodeLocate();
                }}
              >
                定位
              </Button>
              <Button
                size="small"
                plain
                type="primary"
                loading={locating.value}
                onClick={() => {
                  void gpsLocate();
                }}
              >
                GPS定位
              </Button>
            </div>

            <div class={styles.mapWrap}>
              {mapLoading.value ? <div class={styles.mapLoading}>地图加载中...</div> : null}
              <div id={mapId} class={styles.mapContainer} />
            </div>
          </div>
        </Popup>
      </>
    );
  },
});
