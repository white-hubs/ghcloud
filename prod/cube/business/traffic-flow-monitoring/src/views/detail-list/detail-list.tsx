import { defineComponent, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Table, Form, FormItem, DateRangePicker } from '@ghcloud/cube-ui'
import {
  getVehicleFlowPage,
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './detail-list-i'
import styles from './detail-list.module.less'
import { logger } from '@/logger'
import { timestampToDate } from '@/utils/common'
export const DetailList = defineComponent({
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
        const res = await getVehicleFlowPage(params)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }
    requestDevicePage()
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
        title: '检测记录号',
        dataIndex: 'recordId',
        key: 'recordId',
      },
      {
        title: '记录时间',
        dataIndex: 'dataTime',
        key: 'dataTime',
        customRender: ({ text }: { text: number; }): string => {
          return timestampToDate(text)
        }
      },
      {
        title: '设备编号',
        dataIndex: 'deviceCode',
        key: 'deviceCode',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '设备区域',
        dataIndex: 'areaName',
        key: 'areaName',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '检测方向',
        dataIndex: 'direction',
        key: 'direction',
        customRender: ({ text }: { text: string; }): JSX.Element | string => {
          return text ? <div>{text === 'DIRECTION_IN' ? '驶入' : '驶出'}</div> : '-'
        }
      },
      {
        title: '车道',
        dataIndex: 'lane',
        key: 'lane',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '车流量',
        dataIndex: 'trafficVolume',
        key: 'trafficVolume',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '平均车速',
        dataIndex: 'averageSpeed',
        key: 'averageSpeed',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '时间占有率',
        dataIndex: 'timeOccupancyRate',
        key: 'timeOccupancyRate',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '平均车头时距',
        dataIndex: 'averageHeadway',
        key: 'averageHeadway',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '平均车间时距',
        dataIndex: 'averageTimeInterval',
        key: 'averageTimeInterval',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': (): JSX.Element => {
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
      'content-table': (): JSX.Element => {
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
    return (): JSX.Element=>
      <GLayout title='车流明细' showFooter={false} v-slots={gLayoutSlots} />
  }
})
