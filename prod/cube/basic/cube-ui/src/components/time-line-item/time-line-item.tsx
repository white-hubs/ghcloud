import { defineComponent } from 'vue'
import { TimelineItem } from 'ant-design-vue/es'
export default defineComponent({
  props: {
    color: {
      type: String,
      default: '#00BA8B '
    },

  },

  setup (props, { slots }) {
    return (): JSX.Element => {
      return <TimelineItem {...props}>{slots}</TimelineItem>
    }
  }
})
