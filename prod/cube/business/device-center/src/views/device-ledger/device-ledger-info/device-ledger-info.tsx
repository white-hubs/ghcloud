import { defineComponent, onMounted, reactive } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Spin, TabPane, Tabs, Tag } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import '@/styles/common.less'
import { logger } from '@/logger'
import { TabBaseInfo } from './components/tab-base-info'
import { TabLifeEvent } from './components/tab-life-event'
import { TabKnowledgeDocuments } from './components/tab-knowledge-documents'
import { DeviceStatusOptions, type LedgerInfo } from '@/types/device-type'
import { cubeDeviceCenterService } from '@/api/service'
import dayjs from 'dayjs'

export const DeviceLedgerInfo = defineComponent({
  setup: () => {
    const { id, prodId } = useRoute().query as { id: string; prodId: string; }

    const state = reactive<{
      baseInfo: LedgerInfo;
      loading: boolean;
    }>({
      baseInfo: {},
      loading: true,
    })

    const getDeviceInfo = async (): Promise<void> => {
      const res = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: id })
      state.baseInfo = res as unknown as LedgerInfo
    }

    onMounted(async () => {
      try {
        state.loading = true
        await getDeviceInfo()
      } catch (error) {
        logger.error(error)
      } finally {
        state.loading = false
      }
    })
    const goBack = (): void => {
      history.back()
    }
    const goDetail = (): void => {
      history.pushState({ current: location.pathname + location.search }, '', `/portal/device-center/device-list-info?id=${id}`)
    }
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        const onlineState = state.baseInfo?.baseArchivesInfo?.status?.onlineState ?? 0
        const curState = DeviceStatusOptions.find(e => e.value === Number(onlineState))
        return (
          <>
            <div>
              <Spin spinning={state.loading}>
                <div class='top-info' style={{ alignItems: 'baseline' }}>
                  <div class='top-info-item'>设备编号：{state.baseInfo.baseArchivesInfo?.code || '--'}</div>
                  <div class='top-info-item'>设备名称：
                    { state.baseInfo.baseArchivesInfo?.name ? <Button type='link' onClick={goDetail} style={{ padding: '0' }}>{state.baseInfo.baseArchivesInfo?.name}</Button> : '--'}
                  </div>
                  <div class='top-info-item'>设备状态：
                    {curState?.label ? <Tag color={curState?.color}>{curState?.label}</Tag> : '--'}
                  </div>
                  <div class='top-info-item'>最后连接时间：{
                    state.baseInfo.baseArchivesInfo?.status?.communicationTime
                      ? dayjs(state.baseInfo.baseArchivesInfo?.status.communicationTime).format('YYYY-MM-DD HH:mm:ss')
                      : '--'
                  }
                  </div>
                </div>
              </Spin>
              <Tabs destroyInactiveTabPane>
                <TabPane key={0} tab='台账信息'>
                  <TabBaseInfo id={id} />
                </TabPane>
                <TabPane key={1} tab='生命事件'>
                  <TabLifeEvent id={id} />
                </TabPane>
                <TabPane key={2} tab='知识文档'>
                  <TabKnowledgeDocuments id={id} prodId={prodId} />
                </TabPane>
              </Tabs>
            </div>
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button onClick={goBack}>返回</Button>
          </>
        )
      }
    }
    return (): JSX.Element=> <Layout title='台账详情' v-slots={layoutSlots} />
  }
})
