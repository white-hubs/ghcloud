import { CubeLayout, useCubeTable } from '@ghcloud/cube-app-design'
import { Empty } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTeleportThemeVars } from '@/hooks/use-teleport-theme-vars'

/**
 * Batch-2 S12：`CubeLayout` + `useCubeTable`，`dataSource` 固定为空数组；
 * 内容区展示 `@ghcloud/cube-ui` 的 `Empty`，表格仅保留最少列定义（无占位行）。
 */
export const ShowcaseSceneS12 = defineComponent({
  name: 'ShowcaseSceneS12',
  setup: () => {
    const { pageTitle } = usePageName()
    useTeleportThemeVars()

    const sceneMessages = {
      'zh-CN': {
        showcaseSceneS12Title: 'Showcase · 场景 S12',
        columnNameTitle: '名称',
        emptyNoDataDescription: '暂无数据',
      },
      'en-US': {
        showcaseSceneS12Title: 'Showcase · Scene S12',
        columnNameTitle: 'Name',
        emptyNoDataDescription: 'No data',
      },
    }

    const { t } = useI18n({ inheritLocale: true, useScope: 'local', messages: sceneMessages })

    const columns = [{ dataIndex: 'name', title: t('columnNameTitle'), ellipsis: true }]
    const [CubeTable] = useCubeTable({
      columns,
      dataSource: [],
      rowKey: 'id',
      autoFetch: false,
      pagination: false,
    })
    const slots = {
      'layout-content': (): JSX.Element => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Empty description={t('emptyNoDataDescription')} />
          <CubeTable />
        </div>
      ),
    }
    return (): JSX.Element => (
      <CubeLayout title={pageTitle || t('showcaseSceneS12Title')} v-slots={slots} showTableXScroll />
    )
  },
})
