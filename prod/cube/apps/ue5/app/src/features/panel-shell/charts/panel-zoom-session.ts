import { nextTick, onBeforeUnmount, watch, type WatchSource } from "vue";

export type PanelZoomSession = {
  suspend: () => void;
  resume: () => void;
};

let activeSession: PanelZoomSession | null = null;
let suspendDepth = 0;

/**
 * 放大弹窗打开时注册会话；关闭或卸载时注销。
 * 下钻弹窗通过 suspend/resume 临时隐藏放大层，关闭后再恢复。
 */
export const registerPanelZoomSession = (session: PanelZoomSession): (() => void) => {
  activeSession = session;
  suspendDepth = 0;
  return () => {
    if (activeSession !== session) return;
    activeSession = null;
    suspendDepth = 0;
  };
};

export const suspendPanelZoom = (): void => {
  if (!activeSession) return;
  if (suspendDepth === 0) {
    activeSession.suspend();
  }
  suspendDepth += 1;
};

export const resumePanelZoom = (): void => {
  if (!activeSession || suspendDepth === 0) return;
  suspendDepth -= 1;
  if (suspendDepth === 0) {
    activeSession.resume();
  }
};

/**
 * 列表弹窗暂时关闭、详情弹窗接力时，先垫一层 suspend，避免深度归零导致放大层闪回。
 * 关闭详情并恢复列表弹窗后调用 end，在 nextTick 释放垫层。
 */
export const beginPanelZoomNestedHandoff = (): void => {
  suspendPanelZoom();
};

export const endPanelZoomNestedHandoff = (): void => {
  void nextTick(() => {
    resumePanelZoom();
  });
};

/** 可见时挂起放大弹窗；隐藏或卸载时恢复。 */
export const usePanelZoomSuspendWhile = (source: WatchSource<boolean>): void => {
  let holding = false;

  const sync = (visible: boolean): void => {
    if (visible && !holding) {
      suspendPanelZoom();
      holding = true;
      return;
    }
    if (!visible && holding) {
      resumePanelZoom();
      holding = false;
    }
  };

  watch(source, sync, { immediate: true });

  onBeforeUnmount(() => {
    if (!holding) return;
    resumePanelZoom();
    holding = false;
  });
};
