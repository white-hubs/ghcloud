import { defineComponent } from "vue";
import { ref, onMounted, watch } from "vue";

import { render } from "./chart";

import styles from "./radar.module.less";

export const Radar = defineComponent({
  name: "Radar",
  props: {
    titles: { type: Array, required: false, default: () => [] },
    data: { type: Array, required: true },
    maxData: { type: Array, required: true },
    lineColor: { type: String, required: false },
    dataColor: { type: String, required: false },
  },
  setup(props, ctx) {
    interface Props {
      titles?: string[];
      data: number[];
      maxData: number[];
      lineColor?: string;
      dataColor?: string;
    }
    const chartDom = ref();

    onMounted(() => {
      render(chartDom.value, props.titles, props.data, props.maxData, props.lineColor, props.dataColor);
    });
    watch(
      () => [...props.data],
      (newVal) => {
        render(chartDom.value, props.titles, props.data, props.maxData, props.lineColor, props.dataColor);
      },
    );

    return (): JSX.Element => <div class="chart" ref={chartDom}></div>;
  },
});

export default Radar;
