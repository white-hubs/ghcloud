import { defineComponent, nextTick, onMounted, onUnmounted, ref, onBeforeMount } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Button, TabPane, Tabs } from '@ghcloud/cube-ui'
import { useRoute, useRouter } from 'vue-router'
import './index.less'
import { getSubMarketInfo } from '@/api/alarm'
import { AlarmInfo } from './tab-item/alarm-info'
import axios from 'axios'
import { HandleLog } from './tab-item/handle-log'
import { LinkageAction } from './tab-item/linkage-action'
let parentPath = ''

export const AlarmDetail = defineComponent({
  beforeRouteEnter (to: any, form: { path: string; }) {
    parentPath = form.path
  },
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const tabItemHeight = ref()
    const activeTab = ref(0)
    const handleTabItemHeight = (): void => {
      const layoutContentHeight = document.getElementsByClassName('layout-table')[0].clientHeight
      const tabNavHeight = document.getElementsByClassName('safety-manage-head-tabs-nav')[0].clientHeight
      tabItemHeight.value = layoutContentHeight - tabNavHeight - 40
    }
    const marketInfo = ref()
    onBeforeMount(() => {
      getSubMarketDetail(route.query.marketTenant as string).then(data => {
        marketInfo.value = data
      })
    })
    onMounted(() => {
      window.addEventListener('resize', handleTabItemHeight)
      nextTick(() => {
        handleTabItemHeight()
      })
    })
    onUnmounted(() => {
      window.removeEventListener('resize', handleTabItemHeight)
    })
    const getSubMarketDetail = async (id: string): Promise<{ url: string; tenant: string; token: string; }> => {

      return new Promise(async (resolve) => {
        try {
          const info = await getSubMarketInfo({ id })
          const { url, account, password, marketTenant } = info.data
          const { data } = await axios.post(`${url}/api/ouaa/oauth2/token`, {
            grant_type: 'client_credentials',
            client_id: account,
            client_secret: password
          }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          })
          resolve({
            url: url as string,
            tenant: marketTenant,
            token: data.access_token
          })
        } catch {
          // resolve({
          //   url: '',
          //   tenant: '',
          //   token: ''
          // })
        } finally {
          // resolve({
          //   url: '',
          //   tenant: '',
          //   token: ''
          // })
        }
      })
    }

    const handleBack = (): void => {
      const urlSearchParams = new URLSearchParams(window.location.search)
      const params = Object.fromEntries(urlSearchParams.entries())
      const target = params.searchValue ? `${router.options.history.base}${parentPath || '/alarm-record'}?searchValue=${params.searchValue}` : `${router.options.history.base}${parentPath || '/alarm-record'}`

      if (params.isFromReport === 'true') {
        history.pushState(history.state, '', target)
      } else {
        history.pushState({}, '', '/portal/safety-manage-head/alarm-record')
      }

      // if (params.searchValue) {
      //
      // } else {
      //   router.back()
      // }
    }
    const layoutSlots = {
      'content-table': (): JSX.Element=> {
        return (
          <>
            <div>
              <Tabs v-model:activeKey={activeTab.value}>
                <TabPane key={0} tab='报警详情'>
                  <div style={{ height: `${tabItemHeight.value}px`, overflowY: 'auto', overflowX: 'hidden' }}>
                    <AlarmInfo marketInfo={marketInfo.value} />
                  </div>
                </TabPane>
                <TabPane key={1} tab='联动动作'>
                  <div style={{ height: `${tabItemHeight.value}px`, overflowY: 'auto' }}>
                    <LinkageAction marketInfo={marketInfo.value} />
                  </div>
                </TabPane>
                <TabPane key={2} tab='处理记录'>
                  <div style={{ height: `${tabItemHeight.value}px`, overflowY: 'auto' }}>
                    <HandleLog marketInfo={marketInfo.value} />
                  </div>
                </TabPane>
              </Tabs>
            </div>

          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (<Button type='primary' onClick={handleBack}>返回</Button>)
      }
    }
    return (): JSX.Element=> (
      <>
        <div class='device-info'>
          <GLayout title='报警详情' v-slots={layoutSlots} showSearch={false} />
        </div>
      </>
    )
  }
})
