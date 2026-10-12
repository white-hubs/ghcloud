import { defineComponent } from 'vue'

interface Props {
  width?: number;
  className?: string;
}

export default defineComponent({
  props: {
    width: {
      type: Number,
      default: 100
    },
    className: {
      type: String,
      default: ''
    }
  },
  setup (props: Props, { slots }) {
    return () => {
      const { width = 100, className = '' } = props
      return <>
        <div
          style={{ width: `${width}%`, maxWidth: '100%', display: 'inline-block', boxSizing: 'border-box' }}
          class={`dynamic-form-item ${props.className}`}
        >
          {slots.default?.()}
        </div>
      </>
    }
  }
})
