import { CubeLayout } from '@ghcloud/cube-app-design'
import { Table, type ColumnType } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

const FIXED_COL_WIDTH = 160
const DATA_COL_WIDTH = 150
/** 除首列外的数据列数量 */
const DATA_COLUMN_COUNT = 18
/** 横向滚动区域宽度（需覆盖各列宽之和） */
const SCROLL_X = 3200

type WideRow = Record<string, string | number> & { key: string }

const sceneMessages = {
  'zh-CN': {
    layoutTitle: 'Showcase · S17 宽表固定列',
    firstColTitle: '固定首列',
    dataColumnTitle: '列 {n}',
    rowLabelA: '行 A',
    rowLabelB: '行 B',
    rowLabelC: '行 C',
    rowLabelD: '行 D',
    rowLabelE: '行 E',
  },
  'en-US': {
    layoutTitle: 'Showcase · S17 Wide table, fixed first column',
    firstColTitle: 'Pinned first column',
    dataColumnTitle: 'Column {n}',
    rowLabelA: 'Row A',
    rowLabelB: 'Row B',
    rowLabelC: 'Row C',
    rowLabelD: 'Row D',
    rowLabelE: 'Row E',
  },
}

const buildColumns = (t: (key: string, values?: Record<string, unknown>) => string): ColumnType[] => {
  const first: ColumnType = {
    title: t('firstColTitle'),
    dataIndex: 'label',
    key: 'label',
    width: FIXED_COL_WIDTH,
    fixed: 'left',
  }
  const rest: ColumnType[] = Array.from({ length: DATA_COLUMN_COUNT }, (_, index) => {
    const key = `c${index}`
    return {
      title: t('dataColumnTitle', { n: index + 1 }),
      dataIndex: key,
      key,
      width: DATA_COL_WIDTH,
    }
  })
  return [first, ...rest]
}

const buildRow = (key: string, label: string, prefix: string): WideRow => {
  const row: WideRow = { key, label }
  for (let i = 0; i < DATA_COLUMN_COUNT; i += 1) {
    row[`c${i}`] = `${prefix}-${i + 1}`
  }
  return row
}

const buildDataSource = (t: (key: string, values?: Record<string, unknown>) => string): WideRow[] => [
  buildRow('1', t('rowLabelA'), 'A'),
  buildRow('2', t('rowLabelB'), 'B'),
  buildRow('3', t('rowLabelC'), 'C'),
  buildRow('4', t('rowLabelD'), 'D'),
  buildRow('5', t('rowLabelE'), 'E'),
]

/**
 * Batch-2 S17：`CubeLayout` + `showTableXScroll`，多列表格首列 `fixed: 'left'`，大 `scrollX`，静态 `dataSource`。
 */
export const ShowcaseSceneS17 = defineComponent({
  name: 'ShowcaseSceneS17',
  setup: () => {
    const { pageTitle } = usePageName()
    const { t } = useI18n({ inheritLocale: true, useScope: 'local', messages: sceneMessages })

    const slots = {
      'layout-content': (): JSX.Element => {
        const columns = buildColumns(t)
        const dataSource = buildDataSource(t)
        return (
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey='key'
            pagination={false}
            size='small'
            scrollX={SCROLL_X}
          />
        )
      },
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || t('layoutTitle')} v-slots={slots} showTableXScroll />
    )
  },
})
