import { defineComponent, onMounted, ref, watch } from 'vue'
import { getUniqueId } from '../../utils/index'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

export const PieChart = defineComponent({
  props: {
    id: {
      type: String,
      default: () => getUniqueId()
    },
    width: {
      type: String,
      default: () => '200px'
    },
    label: {
      type: String,
      default: () => 'A相电压'
    },
    unit: {
      type: String,
      default: () => 'v'
    },
    height: {
      type: String,
      default: () => '200px'
    },
    value: {
      type: Number,
      default: () => 100
    },
    min: {
      type: Number,
      default: () => 0
    },
    max: {
      type: Number,
      default: () => 400
    }
  },
  setup: (props) => {
    const myChart = ref<ECharts>()
    const renderCharts = (): void => {
      if (!myChart.value) return
      const option = {
        series: [
          {
            type: 'gauge',
            startAngle: 230,
            endAngle: -50,
            min: Math.min(props.value, props.min),
            radius: '100%',
            center: ['50%', '50%'],
            max: Math.max(props.value, props.max),
            itemStyle: {
              color: '#1890FF',
              shadowColor: 'rgba(0,138,255,0.45)',
            },
            progress: {
              show: true,
              width: 8
            },
            pointer: {
              icon: 'triangle',
              length: '70%',
              width: 10,
              offsetCenter: [0, 0]
            },
            axisLine: {
              lineStyle: {
                width: 8,
                color: [
                  [0.3, '#1D66FF'],
                  [0.7, '#1D66FF'],
                  [1, '#1D66FF']
                ]
              }
            },
            axisTick: {
              distance: 0,
              length: 5,
              lineStyle: {
                color: '#D8D8D8',
                width: 1 // 刻度线线宽
              }
            },
            splitLine: {
              length: 10,
              distance: 0,
              lineStyle: {
                width: 1,
                color: '#B6B6B6'
              }
            },
            axisLabel: {
              color: '#1f3140',
              distance: 12,
              fontSize: 11,
              show: true,
            },
            title: {
              show: false
            },
            anchor: {
              show: true,
              icon: 'circle',
              size: 30,
              showAbove: true,
              offsetCenter: [0, 0],
              itemStyle: {
                color: '#fff',
                borderWidth: 40,
                borderColor: 'rgba(21,120,255,0.15)',
              }
            },
            detail: {
              width: '60%',
              lineHeight: 20,
              offsetCenter: [0, '75%'],
              valueAnimation: true,
              formatter: (value: number): string => {
                return '{value|' + value + '}' + '{unit|' + props.unit + '}' + '\n' + '{label|' + props.label + '}'
              },
              rich: {
                value: {
                  fontSize: 18,
                  fontWeight: 'bolder',
                  color: '#3D3D3D'
                },
                label: {
                  fontSize: 12,
                  color: '#3D3D3D'
                },
                unit: {
                  fontSize: 18,
                  fontWeight: 'bolder',
                  color: '#3D3D3D'
                }
              }
            },
            data: [
              {
                value: props.value,
                name: props.label
              }
            ]
          },
        ]
      }
      myChart.value.setOption(option)
    }
    watch(() => props.value, () => {
      renderCharts()
    })
    onMounted(() => {
      myChart.value = echarts.init(document.getElementById(props.id) as HTMLDivElement)
      renderCharts()
    })
    return (): JSX.Element => (
      <div class='container'>
        <div id={props.id} style={{ width: props.width, height: props.height }} />
      </div>
    )
  }
})
