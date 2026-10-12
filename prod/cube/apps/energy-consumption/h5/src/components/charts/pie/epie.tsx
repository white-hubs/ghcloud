import { defineComponent, onMounted, ref, watch, type PropType, computed } from 'vue'
import './piane-pie.less'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import type { EChartsCoreOption } from 'echarts/core'
echarts.use([PieChart, LegendComponent, TooltipComponent, TitleComponent, CanvasRenderer])
interface PieData {
  label: string;
  value: number;
  color?: string;
}
export default defineComponent({
  name: 'EplanPie',
  props: {
    class: {
      type: String,
      default: ''
    },
    pieClass: {
      type: String,
      default: ''
    },
    pieData: {
      type: Array as PropType<PieData[]>,
      default: [
        {
          name: '1',
          value: 10,
          color: '#000'
        },
        {
          name: '2',
          value: 10,
          color: '#fff'
        },
        {
          name: '3',
          value: 10,
          color: '#ccc'
        },
      ],
    },
    pieTitle: {
      type: String,
      default: '报警总数'
    },
    showLegend: {
      type: Boolean,
      default: false
    }
  },
  setup: (props) => {
    const powerFactorRef = ref()
    const pieColor = computed<(string | undefined)[]>(() => {
      const colorData = props.pieData.map((item: { color?: string; }) => {
        return item.color
      })
      if (colorData.filter(e => e).length) {
        return colorData
      } else {
        return []
      }
    })
    const option = (): EChartsCoreOption => {
      const pieData = props.pieData.map((e) => {
        return {
          ...e,
          name: e.label
        }
      })
      const total = pieData.reduce((a, b) => {
        return parseFloat(String(a)) + parseFloat(String(b.value))
      }, 0)
      const option = {
        tooltip: {
          formatter: (name: { value: number; name: string; }) => {
            return name.value === 0 ? name.name : name.name + ' ' + (name.value / total * 100).toFixed(2) + '%'
          },
          trigger: 'item',
          position: function (point: number[], params: unknown, dom: { offsetWidth: number; offsetHeight: number; }, rect: unknown, size: { viewSize: number[]; }) {
            let x = point[0] + 10 // x 轴偏移量为 10
            let y = point[1] + 20 // y 轴偏移量为 10
            if (x + dom.offsetWidth > size.viewSize[0]) {
              x = size.viewSize[0] - dom.offsetWidth
            }
            if (y + dom.offsetHeight > size.viewSize[1]) {
              y = size.viewSize[1] - dom.offsetHeight
            }
            return [x, y]
          },
        },
        series: [
          {
            name: '111',
            type: 'pie',
            radius: ['0%', '70%'],
            avoidLabelOverlap: false,
            center: ['50%', '50%'],
            itemStyle: {
              borderRadius: 0,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: { show: true, position: 'inner', fontSize: 8 },
            emphasis: {
              label: {
                show: true,
                fontSize: 20,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: pieData
          }
        ]
      }
      if (pieColor.value.length) {
        option.color = pieColor.value
      }
      return option
    }
    let myChart: echarts.ECharts | null = null
    const initChart = (container: HTMLElement): void => {
      if (!myChart) myChart = echarts.init(container)
      myChart.setOption(option())
    }
    watch(
      () => [...props.pieData],
      () => {
        initChart(powerFactorRef.value)
      },
      { deep: true }
    )
    onMounted(() => {
      initChart(powerFactorRef.value)
    })
    return () => {
      return (
        <div class={['pie-box', props.class]}>
          <div class={['power-factor', props.pieClass]} ref={powerFactorRef} />
        </div>
      )
    }
  }
})
