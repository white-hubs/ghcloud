import { defineComponent, reactive, ref } from 'vue'
import styles from './project-down-turn.module.less'
import { Button, CellGroup, Field, Form, Icon, Loading, type FormInstance, Slider } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import { cubeSmallEngineeringService } from '@/api/server'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { showImagePreview } from '@ghcloud/cube-utils'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'

export const Feedback = defineComponent({
  name: 'Feedback',
  setup: () => {
    const loading = ref(false)
    const formRef = ref<FormInstance>()
    const formData = reactive<{
      schedule: number;
      problemDes: string;
      fileIds: string;
      fileVOS: { id: string;path: string; }[];
    }>({
      schedule: 0,
      problemDes: '',
      fileIds: '',
      fileVOS: []
    })
    const route = useRoute()
    const router = useRouter()
    const schedule = Number((route.query as { schedule: string; }).schedule) || 0
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
    const feedbackSubmit = async (): Promise<void> => {
      formData.fileIds = formData.fileVOS.map((item) => item.id).join(',')
      await formRef.value?.validate()
      loading.value = true
      const params = {
        schedule: String(formData.schedule),
        description: formData.problemDes,
        fileIds: formData.fileVOS.map((item) => item.id),
        scheduleId: (route.query as { id: string; }).id,
      }
      await cubeSmallEngineeringService.projectScheduleFeedback(params)
      loading.value = false
      router.back()
    }

    return (): JSX.Element =>
      <>
        <CubeNavBar title='反馈' showBack />
        <div class={styles['feedback-loading-box']} v-show={loading.value}>
          <Loading class={styles['feedback-loading']} vertical color='#1989fa'>反馈中...</Loading>
        </div>
        <div class={styles['feedback-box']}>
          <div class={styles['feedback-content']}>
            <Form ref={formRef} required='auto'>
              <CellGroup inset>
                <Field
                  name='schedule' label='工程进度'
                  required
                  v-slots={{
                    input: () => {
                      return (
                        <Slider
                          min={schedule}
                          v-model={formData.schedule} v-slots={{
                            button: () => {
                              return (
                                <div class={styles['custom-button']}>{formData.schedule}</div>
                              )
                            }
                          }}
                        />
                      )
                    }
                  }}
                />
                <Field
                  label='反馈描述'
                  v-model={formData.problemDes}
                  rows='1'
                  autosize={{ maxHeight: 300, minHeight: 100 }}
                  type='textarea'
                  maxlength='200'
                  placeholder='请输入反馈描述'
                />
                <Field v-model={formData.fileIds} name='fileIds' rules={[{ required: true, message: '请上传图片' }]} label='附件图片' v-slots={filedUploadSlots} readonly />
              </CellGroup>
              <div class={styles['feedback-btn']}>
                <div class={styles['feedback-btn-line']}>
                  <Button block type='primary' native-type='submit' onClick={feedbackSubmit}>
                    反馈
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </>
  }
})
