import { CubeLayout, useCubeForm } from '@ghcloud/cube-app-design'
import { Alert, Button, Card, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'

const ASYNC_VALIDATE_DELAY_MS = 400
/** 输入该用户名（忽略大小写）时，异步校验在延迟后拒绝，用于模拟「已被占用」。 */
const SIMULATED_TAKEN_USERNAME = 'admin'

/**
 * Batch-2 S29：`useCubeForm` 单字段，`rules.validator` 经 `setTimeout` 延迟后用 `Promise.then` 链完成异步校验（模拟用户名已占用）；无路由。
 */
export const ShowcaseSceneS29 = defineComponent({
  name: 'ShowcaseSceneS29',
  setup: () => {
    const { pageTitle } = usePageName()

    const [CubeForm, formApi] = useCubeForm({
      layout: 'vertical',
      schema: [
        {
          component: 'Input',
          fieldName: 'username',
          label: '用户名',
          componentProps: {
            placeholder: `非「${SIMULATED_TAKEN_USERNAME}」可通过；输入「${SIMULATED_TAKEN_USERNAME}」模拟已占用`,
            allowClear: true,
          },
          rules: [
            { required: true, message: '请输入用户名' },
            {
              validator: (_rule: unknown, value: string): Promise<void> =>
                new Promise((resolve, reject) => {
                  globalThis.setTimeout(() => {
                    Promise.resolve(value)
                      .then((v) => {
                        const trimmed = (v ?? '').trim()
                        if (trimmed === '' || trimmed.toLowerCase() !== SIMULATED_TAKEN_USERNAME) {
                          resolve()
                          return
                        }
                        reject(new Error('该用户名已被占用'))
                      })
                      .catch((error: unknown) => {
                        reject(error instanceof Error ? error : new Error(String(error)))
                      })
                  }, ASYNC_VALIDATE_DELAY_MS)
                }),
            },
          ],
        },
      ],
      showButton: false,
      handleSubmit: (values) => {
        message.success(`校验通过：${String((values as { username?: string }).username ?? '')}`)
      },
    })

    const handleValidateSubmit = (): void => {
      const formInst = formApi.formRef.value
      const p = formInst === undefined || formInst === null ? undefined : formInst.validate()
      if (p === undefined) {
        formApi.handleSubmit()
        return
      }
      p.then(() => {
        formApi.handleSubmit()
      }).catch(() => {
        message.error('请先修正表单错误')
      })
    }

    const slots = {
      'layout-content': (): JSX.Element => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Alert
            type='info'
            showIcon
            message='摘要'
            description={
              <span>
                异步校验固定延迟 {ASYNC_VALIDATE_DELAY_MS} ms；与「{SIMULATED_TAKEN_USERNAME}」冲突时拒绝，其余通过。校验逻辑使用{' '}
                <code>Promise.resolve().then()</code>，validator 内不使用 async/await。
              </span>
            }
          />
          <Card title='单字段异步校验'>
            <CubeForm />
            <div class='mt-20' style={{ display: 'flex', gap: '12px' }}>
              <Button type='primary' onClick={handleValidateSubmit}>
                提交（触发表单校验）
              </Button>
              <Button onClick={() => formApi.handleReset()}>重置</Button>
            </div>
          </Card>
        </div>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || 'Showcase · S29'} v-slots={slots} showFooter={false} />
    )
  },
})
