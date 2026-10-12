import { defineComponent } from "vue";
import { withDefaults, ref, onMounted, onBeforeUnmount, watch, onUnmounted } from "vue";

import { render } from "./chart";

import "./ratePie.module.less";

export const RatePie = defineComponent({
  name: "RatePie",
  props: {
    value: { type: Number, required: true, default: 50 },
    title: { type: [String, null], required: false, default: null },
    color: { type: String, required: false, default: "#2989FF" },
  },
  setup(props, ctx) {
    interface Props {
      value: number;
      title?: string | null;
      color?: string;
    }
    const chartDom = ref();
    const timer: any = ref(null);
    watch(
      () => props.value,
      (newVal) => {
        window.clearInterval(timer.value);
        setTimeout(() => {
          timer.value = render(chartDom.value, newVal, props.color);
        }, 200);
      },
    );
    onMounted(() => {
      timer.value = render(chartDom.value, props.value, props.color);
    });
    onUnmounted(() => {
      clearInterval(timer.value);
      timer.value = null;
    });

    return (): JSX.Element => (
      <div class="box">
        <div class="chart" ref={chartDom}></div>
        {props.title && <p class="title">{props.title}</p>}
      </div>
    );
  },
});

export default RatePie;
