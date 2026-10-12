import { CubeLayout } from '@ghcloud/cube-app-design'
import { Alert, Button, Space, Table, type ColumnType } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

const COLUMN_WIDTH = 200
const DATA_COLUMN_COUNT = 10
const SCROLL_X = 2400
const ACTION_COLUMN_WIDTH = 160

type WideRow = Record<string, string | number> & { key: string }

const buildRow = (key: string, prefix: string): WideRow => {
  const row: WideRow = { key }
  for (let i = 0; i < DATA_COLUMN_COUNT; i += 1) {
    row[`c${i}`] = `${prefix}-${i + 1}`
  }
  row.action = ''
  return row
}

const dataSource: WideRow[] = [buildRow('1', 'A'), buildRow('2', 'B'), buildRow('3', 'C')]

const sceneMessages = {
  'zh-CN': {
    showcaseSceneS18Title: 'Showcase · S18 固定操作列',
    dataColTitle: '列 {n}',
    colAction: '操作',
    view: '查看',
    more: '更多',
    alertFixedRight:
      '末列 fixed: right 在带列配置齿轮的真实列表里可能与齿轮叠挡，需另行规避（占位列、关 tableCode 等）。',
  },
  'en-US': {
    showcaseSceneS18Title: 'Showcase · S18 Fixed action column',
    dataColTitle: 'Column {n}',
    colAction: 'Actions',
    view: 'View',
    more: 'More',
    alertFixedRight:
      'A last column with fixed: right may overlap the column-settings gear in real lists; mitigate separately (spacer column, disable tableCode, etc.).',
  },
}

/**
 * Batch-2 S18：宽表横向滚动 + 末列 `fixed: 'right'` 操作列（纯 Table，无路由）。
 */
export const ShowcaseSceneS18 = defineComponent({
  name: 'ShowcaseSceneS18',
  setup: () => {
    const { pageTitle } = usePageName()
    const { t } = useI18n({ inheritLocale: true, useScope: 'local', messages: sceneMessages })

    const buildDataColumns = (): ColumnType[] =>
      Array.from({ length: DATA_COLUMN_COUNT }, (_, index) => {
        const key = `c${index}`
        return {
          title: t('dataColTitle', { n: index + 1 }),
          dataIndex: key,
          key,
          width: COLUMN_WIDTH,
        }
      })

    const buildColumns = (): ColumnType[] => {
      const actionColumn: ColumnType = {
        title: t('colAction'),
        dataIndex: 'action',
        key: 'action',
        width: ACTION_COLUMN_WIDTH,
        fixed: 'right',
        customRender: (): JSX.Element => (
          <Space size='small'>
            <Button type='link' size='small'>
              {t('view')}
            </Button>
            <Button type='link' size='small'>
              {t('more')}
            </Button>
          </Space>
        ),
      }
      return [...buildDataColumns(), actionColumn]
    }

    const columns = buildColumns()

    const slots = {
      'layout-content': (): JSX.Element => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <Alert type='info' showIcon message={t('alertFixedRight')} />
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey='key'
            pagination={false}
            size='small'
            scrollX={SCROLL_X}
          />
        </div>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || t('showcaseSceneS18Title')} v-slots={slots} showTableXScroll />
    )
  },
})
