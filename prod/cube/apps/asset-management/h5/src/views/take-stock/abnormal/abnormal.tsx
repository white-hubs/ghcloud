import { defineComponent, onMounted, reactive, ref } from 'vue'
import { CellGroup, Cell, Image, Field, Popup, Picker, Uploader, type UploaderFileListItem, showNotify, Button, Form } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import styles from './abnormal.module.less'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import type { CheckAsset } from '@ghcloud/cube-asset-management-service'
import { cubeAssetManagementService, cubeDictionaryService, cubeFileService } from '@/api/server'
import { getAssetStatus, getAssetStatusColor } from '@/views/entry/type'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import type { GetDictionaryByItem } from '@ghcloud/cube-dictionary-service'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
type FileList = UploaderFileListItem & { ossId: string; }
interface FormDataType {
  taskId: string;
  checkStatus?: string;
  abnormalType: string;
  abnormalRemarks: string;
  abnormalTypeName: string;
  abnormalFiles: string[];
  propertyId: string;
}
export const Abnormal = defineComponent({
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const detail = ref<CheckAsset>()
    const formRef = ref()
    const formData = reactive<FormDataType>({
      taskId: route.query.taskId as string ?? '',
      propertyId: route.query.id as string ?? '',
      abnormalType: '',
      abnormalTypeName: '',
      abnormalRemarks: '',
      abnormalFiles: [],
      checkStatus: 'ABNORMAL'
    })
    const fileList = ref<FileList[]>([])
    const maxPicLimit = 3
    const loading = ref(false)
    onMounted(async () => {
      useMetaTitle()
      getTaskDetail()
      abnormalTypeOption.value = await cubeDictionaryService.getDictionaryByItem({
        itemCode: 'property-abnormal-type',
        code: ''
      })
    })
    const showPicker = ref(false)
    const abnormalTypeOption = ref<GetDictionaryByItem[]>([])
    const clickUpload = async (): Promise<void> => {
      if (getEnvironment() === 'cubeApp') {
        // js sdk 能力调取
        const res = await cubeAppService.uploadImage(maxPicLimit + '',
          { sceneCode: GLOBAL_SCENE_CODE.propertyManagement })
        fileList.value = [...fileList.value, ...res.map(e => {
          const item = e as { path: string; id: string; }
          return {
            url: item.path,
            ossId: item.id,
            isImage: true
          }
        })]
      } else {
        (document.querySelector('.van-uploader__input') as unknown as HTMLElement).click()
      }
    }
    const customUploader = async (uploadItem: UploaderFileListItem): Promise<void> => {
      if (!uploadItem.file) {
        return
      }
      const fileIndex = fileList.value.findIndex(e => uploadItem.file && e.file && e.file.name === uploadItem.file.name)
      if (fileIndex === -1) {
        return
      }
      if (uploadItem.file.size / 1024 > 1024 * 100) {
        showNotify('附件图片大小不能超过100MB')
        fileList.value.splice(fileIndex, 1)
        return
      }
      fileList.value[fileIndex].status = 'uploading'
      const res = await cubeFileService.uploadFile({
        file: uploadItem.file,
        businessKey: 'mdata',
        sceneCode: GLOBAL_SCENE_CODE.propertyManagement
      })

      fileList.value[fileIndex].status = ''
      fileList.value[fileIndex].ossId = res.id ?? ''
    }
    // 下拉选择
    const pickerConfirm = (selectedOptions: { name: string; code: string; id: string; }[]): void => {
      showPicker.value = false
      formData.abnormalTypeName = selectedOptions[0].name
      formData.abnormalType = selectedOptions[0].id
    }
    // 详细信息
    const getTaskDetail = async (): Promise<void> => {
      detail.value = await cubeAssetManagementService.getQueryByTaskId({ taskId: route.query.taskId as string ?? '', id: route.query.id as string ?? '' })
    }
    const submit = async (): Promise<void> => {
      formData.abnormalFiles = fileList.value.map(x => x.ossId)
      await formRef.value.validate()
      try {
        loading.value = true
        await cubeAssetManagementService.submitProperty(formData)
        showNotify({ type: 'success', message: '提交成功' })
        router.go(-1)
      } catch (err) {
        showNotify({ type: 'danger', message: (err as { errorMessage: string; }).errorMessage })
      } finally {
        loading.value = false
      }
    }
    return (): JSX.Element =>
      <div style={{ background: '#f3f7fa', height: '100vh', position: 'relative' }}>
        <CubeNavBar showBack title='资产异常' />
        <CellGroup class={styles['cell-group']} key={detail.value?.name}>
          <Cell>
            <div class={styles['cell-title']}>
              <span class={styles.status} style={{ background: `${getAssetStatusColor.get(detail.value?.status ?? '')}` }}>{getAssetStatus.get(detail.value?.status ?? '')}</span>
              <span>{detail.value?.name}</span>
            </div>
          </Cell>
          <Cell class={styles.cell}>
            <div class={styles['cell-item']}>
              <label style='color:#666666'>财务编码：</label>
              <span>{detail.value?.financeNumber || '--'}</span>
            </div>
            <div class={styles['cell-item']}>
              <label>资产类别：</label>
              <span>{detail.value?.typeName || '--'}</span>
            </div>
            <div class={styles['cell-item']}>
              <label>购入日期：</label>
              <span>{detail.value?.purchaseDate ? dayjs(detail.value?.purchaseDate).format('YYYY-MM-DD') : '--'}</span>
            </div>
            <div class={styles['cell-item']}>
              <label>使用部门：</label>
              <span>  {detail.value?.receiveDepName || '--'} </span>
            </div>
            <div class={styles['cell-item']}>
              <label>使用人员：</label>
              <span>{detail.value?.receiveUserName || '--'}</span>
            </div>
            <Image
              class={styles.img}
              src={detail.value?.file?.[0]?.path}
              width='70' height='70' alt=''
            />
          </Cell>
        </CellGroup>
        <CellGroup style='margin-top:10px;'>
          <Cell>
            <div class={styles['cell-title']} style='color: #1F3140;font-weight:400'>异常信息</div>
          </Cell>
          <Form style={{ height: '88vh', overflow: 'auto' }} ref={formRef}>
            <Field
              is-link
              label-width='122'
              placeholder='请选择异常类型'
              required
              name='abnormalTypeName'
              label='异常类型'
              v-model={formData.abnormalTypeName}
              rules={[{ required: true, message: '请选择异常类型' }]}
              readonly
              onClick={() => {
                showPicker.value = true
              }}
            />
            <Popup v-model:show={showPicker.value} position='bottom'>
              <Picker
                columns={abnormalTypeOption.value}
                columns-field-names={{
                  text: 'name',
                  value: 'id',
                }}
                onConfirm={({ selectedOptions }: { selectedOptions: []; }) => {
                  pickerConfirm(selectedOptions)
                }}
                onCancel={() => {
                  showPicker.value = false
                }}
              />
            </Popup>
            <Field
              label-width='122'
              placeholder='请输入异常说明'
              maxlength='500'
              name='abnormalRemarks'
              label='异常说明'
              row='2'
              type='textarea'
              v-model={formData.abnormalRemarks}
              onClick={() => { }}
            />
            <Field
              label='异常图片'
              v-slots={
                {
                  input: () => {
                    return (
                      <Uploader
                        v-model={fileList.value}
                        max-count={maxPicLimit}
                        readonly={getEnvironment() === 'cubeApp'}
                        onClickUpload={clickUpload}
                        afterRead={(file: UploaderFileListItem) => {
                          customUploader(file)
                        }}
                      />
                    )
                  }
                }
              }
            />
          </Form>

        </CellGroup>
        <div class={styles.button}>
          <Button block size='small' type='primary' onClick={submit} loading={loading.value}>提交</Button>
        </div>
      </div>
  }
})
