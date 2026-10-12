import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import type { TemplateDemoStatus } from '@ghcloud/cube-service-interface/template-demo'
import { deleteTemplateDemo, listTemplateDemo } from '@ghcloud/cube-services-client/template-demo.client'
import { useAuthRequest } from '@ghcloud/cube-services-client/auth-request'
import { AntModal, Button, Page, PopConfirm, Space, Tag, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import dayjs from 'dayjs'
import { defineComponent, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useTeleportThemeVars } from '@/hooks/use-teleport-theme-vars'
import { STATUS_LABEL, STATUS_OPTIONS } from './demo-list.const'

/**
 * 列表示例。综合演示：
 * - `CubeLayout` 标准页面骨架（header 按钮 / content 表单+表格 / footer 分页）
 * - `useCubeForm` 搜索表单 schema 式声明
 * - `useCubeTable` 列表取数与列渲染
 * - `useAuthRequest` + deep-import client 的标准 API 调用姿势
 * - `router.push` 携带 query 跳转详情/编辑
 */
export const DemoList = defineComponent({
  name: 'DemoList',
  setup: () => {
    const { pageTitle } = usePageName()
    const router = useRouter()
    useTeleportThemeVars()

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
      { dataIndex: 'id', title: 'ID', width: 120 },
      { dataIndex: 'name', title: '名称', ellipsis: true },
      {
        dataIndex: 'status',
        title: '状态',
        width: 100,
        customRender: ({ text }: { text: TemplateDemoStatus; }): JSX.Element => (
          <Tag color={text === 'active' ? 'green' : 'default'}>
            {STATUS_LABEL[text] ?? '--'}
          </Tag>
        ),
      },
      {
        dataIndex: 'createdAt',
        title: '创建时间',
        width: 180,
        customRender: ({ text }: { text: number; }): string => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--',
      },
      {
        dataIndex: 'remark',
        title: '备注',
        ellipsis: true,
        customRender: ({ text }: { text?: string; }): string => text ?? '--',
      },
      {
        // 注意：AliasTable（useCubeTable 的内部组件）会把列配置齿轮按钮渲染到"最后一列表头"
        // 的右侧，如果最后一列是 fixed: 'right'，AntDV 的固定列阴影+右边界裁剪会把齿轮压住。
        // 因此：带 tableCode 的列表不要把最后一列设为 fixed: 'right'；如果确实需要固定操作列，
        // 改用 useCubeTable 时不传 tableCode（关闭列自定义），或在末尾再加一列 48px 的 fixed 容器承载齿轮。
        dataIndex: 'action',
        title: '操作',
        width: 200,
        customRender: ({ record }: { record: { id: string; name: string; }; }): JSX.Element => (
          <Space>
            <Button type='link' size='small' onClick={() => router.push({ name: 'demo-detail', query: { id: record.id } })}>
              详情
            </Button>
            <Button type='link' size='small' onClick={() => router.push({ name: 'demo-edit', query: { id: record.id } })}>
              编辑
            </Button>
            <PopConfirm
              title={`确认删除 ${record.name}？`}
              onConfirm={async () => {
                try {
                  await useAuthRequest(() => deleteTemplateDemo(record.id))
                  message.success('删除成功')
                  tableApi.query()
                } catch (error) {
                  message.error((error as Error).message || '删除失败')
                }
              }}
            >
              <Button type='link' size='small' danger>删除</Button>
            </PopConfirm>
          </Space>
        ),
      },
    ]

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: 'id',
      tableCode: 'TEMPLATE_DEMO_LIST',
      fetchApi: async () => {
        const resp = await useAuthRequest(() => listTemplateDemo({
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          keyword: searchParams.keyword,
          status: searchParams.status,
        }))
        return resp
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total
      },
    })

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber
      searchParams.pageSize = pageSize
      tableApi.query()
    }

    const formSchema = [
      {
        component: 'Input',
        fieldName: 'keyword',
        label: '关键词',
        componentProps: {
          placeholder: '名称模糊搜索',
          allowClear: true,
        },
      },
      {
        component: 'Select',
        fieldName: 'status',
        label: '状态',
        defaultValue: '',
        componentProps: {
          options: STATUS_OPTIONS,
        },
      },
    ]

    const [CubeForm] = useCubeForm({
      layout: 'horizontal',
      schema: formSchema,
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

    const handleCreate = (): void => {
      AntModal.confirm({
        title: '新建示例',
        content: '点击"确定"将跳转新建页面；在真实业务中这里直接打开 useCubeModal 表单。',
        onOk: () => {
          void router.push({ name: 'demo-edit' })
        },
      })
    }

    const slots = {
      'layout-header': (): JSX.Element => (
        <Button type='primary' onClick={handleCreate}>新建</Button>
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

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || '示例列表'} v-slots={slots} showTableXScroll />
    )
  },
})
