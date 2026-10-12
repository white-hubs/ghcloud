import { h, defineComponent, ref, onMounted, onUnmounted, type PropType } from "vue";

import { getVueComponent } from "./component-map";
import { getComponentByName } from "./component-registry";
import type { ComponentInstance } from "./types";

import styles from "./canvas-panel.module.less";

export const CanvasPanel = defineComponent({
  props: {
    components: {
      type: Array as PropType<ComponentInstance[]>,
      default: () => [],
    },
    selectedIndex: {
      type: Number as PropType<number | null>,
      default: null,
    },
    primaryColor: {
      type: String as PropType<string>,
      default: "#1578FF",
    },
  },
  emits: ["select", "move-up", "move-down", "delete", "open-json-editor"],
  setup(props, { emit }) {
    const canvasRef = ref<HTMLDivElement | null>(null);
    const scale = ref(1);

    const updateScale = (): void => {
      if (!canvasRef.value) {
        return;
      }
      const width = canvasRef.value.clientWidth - 32; // 减去 padding 16*2
      scale.value = Math.min(Math.max(width / 1920, 0.3), 1);
    };

    onMounted(() => {
      updateScale();
      window.addEventListener("resize", updateScale);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", updateScale);
    });

    const handleSelect = (index: number): void => {
      emit("select", index);
    };

    const handleMoveUp = (index: number, e: MouseEvent): void => {
      e.stopPropagation();
      if (index > 0) {
        emit("move-up", index);
      }
    };

    const handleMoveDown = (index: number, e: MouseEvent): void => {
      e.stopPropagation();
      if (index < props.components.length - 1) {
        emit("move-down", index);
      }
    };

    const handleDelete = (index: number, e: MouseEvent): void => {
      e.stopPropagation();
      emit("delete", index);
    };

    return (): JSX.Element => {
      const { components, selectedIndex } = props;

      return (
        <div class={styles.panel}>
          <div class={styles.header}>
            <span>画布预览（{components.length} 个组件）</span>
            <button class={styles.jsonBtn} onClick={() => emit("open-json-editor")}>
              JSON 编辑
            </button>
          </div>
          {components.length === 0 ? (
            <div class={styles.empty}>点击左侧组件添加到画布</div>
          ) : (
            <div class={[styles.canvas, "custom-scrollbar"]} ref={canvasRef}>
              <div class={styles.canvasViewport} style={{ zoom: scale.value, "--primary": props.primaryColor }}>
                {components.map((instance, index) => {
                  const isSelected = selectedIndex === index;
                  const registryItem = getComponentByName(instance.name);
                  const vueComponent = getVueComponent(instance.name);

                  return (
                    <div
                      key={`${instance.name}-${index}`}
                      class={[styles.componentItem, isSelected ? styles.componentItemSelected : ""]}
                      onClick={() => handleSelect(index)}
                    >
                      <div class={styles.componentLabel} style={{ zoom: 1 / scale.value }}>
                        {registryItem?.title ?? instance.name}
                      </div>
                      <div class={styles.componentActions} style={{ zoom: 1 / scale.value }}>
                        <button
                          class={styles.actionBtn}
                          title="上移"
                          disabled={index === 0}
                          onClick={(e: MouseEvent) => handleMoveUp(index, e)}
                        >
                          ↑
                        </button>
                        <button
                          class={styles.actionBtn}
                          title="下移"
                          disabled={index === components.length - 1}
                          onClick={(e: MouseEvent) => handleMoveDown(index, e)}
                        >
                          ↓
                        </button>
                        <button
                          class={[styles.actionBtn, styles.actionBtnDanger]}
                          title="删除"
                          onClick={(e: MouseEvent) => handleDelete(index, e)}
                        >
                          ×
                        </button>
                      </div>
                      <div class={[styles.componentPreview, instance.name === "FloatingSidebar" ? styles.floatingSidebarPreview : ""]}>
                        {vueComponent ? (
                          h(vueComponent as any, instance.props)
                        ) : (
                          <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>无法预览组件：{instance.name}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    };
  },
});
