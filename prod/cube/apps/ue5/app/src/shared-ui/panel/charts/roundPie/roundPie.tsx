import { defineComponent, nextTick, onMounted, ref, watch } from "vue";

import { render } from "./chart";

import styles from "./roundPie.module.less";

export const RoundPie = defineComponent({
  name: "RoundPie",
  props: {
    data: { type: Array, required: true },
    eventNum: { type: Number, required: false },
  },
  setup(props, { slots }) {
    const chartDom = ref<HTMLElement>();

    const updateChart = (): void => {
      if (!chartDom.value) {
        return;
      }
      render(chartDom.value, props.data as { value: number; label: string; color: string }[]);
    };

    watch(
      () => props.data,
      () => {
        nextTick(updateChart);
      },
      { deep: true },
    );

    onMounted(() => {
      nextTick(updateChart);
    });

    return (): JSX.Element => (
      <div class={props.eventNum !== undefined ? styles["pie-box1"] : styles["pie-box"]}>
        <div class={styles.chart} ref={chartDom} />
        <div class={styles.content}>{slots.default?.()}</div>
      </div>
    );
  },
});

export default RoundPie;
