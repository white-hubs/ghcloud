import { defineComponent } from 'vue'
import { Card as ACard, type CardProps, CardMeta as ACardMeta } from 'ant-design-vue/es'
export const Card = defineComponent({
  setup (props: CardProps, { slots }) {
    return (): JSX.Element=> <ACard {...props}>{slots}</ACard>
  }
})

export const CardMeta = defineComponent({
  setup (props: CardProps, { slots }) {
    return (): JSX.Element => <ACardMeta {...props}>{slots}</ACardMeta>
  }
})
