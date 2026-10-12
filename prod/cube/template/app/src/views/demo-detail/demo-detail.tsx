import type { TemplateDemoRecord } from '@ghcloud/cube-service-interface/template-demo'
import { getTemplateDemoDetail } from '@ghcloud/cube-services-client/template-demo.client'
import { useAuthRequest } from '@ghcloud/cube-services-client/auth-request'
import { Button, Card, Descriptions, DescriptionsItem, Skeleton, Space, Tag } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
import { defineComponent, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { STATUS_LABEL } from '../demo-list/demo-list.const'

/**
 * 详情示例。演示：
 * - 从 `route.query.id` 取上下文
 * - `useAuthRequest` 注入鉴权后调用 `client` 函数
 * - loading 骨架屏 + 空态兜底
 */
export const DemoDetail = defineComponent({
  name: 'DemoDetail',
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(true)
    const record = ref<TemplateDemoRecord | null>(null)

    onMounted(async () => {
      const id = (route.query.id ?? '') as string
      if (!id) {
        loading.value = false
        return
      }
      try {
        record.value = await useAuthRequest(() => getTemplateDemoDetail(id))
      } finally {
        loading.value = false
      }
    })

    return (): JSX.Element => (
      <div class='pd-20'>
        <Card
          title='示例详情'
          v-slots={{
            extra: () => (
              <Space>
                <Button onClick={() => router.back()}>返回</Button>
                <Button
                  type='primary'
                  onClick={() => router.push({ name: 'demo-edit', query: route.query })}
                >
                  编辑
                </Button>
              </Space>
            ),
          }}
        >
          {loading.value
            ? <Skeleton active />
            : record.value
              ? (
                <Descriptions column={2} bordered>
                  <DescriptionsItem label='ID'>{record.value.id}</DescriptionsItem>
                  <DescriptionsItem label='名称'>{record.value.name}</DescriptionsItem>
                  <DescriptionsItem label='状态'>
                    <Tag color={record.value.status === 'active' ? 'green' : 'default'}>
                      {STATUS_LABEL[record.value.status]}
                    </Tag>
                  </DescriptionsItem>
                  <DescriptionsItem label='创建时间'>
                    {dayjs(record.value.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                  </DescriptionsItem>
                  <DescriptionsItem label='备注' span={2}>
                    {record.value.remark ?? '--'}
                  </DescriptionsItem>
                </Descriptions>
              )
              : <div class='flex-center' style='padding: 40px 0;'>未找到数据，请检查 query.id</div>}
        </Card>
      </div>
    )
  },
})
