import { defineComponent } from 'vue'
import { Steps, type StepsProps } from 'ant-design-vue'
export default defineComponent({
  emits: ['update:value', 'change'],

  setup (props: StepsProps, { slots }) {
    return (): JSX.Element=> <Steps {...props}>{slots}</Steps>
  }
})
