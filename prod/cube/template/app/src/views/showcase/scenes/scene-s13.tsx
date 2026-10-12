import { CubeLayout, useCubeTable } from '@ghcloud/cube-app-design'
import { Button, Spin, Table, type ColumnType } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTeleportThemeVars } from '@/hooks/use-teleport-theme-vars'

interface DemoRow {
  id: string
  name: string
}

/**
 * Batch-2 S13：`CubeLayout` + 小表格，演示加载态。
 * - `CubeTable`：通过 `tableApi.loading` 驱动内置表格 loading；
 * - `Spin` + `Table`：外层 `Spin` 包裹（表格 `loading` 关闭以免双重遮罩）。
 * 顶栏按钮切换加载态，便于对比两种表现。
 */
export const ShowcaseSceneS13 = defineComponent({
  name: 'ShowcaseSceneS13',
  setup: () => {
    useTeleportThemeVars()
    const { pageTitle } = usePageName()
    const demoLoading = ref(false)

    const sceneMessages = {
      'zh-CN': {
        showcaseSceneS13Title: 'Showcase · S13',
        colId: 'ID',
        colName: '名称',
        demoRowA: '演示行 A',
        demoRowB: '演示行 B',
        btnStartLoading: '开始加载',
        btnStopLoading: '结束加载',
        sectionCubeTable: 'CubeTable（useCubeTable / 表格 loading）',
        sectionSpinTable: 'Spin 包裹 Table（外层旋转遮罩）',
      },
      'en-US': {
        showcaseSceneS13Title: 'Showcase · S13',
        colId: 'ID',
        colName: 'Name',
        demoRowA: 'Demo row A',
        demoRowB: 'Demo row B',
        btnStartLoading: 'Start loading',
        btnStopLoading: 'Stop loading',
        sectionCubeTable: 'CubeTable (useCubeTable / table loading)',
        sectionSpinTable: 'Spin wrapping Table (outer spinner overlay)',
      },
    }

    const { t, locale } = useI18n({ inheritLocale: true, useScope: 'local', messages: sceneMessages })

    const buildRows = (): DemoRow[] => [
      { id: 's13-1', name: t('demoRowA') },
      { id: 's13-2', name: t('demoRowB') },
    ]

    const buildColumns = (): ColumnType[] => [
      { dataIndex: 'id', title: t('colId'), width: 120 },
      { dataIndex: 'name', title: t('colName'), width: 200, ellipsis: true },
    ]

    const [CubeTable, tableApi] = useCubeTable({
      columns: buildColumns(),
      rowKey: 'id',
      tableCode: 'SHOWCASE_SCENE_S13',
      dataSource: [...buildRows()],
      autoFetch: false,
    })

    watch(
      locale,
      () => {
        tableApi.setColumns(buildColumns())
        tableApi.setDataSource([...buildRows()])
      },
      { flush: 'post' },
    )

    const toggleLoading = (): void => {
      demoLoading.value = !demoLoading.value
      tableApi.loading.value = demoLoading.value
    }

    const slots = {
      'layout-header': (): JSX.Element => (
        <Button type='primary' onClick={toggleLoading}>
          {demoLoading.value ? t('btnStopLoading') : t('btnStartLoading')}
        </Button>
      ),
      'layout-content': (): JSX.Element => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section>
            <p style={{ marginBottom: '8px' }}>{t('sectionCubeTable')}</p>
            <CubeTable />
          </section>
          <section>
            <p style={{ marginBottom: '8px' }}>{t('sectionSpinTable')}</p>
            <Spin spinning={demoLoading.value}>
              <Table
                columns={buildColumns()}
                dataSource={buildRows()}
                rowKey='id'
                pagination={false}
                size='small'
                loading={false}
              />
            </Spin>
          </section>
        </div>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || t('showcaseSceneS13Title')} v-slots={slots} showFooter={false} showTableXScroll />
    )
  },
})
