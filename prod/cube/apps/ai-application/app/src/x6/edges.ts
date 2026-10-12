import { Graph } from "@antv/x6";

/** 供代码 addEdge / setTerminal 后回填：避免默认样式未合并导致箭头 targetMarker 丢失 */
export const FLOW_EDGE_ATTRS = {
  line: {
    stroke: "#1578ff",
    strokeWidth: 2,
    targetMarker: {
      name: "classic" as const,
      size: 7,
      fill: "#1578ff",
      stroke: "#1578ff",
    },
  },
};

export function registerFlowEdges(): void {
  Graph.registerEdge(
    "flow-edge",
    {
      inherit: "edge",
      connector: { name: "smooth" },
      router: { name: "normal" },
      zIndex: 0,
      attrs: FLOW_EDGE_ATTRS,
    },
    true,
  );
}
