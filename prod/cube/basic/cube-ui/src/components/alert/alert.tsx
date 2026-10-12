import { defineComponent } from 'vue'
import { Alert as AAlert, type AlertProps } from 'ant-design-vue/es'
export const Alert = defineComponent({
  setup (props: AlertProps, { slots }) {
    return (): JSX.Element => <AAlert {...props} v-slots={slots} />
  }
})
