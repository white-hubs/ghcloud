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
  setup(props, ctx) {
    interface Item {
      name: string;
      color: string;
      value: number;
    }
    interface List {
      statistic: {
        title?: string;
        total?: number | string;
        icon?: string;
      };
      legendList?: Item[];
    }
    interface Props {
      data: List[];
    }
    return (): JSX.Element => (
      <>
        <div class="round-wrap">
          {props.data.map((item, index) => (
            <div class="info">
              <div class="item">
                <img class="roate r1" src={getAssetsImage("round.png")} alt />
                <img class="roate rotate" src={getAssetsImage("round1.png")} alt />
                <img class="roate r3 rotate" src={getAssetsImage("round1.png")} alt />
                <img class="roate r2 rotate" src={getAssetsImage("round2.png")} alt />
                {item.statistic.icon && <img class="icon aniamtion-pulse" src={getAssetsImage(item.statistic.icon)} alt />}
                <template>
                  {typeof item.statistic.total == "number" && (
                    <CountTo startVal={0} endVal={item.statistic.total} duration={2000} separator />
                  )}
                  <span> {item.statistic.total}</span>
                  <span class="value"> {item.statistic.title}</span>
                </template>
                <slot />
              </div>
              {item.legendList && <monitor-list monitorData={item.legendList}></monitor-list>}
            </div>
          ))}
        </div>
      </>
    );
  },
});

export default LightingRound;
