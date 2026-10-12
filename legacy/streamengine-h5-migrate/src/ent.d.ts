declare module '*.vue' {
  import type { ComponentOptions, DefineComponent } from 'vue'
  const component: ComponentOptions | ComponentOptions['setup']
  export default component
}
declare module 'lodash';