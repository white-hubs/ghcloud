import { defineComponent } from 'vue'
import { Popconfirm } from 'ant-design-vue/es'
export default defineComponent({
  props: ['title', 'okText', 'cancelText', 'onConfirm'],
  setup (props, { slots }) {
    return () => <Popconfirm {...props}>{slots}</Popconfirm>
  }
})
