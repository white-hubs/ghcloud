import { defineComponent } from "vue";

import { getAssetsImage } from "@/infrastructure/utils/getImage";

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
      value: string;
      name: string;
      unit: string;
      chainRatio?: number;
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
              <div class="monitorPanel-name"> {monitorPanelData.name}</div>
              <div class="monitorPanel-line"></div>
              <div class="monitorPanel-count">
                <span> {monitorPanelData.value}</span>
                <span class="unit"> {monitorPanelData.unit}</span>
              </div>
            </div>
            {monitorPanelData.chainRatio && (
              <div class="ringRatio">
                <span> 环比</span>
                <div class={[monitorPanelData.chainRatio > 0 ? "up" : "down"]}> {monitorPanelData.chainRatio + "%"}</div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  },
});

export default MonitorPanel;
