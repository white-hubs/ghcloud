import type { AllTenantPropertVO } from '@ghcloud/cube-operating-room-service'
import { useCubeModal } from '@ghcloud/cube-app-design'
import type { FormExpose } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { AllTenantProductPropertSelect } from '../../all-tenant-product-propert-select/all-tenant-product-propert-select'
import { cubeOperatingRoomService } from '@/api/service'

interface Props {
  title: string;
}

export const AddPropertModal = defineComponent({
  props: ['title'],
  emits: ['enter', 'cancel'],

  setup (props: Props, { emit, expose }) {
    const selectValues = ref<string[]>([])
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      propertCodes: string[];
      propertList: AllTenantPropertVO[];
    }>({
      propertCodes: [],
      propertList: [],
    })
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      onConfirm: async () => {
        emit('enter', formState)
        modalApi.close()
      },
      onCancel: () => {
        formRenderRef.value?.resetFields()
        modalApi.close()
        emit('cancel')
      }
    })
    const openModal = (selectCodes: string[]): void => {
      selectValues.value = selectCodes
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
            <AllTenantProductPropertSelect optionData={propertOptionData.value} mode='multiple' v-model:value={formState.propertCodes} disabledValue={selectValues.value} onChange={handlePropertChange} />
          </div>
        )
      }
    }
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />
  }

})