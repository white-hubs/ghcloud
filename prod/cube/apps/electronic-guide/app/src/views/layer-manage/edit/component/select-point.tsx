import { defineComponent, ref } from 'vue'
import { message, Modal } from '@ghcloud/cube-ui'
import { Map } from '@/components/map'
export const SelectPoint = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: () => false
    },
    value: {
      type: String,
      default: () => ''
    },
    center: {
      type: String,
      default: () => ''
    },
  },
  emits: ['update:visible', 'ok'],
  setup: (props, { emit }) => {
    const mapRef = ref<{ getPoint: () => string; getZoom: () => string; }>()
    const handleOk = (): void => {
      const point = mapRef.value?.getPoint()
      if (!point) {
        message.error('请选择点位')
        return
      }
      emit('ok', point)
      emit('update:visible', false)
    }
    return (): JSX.Element => (
      <Modal
        title='选择点位'
        destroyOnClose
        v-model:visible={props.visible}
        onCancel={() => {
          emit('update:visible', false)
        }}
        onOk={handleOk}
      >
        <Map ref={mapRef} value={props.value} center={props.center} id='select-map' />
      </Modal>
    )
  }
})
