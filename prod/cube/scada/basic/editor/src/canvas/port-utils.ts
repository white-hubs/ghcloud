import type { PortConfig, PortDef } from "@cube-scada/core";

/** X6 port group definition shared by drop and serializer */
export const PORT_GROUP_DEF = {
  side: {
    position: { name: "absolute" },
    markup: [{ tagName: "circle", selector: "portBody" }],
    attrs: {
      portBody: {
        r: 5,
        magnet: true,
        stroke: "#5F95FF",
        fill: "#fff",
        strokeWidth: 1,
      },
    },
  },
};

/**
 * Evenly distribute N ports along an axis.
 * Returns the N midpoints of N+1 equal segments (never at 0 or 1).
 * E.g. N=3 → [0.25, 0.5, 0.75]
 */
function distribute(n: number): number[] {
  const result: number[] = [];
  for (let i = 1; i <= n; i++) {
    result.push(i / (n + 1));
  }
  return result;
}

function pct(v: number): string {
  return `${+(v * 100).toFixed(4)}%`;
}

/** Convert a PortConfig into a flat PortDef array */
export function computePortsFromConfig(config: PortConfig): PortDef[] {
  const ports: PortDef[] = [];

  distribute(config.top).forEach((x, i) => {
    ports.push({ id: `top-${i + 1}`, x: pct(x), y: "0%" });
  });

  distribute(config.right).forEach((y, i) => {
    ports.push({ id: `right-${i + 1}`, x: "100%", y: pct(y) });
  });

  distribute(config.bottom).forEach((x, i) => {
    ports.push({ id: `bottom-${i + 1}`, x: pct(x), y: "100%" });
  });

  distribute(config.left).forEach((y, i) => {
    ports.push({ id: `left-${i + 1}`, x: "0%", y: pct(y) });
  });

  return ports;
}

/** Build the X6 ports config object from a PortDef array */
export function buildX6Ports(portDefs: PortDef[]) {
  return {
    groups: PORT_GROUP_DEF,
    items: portDefs.map((p) => ({ id: p.id, group: "side", args: { x: p.x, y: p.y } })),
  };
}

/** Default port config when an element has no SVG-defined ports */
export const DEFAULT_PORT_CONFIG: PortConfig = { top: 1, right: 1, bottom: 1, left: 1 };
