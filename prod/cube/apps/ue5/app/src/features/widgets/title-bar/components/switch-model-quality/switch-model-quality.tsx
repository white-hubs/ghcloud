import { Dropdown } from "ant-design-vue";
import { defineComponent, ref } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import { eventInstance } from "@/visualization-core/event/event";
import { storeHead } from "@/visualization-core/stores/use-state-head";

import styles from "./switch-model-quality.module.less";

/** 切换模型全局视角 */
export const SwitchModelQuality = defineComponent({
  setup(props, { expose }) {
    const piniaStoreHead = storeHead();
    const options = ref([
      { value: "high", label: "高" },
      { value: "medium", label: "中" },
      { value: "low", label: "低" },
    ]);
    UeClient.getInstance().onConnected(function () {
      // 设置画质
      this.send("changePictureQuality", { level: navigator.userAgent.includes("UnrealEngine") ? "high" : "medium" });
    });

    function handleClick(item): void {
      if (piniaStoreHead.qualitySelected.value === item.value) {
        return;
      }
      eventInstance.emitEvent("changeModelQuality", item);
    }
    expose({
      changeQuality: handleClick,
    });

    return (): JSX.Element => (
      <Dropdown
        getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
        v-slots={{
          overlay: () => {
            return (
              <div class={styles.list}>
                {options.value.map((item) => {
                  return (
                    <div
                      class={styles["list-item"]}
                      key={item.value}
                      onClick={() => {
                        handleClick(item);
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
          <span>画质：{piniaStoreHead.qualitySelected.label}</span>
        </div>
      </Dropdown>
    );
  },
});
