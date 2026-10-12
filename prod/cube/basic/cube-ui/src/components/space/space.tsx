import { defineComponent } from 'vue'
import { Space as ASpace, type SpaceProps } from 'ant-design-vue/es'
export const Space = defineComponent({
  props: ['direction', 'align'],
  setup (props: SpaceProps, { slots }) {
    return (): JSX.Element => <ASpace {...props} v-slots={slots} />
  }
})
