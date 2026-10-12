<template>
  <div class="chart" ref="chartDom"></div>
</template>
<script lang="ts" setup>
import {  ref, onMounted, computed, watch } from "vue";
import * as echarts from "echarts/core";
import { LegendComponent } from 'echarts/components';
import { GridComponent, type GridComponentOption, TooltipComponent, TitleComponent } from "echarts/components";
import { LineChart, type LineSeriesOption } from "echarts/charts";
import { UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from 'echarts/charts';
echarts.use([BarChart]);
echarts.use([
  GridComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
  TooltipComponent,
  LegendComponent,
  TitleComponent
]);
type EChartsOption = echarts.ComposeOption<GridComponentOption | LineSeriesOption>;
interface SeriesItf {
  name?: string;
  data?: number[];
  linearGradientColor?: string[];
  smooth?: boolean;
  showSymbol?: boolean;
  lineColor?: string;
  symbolSize?: number;
  type?:string;
}
interface Props {
  gridTop?: string;
  titles?: string[];
  legendFontSize?: number;
  xData?: string[] | number[];
  series?: SeriesItf[];
  showLegend?: boolean;
  title?: string;
  unit?: { x: string, y: string }
  axisPointer?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  gridTop: "20",
  titles: () => [],
  legendFontSize: 12,
  xData: () => ["1月", "2月", "3月", "4月", "5月", "6月"],
  series: () => [],
  showLegend: true,
  title: "",
  unit: () => ({ x: "", y: "" }),
  axisPointer: false
});

const chartOption = computed(() => {
  let option: EChartsOption = {
    title: {
      text: props.title,
      textStyle: {
        color: "#fff",
        fontSize: 12,
      },
    },
    tooltip: {
      trigger: "axis",
      // formatter: function (params) {
      //   //提示内容
      //   let relVal = "报警数量";
      //   relVal +=
      //     "<br/>" +
      //     params[0].marker +
      //     params[0].name +
      //     " : " +
      //     params[0].value.toLocaleString() +
      //     "个";
      //   return relVal;
      // },
    },
    legend: {
      top: 0,
      left: "center",
      show: props.showLegend,
      width: "100%",
      itemHeight: 10,
      data: props.titles,
      textStyle: {
        fontSize: props.legendFontSize, //字体大小
        color: "rgba(51, 51, 51, 1)", //字体颜色
      },
    },
    grid: {
      left: "10px",
      right: "5%",
      bottom: "5%",
      top: props.gridTop + "%",
      containLabel: true,
    },
    xAxis: [
          {
            type: "category",
            name: props.unit.x,
            nameLocation: 'end',
            nameTextStyle: {
              fontSize: 12,
              verticalAlign: 'middle',
              align: 'left',
              padding: [0, 5, 0, 0]
            },
            boundaryGap: false,
            // axisLabel: {
            //   rotate: 30,
            //   color: "rgba(134, 144, 156, 1)", //x轴字体颜色
            //   textStyle: {
            //     fontSize: 12,
            //   },
            // },
            axisTick: {
              show: false,
            },
            data: props.xData,
          },
        ],
        yAxis: [
          {
            minInterval : 1,
            type: 'value',
            name: props.unit.y,
            padding: 5,
            splitLine: {
              show: true,
              lineStyle: {
                color: "#F2F3F5",
                type: "dashed",
              },
            },
            axisLabel: {
              color: "rgba(134, 144, 156, 1)", //x轴字体颜色
              textStyle: {
                fontSize: 12,
              },
            },
            axisTick: {
              show: false,
            },
          },
        ],
    series: props.series.map((e: SeriesItf, i) => {
      let item: LineSeriesOption | any = {
        name: e.name || null,
        type: e.type?e.type:"line",
        symbol: "circle",
        smooth: e.smooth === undefined ? true : e.smooth,
        showSymbol: e.showSymbol,
        symbolSize: 5.5,
        data: e.data,
        lineStyle: {
          width: 1.5,
        },
        itemStyle: {
          normal: {
            color: e.lineColor
          },
        },
      };
      if (e.linearGradientColor && e.linearGradientColor.length == 2) {
        //设置了渐变色
        item.areaStyle = {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: e.linearGradientColor[0],
            },
            {
              offset: 1,
              color: e.linearGradientColor[1],
            },
          ]),
        };
      }
      return item;
    }),
  };
  return option;
});
watch(
  () => [...props.series],
  () => {

    myChart = echarts.init(chartDom.value);
    myChart.setOption(chartOption.value);

  }, { deep: true }
);
watch(
  () => props.unit,
  () => {
    myChart = echarts.init(chartDom.value);
    myChart.setOption(chartOption.value);

  }, { deep: true }
);
const render = () => {
  myChart.dispose();
  myChart = echarts.init(chartDom.value);
  myChart.setOption(chartOption.value);
}
const setOption = () => {
    myChart = echarts.init(chartDom.value);
    myChart.setOption(chartOption.value);
}
defineExpose({
  render,
  setOption
})
const chartDom = ref();
let myChart;
const optionRef = ref<EChartsOption>(chartOption.value);
onMounted(() => {
  myChart = echarts.init(chartDom.value);
  myChart.setOption(optionRef.value);
});
</script>
<style lang="less" scoped>
.chart {
  width: 100%;
  min-height: 180px;
  padding: 10px 0;
  height: 100%;
}
</style>
