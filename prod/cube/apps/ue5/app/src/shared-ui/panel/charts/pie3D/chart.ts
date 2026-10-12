import { PieChart } from "echarts/charts";
import { TitleComponentOption } from "echarts/components";
import * as echarts from "echarts/core";
import "echarts-gl";

type PieOption = echarts.ComposeOption<TitleComponentOption>;
export function render(el: HTMLElement, option: PieOption): void {
  const chart = echarts.init(el);
  chart.setOption(option);
}
