import { BarChart, BarSeriesOption } from "echarts/charts";
import {
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  LegendComponent,
  LegendComponentOption,
} from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([TooltipComponent, GridComponent, LegendComponent, BarChart, CanvasRenderer]);

type EChartsOption = echarts.ComposeOption<TooltipComponentOption | GridComponentOption | LegendComponentOption | BarSeriesOption>;

function getOption(yData: string[], xData: { name: string; value: number[] }[]): EChartsOption {
  const option: EChartsOption = {
    legend: {
      show: false,
    },
    grid: {
      left: "0%",
      right: "5%",
      bottom: "0",
      top: "0",
      containLabel: true,
    },
    xAxis: {
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
        showMaxLabel: true,
        show: true,
        color: "#ffffff",
        fontSize: 12,
        fontWeight: 300,
      },
    },
    yAxis: {
      type: "category",
      axisLabel: {
        show: true,
        color: "#ffffff",
        fontSize: 12,
        fontWeight: 300,
      },
      data: yData,
    },
    series: xData.map((e) => {
      return {
        name: e.name,
        type: "bar",
        stack: "total",
        label: {
          show: true,
        },
        emphasis: {
          focus: "series",
        },
        barWidth: 15, // 柱图宽度
        data: e.value,
        // itemStyle: {
        // 	normal: {
        // 		label: {
        // 			show: true, //开启显示
        // 			position: 'right', //在上方显示
        // 			textStyle: { //数值样式
        // 				color: 'white',
        // 				fontSize: 12
        // 			}
        // 		}
        // 	}
        // }
      };
    }),
  };
  return option;
}
export function render(dom: HTMLElement, yData: string[], xData: { name: string; value: number[] }[]) {
  const option = getOption(yData, xData);
  const chart = echarts.init(dom);
  chart.setOption(option);
}
