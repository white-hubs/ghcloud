import { Dropdown } from "ant-design-vue";
import { defineComponent, onBeforeMount, ref } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";
import { TimeEnum } from "@ghcloud/cube-visual-sdk/src/web-3d/tools/environment-helper";

import { getAssetsImage } from "@/infrastructure/utils/getImage";
import { eventInstance } from "@/visualization-core/event/event";
import { storeHead } from "@/visualization-core/stores/use-state-head";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./switch-model-time.module.less";
/** 切换模型时间 */
export const SwitchModelTime = defineComponent({
  setup(props, { expose }) {
    const { renderType } = useStateStore();
    const piniaStoreHead = storeHead();
    const modelTimeOptions = ref([
      {
        label: "自动",
        value: "auto",
        img: "time1.png",
      },
      {
        label: "上午",
        value: "9:00:00",
        img: "time1.png",
      },
      {
        label: "下午",
        value: "15:00:00",
        img: "time2.png",
      },
      {
        label: "晚上",
        value: "22:00:00",
        img: "time3.png",
      },
    ]);

    onBeforeMount(() => {
      if (renderType === "WEBGL") {
        modelTimeOptions.value = [
          {
            label: "白天",
            value: TimeEnum.DAY,
            img: "time1.png",
          },
          {
            label: "黄昏",
            value: TimeEnum.DUSK,
            img: "time3.png",
          },
          {
            label: "夜晚",
            value: TimeEnum.NIGHT,
            img: "time3.png",
          },
        ];
        piniaStoreHead.timeSelected = modelTimeOptions.value[0];
      }
    });
    renderType === "UE5" &&
      UeClient.getInstance().onConnected(async function () {
        // 重置模型时间为自动
        eventInstance.emitEvent("changeModelTime", modelTimeOptions.value[0]);
      });

    function handleClick(item): void {
      if (piniaStoreHead.timeSelected.value === item.value) {
        return;
      }
      eventInstance.emitEvent("changeModelTime", item);
    }

    expose({
      changeModelTime: handleClick,
    });

    return (): JSX.Element => (
      <Dropdown
        getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
        v-slots={{
          overlay: () => {
            return (
              <div class={styles.list}>
                {modelTimeOptions.value.map((item) => {
                  return (
                    <div
                      class={styles["list-item"]}
                      key={item.value}
                      onClick={() => {
                        handleClick(item);
                      }}
                    >
                      <img src={getAssetsImage(item.img)} />
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
          <img src={getAssetsImage(piniaStoreHead.timeSelected.img)} />
          <span>{piniaStoreHead.timeSelected.label}</span>
        </div>
      </Dropdown>
    );
  },
});
