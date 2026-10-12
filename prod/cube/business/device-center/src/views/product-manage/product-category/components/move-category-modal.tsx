
import { ProductCategoryTreeSelect } from '@/components/business/product-category-tree-select/product-category-tree-select'
import { debounce } from '@/utils/tool'
import { Form, FormItem, Modal, message } from '@ghcloud/cube-ui'
import { defineComponent, ref, reactive } from 'vue'

interface Props {
  ids: string[];
}
export const MoveCategoryModel = defineComponent({
  emits: ['enter'],
  setup (props: Props, { emit, expose }) {
    const submitLoading = ref(false)
    const modalVisible = ref<boolean>(false)
    const formRenderRef = ref()
    const modalRules = {
      prodCategoryId: [{ required: true, message: '请选择上级品类', trigger: 'blur' }],
      itemLabel: [{ required: true, message: '请输入品类名称', trigger: 'blur' }],
    }
    const formState = reactive< {
      itemLabel: string;
      prodCategoryId: string;
      itemIndex: string;
    }>({
      itemLabel: '',
      prodCategoryId: '',
      itemIndex: '',
    })
    const handleOk = debounce(() => {

      formRenderRef.value.validate().then(async () => {
        try {
          // const params = {
          //   deviceId: props.id,
          //   config: formState.config,
          //   rawDeviceId: formState.rawDeviceId
          //  }
          // await cubeDeviceCenterInternalService.updateDevice(params)
          // message.success('操作成功')
          modalVisible.value = false
        } catch {
          modalVisible.value = false
        }
        emit('enter')
        modalVisible.value = false
      }).catch(() => {
      })
    }, 500)
    const cancle = (): void => {
      modalVisible.value = false
      formRenderRef.value.clearValidate()
      formRenderRef.value.resetFields()
      emit('enter')
    }
    const openModal = (info: unknown): void => {
      if (formRenderRef.value) {
        formRenderRef.value.resetFields()
      }
      modalVisible.value = true
      Object.assign(formState, info)
    }
    expose({
      openModal
    })
    return (): JSX.Element =>
      <>
        <Modal
          visible={modalVisible.value}
          title='移动产品品类'
          onOk={handleOk}
          onCancel={cancle}
          confirmLoading={submitLoading.value}
          width='500px'
        >
          <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: '100px' } }}>
            <FormItem label='当前层级' name='itemIndex'>
              <span>{formState.itemIndex || '--'}</span>
            </FormItem>
            <FormItem label='新上级品类' name='prodCategoryId'>
              <ProductCategoryTreeSelect v-model:value={formState.prodCategoryId} style={{ width: '100%' }} />
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
