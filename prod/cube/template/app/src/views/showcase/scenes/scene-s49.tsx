import { CubeLayout, useCubeForm } from '@ghcloud/cube-app-design'
import { Card, TreeSelect, TypographyText, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, ref, watch } from 'vue'
import { useTeleportThemeVars } from '@/hooks/use-teleport-theme-vars'

/** 四级静态树（根 → 事业部 → 城市公司 → 网点），比 S26 的两级更深 */
const TREE_DATA = [
  {
    title: '集团总部',
    value: 'hq',
    children: [
      {
        title: '华东事业部',
        value: 'bu-east',
        children: [
          {
            title: '上海城市公司',
            value: 'city-sh',
            children: [
              { title: '虹桥服务中心', value: 'site-hq' },
              { title: '浦东服务中心', value: 'site-pd' },
            ],
          },
          {
            title: '杭州城市公司',
            value: 'city-hz',
            children: [{ title: '滨江服务中心', value: 'site-bj' }],
          },
        ],
      },
      {
        title: '华北事业部',
        value: 'bu-north',
        children: [
          {
            title: '北京城市公司',
            value: 'city-bj',
            children: [{ title: '朝阳服务中心', value: 'site-cy' }],
          },
        ],
      },
    ],
  },
]

const SITE_TITLE_BY_VALUE: Record<string, string> = {
  'site-hq': '虹桥服务中心',
  'site-pd': '浦东服务中心',
  'site-bj': '滨江服务中心',
  'site-cy': '朝阳服务中心',
}

const TREE_SELECT_MIN_WIDTH = '320px'
const CONTENT_STACK_GAP = '12px'

/**
 * Batch-3 S49：`useCubeForm` + `TreeSelect`（更深静态 `treeData`）+ `TypographyText`；
 * 通过 `watch` 监听 `formApi.formValues` 展示当前选中摘要；无路由。
 */
export const ShowcaseSceneS49 = defineComponent({
  name: 'ShowcaseSceneS49',
  setup: () => {
    const { pageTitle } = usePageName()
    useTeleportThemeVars()

    const selectionSummary = ref<string>('尚未选择网点')

    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      schema: [
        {
          component: TreeSelect,
          fieldName: 'siteId',
          label: '服务网点',
          componentProps: {
            style: { minWidth: TREE_SELECT_MIN_WIDTH },
            placeholder: '请选择四级树中的叶子或任意节点',
            treeData: TREE_DATA,
            allowClear: true,
            showSearch: true,
            treeDefaultExpandAll: true,
          },
        },
      ],
      handleSubmit: (values): void => {
        message.info(`查询提交：${JSON.stringify(values)}`)
      },
      handleReset: (): void => {
        message.success('已重置')
      },
    })

    watch(
      () => formApi.formValues.siteId,
      (siteId) => {
        if (!siteId) {
          selectionSummary.value = '尚未选择网点'
          return
        }
        const key = String(siteId)
        const label = SITE_TITLE_BY_VALUE[key] ?? key
        selectionSummary.value = `表单模型当前值：${label}`
      },
      { immediate: true },
    )

    return (): JSX.Element => {
      const summary = selectionSummary.value
      const slots = {
        'layout-content': (): JSX.Element => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: CONTENT_STACK_GAP }}>
            <Card title='S49 · TreeSelect（深树）与 TypographyText 联动'>
              <CubeForm />
              <TypographyText type='secondary' style={{ display: 'block', marginTop: CONTENT_STACK_GAP }}>
                {summary}
              </TypographyText>
            </Card>
          </div>
        ),
      }
      return <CubeLayout title={pageTitle || 'Showcase · S49 TreeSelect'} v-slots={slots} showFooter={false} />
    }
  },
})
