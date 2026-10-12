import { defineComponent } from "vue";

import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import styles from "./device-statistics.module.less";

export const DeviceStatistics = defineComponent({
  name: "DeviceStatistics",
  props: {
    imgPath: { type: String, required: true },
    statistic: { type: Object, required: true },
  },
  emits: ["handelClickItemize"],
  setup(props, { emit }) {
    interface Item {
      label: string;
      value: number;
      name?: string;
    }
    interface Props {
      imgPath: string;
      statistic: {
        title: string;
        total: number;
        itemize?: Item[];
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
                {typeof props.statistic.total === "number" ? (
                  <CountTo startVal={0} endVal={props.statistic.total} separator="" duration={4000} class="scroll-number" />
                ) : (
                  <span>{props.statistic.total}</span>
                )}
              </div>
            </div>
            <div class="list">
              {(props.statistic.itemize ?? []).map((item) => (
                <div class="list-item">
                  <span class="label"> {item.label}</span>
                  <div class="value">
                    <count-to startVal={0} endVal={item.value} duration={4000}></count-to>
                    <span class="rate">
                      {item.name}
                      {props.statistic.total ? ((item.value / props.statistic.total) * 100).toFixed(2) : "0"}%
                    </span>
                    <a-progress
                      stroke-linecap="square"
                      type="circle"
                      percent={props.statistic.total ? (item.value / props.statistic.total) * 100 : 0}
                      strokeWidth={20}
                      width={14}
                      showInfo={false}
                      strokeColor="#2989FF"
                      trailColor="rgba(255, 255, 255, 0.20)"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  },
});

export default DeviceStatistics;
