import { defineComponent } from "vue";

import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./switch-tag-visible.module.less";

/** 标签显隐 */
export const SwitchTagVisible = defineComponent({
  setup() {
    const { globalState } = useStateStore();

    function handleClick(): void {
      globalState.tagVisible = !globalState.tagVisible;
    }

    return () => (
      <div class={styles.item} onClick={handleClick}>
        {globalState.tagVisible ? "隐藏" : "显示"}标签
      </div>
    );
  },
});
