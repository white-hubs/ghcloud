import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { TemplateDemoStatus } from '@ghcloud/cube-service-interface/template-demo'
import { deleteTemplateDemo, listTemplateDemo } from '@ghcloud/cube-services-client/template-demo.client'
import { useAuthRequest } from '@ghcloud/cube-services-client/auth-request'
import { Button, Page, PopConfirm, Tag, message } from '@ghcloud/cube-ui'
import type { Key } from 'ant-design-vue/es/table/interface'
import { usePageName } from '@ghcloud/cube-utils'
import dayjs from 'dayjs'
import { defineComponent, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useTeleportThemeVars } from '@/hooks/use-teleport-theme-vars'

/**
 * Batch-1 S10：`CubeLayout` + `useCubeForm` + `useCubeTable`，勾选列与 `rowSelectionChange` 同步选中数量文案（ref）。
 * 数据复用 `template-demo` mock；`tableCode` 独立为 `SHOWCASE_SCENE_S10`。
 */
export const ShowcaseSceneS10 = defineComponent({
  name: 'ShowcaseSceneS10',
  setup: () => {
    useTeleportThemeVars()
    const { pageTitle } = usePageName()
    const router = useRouter()

    const sceneMessages = {
      'zh-CN': {
        showcaseSceneS10Title: 'Showcase · S10',
        selectedCount: '已选 {n} 行',
        colId: 'ID',
        colName: '名称',
        colStatus: '状态',
        colAmount: '金额(演示)',
        colCreatedAt: '创建时间',
        colRemark: '备注',
        colAction: '操作',
        statusActive: '启用',
        statusInactive: '停用',
        detail: '详情',
        delete: '删除',
        deleteConfirm: '确认删除 {name}？',
        deleteSuccess: '已删除',
        deleteFailed: '删除失败',
        formKeyword: '关键词',
        formKeywordPlaceholder: '名称',
        formStatus: '状态',
        statusAll: '全部',
        backHome: '返回首页',
        emptyMark: '--',
      },
      'en-US': {
        showcaseSceneS10Title: 'Showcase · S10',
        selectedCount: '{n} row(s) selected',
        colId: 'ID',
        colName: 'Name',
        colStatus: 'Status',
        colAmount: 'Amount (demo)',
        colCreatedAt: 'Created at',
        colRemark: 'Remark',
        colAction: 'Actions',
        statusActive: 'Active',
        statusInactive: 'Inactive',
        detail: 'Details',
        delete: 'Delete',
        deleteConfirm: 'Delete {name}?',
        deleteSuccess: 'Deleted',
        deleteFailed: 'Delete failed',
        formKeyword: 'Keyword',
        formKeywordPlaceholder: 'Name',
        formStatus: 'Status',
        statusAll: 'All',
        backHome: 'Back to home',
        emptyMark: '--',
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

    const buildSchema = (): {
      component: string;
      fieldName: string;
      label: string;
      defaultValue?: string;
      componentProps: Record<string, unknown>;
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

    const selectedCountLabel = ref<string>(t('selectedCount', { n: 0 }))
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

    const buildColumns = () => {
      const cols = [
        { dataIndex: 'id', title: t('colId'), width: 120, fixed: 'left' as const },
        { dataIndex: 'name', title: t('colName'), width: 200, ellipsis: true },
        {
          dataIndex: 'status',
          title: t('colStatus'),
          width: 100,
          customRender: ({ text }: { text: TemplateDemoStatus }): JSX.Element => (
            <Tag color={text === TemplateDemoStatus.Active ? 'green' : 'default'}>{statusLabel(text)}</Tag>
          ),
        },
        {
          dataIndex: 'amount',
          title: t('colAmount'),
          width: 120,
          customRender: ({ record }: { record: { id: string } }): string => {
            const n = Number.parseInt(record.id.replaceAll(/\D/g, ''), 10) || 0
            return `${(n * 100).toLocaleString()}`
          },
        },
        {
          dataIndex: 'createdAt',
          title: t('colCreatedAt'),
          width: 180,
          customRender: ({ text }: { text: number }): string =>
            text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : t('emptyMark'),
        },
        {
          dataIndex: 'remark',
          title: t('colRemark'),
          width: 160,
          ellipsis: true,
          customRender: ({ text }: { text?: string }): string => text ?? t('emptyMark'),
        },
        {
          dataIndex: 'action',
          title: t('colAction'),
          width: 200,
          customRender: ({ record }: { record: { id: string; name: string } }): JSX.Element => (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button type='link' size='small' onClick={() => router.push({ name: 'demo-detail', query: { id: record.id } })}>
                {t('detail')}
              </Button>
              <PopConfirm
                title={t('deleteConfirm', { name: record.name })}
                onConfirm={() => {
                  useAuthRequest(() => deleteTemplateDemo(record.id))
                    .then(() => {
                      message.success(t('deleteSuccess'))
                      const runQuery = refreshTableRef.query
                      if (runQuery) {
                        runQuery()
                      }
                    })
                    .catch((error: unknown) => {
                      message.error((error as Error).message || t('deleteFailed'))
                    })
                }}
              >
                <Button type='link' size='small' danger>
                  {t('delete')}
                </Button>
              </PopConfirm>
            </div>
          ),
        },
      ]
      return cols
    }

    const columns = buildColumns()

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: 'id',
      tableCode: 'SHOWCASE_SCENE_S10',
      rowSelection: 'checkbox',
      rowSelectionChange: (keys: Key[]) => {
        selectedCountLabel.value = t('selectedCount', { n: keys.length })
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
        selectedCountLabel.value = t('selectedCount', { n: tableApi.getSelectedRowKeys().length })
      },
      { flush: 'post' },
    )

    refreshTableRef.query = () => {
      tableApi.query()
    }

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber
      searchParams.pageSize = pageSize
      tableApi.query()
    }

    const slots = {
      'layout-header': (): JSX.Element => (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span>{selectedCountLabel.value}</span>
          <Button onClick={() => router.push({ name: 'demo-home' })}>{t('backHome')}</Button>
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

    return (): JSX.Element => <CubeLayout title={pageTitle || t('showcaseSceneS10Title')} v-slots={slots} showTableXScroll />
  },
})
