import { type PropType, defineComponent, onMounted, ref, watch } from 'vue'
import { render } from './round-pie'
import '../style/round-pie.less'
interface IData {
  value: number;
  label: string;
  color: string;
}
export default defineComponent({
  name: 'RoundPie',
  props: {
    data: {
      type: Array as PropType<IData[]>,
      default: []
    },
    eventNum: {
      type: Number,
      default: 0
    },
  },
  setup: (props, { slots }) => {
    const chartDom = ref()
    watch(
      () => props.data,
      newVal => {
        render(chartDom.value, newVal)
      },
      { deep: true }
    )
    onMounted(() => {
      render(chartDom.value, props.data)
    })
    return () => {
      return (
        <>
          <div class='pie-box'>
            <div class='chart' ref={chartDom} />
            <div class='content'>
              {slots.default?.()}
            </div>
          </div>
        </>
      )
    }
  }
})
