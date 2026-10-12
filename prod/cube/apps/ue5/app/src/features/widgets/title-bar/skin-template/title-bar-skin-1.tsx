import { defineComponent, onMounted } from "vue";

import styles from "./tile-bar-skin-1.module.less";
const backImage = "/resource/v1/ue5-migrate/pages/widget/title-bar/assets/skin-1-bg.png";
import "@/visualization-core/ai/register-title-bar-ai-commands";
import "@/visualization-core/ai/register-scene-ai-commands";
import { ConfigLoader } from "@/application/config/config-loader";
import { AlarmEntry } from "@/features/widgets/title-bar/components/alarm-entry/alarm-entry";
import { ChatAssistant } from "@/features/widgets/title-bar/components/chat-assistant/chat-assistant";
import { DateTime } from "@/features/widgets/title-bar/components/date-time/date-time";
import { RoamingRoute } from "@/features/widgets/title-bar/components/roaming-route/roaming-route";
import { SwitchDriveMode } from "@/features/widgets/title-bar/components/switch-drive-mode/switch-drive-mode";
import { SwitchFullscreen } from "@/features/widgets/title-bar/components/switch-fullscreen/switch-fullscreen";
import { SwitchMenuVisible } from "@/features/widgets/title-bar/components/switch-menu-visible/switch-menu-visible";
import { SwitchModelAlarm } from "@/features/widgets/title-bar/components/switch-model-alarm/switch-model-alarm";
import { SwitchModelGlobalCameraView } from "@/features/widgets/title-bar/components/switch-model-global-camera-view/switch-model-global-camera-view";
import { SwitchModelQuality } from "@/features/widgets/title-bar/components/switch-model-quality/switch-model-quality";
import { SwitchModelTime } from "@/features/widgets/title-bar/components/switch-model-time/switch-model-time";
import { SwitchModelTourAround } from "@/features/widgets/title-bar/components/switch-model-tour-around/switch-model-tour-around";
import { SwitchModelWeather } from "@/features/widgets/title-bar/components/switch-model-weather/switch-model-weather";
import { SwitchTagVisible } from "@/features/widgets/title-bar/components/switch-tag-visible/switch-tag-visible";
import { SwitchVisualTheme } from "@/features/widgets/title-bar/components/switch-visual-theme/switch-visual-theme";
import { UeModalControl } from "@/features/widgets/title-bar/components/ue-modal-control/ue-modal-control";
import { useAiAbility } from "@/visualization-core/ai/use-ai-ability";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

/** 标题栏样式一 */
export const TitleBarSkin1 = defineComponent({
  setup: () => {
    const { globalState, renderType } = useStateStore();
    const { aiAbilityEnabled, loadAiAbility } = useAiAbility();

    onMounted(() => {
      void loadAiAbility();
    });

    return (): JSX.Element => (
      <>
        <div class={styles["title-bar"]}>
          <img class={styles["bar-background"]} src={backImage} />
          <div class={styles["left-container"]}>
            <DateTime />
            <SwitchModelTime />
            <SwitchModelWeather />
            <SwitchModelGlobalCameraView />
            {renderType === "UE5" && <SwitchModelQuality />}
            <RoamingRoute />
          </div>
          <span class={styles["title-value"]} title={ConfigLoader.config.systemName}>
            {ConfigLoader.config.systemName}
          </span>
          <div class={styles["right-container"]}>
            <SwitchModelAlarm />
            <SwitchModelTourAround />
            {renderType === "UE5" && <SwitchDriveMode />}
            <SwitchFullscreen />
            <SwitchTagVisible />
            <SwitchMenuVisible />
            {aiAbilityEnabled.value && <ChatAssistant />}
            <SwitchVisualTheme />
            <AlarmEntry />
          </div>
        </div>
        {globalState.driveMode && <UeModalControl />}
      </>
    );
  },
});
