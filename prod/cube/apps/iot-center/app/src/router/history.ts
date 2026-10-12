import { logger } from "@ghcloud/cube-iot-center-app/log";

export interface ChangeHistoryEventData {
  current: URL;
  target: URL;
}

export type ChangeHistoryEvent = (changed: ChangeHistoryEventData) => void;

const changeHistoryHandlers = new Set<ChangeHistoryEvent>();

export const historyEventManager = {
  /**
   * 添加监听
   * @param event 目前只有 changeState
   * @param handler 事件处理器
   */
  addEventListener(_event: "changeState", handler: ChangeHistoryEvent): void {
    changeHistoryHandlers.add(handler);
    logger.debug("qe");
  },
  /**
   * 删除监听
   * @param event 目前只有 changeState
   * @param handler 事件处理器
   */
  removeEventListener(_event: "changeState", handler: ChangeHistoryEvent): void {
    changeHistoryHandlers.delete(handler);
  },
};

// 重写 history pushState replaceState，以获取路由监听能力

const oldPushState = history.pushState;

const oldReplaceState = history.replaceState;

/**
 * 将原生的 change 相关参数转换为自定义事件参数（注：原生方法中第二个参数 `unused` 几乎无浏览器实现，不处理该参数）
 * [参考](https://developer.mozilla.org/zh-CN/docs/Web/API/History/pushState)
 *
 * @param url pushState/replaceState `url` param
 */
function makeHistoryChangeEventData(url?: string | URL | null): ChangeHistoryEventData {
  let target = new URL(location.href);
  if (url instanceof URL) {
    target = new URL(url);
  } else if (url) {
    target = new URL(url, location.origin);
  }
  return {
    target,
    current: new URL(location.href),
  };
}

function emitHistoryChange(changed: ChangeHistoryEventData): void {
  changeHistoryHandlers.forEach((handler) => {
    handler(changed);
  });
}

history.pushState = (_state, _unused, url): void => {
  oldPushState.call(history, _state, _unused, url);
  emitHistoryChange(makeHistoryChangeEventData(url));
};

history.replaceState = (_state, _unused, url): void => {
  oldReplaceState.call(history, _state, _unused, url);
  emitHistoryChange(makeHistoryChangeEventData(url));
};

window.addEventListener("popstate", () => {
  emitHistoryChange(makeHistoryChangeEventData(location.href));
});
