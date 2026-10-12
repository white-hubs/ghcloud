import { defineComponent } from 'vue'

export const HeadLine = defineComponent({
  setup: (props, { slots }) => {
    return () => (
      <>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}><span style={{ marginRight: '10px' }}>||</span> <span>{slots.default?.()}</span> </div>
      </>
    )
  },
})
