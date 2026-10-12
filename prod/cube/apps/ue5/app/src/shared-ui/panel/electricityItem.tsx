import { defineComponent } from "vue";
import { withDefaults } from "vue";
import { CountTo } from "vue3-count-to";

import styles from "./electricityItem.module.less";

export const ElectricityItem = defineComponent({
  name: "ElectricityItem",
  props: {
    title: { type: String, required: true, default: "" },
    barColor: { type: String, required: false, default: "#ffc700" },
    animationDelay: { type: String, required: false, default: "0" },
    value: { type: Number, required: false, default: 0 },
    radio: { type: Number, required: false, default: 0 },
  },
  setup(props, ctx) {
    interface Props {
      title: string;
      barColor?: string;
      animationDelay?: string;
      value?: number;
      radio?: number;
    }
    return (): JSX.Element => (
      <>
        <div class="electricityItem">
          <div class="top">
            <div class="title"> {title}</div>
            <div class="right">
              <div class="count">
                <count-to startVal={0} endVal={value} duration={4000} class="scroll-number"></count-to>
                <span class="unit"> kw/h</span>
              </div>
              <div class="mode"> 环比</div>
              <div class={["downtriangle"]}></div>
              <div class={["up"]}>{radio}%</div>
            </div>
          </div>
          <div class="line">
            {" "}
            <div class="animation"></div>
          </div>
        </div>
      </>
    );
  },
});

export default ElectricityItem;
