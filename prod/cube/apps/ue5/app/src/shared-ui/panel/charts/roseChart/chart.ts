import * as echarts from "echarts";
import { TitleComponentOption } from "echarts/components";
type PieOption = echarts.ComposeOption<TitleComponentOption>;
export interface PieData {
  value: number;
  name: string;
  itemStyle: any;
}
function getOption(pieData: PieData[], title: string = "图表"): PieOption {
  let rich = {
    name: {
      color: "#fff",
      fontSize: 14,
    },
  };
  pieData.map((item, index) => {
    rich["p" + index] = {
      color: item.itemStyle?.color,
      fontSize: 16,
      fontWeight: "bold",
    };
  });
  let option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b} : {c} ({d}%)",
      backgroundColor: "#1B2D56",
      borderColor: "#2BD8FB",
      textStyle: {
        color: "#fff",
      },
    },
    series: [
      {
        name: title,
        type: "pie",
        radius: "70%",
        center: ["50%", "50%"],
        label: {
          color: "#fff",
          fontSize: 14,

          formatter: function (params) {
            return `{name|${params.name}}:{p${params.dataIndex}|${params.percent + "%"}}`;
          },
          rich: rich,
        },
        data: pieData,
        roseType: "area",
      },
    ],
  };
  return option;
}
export function render(dom: HTMLElement, pieData: PieData[], title?: string): void {
  const option = getOption(pieData, title);
  const chart = echarts.init(dom);
  chart.setOption(option);
}
