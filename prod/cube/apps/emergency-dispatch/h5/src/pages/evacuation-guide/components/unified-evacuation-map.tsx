import { Loading } from "vant";
import { computed, defineComponent, onMounted, onUnmounted, ref, toRef, type PropType } from "vue";

import { createMapId, useH5EvacuationLeafletMap } from "../composables/use-h5-evacuation-leaflet-map";
import { ALARM_MARKER_STYLE, markerStyleAt, USER_MARKER_STYLE } from "./map-marker-styles";
import type { EvacuationRoute, FloorPlanImage, PlanTransform, RoutePoint } from "@/utils/types";

import "leaflet/dist/leaflet.css";
import "./leaflet-markers.less";

import styles from "./unified-evacuation-map.module.less";

export type EvacuationMapExpose = {
  applyUserLocation: (point: RoutePoint) => void;
  refreshMarkers: () => void;
  focusPlanView: () => void;
};

export const UnifiedEvacuationMap = defineComponent({
  name: "UnifiedEvacuationMap",
  props: {
    planImageUrl: { type: String, default: "" },
    floorPlan: {
      type: Object as PropType<FloorPlanImage | null>,
      default: null,
    },
    planImageFile: {
      type: Object as PropType<{ id: string; path: string; endpointPath: string } | null>,
      default: null,
    },
    planTransform: { type: Object as PropType<PlanTransform>, required: true },
    routes: { type: Array as PropType<EvacuationRoute[]>, default: () => [] },
    firePoint: { type: Object as PropType<RoutePoint | null>, default: null },
    userPoint: { type: Object as PropType<RoutePoint | null>, default: null },
    areaLoading: { type: Boolean, default: false },
    onMapReady: { type: Function as PropType<() => void>, default: undefined },
  },
  setup(props, { expose }) {
    const mapId = createMapId();
    const planImageUrlRef = computed(() => props.planImageUrl);
    const floorPlanRef = computed(() => props.floorPlan);
    const planImageFileRef = computed(() => props.planImageFile);
    const planTransformRef = computed(() => props.planTransform);
    const routesRef = computed(() => props.routes);
    const firePointRef = toRef(props, "firePoint");
    const userPointRef = toRef(props, "userPoint");
    const shellRef = ref<HTMLDivElement | null>(null);

    const {
      mapLoading,
      alarmMarkerPos,
      userMarkerPos,
      initMap,
      invalidateMapSize,
      syncMarkerPositions,
      applyUserLocation,
      zoomIn,
      zoomOut,
      resetView,
      focusPlanView,
    } = useH5EvacuationLeafletMap({
      mapId,
      planImageUrl: planImageUrlRef,
      floorPlan: floorPlanRef,
      planImageFile: planImageFileRef,
      planTransform: planTransformRef,
      routes: routesRef,
      firePoint: firePointRef,
      userPoint: userPointRef,
      onMapReady: props.onMapReady,
    });

    const alarmMarkerStyle = computed(() => {
      if (!alarmMarkerPos.value) {
        return null;
      }
      return markerStyleAt(alarmMarkerPos.value.left, alarmMarkerPos.value.top, ALARM_MARKER_STYLE);
    });

    const userMarkerStyle = computed(() => {
      if (!userMarkerPos.value) {
        return null;
      }
      return markerStyleAt(userMarkerPos.value.left, userMarkerPos.value.top, USER_MARKER_STYLE);
    });

    const showLoadingOverlay = computed(() => mapLoading.value || props.areaLoading);

    expose({
      applyUserLocation,
      refreshMarkers: syncMarkerPositions,
      focusPlanView,
    } satisfies EvacuationMapExpose);

    let resizeObserver: ResizeObserver | null = null;

    onMounted(() => {
      setTimeout(() => {
        void initMap();
      }, 80);
      if (shellRef.value) {
        resizeObserver = new ResizeObserver(() => {
          invalidateMapSize();
        });
        resizeObserver.observe(shellRef.value);
      }
    });

    onUnmounted(() => {
      resizeObserver?.disconnect();
    });

    return (): JSX.Element => (
      <div class={styles.unifiedMap} ref={shellRef}>
        <div id={mapId} class={styles.leafletMap} />
        <div class={styles.mapControls}>
          <button type="button" class={styles.mapCtrlBtn} title="放大地图" onClick={() => zoomIn()}>
            ＋
          </button>
          <button type="button" class={styles.mapCtrlBtn} title="缩小地图" onClick={() => zoomOut()}>
            －
          </button>
          <button type="button" class={styles.mapCtrlBtn} title="复位地图" onClick={() => resetView()}>
            ⌂
          </button>
        </div>
        <div class={styles.markerOverlay}>
          {alarmMarkerStyle.value ? (
            <div class="evacuation-dom-marker evacuation-dom-marker--alarm" style={alarmMarkerStyle.value} />
          ) : null}
          {userMarkerStyle.value ? <div class="evacuation-dom-marker evacuation-dom-marker--user" style={userMarkerStyle.value} /> : null}
        </div>
        {showLoadingOverlay.value ? (
          <div class={styles.mapLoading}>
            <Loading size="24px" vertical>
              {props.areaLoading ? "切换区域中..." : "地图加载中..."}
            </Loading>
          </div>
        ) : null}
        {!props.planImageUrl && !showLoadingOverlay.value ? <div class={styles.noPlanHint}>暂无平面图</div> : null}
      </div>
    );
  },
});
