import { type Cell, type CellView, Dnd, Graph, History, MiniMap, Selection, Snapline, type Edge } from "@antv/x6";

import { FLOW_INPUT_PORT_ID } from "@/types/flow";

/**
 * X6 把 `port` / `port-group` 写在端口容器上，连线磁石多为子元素（如 circle），仅对 magnet 调 getAttribute 会得到 null。
 * 与 CellView#getEdgeTerminal 内部 `findAttr('port', magnet)` 一致：沿祖先查找。
 */
export function resolveMagnetPortMeta(magnet: Element): { portId: string | null; portGroup: string | null } {
  let portId: string | null = null;
  let portGroup: string | null = null;
  let el: Element | null = magnet;
  while (el != null && el.nodeType === 1) {
    if (portId == null) {
      const p = el.getAttribute("port");
      if (p != null && p !== "") {
        portId = p;
      }
    }
    if (portGroup == null) {
      const g = el.getAttribute("port-group");
      if (g != null && g !== "") {
        portGroup = g;
      }
    }
    if (portId != null && portGroup != null) {
      break;
    }
    el = el.parentElement;
  }
  return { portId, portGroup };
}

export interface CreateFlowGraphOptions {
  /** 小地图挂载节点；与参考编排器一致为右下角概览 */
  minimapContainer?: HTMLElement | null;
  /**
   * 从连接桩（magnet）拖出新边时调用，在边加入画布前触发；用于恢复出口桩悬停 UI 等。
   * 与 `connecting.createEdge` 的 X6 约定一致。
   */
  onEdgeCreateFromMagnet?: (args: { sourceCell: Cell; sourceMagnet: Element }) => void;
}

function inputPortAlreadyOccupied(
  graph: Graph,
  targetCell: { id: string } | null | undefined,
  targetPortId: string | null,
  excludeEdge: Edge | null | undefined,
): boolean {
  if (!targetCell || !targetPortId) {
    return false;
  }
  const incomingEdges = graph.getConnectedEdges(targetCell as never, { incoming: true });
  for (const edge of incomingEdges) {
    if (excludeEdge && edge.id === excludeEdge.id) {
      continue;
    }
    if (edge.getTargetPortId() === targetPortId) {
      return true;
    }
  }
  return false;
}

export function createFlowGraph(container: HTMLElement, options: CreateFlowGraphOptions = {}): Graph {
  const graph: Graph = new Graph({
    container,
    /**
     * Flow Editor 在首屏会连续执行 addNode -> 更新 ports/size -> addEdge -> resize/center。
     * X6 默认 async 渲染会把这些更新分发到调度队列里，刷新页面首次灌图时边可能先于 port DOM 稳定，
     * 终端磁铁退回节点容器，表现为端点连线错乱。这里改为同步渲染，消除首屏初始化竞态。
     */
    async: false,
    autoResize: true,
    /* 与 node:magnet:click 配套：小幅移动仍视为点击，便于出口桩唤起快捷添加 */
    clickThreshold: 8,
    /**
     * 仅在指针离开连接桩磁石后开始拖线；在桩上单击不会先创建悬空边，可与 magnet:click 快捷选组件并存。
     */
    magnetThreshold: "onleave",
    scaling: {
      min: 0.3,
      max: 3,
    },
    /* 白底 + #AAB5BF 均匀点阵 */
    background: { color: "#FFFFFF" },
    grid: {
      visible: true,
      type: "dot",
      size: 20,
      args: {
        color: "#AAB5BF",
        thickness: 1,
      },
    },
    /* 勿含 mouseWheel：否则无修饰键的滚轮会被平移接管，无法缩放 */
    panning: {
      enabled: true,
      modifiers: null,
      eventTypes: ["leftMouseDown", "rightMouseDown", "mouseWheelDown"],
    },
    mousewheel: {
      enabled: true,
      modifiers: null,
      factor: 1.1,
      minScale: 0.3,
      maxScale: 3,
      zoomAtMousePosition: true,
    },
    interacting: {
      nodeMovable: true,
      edgeMovable: false,
    },
    connecting: {
      snap: { radius: 20 },
      allowBlank: false,
      allowLoop: false,
      allowNode: false,
      allowEdge: false,
      highlight: true,
      /* 与本仓库 cube-graph-editor 一致：连线落在端口 magnet，而非节点 bbox 边界交点 */
      anchor: "center",
      connectionPoint: { name: "anchor" },
      connector: { name: "smooth" },
      router: { name: "normal" },
      validateConnection: ({ sourceView, targetView, sourceMagnet, targetMagnet, targetCell, targetPort, edge }): boolean => {
        if (!sourceView || !targetView || !sourceMagnet || !targetMagnet) {
          return false;
        }
        if (sourceView === targetView) {
          return false;
        }
        const { portGroup: sourceGroup } = resolveMagnetPortMeta(sourceMagnet);
        const { portGroup: targetGroup, portId: targetPortFromMagnet } = resolveMagnetPortMeta(targetMagnet);
        if (sourceGroup !== "output" || targetGroup !== "input") {
          return false;
        }
        const targetPortId = targetPortFromMagnet ?? targetPort ?? FLOW_INPUT_PORT_ID;
        return !inputPortAlreadyOccupied(graph, targetCell ?? targetView.cell, targetPortId, edge ?? null);
      },
      createEdge(this: Graph, args: { sourceCell: Cell; sourceView: CellView; sourceMagnet: Element }): Edge {
        options.onEdgeCreateFromMagnet?.({
          sourceCell: args.sourceCell,
          sourceMagnet: args.sourceMagnet,
        });
        return this.createEdge({ shape: "flow-edge" });
      },
    },
    highlighting: {
      magnetAdsorbed: {
        name: "stroke",
        args: {
          attrs: {
            fill: "#1578ff",
            stroke: "#ffffff",
            strokeWidth: 2,
          },
        },
      },
    },
  });

  graph.use(new History({ enabled: true }));
  graph.use(
    new Selection({
      enabled: true,
      rubberband: true,
      modifiers: "alt",
      showNodeSelectionBox: false,
    }),
  );
  graph.use(new Snapline({ enabled: true, sharp: true }));

  /* 无 Scroller：避免可滚动内容区过大导致主 SVG 在布局上像整片「空白层」；平移/缩放用 Graph 默认能力 */
  if (options.minimapContainer) {
    const minimap = new MiniMap({
      container: options.minimapContainer,
      width: 248,
      height: 168,
      padding: 10,
      scalable: true,
      minScale: 0.01,
      maxScale: 3,
      graphOptions: {
        background: { color: "#FFFFFF" },
      },
    });
    graph.use(minimap);
    /* 无 Scroller 时 MiniMap 只在 resize 里 updatePaper；主图缩放/平移不触发 resize，需按变换重算 ratio 与视口（见 X6 #2482 等） */
    const mm = minimap as unknown as { updatePaper: (w: number, h: number) => void; updateViewport: () => void };
    const scheduleMinimapSync = (): void => {
      const run = (): void => {
        const { width: ow, height: oh } = graph.options;
        const width = typeof ow === "number" && !Number.isNaN(ow) ? ow : graph.container.clientWidth;
        const height = typeof oh === "number" && !Number.isNaN(oh) ? oh : graph.container.clientHeight;
        mm.updatePaper(width, height);
        mm.updateViewport();
      };
      run();
      requestAnimationFrame(run);
    };
    graph.on("scale", scheduleMinimapSync);
  }

  return graph;
}

export function createFlowDnd(graph: Graph): Dnd {
  return new Dnd({
    target: graph,
    scaled: false,
  });
}
