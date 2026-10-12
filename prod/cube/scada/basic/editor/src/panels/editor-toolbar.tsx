import {
  UndoOutlined,
  RedoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  CompressOutlined,
  SaveOutlined,
  ExportOutlined,
  EyeOutlined,
  ImportOutlined,
  ClearOutlined,
  SettingOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignBottomOutlined,
} from "@ant-design/icons-vue";
import type { Graph, Node } from "@antv/x6";
import { Button, Space, Tooltip, Divider } from "ant-design-vue";
import { defineComponent, computed, type PropType } from "vue";

import { useEditorStore } from "../store/use-editor-store";

export const EditorToolbar = defineComponent({
  name: "EditorToolbar",
  props: {
    graph: { type: Object as PropType<Graph>, default: undefined },
    showDocumentActions: { type: Boolean, default: true },
  },
  emits: ["save", "export", "import", "preview", "pageSettings", "clear"],
  setup(props, { emit }) {
    const store = useEditorStore();

    const selectedNodes = computed<Node[]>(() => {
      const _ = store.dataRevision;
      const g = store.graph;
      if (!g) return [];
      return g.getSelectedCells().filter((c) => c.isNode()) as Node[];
    });

    const canAlign = computed(() => selectedNodes.value.length >= 2);

    function alignNodes(type: "left" | "center" | "right" | "top" | "middle" | "bottom") {
      const g = store.graph;
      const nodes = selectedNodes.value;
      if (!g || nodes.length < 2) return;

      g.startBatch("align");
      const positions = nodes.map((n) => ({ n, pos: n.getPosition(), size: n.getSize() }));

      if (type === "left") {
        const minX = Math.min(...positions.map((p) => p.pos.x));
        positions.forEach(({ n, pos }) => n.setPosition(minX, pos.y));
      } else if (type === "right") {
        const maxRight = Math.max(...positions.map((p) => p.pos.x + p.size.width));
        positions.forEach(({ n, pos, size }) => n.setPosition(maxRight - size.width, pos.y));
      } else if (type === "center") {
        const minX = Math.min(...positions.map((p) => p.pos.x));
        const maxRight = Math.max(...positions.map((p) => p.pos.x + p.size.width));
        const centerX = (minX + maxRight) / 2;
        positions.forEach(({ n, pos, size }) => n.setPosition(centerX - size.width / 2, pos.y));
      } else if (type === "top") {
        const minY = Math.min(...positions.map((p) => p.pos.y));
        positions.forEach(({ n, pos }) => n.setPosition(pos.x, minY));
      } else if (type === "bottom") {
        const maxBottom = Math.max(...positions.map((p) => p.pos.y + p.size.height));
        positions.forEach(({ n, pos, size }) => n.setPosition(pos.x, maxBottom - size.height));
      } else if (type === "middle") {
        const minY = Math.min(...positions.map((p) => p.pos.y));
        const maxBottom = Math.max(...positions.map((p) => p.pos.y + p.size.height));
        const midY = (minY + maxBottom) / 2;
        positions.forEach(({ n, pos, size }) => n.setPosition(pos.x, midY - size.height / 2));
      }
      g.stopBatch("align");
    }

    function distributeNodes(direction: "horizontal" | "vertical") {
      const g = store.graph;
      const nodes = selectedNodes.value;
      if (!g || nodes.length < 3) return;

      g.startBatch("distribute");
      if (direction === "horizontal") {
        const sorted = [...nodes].sort((a, b) => a.getPosition().x - b.getPosition().x);
        const first = sorted[0].getPosition().x;
        const last = sorted[sorted.length - 1].getPosition().x + sorted[sorted.length - 1].getSize().width;
        const totalWidth = sorted.reduce((s, n) => s + n.getSize().width, 0);
        const gap = (last - first - totalWidth) / (sorted.length - 1);
        let curX = first + sorted[0].getSize().width + gap;
        for (let i = 1; i < sorted.length - 1; i++) {
          sorted[i].setPosition(curX, sorted[i].getPosition().y);
          curX += sorted[i].getSize().width + gap;
        }
      } else {
        const sorted = [...nodes].sort((a, b) => a.getPosition().y - b.getPosition().y);
        const first = sorted[0].getPosition().y;
        const last = sorted[sorted.length - 1].getPosition().y + sorted[sorted.length - 1].getSize().height;
        const totalHeight = sorted.reduce((s, n) => s + n.getSize().height, 0);
        const gap = (last - first - totalHeight) / (sorted.length - 1);
        let curY = first + sorted[0].getSize().height + gap;
        for (let i = 1; i < sorted.length - 1; i++) {
          sorted[i].setPosition(sorted[i].getPosition().x, curY);
          curY += sorted[i].getSize().height + gap;
        }
      }
      g.stopBatch("distribute");
    }

    return () => (
      <div style="width: 100%; padding: 0 16px; display: flex; align-items: center; height: 100%; gap: 4px">
        <span style="font-weight: 600; font-size: 14px; margin-right: 16px">立方组态</span>

        {props.showDocumentActions ? (
          <>
            <Tooltip title="保存 (Ctrl+S)">
              <Button type="text" size="small" onClick={() => emit("save")}>
                <SaveOutlined />
              </Button>
            </Tooltip>

            <Tooltip title="导出 JSON">
              <Button type="text" size="small" onClick={() => emit("export")}>
                <ExportOutlined />
              </Button>
            </Tooltip>

            <Tooltip title="导入 JSON">
              <Button type="text" size="small" onClick={() => emit("import")}>
                <ImportOutlined />
              </Button>
            </Tooltip>

            <Tooltip title="预览">
              <Button type="text" size="small" onClick={() => emit("preview")}>
                <EyeOutlined />
              </Button>
            </Tooltip>
          </>
        ) : null}

        <Tooltip title="页面设置">
          <Button type="text" size="small" onClick={() => emit("pageSettings")}>
            <SettingOutlined />
          </Button>
        </Tooltip>

        {canAlign.value && (
          <>
            <Divider type="vertical" />
            <Tooltip title="左对齐">
              <Button type="text" size="small" onClick={() => alignNodes("left")}>
                <AlignLeftOutlined />
              </Button>
            </Tooltip>
            <Tooltip title="水平居中">
              <Button type="text" size="small" onClick={() => alignNodes("center")}>
                <AlignCenterOutlined />
              </Button>
            </Tooltip>
            <Tooltip title="右对齐">
              <Button type="text" size="small" onClick={() => alignNodes("right")}>
                <AlignRightOutlined />
              </Button>
            </Tooltip>
            <Tooltip title="顶对齐">
              <Button type="text" size="small" onClick={() => alignNodes("top")}>
                <VerticalAlignTopOutlined />
              </Button>
            </Tooltip>
            <Tooltip title="垂直居中">
              <Button type="text" size="small" onClick={() => alignNodes("middle")}>
                <VerticalAlignMiddleOutlined />
              </Button>
            </Tooltip>
            <Tooltip title="底对齐">
              <Button type="text" size="small" onClick={() => alignNodes("bottom")}>
                <VerticalAlignBottomOutlined />
              </Button>
            </Tooltip>
            {selectedNodes.value.length >= 3 && (
              <>
                <Divider type="vertical" />
                <Tooltip title="水平等间距">
                  <Button type="text" size="small" onClick={() => distributeNodes("horizontal")}>
                    <Space size={1} style="fontSize: 12px; color: #666">
                      ⇔
                    </Space>
                  </Button>
                </Tooltip>
                <Tooltip title="垂直等间距">
                  <Button type="text" size="small" onClick={() => distributeNodes("vertical")}>
                    <Space size={1} style="fontSize: 12px; color: #666">
                      ⇕
                    </Space>
                  </Button>
                </Tooltip>
              </>
            )}
          </>
        )}

        <Divider type="vertical" />

        <Tooltip title="撤销 (Ctrl+Z)">
          <Button type="text" size="small" onClick={() => store.undo()}>
            <UndoOutlined />
          </Button>
        </Tooltip>

        <Tooltip title="重做 (Ctrl+Shift+Z)">
          <Button type="text" size="small" onClick={() => store.redo()}>
            <RedoOutlined />
          </Button>
        </Tooltip>

        <Divider type="vertical" />

        <Tooltip title="放大">
          <Button type="text" size="small" onClick={() => store.zoomIn()}>
            <ZoomInOutlined />
          </Button>
        </Tooltip>

        <Tooltip title="缩小">
          <Button type="text" size="small" onClick={() => store.zoomOut()}>
            <ZoomOutOutlined />
          </Button>
        </Tooltip>

        <Tooltip title="适应画布">
          <Button type="text" size="small" onClick={() => store.zoomToFit()}>
            <CompressOutlined />
          </Button>
        </Tooltip>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
            maxWidth: "min(520px, 46vw)",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "#8c8c8c",
              lineHeight: 1.4,
              textAlign: "right",
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
          >
            平移画布：双指滑动或滚轮（勿按 Ctrl）；或 Shift+ 左键 / 右键拖动。缩放：Ctrl/⌘+滚轮。
          </span>
          <Divider type="vertical" />
          <Tooltip title="清空画板">
            <Button type="text" size="small" danger onClick={() => emit("clear")}>
              <ClearOutlined />
            </Button>
          </Tooltip>
        </div>
      </div>
    );
  },
});
