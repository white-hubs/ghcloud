import { defineComponent } from "vue";
import { withDefaults, computed, ComputedRef } from "vue";

import styles from "./alarmStatisticsItem.module.less";

export const AlarmStatisticsItem = defineComponent({
  name: "AlarmStatisticsItem",
  props: {
    level: { type: Number, required: true, default: 1 },
    alarmNum: { type: Number, required: true, default: 0 },
    mode: { type: String, required: true, default: "环比" },
    isGrow: { type: Boolean, required: true, default: true },
    chainRatio: { type: Number, required: true, default: 0 },
    name: { type: String, required: true, default: "一级报警" },
  },
  setup(props, ctx) {
    const useClass: ComputedRef<string> = computed(() => {
      const classMap = new Map<number, string>([
        [1, "one_level"],
        [2, "second_level"],
        [3, "third_level"],
        [4, "fourth_level"],
      ]);
      return classMap.get(props.level);
    });

    return (): JSX.Element => (
      <>
        <div class="alarmStatisticsItem">
          <div class="title">
            <div> {props.name}</div>
            <div class="title_line">
              {" "}
              <div class={["level_line", useClass]}></div>
            </div>
          </div>
          <div class="content">
            <div class="count"> {props.alarmNum}</div>
            <div class="mode"> {props.mode}</div>
            <div class={["downtriangle", props.isGrow && "uptriangle"]}></div>
            <div class={[props.isGrow ? "down" : "up"]}>{props.chainRatio}%</div>
          </div>
        </div>
      </>
    );
  },
});

export default AlarmStatisticsItem;
