import type { TemplateDemoRecord } from '@ghcloud/cube-service-interface/template-demo'
import { TemplateDemoStatus } from '@ghcloud/cube-service-interface/template-demo'

/**
 * 列表页常量：搜索项 options、状态映射等。
 * 拆文件的目的：页面主文件聚焦渲染/交互逻辑，常量与样式在同目录独立维护。
 */

export const STATUS_LABEL: Record<TemplateDemoRecord['status'], string> = {
  [TemplateDemoStatus.Active]: '启用',
  [TemplateDemoStatus.Inactive]: '停用',
}

export const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: STATUS_LABEL[TemplateDemoStatus.Active], value: TemplateDemoStatus.Active },
  { label: STATUS_LABEL[TemplateDemoStatus.Inactive], value: TemplateDemoStatus.Inactive },
]
