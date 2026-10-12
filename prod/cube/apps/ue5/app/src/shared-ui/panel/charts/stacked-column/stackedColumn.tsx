import { LineChart, PictorialBarChart, BarChart } from "echarts/charts";
import { LegendComponent, TitleComponent, TooltipComponent, GridComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { defineComponent } from "vue";
import { nextTick, watch, onMounted, ref, reactive } from "vue";

import { resolveChartSeriesName } from "@/infrastructure/utils/resolve-chart-series-name";

import styles from "./stackedColumn.module.less";
echarts.use([LegendComponent, TooltipComponent, TitleComponent, GridComponent, PictorialBarChart, LineChart, BarChart]);

export const StackedColumn = defineComponent({
  name: "StackedColumn",
  props: {
    // title: {
    //   type: String,
    //   required: true,
    // },
    xData: {
      type: [] as any,
      required: true,
    },
    yData: {
      type: [] as any,
      required: true,
    },
    unit: {
      type: String,
      default: "",
    },
    // smooth: {
    //   type: Number,
    // },
    // color: {
    //   type: Array,
    // },
  },
  setup(props, ctx) {
    const powerFactorRef = ref<HTMLElement | null>(null);
    void ctx;

    const readThemeColor = (token: string, fallback: string): string => {
      if (typeof window === "undefined") return fallback;
      const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
      return value || fallback;
    };

    nextTick(() => {
      const container = powerFactorRef.value as HTMLElement;
      if (container) initChart(container);
    });
    let myChart: echarts.ECharts | null = null;
    const initChart = (container?: HTMLElement) => {
      if (!container) return;
      if (!myChart) myChart = echarts.init(container);
      myChart.setOption(setOption());
    };

    watch(
      () => [props.xData, props.yData, props.unit],
      () => {
        initChart(powerFactorRef.value || undefined);
      },
      { deep: true },
    );
    const setOption = () => {
      const labelColor = readThemeColor("--visual-chart-label-color", "#ffffff");
      const axisColor = readThemeColor("--visual-chart-axis-color", "#ffffff");
      const series = props.yData.map((item) => {
        return {
          name: item.name,
          type: "bar",
          data: item.data,
          stack: "Ad",
          emphasis: {
            focus: "series",
          },
          barMaxWidth: "40",
        };
      });
      const option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: function (params) {
            var relVal = params[0].name;
            for (var i = 0, l = params.length; i < l; i++) {
              const value = params[i].value ? params[i].value : "0";
              const name = resolveChartSeriesName(params[i].seriesName, { index: i, fallback: "数值" });
              relVal += "<br/>" + params[i].marker + name + value + props.unit;
            }
            return relVal;
          },
        },
        legend: {
          show: true,
          bottom: 0,
          left: "center",
          itemWidth: 12,
          itemHeight: 8,
          textStyle: {
            color: labelColor,
            fontSize: 12,
          },
        },
        grid: {
          top: props.unit ? 28 : 12,
          left: 8,
          right: 12,
          bottom: 36,
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            data: props.xData,
            splitLine: {
              color: ["rgba(255,255,255,0.3)"],
            },
            axisLabel: {
              show: true,
              color: axisColor,
              fontSize: 12,
              fontWeight: 300,
              formatter: function (value: string) {
                if (String(value).length > 2) {
                  return `${String(value).slice(0, 2)}...`;
                }
                return value;
              },
            },
          },
        ],
        yAxis: [
          {
            type: "value",
            name: props.unit || "",
            nameTextStyle: {
              color: labelColor,
              fontSize: 12,
              padding: [0, 0, 0, 8],
            },
            axisLabel: {
              show: true,
              color: axisColor,
              fontSize: 12,
              fontWeight: 300,
              formatter: (value: number) => (props.unit ? `${value}${props.unit}` : String(value)),
            },
          },
        ],
        series,
      };
      return option;
    };
    onMounted(() => {
      initChart(powerFactorRef.value || undefined);
    });

    return (): JSX.Element => <div class="power-factor" ref={powerFactorRef}></div>;
  },
});

export default StackedColumn;
