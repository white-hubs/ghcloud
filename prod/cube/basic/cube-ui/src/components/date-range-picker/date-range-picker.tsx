import { type PropType, defineComponent } from 'vue'
import { RangePicker } from 'ant-design-vue/es'
import type { PickerMode } from 'ant-design-vue/es/vc-picker/interface'
import type { SizeType } from 'ant-design-vue/es/config-provider'
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
import './date-range-picker.less'
import type { Dayjs } from 'dayjs'
interface Props {
  picker?: PickerMode;
  showTime?: boolean;
  size?: SizeType;
  value?: [string, string] ;
  placeholder?: [string, string];
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
    picker: {
      type: String as PropType<PickerMode>,
      default: 'date',
    },
    showTime: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: Array as unknown as PropType<[string, string]>,
      default: () => ['开始时间', '结束时间'],
    },
    value: {
      type: Array as unknown as PropType<[string, string]>,
      default: () => ['', ''],
    },
    disabled: {
      type: Boolean,
      default: false
    },
    valueFormat: {
      type: String,
      default: 'YYYY-MM-DD',
    },
    format: {
      type: String,
      default: 'YYYY-MM-DD',
    },
  },
  emits: ['changePicker', 'update:value', 'calendarChange'],
  setup (props: Props, { emit }) {
    const changePicker = (_dates: [string, string] | [Dayjs, Dayjs], dateStrings: [string, string]): void => {
      const nextValue: [string, string] = dateStrings ?? ['', '']
      emit('update:value', nextValue)
      emit('changePicker', nextValue)
    }
    const calendarChange = (values: [string, string] | [Dayjs, Dayjs]): void => {
      emit('calendarChange', values)
    }
    return (): JSX.Element => {
      return <RangePicker {...props} locale={locale} class='cube-picker' value={props.value} onChange={changePicker} onCalendarChange={calendarChange} />
    }
  }
})
