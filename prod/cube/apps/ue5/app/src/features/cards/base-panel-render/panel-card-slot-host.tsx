import { defineComponent, onBeforeUnmount, onMounted, provide, ref, watch } from "vue";

import { CARD_SLOT_DENSITY_CHANGE_EVENT, type CardSlotDensity, resolveCardSlotDensity } from "./card-slot-density";
import { panelCardDensityKey } from "./panel-card-density-context";

import styles from "./base-panel-render.module.less";

/** 单卡槽位：ResizeObserver 测高 → data-card-density，供 CSS / 表格行数共用 */
export const PanelCardSlotHost = defineComponent({
  name: "PanelCardSlotHost",
  props: {
    code: { type: String, required: true },
    fillMode: { type: String, required: true },
    initialDensity: { type: String, required: true },
  },
  setup(props, { slots }) {
    const rootRef = ref<HTMLElement | null>(null);
    const density = ref<CardSlotDensity>(props.initialDensity as CardSlotDensity);

    provide(panelCardDensityKey, density);

    let resizeObserver: ResizeObserver | null = null;
    let contentObserver: MutationObserver | null = null;
    let measureFrame = 0;

    const syncDataset = (next: CardSlotDensity): void => {
      const el = rootRef.value;
      if (!el) {
        return;
      }
      el.dataset.cardDensity = next;
    };

    const applyDensity = (next: CardSlotDensity): void => {
      if (next === density.value) {
        return;
      }
      density.value = next;
      syncDataset(next);
      window.dispatchEvent(
        new CustomEvent(CARD_SLOT_DENSITY_CHANGE_EVENT, {
          detail: { code: props.code, density: next },
        }),
      );
    };

    const measure = (): void => {
      window.cancelAnimationFrame(measureFrame);
      measureFrame = window.requestAnimationFrame(() => {
        const el = rootRef.value;
        if (!el) {
          return;
        }
        const content = el.querySelector(".sub-panel-content") as HTMLElement | null;
        const height = content?.clientHeight ?? el.clientHeight;
        applyDensity(resolveCardSlotDensity(height));
      });
    };

    watch(
      () => props.initialDensity,
      (next) => {
        const parsed = next as CardSlotDensity;
        density.value = parsed;
        syncDataset(parsed);
      },
    );

    onMounted(() => {
      syncDataset(density.value);
      const el = rootRef.value;
      if (!el) {
        return;
      }
      const observeContent = (): void => {
        const content = el.querySelector(".sub-panel-content");
        if (!content) return;
        resizeObserver?.observe(content);
        contentObserver?.disconnect();
        contentObserver = null;
        measure();
      };
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(el);
      }
      if (typeof MutationObserver !== "undefined") {
        contentObserver = new MutationObserver(observeContent);
        contentObserver.observe(el, { childList: true, subtree: true });
      }
      observeContent();
      measure();
    });

    onBeforeUnmount(() => {
      resizeObserver?.disconnect();
      contentObserver?.disconnect();
      window.cancelAnimationFrame(measureFrame);
    });

    return (): JSX.Element => (
      <div
        ref={rootRef}
        class={[styles["panel-card-slot"], "panel-card-slot"]}
        data-card-code={props.code}
        data-card-fill-mode={props.fillMode}
        data-card-density={density.value}
      >
        {slots.default?.()}
      </div>
    );
  },
});

export default PanelCardSlotHost;
