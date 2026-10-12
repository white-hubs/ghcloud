import { Graph, Shape, Selection, History, Clipboard, Keyboard, Snapline, Transform, Export } from "@antv/x6";
import { register } from "@antv/x6-vue-shape";
import { nextTick, onMounted, onUnmounted, shallowRef, type Ref } from "vue";

import { ScadaNodeWrapper } from "./scada-node-wrapper";

register({
  shape: "scada-node",
  component: ScadaNodeWrapper,
  width: 100,
  height: 100,
  attrs: {
    body: {
      magnet: false,
    },
  },
  ports: {
    groups: {
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
    },
    items: [
      { id: "top", group: "side", args: { x: "50%", y: 0 } },
      { id: "right", group: "side", args: { x: "100%", y: "50%" } },
      { id: "bottom", group: "side", args: { x: "50%", y: "100%" } },
      { id: "left", group: "side", args: { x: 0, y: "50%" } },
    ],
  },
});

export function useEditorGraph(containerRef: Ref<HTMLElement | undefined>) {
  const graph = shallowRef<Graph>();
  let resizeObserver: ResizeObserver | null = null;

  onMounted(() => {
    if (!containerRef.value) return;

    graph.value = new Graph({
      container: containerRef.value,
      autoResize: true,
      /**
       * 与 cube-graph-editor-basic 一致：Shift+左键 或 右键拖动画布。
       * 无 Scroller 时须显式启用 mouseWheel：双指滑动 / 滚轮（不按 Ctrl）平移画布，否则「超出可视区」只能靠拖移。
       * 不使用 Scroller：fitToContent + vue-shape 易白屏。
       */
      panning: {
        enabled: true,
        eventTypes: ["leftMouseDown", "rightMouseDown", "mouseWheel", "mouseWheelDown"],
        modifiers: ["shift", "rightMouseDown"],
      },
      background: { color: "#f0f2f5" },
      grid: {
        visible: true,
        size: 10,
        type: "dot",
        args: { color: "#d9d9d9", thickness: 1 },
      },
      mousewheel: {
        enabled: true,
        modifiers: ["ctrl", "meta"],
        minScale: 0.1,
        maxScale: 4,
      },
      connecting: {
        allowBlank: false,
        allowNode: false,
        allowEdge: false,
        allowPort: true,
        allowLoop: false,
        allowMulti: true,
        snap: { radius: 24 },
        highlight: true,
        router: { name: "manhattan", args: { padding: 8, step: 16 } },
        connector: { name: "normal" },
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: "#5F95FF",
                strokeWidth: 2,
                targetMarker: { name: "classic", size: 8 },
              },
            },
            connector: { name: "normal" },
            router: { name: "manhattan", args: { padding: 8, step: 16 } },
          });
        },
        validateConnection({ sourceCell, targetCell }) {
          if (!sourceCell?.isNode() || !targetCell?.isNode()) return false;
          if (sourceCell.id === targetCell.id) return false;
          return true;
        },
      },
    });

    const g = graph.value;
    g.use(
      new Selection({
        enabled: true,
        multiple: true,
        rubberband: true,
        rubberEdge: true,
        movable: true,
        showNodeSelectionBox: true,
        /** 允许选中连线（默认 false 时边上轻微移动会导致无法选中，Delete 删不掉） */
        selectEdgeOnMoved: true,
        showEdgeSelectionBox: true,
      }),
    );
    g.use(new History({ enabled: true }));
    g.use(new Clipboard({ enabled: true }));
    g.use(new Keyboard({ enabled: true, global: false }));
    g.use(new Snapline({ enabled: true }));
    g.use(new Transform({ resizing: { enabled: true, orthogonal: false }, rotating: true }));
    g.use(new Export());

    g.bindKey(["meta+z", "ctrl+z"], () => {
      g.undo();
      return false;
    });
    g.bindKey(["meta+shift+z", "ctrl+shift+z"], () => {
      g.redo();
      return false;
    });
    g.bindKey(["meta+c", "ctrl+c"], () => {
      const selected = g.getSelectedCells();
      g.copy(selected);
      return false;
    });
    g.bindKey(["meta+v", "ctrl+v"], () => {
      g.paste();
      return false;
    });
    g.bindKey(["delete", "backspace"], () => {
      const cells = g.getSelectedCells();
      if (cells.length) g.removeCells(cells);
      return false;
    });

    g.on("cell:added", ({ cell }) => {
      if (cell.isEdge()) {
        cell.addTools([
          {
            name: "vertices",
            args: { addable: true, removable: true, stopPropagation: false },
          },
        ]);
      }
    });

    const resizeToContainer = () => {
      const container = containerRef.value;
      if (!graph.value || !container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        graph.value.resize(w, h);
      }
    };

    void nextTick(() => {
      resizeToContainer();
    });

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        resizeToContainer();
      });
      resizeObserver.observe(containerRef.value);
    }
  });

  onUnmounted(() => {
    resizeObserver?.disconnect();
    resizeObserver = null;
    graph.value?.dispose();
  });

  return { graph };
}
