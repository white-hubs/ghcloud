import { defineComponent } from 'vue'

export const VerticalLine = defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  setup: (props) => { return () => <span class='verticalLine primary-color-before'>{props.title}</span> }
})
