import { defineComponent, type VNode } from 'vue'

export const VerticalLine = defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  setup: (props) => {
    return (): VNode => <span class='verticalLine primary-color-before'>{props.title}</span>
  }
})
