import * as echarts from "echarts";
import { TitleComponentOption } from "echarts/components";
type PieOption = echarts.ComposeOption<TitleComponentOption>;
export enum pieType {
  COMMON = "common",
  RING = "ring",
  ROSE = "rose",
}
export interface PieData {
  name: string;
  value: number;
  color: string;
}
// 普通饼图
function getCommonOption(pieData: PieData[], legend: boolean): PieOption {
  const option = {
    legend: {
      show: legend,
      icon: "circle",
      right: "3%",
      left: "center",
      bottom: "10%",
      itemWidth: 10,
      itemStyle: {
        borderColor: "none",
      },
      textStyle: {
        rich: {
          name: {
            color: "#606266",
            fontSize: 14,
          },
          percentage: {
            color: "#606266",
            fontSize: 16,
            padding: [0, 0, 0, 30],
            align: "right",
          },
        },
      },
    },
    tooltip: {
      trigger: "item",
    },
    series: [
      {
        color: pieData.map((item) => {
          return item.color;
        }),
        type: "pie",
        radius: "70%",
        left: "center",
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 60,
        },
        label: {
          width: 100,
          fontSize: 12,
        },
        itemStyle: {
          borderColor: "#fff",
        },
      },
    ],
  };
  return option;
}
// 圆环饼图
function getRingOption(
  pieData: PieData[],
  legend: boolean,
  title: boolean,
  seriesName: string,
  totalName: string,
  total: string | number,
  unit: string,
): PieOption {
  let seriesData = [];
  pieData.forEach((item) => {
    seriesData.push(item);
    seriesData.push({
      name: "",
      value: 5,
      tooltip: { show: false },
      itemStyle: {
        label: {
          show: false,
        },
        labelLine: {
          show: false,
        },
        color: "rgba(0, 0, 0, 0)",
        borderColor: "rgba(0, 0, 0, 0)",
        borderWidth: 0,
      },
    });
  });
  const option = {
    color: ["#96B5FC", "#5F8CEF", "#F18A70", "#F4C594", "#E0E7FA"],
    backgroundColor: "transparent",
    title: {
      show: title,
      text: `{a|${total}}{b| ${unit}}\n{c|${totalName}}`,
      textStyle: {
        rich: {
          a: {
            color: "#FFFFFF",
            fontSize: "16",
          },
          b: {
            fontSize: "16",
            color: "#FFFFFF",
          },
          c: {
            fontSize: "12",
            color: "#D9E7FF",
          },
        },
      },
      x: "center",
      y: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      show: legend,
      icon: "circle",
      orient: "horizontal",
      right: "10%",
      top: "30%",
      width: "0",
      textStyle: {
        color: "#E6F7FF",
      },
      data: pieData.map((r) => r.name),
    },
    series: [
      {
        name: seriesName,
        type: "pie",
        radius: ["50%", "60%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        label: {
          position: "outside",
          color: "#E6F7FF",
          lineHeight: 18,
          formatter: (params) => {
            const { data } = params;
            return data.name ? `${data.name}\n${data.value}${unit}` : "";
          },
        },
        itemStyle: {
          color: (params) => {
            if (params.data?.color) {
              return params.data.color;
            }
          },
        },
        emphasis: {
          scaleSize: 10,
        },
        data: seriesData,
      },
      {
        name: "阴影圈",
        type: "pie",
        radius: ["0", "40%"],
        center: ["50%", "50%"],
        emphasis: {
          scale: false,
        },
        tooltip: {
          show: false,
        },
        itemStyle: {
          color: "rgba(204,225,255, 0.05)",
        },
        zlevel: 4,
        labelLine: {
          show: false,
        },
        data: [100],
      },
      {
        name: "阴影圈",
        type: "pie",
        radius: ["0", "30%"],
        center: ["50%", "50%"],
        emphasis: {
          scale: false,
        },
        tooltip: {
          show: false,
        },
        itemStyle: {
          color: "rgba(204,225,255, 0.07)",
        },
        zlevel: 4,
        labelLine: {
          show: false,
        },
        data: [100],
      },
    ],
  };
  return option;
}
// 玫瑰饼图
function getRoseOption(pieData: PieData[], legend: boolean, seriesName: string) {
  let rich = {
    name: {
      color: "#fff",
      fontSize: 14,
    },
  };
  pieData.map((item, index) => {
    rich["p" + index] = {
      color: item.color,
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
    legend: {
      show: legend,
      icon: "circle",
      orient: "horizontal",
      right: "10%",
      top: "30%",
      width: "0",
      textStyle: {
        color: "#E6F7FF",
      },
      data: pieData.map((r) => r.name),
    },
    series: [
      {
        name: seriesName,
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
/**
 *
 * @param dom html元素
 * @param pieData 饼图数据
 * @param type 饼图类型
 * @param legend 是否显示图列
 * @param title 环形饼图是否显示title
 * @param seriesName
 * @param total 总数
 * @param unit 单位
 */
export function render(
  dom: HTMLElement,
  pieData: PieData[],
  type: string,
  legend: boolean,
  seriesName: string,
  title: boolean,
  totalName: string,
  total: string | number,
  unit: string,
): void {
  const chart = echarts.init(dom);
  let option: PieOption;
  switch (type) {
    case pieType.COMMON:
      option = getCommonOption(pieData, legend);
      break;
    case pieType.RING:
      option = getRingOption(pieData, legend, title, seriesName, totalName, total, unit);
      break;
    case pieType.ROSE:
      option = getRoseOption(pieData, legend, seriesName);
      break;
    default:
      option = getCommonOption(pieData, legend);
      break;
  }
  chart.setOption(option);
}
