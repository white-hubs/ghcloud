import { defineComponent } from 'vue'
import { BaseModal } from '@/pages/widget/modal/base-modal/base-modal'
import { TaskContent } from './components/task-content/task-content'

interface Props {
  title: string;
  visible: boolean;
  taskData: Record<string, unknown>;
}

export const TaskDetail = defineComponent({
  props: ['visible', 'taskData', 'title'],
  emits: ['close'],
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
        <TaskContent taskData={props.taskData} />
      </BaseModal>
    )
  }
})