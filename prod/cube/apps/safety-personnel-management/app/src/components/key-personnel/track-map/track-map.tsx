import { defineComponent, nextTick, onMounted, ref, watch } from "vue";
import type { PropType } from "vue";

import { CubeMapLeaflet } from "@ghcloud/cube-map-plugins";
import { Spin, message } from "@ghcloud/cube-ui";

import { authStore } from "@/api/auth-store";
import { getDispatchMapCenter } from "@/utils/key-personnel/dispatch-map-config";
import { ensureLeafletForCubeMap } from "@/utils/key-personnel/prepare-leaflet-for-cube-map";

import styles from "./track-map.module.less";

/** 与 generic-component 地图选点一致：固定容器 id + 模块级单例，避免反复 init/destroy */
const MAP_CONTAINER_ID = "safety-personnel-key-personnel-track-map";
let cubeMap: CubeMapLeaflet | null = null;

export interface TrackPoint {
  lng: number;
  lat: number;
}

type TrackLayer = { remove?: () => void };
let trackLayers: TrackLayer[] = [];

function isMapContainerAlive(): boolean {
  if (!cubeMap) {
    return false;
  }
  try {
    return Boolean(cubeMap.getMapInstance()?.getContainer()?.isConnected);
  } catch {
    return false;
  }
}

function clearTrackLayers(): void {
  trackLayers.forEach((layer) => {
    try {
      layer.remove?.();
    } catch {
      // ignore
    }
  });
  trackLayers = [];
}

function createTrackPointIcon(label: string, type: "start" | "end" | "point"): unknown {
  const L = (window as unknown as { L?: any }).L;
  return L.divIcon({
    className: styles.trackMarker,
    html: `<span class="${styles[`trackMarkerInner${type === "start" ? "Start" : type === "end" ? "End" : ""}`]}">${label}</span>`,
    iconAnchor: [13, 13],
    iconSize: [26, 26],
  });
}

function renderTrack(points: TrackPoint[]): void {
  const map = cubeMap?.getMapInstance();
  const L = (window as unknown as { L?: any }).L;
  if (!map || !L) {
    return;
  }
  clearTrackLayers();
  const validPoints = points.filter((point) => Number.isFinite(point.lng) && Number.isFinite(point.lat));
  if (validPoints.length === 0) {
    return;
  }
  const latLngs = validPoints.map((point) => [point.lat, point.lng]);
  if (validPoints.length > 1) {
    trackLayers.push(
      L.polyline(latLngs, {
        color: "#1677ff",
        weight: 5,
        opacity: 0.9,
      }).addTo(map),
      L.polyline(latLngs, {
        color: "#ffffff",
        weight: 2,
        opacity: 0.9,
        dashArray: "8 10",
      }).addTo(map),
    );
  }
  validPoints.forEach((point, index) => {
    const isStart = index === 0;
    const isEnd = index === validPoints.length - 1;
    const label = isStart ? "起" : isEnd ? "终" : String(index + 1);
    trackLayers.push(
      L.marker([point.lat, point.lng], {
        icon: createTrackPointIcon(label, isStart ? "start" : isEnd ? "end" : "point"),
        zIndexOffset: isStart || isEnd ? 500 : 300,
      }).addTo(map),
    );
  });
  try {
    const bounds = L.latLngBounds(latLngs);
    if (validPoints.length === 1) {
      void cubeMap?.setCenter(validPoints[0].lng, validPoints[0].lat);
    } else {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 18, animate: false });
    }
  } catch {
    // ignore
  }
}

export const TrackMap = defineComponent({
  props: {
    personLabel: { type: String, default: "" },
    trackPoints: { type: Array as PropType<TrackPoint[]>, default: () => [] },
  },
  setup(props) {
    const loading = ref(true);

    const refreshMapSize = (): void => {
      requestAnimationFrame(() => {
        try {
          cubeMap?.getMapInstance()?.invalidateSize(true);
        } catch {
          // ignore
        }
      });
    };

    onMounted(async () => {
      if (!authStore.token || !authStore.tenant) {
        loading.value = false;
        message.error("未获取登录信息，地图无法加载，请从 Portal 进入或先登录");
        return;
      }
      await nextTick();
      try {
        if (!cubeMap || !isMapContainerAlive()) {
          if (cubeMap) {
            try {
              cubeMap.destroy();
            } catch {
              // ignore
            }
            cubeMap = null;
          }
          let center: { lng: number; lat: number } | undefined;
          try {
            center = (await getDispatchMapCenter()) ?? undefined;
          } catch {
            // 调度地图配置获取失败时使用地图组件内置默认中心
          }
          await ensureLeafletForCubeMap();
          cubeMap = new CubeMapLeaflet(authStore);
          await cubeMap.renderMap(MAP_CONTAINER_ID, center ? { center } : undefined);
        }
        renderTrack(props.trackPoints);
        refreshMapSize();
        setTimeout(refreshMapSize, 200);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "地图加载失败";
        message.error(msg.includes("地图配置") ? "未配置天地图/高德字典（THIRD_SERVICE → TD_MAP），请联系管理员" : msg);
      } finally {
        loading.value = false;
        refreshMapSize();
      }
    });

    watch(
      () => props.trackPoints,
      (points) => {
        renderTrack(points);
      },
      { deep: true },
    );

    return (): JSX.Element => (
      <div class={styles.wrap}>
        <div id={MAP_CONTAINER_ID} class={styles.map} />
        {loading.value ? (
          <div class={styles.loadingMask}>
            <Spin />
          </div>
        ) : null}
        {props.personLabel ? <div class={styles.overlay}>{props.personLabel}</div> : null}
      </div>
    );
  },
});
