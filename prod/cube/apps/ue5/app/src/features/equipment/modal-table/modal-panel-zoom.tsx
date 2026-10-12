import { computed, defineComponent, provide, Teleport, Transition } from "vue";

import { PANEL_ZOOM_CHART_KEY } from "@/features/panel-shell/charts/panel-zoom-context";

import "./modal-panel-zoom.module.less";

export const ModalPanelZoom = defineComponent({
  name: "ModalPanelZoom",
  props: {
    visible: { type: Boolean, required: true, default: false },
    title: { type: String, required: false, default: "" },
    width: { type: [String, Number], required: false, default: 600 },
    fromDrag: { type: Boolean, required: false, default: false },
  },
  emits: ["update:visible", "close"],
  setup(props, { emit, slots }) {
    provide(PANEL_ZOOM_CHART_KEY, true);

    const transitionName = computed(() => (props.fromDrag ? "zoom-modal-drag" : "zoom-modal"));

    const containerStyle = computed(() => {
      const widthValue = typeof props.width === "number" ? `${props.width}px` : props.width;
      return {
        width: widthValue,
        maxWidth: "90vw",
      };
    });

    const close = (): void => {
      emit("update:visible", false);
      emit("close");
    };

    const handleOverlayClick = (): void => {
      close();
    };

    return (): JSX.Element => (
      <Teleport to="body">
        <Transition name={transitionName.value}>
          {props.visible ? (
            <div class={["modal-panel-zoom-overlay", props.fromDrag ? "is-from-drag" : ""]} onClick={handleOverlayClick}>
              <div class="modal-panel-zoom-container" style={containerStyle.value} onClick={(e) => e.stopPropagation()}>
                <div class="modal-panel-zoom-header">
                  <span class="modal-title">{props.title}</span>
                  <button class="modal-close" onClick={close}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div class="modal-panel-zoom-content">{slots.default?.()}</div>
              </div>
            </div>
          ) : null}
        </Transition>
      </Teleport>
    );
  },
});

export default ModalPanelZoom;
