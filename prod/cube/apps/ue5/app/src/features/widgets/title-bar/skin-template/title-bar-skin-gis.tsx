import { defineComponent } from "vue";

import { ConfigLoader } from "@/application/config/config-loader";
import { AlarmEntry } from "@/features/widgets/title-bar/components/alarm-entry/alarm-entry";
import { SwitchFullscreen } from "@/features/widgets/title-bar/components/switch-fullscreen/switch-fullscreen";
import type { SceneDataType } from "@/infrastructure/api/models/mdata";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./tile-bar-skin-gis.module.less";
const bgImg = "/resource/v1/ue5-migrate/pages/widget/title-bar/assets/skin-gis.webp";
import { eventInstance } from "@/visualization-core/event/event";

/** 标题栏样式 GIS */
export const TitleBarSkinGis = defineComponent({
  setup: () => {
    const { globalState } = useStateStore();

    // 切换业务菜单
    async function switchNav(item: SceneDataType): Promise<void> {
      globalState.business.currentMenu = item.id;
      eventInstance.emitEvent("switchBusinessPanel", true);
    }

    return (): JSX.Element => (
      <>
        <div class={styles["title-bar"]}>
          <img class={styles["background-image"]} src={bgImg} alt="Background" />
          <span class={styles["title-value"]} title={ConfigLoader.config.systemName}>
            {ConfigLoader.config.systemName}
          </span>
          <div class={styles["menu-container"]}>
            {globalState.business.menu.map((item) => (
              <span
                class={`${styles["menu-item"]} ${globalState.business.currentMenu === item.id ? styles["active"] : ""}`}
                key={item.id}
                onClick={() => {
                  switchNav(item);
                }}
              >
                <span>{item.name}</span>
              </span>
            ))}
          </div>
          <div class={styles["right-container"]}>
            <SwitchFullscreen style={{ fontSize: "16px" }} />
            <AlarmEntry />
          </div>
        </div>
      </>
    );
  },
});
