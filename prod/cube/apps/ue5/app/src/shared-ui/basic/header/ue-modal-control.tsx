import { DownOutlined, UpOutlined } from "@ant-design/icons-vue";
import { defineComponent } from "vue";
import { onMounted, ref } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import styles from "./ue-modal-control.module.less";

export const UeModalControl = defineComponent({
  name: "UeModalControl",
  setup(_props, ctx) {
    const ueClient = UeClient.getInstance();
    const initStatus = ref(false);
    onMounted(() => {
      setTimeout(() => {
        initStatus.value = true;
      }, 0);
    });
    function up() {
      ueClient.send("floorUp");
    }
    function down() {
      ueClient.send("floorDown");
    }

    return (): JSX.Element => (
      <>
        <div class="ue-modal-control" class={{ show: initStatus }}>
          <a-button class="item" onClick={up}>
            {" "}
            <UpOutlined />
          </a-button>
          <a-button class="item" onClick={down}>
            {" "}
            <DownOutlined />
          </a-button>
        </div>
      </>
    );
  },
});

export default UeModalControl;
