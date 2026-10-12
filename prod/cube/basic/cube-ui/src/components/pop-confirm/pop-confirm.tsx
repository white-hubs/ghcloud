import { defineComponent } from 'vue'
import { Popconfirm } from 'ant-design-vue/es'
export default defineComponent({
  props: ['title', 'okText', 'cancelText', 'onConfirm', 'disabled'],
  setup (props, { slots }) {
    return (): JSX.Element=> <Popconfirm {...props}>{slots}</Popconfirm>
  }
})
