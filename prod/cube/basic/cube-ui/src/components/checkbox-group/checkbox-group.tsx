import { computed, defineComponent, ref, watch } from 'vue'
import { CheckboxGroup, Checkbox, type CheckboxOptionType } from 'ant-design-vue/es'
import type { CheckboxValueType } from 'ant-design-vue/es/checkbox/interface'

interface CubCheckboxOptionType extends CheckboxOptionType {
  tips: string;
}
interface Props {
  options: CubCheckboxOptionType[];
  vertical: boolean;
  value?: string | string[];
  disabled?: boolean;
}
export default defineComponent({
  props: ['options', 'vertical', 'value', 'disabled'],
  emits: ['update:value', 'change'],
  setup (props: Props, { slots, emit }) {
    const checkboxStyle = computed(() => {
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
    })
    watch(() => props.value, () => {
      value.value = props.value
    })
    const onChange = (val: CheckboxValueType[]): void => {
      emit('change', val)
    }
    return (): JSX.Element => {
      return (
        <CheckboxGroup v-model:value={value.value} disabled={props.disabled ?? false} onChange={onChange}>
          {
            props.options.length > 0
              ? props.options?.map((e, i) => {
                return (e.tips
                  ? <div key={i}><Checkbox value={e.value} style={checkboxStyle.value}>{e.label}</Checkbox><div v-show={e.tips} style={{ color: '#c1c1c1', fontSize: '12px' }}>{e.tips}</div></div>
                  : <Checkbox key={i} value={e.value} style={checkboxStyle.value}>{e.label}</Checkbox>
                )
              })
              : slots.default?.()
          }
        </CheckboxGroup>
      )
    }
  }
})
