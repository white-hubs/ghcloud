import { defineComponent, onMounted, reactive, ref } from 'vue'
import { CellGroup, Cell, Image, Field, Popup, Picker, Uploader, type UploaderFileListItem, showNotify, Button, Form, Cascader, type CascaderOption, Icon } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import styles from './stocktaking.module.less'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import type { CheckAsset } from '@ghcloud/cube-asset-management-service'
import { cubeAssetManagementService, cubeFileService, cubeMdataService } from '@/api/server'
import { getAssetStatus, getAssetStatusColor } from '@/views/entry/type'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { UserPicker } from '@/components/picker/user-picker/user-picker'
import { DepartmentPicker } from '@/components/picker/department-picker/department-picker'
import type { AreaTree } from '@ghcloud/cube-ouaa-service'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
type FileList = UploaderFileListItem & { ossId: string; }
interface FormDataType {
  taskId: string;
  propertyId: string;
  areaIds: string[];
  areaName: string;
  receiveUserId: string;
  receiveUserName: string;
  receiveDepId: string;
  receiveDepName: string;
  storageLocation: string;
  checkStatus: string;
  checkStatusName: string;
  imgs: string[];
}
export const Stocktaking = defineComponent({
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const areaOptions = ref<AreaTree[]>([])
    const detail = ref<CheckAsset>()
    const showUserPicker = ref(false)
    const showDepartmentPicker = ref(false)
    const showAreaPicker = ref(false)
    const showResultPicker = ref(false)
    const formData = reactive<FormDataType>({
      taskId: route.query.taskId as string ?? '',
      propertyId: route.query.id as string ?? '',
      areaIds: [],
      areaName: '',
      receiveUserId: '',
      receiveUserName: '',
      receiveDepId: '',
      receiveDepName: '',
      storageLocation: '',
      checkStatus: 'COMPLETED',
      checkStatusName: '',
      imgs: []
    })
    const fileList = ref<FileList[]>([])
    const maxPicLimit = 3
    const loading = ref(false)
    onMounted(async () => {
      useMetaTitle()
      initData()
    })
    const initData = async (): Promise<void> => {
      try {
        detail.value = await cubeAssetManagementService.getQueryByTaskId({ taskId: route.query.taskId as string ?? '', id: route.query.id as string ?? '' })
        formData.storageLocation = detail.value.storageLocation ?? ''
        formData.areaIds = detail.value.area ?? ''
        formData.receiveDepName = detail.value.receiveDepName ?? ''
        formData.receiveDepId = detail.value.receiveDepId ?? ''
        formData.receiveUserId = detail.value.receiveUserId ?? ''
        formData.receiveUserName = detail.value.receiveUserName ?? ''
        const list = await cubeMdataService.getAreaTree()
        for (const iterator of list) {
          removeNullChild(iterator)
        }
        areaOptions.value = list as AreaTree[]
      } catch (err) {
        showNotify({ type: 'danger', message: (err as { errorMessage: string; }).errorMessage })
      }
    }
    const removeNullChild = (option: CascaderOption): void => {
      if (option.children) {
        if (option.children.length === 0) {
          delete option.children
        } else {
          for (const iterator of option.children) {
            removeNullChild(iterator)
          }
        }
      }
    }
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
    // 盘点结果选择
    const handleResult = (selectedOptions: { text: string; value: string; }[]): void => {
      showResultPicker.value = false
      formData.checkStatusName = selectedOptions[0].text
      formData.checkStatus = selectedOptions[0].value
    }
    // 选择区域查询
    const handleArea = (options: { selectedOptions: []; value: string; }): void => {
      formData.areaName = options.selectedOptions.map((item: { name: string; }) => item.name).join('/')
      formData.areaIds = options.selectedOptions.map((x: { id: string; }) => x.id)
      showAreaPicker.value = false
    }
    // 选择使用人
    const handleUser = (val: { id: string;name: string; }): void => {
      formData.receiveUserId = val.id
      formData.receiveUserName = val.name
      showUserPicker.value = false
    }
    // 选择部门
    const handleDep = (val: { id: string;name: string; }): void => {
      formData.receiveDepName = val.name
      formData.receiveDepId = val.id
      showDepartmentPicker.value = false
    }
    // 提交
    const submit = async (): Promise<void> => {
      formData.imgs = fileList.value.map(x => x.ossId)
      try {
        loading.value = true
        await cubeAssetManagementService.submitProperty(formData)
        showNotify({ type: 'success', message: '盘点成功' })
        router.go(-1)
      } catch (err) {
        showNotify({ type: 'danger', message: (err as { errorMessage: string; }).errorMessage })
      } finally {
        loading.value = false
      }
    }
    return (): JSX.Element =>
      <div style={{ background: '#f3f7fa', height: '100vh', position: 'relative' }}>
        <CubeNavBar showBack title='资产盘点' />
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
            <div class={styles['cell-title']} style='color: #1F3140;font-weight:400'>修改信息</div>
          </Cell>
          <Form>
            <Field
              is-link
              label-width='122'
              placeholder='请选择使用人'
              name='receiveUserName'
              label='使用人'
              v-model={formData.receiveUserName}
              readonly
              onClick={() => {
                showUserPicker.value = true
              }}
              v-slots={{ 'right-icon': () => <>{formData.receiveUserName ? <Icon name='close' onClick={(e: Event) => {
                e.stopPropagation(); formData.receiveUserName = ''; formData.receiveUserId = ''
              }} /> : null}</> }}
            />
            <Field
              is-link
              label-width='122'
              placeholder='请选择使用部门'
              name='receiveDepName'
              label='使用部门'
              v-model={formData.receiveDepName}
              readonly
              onClick={() => {
                showDepartmentPicker.value = true
              }}
              v-slots={{ 'right-icon': () => <>{formData.receiveDepName ? <Icon name='close' onClick={(e: Event) => {
                e.stopPropagation(); formData.receiveDepName = ''; formData.receiveDepId = ''
              }} /> : null}</> }}

            />
            <Field
              is-link
              label-width='122'
              placeholder='请选择使用区域'
              name='areaName'
              label='区域'
              v-model={formData.areaName}
              readonly
              onClick={() => {
                showAreaPicker.value = true
              }}
              v-slots={{ 'right-icon': () => <>{formData.areaName ? <Icon name='close' onClick={(e: Event) => {
                e.stopPropagation(); formData.areaIds = []; formData.areaName = ''
              }} /> : null}</> }}
            />

            <Field
              label-width='122'
              placeholder='请输入存放地点'
              maxlength='500'
              name='storageLocation'
              label='存放地点'
              type='textarea'
              v-model={formData.storageLocation}
            />
            <Field
              label='资产照片'
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
            <Field
              label-width='122'
              placeholder='请选择盘点结果'
              maxlength='500'
              name='checkStatusName'
              label='盘点结果'
              is-link
              type='textarea'
              readonly
              v-model={formData.checkStatusName}
              onClick={() => {
                showResultPicker.value = true
              }}
            />
          </Form>
        </CellGroup>
        <div class={styles.button}>
          <Button block size='small' type='primary' onClick={submit} loading={loading.value}>提交</Button>
        </div>
        <Popup v-model:show={showUserPicker.value} position='right' style='height:100%;width:100%'>
          <UserPicker onSubmit={(val: { id: string;name: string; }) => {
            handleUser(val)
          }} />
        </Popup>
        <Popup v-model:show={showDepartmentPicker.value} position='right' style='height:100%;width:100%'>
          <DepartmentPicker onSubmit={(val: { id: string;name: string; }) => {
            handleDep(val)
          }} />
        </Popup>
        <Popup v-model:show={showAreaPicker.value} round position='bottom'>
          <Cascader
            v-model={formData.areaIds}
            onFinish={handleArea}
            field-names={{ text: 'name', value: 'id', children: 'children' }}
            options={areaOptions.value}
            onClose={() => {
              showAreaPicker.value = false
            }}
          />
        </Popup>
        <Popup v-model:show={showResultPicker.value} position='bottom'>
          <Picker
            columns={[{ text: '已盘', value: 'COMPLETED' }, { text: '盘亏', value: 'LOSS' }]}
            onConfirm={({ selectedOptions }: { selectedOptions: []; }) => {
              handleResult(selectedOptions)
            }}
            onCancel={() => {
              showResultPicker.value = false
            }}
          />
        </Popup>
      </div>
  }
})
