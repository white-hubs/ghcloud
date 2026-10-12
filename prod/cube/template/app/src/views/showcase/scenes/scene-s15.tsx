import { CubeLayout } from '@ghcloud/cube-app-design'
import { Alert, Card, Table, type ColumnType } from '@ghcloud/cube-ui'
import type { FilterValue } from 'ant-design-vue/es/table/interface'
import { usePageName } from '@ghcloud/cube-utils'
import { computed, defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const COL_WIDTH_NAME = 200
const COL_WIDTH_REGION = 160
const COL_WIDTH_STATUS = 140
const TABLE_SCROLL_X = 520

interface DemoRow {
  key: string
  nameKey: string
  region: 'east' | 'west' | 'south'
  status: 'online' | 'offline'
}

const BASE_ROWS: DemoRow[] = [
  { key: '1', nameKey: 'rowName1', region: 'east', status: 'online' },
  { key: '2', nameKey: 'rowName2', region: 'west', status: 'offline' },
  { key: '3', nameKey: 'rowName3', region: 'east', status: 'offline' },
  { key: '4', nameKey: 'rowName4', region: 'south', status: 'online' },
  { key: '5', nameKey: 'rowName5', region: 'west', status: 'online' },
]

interface FilterHintInput {
  region?: FilterValue
  status?: FilterValue
}

/**
 * Batch-2 S15：`@ghcloud/cube-ui` 的 `Table` 透传 ant-design-vue 列配置；静态数据下可使用 `filters` + `onFilter` 做列头筛选。
 */
export const ShowcaseSceneS15 = defineComponent({
  name: 'ShowcaseSceneS15',
  setup: () => {
    const { pageTitle } = usePageName()

    const sceneMessages = {
      'zh-CN': {
        showcaseSceneS15Title: 'Showcase · S15',
        cardTitle: 'S15 · 列 filters / onFilter（静态 dataSource）',
        colName: '名称',
        colRegion: '区域',
        colStatus: '状态',
        regionEast: '华东',
        regionWest: '华西',
        regionSouth: '华南',
        statusOnline: '在线',
        statusOffline: '离线',
        rowName1: '节点 A',
        rowName2: '节点 B',
        rowName3: '节点 C',
        rowName4: '节点 D',
        rowName5: '节点 E',
        filterHintNone: '当前表格筛选 — 无（使用列头筛选图标）',
        filterHintActive: '当前表格筛选 — {parts}',
        filterPartRegion: '区域列: {value}',
        filterPartStatus: '状态列: {value}',
        filterHintSep: '；',
      },
      'en-US': {
        showcaseSceneS15Title: 'Showcase · S15',
        cardTitle: 'S15 · Column filters / onFilter (static dataSource)',
        colName: 'Name',
        colRegion: 'Region',
        colStatus: 'Status',
        regionEast: 'East China',
        regionWest: 'West China',
        regionSouth: 'South China',
        statusOnline: 'Online',
        statusOffline: 'Offline',
        rowName1: 'Node A',
        rowName2: 'Node B',
        rowName3: 'Node C',
        rowName4: 'Node D',
        rowName5: 'Node E',
        filterHintNone: 'Table filters — none (use column filter icons)',
        filterHintActive: 'Table filters — {parts}',
        filterPartRegion: 'Region column: {value}',
        filterPartStatus: 'Status column: {value}',
        filterHintSep: '; ',
      },
    }

    const { t } = useI18n({ inheritLocale: true, useScope: 'local', messages: sceneMessages })

    const buildFilterHint = (input: FilterHintInput = {}): string => {
      const { region, status } = input
      const parts: string[] = []
      if (region !== undefined) {
        parts.push(t('filterPartRegion', { value: String(region) }))
      }
      if (status !== undefined) {
        parts.push(t('filterPartStatus', { value: String(status) }))
      }
      return parts.length > 0 ? t('filterHintActive', { parts: parts.join(t('filterHintSep')) }) : t('filterHintNone')
    }

    const filterState = ref<FilterHintInput>({})
    const filterHint = computed(() => buildFilterHint(filterState.value))

    const columns = computed((): ColumnType<DemoRow>[] => [
      {
        title: t('colName'),
        dataIndex: 'nameKey',
        key: 'name',
        width: COL_WIDTH_NAME,
        ellipsis: true,
        customRender: ({ text }: { text: string }): string => t(text),
      },
      {
        title: t('colRegion'),
        dataIndex: 'region',
        key: 'region',
        width: COL_WIDTH_REGION,
        filters: [
          { text: t('regionEast'), value: 'east' },
          { text: t('regionWest'), value: 'west' },
          { text: t('regionSouth'), value: 'south' },
        ],
        onFilter: (value, record) => record.region === value,
      },
      {
        title: t('colStatus'),
        dataIndex: 'status',
        key: 'status',
        width: COL_WIDTH_STATUS,
        filters: [
          { text: t('statusOnline'), value: 'online' },
          { text: t('statusOffline'), value: 'offline' },
        ],
        onFilter: (value, record) => record.status === value,
      },
    ])

    const handleTableChange = (
      _pagination: unknown,
      filters: Record<string, FilterValue | null>,
    ): void => {
      const input: FilterHintInput = {}
      const { region, status } = filters
      if (
        region !== undefined &&
        region !== null &&
        (!Array.isArray(region) || region.length > 0)
      ) {
        input.region = region
      }
      if (
        status !== undefined &&
        status !== null &&
        (!Array.isArray(status) || status.length > 0)
      ) {
        input.status = status
      }
      filterState.value = input
    }

    return (): JSX.Element => {
      const hint = filterHint.value
      return (
        <CubeLayout
          title={pageTitle || t('showcaseSceneS15Title')}
          showFooter={false}
          v-slots={{
            'layout-content': (): JSX.Element => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                <Alert type='info' showIcon message={hint} />
                <Card title={t('cardTitle')}>
                  <Table
                    rowKey='key'
                    columns={columns.value}
                    dataSource={BASE_ROWS}
                    pagination={false}
                    size='small'
                    scrollX={TABLE_SCROLL_X}
                    onChange={handleTableChange}
                  />
                </Card>
              </div>
            ),
          }}
        />
      )
    }
  },
})
