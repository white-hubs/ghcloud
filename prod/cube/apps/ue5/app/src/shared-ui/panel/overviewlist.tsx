import { defineComponent } from "vue";
import { reactive, computed } from "vue";

import styles from "./overviewlist.module.less";

export const Overviewlist = defineComponent({
  name: "Overviewlist",
  props: {
    roundPieData: { type: Array, required: true },
  },
  setup(props, ctx) {
    interface pieData {
      label: string;
      color: string;
      value: number;
      ratio: number;
    }
    interface Props {
      roundPieData: pieData[];
    }
    const character = computed(() => (value: string) => {
      if (value.indexOf("(") !== -1) {
        return "(";
      } else {
        return "";
      }
    });
    return (): JSX.Element => (
      <>
        <div class="policeList">
          {(props.roundPieData as Props["roundPieData"]).map((item) => (
            <div class="thePolice" key={item.color}>
              <div title={item.label}>
                <span style={{ background: item.color }} class="thePoliceColor"></span>
                <span class="thePoliceLeft"> {item.label.split("(")[0]}</span>
                <span style="margin-left: 3px;">{item.ratio}%</span>
                <span style="line-height: 20px">
                  {character(item.label)}
                  {item.label.split("(")[1]}
                </span>
              </div>
              <span> {item.value}</span>
            </div>
          ))}
        </div>
      </>
    );
  },
});

export default Overviewlist;
