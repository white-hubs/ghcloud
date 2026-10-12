import { type PropType, defineComponent, ref } from 'vue'
import { TimePicker } from 'ant-design-vue/es'
import type { SizeType } from 'ant-design-vue/es/config-provider'
interface Props {
  size?: SizeType;
  value?: string ;
  placeholder?: string;
  valueFormat?: string;
  format?: string;
  readonly?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  bordered?: boolean;
  getPopupContainer?: () => HTMLElement;
}

export default defineComponent({
  props: {
    allowClear: {
      type: Boolean,
      default: true
    },
    value: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    valueFormat: {
      type: String,
      default: 'HH:mm',
    },
    format: {
      type: String,
      default: 'HH:mm',
    },
    disabled: {
      type: Boolean,
      default: false
    },
    bordered: {
      type: Boolean,
      default: true
    },
    getPopupContainer: {
      type: Function as PropType<() => HTMLElement>,
      default: () => document.body
    }
  },
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    return (): JSX.Element=> {
      const value = ref(props.value)
      const onChange = (): void => {
        emit('update:value', value.value)
      }
      return <TimePicker {...props} class='cube-time-picker' v-model:value={value.value} onChange={onChange} bordered={props.bordered ?? true} />
    }
  }
})
