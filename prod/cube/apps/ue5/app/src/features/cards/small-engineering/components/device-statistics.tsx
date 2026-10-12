import { defineComponent } from "vue";

import { getAssetsImage } from "@/infrastructure/utils/getImage";

import styles from "./device-statistics.module.less";

export const DeviceStatistics = defineComponent({
  name: "DeviceStatistics",
  props: {
    imgPath: { type: String, required: true },
    showRatio: { type: Boolean, required: true, default: true },
    statistic: { type: Object, required: true },
  },
  emits: ["handelClickItemize"],
  setup(props, { emit }) {
    interface Props {
      imgPath: string;
      showRatio: boolean;
      statistic: {
        title: string;
        total: number;
        ratio?: number;
      };
    }
    const handelClick = (item) => {
      emit("handelClickItemize", item);
    };

    return (): JSX.Element => (
      <>
        <div class="situation-analysis flex-between">
          <div class="left">
            <div class="bg">
              <img src={getAssetsImage("overView4.png")} alt />
              <img class="rotate aniamtion-electric-fan" src={getAssetsImage(props.imgPath)} alt="" />
            </div>
          </div>
          <div class="right">
            <div
              class="total flex-between"
              onClick={() => {
                handelClick(props.statistic);
              }}
            >
              <div class="title">{props.statistic.title}</div>
              <div class="count">
                <span>{props.statistic.total}</span>
                {props.showRatio ? (
                  <div class="ringRatio">
                    <span>环比</span>
                    <div class={["downtriangle", (props.statistic.ratio ?? 0) > 0 && "uptriangle"]} />
                    <div class={[(props.statistic.ratio ?? 0) > 0 ? "up" : "down"]}>{props.statistic.ratio || 0}%</div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  },
});

export default DeviceStatistics;
