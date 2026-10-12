import { type PropType, defineComponent, computed, ref, watch } from 'vue'
import { RadioGroup, Radio, RadioButton } from 'ant-design-vue/es'
import type { RadioGroupChildOption } from 'ant-design-vue/es/radio/Group'
type RadioGroupButtonStyle = 'outline' | 'solid'
interface Props {
  options: RadioGroupChildOption[];
  vertical: boolean;
  value?: string | number;
  readonly?: boolean;
  buttonStyle?: RadioGroupButtonStyle;
  optionType?: 'default' | 'button';
}

export default defineComponent({
  props: {
    options: {
      type: Array as PropType<(RadioGroupChildOption)[]>,
      default: () => []
    },
    vertical: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: null
    },
    readonly: {
      type: Boolean,
      default: false
    },
    buttonStyle: {
      type: String as PropType<RadioGroupButtonStyle>,
      default: undefined
    },
    optionType: {
      type: String as PropType<'default' | 'button'>,
      default: 'button'
    }
  },
  emits: ['update:value', 'change'],
  setup (props: Props, { slots, emit }) {
    const radioStyle = computed(() => {
      if (props.vertical) {
        return {
          display: 'flex',
          height: '30px',
          lineHeight: '30px',
        }
      }
      return {}
    })
    const value = ref(props.value)
    watch(() => value.value, () => {
      emit('update:value', value.value)
      emit('change', value.value)
    })
    watch(() => props.value, () => {
      value.value = props.value
    })
    return (): JSX.Element=> {
      return (
        <RadioGroup v-model:value={value.value} disabled={props.readonly ?? false} buttonStyle={props.buttonStyle} optionType={props.optionType}>
          {
            props.options.length > 0
              ? props.options?.map((e, i) => {
                if (props.buttonStyle === 'solid') {
                  return <RadioButton value={e.value} key={i}>{e.label}</RadioButton>
                } else {
                  return <Radio value={e.value} key={i} style={radioStyle.value}>{e.label}</Radio>
                }
              })
              : slots.default?.()
          }
        </RadioGroup>
      )
    }
  }
})
