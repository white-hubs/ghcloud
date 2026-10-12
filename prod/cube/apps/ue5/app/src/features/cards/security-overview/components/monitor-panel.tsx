import { defineComponent } from "vue";

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
              <img class="rotate aniamtion-electric-fan" src={getAssetsImage(props.monitorPanelData.imgPath)} alt />
            </div>
          </div>
          <div class="monitorPanel-right">
            <div class="monitorPanel-data">
              <CountTo
                class="count"
                onClick={() => {
                  handelClick(props.monitorPanelData);
                }}
                startVal={0}
                endVal={props.monitorPanelData.value}
                duration={2000}
                separator
              />
              <div class="monitorPanel-line"></div>
              <div class="monitorPanel-name"> {props.monitorPanelData.name}</div>
            </div>
          </div>
        </div>
      </>
    );
  },
});

export default MonitorPanel;
