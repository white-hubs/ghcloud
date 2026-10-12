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
      offline: number;
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
              </div>
            </div>
            <div class="list">
              {(props.statistic.itemize ?? []).map((item) => (
                <div class="list-item" key={item.label}>
                  <div
                    onClick={() => {
                      handelClick(item.label);
                    }}
                    style="margin-right: 4px;"
                  >
                    <span class="label">{item.label}</span>
                    <span style="color: #2ae8bd">{item.value}</span>
                  </div>
                  <div
                    onClick={() => {
                      handelClick(item.name);
                    }}
                  >
                    <span class="rate">{item.name}</span>
                    <span style="color: #ffab10">{item.offline}</span>
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
