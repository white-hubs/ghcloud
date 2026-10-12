import { Button, Input } from '@ghcloud/cube-ui'
import { computed, defineComponent, ref } from 'vue'
import { DeviceSpatialCoordinateBindingModal } from './device-spatial-coordinate-binding-modal'

interface Props {
  value?: string;
  selectedDevices: {
    id: string;
    deviceCode: string;
    deviceName: string;
  }[];
}

export const DeviceSpatialCoordinateBindingInput = defineComponent({
  props: ['value', 'selectedDevices'],
  emits: ['updateValue'],
  setup (props: Props, { emit }) {
    const buttonDisabled = ref(true)
    const showModal = ref(false)
    const value = computed(()=>{
      try {
        if (props.value){
          const arr = props.value.split(',')
          return `{ x: ${arr[0]}, y: ${arr[1]}, z: ${arr[2]} }`
        }
      } catch {

      }
      return undefined
    })
    return (): JSX.Element=>
      <>
        <div style='display: flex '>
          <Input
            placeholder='获取空间坐标'
            disabled
            showCount={false}
            value={value.value}
          />
          <Button type='primary' disabled={buttonDisabled.value} onClick={()=>{
            showModal.value = true
          }}>获取</Button>
        </div>
        <DeviceSpatialCoordinateBindingModal
          v-model:visible={showModal.value}
          selectedDevices={props.selectedDevices}
          type='QUERY_DATA'
          onShowBindButton={() => {
            buttonDisabled.value = false
          }}
          onGetSpatialCoordinateValue={(val)=>{
            emit('updateValue', val)
          }}
        />
      </>
  }
})