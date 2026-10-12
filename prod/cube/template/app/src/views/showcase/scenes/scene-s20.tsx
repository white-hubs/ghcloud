import { CubeLayout } from '@ghcloud/cube-app-design'
import { Table, Tag, type ColumnType } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

interface SceneRow {
  key: string
  summaryKey: string
  tier: 'stable' | 'beta' | 'deprecated' | 'experimental' | 'ga' | 'preview' | 'internal'
}

const TIER_TAG_COLOR: Record<SceneRow['tier'], string> = {
  ga: 'green',
  stable: 'cyan',
  beta: 'blue',
  preview: 'purple',
  experimental: 'orange',
  deprecated: 'red',
  internal: 'default',
}

const TIER_I18N_KEY: Record<SceneRow['tier'], string> = {
  ga: 'tierGa',
  stable: 'tierStable',
  beta: 'tierBeta',
  preview: 'tierPreview',
  experimental: 'tierExperimental',
  deprecated: 'tierDeprecated',
  internal: 'tierInternal',
}

const sceneMessages = {
  'zh-CN': {
    showcaseSceneS20Title: 'Showcase · S20',
    colSummary: '说明（省略号）',
    colTier: '发布层级',
    tierGa: 'GA',
    tierStable: '稳定',
    tierBeta: '内测',
    tierPreview: '预览',
    tierExperimental: '实验',
    tierDeprecated: '废弃',
    tierInternal: '内部',
    row1Summary:
      '本行用于演示长文本在列宽受限时的省略号展示：CubeLayout 内容区内的表格列开启 ellipsis 后，超出部分会以省略号截断并保留 Tooltip 提示（由表格组件处理）。',
    row2Summary:
      '第二条同样是一段刻意写得很长的静态说明，用于与首行对照观察省略行为；数据为本地常量，不依赖接口与路由。',
    row3Summary: '第三条略短一些但仍超过单列可视宽度，以便在较小视口下也能触发省略。',
    row4Summary:
      '预览通道：功能可用但可能存在行为调整；表格列使用 Tag 的 customRender 映射不同颜色，便于快速区分层级。',
    row5Summary: '实验特性：仅供联调与展示，不建议在生产环境开启；本场景为 Batch-2 S20 静态演示。',
    row6Summary: '废弃标记：历史兼容保留，新接入应迁移到推荐路径；长文本列继续用于 ellipsis 回归参考。',
    row7Summary: '内部使用：不对外承诺 SLA；第七行保证数据源不少于六条以满足场景要求。',
  },
  'en-US': {
    showcaseSceneS20Title: 'Showcase · S20',
    colSummary: 'Description (ellipsis)',
    colTier: 'Release tier',
    tierGa: 'GA',
    tierStable: 'Stable',
    tierBeta: 'Beta',
    tierPreview: 'Preview',
    tierExperimental: 'Experimental',
    tierDeprecated: 'Deprecated',
    tierInternal: 'Internal',
    row1Summary:
      'This row demonstrates long text with ellipsis when column width is limited: with ellipsis enabled on table columns inside the CubeLayout content area, overflow is truncated with an ellipsis and a tooltip is kept (handled by the table component).',
    row2Summary:
      'The second row is another deliberately long static description for comparing ellipsis behavior with the first row; data is local constants with no API or route dependency.',
    row3Summary: 'The third row is slightly shorter but still wider than a single column on small viewports to trigger ellipsis.',
    row4Summary:
      'Preview channel: features are usable but behavior may change; the tier column uses Tag customRender with colors to distinguish tiers quickly.',
    row5Summary:
      'Experimental: for joint debugging and showcase only; not recommended for production; this scene is Batch-2 S20 static demo.',
    row6Summary:
      'Deprecated: kept for backward compatibility; new integrations should migrate to the recommended path; the long-text column remains for ellipsis regression reference.',
    row7Summary:
      'Internal use: no external SLA commitment; the seventh row ensures at least seven data rows for the scenario.',
  },
}

const dataSource: SceneRow[] = [
  { key: '1', tier: 'ga', summaryKey: 'row1Summary' },
  { key: '2', tier: 'stable', summaryKey: 'row2Summary' },
  { key: '3', tier: 'beta', summaryKey: 'row3Summary' },
  { key: '4', tier: 'preview', summaryKey: 'row4Summary' },
  { key: '5', tier: 'experimental', summaryKey: 'row5Summary' },
  { key: '6', tier: 'deprecated', summaryKey: 'row6Summary' },
  { key: '7', tier: 'internal', summaryKey: 'row7Summary' },
]

/**
 * Batch-2 S20：`CubeLayout` + 静态 `Table`（长文本 `ellipsis` 与 `Tag` 色块列）。
 */
export const ShowcaseSceneS20 = defineComponent({
  name: 'ShowcaseSceneS20',
  setup: () => {
    const { pageTitle } = usePageName()
    const { t } = useI18n({ inheritLocale: true, useScope: 'local', messages: sceneMessages })

    const columns = computed<ColumnType[]>(() => [
      {
        dataIndex: 'summaryKey',
        title: t('colSummary'),
        width: 280,
        ellipsis: true,
        customRender: ({ text }: { text: string }): string => t(text),
      },
      {
        dataIndex: 'tier',
        title: t('colTier'),
        width: 120,
        customRender: ({ text }: { text: SceneRow['tier'] }): JSX.Element => (
          <Tag color={TIER_TAG_COLOR[text]}>{t(TIER_I18N_KEY[text])}</Tag>
        ),
      },
    ])

    const slots = {
      'layout-content': (): JSX.Element => (
        <Table columns={columns.value} dataSource={dataSource} rowKey='key' pagination={false} size='small' />
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || t('showcaseSceneS20Title')} v-slots={slots} showFooter={false} />
    )
  },
})
