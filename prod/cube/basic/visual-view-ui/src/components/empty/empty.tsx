import { defineComponent } from 'vue'
import { NEmpty ,type EmptyProps } from 'naive-ui'

export const Empty = defineComponent({
  props: {
    description: {
      type: String,
      default: '暂无内容'
    },
  },
  setup (props:EmptyProps, { slots }) {
    return () => <NEmpty description={props.description}>{slots}</NEmpty>
  }
})
