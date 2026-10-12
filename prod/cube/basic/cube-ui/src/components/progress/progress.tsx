import { defineComponent } from 'vue'
import { Progress as AProgress, type ProgressProps } from 'ant-design-vue/es'
export const Progress = defineComponent({
  setup (props: ProgressProps, { slots }) {
    return (): JSX.Element => <AProgress {...props}>{slots}</AProgress>
  }
})
