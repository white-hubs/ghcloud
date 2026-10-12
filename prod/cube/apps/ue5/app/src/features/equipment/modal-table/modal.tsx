import { defineComponent, ref, watch, type PropType } from "vue";

import { usePanelZoomSuspendWhile } from "@/features/panel-shell/charts/panel-zoom-session";

import "./modal.module.less";

export const Modal = defineComponent({
  name: "Modal",
  props: {
    title: { type: String, required: false, default: "报警记录" },
    show: { type: Boolean, required: false, default: false },
    keyboard: { type: Boolean, required: false, default: true },
    width: { type: String, required: false, default: "1250px" },
    modalStyle: { type: Object as PropType<Record<string, string>>, required: false },
    wrapClassName: { type: String, required: false, default: "" },
    mask: { type: Boolean, required: false, default: false },
    zIndex: { type: Number, required: false, default: 3100 },
    centered: { type: Boolean, required: false, default: true },
    destroyOnClose: { type: Boolean, required: false, default: false },
  },
  emits: ["handelOk", "close"],
  setup(props, { emit, slots }) {
    const visible = ref(props.show);
    let closing = false;

    usePanelZoomSuspendWhile(() => props.show);

    const emitCloseOnce = (): void => {
      if (closing) {
        return;
      }
      closing = true;
      visible.value = false;
      emit("close");
    };

    const modalOk = (): void => {
      emit("handelOk");
    };

    const modalCancel = (): void => {
      emitCloseOnce();
    };

    watch(
      () => props.show,
      (newValue) => {
        visible.value = newValue;
        if (newValue) {
          closing = false;
        }
      },
    );

    return (): JSX.Element => (
      <div class="modal-container modalsn">
        <a-modal
          keyboard={props.keyboard}
          maskClosable={false}
          style={props.modalStyle}
          title={props.title}
          open={visible.value}
          visible={visible.value}
          destroyOnClose={props.destroyOnClose}
          transitionName=""
          maskTransitionName=""
          onUpdate:open={(v: boolean) => {
            if (!v) {
              emitCloseOnce();
              return;
            }
            visible.value = v;
            closing = false;
          }}
          onUpdate:visible={(v: boolean) => {
            if (!v) {
              emitCloseOnce();
              return;
            }
            visible.value = v;
            closing = false;
          }}
          width={props.width}
          mask={props.mask}
          zIndex={props.zIndex}
          centered={props.centered}
          getContainer={() => document.body}
          onOk={modalOk}
          onCancel={modalCancel}
          class="modal-width"
          footer={null}
          wrapClassName={props.wrapClassName}
        >
          {slots.default?.()}
        </a-modal>
      </div>
    );
  },
});

export default Modal;
