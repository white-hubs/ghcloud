import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import '../style/plan-pie.less'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
echarts.use([PieChart, LegendComponent, TooltipComponent, TitleComponent, CanvasRenderer])
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
      type: [] as any,
      default: [],
      required: true,
    }
  },
  setup: (props, { slots }) => {
    const powerFactorRef = ref()
    const pieValue = computed<string>(() => {
      return props.pieData.value.map((item: { value: string; }) => {
        return item.value
      })
    })
    const pieColor = computed<string>(() => {
      return props.pieData.value.map((item: { color: string; }) => {
        return item.color
      })
    })
    const option = () => {
      const option = {
        color: pieColor.value,
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['80%', '70%'],
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
    const initChart = (container?: HTMLElement): void => {
      if (!myChart) myChart = echarts.init(container)
      myChart.setOption(option())
    }
    watch(
      () => [...props.pieData.value],
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
        <div class={['plan-pie-box', props.class]}>
          <div class={['power-factor', props.pieClass]} ref={powerFactorRef} />
          {slots.default?.()}
        </div>
      )
    }
  }
})
