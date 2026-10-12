import { defineComponent } from 'vue'
import { Avatar as AAvatar, type AvatarProps } from 'ant-design-vue/es'
export const Avatar = defineComponent({
  props: AAvatar.$props,
  setup (props: AvatarProps, { slots }) {
    return (): JSX.Element => <AAvatar {...props} v-slots={slots} />
  }
})
