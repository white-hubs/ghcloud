import { AppstoreOutlined, EnvironmentOutlined, NumberOutlined, ToolOutlined, UserOutlined } from "@ant-design/icons-vue";
import { createApp, defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { CubeMapLeaflet } from "@ghcloud/cube-map-plugins";
import { CubeTerminalEnum } from "@ghcloud/cube-protocol";
import { message } from "@ghcloud/cube-ui";

import { authStore } from "@/api/auth-store";
import { getInspectionMapConfig } from "@/api/dashboard-service";
import type { DeviceRoutePointData } from "@/api/dashboard-service";
import type {
  InspectionPointItem,
  InspectionTargetCategory,
  LayerType,
  PersonnelItem,
  PersonnelTrackPoint,
  TaskObjectItem,
} from "@/types/dashboard";

interface MapAuth {
  tenant: string;
  token: string;
  terminal: string;
}

interface CoverageRegion {
  points: Array<{ lng: number; lat: number }>;
  polygon: Array<{ lng: number; lat: number }>;
}

const mapId = "inspection-map-canvas";
const defaultCenter = { lng: 104.05713, lat: 30.587918 };
const defaultZoom = 16;
const coverageGroupDistanceMeters = 5000;
const coverageFallbackBufferMeters = 250;
const abnormalHeatOptions = {
  radius: 42,
  blur: 16,
  max: 3,
  minOpacity: 0.12,
};
const targetCategoryText: Record<string, string> = {
  STALL: "档位",
  DEVICE: "设备",
  PROPERTY: "资产",
  SITE_POINT: "现场点",
  RISK_SOURCE: "风险源",
  SMALL_ENGINEERING: "小型工程",
};

/**
 * 巡检指挥大屏地图组件。
 *
 * 负责承接父组件传入的图层开关和点位数据，并统一管理 Leaflet 地图上的业务覆盖物：
 * - 巡检点分类图层：使用 markercluster 聚合展示。
 * - 任务对象图层：查看任务对象时展示独立点位并自动聚焦。
 * - 巡检覆盖度：根据已加载巡检点生成覆盖多边形。
 * - 异常热力图：基于公共地图插件的 L.heatLayer 能力生成热力图。
 */
export const MapScene = defineComponent({
  name: "MapScene",
  props: {
    layers: {
      type: Array as () => LayerType[],
      required: true,
    },
    pointCategory: {
      type: Array as () => InspectionTargetCategory[],
      required: false,
      default: () => [],
    },
    pointTargets: {
      type: Array as () => InspectionPointItem[],
      required: false,
      default: () => [],
    },
    abnormalTargets: {
      type: Array as () => InspectionPointItem[],
      required: false,
      default: () => [],
    },
    taskObjects: {
      type: Array as () => TaskObjectItem[],
      required: false,
      default: () => [],
    },
    taskRoutePoints: {
      type: Array as () => DeviceRoutePointData[],
      required: false,
      default: () => [],
    },
    personnelTarget: {
      type: Object as () => PersonnelItem | null,
      required: false,
      default: null,
    },
    personnelTrackPoints: {
      type: Array as () => PersonnelTrackPoint[],
      required: false,
      default: () => [],
    },
    personnelTrackVisible: {
      type: Boolean,
      required: false,
      default: false,
    },
    personnelFocusSignal: {
      type: Number,
      required: false,
      default: 0,
    },
    globalViewSignal: {
      type: Number,
      required: false,
      default: 0,
    },
    onPersonnelCall: {
      type: Function as unknown as () => (person: PersonnelItem) => void,
      required: true,
    },
    onPersonnelVideo: {
      type: Function as unknown as () => (person: PersonnelItem) => void,
      required: true,
    },
    onOpenPersonnelHistory: {
      type: Function as unknown as () => (person: PersonnelItem) => void,
      required: true,
    },
    onClosePersonnelMarker: {
      type: Function as unknown as () => () => void,
      required: true,
    },
  },
  setup(props) {
    const mapPluginRef = ref<CubeMapLeaflet | null>(null);
    const pointLayers = ref<any[]>([]);
    const taskObjectLayers = ref<any[]>([]);
    const taskRoutePointLayers = ref<any[]>([]);
    const personnelLayers = ref<any[]>([]);
    const personnelTrackLayers = ref<any[]>([]);
    const coverageLayers = ref<any[]>([]);
    const heatLayers = ref<any[]>([]);
    const renderVersion = ref(0);
    const taskObjectRenderVersion = ref(0);
    const taskRoutePointRenderVersion = ref(0);
    const personnelRenderVersion = ref(0);
    const personnelTrackRenderVersion = ref(0);
    const destroyed = ref(false);
    const markerIconCache = new Map<string, string>();
    const initialView = ref({
      center: defaultCenter,
      zoom: defaultZoom,
      rotation: 0,
    });
    const renderState = ref({
      pointsSig: "",
      coverageSig: "",
      heatSig: "",
    });
    const heatViewportTimer = ref<number | null>(null);

    /** 生成并缓存业务 marker 图标，避免每次渲染都重新挂载 Vue 图标组件。 */
    const createAntMarkerIcon = (component: any, color: string, key: string): string => {
      const cached = markerIconCache.get(key);
      if (cached) {
        return cached;
      }
      const container = document.createElement("div");
      const app = createApp({
        render: () => h(component, { style: { color, fontSize: "14px" } }),
      });
      app.mount(container);
      const svg = container.querySelector("svg");
      const viewBox = svg?.getAttribute("viewBox") || "0 0 1024 1024";
      const inner = svg?.innerHTML || "";
      app.unmount();

      const markerSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42">
          <path d="M15 1C8.4 1 3 6.4 3 13c0 9.5 12 27 12 27s12-17.5 12-27C27 6.4 21.6 1 15 1z" fill="${color}" stroke="rgba(255,255,255,0.7)" stroke-width="1"/>
          <circle cx="15" cy="13" r="7.2" fill="rgba(255,255,255,0.95)"/>
          <svg x="10.4" y="8.4" width="9.2" height="9.2" viewBox="${viewBox}" fill="${color}">${inner}</svg>
        </svg>
      `.trim();
      const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerSvg)}`;
      markerIconCache.set(key, url);
      return url;
    };

    /** 根据巡检点分类选择不同颜色和图标，用于“查看巡检点”分类图层。 */
    const getCategoryMarkerIcon = (category: InspectionTargetCategory): string => {
      if (category === "DEVICE") return createAntMarkerIcon(ToolOutlined, "#4b8bff", "point-device");
      if (category === "STALL") return createAntMarkerIcon(NumberOutlined, "#f87171", "point-stall");
      if (category === "PROPERTY") return createAntMarkerIcon(AppstoreOutlined, "#fbbf24", "point-property");
      if (category === "SITE_POINT") return createAntMarkerIcon(EnvironmentOutlined, "#34d399", "point-site-point");
      if (category === "RISK_SOURCE") return createAntMarkerIcon(EnvironmentOutlined, "#fb923c", "point-risk-source");
      return createAntMarkerIcon(EnvironmentOutlined, "#4b8bff", "point-default");
    };

    /** 根据任务对象分类选择不同颜色和图标，用于任务列表“查看对象”图层。 */
    const getTaskObjectMarkerIcon = (category: string): string => {
      if (category === "DEVICE") return createAntMarkerIcon(ToolOutlined, "#4b8bff", "task-device");
      if (category === "STALL") return createAntMarkerIcon(NumberOutlined, "#f87171", "task-stall");
      if (category === "PROPERTY") return createAntMarkerIcon(AppstoreOutlined, "#fbbf24", "task-property");
      if (category === "SITE_POINT") return createAntMarkerIcon(EnvironmentOutlined, "#34d399", "task-site-point");
      if (category === "RISK_SOURCE") return createAntMarkerIcon(EnvironmentOutlined, "#fb923c", "task-risk-source");
      return createAntMarkerIcon(EnvironmentOutlined, "#a78bfa", "task-default");
    };

    /** 任务航点 marker 使用数字，不再叠加图标，和无人机 tab 航点表达保持一致。 */
    const getTaskRoutePointMarkerIcon = (point: DeviceRoutePointData, index: number): string => {
      const key = `task-route-${point.status}-${index + 1}`;
      const cached = markerIconCache.get(key);
      if (cached) {
        return cached;
      }
      const color = point.status === "abnormal" ? "#ff7878" : point.status === "pending" ? "#9aa8bd" : "#39d6a4";
      const markerSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
          <circle cx="15" cy="15" r="12.5" fill="${color}" stroke="rgba(255,255,255,0.78)" stroke-width="1.5"/>
          <text x="15" y="19" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="Arial, sans-serif">${index + 1}</text>
        </svg>
      `.trim();
      const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerSvg)}`;
      markerIconCache.set(key, url);
      return url;
    };

    /** 人员定位 marker 使用独立图标，和巡检点分类 marker 区分。 */
    const getPersonnelMarkerIcon = (): string => {
      return createAntMarkerIcon(UserOutlined, "#1ec138", "personnel-location");
    };

    /** 历史轨迹起终点 marker 使用文字徽标，贴近旧系统“起/终”标识。 */
    const getTrackMarkerIcon = (type: "start" | "end"): string => {
      const isStart = type === "start";
      const text = isStart ? "起" : "终";
      const color = isStart ? "#1677ff" : "#d97706";
      const dark = isStart ? "#0b3e86" : "#7c3f08";
      return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="42" height="54" viewBox="0 0 42 54">
          <path d="M21 2L36 10V29L21 38L6 29V10Z" fill="${dark}" stroke="${color}" stroke-width="3"/>
          <circle cx="21" cy="48" r="4" fill="${color}" opacity=".55"/>
          <text x="21" y="25" fill="#fff" font-size="16" font-weight="700" text-anchor="middle" dominant-baseline="middle">${text}</text>
        </svg>
      `)}`;
    };

    const getTrackArrowIcon = (angle: number): string => {
      return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
          <g transform="rotate(${angle} 14 14)">
            <path d="M14 3L23 23L14 18L5 23Z" fill="#ffffff" stroke="#2989ff" stroke-width="2.4" stroke-linejoin="round"/>
          </g>
        </svg>
      `)}`;
    };

    const getTrackArrowPoints = (points: PersonnelTrackPoint[]): Array<{ lng: number; lat: number; angle: number }> => {
      if (points.length < 2) {
        return [];
      }
      const step = Math.max(1, Math.ceil((points.length - 1) / 6));
      const arrows: Array<{ lng: number; lat: number; angle: number }> = [];
      for (let index = 0; index < points.length - 1; index += step) {
        const from = points[index];
        const to = points[index + 1];
        const deltaLng = to.lng - from.lng;
        const deltaLat = to.lat - from.lat;
        if (!deltaLng && !deltaLat) {
          continue;
        }
        arrows.push({
          lng: (from.lng + to.lng) / 2,
          lat: (from.lat + to.lat) / 2,
          angle: (Math.atan2(deltaLng, deltaLat) * 180) / Math.PI,
        });
      }
      return arrows;
    };

    /** 轨迹箭头和起终点徽标使用中心锚点，保证箭头贴在轨迹线上。 */
    const addCenteredTrackMarker = (
      position: { lng: number; lat: number },
      icon: string,
      iconSize: [number, number],
      offset?: [number, number],
    ): any => {
      const plugin = mapPluginRef.value;
      if (!plugin) {
        return null;
      }
      const map = plugin.getMapInstance();
      const marker = plugin.createMarker({
        position: { lng: position.lng, lat: position.lat },
        icon,
        iconSize,
      });
      if (offset) {
        try {
          const point = map.latLngToLayerPoint(marker.getLatLng()).add(offset);
          marker.setLatLng(map.layerPointToLatLng(point));
        } catch {}
      }
      marker.addTo(map);
      return marker;
    };

    const isSamePosition = (a?: { lng: number; lat: number } | null, b?: { lng: number; lat: number } | null): boolean => {
      if (!a || !b) {
        return false;
      }
      return Math.abs(a.lng - b.lng) < 0.000001 && Math.abs(a.lat - b.lat) < 0.000001;
    };

    /** 起终点和人员定位点重合时做轻量错位，避免徽标互相盖住导致看不清。 */
    const getTrackEndpointOffset = (
      type: "start" | "end",
      point: PersonnelTrackPoint,
      start: PersonnelTrackPoint,
      end: PersonnelTrackPoint,
    ): [number, number] | undefined => {
      const current = { lng: point.lng, lat: point.lat };
      const overlapsPersonnel = isSamePosition(current, props.personnelTarget?.gps);
      const overlapsEndpoint = isSamePosition({ lng: start.lng, lat: start.lat }, { lng: end.lng, lat: end.lat });
      if (!overlapsPersonnel && !overlapsEndpoint) {
        return undefined;
      }
      return type === "start" ? [-22, -18] : [22, -18];
    };

    const makeLayerClickThrough = (layer: any): void => {
      try {
        layer.off?.("click");
        const element = layer.getElement?.() || layer._path;
        if (element) {
          element.style.pointerEvents = "none";
        }
      } catch {}
      window.requestAnimationFrame(() => {
        try {
          const element = layer.getElement?.() || layer._path;
          if (element) {
            element.style.pointerEvents = "none";
          }
        } catch {}
      });
    };

    /** 从全局对象读取 Leaflet 实例，动态插件加载后 markercluster/heat 等能力会挂到 window.L 上。 */
    const getLeaflet = (): any | null => {
      return (window as any).L || null;
    };

    /**
     * 兜底修复 Leaflet 缩放动画偶发空地图实例问题。
     *
     * markercluster / popup 在图层被快速移除后仍可能收到 zoomanim 事件，
     * 这里对 _animateZoom 增加 _map/_latlng 判空，避免访问 _latLngToNewLayerPoint 报错。
     */
    const patchLeafletAnimateZoom = (): void => {
      const L = getLeaflet();
      if (!L || (L as any).__inspectionAnimateZoomPatched) {
        return;
      }

      const includeSafeMarkerAnimateZoom = (MarkerClass: any): void => {
        if (!MarkerClass || MarkerClass.__inspectionAnimateZoomPatched) {
          return;
        }
        MarkerClass.include({
          _animateZoom(e: { zoom: number; center: unknown }) {
            if (!this._map || !this._latlng || typeof this._map._latLngToNewLayerPoint !== "function") {
              return;
            }
            const pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center);
            this._setPos(pos);
          },
        });
        MarkerClass.__inspectionAnimateZoomPatched = true;
      };

      includeSafeMarkerAnimateZoom(L.Marker);
      includeSafeMarkerAnimateZoom(L.MarkerCluster);

      if (L.Popup && !(L.Popup as any).__inspectionAnimateZoomPatched) {
        L.Popup.include({
          _animateZoom(e: { zoom: number; center: unknown }) {
            if (!this._map || !this._latlng || !this._container || typeof this._map._latLngToNewLayerPoint !== "function") {
              return;
            }
            const pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center);
            const anchor = this._getAnchor();
            L.DomUtil.setPosition(this._container, pos.add(anchor));
          },
        });
        (L.Popup as any).__inspectionAnimateZoomPatched = true;
      }

      (L as any).__inspectionAnimateZoomPatched = true;
    };

    /** 缩放开始时关闭已打开 popup，避免 popup 跟随缩放动画时和图层清理产生竞态。 */
    const installZoomPopupGuard = (map: any): void => {
      if (!map || map.__inspectionZoomPopupGuardInstalled) {
        return;
      }
      const closePopupOnZoomStart = () => {
        try {
          map.closePopup();
        } catch {}
      };
      map.on("zoomstart", closePopupOnZoomStart);
      map.__inspectionZoomPopupGuardInstalled = true;
      map.__inspectionClosePopupOnZoomStart = closePopupOnZoomStart;
    };

    /** 移除缩放 popup 守卫，组件卸载时调用，避免地图实例销毁后残留监听。 */
    const uninstallZoomPopupGuard = (): void => {
      const plugin = mapPluginRef.value;
      if (!plugin) {
        return;
      }
      try {
        const map = plugin.getMapInstance() as any;
        if (map.__inspectionClosePopupOnZoomStart) {
          map.off("zoomstart", map.__inspectionClosePopupOnZoomStart);
          map.__inspectionClosePopupOnZoomStart = null;
          map.__inspectionZoomPopupGuardInstalled = false;
        }
      } catch {}
    };

    /** 地图视角变化会改变“当前可视异常点数量”，热力图需要跟随视角重绘。 */
    const installHeatViewportBehavior = (plugin: CubeMapLeaflet): void => {
      const map = plugin.getMapInstance() as any;
      if (!map || map.__inspectionHeatViewportInstalled) {
        return;
      }
      const refreshHeatByViewport = () => {
        if (!props.layers.includes("HEATMAP")) {
          return;
        }
        if (heatViewportTimer.value) {
          window.clearTimeout(heatViewportTimer.value);
        }
        heatViewportTimer.value = window.setTimeout(() => {
          heatViewportTimer.value = null;
          void renderLayers();
        }, 80);
      };
      map.on("moveend zoomend", refreshHeatByViewport);
      map.__inspectionHeatViewportInstalled = true;
      map.__inspectionHeatViewportHandler = refreshHeatByViewport;
    };

    /** 移除热力图视角监听，避免组件销毁后继续触发重绘。 */
    const uninstallHeatViewportBehavior = (): void => {
      if (heatViewportTimer.value) {
        window.clearTimeout(heatViewportTimer.value);
        heatViewportTimer.value = null;
      }
      const plugin = mapPluginRef.value;
      if (!plugin) {
        return;
      }
      try {
        const map = plugin.getMapInstance() as any;
        if (map.__inspectionHeatViewportHandler) {
          map.off("moveend zoomend", map.__inspectionHeatViewportHandler);
          map.__inspectionHeatViewportHandler = null;
          map.__inspectionHeatViewportInstalled = false;
        }
      } catch {}
    };

    /** 根据左右面板宽度计算地图聚焦 padding，保证点位不会被大屏面板遮挡。 */
    const getMapViewportPadding = (map: any) => {
      const container = map.getContainer();
      const width = container.clientWidth || window.innerWidth;
      const leftPanelWidth = Math.round(width * 0.27) + 28;
      const rightPanelWidth = Math.round(width * 0.27) + 28;
      return {
        paddingTopLeft: [leftPanelWidth, 88] as [number, number],
        paddingBottomRight: [rightPanelWidth, 40] as [number, number],
      };
    };

    const withFocusTimeout = async (promise: Promise<void>): Promise<void> => {
      await Promise.race([promise, new Promise<void>((resolve) => window.setTimeout(resolve, 900))]);
    };

    /** 单点定位走地图插件，保持和旧指挥调度系统一致的坐标转换与居中逻辑。 */
    const focusSinglePointAtMapCenter = async (point: { lng: number; lat: number }, zoom: number): Promise<void> => {
      const plugin = mapPluginRef.value;
      if (!plugin) {
        return;
      }
      const map = plugin.getMapInstance();
      try {
        map.invalidateSize?.();
        if (Math.round(map.getZoom()) !== zoom) {
          await withFocusTimeout(plugin.setZoom(zoom));
        }
        await withFocusTimeout(plugin.setCenter(point.lng, point.lat));
      } catch {
        map.setView([point.lat, point.lng], zoom, { animate: true });
        await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      }
    };

    /**
     * 聚合点点击后的聚焦逻辑。
     *
     * 未到最大缩放时，先按子点真实 bounds 聚焦到最大缩放；
     * 这样点位会落在扣除左右面板后的可视区域内，而不是简单居中后被遮挡。
     */
    const focusClusterAtMaxZoom = (map: any, cluster: any): void => {
      const L = getLeaflet();
      const maxZoom = map.getMaxZoom();
      const childMarkers = typeof cluster.getAllChildMarkers === "function" ? cluster.getAllChildMarkers() : [];
      const padding = getMapViewportPadding(map);
      if (L && childMarkers.length > 0) {
        const bounds = L.latLngBounds(childMarkers.map((marker: any) => marker.getLatLng()));
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            animate: true,
            maxZoom,
            ...padding,
          });
          return;
        }
      }
      const target = typeof cluster.getLatLng === "function" ? cluster.getLatLng() : cluster._latlng;
      if (target) {
        map.setView(target, maxZoom, { animate: true });
      }
    };

    /** 当前大屏实例专用的 markercluster 参数，不修改公共地图插件默认行为。 */
    const configureInspectionClusterLayer = (plugin: CubeMapLeaflet): void => {
      const clusterGroup = (plugin as any).markerClusterGroup;
      if (!clusterGroup?.options) {
        return;
      }
      clusterGroup.options.zoomToBoundsOnClick = false;
      clusterGroup.options.spiderfyOnEveryZoom = false;
      clusterGroup.options.showCoverageOnHover = false;
      clusterGroup.options.spiderfyDistanceMultiplier = 1.4;
      clusterGroup.options.animate = false;
    };

    /**
     * 接管巡检点聚合点击行为。
     *
     * 默认 markercluster 可能在地图未到最大缩放时直接 spiderfy；
     * 大屏要求先缩放到最大级别，若最大级别仍聚合，再次点击才 spiderfy 展开。
     */
    const installClusterClickBehavior = (plugin: CubeMapLeaflet): void => {
      const map = plugin.getMapInstance() as any;
      const clusterGroup = (plugin as any).markerClusterGroup;
      if (!clusterGroup || clusterGroup.__inspectionClusterClickInstalled) {
        return;
      }
      const onClusterClick = (event: any) => {
        const cluster = event?.layer;
        if (!cluster) {
          return;
        }
        const originalEvent = event.originalEvent;
        if (originalEvent) {
          try {
            originalEvent.preventDefault?.();
            originalEvent.stopPropagation?.();
          } catch {}
        }
        try {
          map.closePopup();
        } catch {}
        const currentZoom = map.getZoom();
        const maxZoom = map.getMaxZoom();
        if (currentZoom < maxZoom) {
          focusClusterAtMaxZoom(map, cluster);
          return;
        }
        if (typeof cluster.spiderfy === "function") {
          cluster.spiderfy();
        }
      };
      clusterGroup.on("clusterclick", onClusterClick);
      clusterGroup.__inspectionClusterClickInstalled = true;
      clusterGroup.__inspectionClusterClickHandler = onClusterClick;
    };

    /** 移除聚合点击接管监听，避免组件销毁后保留旧 handler。 */
    const uninstallClusterClickBehavior = (): void => {
      const plugin = mapPluginRef.value;
      if (!plugin) {
        return;
      }
      try {
        const clusterGroup = (plugin as any).markerClusterGroup;
        if (clusterGroup?.__inspectionClusterClickHandler) {
          clusterGroup.off("clusterclick", clusterGroup.__inspectionClusterClickHandler);
          clusterGroup.__inspectionClusterClickHandler = null;
          clusterGroup.__inspectionClusterClickInstalled = false;
        }
      } catch {}
    };

    /** 解析后端返回的 “lng,lat” 字符串，并过滤非法经纬度。 */
    const parseLatAndLon = (value: string): { lng: number; lat: number } | null => {
      const [lngText, latText] = value.split(",").map((item) => item.trim());
      const lng = Number(lngText);
      const lat = Number(latText);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        return null;
      }
      if (Math.abs(lng) > 180 || Math.abs(lat) > 90) {
        return null;
      }
      return { lng, lat };
    };

    /** popup 内容使用字符串拼接时统一做 HTML 转义，避免名称、编码等字段破坏 DOM。 */
    const escapeHtml = (value: string): string =>
      value.replace(/[&<>"']/g, (char) => {
        const entities: Record<string, string> = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };
        return entities[char] || char;
      });

    /** 通用图层移除工具，适用于 polygon 等直接添加到 Leaflet map 的覆盖物。 */
    const removeLayers = (layers: any[]): void => {
      const plugin = mapPluginRef.value;
      if (!plugin) {
        return;
      }
      const map = plugin.getMapInstance();
      try {
        map.closePopup();
      } catch {}
      layers.forEach((layer) => {
        try {
          map.removeLayer(layer);
        } catch {}
      });
    };

    /** 清空巡检点聚合图层。 */
    const clearPoints = (): void => {
      const plugin = mapPluginRef.value;
      if (!plugin) {
        pointLayers.value = [];
        return;
      }
      try {
        plugin.getMapInstance().closePopup();
      } catch {}
      try {
        plugin.clearClusteredMarkers();
      } catch {}
      pointLayers.value = [];
    };

    /** 清空任务对象点位图层。 */
    const clearTaskObjects = (): void => {
      const plugin = mapPluginRef.value;
      if (!plugin) {
        return;
      }
      try {
        plugin.getMapInstance().closePopup();
      } catch {}
      taskObjectLayers.value.forEach((layer) => {
        try {
          plugin.removeMarker(layer);
        } catch {
          try {
            plugin.getMapInstance().removeLayer(layer);
          } catch {}
        }
      });
      taskObjectLayers.value = [];
    };

    /** 清空任务航点图层。 */
    const clearTaskRoutePoints = (): void => {
      const plugin = mapPluginRef.value;
      if (!plugin) {
        taskRoutePointLayers.value = [];
        return;
      }
      try {
        plugin.getMapInstance().closePopup();
      } catch {}
      removeLayers(taskRoutePointLayers.value);
      taskRoutePointLayers.value = [];
    };

    /** 清空当前定位人员 marker。人员功能只保留一个当前定位点，避免和旧系统行为不一致。 */
    const clearPersonnel = (): void => {
      const plugin = mapPluginRef.value;
      if (!plugin) {
        personnelLayers.value = [];
        return;
      }
      try {
        plugin.getMapInstance().closePopup();
      } catch {}
      personnelLayers.value.forEach((layer) => {
        try {
          plugin.removeMarker(layer);
        } catch {
          try {
            plugin.getMapInstance().removeLayer(layer);
          } catch {}
        }
      });
      personnelLayers.value = [];
    };

    /** 清空人员历史轨迹线和起终点 marker。 */
    const clearPersonnelTrack = (): void => {
      removeLayers(personnelTrackLayers.value);
      personnelTrackLayers.value = [];
    };

    /** 清空巡检覆盖度多边形。 */
    const clearCoverage = (): void => {
      removeLayers(coverageLayers.value);
      coverageLayers.value = [];
    };

    /** 清空异常热力图图层。 */
    const clearHeat = (): void => {
      const plugin = mapPluginRef.value;
      if (!plugin) {
        heatLayers.value = [];
        return;
      }
      heatLayers.value.forEach((layer) => {
        try {
          plugin.removeHeatLayer(layer);
        } catch {
          try {
            plugin.removeMarker(layer);
          } catch {
            try {
              plugin.getMapInstance().removeLayer(layer);
            } catch {}
          }
        }
      });
      heatLayers.value = [];
    };

    /**
     * 等待地图完成当前帧和缩放动画。
     *
     * 覆盖图、热力图这类非聚合图层在动画中清理/重绘容易和 Leaflet 内部状态竞态，
     * 所以渲染前先等待地图稳定。
     */
    const waitForMapStable = async (): Promise<boolean> => {
      const plugin = mapPluginRef.value;
      if (!plugin || destroyed.value) {
        return false;
      }
      const map = plugin.getMapInstance();
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => resolve());
        });
      });
      if (destroyed.value || mapPluginRef.value !== plugin) {
        return false;
      }
      if ((map as any)._animatingZoom === true) {
        await new Promise<void>((resolve) => {
          map.once("zoomend", () => resolve());
        });
      }
      return !destroyed.value && mapPluginRef.value === plugin;
    };

    /** 清空所有业务覆盖物，并重置渲染签名。 */
    const clearAllOverlays = (): void => {
      clearPoints();
      clearTaskObjects();
      clearTaskRoutePoints();
      clearPersonnel();
      clearPersonnelTrack();
      clearCoverage();
      clearHeat();
      renderState.value = {
        pointsSig: "",
        coverageSig: "",
        heatSig: "",
      };
    };

    /** 返回首次加载时记录的全局主视角。 */
    const resetToInitialView = async (): Promise<void> => {
      const plugin = mapPluginRef.value;
      if (!plugin || destroyed.value) {
        return;
      }
      const view = initialView.value;
      try {
        await plugin.setCenter(view.center.lng, view.center.lat);
        await plugin.setZoom(view.zoom);
        plugin.setRotation(view.rotation);
      } catch {}
    };

    /**
     * 查看任务对象后自动聚焦对象点位，聚焦时避开左右大屏面板。
     */
    const fitTaskObjectView = async (points: Array<{ lng: number; lat: number }>): Promise<void> => {
      const plugin = mapPluginRef.value;
      if (!plugin || points.length === 0) {
        return;
      }
      const map = plugin.getMapInstance();
      const { paddingTopLeft, paddingBottomRight } = getMapViewportPadding(map);
      const maxZoom = 17;
      if (points.length === 1) {
        await focusSinglePointAtMapCenter(points[0], maxZoom);
        return;
      }
      const bounds = points.map((point) => [point.lat, point.lng] as [number, number]);
      map.fitBounds(bounds, {
        animate: true,
        maxZoom,
        paddingTopLeft,
        paddingBottomRight,
      });
    };

    /** 绑定人员 marker popup 内按钮事件，把具体动作交回父组件处理。 */
    const bindPersonnelPopupActions = (marker: any, person: PersonnelItem): void => {
      marker.on("popupopen", () => {
        window.requestAnimationFrame(() => {
          const map = mapPluginRef.value?.getMapInstance();
          const container = map?.getContainer?.() as HTMLElement | undefined;
          if (!container) {
            return;
          }
          const popup = container.querySelector(`[data-personnel-popup="${person.id}"]`);
          popup?.querySelector('[data-action="call"]')?.addEventListener("click", () => props.onPersonnelCall(person), { once: true });
          popup?.querySelector('[data-action="video"]')?.addEventListener("click", () => props.onPersonnelVideo(person), { once: true });
          popup
            ?.querySelector('[data-action="history"]')
            ?.addEventListener("click", () => props.onOpenPersonnelHistory(person), { once: true });
          popup?.querySelector('[data-action="close"]')?.addEventListener(
            "click",
            () => {
              try {
                map.closePopup();
              } catch {}
              props.onClosePersonnelMarker();
            },
            { once: true },
          );
        });
      });
    };

    /**
     * 渲染当前定位人员。
     *
     * 旧系统点击“定位”只聚焦一个人员，因此这里每次都清理旧人员点和旧轨迹，再渲染当前人员。
     */
    const renderPersonnel = async (): Promise<void> => {
      const plugin = mapPluginRef.value;
      if (!plugin || destroyed.value) {
        return;
      }
      const currentVersion = ++personnelRenderVersion.value;
      clearPersonnel();
      clearPersonnelTrack();
      const person = props.personnelTarget;
      if (!person) {
        return;
      }
      if (!person.gps) {
        message.error("坐标无效");
        return;
      }
      const marker = await plugin.addMarker({
        position: { lng: person.gps.lng, lat: person.gps.lat },
        title: person.name,
        icon: getPersonnelMarkerIcon(),
        iconSize: [30, 42],
      });
      if (destroyed.value || currentVersion !== personnelRenderVersion.value) {
        try {
          plugin.removeMarker(marker);
        } catch {}
        return;
      }
      marker.bindPopup(
        `
        <div class="map-detail-popup personnel-popup" data-personnel-popup="${escapeHtml(person.id)}">
          <div class="popup-title-custom">${escapeHtml(person.name)} <span class="personnel-online-tag">在线</span></div>
          <div class="popup-row-custom"><strong>部门：</strong>${escapeHtml(person.organizationName || "--")}</div>
          <div class="popup-row-custom"><strong>职位：</strong>${escapeHtml(person.positionName || "--")}</div>
          <div class="popup-row-custom"><strong>电话：</strong>${escapeHtml(person.mobile || "--")}</div>
          <div class="personnel-popup-actions">
            <button type="button" data-action="call">通话</button>
            <button type="button" data-action="video">视频</button>
            <button type="button" data-action="history">查看轨迹</button>
            <button type="button" data-action="close">关闭</button>
          </div>
        </div>
        `,
        { autoPan: false, closeButton: false, maxWidth: 300, className: "custom-popup personnel-custom-popup" },
      );
      bindPersonnelPopupActions(marker, person);
      try {
        marker.setZIndexOffset(10000);
      } catch {}
      personnelLayers.value.push(marker);
      const map = plugin.getMapInstance();
      await focusSinglePointAtMapCenter(person.gps, Math.max(map.getZoom(), 22));
      if (destroyed.value || currentVersion !== personnelRenderVersion.value) {
        return;
      }
      marker.openPopup();
    };

    /** 根据历史轨迹弹窗的勾选状态绘制或清理人员轨迹。 */
    const renderPersonnelTrack = async (): Promise<void> => {
      const plugin = mapPluginRef.value;
      if (!plugin || destroyed.value) {
        return;
      }
      const currentVersion = ++personnelTrackRenderVersion.value;
      clearPersonnelTrack();
      if (!props.personnelTrackVisible || props.personnelTrackPoints.length === 0) {
        return;
      }
      const points = props.personnelTrackPoints.map((point) => ({ lng: point.lng, lat: point.lat }));
      if (points.length > 1) {
        const polyline = plugin.createPolyline(points, "#2989ff", 8);
        try {
          (polyline as any).options.interactive = false;
          polyline.setStyle({ color: "#2989ff", weight: 8, opacity: 0.96, lineCap: "round", lineJoin: "round" });
          polyline.bringToBack();
        } catch {}
        makeLayerClickThrough(polyline);
        personnelTrackLayers.value.push(polyline);
        for (const arrow of getTrackArrowPoints(props.personnelTrackPoints)) {
          const arrowMarker = addCenteredTrackMarker({ lng: arrow.lng, lat: arrow.lat }, getTrackArrowIcon(arrow.angle), [28, 28]);
          if (!arrowMarker) {
            continue;
          }
          try {
            arrowMarker.setZIndexOffset(1200);
          } catch {}
          makeLayerClickThrough(arrowMarker);
          if (destroyed.value || currentVersion !== personnelTrackRenderVersion.value) {
            try {
              plugin.getMapInstance().removeLayer(arrowMarker);
            } catch {}
            return;
          }
          personnelTrackLayers.value.push(arrowMarker);
        }
      }
      const start = props.personnelTrackPoints[0];
      const end = props.personnelTrackPoints[props.personnelTrackPoints.length - 1];
      for (const [type, point] of [
        ["start", start],
        ["end", end],
      ] as Array<["start" | "end", PersonnelTrackPoint]>) {
        const marker = addCenteredTrackMarker(
          { lng: point.lng, lat: point.lat },
          getTrackMarkerIcon(type),
          [42, 54],
          getTrackEndpointOffset(type, point, start, end),
        );
        if (!marker) {
          continue;
        }
        try {
          marker.setZIndexOffset(1300);
        } catch {}
        makeLayerClickThrough(marker);
        if (destroyed.value || currentVersion !== personnelTrackRenderVersion.value) {
          try {
            plugin.getMapInstance().removeLayer(marker);
          } catch {}
          return;
        }
        personnelTrackLayers.value.push(marker);
      }
      personnelLayers.value.forEach((layer) => {
        try {
          layer.setZIndexOffset(10000);
          layer.bringToFront?.();
        } catch {}
      });
    };

    /**
     * 渲染任务对象图层。
     *
     * 由任务列表“查看对象”触发；渲染独立 marker，不参与巡检点聚合，
     * 并在数据有效时自动调整地图视野。
     */
    const renderTaskObjects = async (): Promise<void> => {
      const plugin = mapPluginRef.value;
      if (!plugin || destroyed.value) {
        return;
      }
      const currentVersion = ++taskObjectRenderVersion.value;
      clearTaskObjects();
      if (props.taskObjects.length === 0) {
        return;
      }
      const validPoints: Array<{ item: TaskObjectItem; lng: number; lat: number }> = [];
      props.taskObjects.forEach((item) => {
        const point = parseLatAndLon(item.latAndLon);
        if (point) {
          validPoints.push({ item, ...point });
        }
      });
      if (validPoints.length === 0) {
        message.info("巡检对象暂无有效点位");
        return;
      }
      for (const point of validPoints) {
        const marker = await plugin.addMarker({
          position: { lng: point.lng, lat: point.lat },
          title: point.item.targetName,
          icon: getTaskObjectMarkerIcon(point.item.targetCategory),
          iconSize: [30, 42],
        });
        if (destroyed.value || currentVersion !== taskObjectRenderVersion.value) {
          try {
            plugin.removeMarker(marker);
          } catch {}
          continue;
        }
        marker.bindPopup(
          `
          <div class="map-detail-popup task-object-popup">
            <div class="popup-title-custom">📍 ${escapeHtml(point.item.targetName)}</div>
            <div class="popup-row-custom"><strong>对象编码：</strong>${escapeHtml(point.item.targetCode)}</div>
            <div class="popup-row-custom"><strong>对象分类：</strong>${escapeHtml(targetCategoryText[point.item.targetCategory] || point.item.targetCategory)}</div>
            <div class="popup-row-custom"><strong>对象类型：</strong>${escapeHtml(point.item.targetType)}</div>
            <div class="popup-row-custom"><strong>所属区域：</strong>${escapeHtml(point.item.targetAreaName)}</div>
            <div class="popup-row-custom"><strong>对象地址：</strong>${escapeHtml(point.item.targetAddress)}</div>
            <div class="popup-row-custom"><strong>经纬度：</strong>${escapeHtml(point.item.latAndLon)}</div>
            <div class="popup-row-custom"><strong>关联对象：</strong>${point.item.isRelated ? "是" : "否"}</div>
          </div>
          `,
          { autoPan: false, closeButton: false, maxWidth: 280, className: "custom-popup" },
        );
        taskObjectLayers.value.push(marker);
      }
      await fitTaskObjectView(validPoints.map((point) => ({ lng: point.lng, lat: point.lat })));
    };

    /**
     * 渲染当前选中任务的航点图层。
     *
     * 纯无人机 / 混合巡检任务点击后由父组件传入航点数据；这里绘制航线和数字航点 marker。
     */
    const renderTaskRoutePoints = async (): Promise<void> => {
      const plugin = mapPluginRef.value;
      if (!plugin || destroyed.value) {
        return;
      }
      const currentVersion = ++taskRoutePointRenderVersion.value;
      clearTaskRoutePoints();
      if (props.taskRoutePoints.length === 0) {
        return;
      }
      const routePoints = props.taskRoutePoints.filter((point) => Number.isFinite(point.lng) && Number.isFinite(point.lat));
      if (routePoints.length === 0) {
        message.info("航点暂无有效点位");
        return;
      }
      if (routePoints.length > 1) {
        const line = plugin.createPolyline(
          routePoints.map((point) => ({ lng: point.lng, lat: point.lat })),
          "#f6cc49",
          5,
        );
        if (typeof (line as any).setStyle === "function") {
          (line as any).setStyle({
            color: "#f6cc49",
            dashArray: "10 8",
            lineCap: "round",
            lineJoin: "round",
          });
        }
        taskRoutePointLayers.value.push(line);
      }
      for (const [index, point] of routePoints.entries()) {
        const marker = await plugin.addMarker({
          position: { lng: point.lng, lat: point.lat },
          title: point.name,
          icon: getTaskRoutePointMarkerIcon(point, index),
          iconSize: [30, 30],
        });
        if (destroyed.value || currentVersion !== taskRoutePointRenderVersion.value) {
          try {
            plugin.removeMarker(marker);
          } catch {}
          continue;
        }
        marker.bindPopup(
          `
          <div class="map-detail-popup task-route-popup">
            <div class="popup-title-custom">航点 ${index + 1} · ${escapeHtml(point.name)}</div>
            <div class="popup-row-custom"><strong>坐标：</strong>${point.lng.toFixed(5)}, ${point.lat.toFixed(5)}</div>
            <div class="popup-row-custom"><strong>高度：</strong>${escapeHtml(point.heightText || "--")}</div>
            <div class="popup-row-custom"><strong>类型：</strong>${escapeHtml(point.typeName || "--")}</div>
            <div class="popup-row-custom"><strong>时间：</strong>${escapeHtml(point.timeText || "--")}</div>
            <div class="popup-row-custom"><strong>结果：</strong>${escapeHtml(point.result || "--")}</div>
          </div>
          `,
          { autoPan: false, closeButton: false, maxWidth: 260, className: "custom-popup" },
        );
        taskRoutePointLayers.value.push(marker);
      }
      await fitTaskObjectView(routePoints.map((point) => ({ lng: point.lng, lat: point.lat })));
    };

    /** 从全部异常点中取当前地图视野内的点，用于减少视野外异常点对热力强度的影响。 */
    const getVisibleAbnormalHeatPoints = (
      plugin: CubeMapLeaflet,
      points: Array<{ item: InspectionPointItem; lng: number; lat: number }>,
    ): Array<{ item: InspectionPointItem; lng: number; lat: number }> => {
      return points.filter((point) => {
        try {
          return plugin.containsPositionInCurrentView({ lng: point.lng, lat: point.lat });
        } catch {
          return true;
        }
      });
    };

    /**
     * 渲染地图图层主入口。
     *
     * 根据父组件传入的 layers 控制巡检点、覆盖度、异常热力图显隐；
     * 使用签名避免相同数据重复清图重绘，并用 renderVersion 避免异步渲染结果回写旧地图。
     */
    const renderLayers = async (): Promise<void> => {
      const plugin = mapPluginRef.value;
      if (!plugin || destroyed.value) {
        return;
      }
      const currentVersion = ++renderVersion.value;
      const selected = props.pointCategory || [];
      const points = selected.length > 0 ? props.pointTargets.filter((item) => selected.includes(item.category)) : [];
      const pointsEnabled = props.layers.includes("INSPECTION_POINTS");
      const coverageEnabled = props.layers.includes("COVERAGE");
      const heatEnabled = props.layers.includes("HEATMAP");
      const pointsSig = pointsEnabled
        ? points
            .map((p) => `${p.category}:${p.id}:${p.latAndLon}`)
            .sort()
            .join("|")
        : "";
      const coverageSource = getCoverageSourcePoints();
      const coverageRegions = buildCoverageRegions(coverageSource);
      const abnormalHeatPoints = heatEnabled
        ? props.abnormalTargets
            .map((item) => {
              const position = parseLatAndLon(item.latAndLon);
              return position ? { item, ...position } : null;
            })
            .filter((point): point is { item: InspectionPointItem; lng: number; lat: number } => point !== null)
        : [];
      const visibleAbnormalHeatPoints = heatEnabled ? getVisibleAbnormalHeatPoints(plugin, abnormalHeatPoints) : [];
      const coverageSig = coverageEnabled
        ? coverageRegions.map((region) => region.polygon.map((p) => `${p.lng},${p.lat}`).join(",")).join("|")
        : "";
      const heatSig = heatEnabled
        ? visibleAbnormalHeatPoints
            .map((point) => `${point.item.id}:${point.lng},${point.lat}`)
            .sort()
            .join("|")
        : "";

      // 巡检点分类图层：使用公共地图插件的 markercluster 能力渲染，点位点击展示详情 popup。
      if (!pointsEnabled) {
        if (renderState.value.pointsSig) {
          clearPoints();
          renderState.value.pointsSig = "";
        }
      } else if (renderState.value.pointsSig !== pointsSig) {
        clearPoints();
        for (const point of points) {
          const position = parseLatAndLon(point.latAndLon);
          if (!position) {
            continue;
          }
          const marker = await plugin.addClusteredMarker({
            position,
            title: point.name,
            icon: getCategoryMarkerIcon(point.category),
            iconSize: [30, 42],
          });
          if (destroyed.value || currentVersion !== renderVersion.value) {
            try {
              (plugin as any).markerClusterGroup?.removeLayer?.(marker);
            } catch {}
            const markers = (plugin as any).markers;
            if (Array.isArray(markers)) {
              const index = markers.indexOf(marker);
              if (index >= 0) {
                markers.splice(index, 1);
              }
            }
            continue;
          }
          marker.bindPopup(
            `
            <div class="map-detail-popup">
              <div class="popup-title-custom">巡检点 - ${escapeHtml(point.name)}</div>
              <div class="popup-row-custom"><strong>对象编码：</strong>${escapeHtml(point.code)}</div>
              <div class="popup-row-custom"><strong>对象分类：</strong>${escapeHtml(point.categoryName)}</div>
              <div class="popup-row-custom"><strong>对象类型：</strong>${escapeHtml(point.typeName)}</div>
              <div class="popup-row-custom"><strong>位置：</strong>${escapeHtml(point.location)}</div>
              <div class="popup-row-custom"><strong>经纬度：</strong>${escapeHtml(point.latAndLon)}</div>
            </div>
            `,
            { autoPan: false, closeButton: false, maxWidth: 260, className: "custom-popup" },
          );
          pointLayers.value.push(marker);
        }
        renderState.value.pointsSig = pointsSig;
      }

      // 巡检覆盖度：按距离把巡检点拆成多个区域，每个区域单独生成覆盖多边形。
      if (!coverageEnabled) {
        if (renderState.value.coverageSig) {
          if (!(await waitForMapStable()) || currentVersion !== renderVersion.value) {
            return;
          }
          clearCoverage();
          renderState.value.coverageSig = "";
        }
      } else if (renderState.value.coverageSig !== coverageSig) {
        if (!(await waitForMapStable()) || currentVersion !== renderVersion.value) {
          return;
        }
        clearCoverage();
        for (const [index, region] of coverageRegions.entries()) {
          if (region.polygon.length < 3) {
            continue;
          }
          const polygonPoints = region.polygon.map((p) => ({ lng: Number(p.lng), lat: Number(p.lat) }));
          const polygon = plugin.createPolygon(polygonPoints, "#2f7bff", 2, "rgba(47,123,255,0.2)");
          if (destroyed.value || currentVersion !== renderVersion.value) {
            try {
              plugin.getMapInstance().removeLayer(polygon);
            } catch {}
            return;
          }
          if (typeof (polygon as any).setStyle === "function") {
            (polygon as any).setStyle({
              dashArray: "8 6",
              lineCap: "round",
              lineJoin: "round",
            });
          }
          polygon.bindPopup(
            `
            <div class="map-detail-popup">
              <div class="popup-title-custom">巡检覆盖区域 ${index + 1}</div>
              <div class="popup-row-custom"><strong>覆盖点位:</strong> ${region.points.length}个</div>
              <div class="popup-row-custom"><strong>分组距离:</strong> ${coverageGroupDistanceMeters / 1000}公里内连通</div>
            </div>
            `,
            { closeButton: false, maxWidth: 260, className: "custom-popup", autoPan: false },
          );
          coverageLayers.value.push(polygon);
        }
        renderState.value.coverageSig = coverageSig;
      }

      // 异常热力图：始终保持热力图语义，通过 max/radius/blur 控制单点视觉强度。
      if (!heatEnabled) {
        if (renderState.value.heatSig) {
          if (!(await waitForMapStable()) || currentVersion !== renderVersion.value) {
            return;
          }
          clearHeat();
          renderState.value.heatSig = "";
        }
      } else if (renderState.value.heatSig !== heatSig) {
        if (!(await waitForMapStable()) || currentVersion !== renderVersion.value) {
          return;
        }
        clearHeat();
        if (visibleAbnormalHeatPoints.length > 0) {
          const heatPoints = visibleAbnormalHeatPoints.map((point) => ({
            lng: point.lng,
            lat: point.lat,
            intensity: 1,
          }));
          const heatLayer = plugin.createHeatLayer(heatPoints, abnormalHeatOptions);
          if (destroyed.value || currentVersion !== renderVersion.value) {
            try {
              plugin.removeHeatLayer(heatLayer);
            } catch {}
            return;
          }
          heatLayers.value.push(heatLayer);
        }
        renderState.value.heatSig = heatSig;
      }
    };

    /** 获取当前覆盖度来源点：只取已选择分类且经纬度有效的巡检点。 */
    const getCoverageSourcePoints = () => {
      const selected = props.pointCategory || [];
      if (selected.length === 0) {
        return [];
      }
      return props.pointTargets
        .filter((item) => selected.includes(item.category))
        .map((item) => parseLatAndLon(item.latAndLon))
        .filter((point): point is { lng: number; lat: number } => point !== null);
    };

    /** 计算两个经纬度点之间的球面距离，单位：米。 */
    const getDistanceMeters = (a: { lng: number; lat: number }, b: { lng: number; lat: number }): number => {
      const earthRadius = 6371000;
      const toRadians = (value: number): number => (value * Math.PI) / 180;
      const lat1 = toRadians(a.lat);
      const lat2 = toRadians(b.lat);
      const deltaLat = toRadians(b.lat - a.lat);
      const deltaLng = toRadians(b.lng - a.lng);
      const sinLat = Math.sin(deltaLat / 2);
      const sinLng = Math.sin(deltaLng / 2);
      const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
      return 2 * earthRadius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    };

    /** 按距离连通关系把巡检点拆成多个覆盖区域，避免远距离点被强行连成一个大面。 */
    const groupCoveragePoints = (points: Array<{ lng: number; lat: number }>): Array<Array<{ lng: number; lat: number }>> => {
      const visited = new Set<number>();
      const groups: Array<Array<{ lng: number; lat: number }>> = [];
      for (let index = 0; index < points.length; index += 1) {
        if (visited.has(index)) {
          continue;
        }
        const queue = [index];
        const group: Array<{ lng: number; lat: number }> = [];
        visited.add(index);
        while (queue.length > 0) {
          const current = queue.shift() as number;
          group.push(points[current]);
          for (let next = 0; next < points.length; next += 1) {
            if (visited.has(next)) {
              continue;
            }
            if (getDistanceMeters(points[current], points[next]) <= coverageGroupDistanceMeters) {
              visited.add(next);
              queue.push(next);
            }
          }
        }
        groups.push(group);
      }
      return groups;
    };

    /** 根据点集计算凸包，用作单个巡检覆盖区域的多边形边界。 */
    const buildConvexHull = (points: Array<{ lng: number; lat: number }>) => {
      const uniq = Array.from(new Map(points.map((p) => [`${p.lng},${p.lat}`, p])).values());
      if (uniq.length <= 1) {
        return uniq;
      }
      const sorted = [...uniq].sort((a, b) => (a.lng === b.lng ? a.lat - b.lat : a.lng - b.lng));
      const cross = (o: any, a: any, b: any) => (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng);
      const lower: any[] = [];
      for (const p of sorted) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
        lower.push(p);
      }
      const upper: any[] = [];
      for (let i = sorted.length - 1; i >= 0; i--) {
        const p = sorted[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
        upper.push(p);
      }
      upper.pop();
      lower.pop();
      return lower.concat(upper);
    };

    /** 单点或双点无法形成凸包时，用小矩形表达该点位组自己的覆盖面。 */
    const buildBufferedRectangle = (points: Array<{ lng: number; lat: number }>): Array<{ lng: number; lat: number }> => {
      const lngs = points.map((p) => p.lng);
      const lats = points.map((p) => p.lat);
      const centerLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;
      const latOffset = coverageFallbackBufferMeters / 111320;
      const lngOffset = coverageFallbackBufferMeters / (111320 * Math.max(Math.cos((centerLat * Math.PI) / 180), 0.2));
      const minLng = Math.min(...lngs) - lngOffset;
      const maxLng = Math.max(...lngs) + lngOffset;
      const minLat = Math.min(...lats) - latOffset;
      const maxLat = Math.max(...lats) + latOffset;
      return [
        { lng: minLng, lat: minLat },
        { lng: maxLng, lat: minLat },
        { lng: maxLng, lat: maxLat },
        { lng: minLng, lat: maxLat },
      ];
    };

    /** 生成单个覆盖区域多边形；少于 3 个点时退化成小矩形，避免无法绘制 polygon。 */
    const buildCoveragePolygon = (points: Array<{ lng: number; lat: number }>) => {
      if (points.length === 0) {
        return [];
      }
      if (points.length < 3) {
        return buildBufferedRectangle(points);
      }
      const hull = buildConvexHull(points);
      return hull.length >= 3 ? hull : buildBufferedRectangle(points);
    };

    /** 生成多个覆盖区域；远距离点分开成面，近距离或链式相邻点合并成同一个面。 */
    const buildCoverageRegions = (points: Array<{ lng: number; lat: number }>): CoverageRegion[] => {
      return groupCoveragePoints(points).map((group) => ({
        points: group,
        polygon: buildCoveragePolygon(group),
      }));
    };

    /** 初始化地图实例、读取地图配置，并安装当前大屏需要的 Leaflet 兼容与聚合行为。 */
    onMounted(async () => {
      try {
        const sessionToken = JSON.parse(sessionStorage.getItem("GH-Token") || "{}").access_token || "";
        const sessionTenant = JSON.parse(sessionStorage.getItem("GH-NowEnterprise") || "{}").code || "";
        const token = authStore.token || sessionToken;
        const tenant = authStore.tenant || sessionTenant;
        const terminal = authStore.terminal || CubeTerminalEnum.BUSINESS;

        if (!token) {
          throw new Error("地图鉴权失败：缺少 token");
        }
        if (!tenant) {
          throw new Error("地图鉴权失败：缺少 tenant，请先选择企业");
        }

        const auth: MapAuth = { token, tenant, terminal };
        const plugin = new CubeMapLeaflet(auth as any);
        let mapConfig: Awaited<ReturnType<typeof getInspectionMapConfig>> = null;
        try {
          mapConfig = await getInspectionMapConfig();
        } catch {
          mapConfig = null;
        }
        await plugin.renderMap(mapId, {
          center: mapConfig?.center ?? defaultCenter,
          zoomControl: false,
          rotateControl: false,
          mapStyle: "amap://styles/darkblue",
        });
        patchLeafletAnimateZoom();
        const map = plugin.getMapInstance();
        installZoomPopupGuard(map);
        map.invalidateSize(false);
        initialView.value = {
          center: mapConfig?.center ?? defaultCenter,
          zoom: mapConfig?.zoom ?? map.getZoom(),
          rotation: mapConfig?.rotation ?? 0,
        };
        if (mapConfig) {
          await plugin.setZoom(mapConfig.zoom);
          plugin.setRotation(mapConfig.rotation);
        }
        mapPluginRef.value = plugin;
        plugin.initClusterLayer({
          maxClusterRadius: 72,
          disableClusteringAtZoom: 19,
          spiderfyOnMaxZoom: false,
        });
        configureInspectionClusterLayer(plugin);
        installClusterClickBehavior(plugin);
        installHeatViewportBehavior(plugin);
        await renderLayers();
        await renderTaskObjects();
        await renderTaskRoutePoints();
        await renderPersonnel();
        await renderPersonnelTrack();
      } catch (error) {
        message.error("地图加载失败");
      }
    });

    /** 图层开关、巡检点数据或异常点数据变化时，刷新对应地图覆盖物。 */
    watch(
      () =>
        `${props.layers.join(",")}|${(props.pointCategory || []).join(",")}|${props.pointTargets.map((item) => `${item.id}:${item.latAndLon}`).join("|")}|${props.abnormalTargets.map((item) => `${item.id}:${item.latAndLon}`).join("|")}`,
      async () => {
        await renderLayers();
      },
    );

    /** 任务对象数据变化时，刷新任务对象 marker 并自动聚焦。 */
    watch(
      () => props.taskObjects.map((item) => `${item.id}:${item.latAndLon}`).join("|"),
      async () => {
        await renderTaskObjects();
      },
    );

    /** 任务航点数据变化时，刷新航线和数字航点 marker 并自动聚焦。 */
    watch(
      () => props.taskRoutePoints.map((item) => `${item.id}:${item.lng}:${item.lat}:${item.status}:${item.result}`).join("|"),
      async () => {
        await renderTaskRoutePoints();
      },
    );

    /** 当前定位人员变化时，只渲染这个人员点，并清空旧轨迹。 */
    watch(
      () =>
        `${props.personnelFocusSignal}:${props.personnelTarget?.id || ""}:${props.personnelTarget?.gps?.lng || ""}:${props.personnelTarget?.gps?.lat || ""}`,
      async () => {
        await renderPersonnel();
      },
    );

    /** 历史轨迹显隐或轨迹点变化时，刷新轨迹线和起终点。 */
    watch(
      () =>
        `${props.personnelTrackVisible ? "1" : "0"}|${props.personnelTrackPoints.map((item) => `${item.id}:${item.lng}:${item.lat}`).join("|")}`,
      async () => {
        await renderPersonnelTrack();
      },
    );

    /** 父组件触发“全局视角”时，恢复首次渲染记录的地图视角。 */
    watch(
      () => props.globalViewSignal,
      async (signal, prevSignal) => {
        if (signal === prevSignal) {
          return;
        }
        await resetToInitialView();
      },
    );

    /** 组件卸载时清理全部图层和事件监听，避免地图实例销毁后仍收到 Leaflet 事件。 */
    onBeforeUnmount(() => {
      destroyed.value = true;
      renderVersion.value += 1;
      taskObjectRenderVersion.value += 1;
      personnelRenderVersion.value += 1;
      personnelTrackRenderVersion.value += 1;
      clearAllOverlays();
      uninstallClusterClickBehavior();
      uninstallHeatViewportBehavior();
      uninstallZoomPopupGuard();
      try {
        mapPluginRef.value?.destroy();
      } catch {}
      mapPluginRef.value = null;
    });

    return () => (
      <div class="map-canvas-wrap">
        <div id={mapId} class="map-canvas" />
      </div>
    );
  },
});
