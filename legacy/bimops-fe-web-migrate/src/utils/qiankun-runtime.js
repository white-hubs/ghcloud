import { start } from "qiankun";

/**
 * 统一且幂等地启动 qiankun。
 * 工作台或普通应用宿主在容器挂载后调用；已启动时直接返回，
 * 避免重复 start 以及跨组件事件造成的时序问题。
 */
export function ensureQiankunStarted() {
  if (window.qiankunStarted) {
    return;
  }

  start({
    prefetch: false,
  });
  window.qiankunStarted = true;
}
