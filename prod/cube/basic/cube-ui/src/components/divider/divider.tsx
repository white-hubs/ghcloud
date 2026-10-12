import { defineComponent } from 'vue'
import { Divider as ADivider, type DividerProps } from 'ant-design-vue/es'
export const Divider = defineComponent({
  setup (props: DividerProps, { slots }) {
    return (): JSX.Element => <ADivider {...props} v-slots={slots} />
  }
})
