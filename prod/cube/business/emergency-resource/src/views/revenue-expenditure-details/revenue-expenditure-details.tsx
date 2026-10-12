import { defineComponent, nextTick, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, DateRangePicker, Form, FormItem, Select, Table } from '@ghcloud/cube-ui'
import {
  getFundInOutList,
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './revenue-expenditure-details-i'
import styles from './revenue-expenditure-details.module.less'
import { logger } from '@/logger'
import Input from '@ghcloud/cube-ui/src/components/input/input'
import { timestampToDate, timestampToTime } from '@/utils/common'
export const RevenueExpenditureDetails = defineComponent({
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
    const fundOptions = ref([{ label: '进账', value: 'IN' }, { label: '支出', value: 'OUT' }])
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
    // 查询收支类型表格数据===================================================================================================
    // 获取收支类型表格数据
    const requestLightPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          inoutTag: search.inoutTag,
          inoutType: search.inoutType,
          period: search.period?.join(',') ?? null,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getFundInOutList(params)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
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
        title: '记录编号',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: '记录时间',
        dataIndex: 'inoutTime',
        customRender: ({ text }: { text: number; }) => {
          return timestampToDate(text) + timestampToTime(text)
        }
      },
      {
        title: '金额',
        dataIndex: 'inoutAmount',
        key: 'inoutAmount',
        customRender: ({ text }: { text: string; }) => {
          return text || '-'
        }
      },
      {
        title: '类型',
        dataIndex: 'inoutType',
        key: 'inoutType',
        customRender: ({ text }: { text: string; }) => {
          return <><span>{text === 'IN' ? '进账' : '支出'}</span></>
        }
      },
      {
        title: '分类标签',
        dataIndex: 'inoutTag',
        key: 'inoutTag',
        customRender: ({ text }: { text: string; }) => {
          return text || '-'
        }
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        customRender: ({ text }: { text: string; }) => {
          return text || '-'
        }
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': () => {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem label='分类标签'>
                <Input v-model:value={search.inoutTag} />
              </FormItem>
              <FormItem label='资金类型' style={{ width: '200px' }}>
                <Select allowClear options={fundOptions} v-model:value={search.inoutType} />
              </FormItem>
              <FormItem label='记录时间'>
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
        <GLayout title='收支明细' showFooter={false} v-slots={gLayoutSlots} />
  }
})
