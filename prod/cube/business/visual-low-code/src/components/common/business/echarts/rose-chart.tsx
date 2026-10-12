import { render, type PieData } from './rose-chart'
import { type PropType, defineComponent, onMounted, ref } from 'vue'
import '../style/plan-pie.less'
export default defineComponent({
  name: 'RoseChert',
  props: {
    pieData: {
      type: Array as PropType<PieData[]>,
      default: []
    },
    title: {
      type: String,
      default: []
    },
  },
  setup: (props) => {
    const roseChart = ref()
    onMounted(() => {
      if (roseChart.value) {
        render(roseChart.value, props.pieData, props.title)
      }
    })
    return () => {
      return (
        <>
          <div class='ringChart' ref={roseChart} />
        </>
      )
    }
  }
})
