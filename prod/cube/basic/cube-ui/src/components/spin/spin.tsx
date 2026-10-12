import { defineComponent } from 'vue'
import { Spin as ASpin, type SpinProps } from 'ant-design-vue/es'
export const Spin = defineComponent({
  setup (props: SpinProps, { slots }) {
    return (): JSX.Element => <ASpin {...props}>{slots}</ASpin>
  }
})
