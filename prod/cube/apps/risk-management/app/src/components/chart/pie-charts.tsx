import { defineComponent, ref, onMounted, watch, onUnmounted, type PropType, markRaw } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import './charts.less'
export const PieChart = defineComponent({
  props: {
    value: {
      type: Array as PropType<{ value: string | number; name: string; }[]>,
      default: () => [
        { value: 1048, name: 'Search Engine' },
        { value: 735, name: 'Direct' },
        { value: 580, name: 'Email' },
        { value: 484, name: 'Union Ads' },
        { value: 300, name: 'Video Ads' }
      ]
    },
    seriesName: {
      type: String,
      default: () => '报警设备等级'
    },
    legendPercents: {
      type: Boolean,
      default: () => true
    },
    unit: {
      type: String,
      default: () => ''
    },
  },
  setup: (props) => {
    const chartRef = ref()
    const myChart = ref<ECharts>()
    const setOptions = (): void => {
      if (!myChart.value) return
      myChart.value.clear()
      const total = props.value.reduce((sum: number, val: { value: string | number;name: string; }) => {
        return sum + (val.value as number)
      }, 0)
      const option = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          right: '15%',
          y: 'center',
          itemGap: 32,
          itemWidth: 10,
          padding: 10,
          icon: 'circle',
          itemHeight: 10,
          textStyle: {
            rich: {
              a: {
                fontSize: 14,
                width: 124
              },
              b: {
                fontSize: 14
              }
            }
          },
          align: 'left',
          formatter: function (name: string): string {
            const data = option.series[0].data as Record<string, string | number>[]
            const value = data.find(item => item.name === name)?.value ?? '0'
            let total = 0
            let tarValue
            for (let i = 0, l = data.length; i < l; i++) {
              total += data[i].value as number
              if (data[i].name === name) {
                tarValue = data[i].value
              }
            }
            const p = ((tarValue as number / total) * 100).toFixed(2)
            if (props.legendPercents) {
              return `{a|${name}}{b|${p}%}`
            }
            return `{a|${name}}{b|${value}${props.unit}}`
          },
        },
        series: [
          {
            name: props.seriesName,
            type: 'pie',
            center: ['20%', '50%'],
            radius: ['65%', '80%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center',
              formatter: (): string => {
                return ['{label|报警总数}', `{value|${total}}`].join('\n')
              },
              textStyle: {
                rich: {
                  value: {
                    fontSize: 18,
                  },
                  label: {
                    color: '#303133',
                    fontSize: 18,
                    lineHeight: 28
                  }
                }
              }
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 28,
                fontWeight: 'bold',
                formatter: '{c}'
              }
            },
            labelLine: {
              show: false
            },
            data: props.value
          }
        ]
      }
      myChart.value.setOption(option)
    }
    const handleResize = (): void => {
      if (!myChart.value) return
      myChart.value.resize()
    }
    watch(() => props.value, () => {
      setOptions()
    })
    onMounted(() => {
      myChart.value = markRaw(echarts.init(chartRef.value))
      window.addEventListener('resize', handleResize)
      setOptions()
    })
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <div class='canvas' ref={chartRef} />
    )
  }
})
