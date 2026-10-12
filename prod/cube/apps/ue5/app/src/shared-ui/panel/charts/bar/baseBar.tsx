import { BarChart, BarSeriesOption } from "echarts/charts";
import { GridComponent, GridComponentOption, TooltipComponent, LegendComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { defineComponent } from "vue";
import { withDefaults, ref, onMounted, computed, watch } from "vue";

import { resolveChartSeriesName } from "@/infrastructure/utils/resolve-chart-series-name";

import styles from "./baseBar.module.less";

export const BaseBar = defineComponent({
  name: "BaseBar",
  props: {
    colors: { type: Array, required: false, default: () => ["#2981EA"] },
    gridTop: { type: String, required: false, default: "15%" },
    titles: { type: Array, required: false, default: () => [] },
    legendFontSize: { type: Number, required: false, default: 12 },
    xData: { type: Array, required: false, default: () => ["1月", "2月", "3月", "4月", "5月", "6月"] },
    series: { type: Array, required: false, default: () => [] },
    showLegend: { type: Boolean, required: false, default: true },
  },
  setup(props, ctx) {
    echarts.use([GridComponent, BarChart, CanvasRenderer, TooltipComponent, LegendComponent]);

    type EChartsOption = echarts.ComposeOption<GridComponentOption | BarSeriesOption>;

    interface SeriesItf {
      name?: string;
      data?: number[];
      linearGradientColor?: string[];
      showSymbol?: boolean;
    }
    interface Props {
      colors?: string[];
      gridTop?: string;
      titles?: string[];
      legendFontSize?: number;
      xData?: string[];
      series?: SeriesItf[];
      showLegend?: boolean;
    }
    const chartOption = computed(() => {
      let option: EChartsOption = {
        grid: {
          left: "3%",
          right: "3%",
          bottom: "0%",
          top: props.gridTop,
          containLabel: true,
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        color: props.colors,
        xAxis: [
          {
            type: "category",
            boundaryGap: true,
            data: props.xData,
            axisLabel: {
              show: true,
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 300,
            },
          },
        ],
        yAxis: [
          {
            type: "value",
            splitLine: {
              lineStyle: {
                type: "dashed", //虚线
                color: ["rgba(255,255,255,0.3)"],
                width: 1,
              },
              show: true, //隐藏
            },
            axisLabel: {
              show: true,
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 300,
            },
          },
        ],
        series: props.series.map((e: SeriesItf, index: number) => {
          let item: BarSeriesOption = {
            name: resolveChartSeriesName(e.name, { index, titles: props.titles as string[] }),
            type: "bar",
            data: e.data,
            barWidth: 15,
            label: {
              color: "#ffffff",
              show: true,
              position: "top",
            },
          };
          return item;
        }),
      };
      if (props.showLegend) {
        option.legend = {
          icon: "rect",
          itemWidth: 10,
          itemHeight: 10,
          data: props.series.map((e: SeriesItf) => {
            return e.name || "";
          }),
          textStyle: {
            fontSize: props.legendFontSize, //字体大小
            color: "#D0DEEE", //字体颜色
          },
        };
      }
      return option;
    });

    const chartDom = ref();
    let myChart;
    const optionRef = ref<EChartsOption>(chartOption.value);
    const render = () => {
      myChart = echarts.init(chartDom.value);
      myChart.setOption(optionRef.value);
    };
    onMounted(() => {
      render();
    });
    watch(
      () => [...props.xData],
      () => {
        render();
      },
    );

    return (): JSX.Element => <div class="chart" ref={chartDom}></div>;
  },
});

export default BaseBar;
