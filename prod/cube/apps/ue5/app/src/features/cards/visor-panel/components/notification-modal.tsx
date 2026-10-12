import { defineComponent } from "vue";

import Modal from "@/features/equipment/modal-table/modal";

import "./notification-modal.module.less";

export const NotificationModal = defineComponent({
  name: "NotificationModal",
  props: {
    noticeData: { type: Object, required: true, default: () => ({}) },
    showModal: { type: Boolean, required: true, default: false },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const closeModal = (): void => {
      emit("close");
    };

    return (): JSX.Element => (
      <Modal
        modalStyle={{ width: "700px" }}
        title={String((props.noticeData as { title?: string })?.title ?? "详情")}
        show={props.showModal}
        onClose={closeModal}
      >
        <div class="scroll-text" v-html={(props.noticeData as { content?: string })?.content ?? ""} />
      </Modal>
    );
  },
});

export default NotificationModal;
