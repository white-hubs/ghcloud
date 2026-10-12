import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import type { TemplateDemoStatus } from '@ghcloud/cube-service-interface/template-demo'
import { deleteTemplateDemo, listTemplateDemo } from '@ghcloud/cube-services-client/template-demo.client'
import { useAuthRequest } from '@ghcloud/cube-services-client/auth-request'
import { Button, Page, PopConfirm, Tag, message } from '@ghcloud/cube-ui'
import type { Key } from 'ant-design-vue/es/table/interface'
import { usePageName } from '@ghcloud/cube-utils'
import dayjs from 'dayjs'
import { defineComponent, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTeleportThemeVars } from '@/hooks/use-teleport-theme-vars'
import { STATUS_LABEL, STATUS_OPTIONS } from '../demo-list/demo-list.const'

/**
 * 表格专项：行勾选、列配置（tableCode）、分页、固定列注意点（操作列不设 fixed:right）。
 * 数据复用 `template-demo` mock。
 */
export const ShowcaseTable = defineComponent({
  name: 'ShowcaseTable',
  setup: () => {
    useTeleportThemeVars()
    const { pageTitle } = usePageName()
    const router = useRouter()
    const selectedInfo = ref<string>('未选择')
    const refreshTableRef: { query?: () => void } = {}

    const searchParams = reactive<{
      pageNumber: number;
      pageSize: number;
      total: number;
      keyword: string;
      status: TemplateDemoStatus | '';
    }>({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: '',
      status: '',
    })

    const columns = [
      { dataIndex: 'id', title: 'ID', width: 120, fixed: 'left' as const },
      { dataIndex: 'name', title: '名称', width: 200, ellipsis: true },
      {
        dataIndex: 'status',
        title: '状态',
        width: 100,
        customRender: ({ text }: { text: TemplateDemoStatus }): JSX.Element => (
          <Tag color={text === 'active' ? 'green' : 'default'}>{STATUS_LABEL[text] ?? '--'}</Tag>
        ),
      },
      {
        dataIndex: 'amount',
        title: '金额(演示)',
        width: 120,
        customRender: ({ record }: { record: { id: string } }): string => {
          const n = Number.parseInt(record.id.replaceAll(/\D/g, ''), 10) || 0
          return `${(n * 100).toLocaleString()}`
        },
      },
      {
        dataIndex: 'createdAt',
        title: '创建时间',
        width: 180,
        customRender: ({ text }: { text: number }): string => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'),
      },
      {
        dataIndex: 'remark',
        title: '备注',
        width: 160,
        ellipsis: true,
        customRender: ({ text }: { text?: string }): string => text ?? '--',
      },
      {
        dataIndex: 'action',
        title: '操作',
        width: 200,
        customRender: ({ record }: { record: { id: string; name: string } }): JSX.Element => (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button type='link' size='small' onClick={() => router.push({ name: 'demo-detail', query: { id: record.id } })}>
              详情
            </Button>
            <PopConfirm
              title={`确认删除 ${record.name}？`}
              onConfirm={() => {
                useAuthRequest(() => deleteTemplateDemo(record.id))
                  .then(() => {
                    message.success('已删除')
                    refreshTableRef.query?.()
                  })
                  .catch((error: unknown) => {
                    message.error((error as Error).message || '删除失败')
                  })
              }}
            >
              <Button type='link' size='small' danger>
                删除
              </Button>
            </PopConfirm>
          </div>
        ),
      },
    ]

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: 'id',
      tableCode: 'SHOWCASE_TABLE_DEMO',
      rowSelection: 'checkbox',
      rowSelectionChange: (keys: Key[]) => {
        selectedInfo.value = keys.length > 0 ? `已选 ${keys.length} 行` : '未选择'
      },
      fetchApi: () =>
        useAuthRequest(() =>
          listTemplateDemo({
            pageNumber: searchParams.pageNumber,
            pageSize: searchParams.pageSize,
            keyword: searchParams.keyword,
            status: searchParams.status,
          }),
        ),
      fetchLoaded: (data) => {
        searchParams.total = data.total
      },
    })

    refreshTableRef.query = () => {
      tableApi.query()
    }

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber
      searchParams.pageSize = pageSize
      tableApi.query()
    }

    const [CubeForm] = useCubeForm({
      layout: 'horizontal',
      schema: [
        {
          component: 'Input',
          fieldName: 'keyword',
          label: '关键词',
          componentProps: { placeholder: '名称', allowClear: true },
        },
        {
          component: 'Select',
          fieldName: 'status',
          label: '状态',
          defaultValue: '',
          componentProps: { options: STATUS_OPTIONS },
        },
      ],
      handleSubmit: (values) => {
        searchParams.keyword = (values.keyword as string) ?? ''
        searchParams.status = (values.status as TemplateDemoStatus | '') ?? ''
        searchParams.pageNumber = 1
        tableApi.query()
      },
      handleReset: () => {
        searchParams.keyword = ''
        searchParams.status = ''
        searchParams.pageNumber = 1
        tableApi.query()
      },
    })

    const slots = {
      'layout-header': (): JSX.Element => (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span>{selectedInfo.value}</span>
          <Button onClick={() => router.push({ name: 'demo-home' })}>返回首页</Button>
        </div>
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
          onPageChange={handlePageChange}
        />
      ),
    }

    return (): JSX.Element => <CubeLayout title={pageTitle || 'Showcase · 表格'} v-slots={slots} showTableXScroll />
  },
})
