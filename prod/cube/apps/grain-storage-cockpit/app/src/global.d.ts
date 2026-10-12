import type { VNode as VueVNode } from "vue";

declare global {
  namespace JSX {
    interface Element extends VueVNode {}
  }
}

export type { VNode } from "vue";
