import { defineComponent } from 'vue'
import { SelectOption } from 'ant-design-vue/es'
import './select.less'
import type { SelectValue } from 'ant-design-vue/es/select'
import type { FieldNames } from 'ant-design-vue/es/vc-select/Select'

interface Props {
  placeholder: string;
  options: { label: string; value: string | number; }[];
  allowClear: boolean;
  disabled: boolean;
  open: boolean;
  showArrow: boolean;
  optionFilterProp: string;
  showSearch: boolean;
  mode: 'multiple' | 'tags' | 'SECRET_COMBOBOX_MODE_DO_NOT_USE';
  value: SelectValue;
  fieldNames: FieldNames;
  label: string;
  getPopupContainer?: () => HTMLElement;
}

export default defineComponent({
  emits: ['update:value', 'clear', 'change'],
  props: ['placeholder', 'options', 'allowClear', 'filterOption', 'show-search', 'open', 'showArrow', 'mode', 'value', 'disabled', 'fieldNames', 'getPopupContainer', 'showSearch', 'optionFilterProp', 'label'],
  setup (props: Props) {
    return (): JSX.Element => {
      return (
        <SelectOption {...props}>
          {props.label}
        </SelectOption>
      )
    }
  }
})
