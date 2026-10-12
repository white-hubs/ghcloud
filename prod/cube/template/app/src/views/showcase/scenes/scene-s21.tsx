import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import type { TemplateDemoStatus } from '@ghcloud/cube-service-interface/template-demo'
import { listTemplateDemo } from '@ghcloud/cube-services-client/template-demo.client'
import { useAuthRequest } from '@ghcloud/cube-services-client/auth-request'
import { Alert, Page, Tag } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import dayjs from 'dayjs'
import { defineComponent, reactive } from 'vue'
import { useTeleportThemeVars } from '@/hooks/use-teleport-theme-vars'
import { STATUS_LABEL, STATUS_OPTIONS } from '../../demo-list/demo-list.const'

/**
 * Batch-2 S21：`useCubeTable` + `tableCode` 走 `AliasTable`，与租户/用户字典列配置联动；数据同 S09 复用 `template-demo`。
 * `useTeleportThemeVars` 同步列配置弹窗（Teleport 到 body）的主题变量。无路由注册，按需动态 import。
 */
export const ShowcaseSceneS21 = defineComponent({
  name: 'ShowcaseSceneS21',
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
      tableCode: 'SHOWCASE_SCENE_S21',
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
    const [CubeForm] = useCubeForm({
      layout: 'horizontal',
      schema: [
        { component: 'Input', fieldName: 'keyword', label: '关键词', componentProps: { placeholder: '名称模糊搜索', allowClear: true } },
        { component: 'Select', fieldName: 'status', label: '状态', defaultValue: '', componentProps: { options: STATUS_OPTIONS } },
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Alert
            type='info'
            showIcon
            message='字典 / 别名列配置（AliasTable）'
            description={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p>
                  传入 <code>tableCode</code> 后，<code>useCubeTable</code> 内建的 <code>AliasTable</code> 会调用{' '}
                  <code>getAliasTableColumn</code> 合并租户与用户列配置，并在<strong>最后一列</strong>表头展示齿轮入口，打开{' '}
                  <code>CubeCustomTableColumnModal</code> 保存后触发列表刷新。
                </p>
                <p>
                  本模板在 <code>registerAliasTableMocks</code> 中对字典相关 GET 做了空数组兜底；本地 mock 无个性化列时表现与代码列一致，联调真实字典时可覆盖同名 mock。
                </p>
                <p>
                  本页已调用 <code>useTeleportThemeVars()</code>，避免列配置弹窗 Teleport 到 <code>document.body</code> 后主题色与 <code>#TemplateApp</code> 不一致。
                </p>
              </div>
            }
          />
          <CubeForm />
          <CubeTable />
        </div>
      ),
      'footer-page': (): JSX.Element => (
        <Page current={searchParams.pageNumber} pageSize={searchParams.pageSize} total={searchParams.total} onPageChange={handlePageChange} />
      ),
    }
    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase S21'} v-slots={slots} showTableXScroll />
    )
  },
})
