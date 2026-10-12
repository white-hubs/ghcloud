import { computed, defineComponent, inject, nextTick, onBeforeUnmount, ref, toRef, useAttrs, watch } from "vue";

import ModalPanelZoom from "@/features/equipment/modal-table/modal-panel-zoom";
import { registerPanelZoomSession } from "@/features/panel-shell/charts/panel-zoom-session";
import { panelCardTitleKey } from "@/shared-ui/panel/panel-card-title-context";
import BackgroundTitleBar from "@/shared-ui/panel/subPanelType/background-title-bar";
import Convention from "@/shared-ui/panel/subPanelType/convention";
import { usePanelZoomDrag } from "@/visualization-core/hooks/use-panel-zoom-drag";

import styles from "./sub-panel-template.module.less";

const ZoomTriggerIcon = (): JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M9 4H4v5M15 4h5v5M9 20H4v-5M20 15v5h-5"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export const SubPanelTemplate = defineComponent({
  name: "SubPanelTemplate",
  inheritAttrs: false,
  props: {
    title: { type: String, required: false, default: "标题" },
    titleFontSize: { type: String, required: false },
    zoomable: { type: Boolean, required: false, default: false },
    zoomTitle: { type: String, required: false },
    zoomWidth: { type: [String, Number], required: false, default: 1200 },
  },
  emits: ["zoom"],
  setup(props, { emit, slots }) {
    const attrs = useAttrs();
    const titleType = ref(window.config?.otherConfig?.cardType ?? "classicsCard");
    const zoomVisible = ref(false);
    const zoomSuspended = ref(false);
    const zoomDisplayVisible = computed(() => zoomVisible.value && !zoomSuspended.value);
    const openedFromDrag = ref(false);
    const wrapperRef = ref<HTMLElement | null>(null);
    const configuredCardTitle = inject(panelCardTitleKey, undefined);
    const resolvedTitle = computed(() => configuredCardTitle?.value || props.title);
    const resolvedZoomTitle = computed(() => {
      if (configuredCardTitle?.value) {
        return `${resolvedTitle.value}详情`;
      }
      return props.zoomTitle || `${resolvedTitle.value}详情`;
    });

    let unregisterZoomSession: (() => void) | undefined;

    watch(zoomVisible, (open) => {
      unregisterZoomSession?.();
      unregisterZoomSession = undefined;
      zoomSuspended.value = false;
      if (!open) return;
      unregisterZoomSession = registerPanelZoomSession({
        suspend: () => {
          zoomSuspended.value = true;
        },
        resume: () => {
          zoomSuspended.value = false;
        },
      });
    });

    onBeforeUnmount(() => {
      unregisterZoomSession?.();
      unregisterZoomSession = undefined;
    });

    const openZoom = (fromDrag = false): void => {
      if (!props.zoomable) return;
      openedFromDrag.value = fromDrag;
      zoomVisible.value = true;
      emit("zoom");
      nextTick(() => {
        window.setTimeout(() => {
          openedFromDrag.value = false;
        }, 450);
      });
    };

    const openZoomByClick = (): void => openZoom(false);

    const { isDragging, isLaunching, onPointerDown } = usePanelZoomDrag({
      enabled: toRef(props, "zoomable"),
      sourceRef: wrapperRef,
      onZoom: () => openZoom(true),
    });

    const renderZoomTrigger = (): JSX.Element | null => {
      if (!props.zoomable) return null;
      return (
        <button
          type="button"
          class={[styles["zoom-trigger-btn"], "zoom-trigger-btn"]}
          title="放大查看"
          aria-label="放大查看"
          onClick={(e) => {
            e.stopPropagation();
            openZoomByClick();
          }}
          onPointerdown={(e) => e.stopPropagation()}
        >
          <ZoomTriggerIcon />
        </button>
      );
    };

    return (): JSX.Element => (
      <div
        ref={wrapperRef}
        class={[
          styles["sub-panel-wrapper"],
          "sub-panel-wrapper",
          attrs.class as string | undefined,
          props.zoomable ? styles["is-zoomable"] : "",
          isDragging.value ? styles["is-dragging"] : "",
          isLaunching.value ? styles["is-launching"] : "",
        ]}
        onPointerdown={onPointerDown}
      >
        {titleType.value === "classicsCard" && (
          <Convention
            title={resolvedTitle.value}
            titleFontSize={props.titleFontSize}
            zoomable={props.zoomable}
            onTitleClick={openZoomByClick}
            v-slots={{
              extra: () => (
                <>
                  {slots.extra?.()}
                  {renderZoomTrigger()}
                </>
              ),
              ...(slots.titleIcon ? { titleIcon: () => slots.titleIcon!() } : {}),
              default: () => slots.default?.(),
            }}
          />
        )}
        {titleType.value === "policeCard" && (
          <BackgroundTitleBar
            title={resolvedTitle.value}
            zoomable={props.zoomable}
            onTitleClick={openZoomByClick}
            v-slots={{
              extra: () => (
                <>
                  {slots.extra?.()}
                  {renderZoomTrigger()}
                </>
              ),
              default: () => slots.default?.(),
            }}
          />
        )}
        {props.zoomable && (
          <ModalPanelZoom
            visible={zoomDisplayVisible.value}
            onUpdate:visible={(v: boolean) => {
              if (!v) {
                zoomVisible.value = false;
                zoomSuspended.value = false;
              }
            }}
            title={resolvedZoomTitle.value}
            width={props.zoomWidth}
            fromDrag={openedFromDrag.value}
            v-slots={{
              default: () => slots["zoom-content"]?.() ?? slots.default?.(),
            }}
          />
        )}
      </div>
    );
  },
});

export default SubPanelTemplate;
