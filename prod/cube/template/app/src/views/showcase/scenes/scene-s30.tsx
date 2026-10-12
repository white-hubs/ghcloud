import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import type { TemplateDemoStatus } from '@ghcloud/cube-service-interface/template-demo'
import { listTemplateDemo } from '@ghcloud/cube-services-client/template-demo.client'
import { useAuthRequest } from '@ghcloud/cube-services-client/auth-request'
import { Page, Tag } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import dayjs from 'dayjs'
import { defineComponent, reactive } from 'vue'
import { useTeleportThemeVars } from '@/hooks/use-teleport-theme-vars'
import { STATUS_LABEL, STATUS_OPTIONS } from '../../demo-list/demo-list.const'

/** S30：同 S09，查询表单启用折叠（`isCollapsed` + `showCollapseButton`）；多列占位项用于触发折叠工具栏。 */
export const ShowcaseSceneS30 = defineComponent({
  name: 'ShowcaseSceneS30',
  setup: () => {
    const { pageTitle } = usePageName()
    useTeleportThemeVars()
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: '',
      status: '' as TemplateDemoStatus | '',
    })
    const columns = [
      { dataIndex: 'id', title: 'ID', width: 120 },
      { dataIndex: 'name', title: '名称', ellipsis: true },
      {
        dataIndex: 'status',
        title: '状态',
        width: 100,
        customRender: ({ text }: { text: TemplateDemoStatus }): JSX.Element => (
          <Tag color={text === 'active' ? 'green' : 'default'}>{STATUS_LABEL[text] ?? '--'}</Tag>
        ),
      },
      {
        dataIndex: 'createdAt',
        title: '创建时间',
        width: 180,
        customRender: ({ text }: { text: number }): string => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'),
      },
    ]
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: 'id',
      tableCode: 'SHOWCASE_SCENE_S30',
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
    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber
      searchParams.pageSize = pageSize
      tableApi.query()
    }
    const syncSearchAndQuery = (keyword: string, status: TemplateDemoStatus | ''): void => {
      searchParams.keyword = keyword
      searchParams.status = status
      searchParams.pageNumber = 1
      tableApi.query()
    }
    const collapseLayoutPlaceholder = {
      disabled: true,
      placeholder: '不参与查询，仅用于折叠行布局',
    }
    const [CubeForm] = useCubeForm({
      layout: 'horizontal',
      isCollapsed: true,
      showCollapseButton: true,
      schema: [
        { component: 'Input', fieldName: 'keyword', label: '关键词', componentProps: { placeholder: '名称模糊搜索', allowClear: true } },
        { component: 'Select', fieldName: 'status', label: '状态', defaultValue: '', componentProps: { options: STATUS_OPTIONS } },
        {
          component: 'Input',
          fieldName: '_s30CollapsePad1',
          label: '占位列 1',
          defaultValue: '',
          componentProps: collapseLayoutPlaceholder,
        },
        {
          component: 'Input',
          fieldName: '_s30CollapsePad2',
          label: '占位列 2',
          defaultValue: '',
          componentProps: collapseLayoutPlaceholder,
        },
        {
          component: 'Input',
          fieldName: '_s30CollapsePad3',
          label: '占位列 3',
          defaultValue: '',
          componentProps: collapseLayoutPlaceholder,
        },
      ],
      handleSubmit: (values) => {
        syncSearchAndQuery((values.keyword as string) ?? '', (values.status as TemplateDemoStatus | '') ?? '')
      },
      handleReset: () => {
        syncSearchAndQuery('', '')
      },
    })
    const slots = {
      'layout-content': (): JSX.Element => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      'footer-page': (): JSX.Element => (
        <Page current={searchParams.pageNumber} pageSize={searchParams.pageSize} total={searchParams.total} onPageChange={handlePageChange} />
      ),
    }
    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase S30'} v-slots={slots} showTableXScroll />
    )
  },
})
