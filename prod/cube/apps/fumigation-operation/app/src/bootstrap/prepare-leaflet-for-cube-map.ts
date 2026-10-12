export async function ensureLeafletForCubeMap(): Promise<void> {
  const leafletModule = await import("leaflet");
  const L = (leafletModule.default ?? leafletModule) as {
    Point: new (x: number, y: number) => { x: number; y: number };
    extend: (target: object, source: object) => void;
  };
  (window as unknown as { L: unknown }).L = L;
  await import("leaflet-rotate");
  const proto = L.Point.prototype as {
    rotateFrom?: (theta: number, pivot: unknown) => unknown;
    rotate?: (theta: number) => unknown;
  };
  if (typeof proto.rotateFrom === "function") {
    return;
  }
  L.extend(L.Point.prototype, {
    rotate(this: unknown, theta: number) {
      return (this as { rotateFrom: (theta: number, pivot: unknown) => unknown }).rotateFrom(theta, new L.Point(0, 0));
    },
    rotateFrom(this: { x: number; y: number }, theta: number, pivot: { x: number; y: number }) {
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
