import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, DateRangePicker, Form, FormItem, Table } from '@ghcloud/cube-ui'
import {
  getBusinessDetection,
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './co-detection-i'
import styles from './co-detection.module.less'
import { logger } from '@/logger'
import { timestampToDate, timestampToTime } from '@/utils/common'
export const CoDetection = defineComponent({
  setup: () => {
    const item: SearchType = {
      period: [],
      pageNumber: 1,
      pageSize: 10,
    }
    const total = ref<number>(0)
    let search = reactive<SearchType>({ ...item })
    const tableLoading = ref<boolean>(false)
    const tableData = ref<TableData[]>([])
    // 查询CO检测记录表格数据===================================================================================================
    // 获取CO检测记录表格数据
    const requestCoDetectionPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          period: search.period ? search.period.join(',') : '',
          dataTypeEnum: 'CO',
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getBusinessDetection(params)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }
    onMounted(() => {
      requestCoDetectionPage()
    })
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      requestCoDetectionPage()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      requestCoDetectionPage()
    }
    const handelSearch = (): void => {
      search.pageNumber = 1
      requestCoDetectionPage()
    }
    const reset = (): void => {
      search = reactive({ ...item })
      requestCoDetectionPage()
    }
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '检测记录',
        dataIndex: 'recordId',
        key: 'recordId',
        customRender: ({ text }: { text: string; }) => {
          return text || '--'
        }
      },
      {
        title: '检测时间',
        dataIndex: 'dataTime',
        key: 'dataTime',
        customRender: ({ text }: { text: number; }) => {
          return timestampToDate(text) + timestampToTime(text)
        }
      },
      {
        title: '设备编号',
        dataIndex: 'deviceId',
        key: 'deviceId',
        customRender: ({ text }: { text: string; }) => {
          return text || '--'
        }
      },
      {
        title: '设备区域',
        dataIndex: 'areaName',
        key: 'areaName',
        customRender: ({ text }: { text: string; }) => {
          return text || '--'
        }
      },
      {
        title: '一氧化碳浓度',
        dataIndex: 'dataValue',
        key: 'dataValue',
        customRender: ({ text }: { text: string; }) => {
          return text ? `${text}ppm` : '--'
        }
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': () => {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem label='检测时间'>
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
        <GLayout title='CO检测记录明细' showFooter={false} v-slots={gLayoutSlots} />
  }
})
