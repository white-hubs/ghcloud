import { defineComponent, ref, watch } from "vue";
import { CountTo as VueCountTo } from "vue3-count-to";

import "./count-to.module.less";

export const CountTo = defineComponent({
  name: "CountTo",
  props: {
    startVal: { type: Number, default: 0 },
    endVal: { type: Number, default: 0 },
    duration: { type: Number, default: 2000 },
    separator: { type: String, default: "," },
    decimals: { type: [String, Number], default: 0 },
  },
  setup(props) {
    const startVal = ref(props.startVal ?? 0);

    watch(
      () => props.endVal,
      () => {
        setTimeout(() => {
          startVal.value = props.endVal ?? 0;
        }, props.duration);
      },
      { immediate: true },
    );

    return (): JSX.Element => (
      <VueCountTo
        startVal={props.startVal ?? 0}
        endVal={props.endVal ?? 0}
        duration={props.duration ?? 2000}
        separator={props.separator ?? ","}
        decimals={props.decimals ?? 0}
        class="gh-count-to"
      />
    );
  },
});

export default CountTo;
