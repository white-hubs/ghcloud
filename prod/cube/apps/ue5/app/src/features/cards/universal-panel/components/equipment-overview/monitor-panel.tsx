import { defineComponent, type PropType } from "vue";

import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import "./monitor-panel.module.less";

type MonitorPanelData = {
  imgPath: string;
  value: number | string;
  name: string;
};

export const MonitorPanel = defineComponent({
  name: "MonitorPanel",
  props: {
    monitorPanelData: { type: Object as PropType<MonitorPanelData>, required: true },
  },
  emits: ["handelClickItemize"],
  setup(props, { emit }) {
    const handelClick = (): void => {
      emit("handelClickItemize", props.monitorPanelData);
    };

    return (): JSX.Element => {
      const data = props.monitorPanelData;
      return (
        <div class="monitorPanel">
          <div class="monitorPanel-left">
            <div class="bg">
              <img src={getAssetsImage("overView4.png")} alt="" />
              <img class="rotate aniamtion-electric-fan" src={getAssetsImage(data.imgPath)} alt="" />
            </div>
          </div>
          <div class="monitorPanel-right">
            <div class="monitorPanel-data">
              {typeof data.value === "number" ? (
                <CountTo class="count" onClick={handelClick} startVal={0} endVal={data.value} duration={2000} separator="" />
              ) : (
                <span class="count" onClick={handelClick}>
                  {data.value}
                </span>
              )}
              <div class="monitorPanel-line"></div>
              <div class="monitorPanel-name">{data.name}</div>
            </div>
          </div>
        </div>
      );
    };
  },
});

export default MonitorPanel;
