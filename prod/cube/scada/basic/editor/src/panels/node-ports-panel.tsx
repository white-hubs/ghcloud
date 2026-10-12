import type { PortConfig } from "@cube-scada/core";
import { defineComponent, computed } from "vue";

import { useEditorStore } from "../store/use-editor-store";

const DIRECTIONS: { key: keyof PortConfig; label: string; icon: string }[] = [
  { key: "top", label: "上方", icon: "↑" },
  { key: "right", label: "右侧", icon: "→" },
  { key: "bottom", label: "下方", icon: "↓" },
  { key: "left", label: "左侧", icon: "←" },
];

function readPortConfig(nodeData: Record<string, unknown> | null | undefined): PortConfig {
  const cfg = nodeData?.portConfig as Partial<PortConfig> | undefined;
  return {
    top: cfg?.top ?? 0,
    right: cfg?.right ?? 0,
    bottom: cfg?.bottom ?? 0,
    left: cfg?.left ?? 0,
  };
}

export const NodePortsPanel = defineComponent({
  name: "NodePortsPanel",
  setup() {
    const store = useEditorStore();

    const portConfig = computed<PortConfig>(() => {
      const _ = store.dataRevision;
      const node = store.selectedNode;
      if (!node) return { top: 0, right: 0, bottom: 0, left: 0 };
      return readPortConfig(node.getData() as Record<string, unknown>);
    });

    function onChange(dir: keyof PortConfig, val: number | null) {
      const nodeId = store.selectedNodeId;
      if (!nodeId) return;
      const next: PortConfig = {
        ...portConfig.value,
        [dir]: Math.max(0, Math.min(4, val ?? 0)),
      };
      store.updateNodePorts(nodeId, next);
    }

    return () => (
      <div style={{ padding: "8px 0" }}>
        {DIRECTIONS.map(({ key, label, icon }) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 12px",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "13px", color: "#555", minWidth: "52px", display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "15px", color: "#999" }}>{icon}</span>
              {label}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {/* Quick select buttons 0-4 */}
              {[0, 1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  onClick={() => onChange(key, n)}
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "4px",
                    border: portConfig.value[key] === n ? "1.5px solid #1677ff" : "1.5px solid #d9d9d9",
                    background: portConfig.value[key] === n ? "#e6f4ff" : "#fafafa",
                    color: portConfig.value[key] === n ? "#1677ff" : "#555",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: portConfig.value[key] === n ? 600 : 400,
                    userSelect: "none",
                  }}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ padding: "4px 12px 0", fontSize: "11px", color: "#bbb" }}>每方向最多 4 个连接点，0 表示不显示</div>
      </div>
    );
  },
});
