import { cubeDeviceCenterInternalService } from '@/api/service'
import { Button } from '@ghcloud/cube-ui'
import Select from '@ghcloud/cube-ui/src/components/select/select'
import { defineComponent, onMounted, ref, watch } from 'vue'
import { SubDeviceModalTable } from './sub-device-modal-table'

interface Props {
  mainDeviceId: string;
  value: { id: string; name: string; }[];
}

export const RelateSubDevice = defineComponent({
  props: ['mainDeviceId', 'value'],
  emits: ['enter', 'update:value'],
  setup (props: Props, { emit, expose }) {
    const deviceModalTableRef = ref<{ openModal: () => void; }>()
    const deviceList = ref<{ id: string; name: string; }[]>([])
    const subDeviceIds = ref<string[]>([])
    const handleDeviceModal = (): void => {
      subDeviceIds.value = deviceList.value?.map(e => e.id)?.filter(e => e !== props.mainDeviceId)
    }
    watch(() => props.value, () => {
      deviceList.value = props.value
      subDeviceIds.value = props.value?.map(e => e.id)?.filter(e => e !== props.mainDeviceId)
    }, { deep: true, immediate: true })

    watch(() => deviceList.value, () => {
      emit('update:value', deviceList.value)
    }, { deep: true })

    const getCheckboxProps = ref()
    const getMainDeviceApi = async (): Promise<void> => {
      const res = await cubeDeviceCenterInternalService.getDeviceList({ deviceIds: props.mainDeviceId ?? '' })
      if (res){
        getCheckboxProps.value = (record: { id: string; }): { disabled: boolean; } => {
          const result = {
            disabled: record.id === props.mainDeviceId
          }
          return result
        }
      }
    }
    onMounted(() => {
      getMainDeviceApi()
    })

    expose({
      subDeviceIds,
      deviceModalTableRef
    })
    return (): JSX.Element=>
      <>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Select
            style={{ width: '380px' }}
            open={false}
            showArrow={false}
            allowClear={false}
            mode='multiple'
            options={deviceList.value}
            v-model:value={subDeviceIds.value}
            placeholder='请选择子设备'
            maxTagCount={3}
            fieldNames={{ label: 'name', value: 'id' }}
            onChange={() => {
              const list = [...deviceList.value]
              deviceList.value = list.filter(i => subDeviceIds.value?.includes(i.id))
            }}
          />
          <Button type='primary' onClick={() => deviceModalTableRef.value?.openModal()}>选择子设备</Button>
        </div>
        <SubDeviceModalTable
          ref={deviceModalTableRef}
          v-model:value={deviceList.value}
          multiple
          onOk={handleDeviceModal}
          getCheckboxProps={getCheckboxProps.value}
        />
      </>
  }
})
