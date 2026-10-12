import { type PropType, defineComponent, ref, watch } from 'vue'
import { RangePicker } from 'ant-design-vue/es'
import type { PickerMode } from 'ant-design-vue/es/vc-picker/interface'
import type { SizeType } from 'ant-design-vue/es/config-provider'
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
import './date-range-picker.less'
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
    valueFormat: {
      type: String,
      default: 'YYYY-MM-DD',
    },

  },
  emits: ['changePicker'],
  setup (props: Props, { emit }) {
    const value = ref<[string, string]>(props.value ?? ['', ''])

    watch(() => props.value, () => {
      value.value = props.value ?? ['', '']
      // emit('update:value', value.value)
    })
    const changePicker = (): void => {
      emit('changePicker', value.value)
    }
    return () => {
      return <RangePicker {...props} locale={locale} class='cube-picker' v-model:value={value.value} onChange={changePicker} />
    }
  }
})
