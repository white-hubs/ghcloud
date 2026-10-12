import { defineComponent } from "vue";

import Bar from "./charts/bar/bar";

import styles from "./electricTrend.module.less";

export const ElectricTrend = defineComponent({
  name: "ElectricTrend",
  props: {
    xData: { type: Array, required: true },
    name: { type: String, required: true },
    data: { type: Array, required: true },
  },
  setup(props, ctx) {},
});

export default ElectricTrend;
