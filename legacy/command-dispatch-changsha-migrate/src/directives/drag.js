import { DragElement } from "../drag-plugin";
const drag = {
  mounted(el, binding) {
    new DragElement(el);
  },
  unmounted(el, binding, vnode, prevVnode) {},
};
export const dragDirectives = {
  install: (app) => {
    app.directive("drag", drag);
  },
};
