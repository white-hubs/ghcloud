import { defineComponent } from 'vue'
import { Col as ACol, type ColProps } from 'ant-design-vue/es'
export const Col = defineComponent({
  setup (props: ColProps, { slots }) {
    return (): JSX.Element=> <ACol {...props} v-slots={slots} />
  }
})
