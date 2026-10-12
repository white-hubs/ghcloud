import { defineComponent } from 'vue'
import { NCard,type CardProps } from 'naive-ui'


export default defineComponent({
  props:['headerStyle','contentStyle'],
  setup (props: CardProps, { emit, slots }) {
    return () => <NCard {...props}  >{slots}</NCard>
  }
})
