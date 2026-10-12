import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { TemplateDemoStatus } from '@ghcloud/cube-service-interface/template-demo'
import { listTemplateDemo } from '@ghcloud/cube-services-client/template-demo.client'
import { useAuthRequest } from '@ghcloud/cube-services-client/auth-request'
import { Alert, Page, Tag } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import dayjs from 'dayjs'
import { defineComponent, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTeleportThemeVars } from '@/hooks/use-teleport-theme-vars'

/**
 * Batch-2 S19：`useCubeTable` 与表格底栏汇总行（summary）。
 * 当前 `TableApiOptions` / `createTableComponent` → `AliasTable` 未暴露或透传 ant-design-vue `Table` 的 `summary`（汇总行）能力，故用 Alert 说明缺口，下方仍为常规列表。
 */
export const ShowcaseSceneS19 = defineComponent({
  name: 'ShowcaseSceneS19',
  setup: () => {
    const { pageTitle } = usePageName()
    useTeleportThemeVars()

    const sceneMessages = {
      'zh-CN': {
        showcaseSceneS19Title: 'Showcase · S19',
        colId: 'ID',
        colName: '名称',
        colStatus: '状态',
        colCreatedAt: '创建时间',
        statusActive: '启用',
        statusInactive: '停用',
        formKeyword: '关键词',
        formKeywordPlaceholder: '名称模糊搜索',
        formStatus: '状态',
        statusAll: '全部',
        emptyMark: '--',
        alertSummaryTitle: '表格汇总行（summary）未接入 useCubeTable',
        alertSummaryBody1:
          'npm 作用域 ghcloud 下的 cube-app-design 包中，TableApiOptions 未包含 summary、footerCell；table-ui 中的 AliasTable 也未向底层 Table 传入汇总行相关插槽或 props。若需合计行，需在封装层扩展选项并透传，或在本页另行组合原生表格。',
        alertSummaryBody2: '下列 CubeTable 为当前能力下的普通列表（无汇总行）。',
      },
      'en-US': {
        showcaseSceneS19Title: 'Showcase · S19',
        colId: 'ID',
        colName: 'Name',
        colStatus: 'Status',
        colCreatedAt: 'Created at',
        statusActive: 'Active',
        statusInactive: 'Inactive',
        formKeyword: 'Keyword',
        formKeywordPlaceholder: 'Fuzzy search by name',
        formStatus: 'Status',
        statusAll: 'All',
        emptyMark: '--',
        alertSummaryTitle: 'Table summary row is not wired into useCubeTable',
        alertSummaryBody1:
          'In the cube-app-design package (npm scope ghcloud), TableApiOptions does not include summary or footerCell; AliasTable from table-ui also does not forward summary slots or props to the underlying Table. For totals, extend the wrapper and pass them through, or compose a native table on this page.',
        alertSummaryBody2: 'The CubeTable below is a normal list with current capabilities (no summary row).',
      },
    }

    const { t, locale } = useI18n({ inheritLocale: true, useScope: 'local', messages: sceneMessages })

    const statusLabel = (status: TemplateDemoStatus): string => {
      if (status === TemplateDemoStatus.Active) {
        return t('statusActive')
      }
      if (status === TemplateDemoStatus.Inactive) {
        return t('statusInactive')
      }
      return t('emptyMark')
    }

    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: '',
      status: '' as TemplateDemoStatus | '',
    })

    const buildColumns = () => [
      { dataIndex: 'id', title: t('colId'), width: 120 },
      { dataIndex: 'name', title: t('colName'), ellipsis: true },
      {
        dataIndex: 'status',
        title: t('colStatus'),
        width: 100,
        customRender: ({ text }: { text: TemplateDemoStatus }): JSX.Element => (
          <Tag color={text === TemplateDemoStatus.Active ? 'green' : 'default'}>{statusLabel(text)}</Tag>
        ),
      },
      {
        dataIndex: 'createdAt',
        title: t('colCreatedAt'),
        width: 180,
        customRender: ({ text }: { text: number }): string => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : t('emptyMark')),
      },
    ]

    const buildSchema = (): {
      component: string
      fieldName: string
      label: string
      defaultValue?: string
      componentProps: Record<string, unknown>
    }[] => [
      {
        component: 'Input',
        fieldName: 'keyword',
        label: t('formKeyword'),
        componentProps: { placeholder: t('formKeywordPlaceholder'), allowClear: true },
      },
      {
        component: 'Select',
        fieldName: 'status',
        label: t('formStatus'),
        defaultValue: '',
        componentProps: {
          options: [
            { label: t('statusAll'), value: '' },
            { label: t('statusActive'), value: TemplateDemoStatus.Active },
            { label: t('statusInactive'), value: TemplateDemoStatus.Inactive },
          ],
        },
      },
    ]

    const [CubeTable, tableApi] = useCubeTable({
      columns: buildColumns(),
      rowKey: 'id',
      tableCode: 'SHOWCASE_SCENE_S19',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Alert
            type='warning'
            showIcon
            message={t('alertSummaryTitle')}
            description={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p>{t('alertSummaryBody1')}</p>
                <p>{t('alertSummaryBody2')}</p>
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
      <CubeLayout title={pageTitle || t('showcaseSceneS19Title')} v-slots={slots} showTableXScroll />
    )
  },
})
