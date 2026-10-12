import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { TemplateDemoStatus } from '@ghcloud/cube-service-interface/template-demo'
import { listTemplateDemo } from '@ghcloud/cube-services-client/template-demo.client'
import { useAuthRequest } from '@ghcloud/cube-services-client/auth-request'
import { type ColumnType, Page, Tag } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import dayjs from 'dayjs'
import { defineComponent, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTeleportThemeVars } from '@/hooks/use-teleport-theme-vars'

const SCENE_S09_MESSAGES = {
  'zh-CN': {
    s09: {
      layoutTitle: 'Showcase S09',
      columns: {
        id: 'ID',
        name: '名称',
        status: '状态',
        createdAt: '创建时间',
      },
      form: {
        keyword: '关键词',
        keywordPlaceholder: '名称模糊搜索',
        status: '状态',
      },
      status: {
        all: '全部',
        active: '启用',
        inactive: '停用',
      },
      emptyCell: '--',
      pageTotal: '共 {total} 条',
    },
  },
  'en-US': {
    s09: {
      layoutTitle: 'Showcase S09',
      columns: {
        id: 'ID',
        name: 'Name',
        status: 'Status',
        createdAt: 'Created at',
      },
      form: {
        keyword: 'Keyword',
        keywordPlaceholder: 'Search by name',
        status: 'Status',
      },
      status: {
        all: 'All',
        active: 'Active',
        inactive: 'Inactive',
      },
      emptyCell: '--',
      pageTotal: '{total} items',
    },
  },
} as const

/** S09：表单 + 表格 + 分页，复用 template-demo 列表。 */
export const ShowcaseSceneS09 = defineComponent({
  name: 'ShowcaseSceneS09',
  setup: () => {
    const { pageTitle } = usePageName()
    useTeleportThemeVars()
    const { t, locale } = useI18n({
      messages: SCENE_S09_MESSAGES,
    })
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: '',
      status: '' as TemplateDemoStatus | '',
    })

    const buildColumns = (): ColumnType[] => {
      const statusLabel = (value: TemplateDemoStatus): string => {
        if (value === TemplateDemoStatus.Active) {
          return t('s09.status.active')
        }
        if (value === TemplateDemoStatus.Inactive) {
          return t('s09.status.inactive')
        }
        return t('s09.emptyCell')
      }
      return [
        { dataIndex: 'id', title: t('s09.columns.id'), width: 120 },
        { dataIndex: 'name', title: t('s09.columns.name'), ellipsis: true },
        {
          dataIndex: 'status',
          title: t('s09.columns.status'),
          width: 100,
          customRender: ({ text }: { text: TemplateDemoStatus }): JSX.Element => (
            <Tag color={text === 'active' ? 'green' : 'default'}>{statusLabel(text)}</Tag>
          ),
        },
        {
          dataIndex: 'createdAt',
          title: t('s09.columns.createdAt'),
          width: 180,
          customRender: ({ text }: { text: number }): string =>
            text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : t('s09.emptyCell'),
        },
      ]
    }

    const [CubeTable, tableApi] = useCubeTable({
      columns: buildColumns(),
      rowKey: 'id',
      tableCode: 'SHOWCASE_SCENE_S09',
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

    const buildSchema = (): Parameters<typeof useCubeForm>[0]['schema'] => [
      {
        component: 'Input',
        fieldName: 'keyword',
        label: t('s09.form.keyword'),
        componentProps: { placeholder: t('s09.form.keywordPlaceholder'), allowClear: true },
      },
      {
        component: 'Select',
        fieldName: 'status',
        label: t('s09.form.status'),
        defaultValue: '',
        componentProps: {
          options: [
            { label: t('s09.status.all'), value: '' },
            { label: t('s09.status.active'), value: TemplateDemoStatus.Active },
            { label: t('s09.status.inactive'), value: TemplateDemoStatus.Inactive },
          ],
        },
      },
    ]

    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      schema: buildSchema(),
      handleSubmit: (values) => {
        syncSearchAndQuery((values.keyword as string) ?? '', (values.status as TemplateDemoStatus | '') ?? '')
      },
      handleReset: () => {
        syncSearchAndQuery('', '')
      },
    })

    watch(
      locale,
      () => {
        tableApi.setColumns(buildColumns())
        formApi.updateSchema(buildSchema())
      },
      { flush: 'post' },
    )

    const slots = {
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
          showTotal={(total: number): string => String(t('s09.pageTotal', { total }))}
          onPageChange={handlePageChange}
        />
      ),
    }
    return (): JSX.Element => (
      <CubeLayout title={pageTitle || t('s09.layoutTitle')} v-slots={slots} showTableXScroll />
    )
  },
})
