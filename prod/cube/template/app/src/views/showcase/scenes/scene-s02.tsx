import { CubeLayout } from '@ghcloud/cube-app-design'
import { Table, type ColumnType } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

const COLUMN_WIDTH = 200
const COLUMN_COUNT = 12
const SCROLL_X = 2000

type WideRow = Record<string, string | number> & { key: string }

const buildRow = (key: string, prefix: string): WideRow => {
  const row: WideRow = { key }
  for (let i = 0; i < COLUMN_COUNT; i += 1) {
    row[`c${i}`] = `${prefix}-${i + 1}`
  }
  return row
}

const dataSource: WideRow[] = [
  buildRow('1', 'A'),
  buildRow('2', 'B'),
  buildRow('3', 'C'),
]

/**
 * S02：宽表格横向滚动演示（CubeLayout + Table scrollX）。
 */
export const ShowcaseSceneS02 = defineComponent({
  name: 'ShowcaseSceneS02',
  setup: () => {
    const { pageTitle } = usePageName()

    const sceneMessages = {
      'zh-CN': {
        showcaseSceneS02Title: 'Showcase · S02 宽表',
        tableColumnTitle: '列 {n}',
      },
      'en-US': {
        showcaseSceneS02Title: 'Showcase · S02 Wide table',
        tableColumnTitle: 'Column {n}',
      },
    }

    const { t } = useI18n({ inheritLocale: true, useScope: 'local', messages: sceneMessages })

    const columns: ColumnType[] = Array.from({ length: COLUMN_COUNT }, (_, index) => {
      const key = `c${index}`
      return {
        title: t('tableColumnTitle', { n: index + 1 }),
        dataIndex: key,
        key,
        width: COLUMN_WIDTH,
      }
    })

    const slots = {
      'layout-content': (): JSX.Element => (
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey='key'
          pagination={false}
          size='small'
          scrollX={SCROLL_X}
        />
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || t('showcaseSceneS02Title')} v-slots={slots} showTableXScroll />
    )
  },
})
