import type { TemplateDemoRecord } from '@ghcloud/cube-service-interface/template-demo'
import { getTemplateDemoDetail } from '@ghcloud/cube-services-client/template-demo.client'
import { useAuthRequest } from '@ghcloud/cube-services-client/auth-request'
import { Button, Card, Skeleton, Tag } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { STATUS_LABEL } from '../../demo-list/demo-list.const'

/**
 * 子模块详情页示例。演示：
 * - 从 `route.params.id` 读取动态路径参数（区别于 `demo-detail.tsx` 使用 query）
 * - 模块内的局部常量复用（从 `views/demo-list` 导入 `STATUS_LABEL`）
 */
export const ModuleItem = defineComponent({
  name: 'ModuleItem',
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(true)
    const record = ref<TemplateDemoRecord | null>(null)

    onMounted(async () => {
      const id = (route.params.id ?? '') as string
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
          title='子模块 · 详情'
          v-slots={{
            extra: () => <Button onClick={() => router.back()}>返回</Button>,
          }}
        >
          {loading.value
            ? <Skeleton active />
            : record.value
              ? (
                <div>
                  <h3>{record.value.name}</h3>
                  <p>
                    <Tag color={record.value.status === 'active' ? 'green' : 'default'}>
                      {STATUS_LABEL[record.value.status]}
                    </Tag>
                  </p>
                  <p>{record.value.remark ?? '暂无备注'}</p>
                </div>
              )
              : <div>未找到数据</div>}
        </Card>
      </div>
    )
  },
})
