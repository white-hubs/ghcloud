import { LineChart, BarChart } from "echarts/charts";
import { LegendComponent, TitleComponent, TitleComponentOption, TooltipComponent, GridComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { defineComponent } from "vue";
import { nextTick, watch, onMounted, ref, PropType } from "vue";

import styles from "./lineAndPillar-charts.module.less";
echarts.use([BarChart, LineChart, LegendComponent, TooltipComponent, TitleComponent, GridComponent]);

export const LineAndPillarCharts = defineComponent({
  name: "LineAndPillarCharts",
  props: {
    xData: {
      type: [] as any,
      required: true,
    },
    yData: {
      type: [] as any,
      required: true,
    },
    legend: {
      type: [] as any,
      required: true,
    },
    unit: {
      type: Object as PropType<{ x: string; y: string }>,
      default: { x: "", y: "" },
    },
  },
  setup(props, ctx) {
    const linePillar = ref<HTMLElement | null>(null);
    nextTick(() => {
      // 2. 容器
      const container = linePillar.value as HTMLElement;
      if (container) initChart(container);
    });
    // 3. 初始化 echarts 实例, 将配置添加给 echarts 实例
    let myChart: echarts.ECharts | null = null;
    const initChart = (container?: HTMLElement) => {
      if (!myChart) myChart = echarts.init(container as HTMLElement);
      myChart.setOption(setOption());
    };

    watch(
      () => [...props.xData],
      (newVal) => {
        initChart(linePillar.value);
      },
    );
    function setOption() {
      let option = {
        tooltip: {
          trigger: "axis",
          formatter: "{b} <br/>{a} : {c}",
        },
        grid: {
          left: 0,
          right: 0,
          bottom: 0,
          top: "15%",
          containLabel: true,
        },
        legend: {
          show: false,
          data: props.legend,
        },
        xAxis: [
          {
            type: "category",
            data: props.xData,
            axisPointer: {
              type: "shadow",
            },
            axisLine: {
              lineStyle: {
                color: "#fff",
              },
            },
          },
        ],
        yAxis: [
          {
            type: "value",
            name: props.unit.y,
            nameTextStyle: {
              fontSize: 12,
              color: "#ffffff",
              fontWeight: 300,
              verticalAlign: "middle",
            },
            axisLabel: {
              //y轴文字的配置
              textStyle: {
                color: "#fff",
              },
            },
          },
          {
            type: "value",
            name: "Temperature",
            show: false,
            axisLabel: {
              //y轴文字的配置
              textStyle: {
                color: "#fff",
              },
            },
          },
        ],
        series: [
          {
            name: props.legend[0],
            type: "bar",
            data: props.yData,
          },
          {
            name: props.legend[1],
            type: "line",
            yAxisIndex: 1,
            data: props.yData,
          },
        ],
      };
      return option;
    }
    onMounted(() => {
      initChart(linePillar.value);
    });

    return (): JSX.Element => <div class="power-factor" ref={linePillar}></div>;
  },
});

export default LineAndPillarCharts;
