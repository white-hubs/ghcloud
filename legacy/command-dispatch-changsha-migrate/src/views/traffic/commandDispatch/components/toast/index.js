import { createApp } from "vue";

import Toast from "./index.vue";
let toastCount = 0;
let toastMargin = 82;
export const showToast = (msg = "报警长时间无人接收", options = { duration: 0 }, handler = () => {}) => {
  ++toastCount;
  const { duration } = options;
  let timer = null;
  clearTimeout(timer);
  if (timer) return;
  const div = document.createElement("div");
  const componentInstance = createApp(Toast, {
    msg,
    onLocate: handler,
    onHide: () => {
      toastCount = 0;
      componentInstance.unmount(div);
      document.body.removeChild(div);
    },
    top: toastCount * toastMargin + 200,
  });

  componentInstance.mount(div);
  document.body.appendChild(div);
  if (!duration) return;
  timer = setTimeout(() => {
    componentInstance.unmount(div);
    document.body.removeChild(div);
    toastCount = 0;
  }, duration);
};
