import { Modal, Steps, Step } from '@ghcloud/cube-ui'
import { defineComponent, ref } from 'vue'
import Styles from './import-modal.module.less'
import { ImportData } from './import-data'
import { ImportResult } from './import-result'
import type { ImportResultVO } from '@ghcloud/cube-bi-data-management'

export const ImportModal = defineComponent({
  props: {
    merchantType: {
      type: String,
      default: 'PURCHASER'
    }
  },
  emits: ['enter'],
  setup: (props, { expose, emit }) => {
    const currentStep = ref(0)
    const modalVisible = ref(false)
    const loading = ref(false)
    const importDataRef = ref<{ handleImport: () => Promise<ImportResultVO>; }>()
    const importSuccess = ref<{
      fail: number;
      success: number;
      errorList: ImportResultVO['errorList'] | null;
    }>({
      fail: 0,
      success: 0,
      errorList: null
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
          const result = await importDataRef.value?.handleImport()
          importSuccess.value.fail = result?.errorList?.length ?? 0
          importSuccess.value.success = result?.success ?? 0
          importSuccess.value.errorList = result?.errorList ?? []
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
                <ImportData merchantType={props.merchantType} ref={importDataRef} />
            }
            {
              currentStep.value === 1 &&
                <ImportResult merchantType={props.merchantType} v-model:value={importSuccess.value} />
            }
          </div>
        </>
      </Modal>
  }
})
