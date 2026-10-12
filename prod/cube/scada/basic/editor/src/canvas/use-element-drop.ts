import type { Graph } from "@antv/x6";
import { registry, type ElementDef } from "@cube-scada/core";
import type { Ref } from "vue";

import { computePortsFromConfig, buildX6Ports, DEFAULT_PORT_CONFIG } from "./port-utils";

export function useElementDrop(containerRef: Ref<HTMLElement | undefined>, graph: Ref<Graph | undefined>) {
  function setupDrop() {
    const el = containerRef.value;
    if (!el) return;

    // Capture phase: nested SVG / X6 layers may otherwise receive dragover first
    // without preventDefault(), which blocks drop on most of the canvas at init.
    const captureOpts = { capture: true } as const;

    const onDragEnter = (e: DragEvent) => {
      e.preventDefault();
    };

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    };

    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      const g = graph.value;
      if (!g) return;

      const elementType = e.dataTransfer?.getData("application/scada-element-type");
      if (!elementType) return;

      const def = registry.get(elementType);
      if (!def) return;

      const point = g.clientToLocal({ x: e.clientX, y: e.clientY });

      addNodeToGraph(g, def, point.x, point.y);
    };

    el.addEventListener("dragenter", onDragEnter, captureOpts);
    el.addEventListener("dragover", onDragOver, captureOpts);
    el.addEventListener("drop", onDrop, captureOpts);
  }

  return { setupDrop };
}

export function addNodeToGraph(graph: Graph, def: ElementDef, x: number, y: number, instanceId?: string) {
  const id = instanceId ?? `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const defaultProps: Record<string, any> = {};
  for (const schema of def.propsSchema) {
    if (schema.default !== undefined) {
      defaultProps[schema.name] = schema.default;
    }
  }

  const nodeConfig: Parameters<typeof graph.addNode>[0] = {
    id,
    shape: "scada-node",
    x: x - def.defaultSize.width / 2,
    y: y - def.defaultSize.height / 2,
    width: def.defaultSize.width,
    height: def.defaultSize.height,
    data: {
      elementType: def.type,
      elementProps: defaultProps,
      bindings: [],
      eventHandlers: [],
      portConfig: DEFAULT_PORT_CONFIG,
    },
  };
  (nodeConfig as any).ports = buildX6Ports(computePortsFromConfig(DEFAULT_PORT_CONFIG));

  const node = graph.addNode(nodeConfig);

  // X6 3.x animate: subtle drop-in effect for newly created elements.
  node.animate(
    [
      { opacity: 0.25, transform: "scale(0.94)" },
      { opacity: 1, transform: "scale(1)" },
    ],
    { duration: 180 },
  );

  return id;
}
