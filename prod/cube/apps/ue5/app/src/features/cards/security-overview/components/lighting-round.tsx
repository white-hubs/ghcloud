import { defineComponent } from "vue";

import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import monitorList from "@/shared-ui/panel/monitor-list";

import styles from "./lighting-round.module.less";

export const LightingRound = defineComponent({
  name: "LightingRound",
  props: {
    data: { type: Array, required: true },
  },
  emits: ["handelClickItemize"],
  setup(props, { emit }) {
    interface Item {
      name: string;
      color: string;
      value: number;
    }
    interface List {
      statistic: {
        title?: string;
        value?: number | string;
        icon?: string;
        unit?: string;
      };
      legendList?: Item[];
    }
    interface Props {
      data: List[];
    }
    const handelClick = (item) => {
      emit("handelClickItemize", item);
    };

    return (): JSX.Element => (
      <>
        <div class="round-wrap">
          {props.data.map((item, index) => (
            <div class="info" key={index} class={{ info2: index === 1 }}>
              <div class="item">
                <img class="roate r1" src={getAssetsImage("round.png")} alt />
                <img class="roate rotate" style={{ animationDelay: (index + 4) / 8 + "s" }} src={getAssetsImage("round1.png")} alt />
                <img class="roate r3 rotate" style={{ animationDelay: (index + 4) / 8 + "s" }} src={getAssetsImage("round1.png")} alt />
                <img class="roate r2 rotate" style={{ animationDelay: (index + 4) / 8 + "s" }} src={getAssetsImage("round2.png")} alt />
                {item.statistic.icon && <img class="icon aniamtion-pulse" src={getAssetsImage(item.statistic.icon)} alt />}
                <div>
                  {typeof item.statistic.value == "number" && (
                    <div>
                      <CountTo startVal={0} endVal={item.statistic.value} duration={2000} separator></CountTo>
                      <span class="unit"> {item.statistic.unit}</span>
                    </div>
                  )}
                  <span style="font-size: 0.1rem;"> {item.statistic.value}</span>
                  <span class="value"> {item.statistic.title}</span>
                </div>
                <slot />
              </div>
              {item.legendList && <monitor-list customValue={true} monitorData={item.legendList} onItemClick={handelClick}></monitor-list>}
            </div>
          ))}
        </div>
      </>
    );
  },
});

export default LightingRound;
