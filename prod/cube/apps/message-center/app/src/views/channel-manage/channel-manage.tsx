import { defineComponent, onMounted, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { usePageName } from '@ghcloud/cube-utils'
import type { SatMsgChannels } from '@ghcloud/cube-message-center-service'
import { cubeMessageCenterService } from '@/api/service'
import styles from './channel-manage.module.less';
import { ChannelConfigModal } from './components/channel-config-modal'
import { ChannelCodesType } from '@ghcloud/cube-message-center-service/src/types'

/** 渠道管理 */
export const ChannelManage = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const msgChannelsList = ref<SatMsgChannels[]>([])
    const receiveModalRef = ref<{ openModal: (record: SatMsgChannels) => void; }>()
    const handleChannelClick = async (data: SatMsgChannels): Promise<void> => {
      if (data.channelCode === ChannelCodesType.CHANNEL_SITE) {
        return
      }
      receiveModalRef.value?.openModal(data)
    }
    const getChannelManage = async (): Promise<void>=> {
      const res = await cubeMessageCenterService.satMsgChannels()
      msgChannelsList.value = res
    }
    onMounted(() => {
      getChannelManage()
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <div class={styles.channelBox}>
              {msgChannelsList.value.map((item) => (
                <div
                  style={{ cursor: item.channelCode === ChannelCodesType.CHANNEL_SITE ? 'not-allowed' : 'pointer' }}
                  onClick={ async () => handleChannelClick(item)}
                  class={styles.channelCard}
                  key={item.channelCode}
                >
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.channelName}</div>
                  <div style={{ fontSize: '12px' }}>{item.manufacturerName}</div>
                </div>
              ))}
            </div>
          </>
        )
      },
    }
    return (): JSX.Element=>
      <>
        <Layout title={pageTitle ?? '渠道管理'} v-slots={layoutSlots} />
        <ChannelConfigModal ref={receiveModalRef} onEnter={getChannelManage} />
      </>
  }
})
