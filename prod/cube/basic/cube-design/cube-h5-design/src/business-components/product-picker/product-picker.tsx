import { defineComponent, onMounted, ref } from 'vue'
import { Popup, Picker } from 'vant'
import { cubeDeviceCenterService } from '../../api/service'

export const ProductPicker = defineComponent({
  props: {
    show: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  emits: ['confirm', 'close'],
  setup: (props, { emit }) => {
    const options = ref<{ value: string; text: string; }[]>([])
    const select = ref<{ value: string; text: string; }>({
      value: props.value.value,
      text: props.value.text
    })

    const getData = async (): Promise<void> => {
      const response = await cubeDeviceCenterService.getProductListAll()
      options.value = response.map(e=>{
        return {
          value: e.id ?? '',
          text: e.prodName ?? '未知'
        }
      })
    }

    onMounted(() => {
      getData()
    })

    const handleCancel = (): void => {
      emit('close')
    }

    const handleConfirm = ({ selectedOptions }: { selectedOptions: { text: string; value: string; }[]; }): void => {
      select.value = selectedOptions[0]
      emit('confirm', select.value)
    }

    return (): JSX.Element => (
      <>
        <Popup onClose={handleCancel} v-model:show={props.show} round position="bottom">
          <Picker
            title="产品选择"
            columns={options.value}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            visibleOptionNum={8} />
        </Popup>
      </>
    )
  }
})