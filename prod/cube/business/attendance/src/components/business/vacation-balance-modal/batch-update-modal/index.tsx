import { Modal, Steps, Step, type FormExpose } from '@ghcloud/cube-ui'
import { defineComponent, ref, type PropType, type VNode } from 'vue'
import Styles from './index.module.less'
import { VacationType } from '../vacation-type'
import { ImportData } from '../import-data'
import { ImportResult, type ImportType } from '../import-result'

export const BatchUpdateModel = defineComponent({
  props: {
    action: {
      type: String as PropType<'add' | 'update'>,
      default: 'update'
    },
  },
  emits: ['enter'],
  setup: (props, { expose, emit }) => {
    const currentStep = ref(0)
    const modalVisible = ref(false)
    const loading = ref(false)
    const vacationTypeRef = ref<{ formRef: FormExpose; }>()
    const holidayList = ref<{ label: string; value: string; }[]>([])
    const importDataRef = ref<{ handleImport: () => Promise<unknown>; }>()
    const importSuccess = ref<ImportType>({
      errorMsg: [],
      fail: 0,
      success: 0
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
          await vacationTypeRef.value?.formRef.validate()
        }
        if (currentStep.value === 1) {
          await importDataRef.value?.handleImport()
        }
        if (currentStep.value < 2) currentStep.value++
        emit('enter')
      } catch (error) {
      } finally {
        loading.value = false
      }
    }
    const cancel = (): void => {
      modalVisible.value = false
    }
    const handleTypeChange = (list: { label: string; value: string; }[]): void => {
      holidayList.value = list
    }
    expose({
      openModal
    })
    return (): VNode =>
      <Modal
        visible={modalVisible.value}
        title={`${props.action === 'add' ? '批量新增' : '批量修改'}`}
        destroyOnClose
        confirmLoading={loading.value}
        onCancel={cancel}
        okText={currentStep.value === 2 ? '确定' : '下一步'}
        onOk={currentStep.value < 2 ? ok : cancel}
      >
        <>
          <div class={Styles['step-form-title']}>
            <Steps current={currentStep.value} size='small' style='width:80%'>
              <Step title='选择假期类型' />
              <Step title='上传数据' />
              <Step title='导入结果' />
            </Steps>
          </div>
          <div class={Styles['step-form']}>
            {
              currentStep.value === 0 &&
                <VacationType ref={vacationTypeRef} onChange={handleTypeChange} />
            }
            {
              currentStep.value === 1 &&
                <ImportData ref={importDataRef} isAdd={props.action === 'add'} holidayList={holidayList.value} onSuccess={(res: ImportType) => {
                  importSuccess.value = res
                }} />
            }
            {
              currentStep.value === 2 &&
                <ImportResult v-model:value={importSuccess.value} />
            }
          </div>
        </>
      </Modal>
  }
})
