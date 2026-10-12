import { defineComponent, nextTick, onBeforeUnmount, reactive, ref, shallowRef } from "vue";

import { CubeMapLeaflet } from "@ghcloud/cube-map-plugins";
import { CubeTerminalEnum } from "@ghcloud/cube-protocol";
import { Input, Modal, Spin, message } from "@ghcloud/cube-ui";

import { authStore } from "@/api/auth-store";
import { getInspectionMapConfig } from "@/api/dashboard-service";

export interface DroneHazardLocationValue {
  locationName: string;
  longitude: number | null;
  latitude: number | null;
}

export interface DroneHazardLocationPickerModalExpose {
  openModal: (value?: DroneHazardLocationValue) => void;
}

type ModalContainerResolver = () => HTMLElement;

let mapSeq = 0;

const DEFAULT_CENTER = { lng: 116.397428, lat: 39.90923 };

const readFiniteNumber = (value: number | string | null | undefined): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
};

const isValidCoordinate = (lng: number, lat: number): boolean =>
  Number.isFinite(lng) && Number.isFinite(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90 && !(lng === 0 && lat === 0);

const waitForNextFrame = async (): Promise<void> => {
  await nextTick();
  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
};

export const DroneHazardLocationPickerModal = defineComponent({
  name: "DroneHazardLocationPickerModal",
  props: {
    getContainer: {
      type: Function,
      required: false,
      default: undefined,
    },
  },
  emits: ["selected"],
  setup: (props, { emit, expose }) => {
    const visible = shallowRef(false);
    const loading = shallowRef(false);
    const mapId = `drone-hazard-location-picker-map-${++mapSeq}`;
    const mapEl = ref<HTMLDivElement | null>(null);
    const selected = reactive<DroneHazardLocationValue>({
      locationName: "",
      longitude: null,
      latitude: null,
    });
    let cubeMap: CubeMapLeaflet | null = null;
    let disposed = false;

    const getSelectedPoint = (): { lng: number; lat: number } | undefined => {
      const lng = readFiniteNumber(selected.longitude);
      const lat = readFiniteNumber(selected.latitude);
      return lng !== undefined && lat !== undefined && isValidCoordinate(lng, lat) ? { lng, lat } : undefined;
    };

    const destroyMap = (): void => {
      try {
        cubeMap?.destroy();
      } catch {}
      cubeMap = null;
    };

    const drawPoint = (point: { lng: number; lat: number }): void => {
      if (!cubeMap) return;
      cubeMap.clearMap();
      cubeMap.addMarker({ position: point });
      void cubeMap.setCenter(point.lng, point.lat);
    };

    const initMap = async (): Promise<void> => {
      loading.value = true;
      try {
        const sessionToken = JSON.parse(sessionStorage.getItem("GH-Token") || "{}").access_token || "";
        const sessionTenant = JSON.parse(sessionStorage.getItem("GH-NowEnterprise") || "{}").code || "";
        const token = authStore.token || sessionToken;
        const tenant = authStore.tenant || sessionTenant;
        const terminal = authStore.terminal || CubeTerminalEnum.BUSINESS;
        if (!token || !tenant) {
          throw new Error("地图鉴权失败");
        }
        for (let i = 0; i < 8 && !document.getElementById(mapId); i += 1) {
          await waitForNextFrame();
        }
        if (disposed || !document.getElementById(mapId)) return;
        destroyMap();
        cubeMap = new CubeMapLeaflet({ token, tenant, terminal });
        const mapConfig = await getInspectionMapConfig().catch(() => null);
        const selectedPoint = getSelectedPoint();
        const center = selectedPoint ?? mapConfig?.center ?? DEFAULT_CENTER;
        await cubeMap.renderMap(mapId, {
          center,
          zoomControl: false,
          rotateControl: false,
          mapStyle: "amap://styles/darkblue",
        });
        await cubeMap.setZoom(mapConfig?.zoom ?? 16);
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
          drawPoint({ lng: event.lng, lat: event.lat });
        };
        drawPoint(center);
      } catch (error) {
        message.error(error instanceof Error ? error.message : "地图加载失败");
      } finally {
        loading.value = false;
      }
    };

    const openModal = (value?: DroneHazardLocationValue): void => {
      disposed = false;
      selected.locationName = value?.locationName || "";
      selected.longitude = readFiniteNumber(value?.longitude) ?? null;
      selected.latitude = readFiniteNumber(value?.latitude) ?? null;
      visible.value = true;
      void initMap();
    };

    const closeModal = (): void => {
      visible.value = false;
      mapEl.value = null;
      destroyMap();
    };

    const getContainerProps = (): { getContainer?: ModalContainerResolver } => {
      return props.getContainer ? { getContainer: props.getContainer as ModalContainerResolver } : {};
    };

    const handleOk = (): void => {
      const point = getSelectedPoint();
      if (!point) {
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
      <Modal
        v-model:visible={visible.value}
        title="选择位置"
        width="900px"
        wrapClassName="drone-hazard-location-picker-wrap"
        class="drone-hazard-location-picker-modal"
        destroyOnClose
        {...getContainerProps()}
        onOk={handleOk}
        onCancel={closeModal}
      >
        <div class="drone-hazard-location-picker">
          <Input value={selected.locationName} placeholder="请在地图上点击选择位置" disabled />
          <Spin spinning={loading.value}>
            <div id={mapId} ref={mapEl} class="drone-hazard-location-picker-map" />
          </Spin>
        </div>
      </Modal>
    );
  },
});
