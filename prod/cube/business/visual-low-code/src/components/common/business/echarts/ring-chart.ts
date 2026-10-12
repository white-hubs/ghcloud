import * as echarts from 'echarts'
import type { TitleComponentOption } from 'echarts/components'
type PieOption = echarts.ComposeOption<TitleComponentOption>
export interface PieData {
  name: string;
  value: number;
  color: string;
}
function getOption (pieData: PieData[], seriesName = '图表统计', total: string | number = '', unit = ''): PieOption {
  const seriesData: PieData[] = []
  pieData.forEach(item => {
    seriesData.push(item)
  })
  const option = {
    color: ['#96B5FC', '#5F8CEF', '#F18A70', '#F4C594', '#E0E7FA'],
    backgroundColor: 'transparent',
    title: {
      text: `{a|${total}}{b| ${unit}}\n{c|${seriesName}}`,
      textStyle: {
        rich: {
          a: {
            color: '#FFFFFF',
            fontSize: '16',
          },
          b: {
            fontSize: '16',
            color: '#FFFFFF',
          },
          c: {
            fontSize: '12',
            color: '#D9E7FF'
          }
        },
      },
      x: 'center',
      y: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      show: false,
      icon: 'circle',
      orient: 'horizontal',
      right: '10%',
      top: '30%',
      width: '0',
      textStyle: {
        color: '#E6F7FF',
      },
      data: pieData.map(r => r.name),
    },
    series: [
      {
        name: seriesName,
        type: 'pie',
        radius: ['50%', '60%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: {
          normal: {
            show: false
          },
          position: 'outside',
          color: '#E6F7FF',
          lineHeight: 18,
          formatter: (params: { data: any; }) => {
            const { data } = params
            return data.name ? `${data.name}\n${data.value}${unit}` : ''
          },
        },
        itemStyle: {
          color: (params: { data: { color: any; }; }) => {
            if (params.data?.color) {
              return params.data.color
            }
          }
        },
        emphasis: {
          scaleSize: 10,
        },
        data: seriesData,
      },
      {
        name: '阴影圈',
        type: 'pie',
        radius: ['0', '40%'],
        center: ['50%', '50%'],
        emphasis: {
          scale: false,
        },
        tooltip: {
          show: false,
        },
        itemStyle: {
          color: 'rgba(204,225,255, 0.05)',
        },
        zlevel: 4,
        labelLine: {
          show: false,
        },
        data: [100],
      },
      {
        name: '阴影圈',
        type: 'pie',
        radius: ['0', '30%'],
        center: ['50%', '50%'],
        emphasis: {
          scale: false,
        },
        tooltip: {
          show: false,
        },
        itemStyle: {
          color: 'rgba(204,225,255, 0.07)',
        },
        zlevel: 4,
        labelLine: {
          show: false,
        },
        data: [100],
      },
    ],
  }
  return option
}
export function render (dom: HTMLElement, pieData: PieData[], seriesName?: string, total?: string | number, unit?: string): void {
  const option = getOption(pieData, seriesName, total, unit)
  const chart = echarts.init(dom)
  chart.setOption(option)
}
