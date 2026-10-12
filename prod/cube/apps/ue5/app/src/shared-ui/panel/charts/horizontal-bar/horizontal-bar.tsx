import { defineComponent } from "vue";
import { ref, onMounted, watch } from "vue";

import { render } from "./chart";

import styles from "./horizontal-bar.module.less";

export const HorizontalBar = defineComponent({
  name: "HorizontalBar",
  props: {
    yData: { type: Array, required: true },
    xData: { type: Array, required: true },
  },
  setup(props, ctx) {
    const charDom = ref();
    watch(
      () => [...props.xData],
      () => {
        if (charDom.value) {
          render(charDom.value, props.yData, props.xData);
        }
      },
      { deep: true },
    );

    onMounted(() => {
      if (charDom.value) {
        render(charDom.value, props.yData, props.xData);
      }
    });

    return (): JSX.Element => <div class="char-dom" ref={charDom}></div>;
  },
});

export default HorizontalBar;
