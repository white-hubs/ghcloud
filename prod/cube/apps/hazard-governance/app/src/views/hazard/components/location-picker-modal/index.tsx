import { defineComponent, nextTick, onBeforeUnmount, reactive, ref, shallowRef } from "vue";

import { CubeMapLeaflet } from "@ghcloud/cube-map-plugins";
import { Input, Modal, Spin, message } from "@ghcloud/cube-ui";

import { authStore } from "@/api/auth-store";
import { getDispatchMapCenter } from "@/api/dispatch-map-config";
import { ensureLeafletForCubeMap } from "@/utils/prepare-leaflet-for-cube-map";

export interface HazardLocationValue {
  locationName: string;
  longitude?: number | null;
  latitude?: number | null;
}

export interface LocationPickerModalExpose {
  openModal: (value?: HazardLocationValue) => void;
}

let mapSeq = 0;

const DEFAULT_CENTER = { lng: 116.397428, lat: 39.90923 };

const isValidCoordinate = (lng: number, lat: number): boolean =>
  Number.isFinite(lng) && Number.isFinite(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90 && !(lng === 0 && lat === 0);

const readFiniteNumber = (value: number | string | null | undefined): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
};

const waitForNextFrame = async (): Promise<void> => {
  await nextTick();
  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
};

export const LocationPickerModal = defineComponent({
  name: "LocationPickerModal",
  emits: ["selected"],
  setup: (_, { emit, expose }) => {
    const visible = shallowRef(false);
    const loading = shallowRef(false);
    const mapId = `hazard-location-picker-map-${++mapSeq}`;
    const mapEl = ref<HTMLDivElement | null>(null);
    const selected = reactive<HazardLocationValue>({
      locationName: "",
      longitude: undefined,
      latitude: undefined,
    });
    let cubeMap: CubeMapLeaflet | null = null;
    let disposed = false;

    const getSelectedPoint = (): { lng: number; lat: number } | undefined => {
      const lng = readFiniteNumber(selected.longitude);
      const lat = readFiniteNumber(selected.latitude);
      return lng !== undefined && lat !== undefined && isValidCoordinate(lng, lat) ? { lng, lat } : undefined;
    };

    const hasSelectedPoint = (): boolean => Boolean(getSelectedPoint());

    const destroyMap = (): void => {
      try {
        cubeMap?.destroy();
      } catch {}
      cubeMap = null;
    };

    const waitForMapContainer = async (): Promise<boolean> => {
      for (let i = 0; i < 8; i += 1) {
        await waitForNextFrame();
        if (disposed) return false;
        if (mapEl.value || document.getElementById(mapId)) {
          return true;
        }
      }
      return false;
    };

    const renderCubeMap = async (center: { lng: number; lat: number } | undefined): Promise<boolean> => {
      for (let i = 0; i < 5; i += 1) {
        if (disposed) return false;
        if (!document.getElementById(mapId)) {
          await waitForNextFrame();
          continue;
        }
        try {
          destroyMap();
          cubeMap = new CubeMapLeaflet(authStore);
          await cubeMap.renderMap(mapId, { center: center ?? DEFAULT_CENTER });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "";
          destroyMap();
          if (!errorMessage.includes("Map container not found")) {
            throw error;
          }
          await waitForNextFrame();
        }
      }
      return false;
    };

    const drawSelectedPoint = (): void => {
      if (!cubeMap || !hasSelectedPoint()) return;
      const point = getSelectedPoint();
      if (!point) return;
      cubeMap.clearMap();
      cubeMap.addMarker({
        position: point,
      });
      void cubeMap.setCenter(point.lng, point.lat);
    };

    const drawCenterPoint = (center: { lng: number; lat: number }): void => {
      if (!cubeMap) return;
      cubeMap.clearMap();
      cubeMap.addMarker({
        position: center,
      });
      void cubeMap.setCenter(center.lng, center.lat);
    };

    const initMap = async (): Promise<void> => {
      loading.value = true;
      try {
        if (!authStore.token || !authStore.tenant) {
          message.error("未获取登录信息，地图无法加载，请从 Portal 进入或先登录");
          return;
        }
        const hasContainer = await waitForMapContainer();
        if (!hasContainer || disposed) {
          return;
        }
        await ensureLeafletForCubeMap();
        if (disposed) return;
        let center = getSelectedPoint();
        if (!center) {
          try {
            center = (await getDispatchMapCenter()) ?? undefined;
          } catch {
            center = undefined;
          }
        }
        center = center ?? DEFAULT_CENTER;
        const rendered = await renderCubeMap(center);
        if (!rendered || disposed || !cubeMap) return;
        await cubeMap.setCenter(center.lng, center.lat);
        cubeMap.registerMapClickEvent();
        cubeMap.onMapClick = async (event) => {
          selected.longitude = event.lng;
          selected.latitude = event.lat;
          try {
            const addressInfo = await cubeMap?.getAddressByLntLat(event.lng, event.lat);
            selected.locationName = addressInfo?.address || `${event.lng.toFixed(6)}, ${event.lat.toFixed(6)}`;
          } catch {
            selected.locationName = `${event.lng.toFixed(6)}, ${event.lat.toFixed(6)}`;
          }
          drawSelectedPoint();
        };
        if (hasSelectedPoint()) {
          drawSelectedPoint();
        } else {
          drawCenterPoint(center);
        }
        setTimeout(() => {
          try {
            cubeMap?.getMapInstance().invalidateSize(true);
          } catch {}
        }, 200);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "地图加载失败";
        console.error(error);
        if (!disposed && !errorMessage.includes("Map container not found")) {
          message.error(errorMessage);
        }
      } finally {
        loading.value = false;
      }
    };

    const openModal = (value?: HazardLocationValue): void => {
      disposed = false;
      selected.locationName = value?.locationName || "";
      selected.longitude = readFiniteNumber(value?.longitude);
      selected.latitude = readFiniteNumber(value?.latitude);
      visible.value = true;
      void initMap();
    };

    const closeModal = (): void => {
      visible.value = false;
      mapEl.value = null;
      destroyMap();
    };

    const handleOk = (): void => {
      if (!hasSelectedPoint()) {
        message.error("请在地图上选择位置");
        return;
      }
      emit("selected", { ...selected });
      closeModal();
    };

    onBeforeUnmount(() => {
      disposed = true;
      destroyMap();
    });

    expose({ openModal });

    return () => (
      <Modal v-model:visible={visible.value} title="选择位置" width="1000px" destroyOnClose onOk={handleOk} onCancel={closeModal}>
        <div class="hazard-location-picker">
          <Input value={selected.locationName} placeholder="请在地图上点击选择位置" disabled />
          <Spin spinning={loading.value}>
            <div id={mapId} ref={mapEl} class="hazard-location-picker-map" />
          </Spin>
        </div>
      </Modal>
    );
  },
});
