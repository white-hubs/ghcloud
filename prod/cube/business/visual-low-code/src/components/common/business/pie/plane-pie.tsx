import { watch, onMounted, ref, computed, defineComponent, type PropType } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import 'echarts-liquidfill'
import styles from './style/plane-pie.module.less'
echarts.use([PieChart, LegendComponent, TooltipComponent, TitleComponent])
interface PieDataType {
  name: string; value: number; color: string;
}
export default defineComponent({
  name: 'planePie',
  props: {
    pieData: {
      type: Array as PropType<PieDataType[]>,
      default: () => []
    },
    class: String,
    pieClass: String,
  },
  setup (props) {
    let myChart: echarts.ECharts | null = null
    const option = ref({})

    const powerFactorRef = ref()
    const pieValue = computed(() => {
      return 200
      // return props.pieData.map((item) => {
      //   return item.value
      // })
    })
    const pieColor = computed(() => {
      return 200
      // return props.pieData.map((item) => {
      //   return item.color
      // })
    })
    option.value = {
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
    const initChart = (container?: HTMLElement): void => {
      if (!myChart) myChart = echarts.init(container)
      myChart.setOption(option.value)
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
    return () =>
      <div class={`${styles['pie-box']} ${props.class}`}>
        <div class={`${styles['power-factor']} ${props.pieClass}`} ref={powerFactorRef} />
        <div class={styles.content}>
          <slot />
        </div>
      </div>
  }
})
