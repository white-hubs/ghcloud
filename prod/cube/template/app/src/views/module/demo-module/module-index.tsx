import type { Pagination } from '@ghcloud/cube-service-interface/base'
import type { TemplateDemoRecord } from '@ghcloud/cube-service-interface/template-demo'
import { listTemplateDemo } from '@ghcloud/cube-services-client/template-demo.client'
import { useAuthRequest } from '@ghcloud/cube-services-client/auth-request'
import { Button, Card, Skeleton, Space } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

/**
 * 子模块入口页示例。
 *
 * 约定：业务规模扩大后，按 `views/module/<module-name>/` 拆分子模块；
 * 每个子模块独立管理自己的若干页面，避免 views 根目录 "爆炸"。
 */
export const ModuleIndex = defineComponent({
  name: 'ModuleIndex',
  setup: () => {
    const router = useRouter()
    const loading = ref(true)
    const list = ref<TemplateDemoRecord[]>([])

    onMounted(async () => {
      try {
        const resp: Pagination<TemplateDemoRecord> = await useAuthRequest(() => listTemplateDemo({ pageNumber: 1, pageSize: 5 }))
        list.value = resp.records
      } finally {
        loading.value = false
      }
    })

    return (): JSX.Element => (
      <div class='pd-20'>
        <Card
          title='子模块示例 · 入口'
          v-slots={{
            extra: () => <Button onClick={() => router.push({ name: 'demo-list' })}>回到主列表</Button>,
          }}
        >
          {loading.value
            ? <Skeleton active />
            : (
              <div>
                {list.value.map((item) => (
                  <div key={item.id} class='pd-10' style='border-bottom: 1px solid #f0f0f0;'>
                    <Space>
                      <span>{item.name}</span>
                      <Button
                        type='link'
                        onClick={() => router.push({ name: 'module-demo-item', params: { id: item.id } })}
                      >
                        查看详情
                      </Button>
                    </Space>
                  </div>
                ))}
              </div>
            )}
        </Card>
      </div>
    )
  },
})
