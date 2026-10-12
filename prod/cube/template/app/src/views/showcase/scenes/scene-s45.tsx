import { CubeLayout } from '@ghcloud/cube-app-design'
import { Alert, Button, Card, Upload, message, type UploadChangeParam, type UploadFile, type UploadRequestOption } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, ref } from 'vue'

const FAKE_DELAY_MS = 600
const MAX_UPLOAD_COUNT = 5

/**
 * Batch-3 S45：`CubeLayout` + `Upload`，`customRequest` 在 `setTimeout` 后调用 `onSuccess` 传入伪造响应（无真实上传）；展示受控 `fileList` 与状态说明；无路由。
 */
export const ShowcaseSceneS45 = defineComponent({
  name: 'ShowcaseSceneS45',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S45 Upload'
    const fileList = ref<UploadFile[]>([])
    const statusMessage = ref('尚未有文件：选择后会在短暂延迟后标记为已完成（纯前端模拟）。')

    const customRequest = (options: UploadRequestOption): void => {
      const { file, onSuccess } = options
      const asFile = file as File
      const displayName = asFile.name !== undefined && asFile.name !== '' ? asFile.name : '未命名文件'

      globalThis.setTimeout(() => {
        const fakeResponse = {
          id: 'mock-upload-id',
          url: `mock://upload/${encodeURIComponent(displayName)}`,
          name: displayName,
        }
        if (typeof onSuccess === 'function') {
          onSuccess(fakeResponse)
        }
        message.success(`模拟上传完成：${displayName}`)
        statusMessage.value = `最近一次成功：${displayName}（未发起网络请求，响应对象为本地构造）`
      }, FAKE_DELAY_MS)
    }

    const handleChange = (info: UploadChangeParam): void => {
      fileList.value = info.fileList
    }

    const slots = {
      'layout-content': (): JSX.Element => {
        const names = fileList.value
          .map((f) => f.name)
          .filter((n): n is string => typeof n === 'string' && n !== '')
        const listLine = names.length > 0 ? names.join('、') : '（暂无）'

        return (
          <Card title='Upload（customRequest → 延迟 onSuccess）'>
            <Alert message={statusMessage.value} type='info' style={{ marginBottom: 16 }} showIcon />
            <Upload
              customRequest={customRequest}
              fileList={fileList.value}
              onChange={handleChange}
              maxCount={MAX_UPLOAD_COUNT}
            >
              <Button type='primary'>选择文件</Button>
            </Upload>
            <p style={{ marginTop: 16, marginBottom: 0 }}>
              当前 fileList（共 {String(fileList.value.length)} 项）：{listLine}
            </p>
          </Card>
        )
      },
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
