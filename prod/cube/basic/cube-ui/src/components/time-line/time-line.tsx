import { defineComponent } from 'vue'
import { Timeline } from 'ant-design-vue/es'
export default defineComponent({
  props: {
    allowClear: {
      type: Boolean,
      default: true
    },
    value: {
      type: String,
      default: '',
    },
    valueFormat: {
      type: String,
      default: 'HH:mm',
    },
    format: {
      type: String,
      default: 'HH:mm',
    },
    disabled: {
      type: Boolean,
      default: false
    },
    bordered: {
      type: Boolean,
      default: true
    },
  },
  emits: ['update:value'],
  setup (props, { slots }) {
    return (): JSX.Element=> {
      return <Timeline>{slots}</Timeline>
    }
  }
})
