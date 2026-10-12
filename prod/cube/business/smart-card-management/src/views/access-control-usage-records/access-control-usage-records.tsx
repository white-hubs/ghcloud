import { defineComponent, nextTick, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, DateRangePicker, Form, FormItem, Input, Table } from '@ghcloud/cube-ui'
import {
  getAccessPage,
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './access-control-usage-records-i'
import styles from './access-control-usage-records.module.less'
import { logger } from '@/logger'
import { timestampToDate, timestampToTime } from '@/utils/common'
export const AccessControlUsageRecords = defineComponent({
  setup: () => {
    const item: SearchType = {
      period: [],
      name: '',
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
    // 查询用电表格数据===================================================================================================
    // 获取用电表格数据
    const requestLightPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          period: search.period?.join(',') ?? null,
          keyword: search.name,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getAccessPage(params)
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
    const inOutType = (text: string): string => {
      let type = '未知'
      if (text === '0') {
        type = '出'
      } else if (text === '1') {
        type = '进'
      } else {
        type = '未知'
      }
      return type
    }
    const recordTableColumns = [
      {
        title: '门禁事件ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '事件名称',
        dataIndex: 'eventName',
        key: 'eventName',
      },
      {
        title: '门禁点名称',
        dataIndex: 'doorName',
        key: 'doorName',
      },
      {
        title: '使用时间',
        dataIndex: 'eventTime',
        key: 'eventTime',
        customRender: ({ text }: { text: number; }) => {
          return timestampToDate(text) + timestampToTime(text)
        }
      },
      {
        title: '人员名称',
        dataIndex: 'personName',
        key: 'personName',
      },
      {
        title: '卡号',
        dataIndex: 'cardNo',
        key: 'cardNo',
      },
      {
        title: '进出类型',
        dataIndex: 'inAndOutType',
        key: 'inAndOutType',
        customRender: ({ text }: { text: string; }) => {
          return inOutType(text)
        }
      },

    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': () => {
        return (
          <div style={{ display: 'flex' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem label='使用时间'>
                <DateRangePicker v-model:value={search.period} />
              </FormItem>
              <FormItem label='关键字'>
                <Input v-model:value={search.name} placeholder='请输入事件名称/门禁点名称' />
              </FormItem>
            </Form>
            <div class={styles.btns}>
                  <Button type='primary' onClick={handelSearch} style={{ marginRight: '10px' }}>查询</Button>
                  <Button onClick={reset}>重置</Button>
            </div>
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
        <GLayout title='门禁使用' showFooter={false} v-slots={gLayoutSlots} />
  }
})
