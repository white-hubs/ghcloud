import { defineComponent } from 'vue'
import { BaseModal } from '@/pages/widget/modal/base-modal/base-modal'
import { KeyPlaceList } from './key-place-list/key-place-list'

interface Props {
  title: string;
  visible: boolean;
  data: Record<string, unknown>;
}
export const KeyPlace = defineComponent({
  props: ['visible', 'data', 'title'],
  emits: ['close', 'locate'],
  setup: (props: Props, { emit }) => {

    return (): JSX.Element => (
      <BaseModal
        v-model:visible={props.visible}
        title={props.title}
        size="large"
        onClose={() => {
          emit('close')
        }}
      >
        <KeyPlaceList info={props.data} onLocate={(data)=>{
          emit('locate', data)
        }} />
      </BaseModal>
    )
  }
})