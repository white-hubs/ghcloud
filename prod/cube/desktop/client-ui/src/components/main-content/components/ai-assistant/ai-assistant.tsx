import { defineComponent, inject } from 'vue'

/** AI助手入口 */
export const AIAssistant = defineComponent({

  setup () {
    const clientBaseUrl = inject('CLIENT_BASE_URL') as string
    const iframeUrl = clientBaseUrl + '/apps/@ghcloud/cube-ai-assistant-chat?mode=CHAT'
    return (): JSX.Element => (
      <iframe src={iframeUrl.toString()}></iframe>
    )
  },
})