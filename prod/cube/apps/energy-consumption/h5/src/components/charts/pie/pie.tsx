import { computed, defineComponent, onMounted, ref, watch, type PropType } from 'vue'
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
  name: 'PlanPie',
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
    const pieValue = computed<{
      value: number;
      name: string;
    }[]>(() => {
      return props.pieData.map((item: { value: number;label: string; }) => {
        return {
          value: item.value,
          name: item.label
        }
      })
    })
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
      const option = {
        legend: {
          top: '5%',
          left: 'center',
          type: 'scroll',
          show: props.showLegend
        },
        tooltip: {
          trigger: 'item'
        },
        grid: {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          containLabel: true
        },
        series: [
          {
            name: '',
            type: 'pie',
            radius: ['40%', '60%'],
            avoidLabelOverlap: true,
            label: {
              show: false,
              position: 'center',
            },
            data: pieValue.value,
          },
        ],
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
    const pieTotal = computed(() => {
      let total = 0
      props.pieData.forEach(item => {
        total += item.value
      })
      return total
    })
    onMounted(() => {
      initChart(powerFactorRef.value)
    })
    return () => {
      return (
        <div class={['pie-box', props.class]}>
          <div class={['power-factor', props.pieClass]} ref={powerFactorRef} />
          <div class='pie-content' v-show={!props.showLegend}>
            <div class='pie-value'>{pieTotal.value}</div>
            <div class='pie-title'>{props.pieTitle}</div>
          </div>
        </div>
      )
    }
  }
})
