import { defineComponent, inject } from 'vue'

/** 待办入口 */
export const ToDoList = defineComponent({
  setup () {
    const clientBaseUrl = inject('CLIENT_BASE_URL') as string
    const iframeUrl = clientBaseUrl + '/apps/todo-center/app'
    // const iframeUrl = 'http://localhost:8889' + '/apps/todo-center/app'
    return (): JSX.Element => (
      <iframe src={iframeUrl.toString()}></iframe>
    )
  },
})