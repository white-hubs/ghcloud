import { HolderOutlined } from "@ant-design/icons-vue";
import { defineComponent, Teleport } from "vue";

import { usePanelCardDrag } from "../use-panel-card-drag";

import styles from "./panel-select.module.less";

/**
 * 独立跟手层：只订阅指针坐标，避免左右面板在拖拽过程中整树重绘。
 */
export const PanelCardGhost = defineComponent({
  name: "PanelCardGhost",
  setup() {
    const dragApi = usePanelCardDrag();

    return () => {
      const current = dragApi.session.value;
      if (!current) {
        return null;
      }
      const x = dragApi.pointer.x - current.offsetX;
      const y = dragApi.pointer.y - current.offsetY;
      return (
        <Teleport to="body">
          <div
            class={styles.dragGhost}
            style={{
              width: `${current.width}px`,
              transform: `translate3d(${x}px, ${y}px, 0) rotate(1.2deg) scale(1.03)`,
            }}
          >
            <HolderOutlined />
            <span class={styles.dragGhostTitle}>{current.title || "卡片"}</span>
          </div>
        </Teleport>
      );
    };
  },
});

export default PanelCardGhost;
