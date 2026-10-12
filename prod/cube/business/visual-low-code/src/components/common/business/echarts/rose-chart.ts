import * as echarts from 'echarts'
import type { TitleComponentOption } from 'echarts/components'
type PieOption = echarts.ComposeOption<TitleComponentOption>
export interface PieData {
  value: number;
  name: string;
  itemStyle: any;
}
function getOption (pieData: PieData[], title = '图表'): PieOption {
  const rich = {
    name: {
      color: '#fff',
      fontSize: 14,
    },
  }
  pieData.map((item, index: number) => {
    rich['p' + index] = {
      color: item.itemStyle?.color,
      fontSize: 16,
      fontWeight: 'bold',
    }
  })
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
      backgroundColor: '#1B2D56',
      borderColor: '#2BD8FB',
      textStyle: {
        color: '#fff',
      },
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: '70%',
        center: ['50%', '50%'],
        label: {
          color: '#fff',
          fontSize: 14,

          formatter: function (params: { name: string; dataIndex: string; percent: string; }) {
            return `{name|${params.name}}:{p${params.dataIndex}|${params.percent + '%'}}`
          },
          rich,
        },
        data: pieData,
        roseType: 'area',
      },

    ],
  }
  return option
}
export function render (dom: HTMLElement, pieData: PieData[], title?: string): void {
  const option = getOption(pieData, title)
  const chart = echarts.init(dom)
  chart.setOption(option)
}
