import { defineComponent } from 'vue'
import { CountTo } from 'vue3-count-to'
import './style/operate-days.less'
export default defineComponent({
  name: 'OperateDays',
  props: {
    value: {
      type: Number,
      default: 0
    },
    title: {
      type: String,
      default: ''
    },
    unit: {
      type: String,
      default: ''
    },
    decimals: {
      type: Number,
      default: 0
    },
    showRatio: {
      type: Boolean,
      default: true
    },
  },
  setup: (props, { slots }) => {
    return () => (
      <div class='operateDays'>
        <div class='top'>
          <div class='tit'>{props.title}</div>
          <div class='statstics flex-end'>
            <CountTo startVal={0} endVal={props.value} duration={4000} decimals={props.decimals} class='scroll-number' />
            <span class='unit'>{props.unit}</span>
            <span v-show={props.showRatio}>
              {slots.default?.()}
            </span>
          </div>
        </div>
      </div>
    )
  }
})
