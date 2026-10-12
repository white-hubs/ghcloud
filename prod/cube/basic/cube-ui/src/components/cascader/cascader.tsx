import { defineComponent } from 'vue'
import { Cascader as ACascader, type CascaderProps } from 'ant-design-vue/es'
export const Cascader = defineComponent({
  props: ['fieldNames', 'placeholder', 'showSearch', 'multiple', 'options', 'value', 'defaultValue', 'changeOnSelect', 'allowClear', 'getPopupContainer', 'disabled', 'optionFilterProp'],
  emits: ['change', 'update:value'],
  setup (props: CascaderProps, { emit }) {
    const handleChange = (value: unknown, selectedOptions: unknown): void => {
      emit('update:value', value)
      emit('change', value, selectedOptions)
    }
    return (): JSX.Element => <ACascader {...props} v-model:value={props.value} onChange={handleChange} />
  }
})
