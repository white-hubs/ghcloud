import { init } from "echarts";
import { LegendComponent, TitleComponent, TooltipComponent, GridComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { defineComponent } from "vue";
import { nextTick, watch, onMounted, ref, reactive } from "vue";

import styles from "./thermodynamics.module.less";
echarts.use([LegendComponent, TooltipComponent, TitleComponent, GridComponent]);

export const Thermodynamics = defineComponent({
  name: "Thermodynamics",
  props: {
    xData: {
      type: [] as any,
      required: true,
    },
    yData: {
      type: [] as any,
      required: true,
    },
    data: {
      type: [] as any,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    pieces: {
      type: [] as any,
      default: [
        {
          value: 0,
          label: "可预定",
        },
        {
          value: 1,
          label: "不可预定",
        },
        {
          value: 2,
          label: "已预定",
        },
      ],
    },
    color: {
      type: Array,
      default: () => ["#fff", "rgba(170, 170, 170, 1)", "rgba(201, 228, 180, 1)"],
    },
  },
  setup(props, ctx) {
    const powerFactorRef = ref<HTMLElement | null>(null);

    nextTick(() => {
      // 2. 容器
      const container = powerFactorRef.value as HTMLElement;
      if (container) initChart(container);
    });
    // 3. 初始化 echarts 实例, 将配置添加给 echarts 实例
    let myChart: echarts.ECharts | null = null;
    const initChart = (container?: HTMLElement) => {
      if (!myChart) myChart = init(container as HTMLElement);
      myChart.setOption(setOption());
    };

    watch(
      () => [...props.xData],
      (newVal) => {
        initChart(powerFactorRef.value);
      },
    );
    const setOption = () => {
      const option = {
        title: {
          text: props.title,
          textStyle: {
            color: "black",
            fontWeight: "bolder",
            fontSize: 20,
          },
          left: "center",
          top: "0%",
        },
        tooltip: {
          trigger: "item",
          formatter: function (params) {
            const obj = {
              0: "可预定",
              1: "不可预定",
              2: "已预订",
            };
            var relVal = params.name;
            relVal += "<br/>" + params.marker + obj[params.value[2]];
            return relVal;
          },
          position: function (point, params, dom, rect, size) {
            let x = point[0] + 10; // x 轴偏移量为 10
            let y = point[1] + 20; // y 轴偏移量为 10
            if (x + dom.offsetWidth > size.viewSize[0]) {
              x = size.viewSize[0] - dom.offsetWidth;
            }
            if (y + dom.offsetHeight > size.viewSize[1]) {
              y = size.viewSize[1] - dom.offsetHeight;
            }
            return [x, y];
          },
        },
        grid: {
          top: "3%",
          bottom: "20%",
          left: "20%",
          right: "0%",
        },
        xAxis: {
          type: "category",
          data: props.xData,
          splitArea: {
            show: true,
          },
        },
        yAxis: {
          type: "category",
          data: props.yData,
          splitArea: {
            show: true,
          },
        },
        visualMap: {
          type: "piecewise",
          min: 0,
          max: 3,
          calculable: true,
          orient: "horizontal",
          left: "center",
          bottom: "0%",
          precision: 0,
          inRange: {
            color: props.color,
          },
          pieces: props.pieces,
          textStyle: {
            color: "#ffffff",
          },
        },
        series: props.data,
      };
      return option;
    };
    onMounted(() => {
      initChart(powerFactorRef.value);
    });

    return (): JSX.Element => <div class="power-factor" ref={powerFactorRef}></div>;
  },
});

export default Thermodynamics;
