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
      ratio?: number;
      name: string;
    }
    interface Props {
      monitorPanelData: data;
    }
    const handelClick = () => {
      emit("handelClickItemize", props.monitorPanelData);
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
              <div class="monitorPanel-name"> {monitorPanelData.name}</div>
              <div class="monitorPanel-line"></div>
              <div class="monitorPanel-value">
                <CountTo class="count" onClick={handelClick} startVal={0} endVal={monitorPanelData.value} duration={2000} separator />
                <div class={[monitorPanelData.ratio > 0 ? "up" : "down"]}> {monitorPanelData.ratio || 0 + "%"}</div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  },
});

export default MonitorPanel;
