import { defineComponent, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Table, Form, FormItem, DateRangePicker } from '@ghcloud/cube-ui'
import {
  getPhoneNumberPage,
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './business-monitoring-i'
import styles from './business-monitoring.module.less'
import { logger } from '@/logger'
import { timestampToDate } from '@/utils/common'
export const BusinessMonitoring = defineComponent({
  setup: () => {
    const item: SearchType = {
      period: [],
      visitRecordEnum: undefined,
      pageNumber: 1,
      pageSize: 10,
    }
    const total = ref<number>(0)
    let search = reactive<SearchType>({ ...item })
    const tableLoading = ref<boolean>(false)
    const scrollY = ref<number>(200)
    const tableData = ref<TableData[]>([])
    // 查询紧急电话表格数据===================================================================================================
    // 获取紧急电话表格数据
    const requestPhoneNumberPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          period: search.period ? search.period.join(',') : '',
          visitRecordEnum: search.visitRecordEnum,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getPhoneNumberPage(params)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }
    requestPhoneNumberPage()
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      requestPhoneNumberPage()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      requestPhoneNumberPage()
    }
    const handelSearch = (): void => {
      search.pageNumber = 1
      requestPhoneNumberPage()
    }
    const reset = (): void => {
      search = reactive({ ...item })
      requestPhoneNumberPage()
    }
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '记录号',
        dataIndex: 'recordId',
        key: 'recordId'
      },
      {
        title: '使用时间',
        dataIndex: 'dataTime',
        key: 'dataTime',
        customRender: ({ text }: { text: number; }) => {
          return timestampToDate(text)
        }
      },
      {
        title: '设备编号',
        dataIndex: 'deviceCode',
        key: 'deviceCode',
        customRender: ({ text }: { text: string; }) => {
          return text || '-'
        }
      },
      {
        title: '设备区域',
        dataIndex: 'areaName',
        key: 'areaName',
        customRender: ({ text }: { text: string; }) => {
          return text || '-'
        }
      },
      {
        title: '紧急电话内容',
        dataIndex: 'fileUrl',
        key: 'fileUrl',
        customRender: ({ text }: { text: string; }) => {
          return <audio src={text} controls>浏览器不支持音频播放。</audio>
        }
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': () => {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem label='使用时间'>
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
        <GLayout title='紧急电话记录' showFooter={false} v-slots={gLayoutSlots} />
  }
})
