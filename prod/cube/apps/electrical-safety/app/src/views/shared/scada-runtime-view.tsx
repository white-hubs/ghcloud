import type { PageModel } from "@cube-scada/core";
import { CubeScadaPage, type ScadaPageHandle } from "@cube-scada/studio-sdk";
import { defineComponent, onBeforeUnmount, shallowRef, watch, type PropType } from "vue";

import { applyScadaRuntimeElementData, type ScadaRuntimeElementDataBinding } from "@/utils/electrical-center-scada-binding";
import { getCubeScada } from "@/utils/scada-runtime";

export const ScadaRuntimeView = defineComponent({
  name: "ScadaRuntimeView",
  props: {
    pageId: {
      type: String,
      required: true,
    },
    elementBindings: {
      type: Array as PropType<ScadaRuntimeElementDataBinding[]>,
      default: () => [],
    },
  },
  setup: (props) => {
    const handle = shallowRef<ScadaPageHandle | null>(null);
    const sourcePage = shallowRef<PageModel | null>(null);
    let stopLoadWatcher: () => void = () => {};

    const applyElementBindings = (): void => {
      const pageHandle = handle.value;
      const page = sourcePage.value;
      if (!pageHandle?.directPage || !page) {
        return;
      }
      const applied = applyScadaRuntimeElementData(page, props.elementBindings);
      pageHandle.directBindingEngine?.clearStore();
      pageHandle.directPage.value = applied.page;
      for (const [tag, value] of Object.entries(applied.tagValues)) {
        pageHandle.setTagValue(tag, value);
      }
    };

    const dispose = (): void => {
      stopLoadWatcher();
      stopLoadWatcher = () => {};
      handle.value?.dispose();
      handle.value = null;
      sourcePage.value = null;
    };

    const load = (pageId: string): void => {
      dispose();
      if (!pageId) {
        return;
      }
      const nextHandle: ScadaPageHandle = getCubeScada().load({ page: pageId });
      handle.value = nextHandle;
      stopLoadWatcher = watch(
        [() => nextHandle.loading.value, () => nextHandle.directPage?.value],
        ([loading, page]) => {
          if (loading || !page) {
            return;
          }
          stopLoadWatcher();
          stopLoadWatcher = () => {};
          sourcePage.value = page;
          applyElementBindings();
        },
        { immediate: true },
      );
    };

    watch(
      () => props.pageId,
      (pageId) => {
        load(pageId);
      },
      { immediate: true },
    );
    watch(() => props.elementBindings, applyElementBindings, { deep: true });

    onBeforeUnmount(dispose);

    return (): JSX.Element | null =>
      handle.value ? (
        <div class="scada-runtime-view">
          <CubeScadaPage instance={handle.value} />
        </div>
      ) : null;
  },
});
