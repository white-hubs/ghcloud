import { type Component, createApp, type DefineComponent, h, nextTick, ref } from 'vue'
import Antd from 'ant-design-vue';
import { generateUUID } from './base-modal'
interface CreateModalApp {
  createModal: () => void;
  modalId: string;
}

/** 首字母大写 */
function capitalize (str: string): string {
  if (!str) return str // 处理空字符串
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const createModalApp = <T>(options: {
  modelContent: Component;
  modalOptions: T;
  modalId?: string; // 添加可选的modalId参数
}): CreateModalApp => {
  const modalId = options.modalId || generateUUID() // 使用传入的ID或生成新ID

  const createModal = (): void => {
    const root = document.createElement('div')
    root.style.display = 'none'
    document.body.append(root)

    let appInstance = createApp({
      setup () {
        const visible = ref<boolean>(false)
        const setVisible = (value: boolean): void => {
          visible.value = value
          if (!value) {
            setTimeout(() => {
              appInstance?.unmount()
              appInstance = null
              root.remove()
            }, 300)
          }
        }
        nextTick(() => {
          setVisible(true)
        })

        // 事件处理
        const eventNames = ((options.modelContent as DefineComponent).emits ?? []) as string[]
        const events = {}
        eventNames.forEach((eventName) => {
          const name = 'on' + capitalize(eventName)
          events[name] = (...args: unknown[]): void => {
            if (name === 'onClose') {
              setVisible(false)
            }
            if (name === 'onVisibleChange') {
              visible.value = args[0] as boolean
            }
            options.modalOptions[name]?.(...args)
          }
        })

        // 属性处理
        const propsName = ((options.modelContent as DefineComponent).props ?? []) as string[]
        const props = {}
        propsName.forEach((propName) => {
          props[propName] = options.modalOptions[propName]
        })

        return (): JSX.Element => h(options.modelContent, {
          ...events,
          ...props,
          visible: visible.value,
          modalId
        })
      },
    })
    appInstance.use(Antd)
    appInstance.mount(root) // 在函数内部挂载应用
  }

  return {
    createModal,
    modalId
  }
}
