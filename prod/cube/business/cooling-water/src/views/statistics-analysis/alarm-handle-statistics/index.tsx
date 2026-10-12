import { defineComponent, onMounted, reactive } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Button, Form, FormItem, Input, DateRangePicker, Table, Select } from '@ghcloud/cube-ui'
import { getDeptOption } from '@/api'
import { getAlarmHandleStatistic, exportAlarmHandleStatistic } from '@/api/statistics-analysis'
import { GPagination } from '@/components/common/pagination'
import { downloadFileByBlob, convertObjForPath } from '@/utils/common'
import { getCurrentApplication } from '@/utils/auth'
interface DeptOptionState {
  enabled: boolean;
  id: string;
  level: number;
  members: null | string;
  name: string;
  parentId: null | string;
  remark: string;
  sequence: string;
  children: DeptOptionState[];
}
interface RecordState {
  averageProcessing: string;
  departmentId: string;
  departmentName: string;
  handlerNum: number;
  handlerRate: string;
  processingTime: number;
  progressConfirmedNum: number;
  suspendNum: number;
  timeoutNum: number;
  totalNum: number;
  userId: string;
  userName: string;
}
export const AlarmHandleStatistics = defineComponent({
  setup: () => {
    const state = reactive<{
      dataSource: RecordState[];
      deptOption: DeptOptionState[];
      fromState: {
        alarmPeriod: string[];
      };
      loading: boolean;
      exportLoading: boolean;
      searchParams: {
        departmentId: string | null;
        keyword: string;
        pageNumber: number;
        pageSize: number;
        total?: number;
      };
    }>({
      dataSource: [],
      deptOption: [],
      loading: false,
      exportLoading: false,
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        departmentId: null,
        keyword: '',
        total: 0
      },
      fromState: {
        alarmPeriod: []
      }
    })
    const columns = [
      {
        dataIndex: 'userName',
        title: '姓名',
      },
      {
        dataIndex: 'departmentName',
        title: '部门',
      },
      {
        dataIndex: 'totalNum',
        title: '负责的报警数',
        customRender: ({ record, column }: { record: RecordState; column: Record<string, string>; }): JSX.Element => {
          return (
            <>
              <Button
                type='link'
                onClick={() => {
                  handleGoRecord(column, record)
                }}
              >{record.totalNum}
              </Button>
            </>
          )
        }
      },
      {
        dataIndex: 'progressConfirmedNum',
        title: '处理中报警数',
        customRender: ({ record, column }: { record: RecordState; column: Record<string, string>; }): JSX.Element => {
          return (
            <>
              <Button
                type='link'
                onClick={() => {
                  handleGoRecord(column, record)
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
        customRender: ({ record, column }: { record: RecordState; column: Record<string, string>; }): JSX.Element => {
          return (
            <>
              <Button
                type='link'
                onClick={() => {
                  handleGoRecord(column, record)
                }}
              >{record.handlerNum}
              </Button>
            </>
          )
        }
      },
      {
        dataIndex: 'suspendNum',
        title: '已挂起报警数',
        customRender: ({ record, column }: { record: RecordState; column: Record<string, string>; }): JSX.Element => {
          return (
            <>
              <Button
                type='link'
                onClick={() => {
                  handleGoRecord(column, record)
                }}
              >{record.suspendNum}
              </Button>
            </>
          )
        }
      },
      {
        dataIndex: 'timeoutNum',
        title: '超时报警数',
        customRender: ({ record, column }: { record: RecordState; column: Record<string, string>; }): JSX.Element => {
          return (
            <>
              <Button
                type='link'
                onClick={() => {
                  handleGoRecord(column, record)
                }}
              >{record.timeoutNum}
              </Button>
            </>
          )
        }
      },
      {
        dataIndex: 'averageProcessing',
        title: '处理平均耗时',
      },
      {
        dataIndex: 'handlerRate',
        title: '处理完成率',
      },
    ]
    const getDeptOptions = async (): Promise<void> => {
      const { data } = await getDeptOption()
      state.deptOption = data
    }
    const getList = async (): Promise<void> => {
      state.loading = true
      try {
        const params = {
          ...state.searchParams,
          applicationCode: getCurrentApplication().code,
          period: state.fromState.alarmPeriod ? state.fromState.alarmPeriod.join(',') : ''
        }
        const { data } = await getAlarmHandleStatistic(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch {
        state.loading = false
      } finally {
        state.loading = false
      }
    }
    onMounted(() => {
      getDeptOptions()
      getList()
    })
    const handleGoRecord = (column: Record<string, string>, record: RecordState): void => {
      const { dataIndex } = column
      const period = state.fromState.alarmPeriod ? state.fromState.alarmPeriod.join(',') : ''
      // 通用路径参数
      const commonParams = {
        period,
        userId: record.userId,
        alarmEvent: null,
        userResponsible: true,
        alarmStatus: null,
        alarmHandlerTimeoutStatus: null
      }
      const dataIndexForParamsMap = new Map<string, Record<string, string | null | boolean | []>>([
        ['totalNum', { // 总数
          ...commonParams
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
          alarmHandlerTimeoutStatus: 'TIMED_OUT'
        }]
      ])
      if (!dataIndexForParamsMap.has(dataIndex)) return
      const paramsObj = dataIndexForParamsMap.get(dataIndex)
      if (paramsObj) {
        const params = convertObjForPath(paramsObj)
        history.pushState({}, '', `/portal/cooling-water/alarm-statastics-record?${params}`)
      }
    }
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page
      state.searchParams.pageSize = pageSize
      getList()
    }
    const handleChangePicker = (value: string[]): void => {
      state.fromState.alarmPeriod = value
    }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleExport = async (): Promise<void> => {
      state.exportLoading = true
      try {
        const params = {
          applicationCode: getCurrentApplication().code,
          period: state.fromState.alarmPeriod ? state.fromState.alarmPeriod.join(',') : '',
          departmentId: state.searchParams.departmentId,
          keyword: state.searchParams.keyword
        }
        const res = await exportAlarmHandleStatistic(params) as BlobPart
        downloadFileByBlob(res, '报警处理统计')
      } catch {
      } finally {
        state.exportLoading = false
      }
    }
    const handleReset = (): void => {
      state.searchParams.keyword = ''
      state.searchParams.departmentId = null
      state.fromState.alarmPeriod = []
      getList()
    }
    const layoutSlots = {
      'header-btn': (): JSX.Element => {
        return (<Button type='primary' onClick={handleExport} loading={state.exportLoading}>导出</Button>)
      },
      'content-search': (): JSX.Element => {
        return (
          <Form layout='inline'>
            <FormItem label='部门'>
              <Select options={state.deptOption} v-model:value={state.searchParams.departmentId} placeholder='请选择部门' style={{ width: '200px' }} fieldNames={{ label: 'name', value: 'id' }} allowClear />
            </FormItem>
            <FormItem label='报警时间'>
              <DateRangePicker v-model:value={state.fromState.alarmPeriod} onChangePicker={handleChangePicker} picker='date' valueFormat='YYYY-MM-DD' />
            </FormItem>
            <FormItem style={{ width: '200px' }}>
              <Input placeholder='请输入姓名' v-model:value={state.searchParams.keyword} showCount={false} />
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
            loading={state.loading}
            size='small'
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
        <GLayout title='报警处理统计' v-slots={layoutSlots} />
      </>
    )
  }
})
