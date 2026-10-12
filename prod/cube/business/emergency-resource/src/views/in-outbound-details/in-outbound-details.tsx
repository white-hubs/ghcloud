import { defineComponent, nextTick, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, DateRangePicker, Form, FormItem, Input, Select, Table } from '@ghcloud/cube-ui'
import {
  getInoutList,
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './in-outbound-details-i'
import styles from './in-outbound-details.module.less'
import { logger } from '@/logger'
import { timestampToDate, timestampToTime } from '@/utils/common'
export const InOutboundDetailsList = defineComponent({
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
    const typeOptions = ref([{ label: '入库', value: 'IN' }, { label: '出库', value: 'OUT' }])
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
    // 查询出入库表格数据===================================================================================================
    // 获取出入库表格数据
    const requestInOutPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          period: search.period?.join(',') ?? null,
          inoutTag: search.inoutTag,
          inoutType: search.type,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getInoutList(params)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }
    onMounted(() => {
      requestInOutPage()
    })
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      requestInOutPage()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      requestInOutPage()
    }
    const handelSearch = (): void => {
      search.pageNumber = 1
      requestInOutPage()
    }
    const reset = (): void => {
      search = reactive({ ...item })
      requestInOutPage()
    }
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '记录号',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: '记录时间',
        dataIndex: 'inoutTime',
        key: 'inoutTime',
        customRender: ({ text }: { text: number; }) => {
          return timestampToDate(text) + timestampToTime(text)
        }
      },
      {
        title: '数量',
        dataIndex: 'inoutNum',
        key: 'inoutNum',
      },
      {
        title: '单位',
        dataIndex: 'inoutUnit',
        key: 'inoutUnit',
      },
      {
        title: '类型',
        dataIndex: 'inoutType',
        key: 'inoutType',
        customRender: ({ text }: { text: string; }) => {
          return <><span>{text === 'IN' ? '入库' : '出库'}</span></>
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
              <FormItem label='类型'>
                <Select allowClear options={typeOptions.value} style={{ width: '100px' }} v-model:value={search.type} />
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
        <GLayout title='出入库明细' showFooter={false} v-slots={gLayoutSlots} />
  }
})
