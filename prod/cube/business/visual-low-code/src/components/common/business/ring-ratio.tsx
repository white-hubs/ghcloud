import { defineComponent } from 'vue'
import './style/operate-days.less'
export default defineComponent({
  name: 'RingRatio',
  props: {
    title: {
      type: String,
      default: '环比'
    },
    chainRatio: {
      type: Number,
      default: 0
    },
  },
  setup: (props) => {
    return () => {
      return (
        <>
          <div class='ringRatio'>
            <span>{props.title}</span>
            <div class={['downtriangle', props.chainRatio > 0 && 'uptriangle']} />
            <div class={[props.chainRatio > 0 ? 'up' : 'down']}>{props.chainRatio}%</div>
          </div>
        </>
      )
    }
  }
})
