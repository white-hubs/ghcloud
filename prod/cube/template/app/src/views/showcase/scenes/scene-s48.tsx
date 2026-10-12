import { CubeLayout } from '@ghcloud/cube-app-design'
import { Tree } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { computed, defineComponent, ref } from 'vue'

import type { Key } from 'ant-design-vue/es/vc-tree/interface'

const treeData = [
  {
    title: '区域 · 华东',
    key: 'region-east',
    children: [
      { title: '门店 A', key: 'store-a' },
      { title: '门店 B', key: 'store-b' },
    ],
  },
  {
    title: '区域 · 华北',
    key: 'region-north',
    children: [{ title: '门店 C', key: 'store-c' }],
  },
]

function formatCheckedKeys(keys: Key[] | { checked: Key[]; halfChecked: Key[] }): string {
  if (Array.isArray(keys)) {
    return keys.length === 0 ? '（无）' : keys.map(String).join('，')
  }
  const { checked } = keys
  return checked.length === 0 ? '（无）' : checked.map(String).join('，')
}

/**
 * Batch-3 S48：`CubeLayout` + `Tree` `checkable` 与静态 `treeData`，文案展示当前勾选 key；无路由。
 */
export const ShowcaseSceneS48 = defineComponent({
  name: 'ShowcaseSceneS48',
  setup: () => {
    const { pageTitle } = usePageName()
    const checkedKeys = ref<Key[] | { checked: Key[]; halfChecked: Key[] }>(['store-a'])

    const checkedSummary = computed((): string => formatCheckedKeys(checkedKeys.value))

    const slots = {
      'layout-content': (): JSX.Element => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <Tree checkable treeData={treeData} defaultExpandAll v-model:checkedKeys={checkedKeys.value} />
          <p style={{ margin: 0, color: 'rgba(0, 0, 0, 0.65)', fontSize: '14px' }}>
            当前勾选 key：<span style={{ color: 'rgba(0, 0, 0, 0.88)' }}>{checkedSummary.value}</span>
          </p>
        </div>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S48 Tree'} v-slots={slots} showFooter={false} />
    )
  },
})
