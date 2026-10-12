declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, unknown>
  export default component
}

declare module 'lodash/*';
declare module 'dom-helpers';
declare module '@iconify/vue';
