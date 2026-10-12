import { defineComponent } from "vue";
import { ref, reactive, toRefs, onMounted } from "vue";

import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import styles from "./monitor-panel.module.less";

export const MonitorPanel = defineComponent({
  name: "MonitorPanel",
  props: {
    monitorPanelData: { type: Object, required: true },
  },
  emits: ["handelClickItemize"],
  setup(props, { emit }) {
    interface data {
      imgPath: string;
      value: number;
      name: string;
      color?: string;
    }
    interface Props {
      monitorPanelData: data;
    }
    const handelClick = (item) => {
      emit("handelClickItemize", item);
    };

    return (): JSX.Element => (
      <>
        <div class="monitorPanel">
          <div class="monitorPanel-left">
            <div class="bg">
              <img src={getAssetsImage("overView4.png")} alt />
              <img class="rotate aniamtion-electric-fan" src={getAssetsImage(monitorPanelData.imgPath)} alt />
            </div>
          </div>
          <div class="monitorPanel-right">
            <div class="monitorPanel-data">
              <CountTo
                class="count"
                onClick={handelClick}
                startVal={0}
                endVal={monitorPanelData.value}
                duration={2000}
                separator
                style={{ color: monitorPanelData.color }}
              />
              <div class="monitorPanel-line"></div>
              <div class="monitorPanel-name"> {monitorPanelData.name}</div>
            </div>
          </div>
        </div>
      </>
    );
  },
});

export default MonitorPanel;
