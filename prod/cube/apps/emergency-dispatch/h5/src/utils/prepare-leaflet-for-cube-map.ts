import type { Point } from "leaflet";
import L from "leaflet";

function patchPointRotate(leaflet: typeof L): void {
  const proto = leaflet.Point.prototype as Point & {
    rotateFrom?: (theta: number, pivot: Point) => Point;
    rotate?: (theta: number) => Point;
  };
  if (typeof proto.rotateFrom === "function") {
    return;
  }
  leaflet.extend(leaflet.Point.prototype, {
    rotate(this: Point, theta: number) {
      return this.rotateFrom!(theta, new leaflet.Point(0, 0));
    },
    rotateFrom(this: Point, theta: number, pivot: Point) {
      if (!theta) return this;
      const sin = Math.sin(theta);
      const cos = Math.cos(theta);
      const x = this.x - pivot.x;
      const y = this.y - pivot.y;
      return new leaflet.Point(x * cos - y * sin + pivot.x, x * sin + y * cos + pivot.y);
    },
  });
}

export async function ensureLeafletForCubeMap(): Promise<void> {
  (window as unknown as { L: typeof L }).L = L;
  await import("leaflet-rotate");
  patchPointRotate(L);
}
