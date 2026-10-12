import { CubeLayout, useCubeForm } from '@ghcloud/cube-app-design'
import { TreeSelect, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'
import { useTeleportThemeVars } from '@/hooks/use-teleport-theme-vars'

/** 静态树，共 4 个可选节点（1 父 + 3 子） */
const TREE_DATA = [
  {
    title: '区域',
    value: 'region',
    children: [
      { title: '华东', value: 'east' },
      { title: '华北', value: 'north' },
      { title: '华南', value: 'south' },
    ],
  },
]

/**
 * Batch-2 S26：`CubeLayout` + `useCubeForm` 单字段，自定义组件为 `TreeSelect`，静态 `treeData`（无路由）。
 */
export const ShowcaseSceneS26 = defineComponent({
  name: 'ShowcaseSceneS26',
  setup: () => {
    const { pageTitle } = usePageName()
    useTeleportThemeVars()
    const [CubeForm] = useCubeForm({
      layout: 'horizontal',
      schema: [
        {
          component: TreeSelect,
          fieldName: 'regionId',
          label: '区域',
          componentProps: {
            style: { minWidth: '280px' },
            placeholder: '请选择区域',
            treeData: TREE_DATA,
            allowClear: true,
            showSearch: true,
            treeDefaultExpandAll: true,
          },
        },
      ],
      handleSubmit: (values) => {
        message.info(`已查询：${String(values.regionId ?? '')}`)
      },
      handleReset: () => {
        message.success('已重置')
      },
    })
    const slots = {
      'layout-content': (): JSX.Element => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <CubeForm />
        </div>
      ),
    }
    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S26 TreeSelect'} v-slots={slots} showFooter={false} />
    )
  },
})
