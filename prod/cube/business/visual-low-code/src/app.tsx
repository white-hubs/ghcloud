import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import { DialogProvider, MessageProvider, ConfigProvider, LoadingProvider } from '@ghcloud/visual-view-ui'
import { getUrlParams } from '@/utils/index'
import { setSessionStorage, StorageEmun } from './utils/storage'
interface UrlParamsState {
  access_token: string;
  nowEnterprise: string;
  projectId?: string;
  instanceId?: string;
}
export const App = defineComponent({
  setup: () => {
    const urlParams = getUrlParams() as unknown as UrlParamsState
    const env = (import.meta as unknown as { env: { VITE_ENTERPISE: string; VITE_PROJECTID: string;VITE_TOKEN: string; }; }).env
    if (Object.keys(urlParams).length) {
      setSessionStorage(StorageEmun.GH_TOKEN, urlParams.access_token ?? JSON.parse(env.VITE_TOKEN).access_token)
      setSessionStorage(StorageEmun.GH_NOWENTERPRISE, urlParams.nowEnterprise ?? JSON.parse(JSON.stringify(env.VITE_ENTERPISE)))
      setSessionStorage(StorageEmun.PROJECTID, urlParams.projectId ?? '')
      setSessionStorage(StorageEmun.INSTANCEID, urlParams.instanceId ?? '')
    } else {
      // todo: 为尽快调试所做的处理 后期需优化处理
      setSessionStorage(StorageEmun.GH_TOKEN, JSON.parse(env.VITE_TOKEN).access_token ?? '')
      setSessionStorage(StorageEmun.GH_NOWENTERPRISE, JSON.parse(JSON.stringify(env.VITE_ENTERPISE)) ?? '')
      setSessionStorage(StorageEmun.PROJECTID, env.VITE_PROJECTID ?? '')
    }

    return () => (
      <LoadingProvider>
        <ConfigProvider>
          <MessageProvider>
            <DialogProvider>
              <RouterView />
            </DialogProvider>
          </MessageProvider>
        </ConfigProvider>
      </LoadingProvider>
    )
  }
})
