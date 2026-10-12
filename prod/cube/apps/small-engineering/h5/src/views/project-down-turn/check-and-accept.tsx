import { defineComponent, onMounted, reactive, ref } from 'vue'
import styles from './project-down-turn.module.less'
import { Button, CellGroup, Field, Form, Icon, Loading, Picker, Popup, showNotify } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import { cubeSmallEngineeringService } from '@/api/server'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { showImagePreview } from '@ghcloud/cube-utils'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'

export const CheckAndAccept = defineComponent({
  name: 'CheckAndAccept',
  setup: () => {
    const loading = ref(false)
    const showPicker = ref(false)
    const isAbnormal = ref(false)
    const formData = reactive<{
      description: string;
      acceptanceResult: string;
      acceptanceResultText: string;
      fileVOS: { id: string;path: string; }[];
    }>({
      description: '',
      acceptanceResult: '',
      acceptanceResultText: '',
      fileVOS: []
    })
    const route = useRoute()
    const router = useRouter()
    const columns = [
      { text: '验收合格', value: 'QUALIFIED' },
      { text: '验收不合格', value: 'DISQUALIFICATION' },
    ]
    const fileMaxCount = 5
    const filedUploadSlots = {
      input: (): JSX.Element => {
        return (
          <div class={styles.uploadedList}>
            {
              formData.fileVOS.map((item, index) => {
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
            {formData.fileVOS.length < fileMaxCount &&
              <div class={styles.upload} onClick={handleUploadImage}>
                <Icon name='plus' size='30px' color='#d9d9d9' />
              </div>}

          </div>

        )
      }
    }
    const handleUploadImage = async (): Promise<void> => {
      try {
        const result = await cubeAppService.uploadFile(String(fileMaxCount - formData.fileVOS.length), {
          sceneCode: GLOBAL_SCENE_CODE.smallEngineering
        })
        formData.fileVOS = [...formData.fileVOS, ...result]
      } catch (error) {
      }
    }
    const deleteImage = (id: string): void => {
      formData.fileVOS = formData.fileVOS.filter(item => item.id !== id)
    }
    const handlePreviewImage = (showIndex: number): void => {
      showImagePreview(formData.fileVOS.map(item => item.path), showIndex)
    }
    const onConfirm = ({ selectedOptions }: { selectedOptions: { text: string; value: string; }[]; }): void => {
      showPicker.value = false
      formData.acceptanceResultText = selectedOptions[0].text
      formData.acceptanceResult = selectedOptions[0].value
    }

    const getProjectIsAbnormal = async (): Promise<void> => {
      try {
        isAbnormal.value = await cubeSmallEngineeringService.projectIsAbnormal((route.query as { id: string; }).id)
        if (isAbnormal.value){
          showNotify({ type: 'warning', message: '该工程在巡查中存在过异常，请注意异常是否已处理完成' })
        }
      } catch {}
    }
    onMounted(() => {
      getProjectIsAbnormal()
    })

    const feedbackSubmit = async (): Promise<void> => {
      if (!formData.acceptanceResult) {
        showNotify({ type: 'warning', message: '请选择验收结果' })
        return
      }
      loading.value = true
      const params = {
        description: formData.description,
        acceptanceResult: formData.acceptanceResult,
        fileIds: formData.fileVOS.map((item) => item.id),
        scheduleId: (route.query as { id: string; }).id,
      }
      await cubeSmallEngineeringService.projectScheduleCheckAccept(params)
      loading.value = false
      router.back()
    }
    return (): JSX.Element =>
      <>
        <CubeNavBar title='验收' showBack />
        <div class={styles['feedback-loading-box']} v-show={loading.value}>
          <Loading class={styles['feedback-loading']} vertical color='#1989fa'>验收中...</Loading>
        </div>
        <div class={styles['feedback-box']}>
          <div class={styles['feedback-content']}>
            <Form>
              <CellGroup inset>
                <Field
                  v-model={formData.acceptanceResultText}
                  name='slider' label='验收结果'
                  is-link
                  required
                  readonly
                  onClick={() => {
                    showPicker.value = true
                  }}
                />
                <Field
                  name='slider' label='备注'
                  v-model={formData.description}
                  rows='1'
                  autosize={{ maxHeight: 300, minHeight: 100 }}
                  type='textarea'
                  placeholder='请输入备注'
                />
                <Field name='slider' label='附件图片' v-slots={filedUploadSlots} readonly />
              </CellGroup>
              <div class={styles['feedback-btn']}>
                <div class={styles['feedback-btn-line']}>
                  <Button block type='primary' native-type='submit' onClick={feedbackSubmit}>
                    验收
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        </div>
        <Popup v-model:show={showPicker.value} round position='bottom'>
          <Picker
            columns={columns}
            onCancel={() => {
              showPicker.value = false
            }}
            onConfirm={onConfirm}
          />
        </Popup>
      </>
  }
})
