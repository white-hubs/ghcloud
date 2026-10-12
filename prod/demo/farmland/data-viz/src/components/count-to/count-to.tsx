import { CountTo } from 'vue3-count-to'
import { ref, watch, defineComponent } from 'vue'

interface Props {
  startVal?: number;
  endVal?: number;
  duration?: number;
  separator?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  autoplay?: boolean;
  className?: string;
}

export default defineComponent({
  name: 'CountTo',
  props: {
    startVal: {
      type: Number,
      default: 0
    },
    endVal: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 2000
    },
    separator: {
      type: String,
      default: ','
    },
    decimals: {
      type: Number,
      default: 0
    },
    prefix: {
      type: String,
      default: ''
    },
    suffix: {
      type: String,
      default: ''
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    className: {
      type: String,
      default: ''
    }
  },
  setup (props: Props) {
    const startVal = ref(props.startVal ?? 0)
    
    watch(() => props.endVal, () => {
      if (props.autoplay) {
        setTimeout(() => {
          startVal.value = props.endVal ?? 0
        }, props.duration)
      }
    }, {
      immediate: true
    })
    
    return () => (
      <div class={props.className}>
        {props.prefix && <span>{props.prefix}</span>}
        <CountTo
          startVal={props.startVal ?? 0}
          endVal={props.endVal ?? 0}
          duration={props.duration ?? 2000}
          separator={props.separator ?? ','}
          decimals={props.decimals ?? 0}
          style={{ fontFamily: 'D-DIN-PRO' }}
        />
        {props.suffix && <span>{props.suffix}</span>}
      </div>
    )
  }
})