import { CubeLayout } from '@ghcloud/cube-app-design'
import { Button, Card, Cascader, Tree, TreeSelect, Upload, message, type UploadRequestOption } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const treeData = [
  {
    title: '父节点 0',
    key: '0-0',
    value: '0-0',
    children: [
      { title: '子节点 0-0', key: '0-0-0', value: '0-0-0' },
      { title: '子节点 0-1', key: '0-0-1', value: '0-0-1' },
    ],
  },
]

const cascaderOpts = [
  {
    value: 'dev',
    label: '研发',
    children: [
      { value: 'fe', label: '前端组' },
      { value: 'be', label: '后端组' },
    ],
  },
]

export const ShowcaseUploadTree = defineComponent({
  name: 'ShowcaseUploadTree',
  setup: () => {
    const { pageTitle } = usePageName()
    const router = useRouter()
    const { t } = useI18n()
    const treeSelectVal = ref<string | undefined>()
    const cascaderVal = ref<string[] | undefined>()

    const mockUpload = (options: UploadRequestOption): void => {
      const { file, onSuccess } = options
      const f = file as File
      globalThis.setTimeout(() => {
        if (onSuccess) {
          onSuccess({ url: `mock://${f.name}` })
        }
        message.success(`已 mock 上传：${f.name}`)
      }, 400)
    }

    const slots = {
      'layout-header': (): JSX.Element => (
        <Button onClick={() => router.push({ name: 'demo-home' })}>返回首页</Button>
      ),
      'layout-content': (): JSX.Element => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          <Card title={t('showcase.uploadTree.cardTree')}>
            <Tree checkable treeData={treeData} defaultExpandAll />
          </Card>
          <Card title={t('showcase.uploadTree.cardTreeSelect')}>
            <TreeSelect
              style={{ width: 320 }}
              placeholder='请选择节点'
              treeData={treeData}
              allowClear
              showSearch
              v-model:value={treeSelectVal.value}
            />
          </Card>
          <Card title={t('showcase.uploadTree.cardCascader')}>
            <Cascader
              style={{ width: 320 }}
              options={cascaderOpts}
              placeholder='请选择'
              v-model:value={cascaderVal.value}
            />
          </Card>
          <Card title={t('showcase.uploadTree.cardUpload')}>
            <Upload customRequest={mockUpload} maxCount={3}>
              <Button>选择文件</Button>
            </Upload>
          </Card>
        </div>
      ),
    }

    return (): JSX.Element => <CubeLayout title={pageTitle || 'Showcase · 树与上传'} v-slots={slots} showFooter={false} />
  },
})
