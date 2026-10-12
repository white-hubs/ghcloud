import { Modal, Steps, Step } from '@ghcloud/cube-ui'
import { defineComponent, ref } from 'vue'
import Styles from './import-modal.module.less'
import { ImportData } from './import-data'
import { ImportResult } from './import-result'
import type { ImportExamQuestionVO } from '@ghcloud/cube-secure-edu-service'

export const QuestionImportModel = defineComponent({
  emits: ['enter'],
  setup: (props, { expose, emit }) => {
    const currentStep = ref(0)
    const modalVisible = ref(false)
    const loading = ref(false)
    const importDataRef = ref<{ handleImport: () => Promise<unknown>; }>()
    const importSuccess = ref<ImportExamQuestionVO>({
      errorMsg: [],
      fail: 0,
      success: 0,
      importErrorList: null
    })
    const openModal = (): void => {
      modalVisible.value = true
      currentStep.value = 0
      loading.value = false
    }
    /** 确定按钮回回调 */
    const ok = async (): Promise<void> => {
      try {
        loading.value = true
        if (currentStep.value === 0) {
          await importDataRef.value?.handleImport()
        }
        if (currentStep.value < 2) currentStep.value++
        emit('enter')
      } catch {
      } finally {
        loading.value = false
      }
    }
    const cancel = (): void => {
      modalVisible.value = false
    }
    expose({
      openModal
    })
    return (): JSX.Element =>
      <Modal
        visible={modalVisible.value}
        title='批量导入'
        destroyOnClose
        confirmLoading={loading.value}
        onCancel={cancel}
        okText={currentStep.value === 1 ? '确定' : '下一步'}
        onOk={currentStep.value < 1 ? ok : cancel}
      >
        <>
          <div class={Styles['step-form-title']}>
            <Steps current={currentStep.value} size='small' style='width:80%'>
              <Step title='上传数据' />
              <Step title='导入结果' />
            </Steps>
          </div>
          <div class={Styles['step-form']}>
            {
              currentStep.value === 0 &&
                <ImportData ref={importDataRef} onSuccess={(res: ImportExamQuestionVO) => {
                  importSuccess.value = res
                }} />
            }
            {
              currentStep.value === 1 &&
                <ImportResult v-model:value={importSuccess.value} />
            }
          </div>
        </>
      </Modal>
  }
})
