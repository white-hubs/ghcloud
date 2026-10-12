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
  color: string;
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
  },
  setup: (props) => {
    const powerFactorRef = ref()
    const pieValue = computed<number[]>(() => {
      return props.pieData.map((item: { value: number; }) => {
        return item.value
      })
    })
    const pieColor = computed<string[]>(() => {
      return props.pieData.map((item: { color: string; }) => {
        return item.color
      })
    })
    const option = (): EChartsCoreOption => {
      const option = {
        color: pieColor.value,
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['80%', '60%'],
            avoidLabelOverlap: true,
            label: {
              show: false,
              position: 'center',
            },
            data: pieValue.value,
          },
        ],
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
    return (): JSX.Element => {
      return (
        <div class={['pie-box', props.class]}>
          <div class={['power-factor', props.pieClass]} ref={powerFactorRef} />
          <div class='pie-content'>
            <div class='pie-value'>{pieTotal.value}</div>
            <div class='pie-title'>{props.pieTitle}</div>
          </div>
        </div>
      )
    }
  }
})
