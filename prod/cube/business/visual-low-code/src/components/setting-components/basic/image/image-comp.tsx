import { defineComponent, ref, watch } from 'vue'
import { Form, FormItem, Switch, Upload, useMessage, type UploadFileInfo, InputNumber } from '@ghcloud/visual-view-ui'
import { getNowEnterprise, getToken } from '@/utils/auth'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { ComponentCategoryEnum, type CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
import styles from './image.module.less'
export default defineComponent({
  name: 'page-title',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const message = useMessage()
    const imageForm = ref({ rotationSettings: false, rotationTime: 1 })
    const imageComponent = ref<CreateComponentType | null>()
    const fileList = ref<UploadFileInfo[]>()
    watch(() => chartEditStore.active.pageId, () => {
      imageComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, ComponentCategoryEnum.IMAGE)
      fileList.value = imageComponent.value?.config.imgList
      imageForm.value.rotationSettings = imageComponent.value?.config.rotationSettings
      imageForm.value.rotationTime = imageComponent.value?.config.rotationTime
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.active.targetId, () => {
      imageComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, ComponentCategoryEnum.IMAGE)
      fileList.value = imageComponent.value?.config.imgList
      imageForm.value.rotationSettings = imageComponent.value?.config.rotationSettings
      imageForm.value.rotationTime = imageComponent.value?.config.rotationTime
    }, { immediate: true, deep: true })
    const beforeUpload = (options: { file: UploadFileInfo; fileList: UploadFileInfo[]; }): boolean => {
      let isLt2M = true
      let isSame = true
      if (options.file.file?.size) {
        isLt2M = options.file.file?.size / 1024 / 1024 < 10
        if (!isLt2M) {
          message.error('上传图片不能超过10M')
        }
      }
      fileList.value?.forEach(file => {
        if (file.fullPath === options.file.fullPath) {
          isSame = false
          message.error('已上传相同图片')
        }
      })
      return isLt2M && isSame
    }
    // 添加图片
    const onFinish = (options: { event?: ProgressEvent; }): void => {
      const { data } = JSON.parse(options.event?.target?.response)
      const len = fileList.value?.length ?? 0
      const curFile = fileList.value?.[len - 1]
      const list: UploadFileInfo[] = []
      if (curFile) {
        list.push({
          batchId: curFile.batchId ?? null,
          file: curFile.file ?? null,
          fullPath: curFile.fullPath ?? null,
          percentage: curFile.percentage ?? null,
          thumbnailUrl: curFile.thumbnailUrl ?? null,
          type: curFile.type ?? null,
          id: curFile.id,
          name: curFile.name,
          url: data.path,
          status: curFile.status
        })
      }
      fileList.value?.pop()
      fileList.value = list.concat(fileList.value ?? [])
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.config.imgList = fileList.value
      if (chartEditStore.getCurrentBlock)chartEditStore.sycShareData(chartEditStore.getCurrentBlock)
    }
    // 删除图片
    const onRemove = (data: { file: UploadFileInfo; fileList: UploadFileInfo[]; }): boolean => {
      const list = fileList.value?.filter(img => img.id !== data.file.id)
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.config.imgList = list
      if (chartEditStore.getCurrentBlock)chartEditStore.sycShareData(chartEditStore.getCurrentBlock)
      return true
    }
    // 开启轮播
    const handleRotation = (val: boolean): void => {
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.config.rotationSettings = val
      if (imageComponent.value)chartEditStore.sycShareData(imageComponent.value)
    }
    const handleRotationTime = (val: number): void => {
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.config.rotationTime = val
      if (imageComponent.value)chartEditStore.sycShareData(imageComponent.value)
    }
    return () => (
      <div style={{ margin: '10px' }}>
        <Form model={imageForm.value}>
          <FormItem label='轮播设置' label-placement='left'>
            <Switch v-model:value={imageForm.value.rotationSettings} onChange={handleRotation} />
          </FormItem>
          {imageForm.value.rotationSettings
            ? <FormItem label='轮播秒数' label-placement='left'><InputNumber v-model:value={imageForm.value.rotationTime} onChange={handleRotationTime} min={1} show-button={false} /></FormItem>
            : null}
          <FormItem label='上传图片' label-placement='left' class={styles['upload-content']}>
            <p style={{ fontSize: '12px', color: '#b5b5b7' }}>请上传大小不超过10m，格式为JPG\JEPG\PNG的图片</p>
            <div>
              <Upload
                v-model:file-list={fileList.value}
                listType='image-card'
                accept='.png,.jpg,.jpeg'
                action='/api/file/file'
                show-preview-button={false}
                max={20}
                on-before-upload={beforeUpload}
                on-finish={onFinish}
                on-remove={onRemove}
                data={{ tenant: getNowEnterprise().code, businessKey: 'maintain', applicationCode: 'VISUALCONFIG' }}
                headers={{
                  Authorization: `Bearer ${getToken().accessToken}`,
                  terminal: window.config?.terminal,
                  tenant: getNowEnterprise().code,
                }}
              />
            </div>
          </FormItem>
        </Form>
      </div>
    )
  },
})
