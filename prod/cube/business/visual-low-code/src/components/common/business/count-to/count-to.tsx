import { CountTo } from 'vue3-count-to'
import { ref, watch, defineComponent } from 'vue'
interface Props {
  startVal: number;
  endVal: number;
  duration: number;
  separator: string;
  decimals: number;
}
export default defineComponent({
  name: 'CountTo',
  props: ['startVal', 'endVal', 'duration', 'separator', 'decimals'],
  setup (props: Props) {
    const startVal = ref(props.startVal ?? 0)
    watch(() => props.endVal, () => {
      setTimeout(() => {
        startVal.value = props.endVal
      }, props.duration)
    }, {
      immediate: true
    })
    return () => <CountTo
      startVal={props.startVal} endVal={props.endVal} duration={props.duration} separator={props.separator}
      style={{ fontFamily: 'robotoMedium' }} decimals={props.decimals}
                 />
  }
})
