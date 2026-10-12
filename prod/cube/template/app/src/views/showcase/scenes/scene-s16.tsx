import { CubeLayout } from '@ghcloud/cube-app-design'
import { Alert, Table, type ColumnType } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import type { ExpandableType } from 'ant-design-vue/es/table/interface'
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

interface StaticRow {
  id: string
  name: string
  summary: string
  detail: string
}

const readmePath = 'prod/cube/template/app/readme.md'

/**
 * Batch-2 S16：可展开行（`expandable.expandedRowRender`）+ 静态行；无路由。
 * `@ghcloud/cube-ui` 的 Table 将未声明 attrs 透传至内部 Ant Design Vue Table，故可使用 `expandable`。
 * `useCubeTable` / `TableApiOptions` 未暴露展开行；若将来封装不支持透传，可仅保留 Alert + readme 说明路径。
 */
export const ShowcaseSceneS16 = defineComponent({
  name: 'ShowcaseSceneS16',
  setup: () => {
    const { pageTitle } = usePageName()

    const sceneMessages = {
      'zh-CN': {
        colName: '名称',
        colSummary: '摘要',
        row1Name: '订单 A',
        row1Summary: '待出库',
        row1Detail: '明细：SKU-001 × 2，SKU-002 × 1；收货地址已校验。',
        row2Name: '订单 B',
        row2Summary: '已发货',
        row2Detail: '明细：物流单 LP778899；预计 2 日内送达。',
        row3Name: '订单 C',
        row3Summary: '已完成',
        row3Detail: '明细：无售后单；用户评价已归档。',
        alertMessage:
          '本页使用 ghcloud 作用域下 cube-ui 包提供的 Table，通过 expandable.expandedRowRender 演示展开行（静态数据）。',
        alertDescLead:
          '`useCubeTable` / `TableApiOptions` 与 `cube-app-design` 内 `AliasTable` 封装当前未暴露 `expandable`；业务若要在「列配置 / 字典列」同一套表格上展开行，需在封装层扩展或直接使用底层 ',
        alertDescBetweenCodes: '。说明：',
        alertDescEnd: '。',
        layoutTitleFallback: 'Showcase · S16 表格展开行',
      },
      'en-US': {
        colName: 'Name',
        colSummary: 'Summary',
        row1Name: 'Order A',
        row1Summary: 'Pending pick',
        row1Detail: 'Lines: SKU-001 × 2, SKU-002 × 1; shipping address verified.',
        row2Name: 'Order B',
        row2Summary: 'Shipped',
        row2Detail: 'Lines: tracking LP778899; estimated delivery within 2 days.',
        row3Name: 'Order C',
        row3Summary: 'Completed',
        row3Detail: 'Lines: no after-sales ticket; user review archived.',
        alertMessage:
          'This page uses the cube-ui package (ghcloud scope) Table with expandable.expandedRowRender for expandable rows (static data).',
        alertDescLead:
          '`useCubeTable` / `TableApiOptions` and `AliasTable` in `cube-app-design` do not expose `expandable` yet; extend the wrapper or use the underlying ',
        alertDescBetweenCodes: '. See ',
        alertDescEnd: '.',
      },
    }

    const { t } = useI18n({ inheritLocale: true, useScope: 'local', messages: sceneMessages })

    const columns = computed<ColumnType<StaticRow>[]>(() => [
      { title: t('colName'), dataIndex: 'name', key: 'name', width: 160 },
      { title: t('colSummary'), dataIndex: 'summary', key: 'summary', ellipsis: true },
    ])

    const dataSource = computed<StaticRow[]>(() => [
      { id: 's16-1', name: t('row1Name'), summary: t('row1Summary'), detail: t('row1Detail') },
      { id: 's16-2', name: t('row2Name'), summary: t('row2Summary'), detail: t('row2Detail') },
      { id: 's16-3', name: t('row3Name'), summary: t('row3Summary'), detail: t('row3Detail') },
    ])

    const expandable = computed<ExpandableType<StaticRow>>(() => ({
      expandedRowRender: (record) => (
        <div style={{ margin: 0, maxWidth: '720px', color: 'var(--ant-color-text-secondary, rgba(0,0,0,0.65))' }}>
          {record.detail}
        </div>
      ),
    }))

    const slots = {
      'layout-content': (): JSX.Element => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <Alert
            type='info'
            showIcon
            message={t('alertMessage')}
            description={
              <span>
                {t('alertDescLead')}
                <code>Table</code>
                {t('alertDescBetweenCodes')}
                <code>{readmePath}</code>
                {t('alertDescEnd')}
              </span>
            }
          />
          <Table
            columns={columns.value}
            dataSource={dataSource.value}
            rowKey='id'
            pagination={false}
            size='small'
            expandable={expandable.value}
          />
        </div>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || t('layoutTitleFallback')} v-slots={slots} showTableXScroll />
    )
  },
})
