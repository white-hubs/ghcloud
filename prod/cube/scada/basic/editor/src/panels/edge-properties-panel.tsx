import { InputNumber, Divider } from "ant-design-vue";
import { defineComponent, ref, watch } from "vue";

import { useEditorStore } from "../store/use-editor-store";

const PRESET_COLORS = [
  "#5F95FF",
  "#52c41a",
  "#ff4d4f",
  "#faad14",
  "#13c2c2",
  "#722ed1",
  "#eb2f96",
  "#fa8c16",
  "#ffffff",
  "#d9d9d9",
  "#8c8c8c",
  "#262626",
];

export const EdgePropertiesPanel = defineComponent({
  name: "EdgePropertiesPanel",
  setup() {
    const store = useEditorStore();

    const localStroke = ref("#5F95FF");
    const localWidth = ref(2);

    // 同步 store 中选中连线的样式
    watch(
      () => store.selectedEdgeStyle,
      (style) => {
        if (!style) return;
        localStroke.value = style.stroke;
        localWidth.value = style.strokeWidth;
      },
      { immediate: true },
    );

    function applyColor(color: string) {
      localStroke.value = color;
      if (store.selectedEdgeId) {
        store.updateEdgeStyle(store.selectedEdgeId, color, localWidth.value);
      }
    }

    function applyWidth(val: number | null) {
      const w = val ?? 1;
      localWidth.value = w;
      if (store.selectedEdgeId) {
        store.updateEdgeStyle(store.selectedEdgeId, localStroke.value, w);
      }
    }

    return () => (
      <div style={{ padding: "12px 8px" }}>
        {/* 颜色选择 */}
        <div style={{ marginBottom: "4px", fontSize: "12px", color: "#666" }}>连线颜色</div>

        {/* 预设色板 */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
          {PRESET_COLORS.map((color) => (
            <div
              key={color}
              title={color}
              onClick={() => applyColor(color)}
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "4px",
                background: color,
                cursor: "pointer",
                border: localStroke.value === color ? "2px solid #1677ff" : "1.5px solid #d9d9d9",
                boxSizing: "border-box",
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* 自定义颜色 */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <div style={{ fontSize: "12px", color: "#666", whiteSpace: "nowrap" }}>自定义</div>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "6px" }}>
            <input
              type="color"
              value={localStroke.value}
              onInput={(e: Event) => applyColor((e.target as HTMLInputElement).value)}
              style={{
                width: "32px",
                height: "28px",
                padding: "2px",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                cursor: "pointer",
                background: "none",
              }}
            />
            <span style={{ fontSize: "12px", color: "#555", fontFamily: "monospace" }}>{localStroke.value.toUpperCase()}</span>
          </div>
        </div>

        <Divider style={{ margin: "0 0 12px" }} />

        {/* 线宽 */}
        <div style={{ marginBottom: "4px", fontSize: "12px", color: "#666" }}>线宽</div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <InputNumber
            min={1}
            max={20}
            step={1}
            value={localWidth.value}
            onChange={applyWidth}
            style={{ width: "80px" }}
            size="small"
            addonAfter="px"
          />
          {/* 快捷线宽 */}
          <div style={{ display: "flex", gap: "6px" }}>
            {[1, 2, 3, 4].map((w) => (
              <div
                key={w}
                onClick={() => applyWidth(w)}
                title={`${w}px`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  borderRadius: "4px",
                  border: localWidth.value === w ? "1.5px solid #1677ff" : "1.5px solid #d9d9d9",
                  cursor: "pointer",
                  background: localWidth.value === w ? "#e6f4ff" : "#fafafa",
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: `${w}px`,
                    background: "#555",
                    borderRadius: "1px",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
});
