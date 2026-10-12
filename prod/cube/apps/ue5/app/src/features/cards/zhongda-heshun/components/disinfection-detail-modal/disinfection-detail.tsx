import { defineComponent } from "vue";

import { DisinfectionContent } from "./components/disinfection-content/disinfection-content";
import { BaseModal } from "@/features/widgets/modal/base-modal/base-modal";

interface Props {
  title: string;
  visible: boolean;
  disinfectionData: Record<string, unknown>;
}

export const DisinfectionDetail = defineComponent({
  props: ["visible", "disinfectionData", "title"],
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
        <DisinfectionContent disinfectionData={props.disinfectionData} />
      </BaseModal>
    );
  },
});
