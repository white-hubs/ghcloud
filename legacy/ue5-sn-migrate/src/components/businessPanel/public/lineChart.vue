<template>
  <div class="chart" ref="chartDom"></div>
</template>
<script lang="ts" setup>
import {  ref, onMounted, watch, onBeforeUnmount } from "vue";
import * as echarts from "echarts/core";
import { LegendComponent } from 'echarts/components';
import { GridComponent, GridComponentOption, TooltipComponent, TitleComponent } from "echarts/components";
import { LineChart, LineSeriesOption } from "echarts/charts";
import { UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from 'echarts/charts';
import { calcFontSize } from "@/utils/common";

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
  colors?: string[];
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
  colors: () => ["#568EFF", "#78FCFC", "#FFC700", "#F14545"],
  gridTop: "20",
  titles: () => [],
  legendFontSize: calcFontSize(12),
  xData: () => ["1月", "2月", "3月", "4月", "5月", "6月"],
  series: () => [],
  showLegend: true,
  title: "",
  unit: () => ({ x: "", y: "" }),
  axisPointer: false
});

const chartOption = ref<EChartsOption>();
const getChartOption = () => {
  let option: EChartsOption = {
    title: {
      text: props.title,
      textStyle: {
        color: "#fff",
        fontSize: calcFontSize(12),
      },
    },
    tooltip: { 
      trigger: "axis",
      backgroundColor: 'rgba(3, 11, 27, 0.70)', 
			borderColor: 'rgba(3, 11, 27, 0.70)', 
			textStyle: {  
					color: 'white',  
			},
    },
    legend: {
      top: 0,
      left: "center",
      show: props.showLegend,
      width: "100%",
      itemHeight: 2,
      itemWidth: 10,
      data: props.titles,
      icon:'rect',
      textStyle: {
        fontSize: calcFontSize(props.legendFontSize), //字体大小
        color: "#D0DEEE", //字体颜色
      },
    },
    grid: {
      left: "5%",
      right: "5%",
      bottom: "0%",
      top: props.gridTop + "%",
      containLabel: true,
    },
    color: props.colors,
    xAxis: [
      {
        type: "category",
        boundaryGap: true,
        data: props.xData,
        axisLabel: {
          interval: "auto",
          showMaxLabel: true,
          show: true,
          color: "#ffffff",
          fontSize: calcFontSize(12),
          fontWeight: 300
        },
        axisLine: {
                show: true,
                lineStyle: {
                    color: "#fff",
                    width: 0,
                }
            },
        name: props.unit.x,
        nameLocation: 'end',
        nameTextStyle: {
          fontSize: calcFontSize(12),
          verticalAlign: 'middle',
          align: 'right',
          padding: [0, 5, 0, 0]
        },
        animationEasing: 'cubicOut'
      },
    ],
    yAxis: [
      {
        minInterval : 1,
        type: 'value',
        name: props.unit.y,
        nameTextStyle: {
          fontSize: calcFontSize(12),
          color: "#ffffff",
          fontWeight: 300,
          verticalAlign: 'middle',
          align: 'right',
          padding: [0, 0, 0, 5],
        },
        splitLine: {
          lineStyle: {
            type: "dashed", //虚线
            color: ["rgba(255,255,255,0.15)"],
            width: 1,
          },
          show: true, //隐藏
        },
        axisLabel: {
          show: true,
          color: "#ffffff",
          fontSize: calcFontSize(12),
          fontWeight: 300
        },
        animationEasing: 'cubicOut'
      },
    ],
    series: props.series.map((e: SeriesItf) => {
      let item: LineSeriesOption | any = {
        name: e.name || null,
        type: e.type?e.type:"line",
        symbol: "circle",
        label: {
          normal: {
          show: e.showSymbol,
          position: 'top',
          color: '#fff',
          fontWeight: 'bold',
          formatter: function (params) {
            if (params.dataIndex === ( e.data.length - 1)) {
                return '预测'
                }
                return ''
            },
          },
        },
        smooth: e.smooth === undefined ? true : e.smooth,
        showSymbol: e.showSymbol,
        symbolSize: 5.5,
        data: e.data,
        lineStyle: {
          width: 1.5,
          color: e.lineColor,
        },
        itemStyle: {
          normal: {
            color: e.lineColor || e.linearGradientColor?e.linearGradientColor[0]:'',
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
}
watch(
  () => [...props.xData],
  () => {
    render()
  }, { deep: true }
);
watch(
  () => props.unit,
  () => {
    render()
  }, { deep: true }
);
const render = () => {
  myChart && myChart.dispose();
  chartOption.value = getChartOption();
  myChart = echarts.init(chartDom.value);
  myChart.setOption(chartOption.value);
}
defineExpose({
  render
})
const chartDom = ref();
let myChart;
const optionRef = ref<EChartsOption>(chartOption.value);
const resize = ()=>{
  setTimeout(() => {
    render()
  }, 1500);
}
onMounted(() => {
  render()
  window.addEventListener("resize", resize);
});
onBeforeUnmount(()=>{
  window.removeEventListener('resize',resize)
})
</script>
<style lang="less" scoped>
.chart {
  width: 100%;
  min-height: 180px;
  padding: 10px 0;
  height: 100%;
}
</style>
