import { defineComponent } from "vue";

import { TaskList } from "./task-list/task-list";
import { BaseModal } from "@/features/widgets/modal/base-modal/base-modal";

interface Props {
  title: string;
  visible: boolean;
  data: Record<string, unknown>;
}
export const Task = defineComponent({
  props: ["visible", "data", "title"],
  emits: ["close"],
  setup: (props: Props, { emit }) => {
    return (): JSX.Element => (
      <BaseModal
        v-model:visible={props.visible}
        title={props.title}
        size="large"
        onClose={() => {
          emit("close");
        }}
      >
        <TaskList info={props.data} />
      </BaseModal>
    );
  },
});
