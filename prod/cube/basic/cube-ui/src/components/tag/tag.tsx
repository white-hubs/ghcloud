import { defineComponent } from 'vue'
import { Tag as ATag, type TagProps } from 'ant-design-vue/es'
export const Tag = defineComponent({
  setup (props: TagProps, { slots }) {
    return (): JSX.Element=> <ATag {...props} v-slots={slots} />
  }
})
