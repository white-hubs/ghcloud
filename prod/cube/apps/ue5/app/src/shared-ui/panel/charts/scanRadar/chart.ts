import { RadarChart, RadarSeriesOption } from "echarts/charts";
import { TitleComponent, TitleComponentOption, LegendComponent, LegendComponentOption } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([TitleComponent, LegendComponent, RadarChart, CanvasRenderer]);

type EChartsOption = echarts.ComposeOption<TitleComponentOption | LegendComponentOption | RadarSeriesOption>;

const option: EChartsOption = {
  radar: [
    {
      indicator: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      center: ["50%", "50%"],
      radius: 58,
      startAngle: 90,
      splitNumber: 5,
      shape: "circle",
      splitArea: {
        areaStyle: {
          color: ["rgba(41, 137, 255, 1)", "transparent", "transparent", "transparent", "transparent"],
        },
      },
      axisLine: {
        lineStyle: {
          color: "rgba(41, 137, 255, 1)",
        },
      },
      splitLine: {
        lineStyle: {
          color: "rgba(41, 137, 255, 1)",
        },
      },
    },
  ],
};

export function render(dom: HTMLElement): void {
  const chart = echarts.init(dom);
  chart.setOption(option);
}
