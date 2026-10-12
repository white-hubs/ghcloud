import type { Cell, Graph, Node } from "@antv/x6";
import { Layout, LayoutHeader, LayoutSider, LayoutContent, Tabs } from "ant-design-vue";
import { defineComponent, ref, onMounted, onUnmounted, watch, provide } from "vue";

import { useEditorGraph } from "./canvas/use-editor-graph";
import { useElementDrop } from "./canvas/use-element-drop";
import { ControlPanel } from "./panels/control-panel";
import { EditorToolbar } from "./panels/editor-toolbar";
import { ElementLibrary } from "./panels/element-library/element-library";
import { ObservePanel } from "./panels/observe-panel";
import { PageSettingsDrawer } from "./panels/page-settings-drawer";
import { useEditorStore } from "./store/use-editor-store";

const SIDEBAR_WIDTH = 360;

export const EditorLayout = defineComponent({
  name: "EditorLayout",
  props: {
    showDocumentActions: { type: Boolean, default: true },
  },
  emits: ["save", "export", "import", "preview", "previewPopup", "clear"],
  setup(props, { emit }) {
    const canvasRef = ref<HTMLElement>();
    const store = useEditorStore();
    const pageSettingsVisible = ref(false);
    const { graph } = useEditorGraph(canvasRef);
    const { setupDrop } = useElementDrop(canvasRef, graph);
    const contextMenuVisible = ref(false);
    const contextMenuX = ref(0);
    const contextMenuY = ref(0);
    const contextCellId = ref<string | null>(null);
    const contextCellType = ref<"blank" | "node" | "edge">("blank");

    watch(
      [graph, () => store.pageBackground, () => store.pageBackgroundImage],
      ([currentGraph, color, image]) => {
        currentGraph?.drawBackground({
          color,
          image: image || undefined,
          position: "center",
          size: image ? "cover" : undefined,
          repeat: "no-repeat",
        });
      },
      { immediate: true },
    );

    const hideContextMenu = () => {
      contextMenuVisible.value = false;
    };

    const showContextMenu = (event: MouseEvent, payload?: { cellId?: string; type?: "blank" | "node" | "edge" }) => {
      event.preventDefault();
      event.stopPropagation();
      contextMenuX.value = event.clientX;
      contextMenuY.value = event.clientY;
      contextCellId.value = payload?.cellId ?? null;
      contextCellType.value = payload?.type ?? "blank";
      contextMenuVisible.value = true;
    };

    const runContextAction = (action: "copy" | "paste" | "delete" | "front" | "back" | "fit") => {
      const g = graph.value;
      if (!g) return;

      const selected = g.getSelectedCells();
      const contextCell = contextCellId.value ? g.getCellById(contextCellId.value) : null;

      switch (action) {
        case "copy":
          if (contextCell && contextCellType.value !== "blank") g.copy([contextCell]);
          else if (selected.length) g.copy(selected);
          break;
        case "paste":
          g.paste();
          break;
        case "delete":
          if (contextCell) contextCell.remove();
          else if (selected.length) g.removeCells(selected);
          break;
        case "front":
          if (contextCell?.isNode()) contextCell.toFront();
          break;
        case "back":
          if (contextCell?.isNode()) contextCell.toBack();
          break;
        case "fit":
          g.zoomToFit({ padding: 40 });
          break;
      }
      hideContextMenu();
    };

    let dropReady = false;
    watch(
      graph,
      (g) => {
        if (g) {
          store.setGraph(g);
          g.on("blank:contextmenu", ({ e }: { e: MouseEvent }) => showContextMenu(e, { type: "blank" }));
          g.on("node:contextmenu", ({ e, node }: { e: MouseEvent; node: Node }) => showContextMenu(e, { cellId: node.id, type: "node" }));
          g.on("edge:contextmenu", ({ e, edge }: { e: MouseEvent; edge: Cell }) => showContextMenu(e, { cellId: edge.id, type: "edge" }));
          if (!dropReady) {
            setupDrop();
            dropReady = true;
          }
        }
      },
      { immediate: true },
    );

    onMounted(() => {
      if (graph.value && !dropReady) {
        store.setGraph(graph.value);
        setupDrop();
        dropReady = true;
      }
    });

    onMounted(() => {
      window.addEventListener("click", hideContextMenu);
      window.addEventListener("resize", hideContextMenu);
      window.addEventListener("scroll", hideContextMenu, true);
    });

    onUnmounted(() => {
      window.removeEventListener("click", hideContextMenu);
      window.removeEventListener("resize", hideContextMenu);
      window.removeEventListener("scroll", hideContextMenu, true);
    });

    return () =>
      (() => {
        const canCopy = contextCellType.value === "node";
        const canPaste = contextCellType.value !== "edge";
        const canDelete = contextCellType.value !== "blank";
        const canLayer = contextCellType.value === "node";
        const canFit = contextCellType.value === "blank";
        return (
          <Layout
            style={{
              height: "100%",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <LayoutHeader
              style={{
                background: "#fff",
                borderBottom: "1px solid #f0f0f0",
                padding: "0",
                height: "48px",
                lineHeight: "48px",
                flexShrink: 0,
              }}
            >
              <EditorToolbar
                graph={graph.value}
                showDocumentActions={props.showDocumentActions}
                onSave={() => emit("save")}
                onExport={() => emit("export")}
                onImport={() => emit("import")}
                onPreview={() => emit("preview")}
                onPageSettings={() => (pageSettingsVisible.value = true)}
                onClear={() => emit("clear")}
              />
            </LayoutHeader>

            <Layout
              style={{
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              <LayoutSider
                width={SIDEBAR_WIDTH}
                theme="light"
                style={{
                  borderRight: "1px solid #f0f0f0",
                  height: "100%",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <ElementLibrary />
              </LayoutSider>

              <LayoutContent
                style={{
                  position: "relative",
                  overflow: "hidden",
                  flex: 1,
                  minWidth: 0,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  ref={canvasRef}
                  style={{
                    flex: 1,
                    minHeight: 0,
                    width: "100%",
                    position: "relative",
                    backgroundColor: "#f0f2f5",
                  }}
                  onContextmenu={(e) => e.preventDefault()}
                />
              </LayoutContent>

              <LayoutSider
                width={SIDEBAR_WIDTH}
                theme="light"
                style={{ borderLeft: "1px solid #f0f0f0", overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                <Tabs
                  type="card"
                  size="small"
                  tabBarGutter={4}
                  class="scada-right-panel"
                  style={{ height: "100%", padding: "0 6px", flex: "1 1 0", minHeight: 0 }}
                >
                  <Tabs.TabPane key="observe" tab="属性">
                    <ObservePanel />
                  </Tabs.TabPane>
                  <Tabs.TabPane key="control" tab="控制">
                    <ControlPanel onPreviewPopup={(action) => emit("previewPopup", action)} />
                  </Tabs.TabPane>
                </Tabs>
              </LayoutSider>
            </Layout>
            <PageSettingsDrawer open={pageSettingsVisible.value} onClose={() => (pageSettingsVisible.value = false)} />
            {contextMenuVisible.value && (
              <div
                style={{
                  position: "fixed",
                  left: `${contextMenuX.value}px`,
                  top: `${contextMenuY.value}px`,
                  minWidth: "160px",
                  background: "#fff",
                  border: "1px solid #d9d9d9",
                  borderRadius: "8px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                  padding: "6px 0",
                  zIndex: "2000",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {canCopy && <ContextMenuItem label="复制" onClick={() => runContextAction("copy")} />}
                {canPaste && <ContextMenuItem label="粘贴" onClick={() => runContextAction("paste")} />}
                {(canCopy || canPaste) && (canDelete || canLayer || canFit) && <ContextMenuDivider />}
                {canDelete && <ContextMenuItem label="删除" onClick={() => runContextAction("delete")} danger />}
                {canDelete && (canLayer || canFit) && <ContextMenuDivider />}
                {canLayer && <ContextMenuItem label="置于顶层" onClick={() => runContextAction("front")} />}
                {canLayer && <ContextMenuItem label="置于底层" onClick={() => runContextAction("back")} />}
                {canLayer && canFit && <ContextMenuDivider />}
                {canFit && <ContextMenuItem label="适应画布" onClick={() => runContextAction("fit")} />}
              </div>
            )}
          </Layout>
        );
      })();
  },
});

const ContextMenuItem = defineComponent({
  name: "ContextMenuItem",
  props: {
    label: { type: String, required: true },
    danger: { type: Boolean, default: false },
    onClick: { type: Function, required: true },
  },
  setup(props) {
    return () => (
      <div
        style={{
          padding: "8px 12px",
          cursor: "pointer",
          color: props.danger ? "#ff4d4f" : "#1f1f1f",
          userSelect: "none",
          fontSize: "13px",
        }}
        onClick={() => (props.onClick as () => void)()}
      >
        {props.label}
      </div>
    );
  },
});

const ContextMenuDivider = defineComponent({
  name: "ContextMenuDivider",
  setup() {
    return () => (
      <div
        style={{
          height: "1px",
          background: "#f0f0f0",
          margin: "4px 0",
        }}
      />
    );
  },
});
