import { type ElementDef, registry } from "@cube-scada/core";
import { ElementRenderer } from "@cube-scada/renderer";
import { defineComponent, inject, shallowRef, onMounted, onUnmounted } from "vue";

export const ScadaNodeWrapper = defineComponent({
  name: "ScadaNodeWrapper",
  inheritAttrs: false,
  setup() {
    const getNode = inject<() => any>("getNode");

    const elementType = shallowRef<string>("");
    const elementProps = shallowRef<Record<string, any>>({});
    const width = shallowRef(100);
    const height = shallowRef(100);
    const opacity = shallowRef(1);
    const visible = shallowRef(true);
    const revision = shallowRef(0);

    function syncFromNode() {
      const node = getNode?.();
      if (!node) return;
      const data = node.getData() ?? {};
      elementType.value = data.elementType ?? "";
      elementProps.value = { ...(data.elementProps ?? {}) };
      const size = node.getSize();
      width.value = size.width;
      height.value = size.height;
      opacity.value = typeof data.opacity === "number" && Number.isFinite(data.opacity) ? Math.min(1, Math.max(0, data.opacity)) : 1;
      visible.value = data.visible !== false;
      revision.value++;
    }

    onMounted(() => {
      syncFromNode();
      const node = getNode?.();
      if (node) {
        node.on("change:data", syncFromNode);
        node.on("change:size", syncFromNode);
      }
    });

    onUnmounted(() => {
      const node = getNode?.();
      if (node) {
        node.off("change:data", syncFromNode);
        node.off("change:size", syncFromNode);
      }
    });

    return () => {
      const _ = revision.value;
      const def = registry.get(elementType.value);
      if (!def) {
        return (
          <div
            class="scada-node-empty"
            style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#999;font-size:12px"
          >
            Unknown
          </div>
        );
      }
      return (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            opacity: visible.value ? opacity.value : Math.min(opacity.value, 0.3),
            outline: visible.value ? undefined : "1px dashed #8c8c8c",
          }}
        >
          <ElementRenderer def={def} elementProps={elementProps.value} width={width.value} height={height.value} />
          {!visible.value ? (
            <span
              style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                padding: "1px 4px",
                borderRadius: "3px",
                background: "#595959",
                color: "#fff",
                fontSize: "10px",
                lineHeight: 1.4,
                pointerEvents: "none",
              }}
            >
              运行时隐藏
            </span>
          ) : null}
        </div>
      );
    };
  },
});
