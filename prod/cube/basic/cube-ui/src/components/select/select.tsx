import { defineComponent, ref, watch } from 'vue'
import { Select } from 'ant-design-vue/es'
import './select.less'
import type { SelectValue } from 'ant-design-vue/es/select'
import type { DefaultOptionType } from 'ant-design-vue/lib/vc-select/Select'
import type { FieldNames } from 'ant-design-vue/es/vc-select/Select'

interface Props {
  placeholder: string;
  options: { label: string; value: string | number; }[];
  allowClear: boolean;
  disabled: boolean;
  open: boolean;
  showArrow: boolean;
  optionFilterProp: string;
  optionLabelProp: string;
  showSearch: boolean;
  size: 'small' | 'middle' | 'large';
  mode: 'multiple' | 'tags' | 'SECRET_COMBOBOX_MODE_DO_NOT_USE';
  value: SelectValue;
  fieldNames: FieldNames;
  getPopupContainer?: () => HTMLElement;
  maxTagCount: number;
}

export default defineComponent({
  emits: ['update:value', 'clear', 'change', 'select', 'popupScroll', 'search'],
  props: ['placeholder', 'size', 'options', 'allowClear', 'filterOption', 'show-search', 'open', 'showArrow', 'mode', 'value', 'disabled', 'fieldNames', 'getPopupContainer', 'showSearch', 'optionFilterProp', 'maxTagCount', 'optionLabelProp'],
  setup (props: Props, { slots, emit }) {
    const value = ref(props.value)
    watch(() => props.value, () => {
      value.value = props.value
    })
    watch(() => value.value, () => {
      emit('update:value', value.value)
    })
    const onClear = (): void => {
      emit('clear')
    }
    const change = (value: SelectValue, option: DefaultOptionType | DefaultOptionType[]): void => {
      emit('update:value', value)
      emit('change', value, option)
    }
    const handleSearch = (value: string): void => {
      emit('search', value)
    }
    const handlePopupScroll = (e: Event): void => {
      emit('popupScroll', e)
    }
    const handleSelect = (value: SelectValue, option: DefaultOptionType): void => {
      emit('select', value, option)
    }
    return (): JSX.Element => {
      return (
        <Select onChange={change} onSelect={handleSelect} onSearch={handleSearch} onPopupScroll={handlePopupScroll} class='cube-select' {...props} v-model:value={value.value} placeholder={props.placeholder ?? '请选择'} onClear={onClear}>
          {slots}
        </Select>
      )
    }
  }
})
