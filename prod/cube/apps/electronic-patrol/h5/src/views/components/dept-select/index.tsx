import { defineComponent, onMounted, reactive } from 'vue'
import { Popup, Picker } from 'vant'
import { cubeOuaaService } from '../../../api/server'
export const DeptSelect = defineComponent({
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:show', 'confirm'],
  setup: (props, { emit }) => {
    const state = reactive({
      columns: [
        { text: '杭州', value: 'Hangzhou' },
      ]
    })
    const getData = async (): Promise<void> => {
      const result = await cubeOuaaService.getDeptList()
      state.columns = result.map(item => {
        return {
          value: item.id,
          text: item.name
        }
      })
    }
    onMounted(() => {
      getData()
    })
    const handleCancel = (): void => {
      emit('update:show', false)
    }
    const handleConfirm = ({ selectedOptions }: { selectedOptions: { text: string;value: string; }[]; }): void => {
      emit('confirm', selectedOptions)
      emit('update:show', false)
    }
    return (): JSX.Element => (
      <>
        <Popup v-model:show={props.show} round position='bottom'>
          <Picker columns={state.columns} onCancel={handleCancel} onConfirm={handleConfirm} />
        </Popup>
      </>
    )
  }
})
