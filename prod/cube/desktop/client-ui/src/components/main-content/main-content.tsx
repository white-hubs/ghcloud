import { type Component, defineAsyncComponent, defineComponent, h, KeepAlive, Suspense } from 'vue'
import styles from './main-content.module.less'
import { SliderKey, useClientUIState } from '../../hook/use-client'
import { ComponentLoading } from './components/component-loading/component-loading'

const EmptyComponent = defineComponent({
  setup () {
    return (): JSX.Element => (
      <span></span>
    )
  },
})

export const MainContent = defineComponent({
  setup () {
    const clientUIState = useClientUIState()


    const components: Record<SliderKey, Component> = {
      'ai': defineAsyncComponent(async () => (await import('./components/ai-assistant/ai-assistant')).AIAssistant),
      'todo': defineAsyncComponent(async () => (await import('./components/todo-list/todo-list')).ToDoList),
      'message': defineAsyncComponent(async () => (await import('@ghcloud/cube-message-center-app/src/components/message-for-client/message-for-client')).MessageForClient),
      'addressBook': defineAsyncComponent(async () => (await import('./components/address-book/address-book')).AddressBook),
      'workbench': defineAsyncComponent(async () => (await import('./components/workbench/workbench')).Workbench)
    }


    return (): JSX.Element => (
      <div class={`${styles['main-content']} ${clientUIState.activeSliderKey === "workbench" ? styles['bg-transparent'] : ''}`}>
        { h(components[SliderKey.AI], { style: { display: clientUIState.activeSliderKey === SliderKey.AI ? 'block' : 'none' } })}
        { h(components[SliderKey.TODO], { style: { display: clientUIState.activeSliderKey === SliderKey.TODO ? 'block' : 'none' } })}
        <KeepAlive>
          <Suspense>
            {{
              default: () => {
                if ([SliderKey.AI, SliderKey.TODO].includes(clientUIState.activeSliderKey)){
                  return h(EmptyComponent);
                }
                return h(components[clientUIState.activeSliderKey]);
              },
              fallback: () =><ComponentLoading />
            }}
          </Suspense>
        </KeepAlive>
      </div>
    )
  },
})