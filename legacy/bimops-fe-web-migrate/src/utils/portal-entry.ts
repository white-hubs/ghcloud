import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";
import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

const WORKBENCH_ENTRY_DICT = {
  itemCode: "PORTAL_FEATURE_CONFIG",
  code: "WORKBENCH_ENTRY_ENABLED",
};

let workbenchEntryEnabledPromise: Promise<boolean> | undefined;

/**
 * 工作台入口默认开启，避免字典未初始化或读取失败时改变既有门户行为。
 */
export function isWorkbenchEntryEnabled(): Promise<boolean> {
  if (!workbenchEntryEnabledPromise) {
    const auth = CubeMfRootGlobalState.getInstance().mfRootState.authInfo;
    workbenchEntryEnabledPromise = new CubeDictionaryService(auth)
      .getDictionaryByItem(WORKBENCH_ENTRY_DICT)
      .then((items) => items.find((item) => item.code === WORKBENCH_ENTRY_DICT.code)?.variable !== "false")
      .catch(() => true);
  }
  return workbenchEntryEnabledPromise;
}
