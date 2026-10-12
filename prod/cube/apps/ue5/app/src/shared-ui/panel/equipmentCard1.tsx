import { defineComponent } from "vue";
import { withDefaults } from "vue";
import { CountTo } from "vue3-count-to";

import styles from "./equipmentCard1.module.less";

export const EquipmentCard1 = defineComponent({
  name: "EquipmentCard1",
  props: {
    title: { type: String, required: true, default: "正常运行设备" },
    count: { type: Number, required: true, default: 7822 },
    status: { type: String, required: true, default: "warning" },
  },
  setup(props, ctx) {
    interface Props {
      title: string;
      count: number;
      status: string;
    }
    return (): JSX.Element => (
      <>
        <div class="equipmentCard">
          <div class="top">
            <div class={["dot", status === "warning" ? "warningbg" : "successbg"]}></div>
            <div class="name"> {props.title}</div>
          </div>
          <div class="bottom">
            <div class={["line", status === "warning" ? "warningbg" : "successbg"]}></div>
            <div class={["counts", status === "warning" ? "warning" : "success"]}>
              {" "}
              <count-to startVal={0} endVal={0} duration={4000} class="scroll-number"></count-to>
            </div>
          </div>
        </div>
      </>
    );
  },
});

export default EquipmentCard1;
