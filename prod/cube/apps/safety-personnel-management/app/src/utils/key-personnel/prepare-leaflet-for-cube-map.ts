import type { Point } from "leaflet";

type LeafletNS = typeof import("leaflet");

/** leaflet-rotate 扩展 Point.rotateFrom；跨微应用切换后 ESM 缓存可能导致扩展未挂到当前 bundle 的 L 上 */
function patchPointRotate(L: LeafletNS): void {
  const proto = L.Point.prototype as Point & {
    rotateFrom?: (theta: number, pivot: Point) => Point;
    rotate?: (theta: number) => Point;
  };
  if (typeof proto.rotateFrom === "function") {
    return;
  }
  L.extend(L.Point.prototype, {
    rotate(this: Point, theta: number) {
      return this.rotateFrom!(theta, new L.Point(0, 0));
    },
    rotateFrom(this: Point, theta: number, pivot: Point) {
      if (!theta) {
        return this;
      }
      const sin = Math.sin(theta);
      const cos = Math.cos(theta);
      const x = this.x - pivot.x;
      const y = this.y - pivot.y;
      return new L.Point(x * cos - y * sin + pivot.x, x * sin + y * cos + pivot.y);
    },
  });
}

/**
 * 对齐 cube-map-plugins 所需的 global L 与 leaflet-rotate 扩展。
 * 从 genericEquipmentMonitor 等其它微应用切回时，window.L 可能是另一份 Leaflet 实例，需在本应用 renderMap 前重置。
 */
export async function ensureLeafletForCubeMap(): Promise<void> {
  const leafletModule = await import("leaflet");
  const L = (leafletModule.default ?? leafletModule) as LeafletNS;
  (window as unknown as { L: LeafletNS }).L = L;
  await import("leaflet-rotate");
  patchPointRotate(L);
}
