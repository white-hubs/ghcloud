import { defineComponent } from 'vue'
import { Step, type StepProps } from 'ant-design-vue'
export default defineComponent({
  emits: ['update:value', 'change'],

  setup (props: StepProps) {
    return (): JSX.Element=> <Step {...props} />
  }
})
