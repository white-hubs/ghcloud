import { defineComponent } from "vue";

import { DisinfectionList } from "./disinfection-list/disinfection-list";
import { BaseModal } from "@/features/widgets/modal/base-modal/base-modal";

interface Props {
  title: string;
  visible: boolean;
  data: Record<string, unknown>;
}
export const Disinfection = defineComponent({
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
        <DisinfectionList info={props.data} />
      </BaseModal>
    );
  },
});
