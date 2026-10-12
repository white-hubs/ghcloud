import { defineComponent, type PropType } from "vue";

import { getAssetsImage } from "@/infrastructure/utils/getImage";

import "./monitor-panel.module.less";

type MonitorPanelData = {
  imgPath: string;
  value: string | number;
  name: string;
  unit?: string;
  chainRatio?: number;
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
      const ratio = Number(data.chainRatio);
      const showRatio = Number.isFinite(ratio) && ratio !== 0;

      return (
        <div class="monitorPanel" onClick={handelClick}>
          <div class="monitorPanel-left">
            <div class="bg">
              <img src={getAssetsImage("overView4.png")} alt="" />
              <img class="rotate aniamtion-electric-fan" src={getAssetsImage(data.imgPath)} alt="" />
            </div>
          </div>
          <div class="monitorPanel-right">
            <div class="monitorPanel-data">
              <div class="monitorPanel-name">{data.name}</div>
              <div class="monitorPanel-line"></div>
              <div class="monitorPanel-count">
                <span>{data.value}</span>
                {data.unit ? <span class="unit">{data.unit}</span> : null}
              </div>
            </div>
            {showRatio ? (
              <div class="ringRatio">
                <span>环比</span>
                <div class={ratio > 0 ? "up" : "down"}>{ratio}%</div>
              </div>
            ) : null}
          </div>
        </div>
      );
    };
  },
});

export default MonitorPanel;
