import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import type { DroneDetailModel, NestDetailModel, TrackDetailModel } from "@ghcloud/cube-drone-service";
import { CubeMapLeaflet } from "@ghcloud/cube-map-plugins";
import { Spin } from "@ghcloud/cube-ui";

import type { InspectionObject } from "../data";
import { authStore } from "@/api/auth-store";
import { ensureLeafletForCubeMap } from "@/utils/prepare-leaflet-for-cube-map";

import styles from "./drone-gis-map.module.less";

const defaultCenter = { lng: 104.05713, lat: 30.587918 };
let mapIndex = 0;

type MapPoint = { lng: number; lat: number };
type PluginMapClickEvent = MapPoint & { mapType?: string };
type Layer = { remove?: () => void };
type MarkerLayer = Layer & {
  addTo: (map: unknown) => MarkerLayer;
  bindPopup?: (content: string, options?: Record<string, unknown>) => MarkerLayer;
  openPopup?: () => MarkerLayer;
  on?: (type: string, handler: () => void) => void;
};
type LeafletMapLike = {
  invalidateSize: (options?: boolean | Record<string, unknown>) => void;
  setView: (center: [number, number], zoom?: number, options?: Record<string, unknown>) => void;
  setZoom: (zoom: number, options?: Record<string, unknown>) => void;
  fitBounds: (bounds: unknown, options?: Record<string, unknown>) => void;
  getZoom: () => number;
  fire: (type: string) => void;
  getContainer: () => HTMLElement;
  scrollWheelZoom?: { enable: () => void };
  dragging?: { enable: () => void };
  touchZoom?: { enable: () => void };
  doubleClickZoom?: { enable: () => void };
  boxZoom?: { enable: () => void };
  keyboard?: { enable: () => void };
  _onResize?: () => void;
};

const waypointTypeTextMap: Record<string, string> = {
  waypoint: "航点",
  observe: "观察点",
  inspect: "拍照点",
};

const markerIconMap: Record<"drone" | "nest" | "object" | "waypoint", string> = {
  drone: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 12.2 20.5 4.5 14.2 20.5l-2.7-6.8-8-1.5Z" />
      <path d="M11.5 13.7 20.5 4.5" />
    </svg>
  `,
  nest: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5 19 6.3v5.2c0 4.4-2.9 7.6-7 9-4.1-1.4-7-4.6-7-9V6.3l7-2.8Z" />
    </svg>
  `,
  object: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s7-5.3 7-11a7 7 0 0 0-14 0c0 5.7 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  `,
  waypoint: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
    </svg>
  `,
};

const createMarkerContent = (type: "drone" | "nest" | "object" | "waypoint", title: string, status?: string): string => `
  <div class="drone-gis-marker drone-gis-marker--${type} drone-gis-marker--${status ?? "default"}">
    <span>${markerIconMap[type]}</span>
    <em>${title}</em>
  </div>
`;

const escapeHtml = (value: string | number | boolean | undefined | null): string =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const createPopupContent = (title: string, rows: Array<[string, string | number | boolean | undefined | null]>): string => `
  <div class="drone-gis-popup">
    <strong>${escapeHtml(title)}</strong>
    <dl>
      ${rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
    </dl>
  </div>
`;

export const DroneGisMap = defineComponent({
  name: "DroneGisMap",
  props: {
    drones: {
      type: Array as () => DroneDetailModel[],
      default: () => [],
    },
    nests: {
      type: Array as () => NestDetailModel[],
      default: () => [],
    },
    objects: {
      type: Array as () => InspectionObject[],
      default: () => [],
    },
    track: {
      type: Object as () => TrackDetailModel | null,
      default: null,
    },
    showObjects: {
      type: Boolean,
      default: true,
    },
    showTrack: {
      type: Boolean,
      default: true,
    },
    compact: {
      type: Boolean,
      default: false,
    },
    focus: {
      type: String as () => "drone" | "bounds",
      default: "bounds",
    },
    focusPoint: {
      type: Object as () => { lng: number; lat: number } | null,
      default: null,
    },
    selectingPoint: {
      type: Boolean,
      default: false,
    },
    autoFitOnUpdate: {
      type: Boolean,
      default: true,
    },
  },
  emits: {
    pointSelect: (point: MapPoint) => Number.isFinite(point.lng) && Number.isFinite(point.lat),
  },
  setup(props, { emit }) {
    const mapId = `drone-gis-map-${++mapIndex}`;
    const wrapperRef = ref<HTMLElement>();
    const mapRef = ref<CubeMapLeaflet | null>(null);
    const loading = ref(true);
    const error = ref("");
    const layers = ref<Layer[]>([]);
    const refreshTimers: number[] = [];
    let resizeObserver: ResizeObserver | undefined;

    const center = computed(() => {
      if (props.focusPoint && Number.isFinite(props.focusPoint.lng) && Number.isFinite(props.focusPoint.lat)) {
        return props.focusPoint;
      }
      const drone = props.drones.find((item) => item.online) ?? props.drones[0];
      if (drone) {
        return { lng: drone.longitude, lat: drone.latitude };
      }
      const nest = props.nests[0];
      return { lng: nest?.longitude ?? defaultCenter.lng, lat: nest?.latitude ?? defaultCenter.lat };
    });

    const clearLayers = (): void => {
      const map = mapRef.value?.getMapInstance();
      layers.value.forEach((layer) => {
        try {
          map?.removeLayer(layer as never);
        } catch {
          layer.remove?.();
        }
      });
      layers.value = [];
    };

    const addMarker = (lng: number, lat: number, content: string, popupContent?: string): void => {
      const plugin = mapRef.value;
      if (!plugin || !Number.isFinite(lng) || !Number.isFinite(lat)) {
        return;
      }
      const marker = plugin.createMarker({
        position: { lng, lat },
        iconSize: [36, 36],
        content,
      }) as MarkerLayer;
      marker.addTo(plugin.getMapInstance());
      if (popupContent) {
        marker.bindPopup?.(popupContent, {
          className: "drone-gis-popup-shell",
          closeButton: false,
          autoPan: true,
          offset: [0, -10],
        });
        marker.on?.("click", () => {
          marker.openPopup?.();
        });
      }
      layers.value.push(marker);
    };

    const getMap = (): LeafletMapLike | null => {
      try {
        return mapRef.value?.getMapInstance() as unknown as LeafletMapLike;
      } catch {
        return null;
      }
    };

    const syncSelectionCursor = (): void => {
      const map = getMap();
      if (!map) {
        return;
      }
      map.getContainer().style.cursor = props.selectingPoint ? "crosshair" : "grab";
    };

    const handleMapClick = (event: PluginMapClickEvent): void => {
      if (!props.selectingPoint) {
        return;
      }
      const lng = event.lng;
      const lat = event.lat;
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        return;
      }
      emit("pointSelect", { lng, lat });
    };

    const enableMapInteraction = (): void => {
      const map = getMap();
      if (!map) {
        return;
      }
      const L = (
        window as unknown as {
          L?: {
            DomEvent?: {
              disableScrollPropagation?: (element: HTMLElement) => void;
              disableClickPropagation?: (element: HTMLElement) => void;
            };
          };
        }
      ).L;
      const container = map.getContainer();
      L?.DomEvent?.disableScrollPropagation?.(container);
      L?.DomEvent?.disableClickPropagation?.(container);
      map.scrollWheelZoom?.enable();
      map.dragging?.enable();
      map.touchZoom?.enable();
      map.doubleClickZoom?.enable();
      map.boxZoom?.enable();
      map.keyboard?.enable();
      container.style.pointerEvents = "auto";
      syncSelectionCursor();
    };

    const forceMapView = (): void => {
      const plugin = mapRef.value;
      const map = getMap();
      if (!plugin || !map) {
        return;
      }
      const zoom = props.compact ? 16 : 17;
      enableMapInteraction();
      map.invalidateSize(false);
      map.setZoom(zoom, { animate: false });
      void plugin.setCenter(center.value.lng, center.value.lat).finally(() => {
        map.invalidateSize(false);
        map.fire("resize");
      });
      map._onResize?.();
      map.fire("resize");
      map.invalidateSize(false);
    };

    const fitMapView = (): void => {
      const plugin = mapRef.value;
      const L = (window as unknown as { L?: any }).L;
      if (!plugin || !L) {
        return;
      }
      if (props.focus === "drone") {
        forceMapView();
        return;
      }
      const points = [
        ...props.nests.map((item) => ({ lng: item.longitude, lat: item.latitude })),
        ...props.drones.map((item) => ({ lng: item.longitude, lat: item.latitude })),
        ...(props.showObjects ? props.objects.map((item) => ({ lng: item.longitude, lat: item.latitude })) : []),
        ...(props.showTrack && props.track ? props.track.points.map((item) => ({ lng: item.longitude, lat: item.latitude })) : []),
      ].filter((item): item is { lng: number; lat: number } => Number.isFinite(item.lng) && Number.isFinite(item.lat));

      forceMapView();
      if (points.length <= 1) {
        return;
      }
      const bounds = L.latLngBounds(points.map((item) => [item.lat, item.lng]));
      getMap()?.fitBounds(bounds, { padding: [36, 36], maxZoom: props.compact ? 16 : 17, animate: false });
    };

    const refreshMap = (fitView = true): void => {
      const plugin = mapRef.value;
      if (!plugin) {
        return;
      }
      try {
        enableMapInteraction();
        getMap()?.invalidateSize(false);
        getMap()?._onResize?.();
        getMap()?.fire("resize");
      } catch {}
      if (fitView) {
        fitMapView();
      }
    };

    const scheduleMapRefresh = (fitView = true): void => {
      [0, 80, 240, 600].forEach((delay) => {
        const timer = window.setTimeout(() => {
          window.requestAnimationFrame(() => refreshMap(fitView));
        }, delay);
        refreshTimers.push(timer);
      });
    };

    const clearRefreshTimers = (): void => {
      while (refreshTimers.length > 0) {
        const timer = refreshTimers.pop();
        if (timer) {
          window.clearTimeout(timer);
        }
      }
    };

    const renderLayers = (fitView = true): void => {
      const plugin = mapRef.value;
      if (!plugin) {
        return;
      }
      clearLayers();

      props.nests.forEach((nest) => {
        addMarker(
          nest.longitude ?? defaultCenter.lng,
          nest.latitude ?? defaultCenter.lat,
          createMarkerContent("nest", nest.nestName, nest.online ? "online" : "offline"),
          createPopupContent(nest.nestName, [
            ["类型", "机巢"],
            ["状态", nest.online ? "在线" : "离线"],
            ["温度", `${nest.temperature}°C`],
            ["湿度", `${nest.humidity}%`],
            ["充电状态", nest.chargeStatus ? "充电中" : "未充电"],
            ["舱门", nest.doorStatus ? "开启" : "关闭"],
            ["烟雾", nest.smoke ? "异常" : "正常"],
          ]),
        );
        const circle = plugin.addCircle({
          center: { lng: nest.longitude ?? defaultCenter.lng, lat: nest.latitude ?? defaultCenter.lat },
          radius: 250,
        });
        layers.value.push(circle);
      });

      if (props.showObjects) {
        props.objects.forEach((item) => {
          addMarker(
            item.longitude,
            item.latitude,
            createMarkerContent("object", item.name, item.status),
            createPopupContent(item.name, [
              ["类型", item.type ?? "粮仓"],
              ["区域", item.area ?? ""],
              ["状态", item.status === "normal" ? "正常" : item.status === "warning" ? "预警" : "告警"],
              ["识别算法", item.algorithm ?? ""],
              ["负责人", item.owner ?? ""],
              ["更新时间", item.updateTime ?? ""],
            ]),
          );
        });
      }

      if (props.showTrack && props.track) {
        const points = props.track.points
          .filter((item) => Number.isFinite(item.longitude) && Number.isFinite(item.latitude))
          .map((item) => ({ ...item, lng: item.longitude, lat: item.latitude }));
        if (points.length > 1) {
          layers.value.push(plugin.createPolyline(points, "#1684fc", 3));
        }
        points.forEach((item, index) => {
          addMarker(
            item.longitude,
            item.latitude,
            createMarkerContent("waypoint", String(index + 1), item.waypointType),
            createPopupContent(`${waypointTypeTextMap[item.waypointType ?? "waypoint"] ?? "航点"} ${index + 1}`, [
              ["经度", item.longitude],
              ["纬度", item.latitude],
              ["高度", item.altitude ?? ""],
            ]),
          );
        });
      }

      props.drones.forEach((drone) => {
        addMarker(
          drone.longitude,
          drone.latitude,
          createMarkerContent("drone", drone.name, drone.online ? drone.status : "standby"),
          createPopupContent(drone.name, [
            ["类型", "无人机"],
            ["状态", drone.online ? "在线" : "待命"],
            ["所属机巢", drone.nestName],
            ["电量", `${drone.batteryCharge}%`],
            ["信号", `${drone.signal}%`],
            ["GPS", `${drone.gpsStars}星`],
            ["高度", `${drone.altitude}m`],
            ["速度", `${drone.speed}m/s`],
          ]),
        );
      });
      if (fitView) {
        fitMapView();
        scheduleMapRefresh(true);
      }
    };

    onMounted(async () => {
      try {
        await nextTick();
        await ensureLeafletForCubeMap();
        const plugin = new CubeMapLeaflet(authStore as never);
        mapRef.value = plugin;
        await plugin.renderMap(mapId, { center: center.value, zoomControl: !props.compact });
        plugin.onMapClick = handleMapClick;
        enableMapInteraction();
        forceMapView();
        loading.value = false;
        renderLayers();
        if (wrapperRef.value) {
          resizeObserver = new ResizeObserver(() => {
            scheduleMapRefresh(false);
          });
          resizeObserver.observe(wrapperRef.value);
        }
      } catch {
        error.value = "GIS地图加载失败，请检查地图服务配置";
        loading.value = false;
      }
    });

    watch(
      () => [props.drones, props.nests, props.objects, props.track, props.showObjects, props.showTrack],
      () => {
        renderLayers(props.autoFitOnUpdate);
      },
      { deep: true },
    );

    watch(
      () => props.focusPoint,
      () => {
        if (props.autoFitOnUpdate) {
          scheduleMapRefresh(true);
        }
      },
      { deep: true },
    );

    watch(
      () => props.selectingPoint,
      () => {
        syncSelectionCursor();
      },
    );

    onBeforeUnmount(() => {
      clearRefreshTimers();
      resizeObserver?.disconnect();
      if (mapRef.value) {
        mapRef.value.onMapClick = null;
      }
      clearLayers();
      mapRef.value?.destroy();
      mapRef.value = null;
    });

    return (): JSX.Element => (
      <div ref={wrapperRef} class={[styles.wrapper, props.compact ? styles.compact : ""]}>
        <div id={mapId} class={styles.map} />
        {loading.value && (
          <div class={styles.loading}>
            <Spin spinning />
          </div>
        )}
        {error.value && <div class={styles.error}>{error.value}</div>}
        {props.selectingPoint && <div class={styles.selectionTip}>点击地图标记航点位置</div>}
        <div class={styles.legend}>
          <span>
            <i class={styles.drone} />
            飞机
          </span>
          <span>
            <i class={styles.nest} />
            机巢
          </span>
          <span>
            <i class={styles.object} />
            粮库
          </span>
        </div>
      </div>
    );
  },
});
