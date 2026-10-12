
import { cubeDeviceCenterService } from '@/api/service'
import { ProductCategoryTreeSelect } from '@/components/business/product-category-tree-select/product-category-tree-select'
import { debounce } from '@/utils/tool'
import { Form, FormItem, Input, Modal, message } from '@ghcloud/cube-ui'
import { defineComponent, ref, reactive } from 'vue'

interface Props {
  id: string;
  labelWidth: string;
}
export const EditCategoryModel = defineComponent({
  props: {
    id: {
      type: String,
      default: ''
    },
    labelWidth: {
      type: String,
      default: '100px'
    },
  },
  emits: ['enter'],
  setup (props: Props, { emit, expose }) {
    const submitLoading = ref(false)
    const modalVisible = ref<boolean>(false)
    const formRenderRef = ref()
    const modalRules = {
      // prodCategoryId: [{ required: true, message: '请选择上级品类', trigger: 'blur' }],
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
          const params = {
            itemLabel: formState.itemLabel,
          }
          await cubeDeviceCenterService.updateProductCategory(props.id, params)
          message.success('操作成功')
          modalVisible.value = false
        } catch {
        }
        emit('enter')
        modalVisible.value = false
      }).catch(() => {
      })
    }, 500)
    const cancel = (): void => {
      modalVisible.value = false
      formRenderRef.value.clearValidate()
      formRenderRef.value.resetFields()
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
          title='编辑产品品类'
          onOk={handleOk}
          onCancel={cancel}
          confirmLoading={submitLoading.value}
          width='500px'
        >
          <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: props.labelWidth } }}>
            <FormItem label='上级品类' name='prodCategoryId'>
              <ProductCategoryTreeSelect v-model:value={formState.prodCategoryId} style={{ width: '100%' }} />
            </FormItem>
            <FormItem label='当前层级' name='itemIndex'>
              <span>{formState.itemIndex || '--'}</span>
            </FormItem>
            <FormItem label='品类名称' name='itemLabel'>
              <Input placeholder='请输入品类名称' v-model:value={formState.itemLabel} />
            </FormItem>
          </Form>
        </Modal>
      </>
  }
})
