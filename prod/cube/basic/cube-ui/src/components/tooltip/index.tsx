import { defineComponent } from 'vue'
import { Tooltip as ATooltip } from 'ant-design-vue/es'

/** ant-design-vue 4 使用 onOpenChange；将旧 API 映射避免 dev 告警 */
export const Tooltip = defineComponent({
  inheritAttrs: false,
  name: 'Tooltip',
  setup (_props, { slots, attrs }) {
    return (): JSX.Element => {
      const a = { ...attrs } as Record<string, unknown>
      if (typeof a.onVisibleChange === 'function' && a.onOpenChange === undefined) {
        a.onOpenChange = a.onVisibleChange
        delete a.onVisibleChange
      }
      return <ATooltip {...a} v-slots={slots} />
    }
  },
})
