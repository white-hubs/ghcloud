import { defineComponent, nextTick, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, DateRangePicker, Form, FormItem, Table } from '@ghcloud/cube-ui'
import {
  getFundRecordList,
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './balance-statistics-i'
import styles from './balance-statistics.module.less'
import { logger } from '@/logger'
import { timestampToDate } from '@/utils/common'
export const BalanceStatistics = defineComponent({
  setup: () => {
    const item: SearchType = {
      period: [],
      pageNumber: 1,
      pageSize: 10,
    }
    const total = ref<number>(0)
    let search = reactive<SearchType>({ ...item })
    const tableLoading = ref<boolean>(false)
    const scrollY = ref<number>(200)
    const tableData = ref<TableData[]>([])
    // 计算table-y的高度
    const getscrollY = (): void => {
      const ele = document.getElementById('appContainer')
      const height = ele?.clientHeight
      if (height) {
        scrollY.value = height - 320
      }
    }
    window.onresize = () => {
      getscrollY()
    }
    onMounted(() => {
      nextTick(() => {
        getscrollY()
      })
    })
    // 查询余额统计表格数据===================================================================================================
    // 获取余额统计表格数据
    const requestLightPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          period: search.period?.join(',') ?? null,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getFundRecordList(params)
        tableLoading.value = false
        total.value = res.length
        tableData.value = res
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }
    onMounted(() => {
      requestLightPage()
    })
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      requestLightPage()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      requestLightPage()
    }
    const handelSearch = (): void => {
      search.pageNumber = 1
      requestLightPage()
    }
    const reset = (): void => {
      search = reactive({ ...item })
      requestLightPage()
    }
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '日期',
        dataIndex: 'day',
        key: 'day',
        customRender: ({ text }: { text: number; }) => {
          return timestampToDate(text)
        }
      },
      {
        title: '结余',
        dataIndex: 'preAmountTotal'
      },
      {
        title: '当日进账',
        dataIndex: 'inAmount',
        key: 'inAmount'
      },
      {
        title: '当日支出',
        dataIndex: 'outAmount',
        key: 'outAmount'
      },
      {
        title: '当日余额',
        dataIndex: 'currentAmountTotal',
        key: 'currentAmountTotal'
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': () => {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem label='日期'>
                <DateRangePicker v-model:value={search.period} />
              </FormItem>
              <FormItem>
                <div class={styles.btns}>
                  <Button onClick={reset}>重置</Button>
                  <Button type='primary' onClick={handelSearch}>查询</Button>
                </div>
              </FormItem>
            </Form>
          </div>
        )
      },
      'content-table': () => {
        return (
          <>
            <div class={styles['content-right']}>
              <Table
                columns={recordTableColumns}
                data-source={tableData.value}
                loading={tableLoading.value}
                scrollY={scrollY.value}
                rowKey='id'
                pagination={false}
              />
              <div class={styles['table-footer']}>
                <GPagination
                  current={search.pageNumber}
                  pageSize={search.pageSize}
                  total={total.value}
                  onChangePage={changePage}
                  onChangeSize={changeSize}
                />
              </div>
            </div>
          </>
        )
      },
    }
    return () =>
        <GLayout title='余额统计' showFooter={false} v-slots={gLayoutSlots} />
  }
})
