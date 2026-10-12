import { defineComponent } from 'vue'
import { Popover } from 'ant-design-vue/es'
export default defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
  },
  setup (props, { slots }) {
    return () => <Popover content={props.content}>{slots}</Popover>
  }
})
