import { defineComponent } from 'vue'
export default defineComponent({
  name: 'common-bar',
  props: ['style'],
  setup: (props) => {
    return () => (
      <>
        <div style={{ ...props.style, background: 'blue' }}>11</div>
      </>
    )
  },
})
