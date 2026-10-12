import { type Component, defineAsyncComponent } from 'vue'

export const formItems: Record<string, Component> = {
  TextInput: defineAsyncComponent(async () => import('./text-input')),
}