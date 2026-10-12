import { defineComponent } from 'vue'
export default defineComponent({

  name: 'demo',
  props: ['style'],
  setup: () => {
    return () => (
      <div style={{ width: '200px', height: '200px', background: 'red' }} />
    )
  },
})
