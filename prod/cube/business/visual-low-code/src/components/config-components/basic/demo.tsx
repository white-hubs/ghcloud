import { defineComponent } from 'vue'
export default defineComponent({
  name: 'demo',
  props: ['style'],
  setup: (props) => {
    return () => (
      <div style={{ ...props.style, background: 'red', left: `${props.style.left}px`, top: `${props.style.top}px`, position: 'absolute' }} />
    )
  },
})
