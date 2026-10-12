import { defineComponent } from "vue";
import { ref, onMounted, watch } from "vue";

import { render } from "./chart";

import styles from "./stack-bar-common.module.less";

export const StackBarCommon = defineComponent({
  name: "StackBarCommon",
  props: {
    yData: { type: Array, required: true },
    xData: { type: Array, required: true },
  },
  setup(props, ctx) {
    const charDom = ref();
    watch(
      () => [...props.yData],
      () => {
        if (charDom.value) {
          render(charDom.value, props.xData, props.yData);
        }
      },
      { deep: true },
    );

    onMounted(() => {
      if (charDom.value) {
        render(charDom.value, props.xData, props.yData);
      }
    });

    return (): JSX.Element => <div class="char-dom" ref={charDom}></div>;
  },
});

export default StackBarCommon;
