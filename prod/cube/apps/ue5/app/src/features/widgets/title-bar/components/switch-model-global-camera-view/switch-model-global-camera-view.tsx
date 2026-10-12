import { Dropdown } from "ant-design-vue";
import { defineComponent, ref } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import { ConfigLoader } from "@/application/config/config-loader";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import { eventInstance } from "@/visualization-core/event/event";
import { storeHead } from "@/visualization-core/stores/use-state-head";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./switch-model-global-camera-view.module.less";

/** 切换模型全局视角 */
export const SwitchModelGlobalCameraView = defineComponent({
  setup() {
    const { renderType } = useStateStore();
    const piniaStoreHead = storeHead();
    const options = ref(ConfigLoader.config.modelPerspective);
    piniaStoreHead.perspectiveSelected = options.value[0];

    renderType === "UE5" &&
      UeClient.getInstance().onConnected(function () {
        eventInstance.emitEvent("setFirstPerspective");
      });

    function handleClick(index): void {
      eventInstance.emitEvent("setFirstPerspective", index);
    }

    return (): JSX.Element => (
      <Dropdown
        getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
        v-slots={{
          overlay: () => {
            return (
              <div class={styles.list}>
                {options.value.map((item, index) => {
                  return (
                    <div
                      class={styles["list-item"]}
                      key={item.value}
                      onClick={() => {
                        handleClick(index);
                      }}
                    >
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            );
          },
        }}
      >
        <div class={styles.box}>
          <img src={getAssetsImage("camera.png")} />
          <span>{piniaStoreHead.perspectiveSelected?.label || "默认"}</span>
        </div>
      </Dropdown>
    );
  },
});
