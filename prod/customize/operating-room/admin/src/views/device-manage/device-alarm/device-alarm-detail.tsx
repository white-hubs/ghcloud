import { defineComponent, onMounted, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, TabPane, Tabs } from '@ghcloud/cube-ui'
import { TabPaneAlarmDetail } from './components/tab-pane-alarm-detail'
import { TabPaneAlarmNotice } from './components/tab-pane-alarm-notice'
import { TabPaneLinkAction } from './components/tab-pane-link-action'
import { useRoute } from 'vue-router'

/** 设备报警 - 详情 */
export const DeviceAlarmDetail = defineComponent({
  setup: () => {
    const { id, businessKey, alarmStatus } = useRoute().query as { id: string; businessKey: string; alarmStatus: string; }
    const activeKey = ref('报警详情')
    const loading = ref(false)

    onMounted(() => {
      loading.value = true
    })

    const layoutSlots = {
      'layout-header': (): void => {

      },
      'layout-content': (): JSX.Element=> {
        return (
          <>
            <Tabs v-model:activeKey={activeKey.value} destroyInactiveTabPane>
              <TabPane key='报警详情' tab='报警详情'>
                <TabPaneAlarmDetail id={id} businessKey={businessKey} alarmStatus={alarmStatus} />
              </TabPane>
              <TabPane key='联动动作' tab='联动动作'>
                <TabPaneLinkAction id={id} businessKey={businessKey} />
              </TabPane>
              <TabPane key='处理记录' tab='处理记录'>
                <TabPaneAlarmNotice id={id} businessKey={businessKey} />
              </TabPane>
            </Tabs>
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button style={{ marginLeft: '10px' }} onClick={() => {
              history.back()
            }}>返回</Button>
          </>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <Layout title='报警详情' v-slots={layoutSlots} />
      </>
  }
})
