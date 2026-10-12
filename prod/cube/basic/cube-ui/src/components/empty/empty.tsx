import { defineComponent } from 'vue'
import { Empty as AEmpty } from 'ant-design-vue/es'
export const Empty = defineComponent({
  props: {
    description: {
      type: String,
      default: '暂无内容'
    },
  },
  setup (props, { slots }) {
    return (): JSX.Element => <AEmpty description={props.description}>{slots}</AEmpty>
  }
})
