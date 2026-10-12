import { defineComponent } from "vue";

import { ConfigLoader } from "@/application/config/config-loader";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./layout.module.less";

export const Layout = defineComponent({
  setup: (_props, { slots }) => {
    const stateStore = useStateStore();

    return (): JSX.Element => {
      const entry = ConfigLoader.config?.entry ?? window.config?.entry ?? "views";
      // Menu visibility is independent from panel switch animation.
      // Binding to panel.visible made the bottom nav flicker/hide and blocked clicks.
      const menuVisible = stateStore.globalState.menuVisible && entry !== "views-gis";

      return (
        <div class={`${styles["layout-container"]} view ${styles[entry] ?? ""}`}>
          <div class={`${styles["layout-header"]}`}>{slots["layout-header"]?.()}</div>
          {slots["layout-left-penal"]?.()}
          {slots["layout-right-penal"]?.()}
          <div class={`${styles["layout-area-tag"]} ${entry !== "views-gis" ? styles.show : styles.hide}`}>
            {slots["layout-area-tag"]?.()}
          </div>
          <div class={`${styles["layout-menu"]} ${menuVisible ? styles.show : styles.hide}`}>{slots["layout-menu"]?.()}</div>
          {slots.default?.()}
        </div>
      );
    };
  },
});
