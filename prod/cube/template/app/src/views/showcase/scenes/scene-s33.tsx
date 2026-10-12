import { CubeLayout } from '@ghcloud/cube-app-design'
import { Descriptions, DescriptionsItem, Tag } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

const DESCRIPTION_COLUMN_COUNT = 2

/**
 * Batch-3 S33：`CubeLayout` + `@ghcloud/cube-ui` 的 `Descriptions` / `DescriptionsItem`，静态只读业务字段（名称、状态、日期），无路由。
 */
export const ShowcaseSceneS33 = defineComponent({
  name: 'ShowcaseSceneS33',
  setup: () => {
    const { pageTitle } = usePageName()

    const slots = {
      'layout-content': (): JSX.Element => (
        <Descriptions bordered column={DESCRIPTION_COLUMN_COUNT} size='small' title='业务信息（只读）'>
          <DescriptionsItem label='名称'>华东区 · 季度对账批次 Q1-2026</DescriptionsItem>
          <DescriptionsItem label='状态'>
            <Tag color='processing'>审批中</Tag>
          </DescriptionsItem>
          <DescriptionsItem label='创建时间'>2026-01-08 09:30:00</DescriptionsItem>
          <DescriptionsItem label='生效日期'>2026-04-01</DescriptionsItem>
          <DescriptionsItem label='截止日期' span={DESCRIPTION_COLUMN_COUNT}>
            2026-06-30
          </DescriptionsItem>
        </Descriptions>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S33 Descriptions'} v-slots={slots} showFooter={false} />
    )
  },
})
