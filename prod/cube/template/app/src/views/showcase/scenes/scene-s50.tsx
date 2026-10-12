import { CubeLayout, useCubeForm } from '@ghcloud/cube-app-design'
import { Card, TypographyText, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { computed, defineComponent } from 'vue'

interface SceneS50CascaderOption {
  value: string
  label: string
  children?: SceneS50CascaderOption[]
}

/** 静态三级 Cascader：产线 → 系列 → 型号。 */
const SCENE_S50_CASCADER_OPTIONS: SceneS50CascaderOption[] = [
  {
    value: 'compute',
    label: '算力设备',
    children: [
      {
        value: 'gpu-server',
        label: 'GPU 服务器',
        children: [
          { value: 'a100-8', label: 'A100 ×8 机架' },
          { value: 'h100-4', label: 'H100 ×4 机架' },
        ],
      },
      {
        value: 'cpu-cluster',
        label: 'CPU 集群',
        children: [
          { value: 'dual-socket', label: '双路计算节点' },
          { value: 'storage-node', label: '存储型节点' },
        ],
      },
    ],
  },
  {
    value: 'network',
    label: '网络设备',
    children: [
      {
        value: 'core-switch',
        label: '核心交换机',
        children: [
          { value: 'sw-48x100g', label: '48×100G 框式' },
          { value: 'sw-32x400g', label: '32×400G 框式' },
        ],
      },
      {
        value: 'access-switch',
        label: '接入交换机',
        children: [
          { value: 'sw-48x1g', label: '48×1G 电口' },
          { value: 'sw-24x10g', label: '24×10G 光口' },
        ],
      },
    ],
  },
]

function formatCascaderPathLabels(path: string[], options: SceneS50CascaderOption[]): string {
  const labels: string[] = []
  let level: SceneS50CascaderOption[] | undefined = options
  for (const segment of path) {
    if (level === undefined) {
      break
    }
    const node = level.find((item) => item.value === segment)
    if (!node) {
      break
    }
    labels.push(node.label)
    level = node.children
  }
  return labels.join(' → ')
}

/**
 * Batch-3 S50：`CubeLayout` + `useCubeForm`，`Cascader` 静态 `options`；
 * 独立 `computed` 摘要随 `formApi.formValues` 变更实时更新（不仅依赖提交）；无路由。
 */
export const ShowcaseSceneS50 = defineComponent({
  name: 'ShowcaseSceneS50',
  setup: () => {
    const { pageTitle } = usePageName()

    const [CubeForm, formApi] = useCubeForm({
      layout: 'vertical',
      isCollapsed: false,
      showCollapseButton: false,
      schema: [
        {
          component: 'Cascader',
          fieldName: 'productPath',
          label: '设备路径',
          componentProps: {
            options: SCENE_S50_CASCADER_OPTIONS,
            placeholder: '请选择产线、系列与型号',
            allowClear: true,
            changeOnSelect: false,
          },
        },
      ],
      handleSubmit: (values: Record<string, unknown>): void => {
        const raw = values.productPath
        const path = Array.isArray(raw) ? (raw as string[]) : []
        message.success(path.length > 0 ? `提交路径：${path.join(' / ')}` : '已提交（未选择路径）')
      },
    })

    const cascaderSummary = computed((): string => {
      const raw = formApi.formValues.productPath
      const path = Array.isArray(raw) ? (raw as string[]) : []
      if (path.length === 0) {
        return '当前未选择；变更级联选择后此处会即时更新。'
      }
      return `当前选择：${formatCascaderPathLabels(path, SCENE_S50_CASCADER_OPTIONS)}`
    })

    const slots = {
      'layout-content': (): JSX.Element => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <Card title='S50 · 三级 Cascader（静态 options）'>
            <CubeForm />
          </Card>
          <Card title='选择摘要（computed · 随表单值变化）'>
            <TypographyText type='secondary'>{cascaderSummary.value}</TypographyText>
          </Card>
        </div>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S50 Cascader 摘要'} v-slots={slots} showFooter={false} />
    )
  },
})
