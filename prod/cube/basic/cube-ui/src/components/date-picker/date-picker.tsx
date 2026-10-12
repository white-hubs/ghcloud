import { type PropType, defineComponent, ref, watch } from 'vue'
import { DatePicker } from 'ant-design-vue/es'
import type { PickerMode } from 'ant-design-vue/es/vc-picker/interface'
import type { SizeType } from 'ant-design-vue/es/config-provider'
import dayjs, { type Dayjs } from 'dayjs'
interface Props {
  picker?: PickerMode;
  showTime?: boolean;
  size?: SizeType;
  value: string;
  disabledTime?: (current: Dayjs | null) => {
    disabledHours?: () => number[];
    disabledMinutes?: () => number[];
    disabledSeconds?: () => number[];
  };
  placeholder?: string;
  valueFormat?: string;
  format?: string;
  readonly?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
}

export default defineComponent({
  props: {
    allowClear: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: '请选择日期',
    },
    showTime: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: '',
    },
    valueFormat: {
      type: String,
      default: 'YYYY-MM-DD',
    },
    format: {
      type: String,
      default: '',
    },
    picker: {
      type: String as PropType<PickerMode>,
      default: 'date',
    },
    disabledDate: {
      type: Function as PropType<(current: Dayjs) => boolean>,
      default: undefined,
    },
    disabledTime: {
      type: Function as PropType<(current: Dayjs | null) => {
        disabledHours?: () => number[];
        disabledMinutes?: () => number[];
        disabledSeconds?: () => number[];
      }>,
      default: undefined,
    },
    getPopupContainer: {
      type: Function,
      default: () => document.body,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    dropdownClassName: {
      type: String,
      default: '',
    },
    popupClassName: {
      type: String,
      default: '',
    },
  },
  emits: ['change', 'update:value'],
  setup (props: Props, { emit }) {
    const value = ref(props.value ?? '')
    if (typeof props.value === 'number') {
      value.value = dayjs(props.value).format(props.valueFormat)
    }
    const handleChange = (value: string | Dayjs): void => {
      emit('update:value', value)
      emit('change', value)
    }
    watch(() => props.value, () => {
      value.value = props.value
    })
    return (): JSX.Element => {
      const popupClassName = props.popupClassName || props.dropdownClassName
      return (
        <DatePicker
          {...props}
          class='cube-picker'
          picker={props.picker}
          v-model:value={value.value}
          onChange={handleChange}
          popupClassName={popupClassName}
        />
      )
    }
  }
})
