import { transformGCJ02ToWGS84 } from "@isvend/coord-transform";
import L from "leaflet";
import { showToast } from "vant";
import { nextTick, onBeforeUnmount, ref, watch, type ComputedRef, type Ref } from "vue";

import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import { CubeMapLeaflet } from "@ghcloud/cube-map-plugins";

import { authStore } from "@/api/auth-store";
import { resolvePlanOverlayUrl, revokePlanOverlayUrl } from "@/utils/file-url";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, PLAN_EDIT_PANE, ROUTE_MARKER_PANE, ROUTE_POLYLINE_PANE } from "@/utils/map/constants";
import { cloneRoutePoints, computeRoutePointAngle, createArrowDivIcon, toLeafletBounds } from "@/utils/map/map-utils";
import { getPlanAspectRatio } from "@/utils/plan-image-aspect";
import { ensureLeafletForCubeMap } from "@/utils/prepare-leaflet-for-cube-map";
import type { EvacuationRoute, FloorPlanImage, PlanTransform, RoutePoint } from "@/utils/types";

type PlanImageLayer = L.ImageOverlay & {
  _evacuationPlanRotation?: number;
  _evacuationRotationBound?: boolean;
  _evacuationAspectRatio?: number;
  _evacuationAspectLoadBound?: boolean;
};

type RouteSource = Ref<EvacuationRoute[]> | ComputedRef<EvacuationRoute[]>;

export type MarkerScreenPos = { left: string; top: string };

let mapSeq = 0;

function getRouteStyle(route: EvacuationRoute): { opacity?: number; dashArray?: string; weight?: number } {
  if (!route.enabled || route.trafficStatus === "阻断") {
    return { opacity: 0.45, dashArray: "6,3", weight: 4 };
  }
  if (route.trafficStatus === "拥挤") {
    return { dashArray: "4,2", weight: 4 };
  }
  return { weight: 4 };
}

function bindPlanRotationSync(layer: PlanImageLayer, transform: PlanTransform, map: L.Map): void {
  const sync = (): void => {
    requestAnimationFrame(() => {
      const img = layer.getElement();
      if (!img) {
        return;
      }
      const rotation = transform.rotation ?? 0;
      const base = (img.style.transform || "").replaceAll(/\s*rotate\([^)]*\)/g, "").trim();
      img.style.transform = rotation ? `${base} rotate(${rotation}deg)` : base;
      if (rotation) {
        img.style.transformOrigin = "center center";
      }
    });
  };
  if (!layer._evacuationRotationBound) {
    layer._evacuationRotationBound = true;
    map.on("zoom move viewreset", sync);
    layer.on("remove", () => {
      map.off("zoom move viewreset", sync);
    });
  }
  sync();
}

export function useH5EvacuationLeafletMap(options: {
  mapId: string;
  planImageUrl: Ref<string> | ComputedRef<string>;
  floorPlan: Ref<FloorPlanImage | null> | ComputedRef<FloorPlanImage | null>;
  planImageFile:
    | Ref<{ id: string; path: string; endpointPath: string } | null>
    | ComputedRef<{ id: string; path: string; endpointPath: string } | null>;
  planTransform: Ref<PlanTransform> | ComputedRef<PlanTransform>;
  routes: RouteSource;
  firePoint: Ref<RoutePoint | null> | ComputedRef<RoutePoint | null>;
  userPoint: Ref<RoutePoint | null> | ComputedRef<RoutePoint | null>;
  onMapReady?: () => void;
}) {
  const mapLoading = ref(true);
  const mapReady = ref(false);
  const alarmMarkerPos = ref<MarkerScreenPos | null>(null);
  const userMarkerPos = ref<MarkerScreenPos | null>(null);

  let cubeMap: CubeMapLeaflet | null = null;
  let disposed = false;
  let planLayer: PlanImageLayer | null = null;
  let planOverlayUrl = "";
  const routePolylines: L.Polyline[] = [];
  const routeMarkers: L.Marker[] = [];
  let markerSyncBound = false;
  let lastFocusedPlanKey = "";

  const businessToLeafletLatLng = (point: RoutePoint): L.LatLng => {
    if (cubeMap?.getMapType() === "TD_MAP") {
      const [lng, lat] = transformGCJ02ToWGS84(point.lng, point.lat);
      return L.latLng(lat, lng);
    }
    return L.latLng(point.lat, point.lng);
  };

  const resolvedLeafletBounds = (
    transform: PlanTransform,
    plan?: FloorPlanImage | null,
    layer?: PlanImageLayer,
  ): L.LatLngBoundsExpression => {
    const aspectRatio = layer?._evacuationAspectRatio ?? getPlanAspectRatio(plan ?? undefined);
    return toLeafletBounds(transform, cubeMap!.getMapType(), aspectRatio, transform.center.lat);
  };

  const applyPlanBounds = (layer: PlanImageLayer, transform: PlanTransform, plan?: FloorPlanImage | null): void => {
    layer.setBounds(resolvedLeafletBounds(transform, plan, layer));
    bindPlanRotationSync(layer, transform, cubeMap!.getMapInstance());
  };

  const syncPlanAspectFromImage = (layer: PlanImageLayer, plan: FloorPlanImage | null, transform: PlanTransform): void => {
    const img = layer.getElement();
    if (!img?.naturalWidth || !img?.naturalHeight) {
      return;
    }
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    if (!Number.isFinite(aspectRatio) || aspectRatio <= 0) {
      return;
    }
    const prev = layer._evacuationAspectRatio ?? getPlanAspectRatio(plan ?? undefined, 0);
    if (prev > 0 && Math.abs(prev - aspectRatio) < 0.001) {
      return;
    }
    layer._evacuationAspectRatio = aspectRatio;
    applyPlanBounds(layer, transform, plan);
  };

  const bindPlanAspectOnLoad = (layer: PlanImageLayer, plan: FloorPlanImage | null, transform: PlanTransform): void => {
    if (layer._evacuationAspectLoadBound) {
      syncPlanAspectFromImage(layer, plan, transform);
      return;
    }
    layer._evacuationAspectLoadBound = true;
    layer.on("load", () => {
      syncPlanAspectFromImage(layer, plan, transform);
    });
    syncPlanAspectFromImage(layer, plan, transform);
  };

  const projectPoint = (point: RoutePoint): MarkerScreenPos | null => {
    const map = cubeMap?.getMapInstance();
    if (!map) {
      return null;
    }
    const pixel = map.latLngToContainerPoint(businessToLeafletLatLng(point));
    return { left: `${pixel.x}px`, top: `${pixel.y}px` };
  };

  const syncMarkerPositions = (): void => {
    if (!mapReady.value) {
      alarmMarkerPos.value = null;
      userMarkerPos.value = null;
      return;
    }
    const fire = options.firePoint.value;
    alarmMarkerPos.value = fire ? projectPoint(fire) : null;
    const user = options.userPoint.value;
    userMarkerPos.value = user ? projectPoint(user) : null;
  };

  const bindMarkerSync = (): void => {
    const map = cubeMap?.getMapInstance();
    if (!map || markerSyncBound) {
      return;
    }
    markerSyncBound = true;
    map.on("move zoom resize viewreset", syncMarkerPositions);
  };

  const unbindMarkerSync = (): void => {
    const map = cubeMap?.getMapInstance();
    if (map && markerSyncBound) {
      map.off("move zoom resize viewreset", syncMarkerPositions);
      markerSyncBound = false;
    }
  };

  const ensurePane = (name: string, zIndex: string): void => {
    const map = cubeMap!.getMapInstance();
    if (!map.getPane(name)) {
      map.createPane(name);
      const pane = map.getPane(name);
      if (pane) {
        pane.style.zIndex = zIndex;
      }
    }
  };

  const clearRouteLayers = (): void => {
    routePolylines.forEach((line) => line.remove());
    routePolylines.length = 0;
    routeMarkers.forEach((marker) => marker.remove());
    routeMarkers.length = 0;
  };

  const clearPlanLayer = (): void => {
    if (planLayer && cubeMap) {
      cubeMap.removeImageLayer(planLayer);
    }
    planLayer = null;
    if (planOverlayUrl) {
      revokePlanOverlayUrl(planOverlayUrl);
      planOverlayUrl = "";
    }
  };

  const renderPlanLayer = async (): Promise<void> => {
    if (!cubeMap || !mapReady.value) {
      return;
    }
    clearPlanLayer();
    const url = options.planImageUrl.value;
    if (!url) {
      return;
    }
    ensurePane(PLAN_EDIT_PANE, "650");
    const transform = options.planTransform.value;
    const plan = options.floorPlan.value;
    const bounds = resolvedLeafletBounds(transform, plan);
    const overlayUrl = await resolvePlanOverlayUrl(url, options.planImageFile.value ?? undefined);
    if (!overlayUrl || disposed) {
      return;
    }
    planOverlayUrl = overlayUrl;
    planLayer = L.imageOverlay(overlayUrl, bounds, {
      interactive: false,
      opacity: 0.82,
      className: "evacuation-plan-overlay",
      pane: PLAN_EDIT_PANE,
    }) as PlanImageLayer;
    if (plan?.aspectRatio && plan.aspectRatio > 0) {
      planLayer._evacuationAspectRatio = plan.aspectRatio;
    }
    cubeMap.addImageLayer(planLayer);
    bindPlanAspectOnLoad(planLayer, plan, transform);
    bindPlanRotationSync(planLayer, transform, cubeMap.getMapInstance());
  };

  const renderRoutes = (): void => {
    if (!cubeMap || !mapReady.value) {
      return;
    }
    clearRouteLayers();
    ensurePane(ROUTE_POLYLINE_PANE, "655");
    ensurePane(ROUTE_MARKER_PANE, "670");
    const map = cubeMap.getMapInstance();
    options.routes.value.forEach((route) => {
      if (!route.enabled) {
        return;
      }
      const points = cloneRoutePoints(route.points);
      if (points.length === 0) {
        return;
      }
      const style = getRouteStyle(route);
      const opacity = style.opacity ?? 0.9;
      if (points.length >= 2) {
        const polyline = L.polyline(
          points.map((p) => businessToLeafletLatLng(p)),
          {
            color: route.color,
            weight: style.weight ?? 4,
            opacity,
            dashArray: style.dashArray,
            pane: ROUTE_POLYLINE_PANE,
          },
        );
        polyline.addTo(map);
        routePolylines.push(polyline);
      }
      points.forEach((point, pointIdx) => {
        const marker = L.marker(businessToLeafletLatLng(point), {
          draggable: false,
          icon: createArrowDivIcon(route.color, computeRoutePointAngle(points, pointIdx)),
          pane: ROUTE_MARKER_PANE,
          opacity,
        });
        marker.addTo(map);
        routeMarkers.push(marker);
      });
    });
  };

  const focusPlanView = (): void => {
    const map = cubeMap?.getMapInstance();
    if (!map) {
      return;
    }
    const center = options.planTransform.value.center;
    if (center.lng && center.lat) {
      map.setView(businessToLeafletLatLng(center), DEFAULT_MAP_ZOOM);
      syncMarkerPositions();
    }
  };

  const maybeFocusPlanOnAreaChange = (): void => {
    const plan = options.floorPlan.value;
    const planId = plan?.id ?? options.planImageUrl.value;
    const areaKey = `${planId}-${options.planTransform.value.center.lng}-${options.planTransform.value.center.lat}`;
    if (!planId || areaKey === lastFocusedPlanKey) {
      return;
    }
    lastFocusedPlanKey = areaKey;
    focusPlanView();
  };

  const renderAll = (): void => {
    void renderPlanLayer();
    renderRoutes();
    syncMarkerPositions();
    maybeFocusPlanOnAreaChange();
    invalidateMapSize();
  };

  const invalidateMapSize = (): void => {
    try {
      cubeMap?.getMapInstance().invalidateSize(true);
      syncMarkerPositions();
    } catch {
      /* ignore */
    }
  };

  const initMap = async (): Promise<void> => {
    if (mapReady.value && cubeMap) {
      invalidateMapSize();
      renderAll();
      return;
    }
    mapLoading.value = true;
    try {
      if (!authStore.token || !authStore.tenant) {
        showToast("未获取登录信息，地图无法加载");
        return;
      }
      await nextTick();
      const container = document.getElementById(options.mapId);
      if (!container) {
        throw new Error("地图容器未就绪");
      }
      await ensureLeafletForCubeMap();
      if (disposed) {
        return;
      }
      const center = options.planTransform.value.center ?? options.firePoint.value ?? options.userPoint.value ?? DEFAULT_MAP_CENTER;
      cubeMap = new CubeMapLeaflet(authStore);
      await cubeMap.renderMap(options.mapId, {
        center,
        zoomControl: false,
      });
      cubeMap.getMapInstance().setZoom(DEFAULT_MAP_ZOOM);
      mapReady.value = true;
      bindMarkerSync();
      renderAll();
      requestAnimationFrame(() => {
        if (mapReady.value && cubeMap) {
          focusPlanView();
          syncMarkerPositions();
          invalidateMapSize();
          options.onMapReady?.();
        }
      });
    } catch {
      showToast("地图加载失败");
    } finally {
      mapLoading.value = false;
    }
  };

  const focusOnPoint = (point: RoutePoint, zoom = DEFAULT_MAP_ZOOM): void => {
    const map = cubeMap?.getMapInstance();
    if (!map) {
      return;
    }
    map.setView(businessToLeafletLatLng(point), zoom);
    requestAnimationFrame(() => {
      syncMarkerPositions();
    });
  };

  const applyUserLocation = (point: RoutePoint): void => {
    if (!mapReady.value) {
      return;
    }
    userMarkerPos.value = projectPoint(point);
    const map = cubeMap?.getMapInstance();
    const zoom = map ? Math.max(map.getZoom(), DEFAULT_MAP_ZOOM) : DEFAULT_MAP_ZOOM;
    focusOnPoint(point, zoom);
  };

  const zoomIn = (): void => {
    cubeMap?.getMapInstance().zoomIn();
  };

  const zoomOut = (): void => {
    cubeMap?.getMapInstance().zoomOut();
  };

  const resetView = (): void => {
    focusPlanView();
  };

  const destroyMap = (): void => {
    clearRouteLayers();
    unbindMarkerSync();
    alarmMarkerPos.value = null;
    userMarkerPos.value = null;
    clearPlanLayer();
    lastFocusedPlanKey = "";
    try {
      cubeMap?.destroy();
    } catch {
      /* ignore */
    }
    cubeMap = null;
    mapReady.value = false;
  };

  watch(
    () => [
      options.planImageUrl.value,
      options.planImageFile.value,
      options.floorPlan.value,
      options.planTransform.value,
      options.routes.value,
    ],
    () => {
      if (mapReady.value) {
        renderAll();
      }
    },
    { deep: true },
  );

  watch(
    () => {
      const fire = options.firePoint.value;
      return fire ? `${fire.lng},${fire.lat}` : "";
    },
    () => {
      if (mapReady.value) {
        syncMarkerPositions();
      }
    },
  );

  watch(
    () => {
      const user = options.userPoint.value;
      return user ? `${user.lng},${user.lat}` : "";
    },
    () => {
      if (mapReady.value) {
        syncMarkerPositions();
      }
    },
  );

  watch(mapReady, (ready) => {
    if (ready) {
      syncMarkerPositions();
    }
  });

  onBeforeUnmount(() => {
    disposed = true;
    destroyMap();
  });

  return {
    mapLoading,
    mapReady,
    alarmMarkerPos,
    userMarkerPos,
    initMap,
    destroyMap,
    invalidateMapSize,
    syncMarkerPositions,
    applyUserLocation,
    zoomIn,
    zoomOut,
    resetView,
    focusPlanView,
  };
}

export function createMapId(): string {
  mapSeq += 1;
  return `evacuation-h5-map-${mapSeq}`;
}
