import { PieChart, PieSeriesOption } from "echarts/charts";
import { TooltipComponent, TooltipComponentOption, LegendComponent, LegendComponentOption } from "echarts/components";
import * as echarts from "echarts/core";
import { LabelLayout } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([TooltipComponent, LegendComponent, PieChart, CanvasRenderer, LabelLayout]);

type EChartsOption = echarts.ComposeOption<TooltipComponentOption | LegendComponentOption | PieSeriesOption>;
interface IData {
  value: number;
  label: string;
  color: string;
}
const getCharOption = (data: IData[]) => {
  let seriesOption = getSeriesOption(data);
  let option: EChartsOption = {
    series: [
      {
        type: "pie",
        radius: ["70%", "85%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderWidth: 10,
        },
        label: {
          show: false,
          position: "center",
        },
        labelLine: {
          show: false,
        },
        data: seriesOption,
      },
    ],
  };
  return option;
};

const getSeriesOption = (data: IData[]) => {
  let transparentAreaBorderWidth: number =
    data
      .map((e) => e.value)
      .reduce(function (total, value) {
        return total + value;
      }, 0) * 0.02;
  let res = [];
  let effectiveData = data.filter((item) => {
    return item.value > 0;
  });
  for (let index = 0; index < data.length; index++) {
    const element = data[index];
    if (effectiveData.length === 1) {
      res.push({
        value: element.value,
        itemStyle: {
          color: element.color || null,
        },
      });
    } else if (data[index].value !== 0) {
      res.push(
        {
          value: element.value,
          itemStyle: {
            color: element.color || null,
          },
        },
        {
          value: transparentAreaBorderWidth,
          name: "",
          itemStyle: {
            color: "rgba(0, 0, 0, 0)",
            borderColor: "rgba(0, 0, 0, 0)",
            borderWidth: 0,
          },
        },
      );
    }
  }
  return res;
};
export function render(dom: HTMLElement | undefined | null, data: IData[]): void {
  if (!dom) {
    return;
  }
  const chart = echarts.init(dom);
  const chartOption = getCharOption(data);
  chart.setOption(chartOption);
}
