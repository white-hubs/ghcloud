import { defineComponent, onMounted, reactive } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Button, Table } from '@ghcloud/cube-ui'
import { useRoute, useRouter } from 'vue-router'
import { getCommonAlarmRecord, exportAlarmRecord } from '@/api/statistics-analysis'
import { GPagination } from '@/components/common/pagination'
import { downloadFileByBlob } from '@/utils/common'
import { getCurrentApplication } from '@/utils/auth'
import dayjs from 'dayjs'
export const AlarmStatasticsRecord = defineComponent({
  setup: () => {
    const state = reactive({
      dataSource: [],
      loading: false,
      exportLoading: false,
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        total: 0
      }
    })
    const route = useRoute()
    const router = useRouter()
    const columns = [
      {
        dataIndex: 'alarmTime',
        title: '报警时间',
        slots: {
          customRender: 'alarmTime'
        },
        customRender: ({ text }: { text: string; }): string => {
          return dayjs(text).format('YYYY-MM-DD HH:mm:ss')
        }
      },
      {
        dataIndex: 'alarmTargetName',
        title: '报警设备',
      },
      {
        dataIndex: 'alarmLevelName',
        title: '报警级别',
      },
      {
        dataIndex: 'alarmEventName',
        title: '报警事件',
      },
      {
        dataIndex: 'areaName',
        title: '报警区域',
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
        customRender: ({ text }: { text: string; }): string => {
          return text ?? '--'
        }
      },
      {
        dataIndex: 'alarmHandlerName',
        title: '处理人',
        customRender: ({ text }: { text: string; }): string => {
          return text ?? '--'
        }
      },
    ]
    const getList = async (): Promise<void> => {
      state.loading = true
      try {
        const params: Record<string, string | boolean | number> = {
          ...route.query,
          ...state.searchParams,
          applicationCode: getCurrentApplication().code,
        }
        if (route.query.userResponsible) {
          params.userResponsible = route.query.userResponsible === 'true'
        }
        const { data } = await getCommonAlarmRecord(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch {
      } finally {
        state.loading = false
      }
    }
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page
      state.searchParams.pageSize = pageSize
      getList()
    }
    const handleBack = (): void => {
      router.back()
    }
    const handleExport = async (): Promise<void> => {
      state.exportLoading = true
      try {
        const params: Record<string, string | boolean | number | null> = {
          ...route.query,
          applicationCode: getCurrentApplication().code,
        }
        if (route.query.userResponsible) {
          params.userResponsible = route.query.userResponsible === 'true'
        }
        for (const key in params) {
          if (params[key] === '') {
            params[key] = null
          }
        }

        const res = await exportAlarmRecord(params) as BlobPart
        downloadFileByBlob(res, '报警记录统计')
      } catch {
      } finally {
        state.exportLoading = false
      }
    }
    onMounted(() => {
      getList()
    })
    const layoutSlots = {
      'header-btn': (): JSX.Element => {
        return (<Button type='primary' onClick={handleExport} loading={state.exportLoading}>导出</Button>)
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
      'footer-btn': (): JSX.Element => {
        return <Button type='primary' onClick={handleBack}>返回</Button>
      }
    }
    return (): JSX.Element => (
      <GLayout title='报警记录' showSearch={false} v-slots={layoutSlots} />
    )
  }
})
