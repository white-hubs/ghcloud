import { defineComponent } from 'vue'
import { InputPassword, type InputProps } from 'ant-design-vue/es'
export default defineComponent({
  emits: ['inputFocus', 'pressEnter'],
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
  },
  setup (props: InputProps, { emit }) {
    const onFocus = (): void => {
      emit('inputFocus')
    }
    const onPressEnter = (): void => {
      emit('pressEnter')
    }
    return () => <InputPassword {...props} v-model={props.value} onFocus={onFocus} onPressEnter={onPressEnter} />
  }
})
