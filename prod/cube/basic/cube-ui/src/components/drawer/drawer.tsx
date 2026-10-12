import { defineComponent, computed } from 'vue'
import { Drawer as ADrawer, type DrawerProps } from 'ant-design-vue/es'

type DrawerPropsCompat = DrawerProps & {
  visible?: boolean
  style?: unknown
  class?: string
}

export const Drawer = defineComponent({
  setup(props: DrawerPropsCompat, { slots }) {
    const mappedProps = computed(() => {
      const {
        visible,
        style,
        class: cls,
        open,
        rootStyle,
        rootClassName,
        ...rest
      } = props as DrawerPropsCompat & { open?: boolean; rootStyle?: unknown; rootClassName?: string }
      return {
        ...rest,
        open: open ?? visible,
        rootStyle: rootStyle ?? style,
        rootClassName: rootClassName ?? cls,
      }
    })
    return (): JSX.Element => <ADrawer {...mappedProps.value} v-slots={slots} />
  },
})
