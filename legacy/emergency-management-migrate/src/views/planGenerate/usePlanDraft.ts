import { shallowRef } from "vue";

type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

/** 手动保存当前进度；请求期间的新修改保留为未保存，旧响应不影响其他草稿。 */
export function usePlanDraft<T extends object>(options: {
  enabled: () => boolean;
  capture: () => T;
  persist: (payload: T & { id?: string }) => Promise<unknown>;
  onCreated: (id: string) => Promise<void>;
}) {
  const id = shallowRef("");
  const dirty = shallowRef(false);
  const saving = shallowRef(false);
  const status = shallowRef<SaveStatus>("idle");
  const error = shallowRef("");
  let baseline = "";
  let generation = 0;
  let pending: Promise<boolean> | undefined;
  let needsRouteSync = false;

  const reset = (draftId = "") => {
    generation += 1;
    pending = undefined;
    saving.value = false;
    id.value = draftId;
    needsRouteSync = false;
    baseline = JSON.stringify(options.capture());
    dirty.value = false;
    status.value = draftId ? "saved" : "idle";
    error.value = "";
  };

  const invalidate = () => {
    generation += 1;
    pending = undefined;
    saving.value = false;
  };

  const hasChanges = () => JSON.stringify(options.capture()) !== baseline;

  const changed = () => {
    if (!options.enabled()) {
      return;
    }
    dirty.value = hasChanges();
    if (saving.value) {
      return;
    }
    status.value = dirty.value ? "unsaved" : id.value ? "saved" : "idle";
  };

  const save = (): Promise<boolean> => {
    if (pending) {
      return pending;
    }
    if (!options.enabled()) {
      return Promise.resolve(false);
    }
    const session = generation;
    const run = async () => {
      if (session !== generation || !options.enabled()) {
        return false;
      }
      saving.value = true;
      status.value = "saving";
      error.value = "";
      try {
        const serialized = JSON.stringify(options.capture());
        const payload = JSON.parse(serialized) as T;
        const savedId = await options.persist({ ...payload, ...(id.value ? { id: id.value } : {}) });
        if (session !== generation) {
          return false;
        }
        if (
          (typeof savedId !== "string" && typeof savedId !== "number") ||
          (typeof savedId === "number" && !Number.isSafeInteger(savedId)) ||
          !/^[1-9]\d*$/.test(String(savedId))
        ) {
          throw new Error("未收到有效的草稿编号，请重试");
        }
        needsRouteSync ||= !id.value;
        id.value = String(savedId);
        baseline = serialized;
        dirty.value = hasChanges();
        if (needsRouteSync && options.enabled()) {
          await options.onCreated(id.value);
          if (session !== generation) {
            return false;
          }
          needsRouteSync = false;
        }
        dirty.value = hasChanges();
        status.value = dirty.value ? "unsaved" : "saved";
        return true;
      } catch (cause) {
        if (session === generation) {
          dirty.value = true;
          status.value = "error";
          error.value = cause instanceof Error ? cause.message : "保存草稿失败，请重试";
        }
        return false;
      } finally {
        if (session === generation) {
          saving.value = false;
          pending = undefined;
        }
      }
    };
    pending = Promise.resolve().then(run);
    return pending;
  };

  const wait = () => pending ?? Promise.resolve(true);

  return { id, dirty, saving, status, error, reset, invalidate, changed, hasChanges, save, wait };
}
