import { defineComponent } from 'vue'
import { NCarousel} from 'naive-ui'

export default defineComponent({
  props:['autoplay','interval'],
  setup (props, { emit, slots }) {
    return () => <NCarousel {...props}  >{slots.default?.()}</NCarousel>
  }
})
