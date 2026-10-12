import { defineComponent } from "vue";

import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./switch-menu-visible.module.less";

/** 菜单显隐 */
export const SwitchMenuVisible = defineComponent({
  setup() {
    const { globalState } = useStateStore();

    function handleClick(): void {
      globalState.menuVisible = !globalState.menuVisible;
    }

    return (): JSX.Element => (
      <div class={styles.item} onClick={handleClick}>
        {globalState.menuVisible ? "隐藏" : "显示"}菜单
      </div>
    );
  },
});
