import { CubeLayout, useCubeForm } from '@ghcloud/cube-app-design'
import { Alert, Card } from '@ghcloud/cube-ui'
import * as CubeUi from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, type Component } from 'vue'

/** cube-ui 导出名为 DateRangePicker，而非 Ant Design Vue 常用的 RangePicker */
const REQUIRED_CUBE_UI_NAMES = ['DatePicker', 'DateRangePicker', 'TimePicker'] as const

const collectMissingCubeUiExports = (ns: Record<string, unknown>): string[] =>
  REQUIRED_CUBE_UI_NAMES.filter((name) => {
    const exported = ns[name]
    return exported === undefined || exported === null
  })

/**
 * Batch-2 S25：`useCubeForm` + cube-ui 日期 / 区间（DateRangePicker）/ 时间选择器；若包未导出所需符号则仅展示缺失列表。
 */
export const ShowcaseSceneS25 = defineComponent({
  name: 'ShowcaseSceneS25',
  setup: () => {
    const { pageTitle } = usePageName()
    const missingExports = collectMissingCubeUiExports(CubeUi as Record<string, unknown>)
    const registry = CubeUi as Record<string, Component>
    const pickerSchema =
      missingExports.length === 0
        ? [
            {
              component: registry.DatePicker,
              fieldName: 'singleDate',
              label: '日期（DatePicker）',
              componentProps: { placeholder: '选择日期', valueFormat: 'YYYY-MM-DD' },
            },
            {
              component: registry.DateRangePicker,
              fieldName: 'dateRange',
              label: '日期区间（DateRangePicker）',
              componentProps: { placeholder: ['开始', '结束'], valueFormat: 'YYYY-MM-DD' },
            },
            {
              component: registry.TimePicker,
              fieldName: 'time',
              label: '时间（TimePicker）',
              componentProps: { placeholder: '选择时间', valueFormat: 'HH:mm:ss' },
            },
          ]
        : []

    const [CubeForm] = useCubeForm({
      layout: 'vertical',
      showButton: false,
      schema: pickerSchema,
      handleSubmit: () => {},
    })

    const slots = {
      'layout-content': (): JSX.Element => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          {missingExports.length > 0 ? (
            <Alert
              type='warning'
              showIcon
              message='cube-ui 未导出下列符号，无法组装本场景的 useCubeForm'
              description={
                <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                  {missingExports.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              }
            />
          ) : (
            <Card title='useCubeForm · DatePicker / DateRangePicker / TimePicker（cube-ui）'>
              <CubeForm />
            </Card>
          )}
        </div>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S25 日期与时间'} v-slots={slots} showFooter={false} />
    )
  },
})
