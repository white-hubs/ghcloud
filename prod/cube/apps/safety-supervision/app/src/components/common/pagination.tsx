import { defineComponent } from 'vue'
import { Page } from '@ghcloud/cube-ui'

interface Props {
  total: number;
  current: number;
  pageSize: number;
}
export const GPagination = defineComponent({
  props: {
    total: { type: Number, default: 0 },
    current: { type: Number, default: 1 },
    pageSize: { type: Number, default: 10 }
  },
  emits: ['change'],
  setup (props: Props, { emit }) {
    const change = (page: number, pageSize: number): void => {
      emit('change', page, pageSize)
    }
    return (): JSX.Element=>
      <>
        <Page
          v-model:current={props.current}
          v-model:page-size={props.pageSize}
          total={props.total}
          show-total={(total: number) => `共 ${total} 条`}
          onPageChange={change}
        />
      </>
  }
})
