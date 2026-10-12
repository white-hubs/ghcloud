import { defineComponent } from 'vue'
import { Row as ARow, type RowProps } from 'ant-design-vue/es'
export const Row = defineComponent({
  setup (props: RowProps, { slots }) {
    return (): JSX.Element=> <ARow {...props} v-slots={slots} />
  }
})
