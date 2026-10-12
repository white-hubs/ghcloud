import { useApplicationInfo } from "@ghcloud/cube-utils";

export function useAppDeviceTag() {
  const { getCurrentApplicationStore } = useApplicationInfo();
  const tagCode = `builtin.app::${getCurrentApplicationStore().code}`;

  return { tagCode };
}
