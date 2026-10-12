import { defineComponent, watch, type PropType } from "vue";

import { peopleFlowHeatmapManager } from "@/features/cards/people-flow/heatmap/people-flow-heatmap-runtime";
import { useHeatmapControl } from "@/features/cards/people-flow/heatmap/use-heatmap-control";
import { useFloorTagPosition } from "@/visualization-core/hooks/use-floor-tag-position";
import { storeHead } from "@/visualization-core/stores/use-state-head";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./heatmap-overlay.module.less";

/**
 * 可视化首页热力图开关与模型连接生命周期。
 * 首页作为唯一的全量热力图预热入口；卡片只提升用户选择区域的优先级。
 * 开关展示时机与头部 / 左右面板一致：等模型加载完成且面板可见后再显示。
 */
export const HeatmapOverlay = defineComponent({
  name: "HeatmapOverlay",
  props: {
    modelReady: { type: Boolean as PropType<boolean>, default: false },
  },
  setup(props) {
    const stateStore = useStateStore();
    const headStore = storeHead();
    const { tagRight } = useFloorTagPosition();
    const { showHeatmapCheckbox, isHeatmapEnabled } = useHeatmapControl();

    watch(
      () => props.modelReady,
      (ready, wasReady) => {
        if (ready) {
          peopleFlowHeatmapManager.handleConnected();
          return;
        }
        if (wasReady) {
          peopleFlowHeatmapManager.handleDisconnected();
        }
      },
      { immediate: true },
    );

    return (): JSX.Element | null => {
      const panelVisible = Boolean(stateStore.globalState.panel.visible && stateStore.globalState.menuVisible);
      if (!props.modelReady || !showHeatmapCheckbox.value || !headStore.roamShow || !panelVisible) {
        return null;
      }
      return (
        <div class={styles.heatmapCheckbox} style={{ right: `${tagRight.value}px` }}>
          <input
            type="checkbox"
            id="heatmap"
            checked={isHeatmapEnabled.value}
            onChange={(e) => {
              isHeatmapEnabled.value = (e.target as HTMLInputElement).checked;
            }}
          />
          <label for="heatmap">热力图</label>
        </div>
      );
    };
  },
});
