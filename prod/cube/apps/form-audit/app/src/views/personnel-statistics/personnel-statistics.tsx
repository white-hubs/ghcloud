import { cubeFormAuditService } from '@/api/service'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import type { Department } from '@ghcloud/cube-form-audit-service'
import { Button, DateRangePicker, Page, PopOver, Space, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import dayjs from 'dayjs'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

type FormValueDate = Date | string | number

export const PersonnelStatistics = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const exportLoading = ref(false)
    const deptOptions = ref<{ label: string; value: string }[]>([])

    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    })

    const monthStartDate = dayjs().startOf('month').format('YYYY-MM-DD')
    const monthEndDate = dayjs().format('YYYY-MM-DD')

    const readApplicationCode = (): string => {
      try {
        const raw = sessionStorage.getItem('GH-currentApplication')
        if (!raw) return ''
        const parsed = JSON.parse(raw) as { code?: string }
        return typeof parsed.code === 'string' ? parsed.code : ''
      } catch {
        return ''
      }
    }

    const formatPeriod = (period: unknown): string => {
      if (!Array.isArray(period) || period.length !== 2) return ''
      const [start, end] = period as [FormValueDate, FormValueDate]
      if (!start || !end) return ''
      const startDate = dayjs(start).isValid() ? dayjs(start).format('YYYY-MM-DD') : String(start)
      const endDate = dayjs(end).isValid() ? dayjs(end).format('YYYY-MM-DD') : String(end)
      return `${startDate},${endDate}`
    }

    const searchFormSchema = [
      {
        component: 'Input',
        label: '人员',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '请输入人员名称',
          allowClear: true,
        },
      },
      {
        component: 'Select',
        label: '部门',
        fieldName: 'organizationId',
        defaultValue: undefined,
        componentProps: {
          placeholder: '请选择',
          allowClear: true,
          options: deptOptions.value,
        },
      },
      {
        component: DateRangePicker,
        label: '时间',
        fieldName: 'period',
        defaultValue: [monthStartDate, monthEndDate],
        componentProps: {
          valueFormat: 'YYYY-MM-DD',
          allowClear: true,
        },
      },
    ]

    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      schema: searchFormSchema,
      showCollapseButton: true,
      handleSubmit: () => {
        page.pageNumber = 1
        tableApi.query()
      },
      handleReset: () => {
        page.pageNumber = 1
        tableApi.query()
      },
    })

    const columns = [
      {
        title: '序号',
        dataIndex: 'tableIndex',
        width: 80,
        align: 'center' as const,
        customRender: ({ index }: { index: number }): JSX.Element => {
          return <>{index + 1}</>
        },
      },
      {
        title: '人员',
        dataIndex: 'userName',
        ellipsis: true,
        align: 'center' as const,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ''}>{text || '--'}</PopOver>,
      },
      {
        title: '所属部门',
        dataIndex: 'organizationName',
        ellipsis: true,
        align: 'center' as const,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ''}>{text || '--'}</PopOver>,
      },
      {
        title: '工单数',
        dataIndex: 'totalNumber',
        ellipsis: true,
        align: 'center' as const,
        customRender: ({ text }: { text: string | number }): JSX.Element => <PopOver content={String(text ?? '')}>{text ?? '--'}</PopOver>,
      },
      {
        title: '待处理',
        dataIndex: 'waitNumber',
        ellipsis: true,
        align: 'center' as const,
        customRender: ({ text }: { text: string | number }): JSX.Element => <PopOver content={String(text ?? '')}>{text ?? '--'}</PopOver>,
      },
      {
        title: '已处理',
        dataIndex: 'dealNumber',
        ellipsis: true,
        align: 'center' as const,
        customRender: ({ text }: { text: string | number }): JSX.Element => <PopOver content={String(text ?? '')}>{text ?? '--'}</PopOver>,
      },
      {
        title: '处理率',
        dataIndex: 'dealRate',
        ellipsis: true,
        align: 'center' as const,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ''}>{text || '--'}</PopOver>,
      },
      {
        title: '平均处理时长',
        dataIndex: 'avgWaitTime',
        ellipsis: true,
        align: 'center' as const,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ''}>{text || '--'}</PopOver>,
      },
    ]

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: 'id',
      fetchApi: async () => {
        const appCode = readApplicationCode()
        const { keyword, organizationId, period } = formApi.formValues
        return cubeFormAuditService.getWorkOrderStatisticsByUser({
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          applicationCode: appCode,
          keyword: String(keyword ?? '').trim() || undefined,
          organizationId: typeof organizationId === 'string' && organizationId ? organizationId : undefined,
          period: formatPeriod(period),
        })
      },
      fetchLoaded: (data) => {
        page.total = data.total
      },
    })

    const loadDeptOptions = async (): Promise<void> => {
      try {
        const rows = await cubeFormAuditService.getOrganizations({
          pageNumber: 1,
          pageSize: 1000,
          name: '',
          enabled: true,
        })
        const list = Array.isArray(rows) ? rows : []
        deptOptions.value = list.map((item: Department) => ({
          label: item.name,
          value: item.id,
        }))
        formApi.updateFieldSchema({
          component: 'Select',
          label: '部门',
          fieldName: 'organizationId',
          defaultValue: undefined,
          componentProps: {
            placeholder: '请选择',
            allowClear: true,
            options: deptOptions.value,
          },
        })
      } catch {
        // ApiProxy.errorNotify 已提示
      }
    }

    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber
      page.pageSize = pageSize
      tableApi.query()
    }

    const handleExport = async (): Promise<void> => {
      try {
        exportLoading.value = true
        const appCode = readApplicationCode()
        const { keyword, organizationId, period } = formApi.formValues
        const res = await cubeFormAuditService.exportWorkOrderStatisticsByUser({
          applicationCode: appCode,
          keyword: String(keyword ?? '').trim() || undefined,
          organizationId: typeof organizationId === 'string' && organizationId ? organizationId : undefined,
          period: formatPeriod(period),
        })
        if (res) {
          const link = document.createElement('a')
          const blob = new Blob([res], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          })
          link.style.display = 'none'
          link.href = URL.createObjectURL(blob)
          link.setAttribute('download', '个人工单统计.xlsx')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } catch {
        message.error('操作失败')
      } finally {
        exportLoading.value = false
      }
    }

    onMounted(async () => {
      await loadDeptOptions()
    })

    const slots = {
      'layout-header': (): JSX.Element => (
        <Space>
          <Button disabled={page.total === 0} type='primary' loading={exportLoading.value} onClick={handleExport}>
            导出
          </Button>
        </Space>
      ),
      'layout-content': (): JSX.Element => (
        <>
          <CubeForm />
          <CubeTable />
        </>
      ),
      'footer-page': (): JSX.Element => (
        <Page
          v-show={page.total > 0}
          current={page.pageNumber}
          pageSize={page.pageSize}
          total={page.total}
          onPageChange={handleChange}
        />
      ),
    }

    return (): JSX.Element => <CubeLayout title={pageTitle ?? '个人工单统计'} v-slots={slots} />
  },
})
