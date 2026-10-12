import { type PropType, computed, defineComponent, ref, watch } from 'vue'
// import { CheckboxGroup, Checkbox, type CheckboxOptionType } from 'ant-design-vue/es'
import {NCheckboxGroup,NCheckbox,CheckboxProps } from 'naive-ui'
interface Props {
  options: CheckboxProps[];
  vertical: boolean;
  value?: string | number;
  disabled?: boolean;
}

export default defineComponent({
  props: {
    options: {
      type: Array as PropType<(CheckboxProps)[]>,
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
    disabled: {
      type: Boolean,
      default: false
    },
  },
  emits: ['update:value'],
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
    return () => {
      return (
        <NCheckboxGroup v-model:value={value.value} disabled={props.disabled ?? false}>
          {
          props.options.length > 0
            ? props.options?.map((e, i) => {
              return <NCheckbox value={e.value} key={i} style={checkboxStyle.value}>{e.label}</NCheckbox>
            })
            : slots.default?.()
        }
        </NCheckboxGroup>
      )
    }
  }
})
