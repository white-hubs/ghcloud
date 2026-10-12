import { defineComponent, onMounted, reactive } from 'vue'
import { Button, Page, PopOver, Space } from '@ghcloud/cube-ui'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { usePageName } from '@ghcloud/cube-utils'
import { cubeDailyInspectionService } from '@/api/server'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import type { InspectPlanStatisticsVO } from '@ghcloud/cube-daily-inspection-service'

const getDefaultMonthPeriod = (): [string, string] => {
  const begin = dayjs().startOf('month').format('YYYY-MM-DD')
  const end = dayjs().format('YYYY-MM-DD')
  return [begin, end]
}

const normalizePeriod = (period: unknown): string => {
  if (Array.isArray(period)) {
    return period.filter(Boolean).map(String).join(',')
  }
  return period ? String(period) : ''
}

export const PlanStatistics = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const router = useRouter()
    const tableCode = route.path.replaceAll('/', '')
    const [defaultBegin, defaultEnd] = getDefaultMonthPeriod()
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      period: `${defaultBegin},${defaultEnd}`,
      typeId: '',
      name: '',
    })
    const state = reactive({
      dataSource: [] as InspectPlanStatisticsVO[],
      exportLoading: false,
    })

    const formSchema = [
      {
        component: 'RangePicker',
        label: '查询时间',
        fieldName: 'period',
        defaultValue: [defaultBegin, defaultEnd],
        componentProps: {
          valueFormat: 'YYYY-MM-DD',
        }
      },
      {
        component: 'Select',
        label: '巡检类型',
        fieldName: 'typeId',
        defaultValue: '',
        componentProps: {
          allowClear: true,
          placeholder: '巡检类型',
        },
      },
      {
        component: 'Input',
        label: '',
        fieldName: 'name',
        componentProps: {
          placeholder: '任务名称'
        }
      },
    ]

    const [CubeForm, formApi] = useCubeForm({
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        if (!searchParams.period) {
          searchParams.period = `${defaultBegin},${defaultEnd}`
          formApi.formValues.period = [defaultBegin, defaultEnd]
        }
        tableApi.query()
      },
      layout: 'horizontal',
      handleSubmit: (data) => {
        searchParams.period = normalizePeriod(data.period)
        searchParams.typeId = data.typeId ? String(data.typeId) : ''
        searchParams.name = data.name ? String(data.name) : ''
        searchParams.pageNumber = 1
        tableApi.query()
      },
      handleReset: () => {
        searchParams.period = `${defaultBegin},${defaultEnd}`
        searchParams.typeId = ''
        searchParams.name = ''
        searchParams.pageNumber = 1
        formApi.formValues.period = [defaultBegin, defaultEnd]
        tableApi.query()
      },
      schema: formSchema,
      showCollapseButton: true
    })

    const buildInspectTaskQuery = (record: InspectPlanStatisticsVO, status?: string, pendingOnly?: boolean): Record<string, string> => {
      const query: Record<string, string> = {}
      query.fromPlanStatistics = '1'
      const period = normalizePeriod(searchParams.period)
      if (period) {
        query.period = period
      }
      if (searchParams.typeId || record.typeId) {
        query.typeId = searchParams.typeId || String(record.typeId ?? '')
      }
      if (searchParams.name || record.name) {
        query.keyword = searchParams.name || record.name || ''
      }
      if (status) {
        query.status = status
      }
      if (pendingOnly) {
        query.pendingOnly = '1'
      }
      return query
    }

    const drillText = (value: number | undefined, query: Record<string, string>): JSX.Element => (
      <Button type='link' size='small' onClick={() => router.push({ path: '/inspect-task', query })}>
        {value ?? 0}
      </Button>
    )

    const columns = [
      {
        title: '序号',
        dataIndex: '',
        align: 'center',
        width: 70,
        customRender: ({ index }: { index: number; }): JSX.Element => {
          const serial = (searchParams.pageNumber - 1) * searchParams.pageSize + index + 1
          return <PopOver content={String(serial)}>{serial}</PopOver>
        },
      },
      {
        dataIndex: 'name',
        title: '任务名称',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => <PopOver content={text || ''}>{text || '--'}</PopOver>,
      },
      {
        dataIndex: 'typeName',
        title: '巡检类型',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => <PopOver content={text || ''}>{text || '--'}</PopOver>,
      },
      {
        dataIndex: 'taskTotal',
        title: '任务数',
        align: 'center',
        customRender: ({ record }: { record: InspectPlanStatisticsVO; }): JSX.Element => (
          drillText(record.taskTotal, buildInspectTaskQuery(record))
        ),
      },
      {
        dataIndex: 'completedTaskTotal',
        title: '已完成任务数',
        align: 'center',
        customRender: ({ record }: { record: InspectPlanStatisticsVO; }): JSX.Element => (
          drillText(record.completedTaskTotal, buildInspectTaskQuery(record, 'OVER'))
        ),
      },
      {
        dataIndex: 'pendingTaskTotal',
        title: '待完成任务数',
        align: 'center',
        customRender: ({ record }: { record: InspectPlanStatisticsVO; }): JSX.Element => (
          drillText(record.pendingTaskTotal, buildInspectTaskQuery(record, undefined, true))
        ),
      },
      {
        dataIndex: 'objectTotal',
        title: '对象总数',
        align: 'center',
        customRender: ({ text }: { text: number; }): JSX.Element => <PopOver content={String(text ?? '--')}>{text ?? '--'}</PopOver>,
      },
      {
        dataIndex: 'inspectedObjectTotal',
        title: '已巡检对象数',
        align: 'center',
        customRender: ({ text }: { text: number; }): JSX.Element => <PopOver content={String(text ?? '--')}>{text ?? '--'}</PopOver>,
      },
      {
        dataIndex: 'pendingObjectTotal',
        title: '待巡检对象数',
        align: 'center',
        customRender: ({ text }: { text: number; }): JSX.Element => <PopOver content={String(text ?? '--')}>{text ?? '--'}</PopOver>,
      },
      {
        dataIndex: 'abnormalItemTotal',
        title: '异常巡检项数',
        align: 'center',
        customRender: ({ text }: { text: number; }): JSX.Element => <PopOver content={String(text ?? '--')}>{text ?? '--'}</PopOver>,
      },
      {
        dataIndex: 'unhandledAbnormalItemTotal',
        title: '未处理异常项数',
        align: 'center',
        customRender: ({ text }: { text: number; }): JSX.Element => <PopOver content={String(text ?? '--')}>{text ?? '--'}</PopOver>,
      },
      {
        dataIndex: 'handledAbnormalItemTotal',
        title: '已处理异常项数',
        align: 'center',
        customRender: ({ text }: { text: number; }): JSX.Element => <PopOver content={String(text ?? '--')}>{text ?? '--'}</PopOver>,
      },
    ]

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: 'name',
      fetchApi: async () => {
        const period = normalizePeriod(searchParams.period)
        const payload = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          ...(period ? { period } : {}),
          ...(searchParams.typeId ? { typeId: searchParams.typeId } : {}),
          ...(searchParams.name ? { name: searchParams.name } : {}),
        }
        return cubeDailyInspectionService.getPlanStatistics(payload)
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total
        state.dataSource = (data.records ?? []) as InspectPlanStatisticsVO[]
      }
    })

    const handleChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber
      searchParams.pageSize = pageSize
      tableApi.query()
    }

    const handleExport = async (): Promise<void> => {
      try {
        state.exportLoading = true
        const period = normalizePeriod(searchParams.period)
        const payload = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          ...(period ? { period } : {}),
          ...(searchParams.typeId ? { typeId: searchParams.typeId } : {}),
          ...(searchParams.name ? { name: searchParams.name } : {}),
        }
        const blob = await cubeDailyInspectionService.getPlanStatisticsExport(payload)
        const href = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = href
        link.download = `${pageTitle || '计划统计'}.xlsx`
        document.body.append(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(href)
      } finally {
        state.exportLoading = false
      }
    }

    onMounted(async () => {
      const result = await cubeDailyInspectionService.getInspectTypeList()
      formApi.updateFieldSchema({
        component: 'Select',
        label: '巡检类型',
        fieldName: 'typeId',
        defaultValue: '',
        componentProps: {
          options: result,
          placeholder: '巡检类型',
          allowClear: true,
          fieldNames: { label: 'name', value: 'id' },
        }
      })
      formApi.formValues.typeId = searchParams.typeId
    })

    const slots = {
      'layout-header': (): JSX.Element => (
        <Space>
          <Button disabled={!state.dataSource.length} type='primary' onClick={handleExport} loading={state.exportLoading}>导出</Button>
        </Space>
      ),
      'layout-content': (): JSX.Element => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      'footer-page': (): JSX.Element => (
        <Page
          current={searchParams.pageNumber}
          pageSize={searchParams.pageSize}
          total={searchParams.total}
          onPageChange={handleChange}
        />
      ),
    }
    return (): JSX.Element => (
      <CubeLayout title={pageTitle} v-slots={slots} showTableXScroll />
    )
  }
})
