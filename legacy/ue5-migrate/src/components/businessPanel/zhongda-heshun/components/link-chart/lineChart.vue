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
  legendFontSize: calcFontSize(16),
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
        fontSize: calcFontSize(16),
      },
    },
    tooltip: { 
      trigger: "axis",
      backgroundColor: 'rgba(3, 11, 27, 0.70)', 
			borderColor: 'rgba(3, 11, 27, 0.70)', 
			textStyle: {  
					color: 'white',  
			},
      formatter: function (params) {
        var result = "";
        const size_dot = calcFontSize(10);
        const size_text = calcFontSize(16);
        var dotHtml =
          `<div style="display:inline-block;margin-right:5px;border-radius:${size_dot}px;width:${size_dot}px;height:${size_dot}px;background-color:${params[0].color}"></div>`; // 定义第一个数据前的圆点颜色
        result += `<span style="font-size:${size_text}px">`+params[0].axisValue + "</span> <br/>"  +`<div style="display:flex;justify-content: space-between;align-items: center;font-size:${size_text}px">${dotHtml} <span>${params[0].data+props.unit.y }</span></div>`;
        return result;
      },
    },
    legend: {
      top: 0,
      left: "center",
      show: props.showLegend,
      width: "100%",
      itemHeight: 10,
      data: props.titles,
      textStyle: {
        fontSize: calcFontSize(props.legendFontSize), //字体大小
        color: "#D0DEEE", //字体颜色
      },
    },
    grid: {
      left: "7%",
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
          fontSize: calcFontSize(16),
          fontWeight: 500
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
          fontSize: calcFontSize(16),
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
          fontSize: calcFontSize(16),
          color: "#ffffff",
          fontWeight: 500,
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
          fontSize: calcFontSize(16),
          fontWeight: 500
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
  if(chartDom.value){
    myChart = echarts.init(chartDom.value);
    myChart.setOption(chartOption.value);
  }
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
  height: 100%;
}
</style>
