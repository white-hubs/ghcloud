import { DownOutlined, UpOutlined } from "@ant-design/icons-vue";
import { defineComponent, onMounted, ref } from "vue";

import { ueSdk } from "@/visualization-core/model-sdk/ue-sdk";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./ue-modal-control.module.less";

/** 驾驶模式 */
export const UeModalControl = defineComponent({
  setup() {
    const initStatus = ref(false);
    const { globalState } = useStateStore();

    onMounted(() => {
      setTimeout(() => {
        initStatus.value = true;
      }, 0);
    });

    const up = () => {
      ueSdk.ueClient.send("floorUp");
    };
    const down = () => {
      ueSdk.ueClient.send("floorDown");
    };

    return () => (
      <div class={styles["ue-modal-control"]}>
        <a-button class={styles["item"]} onClick={up}>
          <UpOutlined />
        </a-button>
        <a-button class={styles["item"]} onClick={down}>
          <DownOutlined />
        </a-button>
      </div>
    );
  },
});
