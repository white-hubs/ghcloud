import type { AllTenantPropertVO } from '@ghcloud/cube-operating-room-service'
import { useCubeModal } from '@ghcloud/cube-app-design'
import { Form, FormItem, Input, type FormExpose } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { AllTenantProductPropertSelect } from '../../all-tenant-product-propert-select/all-tenant-product-propert-select'
import { cubeOperatingRoomService } from '@/api/service'

interface Props {
  title: string;
}

export const StandardLeveModal = defineComponent({
  props: ['title'],
  emits: ['enter', 'cancel'],

  setup (props: Props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      name: string;
      propertCodes: string[];
      propertList: AllTenantPropertVO[];
    }>({
      name: '',
      propertCodes: [],
      propertList: [],
    })
    const modalRules = {
      name: [{ required: true, message: '请输入标准级别名称', trigger: 'blur' }],
      propertList: [{ required: true, message: '请选择检测项目', trigger: 'blur' }],
    }
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      onConfirm: async () => {
        await formRenderRef.value?.validate()
        emit('enter', formState)
        modalApi.close()
      },
      onCancel: () => {
        formRenderRef.value?.resetFields()
        modalApi.close()
        emit('cancel')
      }
    })
    const openModal = (): void => {
      formState.name = ''
      formState.propertCodes = []
      formState.propertList = []
      modalApi.open()
    }
    expose({
      openModal
    })

    const handlePropertChange = (values: AllTenantPropertVO[]): void => {
      formState.propertList = values
    }

    const propertOptionData = ref<AllTenantPropertVO[]>([])
    const getPropertOptionData = async (): Promise<void> => {
      const response = await cubeOperatingRoomService.getAllTenantProductList();
      propertOptionData.value = response
    }

    onMounted(() => {
      getPropertOptionData()
    })

    const modalSlots = {
      default: (): JSX.Element => {
        return (
          <div style={{ "max-height": '500px', 'overflow-y': 'auto' }}>
            <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: '80px' } }}>
              <FormItem label='标准级别' name='name'>
                <Input v-model:value={formState.name} maxlength={50} placeholder='请输入标准级别名称' />
              </FormItem>
              <FormItem label='选择项目' name='propertList'>
                <AllTenantProductPropertSelect optionData={propertOptionData.value} mode='multiple' v-model:value={formState.propertCodes} onChange={handlePropertChange} />
              </FormItem>
            </Form>
          </div>
        )
      }
    }
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />
  }

})