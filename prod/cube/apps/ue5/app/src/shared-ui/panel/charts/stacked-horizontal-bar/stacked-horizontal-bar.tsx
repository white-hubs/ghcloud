import { defineComponent } from "vue";
import { ref, onMounted, watch } from "vue";

import { render } from "./chart";

import styles from "./stacked-horizontal-bar.module.less";

export const StackedHorizontalBar = defineComponent({
  name: "StackedHorizontalBar",
  props: {
    yData: { type: Array, required: true },
    xData: { type: Array, required: true },
  },
  setup(props, ctx) {
    const charDom = ref();
    onMounted(() => {
      if (charDom.value) {
        render(charDom.value, props.yData, props.xData);
      }
    });

    return (): JSX.Element => <div class="char-dom" ref={charDom}></div>;
  },
});

export default StackedHorizontalBar;
