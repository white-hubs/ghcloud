import { defineComponent, ref, onMounted, nextTick } from "vue";

import { render } from "./chart";
import { getOption, PieData } from "./option";

import styles from "./pie3D.module.less";
import "echarts-gl";

export const Pie3D = defineComponent({
  name: "Pie3D",
  props: {
    dataValue: { type: Array, required: true, default: () => [] },
    internalDiameterRatio: { type: Number, default: 0.8 },
    autoRotate: { type: Boolean, default: false },
  },
  setup(props) {
    const pieRef = ref<HTMLElement>();
    onMounted(() => {
      nextTick(() => {
        render(pieRef.value, getOption(props.dataValue as PieData[], props.internalDiameterRatio, props.autoRotate));
      });
    });

    return (): JSX.Element => <div class="pie" ref={pieRef}></div>;
  },
});

export default Pie3D;
