import { defineComponent } from "vue";
import { ref, onMounted, watch } from "vue";

import { render, PieData } from "./chart";

import styles from "./roseChart.module.less";

export const RoseChart = defineComponent({
  name: "RoseChart",
  props: {
    pieData: { type: Array, required: true },
    title: { type: String, required: false },
  },
  setup(props, ctx) {
    const roseChart = ref();
    onMounted(() => {
      if (roseChart.value) {
        render(roseChart.value, props.pieData, props.title);
      }
    });

    return (): JSX.Element => <div class="roseChart" ref={roseChart}></div>;
  },
});

export default RoseChart;
