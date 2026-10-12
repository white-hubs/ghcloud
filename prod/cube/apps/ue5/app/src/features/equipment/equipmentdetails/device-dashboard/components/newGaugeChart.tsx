import * as echarts from "echarts";
import { defineComponent, onMounted, ref, watch } from "vue";

import styles from "./newGaugeChart.module.less";
export default defineComponent({
  props: {
    unit: {
      type: String,
      default: "",
    },
    data: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    title: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const gaugeChart = ref(null);
    const setOptions = () => {
      let myChart = echarts.init(gaugeChart.value);
      myChart.clear();
      myChart.setOption({
        tooltip: {
          confine: true,
          formatter: `${props.title}<br/>{b} : {c}${props.unit}`,
        },
        series: [
          {
            type: "gauge",
            max: props.max,
            radius: "100%",
            pointer: {
              itemStyle: {
                color: "auto",
              },
            },
            axisLabel: {
              color: "#B7C1CE",
              fontSize: 8,
            },
            axisTick: {
              show: true,
              distance: 2,
              lineStyle: {
                color: "#B7C1CE",
                width: 1,
              },
            },
            splitLine: {
              show: true,
              distance: 2,
              lineStyle: {
                color: "#B7C1CE",
              },
            },
            detail: {
              valueAnimation: true,
              formatter: "{value}",
              fontSize: 20,
              offsetCenter: [0, "60%"],
            },
            axisLine: {
              show: true,
              lineStyle: {
                width: 10,
                shadowBlur: 0,
                color: [
                  [0.3, "#64D040"],
                  [0.7, "#FDAD30"],
                  [1, "#FF625D"],
                ],
              },
            },
            data: [
              {
                value: props.data,
              },
            ],
          },
        ],
      });
    };
    onMounted(() => {
      setOptions();
    });
    watch(
      () => props.data,
      (val) => {
        setOptions();
      },
    );
    return {
      gaugeChart,
    };
  },
});
