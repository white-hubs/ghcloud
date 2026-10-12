import { CubeLayout } from '@ghcloud/cube-app-design'
import { useAuthRequest } from '@ghcloud/cube-services-client/auth-request'
import { Button, Card, TypographyText, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, ref } from 'vue'

interface MockUser {
  id: string
  name: string
  deptName: string
}

/**
 * Batch-4 S68：`CubeLayout` + `useAuthRequest` 拉取 mock 用户（与 `showcase-remote` 同源）；无路由。
 */
export const ShowcaseSceneS68 = defineComponent({
  name: 'ShowcaseSceneS68',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S68 mock 用户'
    const users = ref<MockUser[]>([])
    const loading = ref(false)

    const load = (): void => {
      loading.value = true
      useAuthRequest(() =>
        fetch(new URL('/template/showcase/select-users', location.origin).toString()).then((r) => r.json()),
      )
        .then((data: { records?: MockUser[] }) => {
          users.value = data.records ?? []
          message.success(`已加载 ${users.value.length} 条 mock 用户`)
        })
        .catch((error: unknown) => {
          message.error((error as Error).message || '加载失败')
        })
        .finally(() => {
          loading.value = false
        })
    }

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='S68 · mock 用户列表'>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <TypographyText type='secondary'>
              Mock 定义：<code>src/mocks/showcase.mock.ts</code>。
            </TypographyText>
            <Button type='primary' loading={loading.value} onClick={load}>
              拉取 mock 用户
            </Button>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {users.value.map((item) => (
                <li key={item.id}>
                  {item.name} — {item.deptName}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
