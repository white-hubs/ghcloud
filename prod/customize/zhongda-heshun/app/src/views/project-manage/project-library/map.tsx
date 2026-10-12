import { Button, Input } from '@ghcloud/cube-ui'
import { defineComponent, ref, nextTick, watch } from 'vue'
import { useMapModal } from '@ghcloud/generic-component'
interface Props {
  address: string;
  isDetail: boolean;
  value: string;
  showLat: boolean;
  readonly: boolean;
}
export const DMap = defineComponent({
  props: {
    address: {
      type: String,
      default: ''
    },
    isDetail: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: ''
    },
    showLat: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:value', 'addressName'],
  setup (props: Props, { emit, expose }) {
    const lntAndLat = ref(props.value)
    const address = ref(props.address)
    const { showMapModal } = useMapModal()
    watch(() => props.address, (newValue) => {
      address.value = newValue
    })
    watch(() => props.value, (newValue) => {
      lntAndLat.value = newValue
    })
    const handleOk = (e: {
      addressValue: string;
      center: string[];
      lntAndLat: string;
    }): void => {
      emit('update:value', e.lntAndLat)
      emit('addressName', e.addressValue)
      lntAndLat.value = e.lntAndLat
      address.value = e.addressValue
    }

    const openModal = async (longLat: string): Promise<void> => {
      const option = ['104.05906925176734', '30.589318900275615']
      await nextTick()
      const centerValue = props.value && /^[\d.]*,?[\d.]*$/.test(props.value) ? props.value.split(',') : option
      const centerTemp = longLat && typeof longLat === 'string' ? longLat.split(',') : centerValue
      const center: [number, number] = [Number(centerTemp[0]), Number(centerTemp[1])]

      showMapModal({
        title: '选择设备位置',
        address: props.address,
        center: {
          lng: center[0],
          lat: center[1]
        },
        modalConfirm: (confirmData) => {
          const center = [confirmData.lng.toString(), confirmData.lat.toString()]
          handleOk({
            addressValue: confirmData.address,
            center,
            lntAndLat: center.join(',')
          })
        }
      })
    }
    expose({
      openModal
    })
    return (): JSX.Element=> {
      if (props.isDetail) {
        return <span>{lntAndLat.value || '--'}</span>
      }
      return (
        <>
          {!props.readonly ? <div style='display: flex '>
            { props.showLat ?
              <Input
                v-model:value={lntAndLat.value }
                placeholder='获取经纬度'
                disabled
                showCount={false}
                maxlength={100}
              /> :
              <Input
                v-model:value={ address.value}
                placeholder='获取经纬度'
                disabled
                showCount={false}
                maxlength={100}
              />}
            <Button type='primary' onClick={openModal}>选择位置</Button>
          </div> : lntAndLat.value }
        </>
      )
    }
  }
})
