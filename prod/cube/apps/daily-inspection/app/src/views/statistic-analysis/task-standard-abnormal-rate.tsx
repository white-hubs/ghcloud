import { defineComponent, reactive } from 'vue'
import { Button, Page, PopOver, Space } from '@ghcloud/cube-ui'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { usePageName } from '@ghcloud/cube-utils'
import { cubeDailyInspectionService } from '@/api/server'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'

const formatAbnormalRate = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '--'
  }
  if (typeof value === 'string' && value.includes('%')) {
    return value
  }
  const numValue = Number(value)
  if (Number.isNaN(numValue)) {
    return '--'
  }
  const displayValue = numValue <= 1 ? (numValue * 100) : numValue
  return `${Number(displayValue.toFixed(2))}%`
}

export const TaskStandardAbnormalRate = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      standardName: '',
      period: '',
    })
    const state = reactive({
      dataSource: [] as unknown[],
      exportLoading: false,
    })
    const formSchema = [
      {
        component: 'RangePicker',
        label: '执行时间',
        fieldName: 'period',
        componentProps: {
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
        }
      },
      {
        component: 'Input',
        label: '',
        fieldName: 'standardName',
        componentProps: {
          placeholder: '标准名称'
        }
      },
    ]
    const [CubeForm] = useCubeForm({
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      layout: 'horizontal',
      handleSubmit: (data) => {
        searchParams.standardName = data.standardName ? data.standardName as string : ''
        searchParams.period = data.period ? (data.period as string[]).join(',') : ''
        searchParams.pageNumber = 1
        tableApi.query()
      },
      handleReset: () => {
        searchParams.standardName = ''
        searchParams.period = ''
        searchParams.pageNumber = 1
        tableApi.query()
      },
      schema: formSchema,
      showCollapseButton: true
    })
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
        dataIndex: 'targetName',
        title: '对象名称',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => <PopOver content={text || ''}>{text || '--'}</PopOver>,
      },
      {
        dataIndex: 'nickname',
        title: '执行人',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => <PopOver content={text || ''}>{text || '--'}</PopOver>,
      },
      {
        dataIndex: 'updateTime',
        title: '执行时间',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        },
      },
      {
        dataIndex: 'standardName',
        title: '任务标准名称',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => <PopOver content={text || ''}>{text || '--'}</PopOver>,
      },
      {
        dataIndex: 'taskName',
        title: '任务名称',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => <PopOver content={text || ''}>{text || '--'}</PopOver>,
      },
      {
        dataIndex: 'totalItemCount',
        title: '标准项个数',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: number; }): JSX.Element => <PopOver content={String(text ?? '--')}>{text ?? '--'}</PopOver>,
      },
      {
        dataIndex: 'abnormalItemCount',
        title: '异常数',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: number; }): JSX.Element => <PopOver content={String(text ?? '--')}>{text ?? '--'}</PopOver>,
      },
      {
        dataIndex: 'abnormalRate',
        title: '异常率',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: number | string; }): JSX.Element => {
          const rate = formatAbnormalRate(text)
          return <PopOver content={rate}>{rate}</PopOver>
        },
      },
    ]
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: 'id',
      fetchApi: async () => {
        return cubeDailyInspectionService.getTaskStandardAbnormalRate({
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          standardName: searchParams.standardName,
          period: searchParams.period,
        })
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total
        state.dataSource = data.records ?? []
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
        const blob = await cubeDailyInspectionService.getTaskStandardAbnormalRateExport({
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          standardName: searchParams.standardName,
          period: searchParams.period,
        })
        const href = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = href
        link.download = `${pageTitle || '任务标准项异常率统计'}.xlsx`
        document.body.append(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(href)
      } finally {
        state.exportLoading = false
      }
    }
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
