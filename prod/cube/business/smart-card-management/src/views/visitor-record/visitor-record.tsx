import { defineComponent, nextTick, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, DateRangePicker, Form, FormItem, Input, Select, Table } from '@ghcloud/cube-ui'
import {
  getVisitingPage,
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './visitor-record-i'
import styles from './visitor-record.module.less'
import { logger } from '@/logger'
import { timestampToDate, timestampToTime } from '@/utils/common'
export const VisitorRecord = defineComponent({
  setup: () => {
    const item: SearchType = {
      period: [],
      period2: [],
      name: '',
      pageNumber: 1,
      pageSize: 10,
    }
    const total = ref<number>(0)
    let search = reactive<SearchType>({ ...item })
    const tableLoading = ref<boolean>(false)
    const statusOptions = ref([
      { label: '超期自动签离', value: 'OVERTIME_AUTO_LEAVE' },
      { label: '已签离', value: 'LEAVE' },
      { label: '超期未签离', value: 'OVERTIME_NOT_LEAVE' },
      { label: '已到达', value: 'ARRIVED' }])
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
          period2: search.period2?.join(',') ?? null,
          status: search.useStatus,
          keyword: search.name,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getVisitingPage(params)
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
        title: '访客记录ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '被访人姓名',
        dataIndex: 'receptionistName',
        key: 'receptionistName',
      },
      {
        title: '访客姓名',
        dataIndex: 'visitorName',
        key: 'visitorName',
      },
      {
        title: '访客手机号',
        dataIndex: 'phoneNo',
        key: 'phoneNo',
      },
      {
        title: '访客车牌号',
        dataIndex: 'plateNo',
        key: 'plateNo',
      },
      {
        title: '来访时间',
        dataIndex: 'visitStartTime',
        key: 'visitStartTime',
        customRender: ({ text }: { text: number; }) => {
          return timestampToDate(text) + timestampToTime(text)
        }
      },
      {
        title: '离开时间',
        dataIndex: 'visitEndTime',
        key: 'visitEndTime',
        customRender: ({ text }: { text: number; }) => {
          return timestampToDate(text) + timestampToTime(text)
        }
      },
      {
        title: '来访事由',
        dataIndex: 'visitPurpose',
        key: 'visitPurpose',
      },
      {
        title: '卡号',
        dataIndex: 'cardNo',
        key: 'cardNo',
      },
      {
        title: '访客状态',
        dataIndex: 'visitorStatusName',
        key: 'visitorStatusName',
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': () => {
        return (
          <div style={{ display: 'flex' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem label='来访时间'>
                <DateRangePicker v-model:value={search.period} />
              </FormItem>
              <FormItem label='关键字'>
                <Input v-model:value={search.name} placeholder='请输入被访人姓名/手机号' />
              </FormItem>
              <FormItem label='访客状态'>
                <Select allowClear style={{ width: '200px' }} options={statusOptions.value} v-model:value={search.useStatus} />
              </FormItem>
              <FormItem label='离开时间'>
                <DateRangePicker v-model:value={search.period2} />
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
        <GLayout title='访客记录' showFooter={false} v-slots={gLayoutSlots} />
  }
})
