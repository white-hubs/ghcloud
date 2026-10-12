import { CubeLayout, useCubeForm } from '@ghcloud/cube-app-design'
import { Card, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

/** 静态两级 Cascader：仅大区 → 城市，无第三级。 */
const SCENE_S27_CASCADER_OPTIONS = [
  {
    value: 'east-china',
    label: '华东',
    children: [
      { value: 'shanghai', label: '上海' },
      { value: 'hangzhou', label: '杭州' },
      { value: 'nanjing', label: '南京' },
    ],
  },
  {
    value: 'north-china',
    label: '华北',
    children: [
      { value: 'beijing', label: '北京' },
      { value: 'tianjin', label: '天津' },
    ],
  },
]

/**
 * Batch-2 S27：`CubeLayout` + `useCubeForm`，`Cascader` 绑定静态两级 `options`（无路由）。
 */
export const ShowcaseSceneS27 = defineComponent({
  name: 'ShowcaseSceneS27',
  setup: () => {
    const { pageTitle } = usePageName()

    const [CubeForm] = useCubeForm({
      layout: 'vertical',
      schema: [
        {
          component: 'Cascader',
          fieldName: 'region',
          label: '地区',
          componentProps: {
            options: SCENE_S27_CASCADER_OPTIONS,
            placeholder: '请选择大区与城市',
            allowClear: true,
            changeOnSelect: false,
          },
        },
      ],
      handleSubmit: (values) => {
        const path = values.region as string[] | undefined
        message.success(path && path.length > 0 ? `已选：${path.join(' / ')}` : '已提交（未选择地区）')
      },
    })

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='两级 Cascader（静态 options）'>
          <CubeForm />
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S27 Cascader'} v-slots={slots} showFooter={false} />
    )
  },
})
