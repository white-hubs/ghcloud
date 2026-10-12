import { defineComponent, onMounted, ref } from 'vue'
import styles from './message-list.module.less'
import { PullRefresh, showNotify, Tag } from 'vant'
import { cubeMessageCenterService, cubeOuaaService } from '@/api/server'
import type { MsgRecordCustomGroupStatistics } from '@ghcloud/cube-message-center-service/src/types'
const MESSAGE_CENTER_IMG = '/resource/v1/message-center/h5/images'
const alarmNoticeIcon = `${MESSAGE_CENTER_IMG}/alarm-notice.png`
const approvalMessageIcon = `${MESSAGE_CENTER_IMG}/approval-message.png`
const systemMessageIcon = `${MESSAGE_CENTER_IMG}/system-message.png`
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

export const MessageList = defineComponent({
  setup: () => {
    const router = useRouter()
    const loading = ref(false)
    const messageList = ref<(MsgRecordCustomGroupStatistics & { icon: string; })[]>([])
    const defaultIcon = 'data:image/png;base64,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'
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeMessageCenterService.geMsgRecordCustomGroupStatistics('CHANNEL_SITE')
        for await (const msgItem of res) {
          let icon = ''
          if (msgItem.type === 'ALARM_NOTICE') {
            icon = alarmNoticeIcon
          } else if (msgItem.type === 'APPROVAL_MESSAGE') {
            icon = approvalMessageIcon
          } else if (msgItem.type === 'SYSTEM_MESSAGE') {
            icon = systemMessageIcon
          } else {
            try {
              const application = await cubeOuaaService.getApplicationInfo(msgItem.type)
              icon = application.icon as string || ''
            } catch {

            }
          }
          messageList.value.push({ ...msgItem, icon })
        }
      } catch {
        showNotify({ type: 'danger', message: '获取消息列表失败' })
      } finally {
        loading.value = false
      }
    }
    const toItemPage = (item: MsgRecordCustomGroupStatistics): void => {
      router.push({
        path: '/message-item-list',
        query: {
          type: item.type,
          typeName: item.typeName,
          category: item.category
        }
      })
    }

    document.title = '消息中心'
    onMounted(() => {
      getData()
    })
    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title='消息中心' />
        <PullRefresh v-model={loading.value} onRefresh={getData}>
          <div class={styles['message-list']}>
            {
              messageList.value.map(item => {
                return (
                  <div class={styles['message-list-item']} key={item.type} onClick={() => {
                    toItemPage(item)
                  }}>
                    <img src={item.icon} onError={() => {
                      item.icon = defaultIcon
                    }} />
                    <div class={styles['message-list-item-right']}>
                      <div class={styles.top}>
                        <div class={styles.title}>{item.typeName}</div>
                        {item.lastMsgRecord && <div class={styles.time}>{dayjs(item.lastMsgRecord.sendTime).format('YYYY-MM-DD HH:mm')}</div>}
                      </div>

                      <div class={styles.content}>
                        {item.lastMsgRecord && <div class={styles['msg-content']}>{item.lastMsgRecord.msgContent}</div>}
                        {item.unReadMsgCount > 0 && <Tag type='danger' class={styles['un-read-msg-count']}>{item.unReadMsgCount <= 99 ? item.unReadMsgCount : '99+'}</Tag>}
                      </div>
                    </div>
                  </div>
                )
              })
            }
            {
              (messageList.value.length === 0 && !loading.value) &&
              <div style='text-align:center'>暂无消息</div>
            }
          </div>
        </PullRefresh>
      </>
  }
})
