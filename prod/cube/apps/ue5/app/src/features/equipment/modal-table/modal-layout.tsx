import { defineComponent, type PropType } from "vue";

import { usePanelZoomSuspendWhile } from "@/features/panel-shell/charts/panel-zoom-session";

import "./modal-layout.module.less";

export const ModalLayout = defineComponent({
  name: "ModalLayout",
  props: {
    wrapClassName: { type: String, required: false, default: "custom-modal-wrapper" },
    modelValue: { type: Boolean, required: true, default: false },
    title: { type: String, required: false, default: "" },
    submitLoading: { type: Boolean, required: false, default: false },
    width: { type: [String, Number] as PropType<string | number>, required: false, default: 1300 },
    footer: { type: null as unknown as PropType<string | null>, required: false, default: null },
    centered: { type: Boolean, required: false, default: true },
    zIndex: { type: Number, required: false, default: 3100 },
  },
  emits: ["update:modelValue", "ok", "close"],
  setup(props, { emit, slots }) {
    usePanelZoomSuspendWhile(() => props.modelValue);

    const close = (): void => {
      emit("update:modelValue", false);
      emit("close");
    };

    const handleOk = async (): Promise<void> => {
      emit("ok");
    };

    return (): JSX.Element => (
      <a-modal
        visible={props.modelValue}
        width={props.width}
        title={props.title}
        confirm-loading={props.submitLoading}
        destroy-on-close={true}
        wrapClassName={props.wrapClassName}
        footer={props.footer}
        centered={props.centered}
        zIndex={props.zIndex}
        class="modal-layout-shell"
        onCancel={close}
        onOk={handleOk}
      >
        <div class="modal-header">
          <div class="header-btn">{slots["modal-header"]?.()}</div>
        </div>
        <div class="modal-content">
          <div class="modal-search">{slots["modal-search"]?.()}</div>
          <div class="modal-table">{slots["modal-table"]?.()}</div>
          <div class="modal-detail">{slots["modal-detail"]?.()}</div>
          <div class="modal-form">{slots["modal-form"]?.()}</div>
          {slots["modal-content"]?.()}
        </div>
        <div class="modal-footer">{slots["modal-footer"]?.()}</div>
        {slots.default?.()}
      </a-modal>
    );
  },
});

export default ModalLayout;
