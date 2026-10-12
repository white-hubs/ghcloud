import { defineComponent } from "vue";

import { ProjectList } from "./project-list/project-list";
import { BaseModal } from "@/features/widgets/modal/base-modal/base-modal";

interface Props {
  title: string;
  visible: boolean;
  data: Record<string, unknown>;
}
export const Project = defineComponent({
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
        <ProjectList info={props.data} />
      </BaseModal>
    );
  },
});
