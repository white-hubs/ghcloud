import { CubeLayout } from '@ghcloud/cube-app-design'
import { useAuthRequest } from '@ghcloud/cube-services-client/auth-request'
import { Button, Card, TypographyText, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

interface MockUser {
  id: string;
  name: string;
  deptName: string;
}

/**
 * 演示「简单 GET + mock」模式；完整 OUAA / 选人组件请参考业务应用（本模板不包含 X6）。
 */
export const ShowcaseRemote = defineComponent({
  name: 'ShowcaseRemote',
  setup: () => {
    const { pageTitle } = usePageName()
    const router = useRouter()
    const { t } = useI18n()
    const users = ref<MockUser[]>([])
    const loading = ref(false)

    const load = (): void => {
      loading.value = true
      useAuthRequest(() =>
        fetch(new URL('/template/showcase/select-users', location.origin).toString()).then((resp) => resp.json() as Promise<{ records: MockUser[] }>),
      )
        .then((data: { records: MockUser[] }) => {
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
      'layout-header': (): JSX.Element => (
        <Button onClick={() => router.push({ name: 'demo-home' })}>返回首页</Button>
      ),
      'layout-content': (): JSX.Element => (
        <Card title={t('showcase.remote.cardTitle')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <TypographyText type='secondary'>
              路径：`GET /template/showcase/select-users`（见 `src/mocks/showcase.mock.ts`）。业务中优先使用 `cube-services-client` deep-import + gateway 工厂。
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

    return (): JSX.Element => <CubeLayout title={pageTitle || 'Showcase · 远程 mock'} v-slots={slots} showFooter={false} />
  },
})
