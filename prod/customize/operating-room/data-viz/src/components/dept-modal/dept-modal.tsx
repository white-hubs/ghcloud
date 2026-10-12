
import { defineComponent, reactive, ref, watch } from 'vue'
import './dept-modal.less'
import { Form, FormItem, Modal, type FormExpose } from '@ghcloud/cube-ui'
import { useDept } from '@/hook/use-dept'
import type { DeptList } from '@ghcloud/cube-ouaa-service'
import { storeCache } from '@/store/cache'
import { DeptSelect } from '../dept-select/dept-select'

/** 选择科室级联选择 */
export const DeptModal = defineComponent({
  emits: ['modalVisibleChange'],
  setup (props, { emit, expose }) {
    const cacheStore = storeCache()
    const { deptSelect, setDeptCache } = useDept()

    const formInstance = ref<FormExpose>()
    const formState = reactive({
      deptId: deptSelect.value?.id || '',
    })
    const formRules = {
      deptId: [{ required: true, message: '请选择所在科室', trigger: 'change' }],
    }

    const showModal = ref(true)
    const openModal = (): void => {
      showModal.value = true
    }
    const handleOk = async (): Promise<void> => {
      await formInstance.value?.validate()
      showModal.value = false
    }
    const handleCancel = (): void => {
      showModal.value = false
      formInstance.value?.clearValidate()
    }
    watch(() => showModal.value, () => {
      if (!cacheStore.roomSelect || JSON.stringify(cacheStore.roomSelect) === '{}') {
        // 默认选中第一个设备
        if (formState.deptId) {
          cacheStore.roomSelect = cacheStore.roomListByDept[0]
        } else {
          cacheStore.roomSelect = cacheStore.roomList[0]
        }
      }
      if (!cacheStore.roomListByDept || cacheStore.roomListByDept.length === 0) {
        cacheStore.roomSelect = undefined
      }
      emit('modalVisibleChange', showModal.value)
    })
    expose({
      openModal
    })
    return (): JSX.Element =>
      <>
        <Modal
          title='请选择所在科室'
          v-model:visible={showModal.value}
          width='52rem'
          class='dept-modal-modal'
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Form ref={formInstance} model={formState} labelCol={{ style: { width: '10rem' } }} rules={formRules}>
            <FormItem label='所在科室' name='deptId'>
              <DeptSelect
                v-model:value={formState.deptId}
                placeholder='请选择所在科室'
                width='300px'
                onChange={(item: DeptList) => {
                  setDeptCache(item)
                }}
              />
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
