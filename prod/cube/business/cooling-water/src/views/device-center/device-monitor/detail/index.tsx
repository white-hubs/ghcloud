import { defineComponent, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Tabs, TabPane, Button } from '@ghcloud/cube-ui'
import { DeviceInfoTab } from './tab-item/device-info-tab'
import { AlarmDataTab } from './tab-item/alarm-data-tab'
import { useRouter } from 'vue-router'
import { GatherRecordTab } from './tab-item/gather-record-tab'
import { OpearteLogTab } from './tab-item/operate-log-tab'
import './index.less'
export const DeviceDetail = defineComponent({

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
      router.back()
    }
    const layoutSlots = {
      'content-table': (): JSX.Element => {
        return (
          <>
            <div>
              <Tabs v-model:activeKey={activeTab.value}>
                <TabPane key={0} tab='设备信息'>
                  <div style={{ height: `${tabItemHeight.value}px`, overflowY: 'auto' }}>
                    <DeviceInfoTab />
                  </div>
                </TabPane>
                <TabPane key={1} tab='报警数据'>
                  <div style={{ height: `${tabItemHeight.value}px`, overflowY: 'auto' }}>
                    <AlarmDataTab />
                  </div>
                </TabPane>
                <TabPane key={2} tab='采集明细'>
                  <div style={{ height: `${tabItemHeight.value}px`, overflowY: 'auto' }}>
                    <GatherRecordTab />
                  </div>
                </TabPane>
                <TabPane key={3} tab='操作记录'>
                  <div style={{ height: `${tabItemHeight.value}px`, overflowY: 'auto' }}>
                    <OpearteLogTab />
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
