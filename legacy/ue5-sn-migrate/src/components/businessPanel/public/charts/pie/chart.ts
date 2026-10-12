import 'echarts-gl'
import { PieChart } from 'echarts/charts'
import { LegendComponent, TitleComponent, TitleComponentOption, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

type PieOption = echarts.ComposeOption<TitleComponentOption>

echarts.use([
  PieChart,
  CanvasRenderer,
  LegendComponent,
  TooltipComponent,
  TitleComponent 
])

export function render(el: HTMLElement, option: PieOption): void {
  const chart = echarts.init(el)
  chart.setOption(option)
}