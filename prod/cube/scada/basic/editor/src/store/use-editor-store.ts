import type { Graph, Node, Edge } from "@antv/x6";
import type {
  Binding,
  DeviceBindingMode,
  ElementInstance,
  ElementPropertyBinding,
  EventHandler,
  PortConfig,
  ProductBinding,
  SceneScopeKind,
  TagDefinition,
} from "@cube-scada/core";
import { inferSceneScopeFromElements, registry } from "@cube-scada/core";
import { defineStore } from "pinia";
import { ref, computed, shallowRef } from "vue";

import { computePortsFromConfig, PORT_GROUP_DEF } from "../canvas/port-utils";

export const useEditorStore = defineStore("scada-editor", () => {
  const graph = shallowRef<Graph>();
  const selectedNodeId = ref<string | null>(null);
  const selectedEdgeId = ref<string | null>(null);
  const dataRevision = ref(0);
  const pageId = ref("page-default");
  const pageName = ref("未命名画面");
  const pageWidth = ref(1920);
  const pageHeight = ref(1080);
  const pageBackground = ref("#f0f2f5");
  const pageBackgroundImage = ref<string | undefined>();
  const globalState = ref<Record<string, string>>({});
  const pageTags = ref<TagDefinition[]>([]);
  const pageProduct = ref<ProductBinding | undefined>();
  const pageSceneScope = computed<SceneScopeKind>(() => {
    const _ = dataRevision.value;
    const elements =
      graph.value?.getNodes().map((node) => ({
        deviceBinding: node.getData()?.deviceBinding,
      })) ?? [];
    return inferSceneScopeFromElements(elements);
  });

  const selectedNode = computed<Node | undefined>(() => {
    if (!graph.value || !selectedNodeId.value) return undefined;
    return graph.value.getCellById(selectedNodeId.value) as Node | undefined;
  });

  const selectedEdge = computed<Edge | undefined>(() => {
    if (!graph.value || !selectedEdgeId.value) return undefined;
    const cell = graph.value.getCellById(selectedEdgeId.value);
    return cell?.isEdge() ? (cell as Edge) : undefined;
  });

  const selectedEdgeStyle = computed(() => {
    const _ = dataRevision.value;
    const edge = selectedEdge.value;
    if (!edge) return null;
    const attrs = edge.getAttrs() as any;
    return {
      stroke: (attrs?.line?.stroke as string) ?? "#5F95FF",
      strokeWidth: (attrs?.line?.strokeWidth as number) ?? 2,
    };
  });

  const selectedInstance = computed<ElementInstance | undefined>(() => {
    const _ = dataRevision.value;
    const node = selectedNode.value;
    if (!node) return undefined;
    const data = node.getData() ?? {};
    const pos = node.getPosition();
    const size = node.getSize();
    const elementType = typeof data.elementType === "string" ? data.elementType : "";
    const def = elementType ? registry.get(elementType) : undefined;
    const inst: ElementInstance = {
      id: node.id,
      type: elementType,
      x: pos.x,
      y: pos.y,
      width: size.width,
      height: size.height,
      rotation: (((node.getAngle?.() ?? 0) % 360) + 360) % 360,
      opacity: typeof data.opacity === "number" && Number.isFinite(data.opacity) ? Math.min(1, Math.max(0, data.opacity)) : 1,
      zIndex: node.getZIndex() ?? 0,
      locked: false,
      visible: data.visible !== false,
      props: { ...(data.elementProps ?? {}) },
      bindings: [...(data.bindings ?? [])],
      eventHandlers: [...(data.eventHandlers ?? [])],
    };
    if (data.label) inst.label = String(data.label);
    if (data.deviceId) inst.deviceId = String(data.deviceId);
    if (data.deviceBinding === "required" || data.deviceBinding === "off") {
      inst.deviceBinding = data.deviceBinding;
    }
    if (typeof data.propertyBindName === "string") {
      inst.propertyBindName = data.propertyBindName;
    }
    if (def?.inlinePropertyPanel) {
      inst.propertyBindings = Array.isArray(data.propertyBindings) ? ([...data.propertyBindings] as ElementPropertyBinding[]) : [];
    } else if (Array.isArray(data.propertyBindings) && data.propertyBindings.length > 0) {
      inst.propertyBindings = [...data.propertyBindings] as ElementPropertyBinding[];
    }
    return inst;
  });

  const selectedObserveModel = computed(() => {
    const inst = selectedInstance.value;
    if (!inst) return undefined;
    const def = registry.get(inst.type);
    const schemas = def?.propsSchema ?? [];
    const observeSchemas = schemas.filter((schema) => (schema.domain ?? "observe") === "observe");
    const observePropNames = new Set(observeSchemas.map((schema) => schema.name));
    const observeBindings = inst.bindings.filter((binding) => observePropNames.has(binding.propName));
    const orphanBindings = inst.bindings.filter((binding) => !observePropNames.has(binding.propName));
    return {
      schemas: observeSchemas,
      bindings: observeBindings,
      orphanBindings,
    };
  });

  const selectedControlModel = computed(() => {
    const inst = selectedInstance.value;
    if (!inst) return undefined;
    const def = registry.get(inst.type);
    const schemas = def?.propsSchema ?? [];
    const controlSchemas = schemas.filter((schema) => (schema.domain ?? "observe") === "control");
    const controlPropNames = new Set(controlSchemas.map((schema) => schema.name));
    const controlProps = controlSchemas.reduce<Record<string, any>>((acc, schema) => {
      acc[schema.name] = inst.props[schema.name] ?? schema.default;
      return acc;
    }, {});
    return {
      schemas: controlSchemas,
      controlPropNames,
      props: controlProps,
      eventHandlers: inst.eventHandlers,
    };
  });

  const elementOptions = computed(() => {
    const _ = dataRevision.value;
    const g = graph.value;
    if (!g) return [];
    return g.getNodes().map((node) => {
      const data = node.getData() ?? {};
      const elementType = typeof data.elementType === "string" ? data.elementType : "";
      const def = elementType ? registry.get(elementType) : undefined;
      const label = def ? `${def.label} (${node.id})` : node.id;
      return { label, value: node.id };
    });
  });

  function setGraph(g: Graph) {
    if (graph.value === g) return;
    graph.value = g;

    g.on("selection:changed", ({ selected }) => {
      if (selected.length === 1 && selected[0].isNode()) {
        selectedNodeId.value = selected[0].id;
        selectedEdgeId.value = null;
      } else if (selected.length === 1 && selected[0].isEdge()) {
        selectedEdgeId.value = selected[0].id;
        selectedNodeId.value = null;
      } else {
        selectedNodeId.value = null;
        selectedEdgeId.value = null;
      }
      dataRevision.value++;
    });

    g.on("node:click", ({ node }) => {
      if (selectedNodeId.value !== node.id) {
        selectedNodeId.value = node.id;
        selectedEdgeId.value = null;
        dataRevision.value++;
      }
    });

    g.on("edge:click", ({ edge }) => {
      if (selectedEdgeId.value !== edge.id) {
        selectedEdgeId.value = edge.id;
        selectedNodeId.value = null;
        dataRevision.value++;
      }
    });

    g.on("blank:click", () => {
      selectedNodeId.value = null;
      selectedEdgeId.value = null;
      dataRevision.value++;
    });

    g.on("node:change:data", () => {
      dataRevision.value++;
    });

    g.on("node:added", () => {
      dataRevision.value++;
    });

    g.on("node:removed", () => {
      dataRevision.value++;
    });

    g.on("node:moved", () => {
      dataRevision.value++;
    });

    g.on("node:resized", () => {
      dataRevision.value++;
    });

    g.on("node:change:angle", () => {
      dataRevision.value++;
    });
  }

  function updateElementAppearance(nodeId: string, appearance: { width?: number; height?: number; rotation?: number; opacity?: number }) {
    const node = graph.value?.getCellById(nodeId) as Node | undefined;
    if (!node?.isNode()) return;

    const currentSize = node.getSize();
    const width = Number.isFinite(appearance.width) ? Math.max(1, appearance.width!) : currentSize.width;
    const height = Number.isFinite(appearance.height) ? Math.max(1, appearance.height!) : currentSize.height;
    if (width !== currentSize.width || height !== currentSize.height) {
      node.resize(width, height);
    }

    if (Number.isFinite(appearance.rotation)) {
      const rotation = ((appearance.rotation! % 360) + 360) % 360;
      if (rotation !== node.getAngle()) {
        node.rotate(rotation, { absolute: true });
      }
    }

    if (Number.isFinite(appearance.opacity)) {
      const opacity = Math.min(1, Math.max(0, appearance.opacity!));
      const data = node.getData() ?? {};
      if (data.opacity !== opacity) {
        node.setData({ ...data, opacity }, { deep: false });
      }
    }
  }

  function updateNodePorts(nodeId: string, config: PortConfig) {
    const node = graph.value?.getCellById(nodeId) as Node | undefined;
    if (!node?.isNode()) return;
    node.removePorts();
    node.prop("ports/groups", PORT_GROUP_DEF);
    const portDefs = computePortsFromConfig(config);
    if (portDefs.length > 0) {
      node.addPorts(portDefs.map((p) => ({ id: p.id, group: "side", args: { x: p.x, y: p.y } })));
    }
    const data = node.getData() ?? {};
    node.setData({ ...data, portConfig: config }, { deep: false });
    dataRevision.value++;
  }

  function updateEdgeStyle(edgeId: string, stroke: string, strokeWidth: number) {
    const cell = graph.value?.getCellById(edgeId);
    if (!cell?.isEdge()) return;
    const edge = cell as Edge;
    edge.attr("line/stroke", stroke);
    edge.attr("line/strokeWidth", strokeWidth);
    // 箭头大小随线宽等比缩放：默认 strokeWidth=2 → size=8
    edge.attr("line/targetMarker/size", Math.max(6, strokeWidth * 4));
    dataRevision.value++;
  }

  function updateProp(nodeId: string, propName: string, value: any) {
    const node = graph.value?.getCellById(nodeId) as Node | undefined;
    if (!node) return;
    const data = node.getData() ?? {};
    const newProps = { ...data.elementProps, [propName]: value };
    node.setData({ ...data, elementProps: newProps }, { deep: false });
  }

  function updateBindings(nodeId: string, bindings: Binding[]) {
    const node = graph.value?.getCellById(nodeId) as Node | undefined;
    if (!node) return;
    const data = node.getData() ?? {};
    node.setData({ ...data, bindings }, { deep: false });
  }

  function updateEventHandlers(nodeId: string, handlers: EventHandler[]) {
    const node = graph.value?.getCellById(nodeId) as Node | undefined;
    if (!node) return;
    const data = node.getData() ?? {};
    node.setData({ ...data, eventHandlers: handlers }, { deep: false });
  }

  function updateInstanceMeta(
    nodeId: string,
    meta: {
      label?: string;
      deviceId?: string;
      deviceBinding?: DeviceBindingMode;
      propertyBindName?: string;
      propertyBindings?: ElementPropertyBinding[];
      visible?: boolean;
    },
  ) {
    const node = graph.value?.getCellById(nodeId) as Node | undefined;
    if (!node) return;
    const data = node.getData() ?? {};
    node.setData({ ...data, ...meta }, { deep: false });
  }

  function undo() {
    graph.value?.undo();
  }
  function redo() {
    graph.value?.redo();
  }
  function canUndo() {
    return graph.value?.canUndo() ?? false;
  }
  function canRedo() {
    return graph.value?.canRedo() ?? false;
  }
  function zoomIn() {
    const g = graph.value;
    if (!g) return;
    const next = Math.min(3, (g.zoom() || 1) + 0.1);
    g.zoomTo(next);
    g.centerContent();
  }
  function zoomOut() {
    const g = graph.value;
    if (!g) return;
    const next = Math.max(0.2, (g.zoom() || 1) - 0.1);
    g.zoomTo(next);
    g.centerContent();
  }
  function zoomToFit() {
    graph.value?.zoomToFit({ padding: 40 });
  }
  function resetZoom() {
    graph.value?.zoomTo(1);
    graph.value?.centerContent();
  }
  /** Export current canvas as a small PNG DataURL for use as thumbnail. */
  function captureThumbnail(): Promise<string | null> {
    const g = graph.value;
    if (!g) return Promise.resolve(null);
    const root = g.container as HTMLElement | undefined;
    try {
      const running = root?.getAnimations?.({ subtree: true });
      running?.forEach((animation: Animation) => {
        try {
          animation.cancel();
        } catch {
          /* ignore */
        }
      });
    } catch {
      /* getAnimations unsupported */
    }
    const THUMB_TIMEOUT_MS = 8000;
    const thumbPromise = new Promise<string | null>((resolve) => {
      try {
        g.toPNG((dataUri: string) => resolve(dataUri), {
          width: 480,
          height: 270,
          backgroundColor: pageBackground.value,
          padding: 20,
          copyStyles: false,
          quality: 0.8,
        });
      } catch {
        resolve(null);
      }
    });
    const timeoutPromise = new Promise<string | null>((resolve) => {
      setTimeout(() => resolve(null), THUMB_TIMEOUT_MS);
    });
    return Promise.race([thumbPromise, timeoutPromise]);
  }

  function focusElement(nodeId: string) {
    const g = graph.value;
    if (!g) return;
    const node = g.getCellById(nodeId);
    if (!node || !node.isNode()) return;
    selectedNodeId.value = nodeId;
    g.cleanSelection();
    g.select(node);
    const pos = node.getPosition();
    const size = node.getSize();
    g.centerPoint(pos.x + size.width / 2, pos.y + size.height / 2);
    dataRevision.value++;
  }
  function addTag(tag: TagDefinition) {
    if (pageTags.value.find((t) => t.name === tag.name)) return;
    pageTags.value = [...pageTags.value, tag];
  }
  function updateTagByName(name: string, updates: Partial<TagDefinition>) {
    pageTags.value = pageTags.value.map((t) => (t.name === name ? { ...t, ...updates } : t));
  }
  function removeTagByName(name: string) {
    pageTags.value = pageTags.value.filter((t) => t.name !== name);
  }
  function replaceAllTags(tags: TagDefinition[]) {
    pageTags.value = [...tags];
  }

  function updateGlobalState(key: string, value: string) {
    globalState.value = { ...globalState.value, [key]: value };
  }
  function replaceGlobalState(next: Record<string, string>) {
    globalState.value = { ...next };
  }
  function removeGlobalState(key: string) {
    const next = { ...globalState.value };
    delete next[key];
    globalState.value = next;
  }

  return {
    graph,
    selectedNodeId,
    selectedNode,
    selectedEdgeId,
    selectedEdge,
    selectedEdgeStyle,
    selectedInstance,
    selectedObserveModel,
    selectedControlModel,
    dataRevision,
    pageId,
    pageName,
    pageWidth,
    pageHeight,
    pageBackground,
    pageBackgroundImage,
    globalState,
    pageTags,
    pageProduct,
    pageSceneScope,
    elementOptions,
    setGraph,
    updateNodePorts,
    updateEdgeStyle,
    updateElementAppearance,
    updateProp,
    updateBindings,
    updateEventHandlers,
    updateInstanceMeta,
    undo,
    redo,
    canUndo,
    canRedo,
    zoomIn,
    zoomOut,
    zoomToFit,
    resetZoom,
    captureThumbnail,
    focusElement,
    updateGlobalState,
    replaceGlobalState,
    removeGlobalState,
    addTag,
    updateTagByName,
    removeTagByName,
    replaceAllTags,
  };
});
