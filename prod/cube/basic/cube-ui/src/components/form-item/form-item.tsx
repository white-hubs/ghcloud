import { defineComponent, type PropType } from 'vue'
import { FormItem, type FormItemProps } from 'ant-design-vue/es'
export default defineComponent({
  props: {
    label: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    },
    rules: {
      type: Array as PropType<FormItemProps['rules']>,
      default: undefined
    }
  },
  setup (props: FormItemProps, { slots }) {
    return (): JSX.Element=> {
      return <FormItem {...props} style={{ paddingRight: '20px' }}>{slots.default?.()}</FormItem>
    }
  }
})
