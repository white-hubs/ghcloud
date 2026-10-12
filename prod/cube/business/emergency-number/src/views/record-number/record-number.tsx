import { defineComponent, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Table, Form, FormItem, DateRangePicker } from '@ghcloud/cube-ui'
import {
  getRecordPage,
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './record-number-i'
import styles from './record-number.module.less'
import Select from '@ghcloud/cube-ui/src/components/select/select'
import { logger } from '@/logger'
import { getDate, timestampToDate, timestampToTime } from '@/utils/common'
export const RecordNumber = defineComponent({
  setup: () => {
    // const selectedLi = ref<GenreList | null>(null)
    logger.debug(getDate())
    const item: SearchType = {
      period: [getDate(), getDate()],
      visitRecordEnum: undefined,
      pageNumber: 1,
      pageSize: 10,
    }
    const total = ref<number>(0)
    let search = reactive<SearchType>({ ...item })
    const tableLoading = ref<boolean>(false)
    const scrollY = ref<number>(200)
    const tableData = ref<TableData[]>([])
    // 查询设备表格数据===================================================================================================
    // 获取设备表格数据
    const requestDevicePage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          period: search.period ? search.period.join(',') : '',
          visitRecordEnum: search.visitRecordEnum,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getRecordPage(params)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      requestDevicePage()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      requestDevicePage()
    }
    const handelSearch = (): void => {
      search.pageNumber = 1
      requestDevicePage()
    }
    const reset = (): void => {
      search = reactive({ ...item })
      requestDevicePage()
    }
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '就诊日期',
        dataIndex: 'visitTime',
        key: 'visitTime',
        customRender: ({ text }: { text: number; }) => {
          return timestampToDate(text)
        }
      },
      {
        title: '科室',
        dataIndex: 'subject',
        key: 'subject'
      },
      {
        title: '医生',
        dataIndex: 'doctor',
        key: 'doctor'
      },
      {
        title: '就诊卡ID',
        dataIndex: 'cardId',
        key: 'cardId'
      },
      {
        title: '就诊人姓名',
        dataIndex: 'medicalPersonnel',
        key: 'medicalPersonnel'
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        customRender: ({ text }: { text: string; }) => {
          return text === 'RESERVATION' ? '预约' : '已取消'
        }
      },
      {
        title: '签到时间',
        dataIndex: 'signTime',
        key: 'signTime',
        customRender: ({ text }: { text: number; }) => {
          return timestampToTime(text)
        }
      },
      {
        title: '就诊时间',
        dataIndex: 'visitTime',
        key: 'visitTime',
        customRender: ({ text }: { text: number; }) => {
          return timestampToTime(text)
        }
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': () => {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem label='就诊日期'>
                <DateRangePicker v-model:value={search.period} />
              </FormItem>
              <FormItem label='状态'>
                <Select allowClear options={[{ label: '预约成功', value: 'RESERVATION' }, { label: '已取消', value: 'CANCELLATION' }]} v-model:value={search.visitRecordEnum} />
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
        <GLayout title='排号记录' showFooter={false} v-slots={gLayoutSlots} />
  }
})
