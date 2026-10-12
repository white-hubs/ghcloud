import { defineComponent, onMounted, reactive, ref, computed } from 'vue'
import { Form, Field, Button, Popup, Picker, Icon, showImagePreview, type FormInstance, showNotify, showLoadingToast, closeToast } from 'vant'
import { cubeDictionaryService, cubeElectronPatrolService } from '@/api/server'
import { usePatrolStore } from '@/custom-store/use-patrol-store'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { useRouter, useRoute } from 'vue-router'
import styles from './index.module.less'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
const dictCode = 'ELECTRONIC_PATROL_SUBMIT_CONFIG'
export const PatrolResult = defineComponent({
  setup: () => {
    const route = useRoute()
    const patrolStore = usePatrolStore()
    const router = useRouter()
    const formRef = ref<FormInstance>()
    const state = reactive<{
      remark: string;
      submitLoading: boolean;
      fileIds: string;
      selected: {
        text: string;
        value: string;
      };
      showPicker: boolean;
      requirePic: boolean;
      files: { id: string; path: string; }[];
    }>({
      remark: '',
      fileIds: '',
      selected: {
        text: '正常',
        value: 'NORMAL'
      },
      showPicker: false,
      submitLoading: false,
      requirePic: false,
      files: []
    })
    onMounted(async () => {
      getPatrolFormConfig()
      const hiddenId = sessionStorage.getItem('flowTaskId')
      if (hiddenId) {
        initStoreDataSubmitResult(hiddenId)
      }
    })
    let dictConfig: {
      uploadMethod: string[];
      watermark: string[];
      requirePic: boolean;
    } = {
      uploadMethod: [],
      watermark: [],
      requirePic: false
    }
    const initStoreDataSubmitResult = async (hiddenId: string): Promise<void> => {
      const stateVo = JSON.parse(sessionStorage.getItem('patrolResult') ?? '')
      const pointVo = JSON.parse(sessionStorage.getItem('patrolPointVo') ?? '')
      state.files = stateVo.files
      state.remark = stateVo.remark
      state.selected = stateVo.selected
      state.fileIds = stateVo.fileIds
      patrolStore.pointVo = pointVo
      patrolStore.patrolUser = JSON.parse(sessionStorage.getItem('patrolUser') ?? '')
      await handleSubmit(true, hiddenId)
      removeStorage()
    }
    const removeStorage = (): void => {
      sessionStorage.removeItem('patrolResult')
      sessionStorage.removeItem('patrolPointVo')
      sessionStorage.removeItem('patrolUser')
      sessionStorage.removeItem('flowTaskId')
    }
    const getPatrolFormConfig = async (): Promise<void> => {
      try {
        const config = await cubeDictionaryService.getDictionaryByItem({
          itemCode: dictCode,
          code: 'uploadPicConfig'
        })
        if (config.length === 0) return
        const variable = JSON.parse(config[0].variable)
        state.requirePic = !!variable.requirePic
        dictConfig = variable as typeof dictConfig
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }
    const maxCount = 5
    const handleUploadImage = async (): Promise<void> => {
      const result = await cubeAppService.uploadImage(String(maxCount - state.files.length), {
        sceneCode: GLOBAL_SCENE_CODE.electPatrolSubmitResult,
        watermarkTypes: dictConfig.watermark,
        uploadMethod: dictConfig.uploadMethod,
      }) as unknown as { id: string;path: string; }[]
      state.files = [...state.files, ...result]
    }
    const handleSubmit = async (isToHidden: boolean = false, hiddenId: string = ''): Promise<void> => {
      state.fileIds = state.files.map(item => item.id).join(',')
      await formRef.value?.validate()
      try {
        showLoadingToast({ message: '' })
        state.submitLoading = true
        const params = {
          id: patrolStore.pointVo.id ?? '',
          result: state.selected.value,
          remark: state.remark,
          fileIds: state.files.map(item => item.id),
          isToHidden,
          hiddenId
        }
        await cubeElectronPatrolService.submitElectronTaskResult(params)
        patrolStore.pointVo.id = ''
        if (route.query.backCount) {
          router.go(-Number(route.query.backCount))
        } else {
          router.go(-1)
        }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      } finally {
        state.submitLoading = true
        closeToast()
      }
    }
    const deleteImage = (id: string): void => {
      state.files = state.files.filter(item => item.id !== id)
    }
    const handlePreviewImage = (showIndex: number): void => {
      showImagePreview(state.files.map(item => item.path), showIndex)
    }
    const photoSlots = {
      input: (): JSX.Element => {
        return (
          <div class={styles.uploadedList}>
            {
              state.files.map((item, index) => {
                return (
                  <div class={styles.uploaded} key={item.id} onClick={() => {
                    handlePreviewImage(index)
                  }}>
                    <img src={item.path} alt='' width={60} height={60} />
                    <Icon
                      name='clear' size='20px' color='#000'
                      onClick={(e: Event) => {
                        e.stopPropagation()
                        deleteImage(item.id)
                      }}
                    />
                  </div>
                )
              })
            }
            {state.files.length < 5 &&
              <div class={styles.upload} onClick={handleUploadImage}>
                <Icon name='plus' size='30px' color='#d9d9d9' />
              </div>}

          </div>

        )
      }
    }
    const remarkRules = computed(() => {
      return state.selected.value === 'ABNORMAL' ? [{ required: true, message: '请输入说明信息' }] : []
    })
    const picRules = computed(() => {
      return state.requirePic ? [{ required: state.requirePic, message: '请上传图片' }] : []
    })
    const handleSubmitHiddenDanger = async (): Promise<void> => {
      state.fileIds = state.files.map(item => item.id).join(',')
      await formRef.value?.validate()
      sessionStorage.setItem('patrolResult', JSON.stringify(state))
      sessionStorage.setItem('cube-app-maintenance-object-data', JSON.stringify({
        targetId: route.query.targetId,
        targetName: route.query.targetName,
        targetCategory: 'PATROL_POINT',
      }))
      window.location.href = '/streamengineH5/initiating-work-order?processType=ADD&businessType=HIDDENDANGER'
    }
    return (): JSX.Element => (
      <>
        <CubeNavBar showBack title='巡更' />
        <div class={styles.container}>
          <Form ref={formRef} required='auto'>
            <Field
              label='巡更点'
              v-model={patrolStore.pointVo.locationName}
              readonly
              placeholder='请输入'
            />
            <Field
              label='所属区域'
              v-model={patrolStore.pointVo.arae[0].name}
              readonly
              placeholder='请输入'
            />
            <Field
              v-model={patrolStore.patrolUser.name}
              label='巡更人员'
              readonly
              placeholder='请输入'
            />
            <Field
              name='result'
              label='巡更结果'
              v-model={state.selected.text}
              readonly
              is-link
              onClick={() => {
                state.showPicker = true
              }}
              maxlength='10'
              placeholder='请选择'
            />
            <Field
              v-model={state.remark}
              label='说明'
              rows={2}
              autosize
              rules={remarkRules.value}
              maxlength='200'
              type='textarea'
              show-word-limit
              placeholder='请输入说明信息'
            />
            <Field
              v-model={state.fileIds}
              label='上传照片'
              name='files'
              label-align='top'
              rules={picRules.value}
              v-slots={photoSlots}
            />
            <div class={styles['button-container']}>
              <div class={styles.btn}>
                <Button block type='primary' plain onClick={handleSubmitHiddenDanger}>
                  提交并转隐患
                </Button>
              </div>
              <div class={styles.btn}>
                <Button block type='primary' onClick={async () => handleSubmit(false, '')}>
                  提交
                </Button>
              </div>
            </div>
          </Form>
          <Popup v-model:show={state.showPicker} round position='bottom'>
            <Picker
              columns={[{ text: '正常', value: 'NORMAL' }, { text: '异常', value: 'ABNORMAL' }]}
              title='巡更结果'
              onCancel={() => {
                state.showPicker = false
              }}
              onConfirm={({ selectedOptions }: { selectedOptions: { text: string; value: string; }[]; }): void => {
                state.selected = selectedOptions[0]
                state.showPicker = false
              }}
            />
          </Popup>
        </div>
      </>
    )
  }
})
