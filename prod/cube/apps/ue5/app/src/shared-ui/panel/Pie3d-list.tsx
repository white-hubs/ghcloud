import { defineComponent } from "vue";
import { reactive, computed } from "vue";

import { AlarmLevelType } from "@/infrastructure/api/models/alarm";

import styles from "./Pie3d-list.module.less";

export const Pie3dList = defineComponent({
  name: "Pie3dList",
  props: {
    roundPieData: { type: Array, required: true },
    class: { type: String, required: false },
  },
  emits: ["handelClickItemize"],
  setup(props, { emit }) {
    interface pieType {
      alarmNum: number;
      name: string;
    }
    interface Props {
      roundPieData: pieType[];
      class?: string;
    }
    const colors = ["#6ce3e3", "#397caf", "#2c91e5", "#2c4cb2"];
    const character = computed(() => (value: pieType) => {
      let data = JSON.parse(JSON.stringify(value));
      let courseDataTotal = 0;
      props.roundPieData.forEach((item) => {
        courseDataTotal += item.alarmNum;
      });
      if (courseDataTotal === 0) {
        data.name = data.name + "(0%)";
      } else {
        data.name = data.name + "(" + ((data.alarmNum / courseDataTotal) * 100).toFixed(1) + "%)";
      }
      return data.name;
    });

    const handelClick = (item) => {
      emit("handelClickItemize", item);
    };
    return (): JSX.Element => (
      <>
        <div class={["policeList", props.class]}>
          {props.roundPieData.map((item, index) => (
            <div class="thePolice" key={colors[index]} onClick={handelClick(item)}>
              <div title={item.name}>
                <span style={{ background: colors[index] }} class="thePoliceColor"></span>
                <span class="thePoliceLeft"> {character(item)}</span>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  },
});

export default Pie3dList;
