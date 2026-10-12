import { defineComponent } from 'vue'
import { BaseModal } from '../base-modal/base-modal'
import { AlarmContent } from './components/alarm-content/alarm-content'

interface Props {
  title: string;
  visible: boolean;
  alarmData: Record<string, unknown>;
}

export const AlarmDetailComponent = defineComponent({
  props: ['visible', 'alarmData', 'title'],
  emits: ['close'],
  setup: (props: Props, { emit }) => {
    return (): JSX.Element=> (
      <BaseModal
        visible={props.visible}
        title={props.title}
        onClose={() => {
          emit('close')
        }}
      >
        <AlarmContent alarmData={props.alarmData} />
      </BaseModal>
    )
  }
})
