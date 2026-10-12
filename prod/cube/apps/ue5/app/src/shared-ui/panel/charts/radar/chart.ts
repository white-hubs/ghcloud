import { RadarChart, RadarSeriesOption } from "echarts/charts";
import { TitleComponent, TitleComponentOption, LegendComponent, LegendComponentOption, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([TitleComponent, LegendComponent, RadarChart, CanvasRenderer, TooltipComponent]);

type EChartsOption = echarts.ComposeOption<TitleComponentOption | LegendComponentOption | RadarSeriesOption>;

const getChartOption = (titles: string[], radarData: number[], maxRadarData: number[], lineColor: string, dataColor: string) => {
  // let maxValue = getRadarDataMaxValue(radarData);
  let option: EChartsOption = {
    tooltip: {
      trigger: "item",
      extraCssText: "width: 144px;height: 130px;background: rgba(40,73,138,0.8);border-radius: 6px 6px 6px 6px;border:0",
      formatter: function (params) {
        let domStr = "";
        for (let index = 0; index < titles.length; index++) {
          domStr += `
          <div style='display:flex;align-items: center;justify-content: space-between;height:23px'>
            <span style='color:white;margin:0;'>${titles[index]}</span>
            <span style='color:white;margin:0;'>${params.value[index] ?? 0}</span>
          </div>
          `;
        }
        return domStr;
      },
    },
    color: ["rgba(50, 139, 247)"],
    radar: {
      center: ["50%", "44%"], // 外圆的位置
      radius: "34",
      // shape: 'circle',
      formatter: function (value) {
        return 1111;
      },
      indicator: titles.map((e, index) => {
        return { name: e, max: maxRadarData[index] };
      }),
      axisName: {
        color: "rgba(217, 231, 255, 1)",
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ["rgba(41, 137, 255, 0.1)"],
        },
      },
      axisLine: {
        // 指向外圈文本的分隔线样式
        lineStyle: {
          color: lineColor ? lineColor : "rgba(50, 139, 247, 0.60)",
        },
      },
      splitLine: {
        lineStyle: {
          type: "solid",
          color: lineColor ? lineColor : "rgba(50, 139, 247, 0.60)", // 分隔线颜色
          width: 1, // 分隔线线宽
        },
      },
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: radarData,
            areaStyle: {
              color: dataColor ? dataColor : "rgba(41, 137, 255, 1)",
            },
            symbol: "none",
          },
        ],
      },
    ],
  };
  return option;
};

const getRadarDataMaxValue = (radarData: number[]) => {
  return radarData.reduce((a, b) => (a > b ? a : b));
};

export function render(
  dom: HTMLElement | undefined | null,
  titles: string[],
  radarData: number[],
  maxRadarData: number[],
  lineColor: string,
  dataColor: string,
): void {
  if (!dom) {
    return;
  }
  let chartOption = getChartOption(titles, radarData, maxRadarData, lineColor, dataColor);
  const chart = echarts.init(dom);
  chart.setOption(chartOption);
}
