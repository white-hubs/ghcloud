import { BarChart, PictorialBarChart, PictorialBarSeriesOption } from "echarts/charts";
import {
  TitleComponent,
  TitleComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  LegendComponent,
  LegendComponentOption,
} from "echarts/components";
import * as echarts from "echarts/core";
import { UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import { defineComponent } from "vue";
import { ref, onMounted, computed, watch } from "vue";

import styles from "./bar3D.module.less";

export const Bar3D = defineComponent({
  name: "Bar3D",
  props: {
    colors: { type: Array, required: false, default: () => ["#2981EA"] },
    gridTop: { type: String, required: false, default: "15%" },
    titles: { type: Array, required: false, default: () => [] },
    legendFontSize: { type: Number, required: false, default: 12 },
    xData: { type: Array, required: false, default: () => ["1月", "2月", "3月", "4月", "5月", "6月"] },
    series: { type: Array, required: false, default: () => [] },
    showLegend: { type: Boolean, required: false, default: true },
    xFontSize: { type: Number, required: false, default: 12 },
    calss: { type: String, required: false },
    title: { type: String, required: false, default: "" },
  },
  setup(props, ctx) {
    echarts.use([
      TitleComponent,
      TooltipComponent,
      GridComponent,
      LegendComponent,
      PictorialBarChart,
      CanvasRenderer,
      UniversalTransition,
      BarChart,
    ]);

    type EChartsOption = echarts.ComposeOption<
      TitleComponentOption | TooltipComponentOption | GridComponentOption | LegendComponentOption | PictorialBarSeriesOption
    >;

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
      xFontSize?: number;
      calss?: string;
      title?: string;
    }
    const chartOption = computed(() => {
      const option: EChartsOption = {
        title: {
          text: props.title,
          textStyle: {
            fontSize: 14,
            color: "#fff",
          },
        },
        grid: {
          left: "3%",
          right: "3%",
          bottom: "0%",
          top: props.gridTop,
          containLabel: true,
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
              fontSize: props.xFontSize,
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
        series: caclSeries(),
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

    const caclSeries = () => {
      const res = [];
      props.series.forEach((e: SeriesItf) => {
        res.push({
          z: 0,
          type: "bar",
          barWidth: "20",
          barGap: "2%",
          showBackground: true,
          backgroundStyle: {
            color: "none",
          },
          name: e.name,
          itemStyle: {
            normal: {
              color: {
                type: "linear",
                x: 0,
                x2: 1,
                y: 0,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: "#2989FF",
                  },
                  {
                    offset: 0.5,
                    color: "#0D55AD",
                  },
                  {
                    offset: 0.5,
                    color: "#237dea",
                  },
                  {
                    offset: 1,
                    color: "#237dea",
                  },
                  {
                    offset: 0,
                    color: "#0D55AD",
                  },
                  {
                    offset: 0,
                    color: "#0D55AD",
                  },
                ],
              },
            },
          },
          data: e.data,
        });
        res.push({
          z: 3,
          type: "pictorialBar",
          symbolPosition: "end",
          barGap: "2%",
          data: e.data,
          symbol: "diamond",
          symbolOffset: [0, "-50%"],
          symbolSize: [20, 20 * 0.5],
          itemStyle: {
            normal: {
              borderWidth: 0,
              color: "#2989FF",
            },
          },
        });
      });
      return res;
    };

    const chartDom = ref();
    let myChart;
    const optionRef = ref<EChartsOption>(chartOption.value);

    watch(
      () => [...props.series],
      () => {
        myChart.setOption(chartOption.value);
      },
      { deep: true },
    );

    onMounted(() => {
      myChart = echarts.init(chartDom.value);
      myChart.setOption(optionRef.value);
    });

    return (): JSX.Element => <div class={["chart", props?.calss]} ref={chartDom}></div>;
  },
});

export default Bar3D;
