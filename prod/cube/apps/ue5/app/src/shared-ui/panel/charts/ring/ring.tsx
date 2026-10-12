import type { ECharts } from "echarts";
import { defineComponent, onBeforeUnmount, onMounted, ref, watch, type PropType } from "vue";

import { render, type PieData } from "./chart";
import { VISUAL_THEME_CHANGE_EVENT } from "@/infrastructure/utils/visual-theme";

import styles from "./ring.module.less";

export const Ring = defineComponent({
  name: "Ring",
  props: {
    pieData: { type: Array as PropType<PieData[]>, required: true },
    seriesName: { type: String, required: false },
    total: { type: [String, Number], required: false },
    unit: { type: String, required: false },
    themeAware: { type: Boolean, required: false, default: false },
  },
  setup(props) {
    const ringChart = ref<HTMLElement>();
    let chart: ECharts | null = null;

    const renderChart = (): void => {
      if (!ringChart.value) return;
      chart = render(ringChart.value, props.pieData, props.seriesName, props.total, props.unit, props.themeAware);
    };

    watch(() => [props.total, props.pieData], renderChart, { deep: true });

    onMounted(() => {
      renderChart();
      if (props.themeAware) {
        window.addEventListener(VISUAL_THEME_CHANGE_EVENT, renderChart as EventListener);
      }
    });

    onBeforeUnmount(() => {
      window.removeEventListener(VISUAL_THEME_CHANGE_EVENT, renderChart as EventListener);
      chart?.dispose();
      chart = null;
    });

    return (): JSX.Element => <div class={[styles.ringChart, "ringChart"]} ref={ringChart} />;
  },
});

export default Ring;
