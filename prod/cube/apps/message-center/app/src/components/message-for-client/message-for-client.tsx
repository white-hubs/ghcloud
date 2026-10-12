import { defineComponent, h, inject, onActivated, ref, type Component } from 'vue'
import styles from './message-for-client.module.less'
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { CubeOuaaService, type CubeAuth } from '@ghcloud/cube-ouaa-service'
const MESSAGE_CENTER_APP_IMG = '/resource/v1/message-center/app/images'
const IconAlarmNotice = `${MESSAGE_CENTER_APP_IMG}/alarm-notice.webp`
const IconApprovalMessage = `${MESSAGE_CENTER_APP_IMG}/approval-message.webp`
const IconSystemMessage = `${MESSAGE_CENTER_APP_IMG}/system-message.webp`
import type { MsgRecordCustomGroupStatistics } from '@ghcloud/cube-message-center-service/src/types'
import { Badge, Skeleton } from '@ghcloud/cube-ui'
import { MessageList } from './compoenents/message-list/message-list'
import { Setting } from './compoenents/setting/setting'
import { publisher, MFRootEventNameEnum } from '@ghcloud/cube-mf-root'

export const MessageForClient = defineComponent({
  setup () {
    const authInfo = inject('CUBE_AUTH_INFO') as CubeAuth
    const baseUrl = inject('CLIENT_BASE_URL') as string
    const firstLoad = ref(true)
    const messageGroupList = ref<(MsgRecordCustomGroupStatistics & { icon: string; isPinned?: boolean;originalIndex?: number; })[]>([])
    const defaultIcon = 'data:image/png;base64,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'
    const groupItemSelected = ref<MsgRecordCustomGroupStatistics & { icon: string; isPinned?: boolean; }>()
    const components = ref<Record<string, Component>>({})
    const settingVisible = ref(false) // 配置面板是否显示

    //    nStorage中获取置顶状态
    const getPinnedStates = (): Record<string, boolean> => {
      try {
        const pinnedStates = sessionStorage.getItem('messageGroupPinnedStates')
        return pinnedStates ? JSON.parse(pinnedStates) : {}
      } catch (error) {
        return {}
      }
    }

    // 保存置顶状态到SessionStorage
    const savePinnedStates = (): void => {
      try {
        const pinnedStates = messageGroupList.value.reduce((acc, item) => {
          if (item.isPinned) {
            acc[item.type] = true
          }
          return acc
        }, {} as Record<string, boolean>)
        sessionStorage.setItem('messageGroupPinnedStates', JSON.stringify(pinnedStates))
      } catch (error) {
      }
    }

    onActivated(() => {
      getGroupData()
    })


    // 在return语句之前添加togglePinned函数
    const togglePinned = (isPinned: boolean): void => {
      if (groupItemSelected.value) {
        // 更新当前选中消息组的置顶状态
        groupItemSelected.value.isPinned = isPinned;

        // 更新消息列表中对应消息组的置顶状态
        const index = messageGroupList.value.findIndex(item => item.type === groupItemSelected.value?.type);
        if (index !== -1) {
          messageGroupList.value[index].isPinned = isPinned;

          // 重新排序消息列表，置顶的消息在前面，非置顶的消息按原始顺序排列
          messageGroupList.value = [...messageGroupList.value].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            // 如果两者置顶状态相同，则按原始顺序排列
            return (a.originalIndex || 0) - (b.originalIndex || 0);
          });

          // 保存置顶状态到SessionStorage
          savePinnedStates();
        }
      }
    };

    return (): JSX.Element => (
      <>
        <div class={styles['left']}>
          <Skeleton active loading={firstLoad.value}>
            {
              messageGroupList.value.map(item => {
                return (
                  <div class={`${styles['message-item']} ${groupItemSelected.value?.type === item.type ? styles['active'] : ''} ${ item.isPinned ? styles['pinned'] : ''}`} key={item.typeName} onClick={()=>{
                    groupItemSelected.value = item
                    settingVisible.value = false
                  }}>
                    <img class={styles['icon']} src={item.icon || defaultIcon} />
                    <div class={styles['content']}>
                      <div class={styles['title']}>{item.typeName}</div>
                      <div class={styles['last-record']}>{item.lastMsgRecord?.msgContent ?? ''}</div>
                    </div>
                    {

                      <Badge class={styles['badge']} style={{ visible: item.unReadMsgCount ? 'visible' : 'hidden' }} count={item.unReadMsgCount >= 99 ? '99' : item.unReadMsgCount}></Badge>

                    }
                  </div>
                )
              })
            }
          </Skeleton>
        </div>
        <div class={styles['right']}>
          {
            groupItemSelected.value && (
              // <KeepAlive>
              //   {
              h(components.value[groupItemSelected.value?.type ?? ''], {
                onOpenMessageSetting: ()=>{
                  settingVisible.value = true
                },
                onUpdateMessage: (value: string) =>{
                  getGroupMessageNum(value)
                }
              })
            // }
              // </KeepAlive>
            )
          }
          {groupItemSelected.value && (
            <Setting
              v-model:visible={settingVisible.value}
              selectedGroup={groupItemSelected.value}
              onTogglePinned={togglePinned}
            />
          )}
        </div>
      </>
    )

    // 查看消息后刷新未读消息
    async function getGroupMessageNum (type: string): Promise<void> {
      try {
        const cubeMessageCenterService = new CubeMessageCenterService(authInfo)
        const res = await cubeMessageCenterService.geMsgRecordCustomGroupStatistics('CHANNEL_SITE')
        const list = [...messageGroupList.value]
        list.map((item)=>{
          res.map((resItem)=>{
            if (item.type === type && item.type === resItem.type){
              item.unReadMsgCount = resItem.unReadMsgCount
            }
          })

        })
        messageGroupList.value = list
        publisher.publish(MFRootEventNameEnum.MF_ROOT_MESSAGE_COUNT, { code: 'message' })
      } catch {

      }
    }

    async function getGroupData (): Promise<void> {
      try {
        const cubeMessageCenterService = new CubeMessageCenterService(authInfo)
        const res = await cubeMessageCenterService.geMsgRecordCustomGroupStatistics('CHANNEL_SITE')
        const list: typeof messageGroupList.value = [];
        const pinnedStates = getPinnedStates()
        const promiseTask = res.map(async (msgItem, index) => {
          let icon = ''
          if (msgItem.type === 'ALARM_NOTICE') {
            icon = IconAlarmNotice
          } else if (msgItem.type === 'APPROVAL_MESSAGE') {
            icon = IconApprovalMessage
          } else if (msgItem.type === 'SYSTEM_MESSAGE') {
            icon = IconSystemMessage
          } else {
            try {
              const cubeOuaaService = new CubeOuaaService(authInfo)
              let type = msgItem.type
              type === 'PROPERTY' && (type = 'PROPERTY_MANAGEMENT')
              type === 'MAINTAIN_TASK_MSG' && (type = 'MAINTENACE')
              type === 'DEVICE' && (type = 'DEVICECENTER')
              const application = await cubeOuaaService.getApplicationInfo(type)
              icon = baseUrl + application.icon
            } catch {

            }
          }
          // 添加置顶状态和原始索引
          list.push({ ...msgItem, icon, isPinned: !!pinnedStates[msgItem.type], originalIndex: index })
        })
        await Promise.all(promiseTask)

        // 根据置顶状态排序，置顶的消息在前面，非置顶的消息按原始顺序排列
        messageGroupList.value = list.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1
          if (!a.isPinned && b.isPinned) return 1
          // 如果两者置顶状态相同，则按原始顺序排列
          return (a.originalIndex || 0) - (b.originalIndex || 0)
        })

        messageGroupList.value.forEach(e=>{
          if (!components.value[e.type]){
            components.value[e.type] = defineComponent({
              name: e.type,
              setup () {
                return (): JSX.Element=> h(MessageList, {
                  groupItem: e
                })
              }
            })
          }
        })
        !groupItemSelected.value && (groupItemSelected.value = messageGroupList.value[0])
      } catch {

      } finally {
        firstLoad.value = false
      }
    }
  },
})