import { watch, type WatchSource } from "vue";

import { useCubeModal } from "@ghcloud/cube-app-design";

type CubeModalOptions = NonNullable<Parameters<typeof useCubeModal>[0]>;

export function useControlledCubeModal(visibleSource: WatchSource<boolean>, options: CubeModalOptions): ReturnType<typeof useCubeModal> {
  const [CubeModal, modalApi] = useCubeModal(options);

  watch(
    visibleSource,
    (visible) => {
      if (visible === Boolean(modalApi.state.isOpen)) {
        return;
      }
      if (visible) {
        modalApi.open();
      } else {
        modalApi.close();
      }
    },
    { immediate: true },
  );

  return [CubeModal, modalApi];
}
