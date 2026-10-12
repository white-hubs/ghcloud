import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { TemplateDemoStatus } from '@ghcloud/cube-service-interface/template-demo'
import { listTemplateDemo } from '@ghcloud/cube-services-client/template-demo.client'
import { useAuthRequest } from '@ghcloud/cube-services-client/auth-request'
import { type ColumnType, Page, Tag } from '@ghcloud/cube-ui'
import type { Key } from 'ant-design-vue/es/table/interface'
import { usePageName } from '@ghcloud/cube-utils'
import dayjs from 'dayjs'
import { defineComponent, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTeleportThemeVars } from '@/hooks/use-teleport-theme-vars'

/**
 * Batch-2 S11：`CubeLayout` + `useCubeTable` + 单选行，`rowSelectionChange` 同步选中行的 id/名称到 ref（无路由）。
 */
export const ShowcaseSceneS11 = defineComponent({
  name: 'ShowcaseSceneS11',
  setup: () => {
    useTeleportThemeVars()
    const { pageTitle } = usePageName()

    const sceneMessages = {
      'zh-CN': {
        showcaseSceneS11Title: 'Showcase · 场景 S11',
        columnIdTitle: 'ID',
        columnNameTitle: '名称',
        columnStatusTitle: '状态',
        columnCreatedAtTitle: '创建时间',
        columnRemarkTitle: '备注',
        demoStatusActive: '启用',
        demoStatusInactive: '停用',
        statusFilterAll: '全部',
        keywordLabel: '关键词',
        keywordPlaceholder: '名称',
        statusFieldLabel: '状态',
        selectionNone: '未选择',
        selectedRowSummaryWithLabel: 'id={id} · label={label}',
        selectedRowSummaryIdOnly: 'id={id}',
        emptyPlaceholder: '--',
      },
      'en-US': {
        showcaseSceneS11Title: 'Showcase · Scene S11',
        columnIdTitle: 'ID',
        columnNameTitle: 'Name',
        columnStatusTitle: 'Status',
        columnCreatedAtTitle: 'Created at',
        columnRemarkTitle: 'Remark',
        demoStatusActive: 'Active',
        demoStatusInactive: 'Inactive',
        statusFilterAll: 'All',
        keywordLabel: 'Keyword',
        keywordPlaceholder: 'Name',
        statusFieldLabel: 'Status',
        selectionNone: 'None selected',
        selectedRowSummaryWithLabel: 'id={id} · label={label}',
        selectedRowSummaryIdOnly: 'id={id}',
        emptyPlaceholder: '--',
      },
    }

    const { t, locale } = useI18n({ inheritLocale: true, useScope: 'local', messages: sceneMessages })

    const selectedRowSummary = ref<string>(t('selectionNone'))
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

    const demoStatusLabel = (value: TemplateDemoStatus): string => {
      if (value === TemplateDemoStatus.Active) {
        return t('demoStatusActive')
      }
      if (value === TemplateDemoStatus.Inactive) {
        return t('demoStatusInactive')
      }
      return t('emptyPlaceholder')
    }

    const buildColumns = (): ColumnType[] => [
      { dataIndex: 'id', title: t('columnIdTitle'), width: 120, fixed: 'left' as const },
      { dataIndex: 'name', title: t('columnNameTitle'), width: 200, ellipsis: true },
      {
        dataIndex: 'status',
        title: t('columnStatusTitle'),
        width: 100,
        customRender: ({ text }: { text: TemplateDemoStatus }): JSX.Element => (
          <Tag color={text === 'active' ? 'green' : 'default'}>{demoStatusLabel(text)}</Tag>
        ),
      },
      {
        dataIndex: 'createdAt',
        title: t('columnCreatedAtTitle'),
        width: 180,
        customRender: ({ text }: { text: number }): string =>
          text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : t('emptyPlaceholder'),
      },
      {
        dataIndex: 'remark',
        title: t('columnRemarkTitle'),
        width: 160,
        ellipsis: true,
        customRender: ({ text }: { text?: string }): string => text ?? t('emptyPlaceholder'),
      },
    ]

    const [CubeTable, tableApi] = useCubeTable({
      columns: buildColumns(),
      rowKey: 'id',
      tableCode: 'SHOWCASE_SCENE_S11',
      rowSelection: 'radio',
      rowSelectionChange: (keys: Key[], rows: unknown[]): void => {
        if (keys.length === 0) {
          selectedRowSummary.value = t('selectionNone')
          return
        }
        const row = rows[0] as { id: string; name: string } | undefined
        selectedRowSummary.value = row
          ? String(t('selectedRowSummaryWithLabel', { id: row.id, label: row.name }))
          : String(t('selectedRowSummaryIdOnly', { id: String(keys[0] ?? '') }))
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

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber
      searchParams.pageSize = pageSize
      tableApi.query()
    }

    const buildSchema = (): Parameters<typeof useCubeForm>[0]['schema'] => [
      {
        component: 'Input',
        fieldName: 'keyword',
        label: t('keywordLabel'),
        componentProps: { placeholder: t('keywordPlaceholder'), allowClear: true },
      },
      {
        component: 'Select',
        fieldName: 'status',
        label: t('statusFieldLabel'),
        defaultValue: '',
        componentProps: {
          options: [
            { label: t('statusFilterAll'), value: '' },
            { label: t('demoStatusActive'), value: TemplateDemoStatus.Active },
            { label: t('demoStatusInactive'), value: TemplateDemoStatus.Inactive },
          ],
        },
      },
    ]

    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      schema: buildSchema(),
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

    watch(
      locale,
      () => {
        tableApi.setColumns(buildColumns())
        formApi.updateSchema(buildSchema())
      },
      { flush: 'post' },
    )

    const slots = {
      'layout-header': (): JSX.Element => <span>{selectedRowSummary.value}</span>,
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
      <CubeLayout title={pageTitle || t('showcaseSceneS11Title')} v-slots={slots} showTableXScroll />
    )
  },
})
