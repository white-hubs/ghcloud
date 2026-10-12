import { Pagination } from 'ant-design-vue'
import { defineComponent } from 'vue'

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
  emits: ['changePage', 'changeSize'],
  setup (props: Props, { emit }) {
    const change = (page: number, pageSize: number): void => {
      emit('changePage', page, pageSize)
    }
    const showSizeChange = (page: number, size: number): void => {
      emit('changeSize', page, size)
    }
    return (): JSX.Element =>
      <>
        <Pagination
          v-model:current={props.current}
          v-model:page-size={props.pageSize}
          total={props.total}
          show-total={(total: number) => `共 ${total} 条`}
          showSizeChanger
          onChange={change}
          onShowSizeChange={showSizeChange}
        />
      </>
  }
})
