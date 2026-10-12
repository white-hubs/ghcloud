import { defineComponent } from 'vue'
import {NPagination} from 'naive-ui'

export default defineComponent({
  emits: ['pageChange','pageSizeChange'],
  props: {
    current: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    },
    page: {
      type: Number,
      default: 10
    },
    total: {
      type: Number,
      default: 0
    },
    pageCount: { //总页数
      type: Number,
      default: 0
    },
  },
  setup (props, { emit }) {
    const handlePage = (page: number,): void => {
      emit('pageChange', page)
    }
    const handlePageSize= (pageSize: number): void => {
      emit('pageSizeChange',pageSize)
    }
    return () => <NPagination {...props}  v-model:page={props.page} on-update:page={handlePage} on-update:page-size={handlePageSize}/>
  }
})
