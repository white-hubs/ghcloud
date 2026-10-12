import { Select } from '@ghcloud/cube-ui'
import { defineComponent, ref, onMounted, watch } from 'vue'

interface FieldType {
  label: string;
  value: string;
  options: string;
}
interface Props {
  placeholder: string;
  apiFunction: (arg0: unknown) => Promise<unknown[]>;
  fieldNames: FieldType;
  width: number;
  disabled: boolean;
  value: string | undefined;
  optionLabelProp?: string;
  optionFilterProp?: string;
  showSearch: boolean;
  maxTagCount: number;
}

export const GlobalSelect = defineComponent({
  props: ['disabled', 'placeholder', 'apiFunction', 'fieldNames', 'width', 'value', 'showSearch', 'optionFilterProp', 'maxTagCount', 'optionLabelProp'],
  emits: ['update:value', 'change'],
  setup (props: Props, { emit }) {
    const selectoptiions = ref<unknown[]>([])
    const modelValue = ref(props.value)
    onMounted(async () => {
      const data = await props.apiFunction({})
      selectoptiions.value = data
    })
    const change = (value: string | undefined): void => {
      modelValue.value = value
      emit('update:value', value)
      emit('change')
    }
    watch(() => props.value, () => {
      modelValue.value = props.value
    })
    return () => {
      return (
        <Select
        {...props}
        disabled={props.disabled}
        value={modelValue.value}
        placeholder={props.placeholder}
        options={selectoptiions.value}
        fieldNames={props.fieldNames}
        style={`width:${props.width}px`}
        onChange={change}
        allowClear
        >

        </Select>
      )
    }
  }
})
