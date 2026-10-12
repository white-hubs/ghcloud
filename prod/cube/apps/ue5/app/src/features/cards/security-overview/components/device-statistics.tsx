import { defineComponent, type PropType } from "vue";

import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import "./device-statistics.module.less";

interface Item {
  label: string;
  value: number;
  name?: string;
  ratio?: number | string;
  color?: string;
}

interface StatisticData {
  title: string;
  total: number;
  ratio?: number | string;
  itemize?: Item[];
  unit?: string;
}

export const DeviceStatistics = defineComponent({
  name: "DeviceStatistics",
  props: {
    imgPath: { type: String, required: true },
    statistic: { type: Object as PropType<StatisticData>, required: true },
  },
  emits: ["handelClickItemize"],
  setup(props, { emit }) {
    const handelClick = (item: StatisticData | Item): void => {
      emit("handelClickItemize", item);
    };

    return (): JSX.Element => (
      <div class="situation-analysis flex-between">
        <div class="left">
          <div class="bg">
            <img src={getAssetsImage("overView4.png")} alt="" />
            <img class="rotate aniamtion-electric-fan" src={getAssetsImage(props.imgPath)} alt="" />
          </div>
        </div>
        <div class="right">
          <div class="total flex-between">
            <div class="title">{props.statistic.title}</div>
            <div
              class="count"
              onClick={() => {
                handelClick(props.statistic);
              }}
            >
              {typeof props.statistic.total === "number" ? (
                <CountTo startVal={0} endVal={props.statistic.total} separator="" duration={4000} class="scroll-number" />
              ) : (
                <span>{props.statistic.total}</span>
              )}
              {props.statistic.unit ? <span>{props.statistic.unit}</span> : null}
              {props.statistic.ratio || props.statistic.ratio === 0 ? (
                <span class="ratio">
                  环比
                  <div class={props.statistic.ratio ? "triangle-up" : "triangle-down"} />
                  {props.statistic.ratio}%
                </span>
              ) : null}
            </div>
          </div>
          <div class="list">
            {(props.statistic.itemize ?? []).map((item) => (
              <div class="list-item" key={item.label}>
                <span class="label">{item.label}</span>
                <div
                  class="value"
                  onClick={() => {
                    handelClick(item);
                  }}
                >
                  <div style={{ color: item.color, cursor: "pointer" }}>
                    <CountTo startVal={0} endVal={item.value} duration={4000} />
                  </div>
                  {typeof item.ratio !== "undefined" ? (
                    <span class="ratio">
                      环比
                      <div class={item.ratio ? "triangle-up" : "triangle-down"} />
                      {item.ratio}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
});

export default DeviceStatistics;
