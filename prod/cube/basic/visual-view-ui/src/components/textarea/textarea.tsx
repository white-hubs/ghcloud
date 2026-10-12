import { defineComponent } from 'vue'
import { Textarea, type TextAreaProps } from 'ant-design-vue/es'
export default defineComponent({
  props: {
    placeholder: {
      type: String,
      default: '请输入',
    },
    maxlength: {
      type: Number,
      default: 200
    },
    showCount: {
      type: Boolean,
      default: true
    },
    allowClear: {
      type: Boolean,
      default: true
    },
    rows: {
      type: Number,
      default: 4
    }
  },
  setup (props: TextAreaProps) {
    return () => <Textarea {...props} v-model={props.value} />
  }
})
