import { Form, FormItem, Input, type FormExpose } from '@ghcloud/cube-ui'
import { defineComponent, reactive, ref } from 'vue'
import { KnowledgeDocumentSelect } from '../knowledge-document-select'
import { DeptCascaderSelect, ProductSelect } from '@ghcloud/cube-app-design'

export const DocumentUploadItem = defineComponent({
  props: {
    formData: {
      type: Object,
      required: true
    }
  },
  setup (props, { expose }) {
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      name: string;
      typeId: string;
      deptId: string | null;
      productId: string | null;
      fileIds: string[];
    }>({
      name: props.formData.name,
      typeId: props.formData.typeId || '',
      deptId: props.formData.deptId,
      productId: props.formData.productId,
      fileIds: props.formData.fileIds,
    })
    const modalRules = {
      name: [
        { required: true, message: '请输入文档名称', trigger: 'blur' },
      ],
      typeId: [
        { required: true, message: '请选择文档类型', trigger: 'blur' },
      ],
    }

    const validate = async (): Promise<boolean>=> {
      try {
        await formRenderRef.value?.validate()
        return true
      } catch {
        return false
      }
    }

    const getFormData = (): {
      name: string;
      typeId: string;
      deptId: string | null;
      productId: string | null;
      fileIds: string[];
    } => {
      return {
        ...formState
      }
    }

    expose({
      validate,
      getFormData
    })

    return (): JSX.Element => (
      <Form layout="inline" model={formState} ref={formRenderRef} rules={modalRules} style='margin-bottom: 10px'>
        <FormItem label='文档名称' name='name'>
          <Input v-model:value={formState.name} placeholder='请输入文档名称' style='min-width: 200px' />
        </FormItem>
        <FormItem label='文档类型' name='typeId'>
          <KnowledgeDocumentSelect v-model:value={formState.typeId} style='min-width: 200px' />
        </FormItem>
        <FormItem label='关联产品' name='productId'>
          <ProductSelect v-model:value={formState.productId} style='min-width: 200px' />
        </FormItem>
        <FormItem label='所属部门' name='deptId'>
          <DeptCascaderSelect v-model:value={formState.deptId} style='min-width: 200px' />
        </FormItem>
      </Form>
    )
  }
})