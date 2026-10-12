import { type PieData, render } from './ring-chart'
import { type PropType, defineComponent, ref, watch, onMounted } from 'vue'
import '../style/plan-pie.less'
export default defineComponent({
  name: 'RingChart',
  props: {
    pieData: {
      type: Array as PropType<PieData[]>,
      default: []
    },
    seriesName: {
      type: String,
      default: []
    },
    total: {
      type: Number,
      default: 0
    },
    unit: {
      type: String,
      default: ''
    },
  },
  setup: (props) => {
    const ringChart = ref()
    watch(() => props.pieData, () => {
      if (ringChart.value) {
        render(ringChart.value, props.pieData, props.seriesName, props.total, props.unit)
      }
    }, { deep: true, immediate: true })
    onMounted(() => {
      if (ringChart.value) {
        render(ringChart.value, props.pieData, props.seriesName, props.total, props.unit)
      }
    })
    return () => {
      return (
        <>
          <div class='ringChart' ref={ringChart} />
        </>
      )
    }
  }
})
