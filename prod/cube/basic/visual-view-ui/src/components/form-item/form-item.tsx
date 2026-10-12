import { defineComponent,  type PropType} from 'vue'
import { NFormItem,type FormItemProps } from 'naive-ui';

export default defineComponent({
  props: {
    label: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      default: ''
    },
    validationStatus: {
      type:String as PropType< "error" | "success" | "warning" | undefined>,
      default: ''
    },
    feedback: {
      type: String,
      default: ''
    },
  },
  setup (props: FormItemProps, { slots }) {
    return () => {
      return <NFormItem {...props} style={{ paddingRight: '20px' }}>{slots.default?.()}</NFormItem>
    }
  }
})
