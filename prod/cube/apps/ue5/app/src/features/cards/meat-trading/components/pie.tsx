import * as echarts from "echarts";
import { defineComponent } from "vue";
import { onMounted, ref, watch } from "vue";

import styles from "./pie.module.less";

export const Pie = defineComponent({
  name: "Pie",
  props: {
    title: { type: String, required: true, default: "" },
    colorLsit: { type: Array, required: true, default: () => ["rgba(41,137,255,0)", "#2989FF"] },
    data: { type: Array, required: true, default: () => [] },
    xData: { type: null, required: true, default: () => [] },
    unit: { type: String, required: false, default: "" },
  },
  setup(props, ctx) {
    const powerFactorRef = ref();

    const render = () => {
      const option: any = {
        tooltip: {
          trigger: "item",
          formatter: function (param) {
            return param.name + ":" + param.value;
          },
          position(point, params, dom, rect, size) {
            var obj = { top: 60 };
            obj[["left", "right"][+(point[0] < size.viewSize[0] / 2)]] = 5;
            return obj;
          },
        },
        legend: {
          x: "center",
          y: "bottom",
          data: ["rose3", "rose5", "rose6", "rose7", "rose8"],
        },
        calculable: true,
        series: props.data,
      };
      const myChart = echarts.init(powerFactorRef.value);
      option && myChart.setOption(option);
    };
    watch(
      () => props.xData,
      () => {
        render();
      },
    );
    watch(
      () => [...props.data],
      () => {
        render();
      },
    );

    onMounted(() => {
      render();
    });

    return (): JSX.Element => <div ref={powerFactorRef} class="power-factor" />;
  },
});

export default Pie;
