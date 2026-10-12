import { defineComponent, onBeforeUnmount, onMounted, ref, watch, type PropType } from "vue";

import { CubeMapLeaflet } from "@ghcloud/cube-map-plugins";
import { CubeTerminalEnum } from "@ghcloud/cube-protocol";
import { message } from "@ghcloud/cube-ui";

import type { RoutePointItem } from "./device-inspection-data";
import { authStore } from "@/api/auth-store";
import { getInspectionMapConfig } from "@/api/dashboard-service";

interface MapAuth {
  tenant: string;
  token: string;
  terminal: string;
}

const droneMapId = "drone-inspection-map-canvas";
const defaultCenter = { lng: 104.05713, lat: 30.587918 };

const createPointIcon = (status: RoutePointItem["status"], active: boolean, index: number): string => {
  const color = status === "abnormal" ? "#ff7878" : status === "pending" ? "#9aa8bd" : "#39d6a4";
  const strokeColor = active ? "#f6cc49" : "rgba(255,255,255,.75)";
  const strokeWidth = active ? "2.8" : "1.4";
  const size = active ? 34 : 28;
  const center = size / 2;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${center}" cy="${center}" r="${center - 2}" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
      <text x="${center}" y="${center + 4}" text-anchor="middle" font-size="${active ? 15 : 13}" font-weight="700" fill="#fff" font-family="Arial, sans-serif">${index + 1}</text>
    </svg>
  `)}`;
};

export const DroneMapScene = defineComponent({
  name: "DroneMapScene",
  props: {
    points: {
      type: Array as PropType<RoutePointItem[]>,
      required: false,
      default: () => [],
    },
    activePointIndex: { type: Number, required: false, default: 0 },
    onSelectPoint: { type: Function as PropType<(index: number) => void>, required: false, default: undefined },
  },
  setup(props) {
    const mapPluginRef = ref<CubeMapLeaflet | null>(null);
    const routeLayers = ref<any[]>([]);
    const mapFailed = ref(false);
    const destroyed = ref(false);

    const clearRoute = (): void => {
      const plugin = mapPluginRef.value;
      const map = plugin?.getMapInstance();
      routeLayers.value.forEach((layer) => {
        try {
          map?.removeLayer(layer);
        } catch {}
      });
      routeLayers.value = [];
    };

    const fitRoute = (): void => {
      const plugin = mapPluginRef.value;
      if (!plugin || props.points.length === 0) {
        return;
      }
      const map = plugin.getMapInstance();
      if (props.points.length === 1) {
        plugin.setCenter(props.points[0].lng, props.points[0].lat).catch(() => undefined);
        plugin.setZoom(17).catch(() => undefined);
        return;
      }
      map.fitBounds(
        props.points.map((point) => [point.lat, point.lng] as [number, number]),
        {
          animate: true,
          maxZoom: 17,
          paddingTopLeft: [460, 120],
          paddingBottomRight: [460, 110],
        },
      );
    };

    const renderRoute = async (): Promise<void> => {
      const plugin = mapPluginRef.value;
      if (!plugin || destroyed.value) {
        return;
      }
      clearRoute();
      if (props.points.length === 0) {
        await plugin.setCenter(defaultCenter.lng, defaultCenter.lat).catch(() => undefined);
        return;
      }

      const line = plugin.createPolyline(
        props.points.map((point) => ({ lng: point.lng, lat: point.lat })),
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
      routeLayers.value.push(line);

      for (const [index, point] of props.points.entries()) {
        const active = index === props.activePointIndex;
        const marker = await plugin.addMarker({
          position: { lng: point.lng, lat: point.lat },
          title: point.name,
          icon: createPointIcon(point.status, active, index),
          iconSize: active ? [34, 34] : [28, 28],
        });
        marker.on?.("click", () => props.onSelectPoint?.(index));
        marker.bindPopup(
          `
          <div class="map-detail-popup">
            <div class="popup-title-custom">${point.name}</div>
            <div class="popup-row-custom"><strong>高度：</strong>${point.heightText}</div>
            <div class="popup-row-custom"><strong>时间：</strong>${point.timeText}</div>
            <div class="popup-row-custom"><strong>结果：</strong>${point.result}</div>
          </div>
          `,
          { autoPan: false, closeButton: false, maxWidth: 240, className: "custom-popup" },
        );
        routeLayers.value.push(marker);
      }
      fitRoute();
    };

    onMounted(async () => {
      try {
        const sessionToken = JSON.parse(sessionStorage.getItem("GH-Token") || "{}").access_token || "";
        const sessionTenant = JSON.parse(sessionStorage.getItem("GH-NowEnterprise") || "{}").code || "";
        const token = authStore.token || sessionToken;
        const tenant = authStore.tenant || sessionTenant;
        const terminal = authStore.terminal || CubeTerminalEnum.BUSINESS;
        if (!token || !tenant) {
          throw new Error("地图鉴权失败");
        }
        const plugin = new CubeMapLeaflet({ token, tenant, terminal } as MapAuth);
        const mapConfig = await getInspectionMapConfig().catch(() => null);
        await plugin.renderMap(droneMapId, {
          center: mapConfig?.center ?? defaultCenter,
          zoomControl: false,
          rotateControl: false,
          mapStyle: "amap://styles/darkblue",
        });
        mapPluginRef.value = plugin;
        await plugin.setZoom(mapConfig?.zoom ?? 16);
        await renderRoute();
      } catch {
        mapFailed.value = true;
        message.error("无人机地图加载失败");
      }
    });

    watch(
      () => props.points.map((point) => `${point.id}:${point.lng}:${point.lat}:${point.status}`).join("|"),
      () => {
        renderRoute().catch(() => undefined);
      },
    );

    watch(
      () => props.activePointIndex,
      () => {
        renderRoute().catch(() => undefined);
      },
    );

    onBeforeUnmount(() => {
      destroyed.value = true;
      clearRoute();
      try {
        mapPluginRef.value?.destroy();
      } catch {}
      mapPluginRef.value = null;
    });

    return () => (
      <div class="device-center-stage">
        <div id={droneMapId} class="device-map-canvas" />
        {mapFailed.value ? <div class="device-map-tip">无人机地图暂不可用</div> : null}
      </div>
    );
  },
});
