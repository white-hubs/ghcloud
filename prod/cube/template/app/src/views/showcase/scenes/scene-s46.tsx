import { CubeLayout } from '@ghcloud/cube-app-design'
import { Alert, Card, message, type UploadChangeParam, type UploadFile, type UploadRequestOption } from '@ghcloud/cube-ui'
import * as CubeUi from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, ref, type Component } from 'vue'

const FAKE_DELAY_MS = 500
const MAX_UPLOAD_COUNT = 5

const cubeUiNs = CubeUi as Record<string, unknown>

function firstDefined (...candidates: unknown[]): unknown {
  for (const c of candidates) {
    if (c !== undefined && c !== null) {
      return c
    }
  }
  return undefined
}

const namedDragger = cubeUiNs.Dragger
const uploadExport = cubeUiNs.Upload as Record<string, unknown> | undefined
const uploadDotDragger =
  uploadExport !== undefined && uploadExport !== null && 'Dragger' in uploadExport ? uploadExport.Dragger : undefined

const resolvedDragger = firstDefined(namedDragger, uploadDotDragger)
const hasDraggerComponent = resolvedDragger !== undefined && resolvedDragger !== null
const DraggerComp = resolvedDragger as Component

/**
 * Batch-3 S46：若 `@ghcloud/cube-ui` 导出 `Dragger` 或 `Upload.Dragger` 则演示 `customRequest` 模拟成功；否则 `Alert`（当前包提供的是 `UploadDragger` 名称）。无路由。
 */
export const ShowcaseSceneS46 = defineComponent({
  name: 'ShowcaseSceneS46',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S46 Upload Dragger'
    const fileList = ref<UploadFile[]>([])

    const customRequest = (options: UploadRequestOption): void => {
      const { file, onSuccess } = options
      const asFile = file as File
      const displayName = asFile.name !== undefined && asFile.name !== '' ? asFile.name : '未命名文件'

      globalThis.setTimeout(() => {
        const fakeResponse = {
          id: 'mock-dragger',
          url: `mock://dragger/${encodeURIComponent(displayName)}`,
          name: displayName,
        }
        if (typeof onSuccess === 'function') {
          onSuccess(fakeResponse)
        }
        message.success(`模拟上传完成：${displayName}`)
      }, FAKE_DELAY_MS)
    }

    const handleChange = (info: UploadChangeParam): void => {
      fileList.value = info.fileList
    }

    const slots = {
      'layout-content': (): JSX.Element => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          {hasDraggerComponent ? (
            <Card title='拖拽上传（customRequest → 模拟成功）'>
              <DraggerComp
                customRequest={customRequest}
                fileList={fileList.value}
                onChange={handleChange}
                maxCount={MAX_UPLOAD_COUNT}
              >
                <p style={{ marginBottom: 4 }}>将文件拖入此区域，或点击选择</p>
                <p style={{ marginBottom: 0, fontSize: 12, opacity: 0.65 }}>纯前端模拟，不发起真实网络请求</p>
              </DraggerComp>
            </Card>
          ) : (
            <Alert
              type='warning'
              showIcon
              message='未检测到可用的拖拽上传组件'
              description='@ghcloud/cube-ui 未导出 Dragger 或 Upload.Dragger；拖拽上传请使用 UploadDragger 等现有导出。'
            />
          )}
        </div>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
