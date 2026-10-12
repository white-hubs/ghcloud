import { defineComponent } from 'vue'
import { Input, type InputProps } from 'ant-design-vue/es'
import type { ChangeEvent } from 'ant-design-vue/es/_util/EventInterface'

export default defineComponent({
  emits: ['inputFocus', 'change', 'input', 'update:value', 'pressEnter'],
  props: {
    placeholder: {
      type: String,
      default: '请输入',
    },
    maxlength: {
      type: Number,
      default: 20
    },
    showCount: {
      type: Boolean,
      default: true
    },
    allowClear: {
      type: Boolean,
      default: true
    },
    readonly: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'text'
    },
    modelValue: {
      type: String,
    },
    value: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup (props: InputProps, { slots, emit }) {
    const onFocus = (): void => {
      emit('inputFocus')
    }
    const onchange = (value: ChangeEvent): void => {
      emit('change', value)
    }
    const onUpdateValue = (value: string): void => {
      emit('update:value', value)
    }
    const oninput = (value: ChangeEvent): void => {
      emit('input', value)
    }
    const onPressEnter = (): void => {
      emit('pressEnter')
    }
    return (): JSX.Element => <Input {...props} v-slots={slots} onFocus={onFocus} type={props.type} onInput={oninput} onChange={onchange} onUpdate:value={onUpdateValue} onPressEnter={onPressEnter} />
  }
})
