import { defineComponent} from 'vue'
// import { Input, type InputProps } from 'ant-design-vue/es'
import { NDialogProvider} from 'naive-ui';
// import 'ant-design-vue/es/input/style'
// import type { ChangeEvent } from 'ant-design-vue/es/_util/EventInterface'

export default defineComponent({
  name:'DialogProvider',
  setup (props, { emit,slots }) {
    return () => <NDialogProvider >{slots}</NDialogProvider>
  }
})
