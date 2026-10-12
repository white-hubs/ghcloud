import { defineComponent, onMounted, reactive, ref, onBeforeMount } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Button, Table, Form, FormItem, Select, DateRangePicker, Input } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { getAlarmRecord } from '@/api/statistics-analysis'
import { getAlarmLevels } from '@/api/alarm'
import { GPagination } from '@/components/common/pagination'
import { alarmOvertimeOptions, alarmHandleOptions, alarmHandlerResultOptions } from './index.i'
import { DesignateModal } from './component/designate-modal'
import { PendingModal } from './component/pending-modal'
import { HandleModal } from './component/handle-modal'
import styles from './index.module.less'
import dayjs from 'dayjs'
import { getCurrentApplication } from '@/utils/auth'
export const AlarmRecordList = defineComponent({
  setup: () => {
    const state = reactive({
      dataSource: [],
      loading: false,
      exportLoading: false,
      pendingVisible: false,
      handlerVisible: false,
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        keyword: '',
        alarmStatus: null,
        alarmHandlerResult: null,
        alarmHandlerTimeoutStatus: null,
        alarmLevelId: null,
        total: 0
      },
      selectRow: '',

    })
    const route = useRoute()
    const alarmPeriod = ref<string[]>([])
    const alarmLevelOptions = ref<Record<string, string>[]>([])
    const designateModalRef = ref<{ openModal: () => void; }>()
    const columns = [
      {
        dataIndex: 'alarmEventName',
        title: '报警事件',
      },
      {
        dataIndex: 'alarmLevelName',
        title: '报警级别',
      },
      {
        dataIndex: 'areaName',
        title: '报警区域',
      },
      {
        dataIndex: 'alarmTime',
        title: '报警时间',
        slots: {
          customRender: 'alarmTime'
        },
        customRender: ({ text }: { text: string; }): string => {
          return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
        }
      },
      {
        dataIndex: 'alarmTargetName',
        title: '报警设备',
      },
      {
        dataIndex: 'timeoutProcessTimes',
        title: '处理时限',
      },
      {
        dataIndex: 'alarmHandlerTimeoutStatusName',
        title: '超时状态',
      },
      {
        dataIndex: 'alarmStatusName',
        title: '处理状态',
      },
      {
        dataIndex: 'estimateHandlerTime',
        title: '预计处理时间',
        customRender: ({ text }: { text: number; }): string => {
          return text ? dayjs(text).format('YYYY-MM-DD hh:mm:ss') : '--'
        }
      },
      {
        dataIndex: 'alarmHandlerName',
        title: '处理人',
        customRender: ({ text }: { text: string; }): string => {
          return text ?? '--'
        }
      },
      {
        dataIndex: 'action',
        title: '操作',
        width: 180,
        customRender: ({ record }: { record: Record<string, string>; }): JSX.Element => {
          const { alarmStatus } = record
          const designateOrHandleStatus = ['ALARM_PROGRESS_CONFIRMED', 'ALARM_SUSPEND', 'ALARM_UN_CONFIRMED'] // 指派及处理状态
          return (
            <>
              <Button type='link' onClick={() => {
                handleInfo(record)
              }}>详情</Button>
              {designateOrHandleStatus.includes(alarmStatus) && <> <Button type='link' onClick={() => {
                handleDesignate(record.id)
              }}>指派</Button>  <Button type='link' onClick={() => {
                handleAlarm(record.id)
              }}>处理</Button></>}
              {alarmStatus === 'ALARM_PROGRESS_CONFIRMED' && <> <Button type='link' onClick={() => {
                handlePending(record.id)
              }}>挂起</Button></>}
            </>
          )
        }
      }
    ]

    const handleAlarm = (id: string): void => {
      state.handlerVisible = true
      state.selectRow = id
    }
    const handleInfo = (record: Record<string, string>): void => {
      const { id, businessKey } = record
      history.pushState({}, '', `/portal/cooling-water/alarm-detail?id=${id}&businessKey=${businessKey}&searchValue=${JSON.stringify(state.searchParams)}`)
    }
    const handleDesignate = (id: string): void => {
      designateModalRef.value?.openModal()
      state.selectRow = id
    }
    interface SearchState {
      pageNumber: number;
      pageSize: number;
      keyword: string;
      alarmStatus: null;
      alarmHandlerResult: null;
      alarmHandlerTimeoutStatus: null;
      alarmLevelId: null;
      total: number;
    }
    onBeforeMount(() => {
      if (route.query.searchValue) {
        state.searchParams = JSON.parse(route.query.searchValue as string) as unknown as SearchState
      }
    })
    const handlePending = (id: string): void => {
      state.pendingVisible = true
      state.selectRow = id
    }
    const getList = async (): Promise<void> => {
      state.loading = true
      try {
        const params: Record<string, string | boolean | number | null> = {
          ...state.searchParams,
          applicationCode: getCurrentApplication().code ?? 'ELECTRICMANAGE',
          period: alarmPeriod.value ? alarmPeriod.value.join(',') : ''
        }
        const { data } = await getAlarmRecord(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch {
      } finally {
        state.loading = false
      }
    }
    const getAlarmLevelsOptions = async (): Promise<void> => {
      const { data } = await getAlarmLevels()
      alarmLevelOptions.value = data
    }
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page
      state.searchParams.pageSize = pageSize
      getList()
    }
    onMounted(() => {
      getAlarmLevelsOptions()
      getList()
    })
    const handlePickerChange = (val: string[]): void => {
      alarmPeriod.value = val
    }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      const initParams = {
        pageNumber: 1,
        pageSize: 10,
        keyword: '',
        alarmStatus: null,
        alarmHandlerResult: null,
        alarmHandlerTimeoutStatus: null,
        alarmLevelId: null,
        total: 0
      }
      state.searchParams = initParams
    }
    const layoutSlots = {
      'content-search': (): JSX.Element => {
        return (
          <Form layout='inline'>
            <FormItem>
              <Input placeholder='请输入设备名称/报警事件' v-model:value={state.searchParams.keyword} showCount={false} />
            </FormItem>
            <FormItem label='报警级别'>
              <Select placeholder='请选择报警级别' allowClear options={alarmLevelOptions.value} style={{ width: '140px' }} fieldNames={{ label: 'name', value: 'name' }} v-model:value={state.searchParams.alarmLevelId} />
            </FormItem>
            <FormItem label='处理状态'>
              <Select placeholder='请选择处理状态' allowClear options={alarmHandleOptions} style={{ width: '140px' }} v-model:value={state.searchParams.alarmStatus} />
            </FormItem>
            <FormItem label='处理结果'>
              <Select placeholder='请选择处理结果' allowClear options={alarmHandlerResultOptions} style={{ width: '140px' }} v-model:value={state.searchParams.alarmHandlerResult} />
            </FormItem>
            <FormItem label='超时状态'>
              <Select placeholder='请选择超时状态' allowClear options={alarmOvertimeOptions} style={{ width: '140px' }} v-model:value={state.searchParams.alarmHandlerTimeoutStatus} />
            </FormItem>
            <FormItem label='报警时间'>
              <DateRangePicker v-model:value={alarmPeriod.value} allowClear onChangePicker={handlePickerChange} picker='date' valueFormat='YYYY-MM-DD' />
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
            loading={state.loading}
            pagination={false}
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
      },
    }
    return (): JSX.Element => (
      <div class={styles['alarm-record']}>
        <GLayout title='报警记录' v-slots={layoutSlots} />
        <PendingModal v-model:visible={state.pendingVisible} v-model:selectRow={state.selectRow} onGetList={getList} />
        <DesignateModal v-model:selectRow={state.selectRow} ref={designateModalRef} onGetList={getList} />
        <HandleModal v-model:visible={state.handlerVisible} v-model:selectRow={state.selectRow} onGetList={getList} />
      </div>
    )
  }
})
