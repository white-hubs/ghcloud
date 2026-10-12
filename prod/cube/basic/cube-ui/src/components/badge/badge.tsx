import { defineComponent } from 'vue'
import { Badge as ABadge, type BadgeProps } from 'ant-design-vue/es'
export const Badge = defineComponent({
  setup (props: BadgeProps, { slots }) {
    return (): JSX.Element => <ABadge {...props} v-slots={slots} />
  }
})
