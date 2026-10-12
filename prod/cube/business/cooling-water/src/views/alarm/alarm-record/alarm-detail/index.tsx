import { defineComponent, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Tabs, TabPane, Button } from '@ghcloud/cube-ui'
import { useRouter } from 'vue-router'
import { AlarmInfo } from './tab-item/alarm-info'
import { LinkageAction } from './tab-item/linkage-action'
import { HandleLog } from './tab-item/handle-log'
import './index.less'
let parentPath = ''
export const AlarmDetail = defineComponent({
  beforeRouteEnter (to, form) {
    parentPath = form.path
  },
  setup: () => {
    const router = useRouter()
    const tabItemHeight = ref()
    const activeTab = ref(0)
    const handleTabItemHeight = (): void => {
      const layoutContentHeight = document.getElementsByClassName('layout-table')[0].clientHeight
      const tabNavHeight = document.getElementsByClassName('cooling-water-tabs-nav')[0].clientHeight
      tabItemHeight.value = layoutContentHeight - tabNavHeight
    }
    onMounted(() => {
      window.addEventListener('resize', handleTabItemHeight)
      nextTick(() => {
        handleTabItemHeight()
      })
    })
    onUnmounted(() => {
      window.removeEventListener('resize', handleTabItemHeight)
    })
    const handleBack = (): void => {
      const urlSearchParams = new URLSearchParams(window.location.search)
      const params = Object.fromEntries(urlSearchParams.entries())
      const target = params.searchValue ? `${router.options.history.base}${parentPath || '/alarm-record'}?searchValue=${params.searchValue}` : `${router.options.history.base}${parentPath || '/alarm-record'}`
      if (params.searchValue) {
        history.pushState(history.state, '', target)
      } else {
        router.back()
      }
    }
    const layoutSlots = {
      'content-table': (): JSX.Element => {
        return (
          <>
            <div>
              <Tabs v-model:activeKey={activeTab.value}>
                <TabPane key={0} tab='报警详情'>
                  <div style={{ height: `${tabItemHeight.value - 10}px`, overflowY: 'auto' }}>
                    <AlarmInfo />
                  </div>
                </TabPane>
                <TabPane key={1} tab='联动动作'>
                  <div style={{ height: `${tabItemHeight.value - 10}px`, overflowY: 'auto' }}>
                    <LinkageAction />
                  </div>
                </TabPane>
                <TabPane key={2} tab='处理记录'>
                  <div style={{ height: `${tabItemHeight.value - 10}px`, overflowY: 'auto' }}>
                    <HandleLog />
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
    return (): JSX.Element => (
      <>
        <div class='device-info'>
          <GLayout title='设备详情' v-slots={layoutSlots} showSearch={false} />
        </div>
      </>
    )
  }
})
