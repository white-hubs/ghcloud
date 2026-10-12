import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import { Vue3SeamlessScroll as RawSeamlessScroll } from "vue3-seamless-scroll";

import { VIEWPORT_METRICS_CHANGE_EVENT } from "@/application/bootstrap/viewport-coordinator";
import { resolveLayoutPx } from "@/features/cards/base-panel-render/list-scroll-layout";

/**
 * Drop-in for vue3-seamless-scroll.
 * `singleHeight` / `singleWidth` stay in design px; this wrapper converts them to rem-scaled layout px
 * so wait/hover stops on a whole row instead of clipping the first visible item.
 */
export const Vue3SeamlessScroll = defineComponent({
  name: "Vue3SeamlessScroll",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const generation = ref(0);

    onMounted(() => {
      const bump = (): void => {
        generation.value += 1;
      };
      window.addEventListener(VIEWPORT_METRICS_CHANGE_EVENT, bump);
      onBeforeUnmount(() => window.removeEventListener(VIEWPORT_METRICS_CHANGE_EVENT, bump));
    });

    const layoutSingleHeight = computed(() => {
      generation.value;
      const design = Number(attrs.singleHeight) || 0;
      return design > 0 ? resolveLayoutPx(design) : 0;
    });

    const layoutSingleWidth = computed(() => {
      generation.value;
      const design = Number(attrs.singleWidth) || 0;
      return design > 0 ? resolveLayoutPx(design) : 0;
    });

    const singleWaitTime = computed(() => {
      const wait = Number(attrs.singleWaitTime ?? attrs.waitTime);
      return Number.isFinite(wait) && wait > 0 ? wait : 1000;
    });

    return () => (
      <RawSeamlessScroll
        {...attrs}
        singleHeight={layoutSingleHeight.value}
        singleWidth={layoutSingleWidth.value}
        singleWaitTime={singleWaitTime.value}
      >
        {slots.default?.()}
      </RawSeamlessScroll>
    );
  },
});

export default Vue3SeamlessScroll;
