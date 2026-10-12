import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Button, Form, FormItem, Input, DateRangePicker, Table } from '@ghcloud/cube-ui'
import { getAlarmStatistic, exportAlarmStatistic } from '@/api/statistics-analysis'
import { GPagination } from '@/components/common/pagination'
import { convertObjForPath, downloadFileByBlob } from '@/utils/common'
import { getCurrentApplication } from '@/utils/auth'
export const AlarmStatistics = defineComponent({
  setup: () => {
    const state = reactive({
      dataSource: [],
      loading: false,
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        total: 10,
        keyword: ''
      },
      exportLoading: false
    })
    const alarmPeriod = ref<string[]>([])
    const columns = [
      {
        dataIndex: 'alarmEventName',
        title: '报警事件',
      },
      {
        dataIndex: 'totalNum',
        title: '报警总数',
      },
      {
        dataIndex: 'unConfirmedNum',
        title: '待接收报警数',
        customRender: ({ record, column }: { record: Record<string, string>;column: Record<string, string>; }): JSX.Element => {
          return (
            <>
              <Button
                type='link'
                onClick={() => {
                  handleGoRecord(record, column)
                }}
              >{record.unConfirmedNum}
              </Button>
            </>
          )
        }
      },
      {
        dataIndex: 'progressConfirmedNum',
        title: '处理中报警数',
        customRender: ({ record, column }: { record: Record<string, string>;column: Record<string, string>; }): JSX.Element => {
          return (
            <>
              <Button
                type='link'
                onClick={() => {
                  handleGoRecord(record, column)
                }}
              >{record.progressConfirmedNum}
              </Button>
            </>
          )
        }
      },
      {
        dataIndex: 'handlerNum',
        title: '已处理报警数',
        customRender: ({ record, column }: { record: Record<string, string>;column: Record<string, string>; }): JSX.Element => {
          return (
            <>
              <Button
                onClick={() => {
                  handleGoRecord(record, column)
                }}
                type='link'
              >{record.handlerNum}
              </Button>
            </>
          )
        }
      },
      {
        dataIndex: 'suspendNum',
        title: '已挂起报警数',
        customRender: ({ record, column }: { record: Record<string, string>;column: Record<string, string>; }): JSX.Element => {
          return (
            <>
              <Button
                onClick={() => {
                  handleGoRecord(record, column)
                }}
                type='link'
              >{record.suspendNum}
              </Button>
            </>
          )
        }
      },
      {
        dataIndex: 'timeoutNum',
        title: '超时报警数',
        customRender: ({ record, column }: { record: Record<string, string>;column: Record<string, string>; }): JSX.Element => {
          return (
            <>
              <Button
                onClick={() => {
                  handleGoRecord(record, column)
                }}
                type='link'
              >{record.timeoutNum}
              </Button>
            </>
          )
        }
      },
    ]
    const getList = async (): Promise<void> => {
      state.loading = true
      try {
        const params = {
          ...state.searchParams,
          period: alarmPeriod.value ? alarmPeriod.value.join(',') : '',
          applicationCode: getCurrentApplication().code,
        }
        const { data } = await getAlarmStatistic(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch {
      } finally {
        state.loading = false
      }
    }
    const handleGoRecord = (record: Record<string, string>, column: Record<string, string>): void => {
      const { dataIndex } = column

      const period = alarmPeriod.value ? alarmPeriod.value.join(',') : ''
      // 通用参数
      const commonParams = {
        period,
        alarmEvent: record.alarmEvent,
        alarmEventName: record.alarmEventName,
        userId: null,
        alarmHandlerTimeoutStatus: null,
      }
      const dataIndexForParamsMap = new Map<string, Record<string, string | null | boolean | []>>([
        ['unConfirmedNum', { // 总数
          ...commonParams,
          alarmStatus: 'ALARM_UN_CONFIRMED',
        }],
        ['progressConfirmedNum', { // 处理中
          ...commonParams,
          alarmStatus: 'ALARM_PROGRESS_CONFIRMED',
        }],
        ['handlerNum', { // 已处理
          ...commonParams,
          alarmStatus: 'ALARM_HANDLER',
        }],
        ['suspendNum', { // 已挂起
          ...commonParams,
          alarmStatus: 'ALARM_SUSPEND',
        }],
        ['timeoutNum', { // 超时
          ...commonParams,
          alarmStatus: null,
          alarmHandlerTimeoutStatus: 'TIMED_OUT',
        }]
      ])
      if (!dataIndexForParamsMap.has(dataIndex)) return
      const paramsObj = dataIndexForParamsMap.get(dataIndex)

      if (paramsObj) {
        const params = convertObjForPath(paramsObj)
        history.pushState({}, '', `/portal/cooling-water/alarm-statastics-record?${params}`)
      }
      // history.pushState({}, '', '/portal/cooling-water/alarm-record')
    }
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page
      state.searchParams.pageSize = pageSize
      getList()
    }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    onMounted(() => {
      getList()
    })
    const handleChangePicker = (val: string[]): void => {
      alarmPeriod.value = val
    }
    const handleReset = (): void => {
      alarmPeriod.value = []
      state.searchParams.keyword = ''
      getList()
    }
    const handleExport = async (): Promise<void> => {
      state.exportLoading = true
      try {
        const params = {
          applicationCode: getCurrentApplication().code,
          period: alarmPeriod.value ? alarmPeriod.value.join(',') : '',
          keyword: state.searchParams.keyword
        }
        const res = await exportAlarmStatistic(params) as BlobPart
        downloadFileByBlob(res, '报警统计')
      } catch {
      } finally {
        state.exportLoading = false
      }
    }
    const layoutSlots = {
      'header-btn': (): JSX.Element => {
        return (<Button type='primary' loading={state.exportLoading} onClick={handleExport}>导出</Button>)
      },
      'content-search': (): JSX.Element => {
        return (
          <Form layout='inline'>
            <FormItem label='报警时间'>
              <DateRangePicker v-model:value={alarmPeriod.value} onChangePicker={handleChangePicker} picker='date' valueFormat='YYYY-MM-DD' />
            </FormItem>
            <FormItem style={{ width: '200px' }}>
              <Input placeholder='请输入' v-model:value={state.searchParams.keyword} showCount={false} />
            </FormItem>
            <FormItem>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button type='primary' onClick={handleSearch}>查询</Button>
                <Button onClick={handleReset}>重置</Button>
              </div>
            </FormItem>
          </Form>
        )
      },
      'content-table': (): JSX.Element => {
        return (
          <Table
            dataSource={state.dataSource}
            columns={columns}
            pagination={false}
            size='small'
            loading={state.loading}
            scrollY={500}
          />
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <GPagination
              current={state.searchParams.pageNumber}
              pageSize={state.searchParams.pageSize}
              total={state.searchParams.total ?? 0}
              onChange={changePage}
            />
          </>
        )
      }
    }
    return (): JSX.Element => (
      <>
        <GLayout title='报警统计' v-slots={layoutSlots} />
      </>
    )
  }
})
