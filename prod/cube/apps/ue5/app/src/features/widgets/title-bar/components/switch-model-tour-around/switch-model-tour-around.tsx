import { defineComponent } from "vue";

import { eventInstance } from "@/visualization-core/event/event";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./switch-model-tour-around.module.less";

/** 切换环游状态 */
export const SwitchModelTourAround = defineComponent({
  props: ["defaultCameraView"],
  setup() {
    const { globalState } = useStateStore();
    function handleClick(): void {
      eventInstance.emitEvent("changeModelTourAroundStatus");
    }
    return (): JSX.Element => (
      <div class={styles.item} onClick={handleClick}>
        {globalState.tourAround ? "关闭" : "开启"}环游
      </div>
    );
  },
});
